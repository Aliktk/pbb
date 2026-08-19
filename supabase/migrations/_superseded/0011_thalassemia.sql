-- PBB - wire the thalassemia register to Supabase-direct (BCP model).
-- The thalassemia page is town-based (Blood Chain style): staff register children scoped to their
-- town. RLS is already enabled default-deny on thalassemia_patients (0001), so this file only ADDS
-- the grants + town-scoped policies and the DB-side defaults a direct PostgREST insert needs.
--
-- Read  = head office, or in-scope active staff.
-- Write = head/manager/clerk/lab, confined to the caller's town.
--
-- Idempotent: safe to re-run.

begin;

-- ───────────── DB-side defaults for app-generated ids/timestamps ───────────
-- Prisma set id (cuid) and updatedAt in application code, so the columns have no DB default.
-- Direct inserts need them (existing rows are untouched).
alter table public.thalassemia_patients alter column id set default replace(gen_random_uuid()::text, '-', '');
alter table public.thalassemia_patients alter column "updatedAt" set default now();

-- @updatedAt parity: bump updatedAt on every UPDATE (mirrors the donors trigger in 0001).
drop trigger if exists thalassemia_touch_updated_at on public.thalassemia_patients;
create trigger thalassemia_touch_updated_at before update on public.thalassemia_patients
  for each row execute function public.touch_updated_at();

-- The register form collects name/age/group/town/guardian/consent - not a date of birth or the
-- optional hospital/consent-document FK. dateOfBirth is derived from age by the form, so it stays
-- required; the optional FK / hospital columns are already nullable in the Prisma schema. No other
-- column needs relaxing.

-- ───────────────────────────── Policies ───────────────────────────────────
-- thalassemia_patients: staff read in their town; head/manager/clerk/lab write in their town.
grant select, insert, update, delete on public.thalassemia_patients to authenticated;

drop policy if exists thalassemia_read on public.thalassemia_patients;
create policy thalassemia_read on public.thalassemia_patients for select to authenticated
  using (public.is_head() or (public.is_staff() and public.in_scope("townId")));

drop policy if exists thalassemia_insert on public.thalassemia_patients;
create policy thalassemia_insert on public.thalassemia_patients for insert to authenticated
  with check (public.has_role('head','manager','clerk','lab') and public.in_scope("townId"));

drop policy if exists thalassemia_update on public.thalassemia_patients;
create policy thalassemia_update on public.thalassemia_patients for update to authenticated
  using (public.has_role('head','manager','clerk','lab') and public.in_scope("townId"))
  with check (public.in_scope("townId"));

drop policy if exists thalassemia_delete on public.thalassemia_patients;
create policy thalassemia_delete on public.thalassemia_patients for delete to authenticated
  using (public.has_role('head','manager','clerk','lab') and public.in_scope("townId"));

commit;
