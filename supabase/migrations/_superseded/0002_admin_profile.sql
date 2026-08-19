-- Give the head office admin a profile. Run AFTER the auth user exists in Supabase
-- (Authentication -> Users -> Add user). role_key 'head' + town_id NULL = head office: sees
-- every town and can do everything. RLS uses this row (is_head / has_role), so without it a
-- signed-in user is authenticated but sees no data.
--
-- Any auth user whose email is listed here becomes head office. Add or change emails as needed.
-- Safe to re-run.

insert into public.profiles (id, name, email, role_key, town_id, is_active)
select u.id, 'Head Office Admin', u.email, 'head', null, true
from auth.users u
where lower(u.email) in (
  'admin@pashtoonkhwabloodbank.org',
  'nawazktk99@gmail.com'
)
on conflict (id) do update
  set role_key = 'head', town_id = null, is_active = true;
