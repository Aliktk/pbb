-- PBB - admin system reads for the Supabase-direct model (audit log + profile self-service).
--
-- Two additive changes, both idempotent, both fitting the existing default-deny RLS from 0001:
--   1. audit_log becomes READABLE (append-only): head office reads every town's trail; scoped
--      staff read only their own town's entries. There is deliberately NO insert/update/delete
--      policy, so the trail stays immutable from the browser - only the service role can write it.
--   2. A signed-in user may rename THEIR OWN profile (display name only). A column-level UPDATE
--      grant on profiles(name) plus a self-row policy means they cannot touch role_key / town_id /
--      is_active on their own row. The 0003 head/manager management policy is left intact.
--
-- Apply once in the Supabase SQL editor (or: supabase db push). Safe to re-run.

begin;

-- ─────────────────────────────── audit_log ────────────────────────────────
-- Read-only exposure. audit_log carries a "townId" column (Prisma AuditLog.townId), so scoped
-- staff can be limited to their own town while head office sees all. Append-only: no write policy.
grant select on public.audit_log to authenticated;

drop policy if exists audit_log_read on public.audit_log;
create policy audit_log_read on public.audit_log for select to authenticated
  using (public.is_head() or (public.is_staff() and public.in_scope("townId")));

-- ─────────────────────── profiles: self display-name edit ──────────────────
-- Let a signed-in user change ONLY their own display name. The column-level grant limits the
-- writable columns to name; the policy limits the writable rows to the caller's own profile.
-- role_key / town_id / is_active are NOT granted here, so a self-update cannot escalate a role or
-- move towns. The 0003 profiles_manage policy (head any / manager own-town) still governs those.
grant update (name) on public.profiles to authenticated;

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

commit;
