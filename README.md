# Pashtoonkhwa Blood Bank — Platform

An operational blood-bank system that also publishes a website. A coordinator uses it at
three in the morning to find someone who can give O− in Quetta. It replaces a paper Donor
Diary kept since 24 March 1999 across fourteen towns in Balochistan.

> Spec: [`docs/PBB Build Harness.md`](<docs/PBB Build Harness.md>) (what & why) ·
> Plan: [`docs/BUILD-PLAN.md`](docs/BUILD-PLAN.md) ·
> Deployment: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).
> The design source is the prototype in `_handoff/modernist/project/`.

---

## Stack

- **Web** — Next.js 15 (App Router, TypeScript) — public site + admin panel + donor self-service
- **API** — NestJS (TypeScript)
- **Database** — PostgreSQL via **Prisma** (Supabase in production, Docker locally)
- **Monorepo** — pnpm workspaces: `apps/web`, `apps/api`, `packages/types`

## What's built

- **Web (62 routes, design complete):** the full public website (25 pages), donor
  self-service (`/me`), and the complete admin panel (30 screens) — pixel-ported from the
  prototype. Interactive (nav, forms with success states, filters, detail sheets, role
  switcher). Currently renders sample data; wiring to the API is the next step.
- **Database:** Prisma schema for every entity (frozen), migrations including the
  `donor_eligibility` view and the append-only `audit_log` guard, and a 200-donor seed
  covering all seven eligibility states.
- **API:** NestJS scaffold with a Prisma module, `/health` (DB round-trip), and the
  `NotificationPort` / `StoragePort` interfaces. Feature modules land per the build plan.

---

## Prerequisites

- **Node.js ≥ 20** (tested on 24) and **pnpm ≥ 9** (`corepack enable` gives you pnpm)
- **One database**, either:
  - **Supabase** (recommended — used in production), or
  - **Docker Desktop** (for a local Postgres + Redis)

## Run it locally

### 1. Install

```bash
pnpm install
```

### 2. Configure the database

Create a `.env` in the repo root. Pick ONE of the two setups:

**A) Supabase (recommended).** From your Supabase project → *Settings → Database →
Connection string*, take the **pooled** URL (port 6543) for `DATABASE_URL` and the
**direct** URL (port 5432) for `DIRECT_URL`:

```dotenv
DATABASE_URL="postgresql://postgres.<ref>:<pw>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.<ref>:<pw>@aws-0-<region>.pooler.supabase.com:5432/postgres"
JWT_ACCESS_SECRET="change-me-32-chars-minimum"
JWT_REFRESH_SECRET="change-me-32-chars-minimum"
CORS_ORIGINS="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
```

> Both URLs are required — Prisma uses the pooled one at runtime and the direct one for
> migrations. See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for why.

**B) Local Docker Postgres.** Run `node scripts/setup-local-env.mjs` to write a ready `.env`,
then start the database (published on **5433** to avoid a clash with any native Postgres on
5432):

```bash
docker compose up -d db redis
```

### 3. Set up the schema + seed

```bash
pnpm --filter @pbb/api prisma:generate          # generate the Prisma client
pnpm --filter @pbb/api exec prisma migrate deploy --schema prisma/schema.prisma
pnpm db:seed                                     # 14 towns · 6 branches · 8 roles · 200 donors
```

> If Prisma can't find your `.env` (it loads it from the working directory), run these from
> the repo root — the commands above already target the API's schema.

### 4. Start the apps

```bash
pnpm dev            # web on :3000, api on :4000 (parallel)
# or individually:
pnpm --filter @pbb/web dev
pnpm --filter @pbb/api dev
```

- **Website:** http://localhost:3000
- **Admin:** http://localhost:3000/admin/login — for the demo, tap any account to fill the
  form and sign in (real auth arrives with the API wiring)
- **Donor self-service:** http://localhost:3000/me/signin
- **API health:** http://localhost:4000/api/v1/health → `{"ok":true,"data":{"db":"up"}}`

---

## Verify it's error-free

```bash
pnpm typecheck          # all workspaces — 0 errors
pnpm lint               # ESLint (flat config) across the monorepo — clean
pnpm build              # builds api (NestJS) + web (Next.js)
pnpm test:invariants    # the §7 invariant checks (INV-1 … INV-12)
```

All four are green on the current tree. `pnpm verify` runs the whole battery at once.

## Project structure

```
apps/
  web/        Next.js — app/(public) marketing site, app/me self-service, app/admin panel
  api/        NestJS — src/ modules, prisma/ (schema, migrations, seed)
packages/
  types/      shared Zod DTOs + the shared eligibility-state list
docs/         harness spec, build plan, route inventory, deployment guide, track handoffs
scripts/      harness runner, invariant checks, local-env setup
_handoff/     the Modernist design prototype (reference only)
```

## Deployment

**Supabase (Postgres + Storage) + Vercel (web).** Set Vercel's root directory to `apps/web`,
build command `pnpm --filter @pbb/web build`. The API runs on any always-on Node host
(Railway/Render/Fly). Full details, including media storage and the audit-log role hardening
step, are in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Troubleshooting

- **`P1000 authentication failed` locally** — a native Postgres is likely on port 5432.
  Docker Postgres here is published on **5433**; make sure your `.env` matches, or stop the
  native service.
- **Prisma "environment variable not found: DATABASE_URL"** — Prisma loads `.env` from the
  current directory. Run Prisma commands from the repo root (where `.env` lives).
- **Prisma + Supabase prepared-statement errors** — ensure `DATABASE_URL` (the pooled URL)
  ends with `?pgbouncer=true&connection_limit=1`.

## Ethical constraints (encoded, not conventions — Harness §1)

Blood is never sold · thalassemia children are free & without exchange · a donor's phone is
visible only to their branch + head office · removal is same-day, no reason asked · a child's
photo needs signed consent on file · delete/export/consent each require a typed reason written
to an append-only log.
