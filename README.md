# Pashtoonkhwa Blood Bank — Platform

An operational blood-bank system that also publishes a website. A coordinator uses it at
three in the morning to find someone who can give O− in Quetta. It replaces a paper Donor
Diary kept since 24 March 1999 across fourteen towns in Balochistan.

> Spec: [`docs/PBB Build Harness.md`](<docs/PBB%20Build%20Harness.md>) (what & why).
> Design: `_handoff/modernist/project/` (the prototype — how it looks & reads).
> Plan: [`docs/BUILD-PLAN.md`](docs/BUILD-PLAN.md) · Prompt: [`docs/HARNESS-MODE-PROMPT.md`](docs/HARNESS-MODE-PROMPT.md).

## Stack

- **API** — NestJS (TypeScript) · **DB** — PostgreSQL via **Prisma** · **Web** — Next.js (App Router)
- **Deploy** — Supabase (Postgres + Storage) + Vercel (web); API on an always-on Node host.
  See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).
- Monorepo: `apps/api`, `apps/web`, `packages/types`, `packages/ui`.

## Quick start (local)

```bash
node scripts/setup-local-env.mjs      # writes .env (Docker Postgres on :5433)
pnpm install
docker compose up -d db redis         # local Postgres + Redis
pnpm --filter @pbb/api prisma:generate
pnpm --filter @pbb/api prisma migrate deploy
pnpm db:seed                          # 14 towns · 6 branches · 8 roles · 200 donors
pnpm dev                              # api :4000  ·  web :3000
```

> Postgres is published on **5433** because a native Postgres often occupies 5432.

## The harness

Every track runs the loop in Harness §6 (READ → PLAN → BUILD → VERIFY → AUDIT → DECIDE →
HAND OFF) until its gate passes. Run the battery any time:

```bash
pnpm verify              # runs the whole battery, stops on first failure
pnpm test:invariants     # the §7 invariant checks (INV-1 … INV-12)
```

## Status

- **Wave 0 (T0 Foundation): built & verified.** Schema (every entity, frozen), migrations,
  the `donor_eligibility` view (proven to return all 7 states), append-only `audit_log`
  (proven to refuse UPDATE/DELETE), seed, Docker, CI, shared types. See
  [`docs/tracks/T0.md`](docs/tracks/T0.md).
- **Wave 1–3:** briefed and ready in [`docs/tracks/WAVE-BRIEFS.md`](docs/tracks/WAVE-BRIEFS.md).

## Ethical constraints (encoded, not conventions — Harness §1)

Blood is never sold · thalassemia children are free & without exchange · a donor's phone is
visible only to their branch + head office · removal is same-day, no reason asked · a child's
photo needs signed consent on file · delete/export/consent each require a typed reason written
to an append-only log.
