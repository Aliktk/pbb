-- ─────────────────────────────────────────────────────────────────────────
-- The single eligibility rule (Harness §3 / INV-5) and the audit-log immutability
-- guard (INV-12). Hand-authored because it creates a VIEW and a DB-level guard that
-- Prisma's model layer does not express. Runs AFTER 0001_init.
--
-- NOTE: Prisma maps model fields to QUOTED camelCase columns ("deletedAt", "hbsAg", …),
-- so this view references them exactly as generated — not the snake_case of the design
-- doc's illustrative SQL. (Getting this wrong is precisely INV-5's shipped bug.)
--
-- INV-5: only this view decides callability. The thresholds 90 (cooldown) and 180
-- (screening stale) live HERE and nowhere else in the codebase.
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW donor_eligibility AS
SELECT d.id,
  CASE
    WHEN d."deletedAt" IS NOT NULL                       THEN 'REMOVED'
    WHEN d."deferredUntil" > now()                       THEN 'DEFERRED'
    WHEN s.id IS NULL                                    THEN 'NEVER_SCREENED'
    WHEN NOT s.all_negative                              THEN 'REACTIVE'
    WHEN s."testedAt" < now() - interval '180 days'      THEN 'SCREENING_STALE'
    WHEN d."lastDonatedAt" > now() - interval '90 days'  THEN 'COOLDOWN'
    ELSE 'ELIGIBLE'
  END AS status
FROM donors d
LEFT JOIN LATERAL (
  SELECT id, "testedAt",
         (hcv = 'NEGATIVE' AND hiv = 'NEGATIVE' AND "hbsAg" = 'NEGATIVE'
          AND vdrl = 'NEGATIVE' AND mp = 'NEGATIVE') AS all_negative
  FROM screenings
  WHERE "donorId" = d.id
  ORDER BY "testedAt" DESC
  LIMIT 1
) s ON true;

-- ── Audit log immutability (INV-12) ────────────────────────────────────────
-- Append-only enforced by the database, not by application code. Triggers refuse UPDATE
-- and DELETE on audit_log for ordinary runtime paths.

CREATE OR REPLACE FUNCTION audit_log_is_append_only()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only: % is not permitted', TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_log_no_update ON audit_log;
CREATE TRIGGER audit_log_no_update
  BEFORE UPDATE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION audit_log_is_append_only();

DROP TRIGGER IF EXISTS audit_log_no_delete ON audit_log;
CREATE TRIGGER audit_log_no_delete
  BEFORE DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION audit_log_is_append_only();

-- Row-level triggers do NOT fire on TRUNCATE — without this a single TRUNCATE would wipe
-- the entire append-only log and bypass INV-12. Statement-level trigger closes that hole.
DROP TRIGGER IF EXISTS audit_log_no_truncate ON audit_log;
CREATE TRIGGER audit_log_no_truncate
  BEFORE TRUNCATE ON audit_log
  FOR EACH STATEMENT EXECUTE FUNCTION audit_log_is_append_only();

-- The triggers above are the ENFORCED, always-applied INV-12 guarantee: they fire for
-- every role on every INSERT-path attempt to UPDATE/DELETE/TRUNCATE. Role-level REVOKEs
-- are an additional defense-in-depth layer, but they depend on the runtime role existing —
-- so they are NOT done here (a conditional grant that silently skips when the role is
-- absent would give a false sense of security). Run them explicitly, once, against the real
-- app role as a provisioning step: apps/api/prisma/sql/harden-audit-role.sql
-- (see docs/DEPLOYMENT.md → "Audit-log role hardening").
