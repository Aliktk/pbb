# PBB — Deployment & Environment (Supabase + Vercel)

The Harness doc (§2) originally targeted Docker Compose on a single VPS. The chosen
deployment is **Supabase (Postgres + Storage) + Vercel (Next.js)**. Docker Compose is
retained for the **local dev loop only** (fast Postgres + Redis without cloud round-trips).
Prisma is the schema authority in every environment — the migration history is the audit
trail of the schema, and it runs identically against local Docker and against Supabase.

## Topology

| Concern | Local dev | Production |
|---------|-----------|------------|
| Postgres | Docker `db` service | Supabase Postgres |
| Migrations | `prisma migrate dev` → local | `prisma migrate deploy` → Supabase (via `DIRECT_URL`) |
| Runtime DB connection | direct `:5432` | **pooled** `:6543` (`?pgbouncer=true&connection_limit=1`) |
| Redis / queues | Docker `redis` | Upstash (serverless Redis, Vercel-friendly) |
| Web (Next.js) | `next dev` | **Vercel** |
| API (NestJS) | `nest start` | see "API hosting" below |
| Media / files | local filesystem | **Supabase Storage** (`pbb-media` bucket) |

## Prisma + Supabase (the part that must be exactly right)

Supabase serves connections through a pooler. Prisma needs BOTH:

- `DATABASE_URL` → **pooled** (`...pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`)
  — used by the app at runtime. `pgbouncer=true` disables prepared statements that break
  under transaction pooling.
- `DIRECT_URL` → **direct** (`...pooler.supabase.com:5432/postgres`) — used by
  `prisma migrate` / `prisma db push` / introspection, which need a real session.

Both are wired in `apps/api/prisma/schema.prisma` (`url` + `directUrl`). Never run
migrations through the pooled URL.

## API hosting — decision needed (recorded as OPEN)

NestJS has background workers (BullMQ: SMS, WhatsApp, nightly backups, screening-expiry
sweeps — Harness §2). Those need a persistent process, which Vercel's serverless model
does not provide. Two viable paths, both keep Web on Vercel + DB on Supabase:

1. **API on a small always-on Node host** (Railway / Render / Fly.io / a tiny VM).
   Cleanest fit for NestJS + BullMQ. **Recommended.**
2. **API as Vercel serverless** (NestJS via serverless adapter) + move scheduled jobs to
   **Supabase `pg_cron` + Edge Functions** or **Vercel Cron**. Works, but splits the job
   logic out of Nest.

This is an OPEN decision for the client (see `docs/tracks/T0.md` BLOCKED). The code is
written host-agnostically (12-factor env, no hard filesystem assumptions) so either path
works without a rewrite. Default assumption until answered: **path 1**.

## Media storage — `StoragePort`

`STORAGE_DRIVER` selects the backend behind one interface (`apps/api/src/storage`):

- `supabase` — Supabase Storage bucket. **Default in prod** (sits next to the DB, free tier).
- `cloudinary` — when images get heavy / need transforms (generous free tier).
- `uploadthing` — simple free file host, good DX with Next.js.
- `local` — filesystem, dev only.

Consent rules are enforced above the port: a `MediaAsset` without `hasConsent` cannot be
attached to a public page regardless of backend (T7 gate, constraint #5).

**Decision (current): Supabase Storage now, Cloudinary later.** Supabase Storage covers media
on the free tier and sits next to the database, so there is no second account to manage while
image volume is low. Because everything goes through `StoragePort`, moving to **Cloudinary**
later (for heavy image loads or on-the-fly transforms) is a one-line change —
`STORAGE_DRIVER=cloudinary` plus `CLOUDINARY_URL` — with no code refactor. Adding it now would
be premature.

## Domain

**None yet.** Until a domain is bought, the app runs on the default **`*.vercel.app`** URL
(web) and the API host's URL. Only two values are domain-coupled — `NEXT_PUBLIC_API_URL` and
`CORS_ORIGINS` — plus Vercel's own domain setting. Nothing in the code hard-codes a domain, so
adding one later is a config change, not a code change.

## Environment variables

The full annotated list lives in `.env.example` (git-ignored real values go in `.env`).
Because the tooling sandbox blocks `.env*`, generate your local file with:

```bash
node scripts/setup-local-env.mjs      # writes .env from the documented template
```

Required in every environment: `DATABASE_URL`, `DIRECT_URL`, `JWT_ACCESS_SECRET`,
`JWT_REFRESH_SECRET`. Required in prod additionally: `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `REDIS_URL`, notification + storage credentials.

## Audit-log role hardening (INV-12, defense in depth)

Migration `002` installs triggers that make `audit_log` append-only for **every** role
(UPDATE/DELETE/TRUNCATE are refused) — that is the enforced guarantee and it always applies.
As a second layer, revoke mutating grants from the runtime app role so an injection path
cannot even attempt them. This is an explicit one-time provisioning step (not in the
migration, which would silently skip when the role is absent):

```bash
psql "$DIRECT_URL" -v app_role=<your-app-role> -f apps/api/prisma/sql/harden-audit-role.sql
```

On Supabase, run that SQL in the SQL editor with the role behind your `DATABASE_URL`. It
fails loudly if the role does not exist, so it can never give a false sense of security.

## CORS

Set `CORS_ORIGINS` to the exact web origin(s), comma-separated (e.g.
`https://pbb.vercel.app`). The API refuses to boot in production if it is unset, and rejects
`*` (a wildcard origin with credentials is unsafe). Locally it defaults to
`http://localhost:3000`.

## Vercel notes

- Root is the monorepo; set Vercel **Root Directory** to `apps/web`, build command
  `pnpm --filter @pbb/web build`, install `pnpm install`.
- `NEXT_PUBLIC_API_URL` points at the deployed API base (`/api/v1`).
- Public site pages are Server Components (fast on 3G, indexable — Harness §2).
