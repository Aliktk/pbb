# Platform Blueprint - Donor Matching Web + Admin + WhatsApp Bot

A page-by-page reference of the whole solution: what each screen contains, what data sits behind it, how the forms work, and the logic that ties it together. Use it as a concept map for designing a similar digital solution.

**Tech shape:** React + Vite + TypeScript + Tailwind (frontend) · Supabase = Postgres + PostGIS + Storage + Auth + Row-Level Security (backend) · n8n + WhatsApp BSP + Azure OpenAI (the chat assistant). Deployed on Vercel.

**Three surfaces, one database:**
1. Public marketing + registration website
2. Admin operations dashboard (login-gated)
3. WhatsApp AI assistant (reads/writes the same tables)

---

# PART A - PUBLIC WEBSITE (page by page)

### 1. Home `/`
The single-scroll landing page, built from stacked sections:
- **Hero** - headline, short mission line, primary call-to-action buttons (Request Blood / Register as Donor), background art.
- **Quick Stats** - counters (donors, lives touched, cities, events).
- **Province Presence** - where the org operates across the country.
- **Focus Areas** - the pillars of the work (donation, awareness, thalassemia, youth), as icon cards.
- **About** - short "who we are", vision and mission cards, link to the magazine PDF.
- **Leadership** - grid of key people (photo, name, role).
- **Gallery preview** - a few highlight images (feature-flagged).
- **Campaigns** - recent/ongoing campaigns as cards.
- **Blog preview** - latest articles (feature-flagged).
- **Partner logos** - an auto-scrolling ticker of partner/brand marks.
- **Sponsor wall** - a composite image of current sponsors (admin-uploaded).
- **Contact** - quick contact block.
- **Footer** - links, socials, emergency number, big background wordmark, "developed by" credit.
Global: sticky navbar with a "Become A Member" dropdown, floating WhatsApp button.

### 2. About `/about`
Long-form org story: history, mission, vision, the problem being solved, leadership context. Mostly narrative + supporting cards.

### 3. Work / Events `/events` and `/events/:id`
- **List:** past and ongoing campaigns/events as filterable cards (by category, e.g. blood drives, awareness, magazine, conference), each with cover, title, date, location, image count.
- **Detail:** a single event with its gallery and description.

### 4. Blog `/blogs` and `/blogs/:id`
- **List:** a **featured Magazine banner** at the top (opens/downloads the annual magazine PDF), a featured article, then a grid of recent articles (image, category, date, read-time).
- **Detail:** full article (title, meta, HTML body).

### 5. Gallery `/gallery`
Awards / recognition wall (people of the year, category + name + photo), plus the sponsor wall band. Card-grid with hover effects.

### 6. ABC 2026 (Conference) `/abc`
Landing page for the annual event, driven by the "current edition" record:
- Hero with title, theme, dates.
- Highlight cards (When / Where / Day-2 trip).
- "Two days, one mission" plan (Day 1 conference + training, Day 2 trip).
- "What you get" grid (training, networking, adventure, certificate).
- Fee cards (full event vs conference-only), shown only when set.
- Past-event photo gallery (admin-uploaded, shown only when photos exist).
- **Proud Sponsors** media wall.
- Register call-to-action (or "opens soon" if registration is off).

### 7. Contact `/contact`
Contact form (name, email, message) + org contact details, map/address, socials.

### 8. Privacy `/privacy` and Terms `/terms`
Legal text pages.

### 9. 404 `/*`
Friendly not-found with a link home.

---

# PART B - PUBLIC FORMS (the intake surface)

**Shared behavior on every form:** honeypot spam trap + CAPTCHA, phone auto-normalized to +92, city autocomplete, address geocoded to coordinates on submit, consent checkboxes (with policy version stored), optional file uploads to storage, friendly success/error states. A database trigger forces safe values so the public can never self-approve (everything comes in as "pending").

### F1. Register as Donor `/register-donor`
Sections: **Basic** (full name, DOB, gender, blood group, occupation) · **Contact** (phone/WhatsApp, email, city, district, full address) · **Health screening** (donated before, last donation date, weight, chronic disease, medication, recent surgery, vaccination, travel history, pregnancy/breastfeeding) · **Availability** (emergency / camps / both, preferred time) · **Consent** (accuracy, voluntary, contact) + optional blood-report upload + referral code.

### F2. Register as Volunteer `/register-member`
Personal + CNIC + qualification/profession, contact, city/district, interests, prior experience, leadership, skills (social media / design / public speaking), hours per week, willing to travel/lead, motivation questions, unique contribution, policy agreements, CV + photo upload.

### F3. Register as Partner `/register-partner`
Organization details (name, type, registration/license number, year, address, city, province, phone, email, website), focal person (name, designation, phone, email), capabilities (has screening, provides without replacement, monthly volume), partnership types, 3 legal confirmations, certificate + MOU upload.

### F4. Request Blood `/register-requester`
Patient name, requester name, contact/WhatsApp, blood group, units needed, urgency, hospital, city, needed-by date, notes. Generates a request code (e.g. BC-RQ-1006).

### F5. Conference Registration `/register-conference`
Name, email, WhatsApp, attending-from, event type (full / conference-only), blood group, amount sent, paid-from account, **payment screenshot upload**, notes, consent. Shows the payment account details from the current edition.

---

# PART C - ADMIN DASHBOARD (page by page, login-gated)

Layout: left sidebar navigation + top bar, content area with filter bars and data tables. Role-gated (must be an admin).

### A0. Login `/admin/login`
Email/password sign-in (Supabase Auth). Only allow-listed admins get in.

### A1. Overview `/admin`
The command center:
- **Network at a Glance** - headline KPIs (donors, requests, volunteers, partners).
- **Needs Follow-up** - counts of items awaiting action.
- **ABC Conference** - snapshot card with a manage link.
- **Donors by Blood Group** - distribution chart.
- **Live Operations Feed** - recent activity table (event, entity, location, status) from the audit log, with "view all".
Cards link straight into each section.

### A2. Donor Registry `/admin/donors`
The biggest data screen:
- Filters: search (name/phone), blood group, status, city.
- Server-side **pagination** (handles thousands).
- Table columns: name, group, phone, gender, city, district, last-donated, submitted, contacted-back, status, actions.
- Per-row actions: Verify / Activate / Deactivate / Delete (soft).
- **Bulk operations:** checkboxes + "select all N matching this filter" → bulk verify/activate/deactivate/delete server-side (act on the whole filtered set, not just the page).
- **Contacted control:** stamp who contacted the donor and when, with a follow-up note.

### A3. Find Donors `/admin/find-donors`
Operational search for a live need:
- Inputs: blood group, city/area, radius, gender, "use my location".
- Returns eligible donors ranked by distance, with last-donated, city, and a one-tap WhatsApp link.
- Matches by city text AND geo radius (works even when a donor has no coordinates). Paginated results.

### A4. Blood Requests `/admin/requests`
Emergency operations:
- **Active emergencies** shown as priority cards (group, urgency, patient, hospital, city, units).
- **Alert Donors** - auto-finds eligible donors (geo or city), logs them to a relay ledger, and flips the request to "matching".
- Pre-filled **WhatsApp templates** to message the requester or a matched donor.
- Track each donor's response (notified / accepted / declined / donated). Marking "donated" records the donation and sets the donor's cooldown.
- **Fulfill** button, plus a full requests table with filters and pagination.

### A5. Volunteers `/admin/volunteers`
Onboarding CRM:
- A funnel of stages (New → Contacted → Trained → Active → Dropped) shown as clickable count cards.
- Table with training flag, guidance flag, assigned coordinator, last follow-up.
- Inline "Manage" panel to update stage, assignment, training status, and notes. Paginated.

### A6. Partners `/admin/partners`
Organization list with verify/activate/deactivate, contacted tracking, filters, pagination.

### A7. Team `/admin/team`
Manages the leadership shown on the public site:
- Groups like "Board of Governance" and "Core Cabinet".
- Add/edit a member (name, role/designation, photo, social links, short bio).
- "End tenure" moves someone to "past members".

### A8. FAQ `/admin/faq`
Add/edit/remove public FAQ entries (question + answer).

### A9. Settings `/admin/settings`
**Eligibility rules** that drive all matching: min/max age, minimum weight, donation cooldown (days), max active requests, max requests per month, and a toggle for compatible-blood-group matching.

### A10. Manage Admins `/admin/admins`
Change your own password, view admin accounts, invite/allow-list a new admin by email.

### A11. Features `/admin/features`
Toggle **feature flags** on/off without code: blog, gallery, WhatsApp button, and each registration form (donor / volunteer / partner / conference). Lets the org open and close parts of the site.

### A12. ABC Conference `/admin/conference`
Runs the whole event:
- **Current edition editor** - year, title, theme, dates, location, trip, fees, payment account details, registration on/off.
- **Registrations table** - verify payment (open the uploaded screenshot via a secure signed link), confirm or reject seats, confirmed-amount tracking, summary cards (registered / confirmed / awaiting / amount collected). Filters + pagination.
- **Gallery upload** - photos shown on the public ABC page.
- **Sponsor / Media wall upload** - one composite sponsor image per edition, shown on ABC + Home + Gallery.

---

# PART D - DATA MODEL (what is stored)

Grouped by domain (~27 tables):
- **People & orgs:** donors, volunteers, partners, info_requesters (bot requesters), profiles (admin users), admin_emails.
- **Requests & matching:** blood_requests, request_matches (relay ledger), donations (drives cooldown), hospitals, eligibility_settings (singleton rules).
- **WhatsApp / bot:** whatsapp_sessions, otp_verifications, wa_conversations, wa_admin_numbers, chat histories, messages.
- **Content / CMS:** team_members, faqs, testimonials, case_studies, open_roles, feature_flags.
- **Conference:** conference_editions, conference_registrations, conference_gallery.
- **Audit:** audit_log (immutable who/what/when).

Patterns worth copying: status lifecycle (pending → verified → active → inactive), consent-to-contact gate, source field (web / whatsapp / admin), soft-delete, geocoded location (PostGIS point), last-donation-date, and a metadata JSON escape-hatch for fields not yet modeled.

---

# PART E - MATCHING LOGIC (the brain)

- Distance matching via PostGIS, with a city/district text fallback so donors match even without coordinates.
- Eligibility gate: age, weight, cooldown, consent, active status - all configurable from Settings.
- Fair rotation for outreach: prefer the least-contacted donor today, cap daily contacts per donor, never repeat the same donor for one request, skip donors still in cooldown.
- Blood-group compatibility (optionally match compatible groups, not just exact).
- Privacy by design: the matcher returns no personal contact info; the admin app re-fetches it under access control. This blocks scraping/harvesting.
- Safety triggers: force safe values on public inserts, convert lat/lng to a geo point, auto-generate request codes, log everything.

---

# PART F - WHATSAPP AI ASSISTANT (same database)

A conversational agent that can, in plain chat:
- Register donors, volunteers, and partners.
- Capture a blood request and find eligible donors nearby.
- Hand out the next best donor with fair rotation.
- Check a request's status, mark it fulfilled, record a donation.
- Look up a contact, answer FAQs, share team info.
- Enforce admin-only actions and block abusive users.
- Remember conversation context.
Plus a background job that periodically finds pending matches and sends donor-alert messages automatically, with throttling.

---

# PART G - UI / DESIGN SYSTEM

- Colors: brand red, near-black dark, gold accent, white surfaces.
- Shapes: rounded 2xl/3xl cards, pill buttons, soft shadows.
- Motion: subtle scroll-in animations; hover effects limited to real pointer devices (no stuck states on touch).
- Reusable admin building blocks: filter bar, data table + status badges, inline expand/manage panel, contacted control, pagination, bulk-action bar with "select all matching", secure file/receipt viewer, upload widgets.
- Reusable form fields: phone (+92) field, city autocomplete, CNIC field, honeypot, consent blocks, file validation.

---

# PART H - SECURITY & PLATFORM

Row-Level Security everywhere (public can only insert into intake tables; admins read/write), intake triggers, audit log, feature flags for staged rollout, private storage (payment screenshots via signed URLs) vs public storage (gallery/sponsor images), soft-deletes, consent/policy versioning, CAPTCHA + honeypot on forms.

---

# PART I - IDEAS FOR AN IMPROVED ADMIN PANEL

For a fresh build, push the concept further:
1. Live command-center dashboard: open requests, fulfillment rate, average response time, donors ready (past cooldown), today's activity feed.
2. Map view of donors and open requests with radius drawing.
3. Request lifecycle Kanban (open → matching → fulfilled/expired) with SLA timers on emergencies.
4. Bulk actions on every list + a proper CSV import/export UI + donor de-duplicate/merge.
5. Role-based access (super-admin, city coordinator, verifier, read-only), scoped by region.
6. Donor CRM: tags, segments, saved filters, contact history, cooldown countdown, "reachable now" list.
7. Analytics: donations over time, city heatmap, retention, request outcomes.
8. Template & broadcast manager tied to segments (WhatsApp/SMS).
9. Consent & privacy console: export or delete a person's data, consent audit trail.
10. Mobile-first admin, because coordinators work from their phones in the field.

---

*End of blueprint.*
