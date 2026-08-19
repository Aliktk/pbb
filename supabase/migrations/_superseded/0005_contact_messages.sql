-- PBB - inbox for public-website form arrivals (the channel that replaced the old comment box).
-- Every public form (contact message, volunteer, partner, organisation, donor sign-up lead) lands
-- here for a named person to answer. The public may INSERT; staff read/answer within their office.
-- Idempotent.

begin;

create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null default 'message',   -- message | volunteer | partner | organisation | donor | donation
  name       text,
  org        text,
  phone      text,
  email      text,
  town_id    text references public.towns(id),
  detail     text,
  status     text not null default 'NEW',        -- NEW | ANSWERED
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;
grant select, insert, update on public.contact_messages to anon, authenticated;

-- Anyone may leave a message from the website; it always arrives as NEW.
drop policy if exists messages_public_insert on public.contact_messages;
create policy messages_public_insert on public.contact_messages for insert to anon, authenticated
  with check (status = 'NEW');

-- Staff read/answer within their office. A message with no town belongs to head office.
drop policy if exists messages_staff_read on public.contact_messages;
create policy messages_staff_read on public.contact_messages for select to authenticated
  using (public.is_head() or (public.is_staff() and town_id = public.current_town_id()));

drop policy if exists messages_staff_update on public.contact_messages;
create policy messages_staff_update on public.contact_messages for update to authenticated
  using (public.is_head() or (public.is_staff() and town_id = public.current_town_id()))
  with check (public.is_head() or (public.is_staff() and town_id = public.current_town_id()));

commit;
