-- PBB - account hierarchy for the Supabase-direct model.
--
-- The flow (top-down, invite-only - no public signup grants access):
--   Head office (role 'head', town_id NULL)  =  super admin. Creates accounts for any office.
--     -> Town manager (role 'manager', town_id = that office/town). Runs one town.
--          -> Coordinator / clerk / lab / volunteer (role_key, same town). Operational staff.
--
-- How an account is created WITHOUT a server (serverless, no service_role in the browser):
--   1. A head or a town manager fills the "Create account" form. That INSERTs a row into
--      account_invites (email + name + role + town). RLS below limits who may invite whom.
--   2. The new person opens the sign-up link and signs up with that email + a password THEY pick
--      (supabase.auth.signUp). Nobody ever types someone else's password.
--   3. A trigger on auth.users turns the matching invite into a real profiles row (their access),
--      then deletes the invite. An uninvited sign-up gets NO profile, so RLS shows them nothing.
--
-- Apply once in the Supabase SQL editor. Idempotent.

begin;

-- ─────────────────────────── account_invites ──────────────────────────────
create table if not exists public.account_invites (
  email      text primary key,
  name       text not null default '',
  role_key   text not null default 'viewer',
  town_id    text references public.towns(id),
  invited_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.account_invites enable row level security;

-- Who may create whom:
--   head    -> any role, any town.
--   manager -> only operational roles, and only for their OWN town.
grant select, insert, delete on public.account_invites to authenticated;

drop policy if exists invites_read on public.account_invites;
create policy invites_read on public.account_invites for select to authenticated
  using (public.is_head() or (public.has_role('manager') and town_id = public.current_town_id()));

drop policy if exists invites_create on public.account_invites;
create policy invites_create on public.account_invites for insert to authenticated
  with check (
    public.is_head()
    or (
      public.has_role('manager')
      and town_id = public.current_town_id()
      and role_key in ('coordinator', 'clerk', 'lab', 'volunteer')
    )
  );

drop policy if exists invites_delete on public.account_invites;
create policy invites_delete on public.account_invites for delete to authenticated
  using (public.is_head() or (public.has_role('manager') and town_id = public.current_town_id()));

-- ─────────── Activate an invite when the person signs up (trigger) ─────────
-- SECURITY DEFINER: runs as owner so it can write profiles regardless of the caller's RLS.
create or replace function public.handle_new_auth_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email, role_key, town_id, is_active)
  select new.id,
         coalesce(nullif(i.name, ''), split_part(new.email, '@', 1)),
         new.email, i.role_key, i.town_id, true
  from public.account_invites i
  where lower(i.email) = lower(new.email)
  on conflict (id) do update
    set role_key = excluded.role_key, town_id = excluded.town_id, is_active = true;

  delete from public.account_invites where lower(email) = lower(new.email);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ───────────── profiles: let staff SEE the register (scoped) ───────────────
-- Replaces the self-only read from 0001. Head sees everyone; a manager sees their own town;
-- everyone can still read their own row.
drop policy if exists profiles_self_read on public.profiles;
drop policy if exists profiles_scope_read on public.profiles;
create policy profiles_scope_read on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or public.is_head()
    or (public.has_role('manager') and town_id = public.current_town_id())
  );

-- profiles: head (any) or manager (own town) may change role/town/active. A manager may not
-- create or promote anyone to head or manager - only head can mint those.
drop policy if exists profiles_manage on public.profiles;
create policy profiles_manage on public.profiles for update to authenticated
  using (
    public.is_head()
    or (public.has_role('manager') and town_id = public.current_town_id())
  )
  with check (
    public.is_head()
    or (
      public.has_role('manager')
      and town_id = public.current_town_id()
      and role_key in ('coordinator', 'clerk', 'lab', 'volunteer', 'viewer')
    )
  );

commit;
