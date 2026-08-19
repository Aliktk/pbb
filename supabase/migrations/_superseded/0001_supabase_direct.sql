-- PBB - Supabase-direct backend (BCP model).
-- Turns the Prisma-created schema into a safe frontend-facing API: Supabase Auth is the
-- identity provider, a profiles table maps each auth user to a role + town, and Row Level
-- Security (RLS) enforces every rule the NestJS API used to. The browser talks straight to
-- PostgREST with the anon key; RLS is what makes that safe.
--
-- Apply once in the Supabase SQL editor (or: supabase db push), then run the admin setup.
-- Idempotent: safe to re-run.

begin;

-- ─────────────────────────────── Profiles ─────────────────────────────────
-- One row per staff account, linked to auth.users. town_id NULL = head office (all towns).
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null default '',
  email      text,
  role_key   text not null default 'viewer',   -- head | manager | coordinator | clerk | lab | editor | viewer
  town_id    text references public.towns(id),
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─────────────────────── Identity helper functions ────────────────────────
-- SECURITY DEFINER so a policy can read the caller's own profile without recursing into
-- profiles RLS. search_path pinned to public for safety.
create or replace function public.current_town_id() returns text
  language sql stable security definer set search_path = public as $$
  select town_id from public.profiles where id = auth.uid() and is_active
$$;

create or replace function public.is_staff() returns boolean
  language sql stable security definer set search_path = public as $$
  select coalesce((select is_active from public.profiles where id = auth.uid()), false)
$$;

-- Head office: an active profile with no town pin sees every town.
create or replace function public.is_head() returns boolean
  language sql stable security definer set search_path = public as $$
  select coalesce((select is_active and town_id is null from public.profiles where id = auth.uid()), false)
$$;

create or replace function public.has_role(variadic roles text[]) returns boolean
  language sql stable security definer set search_path = public as $$
  select coalesce((select is_active and role_key = any(roles) from public.profiles where id = auth.uid()), false)
$$;

-- Same-town test that head office always passes.
create or replace function public.in_scope(row_town text) returns boolean
  language sql stable security definer set search_path = public as $$
  select public.is_head() or row_town = public.current_town_id()
$$;

-- ───────────── DB-side defaults for app-generated ids/timestamps ───────────
-- Prisma generated ids/updatedAt in application code, so the columns have no DB default.
-- Direct PostgREST inserts need them, so add defaults (existing rows are untouched).
alter table public.blood_requests alter column id set default replace(gen_random_uuid()::text, '-', '');
alter table public.donors        alter column id set default replace(gen_random_uuid()::text, '-', '');
alter table public.donors        alter column "updatedAt" set default now();

create or replace function public.touch_updated_at() returns trigger
  language plpgsql as $$ begin new."updatedAt" = now(); return new; end $$;
drop trigger if exists donors_touch_updated_at on public.donors;
create trigger donors_touch_updated_at before update on public.donors
  for each row execute function public.touch_updated_at();

-- ───────────────── Lock everything down (default deny) ─────────────────────
-- Enable RLS on every public table. With no permissive policy a table is service-role only,
-- so nothing (users, audit_log, tokens, ...) is exposed until a policy below opts it in.
do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', r.tablename);
  end loop;
end $$;

-- ───────────────────────────── Policies ───────────────────────────────────

-- profiles: a user reads their own; head office reads all. Writes go through service role.
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_head());

-- towns: public reference data, readable by anyone (anon + signed in).
grant select on public.towns to anon, authenticated;
drop policy if exists towns_read on public.towns;
create policy towns_read on public.towns for select to anon, authenticated using (true);

-- donors: staff only, confined to their town; only some roles may write.
grant select, insert, update on public.donors to authenticated;
drop policy if exists donors_read on public.donors;
create policy donors_read on public.donors for select to authenticated
  using (public.is_staff() and "deletedAt" is null and public.in_scope("townId"));
drop policy if exists donors_write on public.donors;
create policy donors_write on public.donors for insert to authenticated
  with check (public.has_role('head','manager','clerk') and public.in_scope("townId"));
drop policy if exists donors_update on public.donors;
create policy donors_update on public.donors for update to authenticated
  using (public.has_role('head','manager','clerk') and public.in_scope("townId"))
  with check (public.in_scope("townId"));

-- screenings: staff read/write for donors in their scope.
grant select, insert on public.screenings to authenticated;
drop policy if exists screenings_read on public.screenings;
create policy screenings_read on public.screenings for select to authenticated
  using (public.is_staff() and exists (
    select 1 from public.donors d where d.id = screenings."donorId" and public.in_scope(d."townId")));
drop policy if exists screenings_write on public.screenings;
create policy screenings_write on public.screenings for insert to authenticated
  with check (public.has_role('head','manager','lab') and exists (
    select 1 from public.donors d where d.id = screenings."donorId" and public.in_scope(d."townId")));

-- blood_requests: the public can CREATE a request (the website form); staff read/act, scoped.
grant select, insert, update on public.blood_requests to anon, authenticated;
drop policy if exists requests_public_insert on public.blood_requests;
create policy requests_public_insert on public.blood_requests for insert to anon, authenticated
  with check (status = 'OPEN' and source = 'PUBLIC_FORM' and "unitsNeeded" between 1 and 20);
drop policy if exists requests_staff_read on public.blood_requests;
create policy requests_staff_read on public.blood_requests for select to authenticated
  using (public.is_staff() and public.in_scope("townId"));
drop policy if exists requests_staff_update on public.blood_requests;
create policy requests_staff_update on public.blood_requests for update to authenticated
  using (public.has_role('head','manager','coordinator') and public.in_scope("townId"))
  with check (public.in_scope("townId"));

-- ───────────── Public "who needs blood now" board (no PII) ─────────────────
-- A SECURITY DEFINER view: it bypasses blood_requests RLS but exposes ONLY safe columns and
-- only open requests, so the public never sees a patient name or a phone number (INV-11).
create or replace view public.public_open_requests
  with (security_invoker = off) as
  select
    r.reference,
    r."bloodGroup"::text || case when r."rhFactor" = 'NEGATIVE' then '−' else '+' end as group,
    r."bloodGroup",
    r."rhFactor",
    r."unitsNeeded",
    r.urgency,
    r.status,
    r."createdAt",
    t.name as town
  from public.blood_requests r
  join public.towns t on t.id = r."townId"
  where r.status in ('OPEN', 'ARRANGING');
grant select on public.public_open_requests to anon, authenticated;

-- ───────────── Staff donor list with eligibility (RLS-scoped) ──────────────
-- security_invoker = on so the caller's donors RLS applies: a branch sees only its own town.
alter view public.donor_eligibility set (security_invoker = on);
grant select on public.donor_eligibility to authenticated;

create or replace view public.donors_with_eligibility
  with (security_invoker = on) as
  select
    d.id, d."mrNo", d.name, d.phone, d."townId",
    d."bloodGroup"::text || case when d."rhFactor" = 'NEGATIVE' then '−' else '+' end as group,
    d."bloodGroup", d."rhFactor",
    d."lastDonatedAt", d."timesDonated", d."consentToCall",
    t.name as town,
    coalesce(e.status, 'NEVER_SCREENED') as eligibility
  from public.donors d
  join public.towns t on t.id = d."townId"
  left join public.donor_eligibility e on e.id = d.id
  where d."deletedAt" is null;
grant select on public.donors_with_eligibility to authenticated;

commit;
