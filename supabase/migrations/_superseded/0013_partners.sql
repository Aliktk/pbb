-- PBB - wire the Partners domain (and network town create/edit) to Supabase-direct (BCP model).
-- The admin Partners page reads/writes partners straight from PostgREST with the anon key; RLS
-- (enabled default-deny in 0001) is what makes that safe. This migration only ADDS the grants,
-- policies, extra columns, and DB-side defaults the domain needs - it does not widen anything else.
--
-- Partners are ORG-WIDE, not town-scoped. The Partner model's townId is nullable (String?) and the
-- real data has entries that belong to no single town (e.g. "Pashtoonkhwa Regional"). Scoping an
-- org-wide row by in_scope("townId") would hide every null-town partner from every branch, so the
-- domain follows the org-wide rule from the task: read = any active staff; write = head/manager.
--
-- The old page smuggled status / coordinator / note / town into the free-text `contact` column with
-- a "::STATUS=" encoding. This migration adds those as real, first-class columns so the data model
-- is honest and the page can drop the fragile string codec. kindLabel keeps the page's richer set of
-- categories (Welfare society, University, ...) which do not all exist in the narrow PartnerKind enum.
--
-- Idempotent: safe to re-run. Apply in the Supabase SQL editor (or via the apply-sql script).

begin;

-- ───────────── Extra partner columns (real, defaulted, nullable) ─────────────
-- All new columns are nullable or defaulted, so adding them never breaks existing rows and a direct
-- PostgREST insert can omit them. status defaults to 'active' to match the page's create default.
alter table public.partners add column if not exists status      text not null default 'active';
alter table public.partners add column if not exists coordinator text;
alter table public.partners add column if not exists note        text;
alter table public.partners add column if not exists email       text;
alter table public.partners add column if not exists "kindLabel" text;

-- Guard the status vocabulary at the database, not just in the UI (the page only ever writes these).
alter table public.partners drop constraint if exists partners_status_check;
alter table public.partners add constraint partners_status_check
  check (status in ('active', 'pending', 'declined'));

-- ───────────── DB-side default for the app-generated id ─────────────────────
-- Prisma generated the cuid id in application code, so the column has no DB default. A direct
-- PostgREST insert needs one (existing rows are untouched). Matches the donors/volunteers pattern.
-- partners has no @updatedAt column, so no touch trigger is required.
alter table public.partners alter column id set default replace(gen_random_uuid()::text, '-', '');

-- ─────────────────────────────── Grants ────────────────────────────────────
grant select, insert, update, delete on public.partners to authenticated;

-- ─────────────────────────────── Policies ──────────────────────────────────
-- read: any active staff (org-wide directory, no town scoping).
drop policy if exists partners_read on public.partners;
create policy partners_read on public.partners for select to authenticated
  using (public.is_staff());

-- write (insert): only head office and managers curate the partner directory.
drop policy if exists partners_write on public.partners;
create policy partners_write on public.partners for insert to authenticated
  with check (public.has_role('head', 'manager'));

-- update: same roles. Covers edit + approve/decline (status change).
drop policy if exists partners_update on public.partners;
create policy partners_update on public.partners for update to authenticated
  using (public.has_role('head', 'manager'))
  with check (public.has_role('head', 'manager'));

-- delete: same roles.
drop policy if exists partners_delete on public.partners;
create policy partners_delete on public.partners for delete to authenticated
  using (public.has_role('head', 'manager'));

-- ───────────── Network page: head office creates / renames towns ────────────
-- The network page lets head office add and edit towns. towns already has (from 0001) a public
-- SELECT policy, and (from 0006) a column-scoped UPDATE grant limited to address/phones/email/bank
-- with a per-town policy (head any, manager own). Two things are still missing for this page:
--
-- 1. INSERT: no policy exists, so nobody can create a town. Add a head-office-only insert policy.
-- 2. UPDATE of name / is_office: 0006 revoked column privileges down to the four contact columns,
--    so even head office cannot rename a town or flip is_office through PostgREST. The page needs
--    head office (only) to rename a town and set office standing.
--
-- Column privileges in Postgres are per DB-role, and every staff account shares the `authenticated`
-- role, so a plain column grant cannot say "head office may write name, managers may not" - it would
-- also hand managers name/is_office on their own town (which towns_manage lets them update) and thus
-- BROADEN the 0006 column-scoped update. To avoid that we grant name/is_office to authenticated but
-- gate them with a trigger that rejects any change to those two columns unless the caller is_head().
-- Net effect: managers keep exactly the four contact columns from 0006; only head office can rename
-- a town or change its office standing. The existing towns_manage UPDATE policy is left untouched.

-- id default so a direct PostgREST insert can create a town (matches the donors/volunteers pattern).
alter table public.towns alter column id set default replace(gen_random_uuid()::text, '-', '');

grant insert on public.towns to authenticated;
grant update (name, is_office) on public.towns to authenticated;

-- Trigger: only head office may change name or is_office. Managers editing their own town's contact
-- columns are unaffected (name/is_office are unchanged, so the guard never fires for them).
create or replace function public.guard_town_structural_columns() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  -- Only guard authenticated (PostgREST) callers. Service-role and migrations have no auth.uid()
  -- and must remain able to seed/repair structural columns; RLS already gates who reaches here.
  if auth.uid() is not null
     and (new.name is distinct from old.name or new.is_office is distinct from old.is_office)
     and not public.is_head() then
    raise exception 'Only head office may change a town''s name or office standing';
  end if;
  return new;
end $$;

drop trigger if exists towns_guard_structural on public.towns;
create trigger towns_guard_structural before update on public.towns
  for each row execute function public.guard_town_structural_columns();

-- INSERT: head office only. is_head_office stays service-role-only (never set from the page).
drop policy if exists towns_insert on public.towns;
create policy towns_insert on public.towns for insert to authenticated
  with check (public.is_head() and coalesce(is_head_office, false) = false);

commit;
