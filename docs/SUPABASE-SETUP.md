# PBB on Supabase + Vercel (the BCP model)

This is the plan we are moving PBB to: the same shape as Blood Chain Pakistan. The Next.js
frontend talks **straight to Supabase** (Auth + PostgREST), and **Row Level Security** enforces
who can see and do what. There is **no separate API server** to host, so the whole thing runs on
Vercel (frontend) + Supabase (database, auth, RLS). The NestJS API in `apps/api` is retired from
the deploy path (kept in git for reference).

```
Browser (Next.js on Vercel)  ->  Supabase  (Auth + Postgres + PostgREST + RLS)
       anon key, RLS-guarded         database, policies, public views
```

## Why the change

BCP works on Vercel with no backend because it has no server - it uses Supabase directly. PBB
was built with a NestJS API server, which needs an always-on host and does not fit Vercel's
serverless model (that is why `pbb-api` on Vercel crashed). Moving to the Supabase-direct model
removes the server entirely.

## What is already in the repo

- `supabase/migrations/0001_supabase_direct.sql` - the security backbone. Creates the `profiles`
  table, identity helpers, **enables RLS on every table** (default deny), adds the exact policies
  the API used to enforce (town scope, role writes, public request intake), and the public
  `public_open_requests` view (no patient names/phones - INV-11) and `donors_with_eligibility`.
- `supabase/migrations/0002_admin_profile.sql` - links the head office admin to a `head` profile.
- `apps/web/lib/supabaseClient.ts` - the browser client.

## Activation checklist (about 10 minutes, one time)

1. **Get the correct API keys.** Supabase Dashboard -> Project `bprydfcigatfbahcyhpp` -> Settings
   -> API. Copy:
   - Project URL: `https://bprydfcigatfbahcyhpp.supabase.co`
   - `anon` / publishable key (NOT the service_role key).
   > The keys currently in `.env` are stale (the NestJS path only used the database password, so
   > the REST keys were never real). Use the ones from the dashboard.

2. **Apply the migrations.** Dashboard -> SQL Editor -> paste and run, in order:
   - `supabase/migrations/0001_supabase_direct.sql`
   - (later, after step 3) `supabase/migrations/0002_admin_profile.sql`
   Then Dashboard -> Advisors -> Security: confirm no "RLS disabled" warnings remain.

3. **Create the admin login.** Dashboard -> Authentication -> Users -> Add user:
   - email `admin@pashtoonkhwabloodbank.org`, set a password, tick "Auto confirm".
   Then run `0002_admin_profile.sql` (step 2) to give that user the head-office profile.

4. **Local env.** Create `apps/web/.env.local`:
   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://bprydfcigatfbahcyhpp.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<the anon key from step 1>
   ```

5. **Vercel (web).** Project Settings:
   - **Root Directory** = `apps/web` (this is what fixes the "No Next.js detected" build error).
   - Environment Variables: add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Redeploy.

6. **Delete the `pbb-api` Vercel project** - it tried to run the NestJS server on Vercel and
   crashes. It is not used in this model.

## What still needs building (the frontend rewire)

The data layer is being switched from the NestJS client (`lib/api.ts`) to Supabase. Remaining
work, page by page (each is a `supabase.from(...)` / `supabase.auth` call):

- `lib/auth.tsx` -> Supabase Auth (`signInWithPassword`, `getSession`, `onAuthStateChange`) +
  read the row from `profiles` for role/town.
- `admin/login` -> `supabase.auth.signInWithPassword`.
- `admin/requests` -> `supabase.from('blood_requests')` (select + update status).
- `admin/donors` + `admin/find` -> `supabase.from('donors_with_eligibility')`.
- public request form -> `supabase.from('blood_requests').insert(...)`.
- `/needs` -> `supabase.from('public_open_requests').select()`.
- towns dropdowns -> `supabase.from('towns').select('id,name')`.

The RLS policies above are written to match exactly these calls, so the frontend does not need
any permission logic of its own - Supabase enforces it.
