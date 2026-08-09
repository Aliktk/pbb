# Wave 1–3 — Track Briefs

Each brief is the self-contained context an agent needs to execute one track. When a
track starts, copy its section into `docs/tracks/T{n}.md` and keep the §9 handoff there.
Read `HARNESS-MODE-PROMPT.md` + `BUILD-PLAN.md` first. Owns/reads = file-ownership map in
BUILD-PLAN. **Never edit another track's files.** Schema is frozen — a schema need is a
stop-and-ask.

---

## T1 · Auth & RBAC  (Wave 1, needs T0)

**Build.** Sign-in (email+password, argon2id), JWT access+refresh, forgot/reset (single-use
1h token, always 202), TOTP two-step, Nest guards, the permission matrix from `Role.permissions`,
account creation constrained so a creator cannot grant a role at/above their own `level` nor
place a user outside their own `townId`. **No self-registration path exists.** Invitation flow:
create account → email a link (via `NotificationPort`) → user sets own password → ACTIVE.
**Owns:** `apps/api/src/{auth,accounts,rbac}`, `apps/web/app/(admin)/login` + reset/accept/2fa screens.
**Gate:** a table-driven test asserts each of the 8 roles reaches exactly its permitted
endpoints and gets 403 on every other — asserted from the matrix, not by hand (`test:rbac`).
**Watch:** INV-10 (server refuses regardless of hidden UI), INV-11 (no phone leak by role).

## T2 · Donor domain  (Wave 1, needs T0)

**Build.** Donor CRUD, MR numbering (generated per branch if not supplied), screening create,
deferral (reason required), donation recording (moves `lastDonatedAt`, bumps `timesDonated`),
the eligibility READ-path (query `donor_eligibility` view only — never re-implement the rule),
the emergency search (`GET /donors/search/eligible?group&townId`, ordered by longest-since-last-
donation), CSV import with column mapping + duplicate detection + a preview-before-save step.
**Owns:** `apps/api/src/{donors,screenings,donations,import}`.
**Gate:** eligibility status matches the view for a 500-donor fixture across all 7 cases;
emergency search p95 < 200ms at 50,000 donors (add the covering index if needed — but the
index only, never a second eligibility calculation). **Watch:** INV-5 (grep 90/180 must find
them ONLY in migration 002), INV-1 (counts come from one place).

## T3 · Requests & inventory  (Wave 1, needs T0)

**Build.** Public request intake (rate-limited, honeypot `website` field + captcha), the branch
board (open requests per town), call tracking (`RequestCall` + outcome), stock CRUD on
`StockLevel`, months-of-cover computed **once** server-side (`GET /inventory/cover`), the public
shortage strip that hides itself after 48h without a stock update (`STOCK_STALE_HOURS`).
**Owns:** `apps/api/src/{requests,inventory}`.
**Gate:** a request from the public form appears on the correct branch board < 1s; cover is
computed in one place and every consumer reads it (INV-1). **Watch:** INV-11 (public payloads
carry no patient name / requester phone — use the `PublicNeed` shape from `@pbb/types`).

## T4 · Public site  (Wave 1, needs T0)

**Build.** All 25 public routes (ROUTE-INVENTORY) as Next.js Server Components, EN/UR/PS via
`next-intl` with RTL for Urdu/Pashto, the needs board, donor self-service (`/me` phone+OTP:
signin → code → record → remove-same-day). Port the prototype's look pixel-for-pixel from
`_handoff/modernist/project/PBB Website.html` + `pbb-pages*.js` + `styles.css`.
**Owns:** `apps/web/app/(public)`, `apps/web/app/me`, `packages/ui/public`.
**Gate:** Lighthouse ≥ 90 mobile on Home/Request/Needs; every page renders in all 3 languages
with no layout break; a throwing page shows a visible error, never the previous page (INV-7).
**Watch:** INV-8 (0/1/many empty states + plurals), INV-4 (no hardcoded numbers beside charts).

## T5 · Admin operations  (Wave 2, needs T1+T2)

**Build.** Overview dashboard, requests, find-donors, donor registry + detail, inventory, inbox,
sent, ledger, reports, thalassemia, profile. Every figure comes from `GET /analytics/*` — the
dashboard renders numbers, never derives them. Port admin look from `pbb-admin*.js`.
**Owns:** the listed `apps/web/app/(admin)/*` screens.
**Gate:** every dashboard figure traces to exactly one API field (INV-1); nothing computed
client-side. **Watch:** INV-2 (scoped header ⇒ scoped body), INV-9 (every button does something).

## T6 · Admin organisation  (Wave 2, needs T1+T2)

**Build.** Accounts + hierarchy tree, roles + permission matrix editor, branches, network (town
health incl. Chaman-goes-quiet red state), settings, data import/export, audit-log viewer
(read-only). Export requires a typed reason and writes to `audit_log`.
**Owns:** `apps/web/app/(admin)/{accounts,roles,branches,network,data,audit,settings}`.
**Gate:** creating an account sends an invite and never sets a password (§8.3); export needs a
typed reason and writes the log (INV-12). **Watch:** INV-10, INV-11.

## T7 · Content management  (Wave 2, needs T1+T2)

**Build.** Homepage composer, pages CMS with version history (`PageVersion`), announcements
(auto-expire on `endsAt`), events, media library with consent flags, partners, volunteers.
Publishing + rollback. **Owns:** listed `apps/web/app/(admin)/*` + `apps/api/src/content`.
**Gate:** an end-dated announcement disappears on its own (§8.5); a media asset without
`hasConsent` cannot be attached to a public page — enforced by the API, not the form (constraint #5).

## T8 · Notifications & hardening  (Wave 3)

**Build.** Twilio driver behind `NotificationPort`; WhatsApp Cloud API behind `WHATSAPP_ENABLED`;
BullMQ jobs (SMS/WhatsApp send, nightly backups, screening-expiry sweep that sets stale donors);
rate limiting; pen-test checks; load test (50k donors) confirming the p95 gate; the deployment
runbook. **Owns:** `apps/api/src/{notifications,jobs}`, `apps/web/app/(admin)/whatsapp`, ops.
**Gate:** SMS sends through the port only; WhatsApp stays dark until the flag flips; nightly
backup runs and restores; the six §8 journeys stay green under load.
