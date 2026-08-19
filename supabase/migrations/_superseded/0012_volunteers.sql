-- PBB - wire the Volunteers domain to Supabase-direct (BCP model).
-- The admin Volunteers page reads/writes volunteers straight from PostgREST with the anon key;
-- RLS (enabled default-deny in 0001) is what makes that safe. This migration only ADDS the grants,
-- policies, and DB-side defaults the domain needs - it does not widen anything else.
--
-- Scoping mirrors donors (0001/0007): a branch sees and edits only its own town's volunteers;
-- head office (a profile with town_id NULL) sees and edits every town. The volunteers.status enum
-- (VolunteerStatus: APPLIED | ACTIVE | INACTIVE) drives the page's new/contacted/active pipeline.
-- Idempotent: safe to re-run. Apply in the Supabase SQL editor (or via the apply-sql script).

begin;

-- ───────────── DB-side defaults for app-generated ids ───────────────────────
-- Prisma generated the cuid id in application code, so the column has no DB default. A direct
-- PostgREST insert needs one (existing rows are untouched). Matches the donors id pattern in 0001.
-- volunteers has no @updatedAt column, so no touch trigger is required. townId is already nullable
-- in the schema (String?), so no NOT NULL to relax and no branch FK to collect.
alter table public.volunteers alter column id set default replace(gen_random_uuid()::text, '-', '');

-- ─────────────────────────────── Grants ────────────────────────────────────
grant select, insert, update, delete on public.volunteers to authenticated;

-- ─────────────────────────────── Policies ──────────────────────────────────
-- read: any staff in scope (head office reads all). Filters on the town the volunteer belongs to.
drop policy if exists volunteers_read on public.volunteers;
create policy volunteers_read on public.volunteers for select to authenticated
  using (public.is_head() or (public.is_staff() and public.in_scope("townId")));

-- write (insert): the roles that run the volunteer programme, confined to their town.
drop policy if exists volunteers_write on public.volunteers;
create policy volunteers_write on public.volunteers for insert to authenticated
  with check (public.has_role('head','manager','clerk','volunteer') and public.in_scope("townId"));

-- update: same roles, same scope. WITH CHECK keeps an edited row inside the caller's town.
drop policy if exists volunteers_update on public.volunteers;
create policy volunteers_update on public.volunteers for update to authenticated
  using (public.has_role('head','manager','clerk','volunteer') and public.in_scope("townId"))
  with check (public.in_scope("townId"));

-- delete: same roles, same scope.
drop policy if exists volunteers_delete on public.volunteers;
create policy volunteers_delete on public.volunteers for delete to authenticated
  using (public.has_role('head','manager','clerk','volunteer') and public.in_scope("townId"));

commit;
