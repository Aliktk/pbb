-- PBB - make branch/office contact details database-backed, so each office edits its own record
-- (address, phones, email, bank) instead of the details living hard-coded in three page files.
-- An "office" is a town that has a physical branch (6 of the 14 towns). Idempotent.

begin;

alter table public.towns add column if not exists is_office      boolean not null default false;
alter table public.towns add column if not exists is_head_office boolean not null default false;
alter table public.towns add column if not exists address        text;
alter table public.towns add column if not exists phones         text[] not null default '{}';
alter table public.towns add column if not exists email          text;
alter table public.towns add column if not exists bank           text;
alter table public.towns add column if not exists has_ambulance  boolean not null default false;

-- Seed the six offices (idempotent - matched by town name). Chaman carries the real client data.
update public.towns set is_office = true, is_head_office = true, has_ambulance = true,
  address = 'Zainab Chamber, Shara-e-Adalat, near Quetta Press Club',
  phones = array['081-2836820','081-2839500'] where name = 'Quetta';
update public.towns set is_office = true,
  address = 'Sayed Abdul Qadir Road', phones = array['0824-662066'],
  bank = 'UBL Loralai · A/C 2101-1' where name = 'Loralai';
update public.towns set is_office = true,
  address = 'Band Road', phones = array['0826-421288'],
  bank = 'NBP Pishin · A/C 4589-93' where name = 'Pishin';
update public.towns set is_office = true,
  address = 'Sharbat Khan Road', phones = array['0822-413902'],
  bank = 'Bank Islami Zhob · A/C 1048-0088676-0001' where name = 'Zhob';
update public.towns set is_office = true,
  address = 'Khushi Muhammad Road, District Chaman',
  phones = array['0333-3151503','0826-612281'], email = 'pbb.chaman@gmail.com' where name = 'Chaman';
update public.towns set is_office = true,
  address = 'Aryan Market, Muslim Bagh Bazar' where name = 'Muslim Bagh';

-- Offices edit their own record: head office may edit any town; an office manager only their own.
-- (towns already grants public SELECT in 0001; this adds scoped UPDATE.)
grant update on public.towns to authenticated;
drop policy if exists towns_manage on public.towns;
create policy towns_manage on public.towns for update to authenticated
  using (public.is_head() or (public.has_role('manager') and id = public.current_town_id()))
  with check (public.is_head() or (public.has_role('manager') and id = public.current_town_id()));

commit;
