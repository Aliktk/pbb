# PBB — Route & Screen Inventory

Extracted from the Modernist prototype (`_handoff/modernist/project/*.js`). This is the
bound list INV-9 and the E2E suite iterate over. Every row must render in EN/UR/PS at
data sizes 0/1/many, and every control on it must change state or not render.

## Public site (`apps/web` — Server Components, `next-intl`)

| Route | Screen | Source | Notes |
|-------|--------|--------|-------|
| `/` | Home | pbb-pages.js | hero, live stock strip, pillars, chart, closer |
| `/problem` | The twelve gaps | pbb-pages2.js | INV-4: no hardcoded numbers beside charts |
| `/about` | Our story (since 1999) | pbb-pages2.js | timeline; §10 founder/ledger gaps |
| `/people` | Leadership | pbb-pages2.js | §10 Olus Yar title/bio pending |
| `/supporters` | Who stands with us | pbb-pages2.js | logos empty until assets given |
| `/branches` | 6 offices, 14 towns | pbb-pages2.js | reads Town/Branch tables |
| `/services` | What we provide | pbb-pages2.js | screened blood on exchange |
| `/thalassemia` | Free for children | pbb-pages2.js | ethical constraint #2 |
| `/join` | Five ways to take part | pbb-pages.js | hub |
| `/needs` | Open requests, no names | pbb-app.js | INV-11: no patient names |
| `/join/requester` | Request blood | pbb-forms.js | public, rate-limited, honeypot+captcha |
| `/join/donor` | Register as donor | pbb-forms.js | §10: public self-register? |
| `/join/volunteer` | Volunteer | pbb-forms.js | |
| `/join/partner` | Partner organisation | pbb-forms.js | |
| `/join/organisation` | Register an organisation | pbb-forms.js | bring a branch to a town |
| `/partners` | Work with us | pbb-pages2.js | |
| `/donate` | Donate (transfer/Zakat/hides) | pbb-pages2.js | never sells blood (constraint #1) |
| `/gallery` | Photos & videos | pbb-pages2.js | media library; consent-gated |
| `/news` | Announcements & events | pbb-pages2.js | end-dated items auto-expire |
| `/publications` | Posters, appeals, reports | pbb-pages2.js | |
| `/faq` | Questions | pbb-pages2.js | |
| `/contact` | Contact | pbb-pages2.js | |
| `/privacy` | Privacy | pbb-pages2.js | §10: signing entity |
| `/terms` | Terms | pbb-pages2.js | |
| `/branch/:id` | Public branch board | pbb-app.js | open requests for one town |

## Donor self-service (`/me` — phone + OTP)

| Route | Screen | Source |
|-------|--------|--------|
| `/me/signin` | Sign in with phone | pbb-me.js |
| `/me/code` | Enter OTP | pbb-me.js |
| `/me` | My record | pbb-me.js |
| `/me/remove` | Remove me (same day) | pbb-me.js — constraint #4 |

## Admin (`apps/web` — Client Components, JWT, RBAC)

| Route | Screen | Source | Owning track |
|-------|--------|--------|--------------|
| `/admin/login` | Login | pbb-pages.js | T1 |
| `/admin/forgot` | Forgot password | pbb-app.js | T1 |
| `/admin/sent` | Reset sent | pbb-app.js | T1 |
| `/admin/overview` | Dashboard | pbb-admin.js | T5 |
| `/admin/requests` | Requests board | pbb-admin.js | T5 (data T3) |
| `/admin/find` | Find eligible donors | pbb-admin.js | T5 (data T2) |
| `/admin/donors` | Donor registry | pbb-admin.js | T5 (data T2) |
| `/admin/thalassemia` | Thalassemia patients | pbb-admin4.js | T5 |
| `/admin/inventory` | Stock / months of cover | pbb-admin2.js | T5 (data T3) |
| `/admin/inbox` | Message inbox | pbb-admin2.js | T5 |
| `/admin/sent` (msgs) | Sent messages | pbb-admin5.js | T5 |
| `/admin/whatsapp` | WhatsApp board | pbb-admin5.js | T8 |
| `/admin/ledger` | Donations ledger | pbb-admin3.js | T5 |
| `/admin/reports` | Reports | pbb-admin3.js | T5 |
| `/admin/audit` | Audit log viewer | pbb-admin4.js | T6 |
| `/admin/accounts` | Accounts & hierarchy | pbb-admin3.js | T6 |
| `/admin/roles` | Roles & permissions | pbb-admin4.js | T6 |
| `/admin/branches` | Branches | pbb-admin2.js | T6 |
| `/admin/network` | Network (town health) | pbb-admin2.js | T6 |
| `/admin/data` | Import / export | pbb-admin4.js | T6 (import T2) |
| `/admin/homepage` | Homepage composer | pbb-admin5.js | T7 |
| `/admin/pages` | Pages CMS | pbb-admin5.js | T7 |
| `/admin/announcements` | Announcements | pbb-admin4.js | T7 |
| `/admin/events` | Events | pbb-admin4.js | T7 |
| `/admin/media` | Media + consent flags | pbb-admin4.js | T7 |
| `/admin/partners` | Partners admin | pbb-admin5.js | T7 |
| `/admin/volunteers` | Volunteers admin | pbb-admin5.js | T7 |
| `/admin/settings` | Settings | pbb-admin4.js | T6 |
| `/admin/profile` | My profile | pbb-admin4.js | T5 |
| `/admin/record` | Donor detail (staff) | pbb-admin.js | T5 |

**Totals:** 25 public routes · 4 self-service · 30 admin = **59 screens**.

## Gaps found in the design phase (to be ADDED, per your authority)

1. **Password-reset landing** (`/admin/reset?token=`) — prototype has "forgot" + "sent"
   but no reset-with-token screen. §4 defines `POST /auth/reset-password`. **Add it.**
2. **Two-factor verify screen** — §4 has `POST /auth/two-factor/verify`; no UI. **Add it.**
3. **Account invitation acceptance** (`/admin/accept?token=`) — §8 journey 3 ("receives a
   link, sets their own password") has no screen. **Add it.**
4. **403 / forbidden screen** distinct from 404 — INV-10 implies it. **Add it.**
5. **Global error boundary screen** — INV-7 requires a visible error state per page. **Add it.**
6. **Offline / connectivity banner** — stack §2 assumes patchy connectivity. **Add it.**
7. **`/me` OTP resend + rate-limit state** — implied by phone+OTP, not drawn. **Add it.**
8. **Consent-form upload screen for thalassemia photos** (constraint #5) — referenced,
   not drawn. **Add it.**
