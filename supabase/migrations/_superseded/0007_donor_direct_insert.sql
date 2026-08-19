-- PBB - let the admin add/edit donors directly (Supabase-direct).
-- The donor form is town-based (Blood Chain style): it collects a town, not a branch. The Prisma
-- schema made branchId a required FK and mrNo had no default (both were set in app code). Relax
-- those so a town-scoped insert works. donors INSERT/UPDATE is already RLS-guarded in 0001
-- (head/manager/clerk, in the caller's town), so this only enables the write, it does not widen it.
-- Idempotent.

begin;

-- Donors belong to a town; branch is optional in this model.
alter table public.donors alter column "branchId" drop not null;

-- Safety-net MR number if the form does not supply one (it usually does).
create sequence if not exists public.donor_mr_seq start with 100000;
alter table public.donors
  alter column "mrNo" set default 'MR-' || lpad(nextval('public.donor_mr_seq')::text, 6, '0');

commit;
