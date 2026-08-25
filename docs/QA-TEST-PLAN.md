# PBB — Full QA & Test Plan (Frontend + Admin)

Authoritative, **element-level** test plan for the Pashtoonkhwa Blood Bank (PBB) platform. The goal
is to exercise **every button, link, text, input, box, dropdown, checkbox, toggle, hover, effect,
animation, and every form** (fill → validate → submit → persist) on **every page**, public and admin.

Two parts:

1. **[Part A — Agent QA Prompt](#part-a--agent-qa-prompt)** — paste into a fresh Claude / QA agent to
   drive a complete, exhaustive pass.
2. **[Part B — Human Checklist](#part-b--human-checklist)** — the same coverage as tick boxes.

The app is **Supabase-direct**: the browser talks straight to Supabase (Auth + PostgREST + Row Level
Security); there is **no separate API server**. Every test must check both "does the UI allow it" and
"did the database actually persist/deny it" (refresh and re-read to confirm).

---

## Preconditions (once)

1. DB initialized from `supabase/migrations/0000_init.sql` on a **fresh** schema (see `docs/SUPABASE-SETUP.md`).
2. Super admin exists: **`nawazktk99@gmail.com`** (head office), password set out-of-band.
3. Supabase Auth: **email confirmation OFF**; for reset emails, SMTP set and `<domain>/admin/reset`
   + `http://localhost:3000/admin/reset` added to redirect URLs; `admin-users` Edge Function deployed.
4. Create one **test account per role** and seed data in **two towns** (e.g. Quetta + Chaman).
5. Test on 3 viewports: **mobile (~375px), tablet (~768px), desktop (~1280px)**, and test the site in
   **English and اردو (RTL)**.
6. Base URL: `__PROD_OR_PREVIEW_URL__`.

---

## Part A — Agent QA Prompt

```
You are a meticulous QA engineer for the Pashtoonkhwa Blood Bank (PBB) platform — Next.js 15 App
Router on Supabase-direct (Auth + PostgREST + Row Level Security). NO separate API server. Your job
is EXHAUSTIVE: on every page, interact with EVERY element and EVERY form and record the result. Do
not summarize "looks fine" — enumerate elements and test each. When a write appears to succeed,
REFRESH and re-read to confirm it persisted; a success toast on a failed write is a CRITICAL
"fake success" defect. Report every defect: severity (CRITICAL/HIGH/MEDIUM/LOW), page, element,
steps, expected vs actual (include any PostgREST error code e.g. 42P17 / 42501 / 42703), suggested
fix. If you cannot verify something, say so — never fabricate a pass.

=== ENVIRONMENT ===
- URL: __PROD_OR_PREVIEW_URL__ . Public site at /, admin at /admin.
- DB from supabase/migrations/0000_init.sql (fresh). Super admin: nawazktk99@gmail.com. Email
  confirmation OFF. Create one test account per role before role testing.
- Test viewports: 375 / 768 / 1280 px. Test language EN and اردو (RTL).

=== ROLE MODEL (8) ===
head (all towns, manages anyone), manager (one office; operational staff in own town),
coordinator (requests + call donors), clerk (donors + donations), lab (screen/verify),
volunteer (volunteers + camps), editor (website content only, org-wide), viewer (read-only).
Assignment: head assigns ANY role; manager assigns only coordinator/clerk/lab/volunteer in own
town; others cannot create accounts.

============================================================================
UNIVERSAL PROTOCOL — APPLY TO EVERY PAGE (public and admin)
============================================================================
STEP 0 — ELEMENT INVENTORY. On each page, list EVERY interactive + visual element (buttons, links,
inputs, textareas, selects/dropdowns, checkboxes, radios, toggles/switches, file pickers, number/
date fields, search boxes, tabs, accordions, modals/sheets/drawers, tooltips, pagination, sortable
headers, copy-link fields, avatars, charts, badges, cards). Then test each per the rules below.

A) BUTTONS & LINKS (every one)
  - Click it: does the correct action / navigation happen? URL correct? No dead ends.
  - Hover: cursor becomes pointer; hover style/colour/shadow/scale changes as designed.
  - Focus (Tab to it): visible focus ring; Enter/Space activates it.
  - Disabled state: greyed, not clickable, correct tooltip/reason where relevant.
  - Loading state: shows spinner/"…"; is disabled during the async action (no double-submit).
  - Links open the right route; external links use target/rel correctly; no href="#" no-ops.

B) TEXT INPUTS / TEXTAREAS (every one)
  - Placeholder shows; label associated; typing updates the value.
  - Focus/blur styles; focus ring visible.
  - Required: empty submit is blocked with a clear message.
  - Format validation: email rejects "abc"; phone/number reject letters; URLs validated if required.
  - Boundary: min/max length (e.g. password 8–128, name ≤ 200), whitespace-only rejected, very long
    strings handled, leading/trailing spaces trimmed.
  - Special input: unicode, Urdu/RTL text, emoji, and injection chars , ( ) " ' \ % _ * — must not
    500, must not inject (esp. donor/partner search).
  - Read-only/disabled fields cannot be edited (email, role/town on profile).
  - Password fields: masked by default; the Show/Hide toggle reveals/hides.

C) SELECT / DROPDOWN / MULTISELECT
  - Opens on click; all expected options present; keyboard arrows + Enter select; Esc closes.
  - Selecting changes the value and any dependent UI (e.g. role → office field appears/hides).
  - Default/placeholder option cannot be submitted if a real value is required.

D) CHECKBOX / RADIO / TOGGLE / SWITCH
  - Click toggles; keyboard toggles; state reflected visually; grouped radios are mutually exclusive.
  - The state actually affects the submitted data / the UI it controls (not inert).

E) FILE UPLOAD / AVATAR
  - Picker opens; accepts allowed types, rejects others; preview renders; remove works.
  - Note whether it PERSISTS or is preview-only (avatar is preview-only — label must say so).

F) TABS / ACCORDIONS / FILTERS / SEARCH / SORT / PAGINATION
  - Tabs switch content; active tab highlighted; deep-link/refresh keeps or resets sensibly.
  - Accordions expand/collapse with animation; content correct.
  - Filters/search/sort actually change the list; combined filters work; "clear" resets; counts
    (e.g. "All (0)") match reality.
  - Pagination: next/prev/page numbers work; disabled at ends; page size correct.

G) MODALS / SHEETS / DRAWERS
  - Open on trigger; overlay click + ✕ + Esc all close; focus trapped inside; body scroll locked;
    re-opening resets fields; closing mid-edit discards (or warns) as designed.

H) HOVER / EFFECTS / ANIMATIONS / VISUAL
  - Hover effects on cards/rows/buttons/nav; dropdown menus open on hover/click.
  - Transitions/animations smooth (no jank/flicker); preloader shows then clears on first load;
    scroll-to-top button appears on scroll and works; sticky header behaves; charts render with
    tooltips; badges/status pills show correct colour per state.
  - Loading spinners on async areas; skeleton/"Loading…" states; EMPTY states show a friendly
    message (not a broken table) when there is no data.
  - Toasts: appear on action, are readable, auto-dismiss/stack correctly, and only appear on REAL
    success/'error (no fake success).

I) FORMS — run this matrix on EVERY form (contact, join donor/volunteer/partner/org, request blood,
   add/edit donor, add donation, invoice, record donation, create/edit account, add partner, add
   volunteer, add thalassemia patient, add/edit town/office, profile name, password change, reset,
   signup, login, forgot, settings):
  1. Submit EMPTY → each required field flagged; no submit.
  2. Each field invalid in turn (bad email, out-of-range number, too-short/too-long) → blocked with
     a clear message pointing at the field.
  3. Boundary values accepted at the edges (e.g. exactly 8 chars, min/max numbers).
  4. Duplicate where relevant (e.g. inviting an already-invited email, duplicate town) → sensible error.
  5. VALID submit → success feedback → the record PERSISTS (refresh + re-read; appears in its list/DB).
  6. Double-click / rapid double-submit → only ONE record created; button disabled during submit.
  7. Cancel/close/reset → no partial write; fields cleared next open.
  8. Simulate failure (offline or a denied action) → the real error is shown, NEVER a fake success.

J) STATE / NAVIGATION / DATA
  - Browser back/forward keeps expected state; deep-linking a page directly works (or redirects if
    auth-gated); refresh mid-flow behaves; two tabs don't corrupt each other.

K) ERRORS / CONSOLE / NETWORK
  - Open DevTools: NO console errors/warnings on load or interaction; NO failed asset (404); NO
    PostgREST 500s. Watch specifically for: 42P17 (RLS recursion), 42501 (permission/RLS denied),
    42703 (missing column), PGRST200 ("could not find a relationship" = missing FK / stale schema).

============================================================================
PER-PAGE CHECKLIST — visit EVERY route and apply the universal protocol; page-specific notes below
============================================================================

PUBLIC / AUTH / DONOR-SELF (logged out unless noted)
  /                     Home: hero CTAs (Request Blood / Register), live stock grid, 30-year chart
                        (hover tooltips per bar), announcements cards, "where we are", nav dropdowns,
                        language switch (EN/اردو + RTL), footer links, scroll-to-top, preloader.
  /about                Story hero, timeline eras, meta cards. Founding = 1996 / "thirty years"
                        everywhere (NOT 1999/27). Images/placeholders.
  /people               Committee cards (names present, no fake phone lines), staff section.
  /problem              Stat blocks (1996 founding), CTA to solutions.
  /services             Service cards, "free/no-exchange" copy, 1996 copy.
  /supporters           Partner/funding cards: NO govt/institutional funder claims; Zakat/charity/
                        Eid cattle-hides; "Funding Source" block.
  /faq                  Accordion Q&A expand/collapse; 1996 copy; costs/exemptions answer.
  /branches             Office list + "towns served" list; each links to /branch/[id].
  /branch/[id]          Per-branch page shows the RIGHT branch (chaman ≠ quetta). Chaman = Khushi
                        Muhammad Road, 0333-3151503 / 0826-612281, pbb.chaman@gmail.com. Unknown id
                        → "not found"; a contactless branch → "coming soon", not Quetta's data.
  /gallery              Image grid (illustrative captions, no fake "verified"/KP locations), lightbox
                        if any, media email = @pashtoonkhwabloodbank.org.
  /publications         Cards + "Contact us for copies" (no fake file sizes / dead downloads).
  /news                 Bulletin cards (no fabricated verified stats), correct email domain.
  /contact              CONTACT FORM (name/email/phone/subject/message) → submit → lands in admin
                        inbox; head-office phone 081-2836820 shown; no donor phone numbers as staff.
  /donate               DonateForm — fill + submit; confirm whether it transmits or only acknowledges.
  /join                 Landing → chooses a kind; links to /join/[kind].
  /join/[kind]          JoinForm for donor / volunteer / partner / organisation: full field set,
                        blood group, consent checkboxes, submit → lead into contact_messages. Public
                        donor = lead (not a direct donor write).
  /needs                Public "who needs blood" board loads WITHOUT login (anon), shows open
                        requests with NO patient PII; empty state when none.
  /thalassemia          Public info page.
  /me                   Donor self landing.
  /me/signin            Donor sign-in (contact-a-branch flow — no SMS). 
  /me/code              Code entry screen.
  /me/remove            Removal request flow.
  /privacy /terms       Static legal pages load.

ADMIN (log in per role; apply universal protocol to every control)
  /admin/login          Email + password (+ Show/Hide), wrong creds error, "forgot" + "signup" links.
  /admin/forgot         Sends a REAL reset email (resetPasswordForEmail) → "check your email"
                        (enumeration-safe: same message whether or not the email exists).
  /admin/reset          Only works from the email link (PASSWORD_RECOVERY). Set new password (8–128,
                        Show/Hide, confirm match) → success → login. Direct visit while logged in must
                        NOT allow a change; invalid/expired link → "request a new link".
  /admin/signup         Invited email → activates role/town; non-invited → no access. Password 8+.
  /admin/sent           Confirmation screen renders.
  /admin/overview       KPI cards + stock holding + verification rings + latest requests table +
                        "Emergency Request" button. Numbers must be REAL (0 on empty DB) — flag any
                        hardcoded/always-on stat (e.g. a fixed "100% verified").
  /admin/donors         Table + search + filters + pagination; "Add donor" modal (full form matrix);
                        row → DonorSheet (details, real donation history — no fabricated rows, edit,
                        defer/delete). Search injection-safe.
  /admin/find           Emergency donor search: group/city/radius/gender inputs → results; own-town
                        only for scoped roles; DonorSheet.
  /admin/requests       Requests list; open request; mark arranged/closed → persists.
  /admin/record         Record-a-donation form → updates donor history + ledger.
  /admin/inventory      Town/branch selector + per-group stock inputs → Save → persists (no fake
                        success on failure); "Update Stock" reflects on home.
  /admin/thalassemia    Patients table; add patient (form matrix); record transfusion; town column
                        loads (no relationship error); note the inert "sponsored" flag if present.
  /admin/volunteers     Volunteers table + CRUD; town column loads (FK); status changes.
  /admin/donations …    (via record/finance) donations list; town + donor embeds load.
  /admin/ledger         Blood-intake ledger + yearly chart; add/edit yearly intake; flag hardcoded KPIs.
  /admin/finance        Invoices + KPIs; new invoice (card + tests), WAIVE poor patient → total 0;
                        record charity donation; server-side pricing (tampered amount overwritten).
  /admin/network        Town/office network table; head add/edit town+office; manager edits only own
                        office contact fields; no town delete from UI; "served towns" list.
  /admin/branches       Offices + towns-served; edit office address/phones/email.
  /admin/partners       Partners table + KPIs + category filters + search; add/edit partner (form
                        matrix), approve/decline pending, delete; town column loads (FK).
  /admin/inbox          Contact/join messages; kind filters; mark answered (real write, no fake toast).
  /admin/accounts       Full account management: KPIs, roles table, pending invites (cancel), staff
                        table → AccountSheet: edit name+role+office (Save persists — must NOT 500),
                        suspend/restore, "Email reset link", head-only "Set password manually"
                        (Show/Hide, 8–128), head-only "Delete" (2-step confirm). Cannot self-suspend/
                        delete; cannot manage another head. Create-account sheet (invite) full matrix.
  /admin/roles          Roles & access reference (read-only) renders correctly.
  /admin/audit          Audit log (read-only, append-only) renders; filters if any.
  /admin/data           Import/export/purge donor data; flag the fake "backup" row if still present.
  /admin/profile        Avatar (preview-only, labelled), edit name → Save persists (must NOT 500),
                        read-only email/role/town, password change (8–128, confirm match, Show/Hide).
  /admin/settings       Settings tabs/toggles → confirm each actually saves or is labelled otherwise.

RBAC × ROLE MATRIX — repeat sections above as EACH role; record PASS/FAIL/BLOCKED per (role × action).
  Expected: head = full; manager = own-town operational + own-town staff (no set-password/delete);
  coordinator/clerk/lab/volunteer/editor/viewer = their scoped read/write only, NO account mgmt.

MULTI-TENANCY — with data in ≥2 towns: a town user sees ONLY their town everywhere; /admin/find is
own-town only; head sees all, segregated; cross-town access via crafted id/URL is DENIED by the DB.

=== DELIVERABLE ===
Per-page report (elements tested + defects), a role × action PASS/FAIL/BLOCKED matrix, a
consolidated defect list (CRITICAL→LOW) with repro steps + error codes, and a "fix first" shortlist.
```

---

## Part B — Human Checklist

For **every page** in the route list below, walk these five passes:

1. **Elements** — click/hover/focus every button, link, tab, dropdown, checkbox, toggle, and card.
2. **Forms** — for each form: empty submit, each field invalid, boundary values, valid submit,
   double-submit, cancel, and a simulated failure. Confirm the record **persists** (refresh).
3. **Visual** — hover effects, transitions/animations, loading + empty states, toasts, preloader,
   scroll-to-top, sticky header, charts/tooltips, badges.
4. **Responsive + language** — mobile / tablet / desktop, and EN + اردو (RTL).
5. **Console/network** — no errors, no 404s, no 500s (watch 42P17 / 42501 / 42703 / PGRST200).

### Routes to cover
**Public/auth/me:** `/`, `/about`, `/people`, `/problem`, `/services`, `/supporters`, `/faq`,
`/branches`, `/branch/[id]`, `/gallery`, `/publications`, `/news`, `/contact`, `/donate`, `/join`,
`/join/[kind]`, `/needs`, `/thalassemia`, `/me`, `/me/signin`, `/me/code`, `/me/remove`,
`/privacy`, `/terms`.

**Admin:** `/admin/login`, `/admin/forgot`, `/admin/reset`, `/admin/signup`, `/admin/sent`,
`/admin/overview`, `/admin/donors`, `/admin/find`, `/admin/requests`, `/admin/record`,
`/admin/inventory`, `/admin/thalassemia`, `/admin/volunteers`, `/admin/ledger`, `/admin/finance`,
`/admin/network`, `/admin/branches`, `/admin/partners`, `/admin/inbox`, `/admin/accounts`,
`/admin/roles`, `/admin/audit`, `/admin/data`, `/admin/profile`, `/admin/settings`.

### Cross-cutting checks
- [ ] Every button does something (no dead clicks); every link goes to a real route
- [ ] Every required field blocks empty submit; every write persists after refresh
- [ ] No fake success toasts (a failed write shows the real error)
- [ ] Every password field: masked + Show/Hide, rule 8–128, confirm-match where relevant
- [ ] Hover/focus/active/disabled/loading states correct on interactive elements
- [ ] Modals/sheets close via ✕, overlay click, and Esc; focus trapped; fields reset on reopen
- [ ] Filters/search/sort/pagination change the list; counts match; empty states friendly
- [ ] Multi-tenancy: town user sees only their town; head sees all, segregated
- [ ] RBAC: each role can do exactly its allowed actions and nothing more
- [ ] EN ⇄ اردو switch works and RTL layout is correct
- [ ] Responsive at 375 / 768 / 1280 px; no overflow/broken layout
- [ ] No console errors, 404s, or PostgREST 500s anywhere

---

## Defect report template

```
[SEVERITY] <page> — <element/form>
Steps: <1,2,3>
Expected: <...>
Actual: <... include any PostgREST error code, e.g. 42P17 / 42501 / 42703 / PGRST200>
Suggested fix: <...>
```

## Known-issue watch list (regression guard)

Found and fixed during hardening — re-verify they stay fixed on any fresh deploy:

- Head account shows **Viewer** → missing `grant select on profiles` / missing profile row.
- Saving profile or changing a role returns **500 `42P17`** → RLS policy recursion on `profiles`.
- Partners/Volunteers **"Could not find a relationship … and towns" (PGRST200)** → missing `townId` FK.
- Missing **`townId`** column error **`42703`** on a partially-migrated DB → run on a fresh schema.
- Inventory/Reports **fake success** or hardcoded "live" numbers → must be real Supabase data.
- Password rule drift (a "min 6" somewhere) → must be **8–128** everywhere with Show/Hide.
