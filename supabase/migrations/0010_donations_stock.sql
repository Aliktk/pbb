-- PBB - Donations & blood stock (Supabase-direct, town-scoped).
-- Wires the "record a donation" register and the per-group blood-stock grid to PostgREST.
-- Both tables were created by Prisma keyed to a branch; this app is town-based (Blood Chain
-- style) and the browser only has a townId (never a branchId). So we:
--   • add a nullable "townId" to each table for town scoping (branchId stays, but nullable),
--   • add DB defaults for app-generated id/updatedAt so direct inserts work,
--   • add a yearly-figures table for the ledger's annual chart,
--   • grant + RLS-scope everything to the caller's town (head office sees all).
-- RLS was enabled default-deny on every table in 0001; this only ADDS grants + policies.
-- Read  = is_head() OR (is_staff() AND in_scope(row town)).
-- Write = has_role('head','manager','clerk','lab') AND in scope.
-- Idempotent. Apply in the Supabase SQL editor (or via the apply-sql script).

begin;

-- ─────────── Donations: town-based direct inserts ───────────
-- Prisma made branchId a required FK and generated id/createdAt in app code. The town-based form
-- supplies a townId and no branch, so relax branchId and add the missing DB defaults.
alter table public.donations alter column "branchId" drop not null;
alter table public.donations alter column id set default replace(gen_random_uuid()::text, '-', '');
alter table public.donations alter column "createdAt" set default now();
-- Town the donation belongs to (scoping key for this app). Backfilled from the donor where possible.
alter table public.donations add column if not exists "townId" text references public.towns(id);
update public.donations d
  set "townId" = sub."townId"
  from public.donors sub
  where d."donorId" = sub.id and d."townId" is null;

-- ─────────── Stock levels: town-based direct upserts ───────────
-- Same story: branch-keyed by Prisma, but this app holds stock per town. Add a nullable townId,
-- relax branchId, default the id, and default+touch updatedAt (Prisma's @updatedAt has no DB default).
alter table public.stock_levels alter column "branchId" drop not null;
alter table public.stock_levels alter column id set default replace(gen_random_uuid()::text, '-', '');
alter table public.stock_levels alter column "updatedAt" set default now();
alter table public.stock_levels add column if not exists "townId" text references public.towns(id);

drop trigger if exists stock_levels_touch_updated_at on public.stock_levels;
create trigger stock_levels_touch_updated_at before update on public.stock_levels
  for each row execute function public.touch_updated_at();

-- Town-based upsert target: one stock row per (town, group, rh). The old branch-keyed unique still
-- stands for legacy rows; this adds the key the town-based grid upserts on.
create unique index if not exists stock_levels_town_group_uq
  on public.stock_levels ("townId", "bloodGroup", "rhFactor")
  where "townId" is not null;

-- ─────────── Yearly intake figures (ledger chart source) ───────────
-- The annual bar chart on the ledger is a public transparency figure. Head office records/audits
-- one row per year; everyone may read it.
create table if not exists public.yearly_intake (
  year        integer primary key,
  bags        integer not null default 0,
  ccs         integer not null default 0,
  platelets   integer not null default 0,
  updated_by  uuid references auth.users(id) default auth.uid(),
  updated_at  timestamptz not null default now()
);

-- ─────────────────────────────── Grants ───────────────────────────────
grant select, insert, update on public.donations   to authenticated;
grant select, insert, update on public.stock_levels to authenticated;
grant select on public.yearly_intake to authenticated;
grant insert, update on public.yearly_intake to authenticated;

-- ─────────────────────────────── Policies ─────────────────────────────

-- donations: read within scope; write for the operating roles, in the caller's town.
drop policy if exists donations_read on public.donations;
create policy donations_read on public.donations for select to authenticated
  using (public.is_head() or (public.is_staff() and public.in_scope("townId")));
drop policy if exists donations_write on public.donations;
create policy donations_write on public.donations for insert to authenticated
  with check (public.has_role('head','manager','clerk','lab') and public.in_scope("townId"));
drop policy if exists donations_update on public.donations;
create policy donations_update on public.donations for update to authenticated
  using (public.has_role('head','manager','clerk','lab') and public.in_scope("townId"))
  with check (public.in_scope("townId"));

-- stock_levels: read within scope; write for the operating roles, in the caller's town.
drop policy if exists stock_read on public.stock_levels;
create policy stock_read on public.stock_levels for select to authenticated
  using (public.is_head() or (public.is_staff() and public.in_scope("townId")));
drop policy if exists stock_write on public.stock_levels;
create policy stock_write on public.stock_levels for insert to authenticated
  with check (public.has_role('head','manager','clerk','lab') and public.in_scope("townId"));
drop policy if exists stock_update on public.stock_levels;
create policy stock_update on public.stock_levels for update to authenticated
  using (public.has_role('head','manager','clerk','lab') and public.in_scope("townId"))
  with check (public.in_scope("townId"));

-- yearly_intake: everyone reads the public figure; only head office records/audits it.
drop policy if exists yearly_read on public.yearly_intake;
create policy yearly_read on public.yearly_intake for select to authenticated
  using (public.is_staff());
drop policy if exists yearly_write on public.yearly_intake;
create policy yearly_write on public.yearly_intake for all to authenticated
  using (public.is_head()) with check (public.is_head());

commit;
