-- Give blood_requests.reference a database default so the public website can insert a request
-- directly (Prisma used to generate the reference in application code). Web-submitted requests
-- get a "WEB-000001" style reference from a sequence, distinct from any seeded references.
-- Idempotent.

begin;

create sequence if not exists public.blood_request_ref_seq start with 1000;

alter table public.blood_requests
  alter column reference set default 'WEB-' || lpad(nextval('public.blood_request_ref_seq')::text, 6, '0');

commit;
