# PBB Platform — Build Harness

**Purpose of this document.** It is the single brief handed to every engineering agent working on the
Pashtoonkhwa Blood Bank platform. It defines what is being built, the stack, the data model, the API
surface, how work is split so several agents can run in parallel without colliding, and — most
importantly — the loop each agent runs until its slice is genuinely finished rather than merely written.

Read it whole before writing a line. The prototype at `PBB Website.html` is the specification for
behaviour and copy; this document is the specification for the system beneath it.

---

## 1. What this is

Pashtoonkhwa Blood Bank & Welfare Society has kept a paper donor register since 24 March 1999, across
fourteen towns in Balochistan, with six branch offices. This platform replaces the paper Donor Diary
and the telephone-and-notebook process around it.

It is not a website with an admin panel bolted on. It is an operational system — a coordinator uses it
at three in the morning to find someone who can give O− in Quetta — that also publishes a website.

**Who uses it, and what breaks if it fails them:**

| Person | What they do | What failure costs |
|---|---|---|
| Coordinator | Finds a donor for an open request | A patient waits. This is the whole product. |
| Data entry clerk | Types the paper register in, records donations | The register rots and nobody trusts it |
| Branch manager | Runs one town: staff, stock, requests | A branch operates blind |
| Head office | Fourteen towns, accounts, website, reports | No oversight, no accountability |
| Donor | Checks their own record, updates their number, leaves | We keep calling people who asked us to stop |
| Patient's attendant | Requests blood, usually in an emergency | The request never reaches anybody |

**Non-negotiable ethical constraints.** These are not preferences. Encode them as database
constraints and API guards, not as UI conventions:

1. Blood is never sold. No payment path, ever, under any arrangement.
2. Thalassemia children are transfused free and without an exchange donor.
3. A donor's telephone number is visible only to their own branch and the head office.
4. A donor who asks to be removed is removed the same day, without being asked why.
5. A child's photograph is never published without a signed consent form on file.
6. Deleting a record, exporting the donor list, and granting photo consent each require a typed reason
   and are written to an append-only log.

---

## 2. Stack

Chosen for a small team, a modest server, patchy connectivity, and a fifteen-year operating life.

**Backend — NestJS (TypeScript) + PostgreSQL + Prisma**
NestJS because the domain has real modules (donors, requests, inventory, accounts, content) and its
module boundaries stop that becoming one file. Prisma because the migration history is the audit trail
of the schema and this data outlives any of us. PostgreSQL for row-level security, partial indexes and
proper constraints.

**Frontend — Next.js (App Router, TypeScript)**
Server components for the public site — it must be fast on a 3G phone in Zhob and indexable. Client
components for the admin. One repository, two apps.

**Supporting**
- Auth: NestJS Passport, JWT access + refresh, argon2id hashes, TOTP for two-step
- Cache/queue: Redis + BullMQ (SMS sending, WhatsApp, nightly backups, screening-expiry sweeps)
- SMS: Twilio behind a `NotificationPort` interface — the Pakistani provider will change
- WhatsApp: Cloud API behind the same port, disabled by a flag until the business number is approved
- Storage: S3-compatible (media, consent forms)
- i18n: `next-intl`. English, Urdu, Pashto. Urdu and Pashto are RTL.
- Testing: Vitest (unit), Supertest (API), Playwright (end-to-end)
- Deploy: Docker Compose to a single VPS. Not Kubernetes. The organisation must be able to run this
  without hiring a platform engineer.

```
apps/
  api/            NestJS
  web/            Next.js — public site + admin
packages/
  types/          shared DTOs, generated from Prisma
  ui/             shared components
```

---

## 3. Data model

Derived from the branch Donor Diary and from the prototype. Every field earns its place.

### Core

**Town** — `id, name, servedFromId?, isOffice, createdAt`
One list. The prototype had four and they drifted apart; a donor ended up in a town no search could
reach. Every dropdown, filter and table reads this table.

**Branch** — `id, townId, address, phones[], bankAccount?, hasAmbulance, stockUpdatedAt`

**Donor** — the diary page:
```
id, mrNo (unique per branch), name, bloodGroup, rhFactor,
dateOfBirth,            -- not age; an age written down is wrong a year later
phone, emergencyContact, emergencyRelationship, address,
townId, quantityMl, willingFrequency, modeOfIssue,
lastDonatedAt, timesDonated,
deferredReason?, deferredUntil?,
consentToCall, consentHours, consentSms, consentEvents,
createdById, createdAt, updatedAt, deletedAt
```

**Screening** — separate table, never a column on Donor:
```
id, donorId, testedAt, hcv, hiv, hbsAg, vdrl, mp,
performedBy, labReference
```
Separate so a result can never be changed while somebody edits a phone number, and so history is kept.
`hcv|hiv|hbsAg|vdrl|mp` are enums `NEGATIVE | POSITIVE | PENDING`.

**BloodRequest** — `id, reference, patientName?, hospital, townId, bloodGroup, unitsNeeded, urgency, requesterName, requesterRelationship, requesterPhone, transportAvailable, exchangePossible, reportAvailable, caseNotes, status, source, createdAt, arrangedAt, closedAt`

**Donation** — `id, donorId, requestId?, branchId, donatedAt, quantityMl, componentType, recordedById`

**ThalassemiaPatient** — `id, name, dateOfBirth, bloodGroup, guardianName, guardianPhone, townId, transfusionIntervalDays, nextTransfusionDue, hospital, photoConsent, photoConsentDocumentId?`

**Volunteer, Partner, Announcement, Event, MediaAsset, Page** — as in the prototype.

### Access

**User** — `id, name, email (unique), passwordHash, phone, roleId, townId?, status, twoFactorSecret?, createdById, lastSignInAt`

`status` is `INVITED | ACTIVE | SUSPENDED`. There is **no** self-registration path and no
`PENDING_APPROVAL`. An account is created by somebody above it or it does not exist.

**Role** — `id, name, level, permissions Json, isSystem`
**AuditLog** — `id, actorId, action, entityType, entityId, townId?, reason?, before Json?, after Json?, ip, createdAt` — append-only; revoke UPDATE and DELETE at the database role level.

### The rule that must live in the database

A donor is callable only when **all** of these hold. Implement as a Postgres generated column or a
view — never as four separate pieces of application arithmetic, which is exactly how the prototype
came to state two different answers on two adjacent screens:

```sql
CREATE VIEW donor_eligibility AS
SELECT d.id,
  CASE
    WHEN d.deleted_at IS NOT NULL                      THEN 'REMOVED'
    WHEN d.deferred_until > now()                      THEN 'DEFERRED'
    WHEN s.id IS NULL                                  THEN 'NEVER_SCREENED'
    WHEN NOT s.all_negative                            THEN 'REACTIVE'
    WHEN s.tested_at < now() - interval '180 days'     THEN 'SCREENING_STALE'
    WHEN d.last_donated_at > now() - interval '90 days' THEN 'COOLDOWN'
    ELSE 'ELIGIBLE'
  END AS status
FROM donors d
LEFT JOIN LATERAL (
  SELECT id, tested_at,
         (hcv='NEGATIVE' AND hiv='NEGATIVE' AND hbs_ag='NEGATIVE'
          AND vdrl='NEGATIVE' AND mp='NEGATIVE') AS all_negative
  FROM screenings WHERE donor_id = d.id ORDER BY tested_at DESC LIMIT 1
) s ON true;
```

Every list, search, count and dashboard figure reads this view. If a screen needs its own version of
this logic, the screen is wrong.

---

## 4. API surface

REST, versioned at `/api/v1`. Every endpoint is scoped by the caller's role and town on the server.
Never filter by scope in the client.

```
POST   /auth/sign-in                      email + password → tokens (role from the account)
POST   /auth/refresh
POST   /auth/forgot-password              always 202, never reveals whether the address exists
POST   /auth/reset-password               single-use token, 1h expiry
POST   /auth/two-factor/verify

GET    /donors                            ?q&group&townId&eligibility&page
POST   /donors                            MR number generated if not supplied
GET    /donors/:id
PATCH  /donors/:id
DELETE /donors/:id                        soft; requires reason; audited
GET    /donors/search/eligible            ?group&townId  — the emergency search. p95 < 200ms.
POST   /donors/:id/screenings
POST   /donors/:id/defer                  reason required
POST   /donors/:id/donations

GET    /requests                          ?status&townId&group
POST   /requests                          public, rate-limited, honeypot + captcha
PATCH  /requests/:id/status
POST   /requests/:id/calls                records that a donor was called, and the outcome

GET    /inventory                         ?branchId
PUT    /inventory/:branchId
GET    /inventory/cover                   months of cover per group — one calculation, server-side

GET    /me/record                         donor self-service, phone + OTP
PATCH  /me/record
POST   /me/donations                      "I gave elsewhere"
PATCH  /me/consent
DELETE /me/record                         same-day removal, no reason required

POST   /accounts                          role and town constrained by the creator's own
GET    /accounts
PATCH  /accounts/:id/status
POST   /accounts/:id/reset-password       resets; never reveals

GET    /analytics/overview                ?townId — every dashboard figure, computed server-side
GET    /analytics/reports
GET    /audit                             ?townId&actorId&action — read-only forever

GET    /public/needs                      open requests, no patient names
GET    /public/pages/:slug
GET    /public/inventory-summary          shortage strip; hides itself after 48h without an update
```

**Every analytics figure is computed by the API.** The dashboard renders numbers; it does not derive
them. Two screens that each compute "donors in Zhob" will eventually disagree, and in this system that
means telling a branch manager their register holds 2 people and 198 people on adjacent screens.

---

## 5. Parallel work tracks

Eight tracks. Tracks within a wave have no shared files and can run concurrently. A track may not
begin until every track it depends on has passed its gate.

### Wave 0 — Foundation (one agent, blocks everything)
**T0 · Schema and scaffold.** Monorepo, Docker Compose, Prisma schema for all entities, migrations,
seed data (fourteen towns, six branches, eight roles, ~200 donors, the eligibility view), CI running
lint + typecheck + tests.
*Gate:* `docker compose up` gives a working API and web app. `prisma migrate reset` reproduces the
seed exactly. The eligibility view returns correct status for a fixture covering all seven cases.

### Wave 1 — Parallel (four agents)
**T1 · Auth and RBAC.** Sign-in, refresh, forgot/reset, TOTP, guards, the permission matrix,
account creation constrained by the creator's role and town. No self-registration path exists.
*Gate:* an integration test proves each of the eight roles can reach exactly its permitted endpoints
and receives 403 on every other — asserted from a table, not by hand.

**T2 · Donor domain.** CRUD, MR numbering, screening, deferral, donation recording, the eligibility
view, the emergency search, CSV import with column mapping and duplicate detection.
*Gate:* eligibility status matches the view for a fixture of 500 donors across all seven cases.
Emergency search p95 under 200ms with 50,000 donors.

**T3 · Requests and inventory.** Public request intake, the branch board, call tracking, stock,
months-of-cover, the shortage strip and its 48-hour staleness rule.
*Gate:* a request created from the public form appears on the correct branch board within one second.
Cover is computed in one place and every consumer reads it.

**T4 · Public site.** All public pages from the prototype, English/Urdu/Pashto with RTL, the needs
board, donor self-service with phone + OTP.
*Gate:* Lighthouse ≥ 90 on mobile for Home, Request blood and Needs. Every page renders in all three
languages with no layout breakage. A page that throws shows a visible error, never the previous page.

### Wave 2 — Parallel (three agents; needs T1 + T2)
**T5 · Admin operations.** Overview dashboard, requests, find donors, inventory, inbox, registry
screens, ledger.
*Gate:* every figure on the dashboard is traceable to one API field. No number is computed client-side.

**T6 · Admin organisation.** Accounts and hierarchy, roles, branches, network, settings, data
import/export, the audit log viewer.
*Gate:* creating an account sends an invitation and never sets a password. Export requires a typed
reason and writes to the log.

**T7 · Content management.** Homepage composer, pages, announcements, events, media with consent
flags, publishing and version history.
*Gate:* an announcement with an end date disappears on its own. A media asset without consent cannot
be attached to a public page — enforced by the API, not the form.

### Wave 3
**T8 · Notifications, WhatsApp, hardening.** SMS via the port, WhatsApp behind a flag, nightly
backups, rate limiting, penetration checks, load testing, deployment runbook.

---

## 6. The agent loop

Every agent runs this loop on its own track. **A track is not finished when the code is written. It is
finished when the loop cannot find anything more to fix.**

```
1. READ      This document, the prototype behaviour for your track, and the gate you must pass.
2. PLAN      Write the acceptance checks FIRST, as executable tests. If you cannot express a
             requirement as a check, you do not understand it yet — ask before building.
3. BUILD     Smallest working slice that makes one check pass. Commit per slice.
4. VERIFY    Run the full battery below. Not just your own tests.
5. AUDIT     Run the invariant checks in §7 across the whole system, not only your track.
6. DECIDE    Anything red → back to 3, fixing root cause, not symptom.
             All green → 7.
7. HAND OFF  Write what you changed, what you could not do, and what you assumed.
             Assumptions are defects waiting to happen; list every one.
```

**The verification battery — all must pass, every iteration:**

```bash
pnpm typecheck                 # zero errors, no `any` in domain code
pnpm lint
pnpm test:unit                 # ≥85% on domain logic
pnpm test:api                  # every endpoint: happy path, 401, 403, 422, edge
pnpm test:e2e                  # the six critical journeys, §8
pnpm test:rbac                 # every role × every endpoint, from the matrix
pnpm test:invariants           # §7
pnpm audit --audit-level=high
pnpm build                     # both apps
```

**Stop conditions.** An agent halts and asks a human when:
- a change would touch another track's files
- a requirement contradicts §1's ethical constraints
- a fix needs a schema change after Wave 0 is frozen
- the same check has failed three times — a fourth attempt at the same symptom means the diagnosis is
  wrong, not the fix

**Definition of done, per track:** gate passed · battery green · invariants green · no TODO in
committed code · handoff note written · a second agent has reviewed the diff against this document.

---

## 7. Invariant checks

These are not hypothetical. **Every one is a defect this prototype actually shipped and had to have
found for it.** Run them as automated checks across the whole system on every iteration — they catch
the class of bug that unit tests miss because each unit is individually correct.

```
INV-1   ONE SOURCE PER NUMBER
        No figure is computed in two places. Grep for duplicated aggregation.
        Test: every count on every screen equals the API field it claims to show.
        (Shipped as: dashboard said 10 eligible, register said 4, on the same data.)

INV-2   SCOPED HEADER, SCOPED BODY
        If a screen's header names a town, every panel beneath it is filtered to that town —
        or says plainly that it is organisation-wide.
        Test: for each role, assert no unscoped data appears under a scoped header.
        (Shipped four times, including a branch manager seeing another branch's stock as their own.)

INV-3   NO ORPHAN RECORDS
        Every foreign key resolves. No donor in a town absent from the town table.
        Test: nightly referential sweep; fail loudly.
        (Shipped as: a donor in a town no filter or search could reach.)

INV-4   PROSE MATCHES DATA
        No hardcoded number in copy that sits beside a chart. Derive it or delete it.
        Test: lint rule banning numeric literals in user-facing strings near data components.
        (Shipped as: "31m faster" above figures whose difference was 1h 32m.)

INV-5   ONE ELIGIBILITY RULE
        Only donor_eligibility decides callability. No other code checks days-since-donation.
        Test: grep for `90` and `180` outside the view definition.
        (Shipped as: a record sheet stating "can give today" and "never screened" together.)

INV-6   MIGRATIONS CORRECT DATA, NOT JUST SHAPE
        A migration that fixes a value must run against existing rows, not only new ones.
        Test: migration tests run against a snapshot of production-shaped data.
        (Shipped as: a seed correction that never reached the saved store.)

INV-7   FAILURES ARE VISIBLE
        No catch block that leaves stale content on screen. Every error surfaces to the user.
        Test: force each page to throw; assert an error state renders.
        (Shipped as: a broken page silently showing the previous page under the new title.)

INV-8   PLURALS AND EMPTY STATES
        Every derived count handles 0 and 1. Every filtered list has its own empty state,
        distinct from the all-clear state.
        Test: render every list at 0, 1 and many.
        (Shipped five times. "1 people". "1 children". "1 donors".)

INV-9   NO DEAD CONTROLS
        Every button does something or is not rendered.
        Test: E2E clicks every button on every screen; assert a state change.
        (Shipped as: ten "+ Add" buttons that opened nothing.)

INV-10  PERMISSIONS ARE SERVER-SIDE
        Hiding a control is presentation. The API refuses regardless.
        Test: for every hidden control, call its endpoint directly as that role; expect 403.

INV-11  PRIVACY HOLDS
        Telephone numbers never appear in a response to a role without that permission.
        Patient names never appear in any public response.
        Test: schema-level assertion on every public and cross-branch payload.

INV-12  THE LOG IS COMPLETE AND IMMUTABLE
        Delete, export and consent-grant each write a log line with a reason.
        Test: perform each; assert the line exists. Attempt UPDATE and DELETE on audit_log; expect
        a database-level refusal.
```

---

## 8. Critical journeys

End-to-end, run on every iteration, in the language of the person doing them.

1. **Emergency.** Attendant submits an O− request from a phone at 02:00 → appears on the Quetta board
   within a second → coordinator searches eligible O− donors in Quetta → list is ordered by longest
   since last donation → marks two called → records the donation → both donors' next-eligible dates
   move ninety days out → the request closes → the public needs board drops it.
2. **The old book.** Clerk uploads a 2,000-row spreadsheet → maps columns → sees duplicates, missing
   phones and unreadable dates before anything is saved → imports → every donor appears with an MR
   number and a screening status.
3. **A new member of staff.** Branch manager creates a Data entry account for their own town → cannot
   grant a role above their own → cannot place them in another town → the person receives a link,
   sets their own password, signs in, sees six screens and nothing else.
4. **A donor leaves.** Donor signs in with phone + OTP → sees their record → updates their number →
   records a donation made elsewhere → turns off night calls → removes themselves → gone the same day,
   past donations retained as an unnamed number in the yearly total.
5. **The website changes.** Head office publishes an announcement with an end date → it appears on the
   strip, the home page and the announcements page → it disappears by itself on that date.
6. **A branch goes quiet.** Chaman stops updating stock → after 48 hours the public shortage strip
   hides itself rather than showing stale figures → the branch appears in red on the network screen.

---

## 9. Handoff format

Every agent, every iteration:

```markdown
## Track T{n} — iteration {i}
CHANGED     files, and why
PASSING     which gates and checks
FAILING     what is red, and the root cause if known
ASSUMED     every assumption made in the absence of an answer
BLOCKED     what needs a human decision
NEXT        the smallest next slice
```

---

## 10. Decisions still owed by the client

Do not guess these. Ask, and record the answer here.

- Olus Yar's formal title, biography line and contact number
- Whether Olus Yar is named among the 1999 founders on the history page, or leads it today
- Real donation figures for 2013 to 2026 — the ledger has a thirteen-year gap
- Photographs: the design carries eight image slots and a media library, all empty
- The WhatsApp business number, and whether broadcast is in the first release
- Whether a donor may register on the public site directly, or only through a branch
- Data retention: how long a removed donor's unnamed donation history is kept
- Which entity signs the data protection undertaking published on the privacy page
