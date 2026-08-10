-- Link the head office admin to a profile. Run AFTER you have created the auth user
-- admin@pashtoonkhwabloodbank.org in Supabase (Authentication -> Users -> Add user).
-- role_key 'head' + town_id NULL = head office, sees every town.

insert into public.profiles (id, name, email, role_key, town_id, is_active)
select u.id, 'Head Office Admin', u.email, 'head', null, true
from auth.users u
where u.email = 'admin@pashtoonkhwabloodbank.org'
on conflict (id) do update
  set role_key = excluded.role_key, town_id = excluded.town_id, is_active = true;
