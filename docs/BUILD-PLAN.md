# PBB — Master Build Plan

Adapts the 8-track / 4-wave structure of `PBB Build Harness.md` §5 to this repository,
with concrete file ownership (so parallel agents never collide) and the gate each track
must pass. This is the plan the orchestrator and every track agent read.

## Repo layout

```
pbb/
  apps/
    api/                 NestJS (TypeScript) — the operational system
    web/                 Next.js App Router — public site + admin + /me
  packages/
    types/               shared DTOs + Zod schemas, generated from Prisma
    ui/                  shared React components ported from the prototype
    config/              eslint / tsconfig / prettier shared config
  docs/                  this plan, the harness prompt, route inventory, track handoffs
  scripts/               harness runner, invariant checks, seed helpers
  _handoff/              the Modernist prototype (reference only — never imported)
  docker-compose.yml     postgres + redis + api + web (single VPS target)
```

## File ownership map (collision-free parallelism)

| Track | Owns (write) | Reads (no write) |
|-------|--------------|------------------|
| T0 | root config, `packages/*`, `apps/api/prisma`, `apps/api/src/main.ts`, seed, docker, CI | — |
| T1 | `apps/api/src/auth`, `apps/api/src/accounts`, `apps/api/src/rbac`, `apps/web/app/(admin)/login` | prisma, types |
| T2 | `apps/api/src/donors`, `apps/api/src/screenings`, `apps/api/src/donations`, `apps/api/src/import` | prisma, types |
| T3 | `apps/api/src/requests`, `apps/api/src/inventory` | prisma, types |
| T4 | `apps/web/app/(public)`, `apps/web/app/me`, `packages/ui/public` | api client, types |
| T5 | `apps/web/app/(admin)/{overview,requests,find,donors,inventory,inbox,ledger,reports,thalassemia,profile,record}` | api, ui |
| T6 | `apps/web/app/(admin)/{accounts,roles,branches,network,data,audit,settings}` | api, ui |
| T7 | `apps/web/app/(admin)/{homepage,pages,announcements,events,media,partners,volunteers}`, `apps/api/src/content` | api, ui |
| T8 | `apps/api/src/notifications`, `apps/api/src/jobs`, `apps/web/app/(admin)/whatsapp`, ops | all |

## Wave 0 — T0 Foundation (blocks everything)

**Scope.** Monorepo + tooling; Prisma schema for every §3 entity; migrations including the
`donor_eligibility` view; seed (14 towns, 6 branches, 8 roles, ~200 donors covering all 7
eligibility cases); Docker Compose; CI (lint + typecheck + test); the shared `types` and
`ui` packages skeleton; the harness runner scripts.

**Gate.**
- [ ] `docker compose up` yields a working API + web.
- [ ] `pnpm --filter api prisma migrate reset` reproduces the seed exactly.
- [ ] `donor_eligibility` returns the correct status for a fixture covering all 7 cases
      (REMOVED, DEFERRED, NEVER_SCREENED, REACTIVE, SCREENING_STALE, COOLDOWN, ELIGIBLE).
- [ ] `pnpm typecheck && pnpm lint && pnpm build` green.
- [ ] `pnpm test:invariants` runs (may be mostly skipped until later tracks, but wired).

## Wave 1 — parallel (needs T0)

**T1 Auth & RBAC.** Sign-in, refresh, forgot/reset, TOTP, guards, permission matrix,
account creation constrained by creator's role+town. No self-registration.
*Gate:* table-driven test proves each of 8 roles reaches exactly its endpoints, 403 elsewhere.

**T2 Donor domain.** CRUD, MR numbering, screening, deferral, donation recording, the
eligibility read-path, emergency search, CSV import with column mapping + duplicate detection.
*Gate:* eligibility status matches the view for a 500-donor fixture across 7 cases;
emergency search p95 < 200ms at 50,000 donors.

**T3 Requests & inventory.** Public intake, branch board, call tracking, stock,
months-of-cover (one source), shortage strip + 48h staleness.
*Gate:* a public request appears on the correct branch board < 1s; cover computed once.

**T4 Public site.** All public pages, EN/UR/PS with RTL, needs board, donor self-service.
*Gate:* Lighthouse ≥ 90 mobile on Home/Request/Needs; all 3 languages no layout break;
a throwing page shows a visible error, never the previous page.

## Wave 2 — parallel (needs T1 + T2)

**T5 Admin operations.** Overview, requests, find, donors, inventory, inbox, registry, ledger.
*Gate:* every dashboard figure traces to one API field; nothing computed client-side.

**T6 Admin organisation.** Accounts/hierarchy, roles, branches, network, settings,
import/export, audit viewer.
*Gate:* creating an account sends an invite and never sets a password; export needs a typed
reason and writes the log.

**T7 Content management.** Homepage composer, pages, announcements, events, media with
consent flags, publishing + version history.
*Gate:* an end-dated announcement disappears itself; a consent-less media asset cannot be
attached to a public page (enforced by API, not the form).

## Wave 3

**T8 Notifications & hardening.** SMS via `NotificationPort`, WhatsApp behind a flag,
nightly backups, rate limiting, pen checks, load testing, deployment runbook.

## What can and cannot be verified in this environment

- **Can:** install, generate, typecheck, lint, build, unit/api tests, run Postgres+Redis via
  Docker, `migrate reset`, seed, eligibility-view fixture, RBAC matrix, most invariants.
- **Needs the client / their machine:** live SMS/WhatsApp (real Twilio + approved WA number),
  the §10 open decisions, real photos/logos, real 2013–2026 donation figures, Lighthouse on a
  real 3G device, production load test at 50k donors on the target VPS.

These are tracked in each track's `BLOCKED` / `ASSUMED` sections, never silently skipped.
