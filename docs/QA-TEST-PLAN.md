# PBB — Full QA & Test Plan (Frontend + Admin)

This is the authoritative test plan for the Pashtoonkhwa Blood Bank (PBB) platform. It has two
parts:

1. **[Part A — Agent QA Prompt](#part-a--agent-qa-prompt)** — copy/paste this whole block into a
   fresh Claude / QA agent session to have it drive a complete QA pass.
2. **[Part B — Human Checklist](#part-b--human-checklist)** — the same coverage as tick boxes for a
   person to run by hand.

The app is **Supabase-direct**: the browser talks straight to Supabase (Auth + PostgREST + Row
Level Security). There is **no separate API server**. Access is enforced by the database (RLS), so
tests must check both "does the UI allow it" **and** "does the database actually permit/deny it".

---

## Preconditions (do this once before testing)

1. Database initialized from `supabase/migrations/0000_init.sql` on a **fresh** schema
   (see `docs/SUPABASE-SETUP.md` → the reset + run steps).
2. Super admin exists: **`nawazktk99@gmail.com`** (head office), password set out-of-band.
3. Supabase Auth: **email confirmation OFF**; for reset-email tests, SMTP configured and
   `<domain>/admin/reset` + `http://localhost:3000/admin/reset` added to redirect URLs.
4. For admin set-password / delete tests: the `admin-users` Edge Function is deployed.
5. Create one **test account per role** from `/admin/accounts`, and seed data in **two towns**
   (e.g. Quetta and Chaman) so multi-tenant isolation can be verified.
6. Test URL: `__PROD_OR_PREVIEW_URL__` (fill in, e.g. the Vercel URL or `http://localhost:3000`).

---

## Part A — Agent QA Prompt

```
You are a QA engineer for the Pashtoonkhwa Blood Bank (PBB) platform — Next.js 15 App Router on
Supabase-direct (Supabase Auth + PostgREST + Row Level Security). There is NO separate API server;
the browser talks to Supabase and RLS enforces access. Perform a COMPLETE QA pass: functional CRUD,
RBAC per role, multi-tenant isolation, validation/negative tests, data integrity, and public-site
flows. Report every defect with: severity (CRITICAL/HIGH/MEDIUM/LOW), exact page/action, steps to
reproduce, expected vs actual, and a suggested fix. Do NOT fabricate passes — if you cannot verify
something, say so. When a write "succeeds" in the UI, confirm it PERSISTED by refreshing and
re-reading; a success toast on a failed write is a CRITICAL "fake success" defect.

=== ENVIRONMENT ===
- URL: __PROD_OR_PREVIEW_URL__. Admin at /admin, public site at /.
- DB initialized from supabase/migrations/0000_init.sql on a fresh schema.
- Super admin (head office): nawazktk99@gmail.com. Email confirmation OFF.
- Create a test account for EACH role via /admin/accounts before testing role behaviour.

=== ROLE MODEL (8 roles) ===
head (super admin, all 14 towns, creates/removes anyone),
manager (one office; manages operational staff in own town),
coordinator (answers requests, calls donors — own town),
clerk (adds donors + donations — own town),
lab (screens/verifies donors — own town),
volunteer (volunteers + camps — own town),
editor (website content only, org-wide),
viewer (read-only — own town).
Assignment rule: head may assign ANY role; a manager may assign only
coordinator/clerk/lab/volunteer and only in their own town; everyone else cannot create accounts.

=== RUN EVERY SECTION AS EACH ROLE, THEN COMPARE TO EXPECTED ===

A. AUTHENTICATION & SESSION
  1. Login with correct creds -> lands on /admin/overview; the header shows the CORRECT role
     (a head must show "Head office", NOT "Viewer" — a Viewer badge for head means the profile
     row/grant is wrong).
  2. Login with wrong password -> clear error, no session.
  3. Session persists across refresh; logout clears it and blocks /admin/*.
  4. Navigate to /admin/overview while logged out -> redirect to /admin/login.
  5. /admin/forgot: submit an email -> a real reset email arrives -> its link opens /admin/reset
     -> set a new password (min 8) -> can log in with it. The reset form must ONLY work from the
     email link (open /admin/reset directly while logged in — it must NOT let you change the password).
  6. /admin/signup: sign up with an INVITED email -> profile activated with the invited role+town.
     Sign up with a NON-invited email -> no access (no profile row, sees nothing).

B. ACCOUNT MANAGEMENT (/admin/accounts)
  1. head: invite every role for the right town(s); after the person signs up they get exactly
     that role + office.
  2. head: open an account -> change name + role + office -> Save -> persists after refresh.
  3. head: suspend an account -> that user can no longer read/write -> restore -> can again.
  4. head: "Email a password-reset link" for a staff member -> email arrives.
  5. head: "Set a password manually" (needs the Edge Function) -> that user can log in with it.
  6. head: "Delete this account" -> the account is gone; you CANNOT delete or suspend yourself;
     you CANNOT set-password/delete another HEAD account.
  7. manager: can ONLY invite/manage coordinator/clerk/lab/volunteer in their OWN town; cannot
     see other towns' staff; cannot set-password or delete.
  8. coordinator/clerk/lab/volunteer/editor/viewer: cannot create/modify accounts at all.
  9. Self-escalation: as a non-head, attempt to set your own role to head (via UI or a crafted
     request) -> the DB MUST reject it.

C. MULTI-TENANCY ISOLATION (most important)
  1. As a Quetta town user, you see ONLY Quetta donors/requests/donations/stock/thalassemia/
     volunteers/finance — never Chaman's.
  2. /admin/find returns ONLY your own town's donors.
  3. head sees ALL towns' data and can tell which town each record belongs to.
  4. Try to read/update another town's record by editing an id in the URL or a crafted request
     -> the DB must deny. Any cross-town leak = CRITICAL.

D. CRUD PER DOMAIN (Create, Read, Update, Delete/deactivate, filter, search, paginate; confirm
   each write persists by refreshing)
  1. Donors (/admin/donors): add (all fields, blood group, consent), edit, defer/delete;
     eligibility shows correctly; search + filters work; search with , ( ) " ' \ % _ * does not
     error or inject.
  2. Requests (/admin/requests): public form creates one; staff read; mark arranged/closed.
  3. Donations (/admin/record + finance): record against a donor -> donor history + timesDonated
     update; appears in ledger.
  4. Inventory / stock (/admin/inventory): set levels per group -> saves; reopen shows saved
     values; home page stock reflects it. (No "saved" toast on a failed write.)
  5. Thalassemia (/admin/thalassemia): register a patient, record a transfusion.
  6. Volunteers (/admin/volunteers) and Partners (/admin/partners): full CRUD. The town column
     must load (no "Could not find a relationship between X and towns" error).
  7. Finance (/admin/finance): create an invoice (card + tests); mark a poor patient WAIVED ->
     total 0; record a charity donation. Prices must come from the server price list — tampering
     the amount client-side must be overwritten by the DB.
  8. Network / Offices (/admin/network): head creates/edits a town/office; a manager may edit only
     their own office's contact fields; nobody can delete a town from the UI.
  9. Content/CMS (if present): editor can edit; others cannot.

E. VALIDATION / NEGATIVE / SECURITY
  1. Forms with empty required fields, bad email, out-of-range numbers, oversized text, unicode ->
     graceful validation, no crash, no 500.
  2. Any mutating action while suspended or under-privileged -> DB denies; UI shows the real error,
     never a fake success.
  3. Public request form respects limits (unitsNeeded 1..20, status OPEN only).
  4. Password rules are consistent everywhere (min 8, max 128): signup, reset, profile, admin
     set-password. Every password field has a show/hide toggle.
  5. Audit log is append-only (no edit/delete of audit rows).

F. PUBLIC SITE (logged out)
  1. All pages load: home, about, people, problem, services, supporters, faq, branches, gallery,
     publications, news, contact, needs, join, thalassemia.
  2. Founding year reads 1996 everywhere (NOT 1999); funding copy = no govt/institutional funders
     (members, charity, Zakat, Eid cattle-hides); "thirty years".
  3. /needs loads without login and shows open requests with NO patient PII.
  4. Contact + join (donor/volunteer/partner) forms submit and land in the office inbox.
  5. EN <-> اردو language switch works across pages.
  6. /branch/<id> shows the correct branch (Chaman != Quetta); Chaman = Khushi Muhammad Road,
     0333-3151503 / 0826-612281, pbb.chaman@gmail.com.
  7. Logo, favicon, and OG/Twitter preview show the current PBB logo.

G. CROSS-CUTTING
  1. No console errors; no 404 assets; no PostgREST 500s (watch for schema-cache / RLS-recursion).
  2. Numbers on dashboards come from REAL data (0 with an empty DB) — flag any hardcoded/always-on
     stat presented as live (e.g. a fixed "100% verified").
  3. Accessibility: heading order, alt text, colour contrast, keyboard focus.

=== DELIVERABLE ===
A prioritized defect list (CRITICAL->LOW) with reproduction steps, plus a role x action matrix
(PASS/FAIL/BLOCKED) for sections B-E, and a "fix first" shortlist.
```

---

## Part B — Human Checklist

Tick each as you go. `H`=Head, `M`=Manager, `C`=Coordinator, `Cl`=Clerk, `L`=Lab, `V`=Volunteer,
`E`=Editor, `Vw`=Viewer.

### Auth & session
- [ ] Head logs in and the header shows **Head office** (not Viewer)
- [ ] Wrong password → clear error, no session
- [ ] Refresh keeps session; logout blocks `/admin/*`
- [ ] `/admin/forgot` sends a real email → `/admin/reset` sets a new password
- [ ] `/admin/reset` opened directly (logged in, no link) does **not** allow a change
- [ ] Invited email signup activates the right role; non-invited signup gets no access

### Accounts (`/admin/accounts`)
- [ ] Head: invite each role, edit name/role/office, suspend/restore, email reset link, set password, delete
- [ ] Head cannot suspend/delete self; cannot set-password/delete another head
- [ ] Manager: only coordinator/clerk/lab/volunteer, own town; no set-password/delete
- [ ] Lower roles: cannot manage accounts
- [ ] Non-head self-escalation attempt is rejected by the DB

### Multi-tenancy
- [ ] Quetta user sees only Quetta data across every domain
- [ ] `/admin/find` returns only own-town donors
- [ ] Head sees all towns, segregated
- [ ] Cross-town access by crafted id/URL is denied

### CRUD (each persists after refresh; no fake success)
- [ ] Donors  - [ ] Requests  - [ ] Donations  - [ ] Inventory/stock
- [ ] Thalassemia  - [ ] Volunteers (town loads)  - [ ] Partners (town loads)
- [ ] Finance (waive → 0; server-side pricing)  - [ ] Network/offices  - [ ] Content (editor only)

### Validation / security
- [ ] Bad/empty/oversized inputs handled gracefully (no 500)
- [ ] Donor search with `, ( ) " ' \ % _ *` is safe
- [ ] Password rules 8–128 consistent + show/hide everywhere
- [ ] Under-privileged writes show the real error, never fake success
- [ ] Audit log cannot be edited/deleted

### Public site (logged out)
- [ ] All pages load; founding = 1996 / thirty years; funding copy correct
- [ ] `/needs` loads without login, no PII
- [ ] Contact + join forms submit to the inbox
- [ ] EN ⇄ اردو switch works
- [ ] `/branch/chaman` shows Chaman's real contact (not Quetta)
- [ ] Logo/favicon/OG show the current PBB logo

### Cross-cutting
- [ ] No console errors / 404s / PostgREST 500s (schema-cache, RLS recursion)
- [ ] Dashboard numbers are real (0 on an empty DB), no hardcoded "live" stats
- [ ] Basic accessibility (headings, alt, contrast, focus)

---

## Defect report template

```
[SEVERITY] <page/action>
Steps: <1,2,3>
Expected: <...>
Actual: <... include any PostgREST error code, e.g. 42P17 / 42501>
Suggested fix: <...>
```

## Known-issue watch list (regression guard)

These were found and fixed during hardening — re-verify they stay fixed on any fresh deploy:

- Head account shows **Viewer** → missing `grant select on profiles` (fixed) / missing profile row.
- Saving profile or changing a role returns **500 `42P17`** → RLS policy recursion on `profiles` (fixed).
- Partners/Volunteers page: **"Could not find a relationship … and towns"** → missing `townId` FK (fixed).
- Inventory/Reports **"fake success"** or hardcoded "live" numbers → must be real Supabase data.
