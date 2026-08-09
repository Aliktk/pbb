-- Audit-log role hardening (defense in depth for INV-12).
--
-- The append-only triggers in migration 002 are the primary, always-applied guarantee.
-- This script adds a SECOND layer: revoke mutating grants from the runtime application role
-- so even a SQL-injection path that reaches the database cannot UPDATE/DELETE/TRUNCATE the
-- log — it may only INSERT and SELECT.
--
-- Run this EXPLICITLY as a one-time provisioning step, as a privileged user, substituting
-- your actual runtime role for :app_role. It is intentionally NOT part of the migration:
-- a control that silently skips when the role is absent is worse than an explicit step that
-- fails loudly if you point it at the wrong role.
--
--   psql "$DIRECT_URL" -v app_role=pbb_app -f apps/api/prisma/sql/harden-audit-role.sql
--
-- On Supabase, run it in the SQL editor with the role you use for the app's DATABASE_URL.

\if :{?app_role}
\else
  \echo 'ERROR: pass -v app_role=<role>, e.g. -v app_role=pbb_app'
  \quit 1
\endif

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'app_role') THEN
    RAISE EXCEPTION 'role % does not exist — refusing to pretend the log is hardened', :'app_role';
  END IF;
END $$;

REVOKE UPDATE, DELETE, TRUNCATE ON audit_log FROM :"app_role";
GRANT INSERT, SELECT ON audit_log TO :"app_role";

\echo 'audit_log hardened: :app_role may INSERT + SELECT only.'
