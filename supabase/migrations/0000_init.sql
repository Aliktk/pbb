-- ═══════════════════════════════════════════════════════════════════════════
-- PBB — Pashtoonkhwa Blood Bank · SINGLE INIT MIGRATION (0000_init.sql)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- This is THE single, self-contained, idempotent migration for a FRESH Supabase
-- project. Run it once and the entire database is created correctly. It supersedes
-- the previous 14 incremental files (supabase/migrations/0001..0014, now moved to
-- supabase/migrations/_superseded/) and folds the base Prisma schema together with
-- the Supabase-direct (BCP / PostgREST + RLS) layer.
--
-- Model: Supabase Auth is the identity provider. A `profiles` row maps each auth
-- user to a role_key + town. The browser talks straight to PostgREST with the anon
-- key; Row Level Security (default-deny on every public table) is what makes that
-- safe — it enforces every rule the old NestJS API used to.
--
-- Requires a real Supabase project: references auth.users and auth.uid(). Idempotent:
-- create-if-not-exists tables, create-or-replace functions/views, DO-guarded enums,
-- drop-policy-if-exists before create, create-index-if-not-exists. Safe to re-run.
--
-- DOMAINS SET UP HERE (ordered sections below):
--   1.  Extensions
--   2.  Enums / types (blood group, rh, request/message/etc.)
--   3.  Base tables — core (towns, branches, donors, screenings, donations,
--       blood_requests, request_calls, stock_levels, thalassemia_patients),
--       community/content (volunteers, partners, announcements, events, media,
--       pages, page_versions, messages, notification_logs), access (users, roles,
--       audit_log, tokens, invitations, donor_otps)
--   4.  Base indexes
--   5.  Base foreign keys
--   6.  Supabase-direct NEW tables (profiles, account_invites, contact_messages,
--       service_charges, invoices, invoice_items, financial_donations,
--       yearly_intake) + sequences
--   7.  Post-table ALTERs (town office columns, donations/stock townId, direct-insert
--       defaults, finance column grants) kept where folding is risky
--   8.  RLS helper functions (is_head / is_staff / has_role / current_town_id /
--       in_scope) + support functions (touch_updated_at, invite trigger fn, pricing,
--       audit guard, town structural guard)
--   9.  Enable RLS default-deny on EVERY public table
--   10. Policies + column-level grants (town/office scoping, head overrides, public
--       insert paths, self-service)
--   11. Triggers
--   12. Views (donor_eligibility, public_open_requests, donors_with_eligibility,
--       v_office_ledger)
--   13. Constraints (finance value integrity, partner status)
--   14. Seeds (service_charges default list, office details, head-office admin profile)
--
-- Column naming: base tables were created by Prisma, which maps model fields to
-- QUOTED camelCase columns ("townId", "deletedAt", "hbsAg", …). Supabase-direct new
-- tables use snake_case. Both conventions are intentional and preserved here.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

create schema if not exists "public";

-- ─────────────────────────────────────────────────────────────────────────
-- 1. EXTENSIONS
-- ─────────────────────────────────────────────────────────────────────────
-- gen_random_uuid() is used by direct-insert defaults and new-table PKs.
create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────────────────
-- 2. ENUMS / TYPES
-- ─────────────────────────────────────────────────────────────────────────
-- Wrapped in a DO/EXCEPTION guard so re-running is safe (create type has no
-- IF NOT EXISTS).
do $$ begin create type "BloodGroup"       as enum ('A', 'B', 'AB', 'O'); exception when duplicate_object then null; end $$;
do $$ begin create type "RhFactor"         as enum ('POSITIVE', 'NEGATIVE'); exception when duplicate_object then null; end $$;
do $$ begin create type "ScreeningResult"  as enum ('NEGATIVE', 'POSITIVE', 'PENDING'); exception when duplicate_object then null; end $$;
do $$ begin create type "UserStatus"       as enum ('INVITED', 'ACTIVE', 'SUSPENDED'); exception when duplicate_object then null; end $$;
do $$ begin create type "RequestStatus"    as enum ('OPEN', 'ARRANGING', 'ARRANGED', 'CLOSED', 'CANCELLED'); exception when duplicate_object then null; end $$;
do $$ begin create type "RequestUrgency"   as enum ('ROUTINE', 'URGENT', 'CRITICAL'); exception when duplicate_object then null; end $$;
do $$ begin create type "RequestSource"    as enum ('PUBLIC_FORM', 'PHONE', 'WALK_IN', 'WHATSAPP', 'STAFF'); exception when duplicate_object then null; end $$;
do $$ begin create type "ComponentType"    as enum ('WHOLE_BLOOD', 'PACKED_CELLS', 'PLATELETS', 'PLASMA', 'CRYO'); exception when duplicate_object then null; end $$;
do $$ begin create type "CallOutcome"      as enum ('NO_ANSWER', 'DECLINED', 'AGREED', 'DONATED', 'UNREACHABLE'); exception when duplicate_object then null; end $$;
do $$ begin create type "WillingFrequency" as enum ('ANYTIME', 'EMERGENCY_ONLY', 'QUARTERLY', 'RARELY'); exception when duplicate_object then null; end $$;
do $$ begin create type "ModeOfIssue"      as enum ('EXCHANGE', 'FREE', 'REPLACEMENT'); exception when duplicate_object then null; end $$;
do $$ begin create type "MessageDirection" as enum ('INBOUND', 'OUTBOUND'); exception when duplicate_object then null; end $$;
do $$ begin create type "MessageChannel"   as enum ('SMS', 'WHATSAPP', 'WEB_FORM', 'PHONE'); exception when duplicate_object then null; end $$;
do $$ begin create type "MessageStatus"    as enum ('UNREAD', 'READ', 'QUEUED', 'SENT', 'DELIVERED', 'FAILED'); exception when duplicate_object then null; end $$;
do $$ begin create type "PublishState"     as enum ('DRAFT', 'PUBLISHED', 'ARCHIVED'); exception when duplicate_object then null; end $$;
do $$ begin create type "PartnerKind"      as enum ('HOSPITAL', 'LABORATORY', 'FOUNDATION', 'CORPORATE', 'GOVERNMENT'); exception when duplicate_object then null; end $$;
do $$ begin create type "VolunteerStatus"  as enum ('APPLIED', 'ACTIVE', 'INACTIVE'); exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- 3. BASE TABLES (Prisma-origin)
--    Order respects FK dependencies: towns first (self-ref), then branches,
--    then donors, etc. users/roles created before FKs that point at them are
--    added in section 5. Later ALTERs from the supabase layer are FOLDED in
--    where clean and safe (branchId nullable, mrNo/id/updatedAt defaults, town
--    office columns, donations/stock townId, blood_requests.reference default).
-- ─────────────────────────────────────────────────────────────────────────

-- towns: the one list every dropdown/filter reads (INV-3). Office contact columns
-- (0006) folded in. id default (0014) folded in for direct PostgREST town create.
create table if not exists "towns" (
    "id"             text not null default replace(gen_random_uuid()::text, '-', ''),
    "name"           text not null,
    "servedFromId"   text,
    "isOffice"       boolean not null default false,   -- Prisma-origin (legacy); the Supabase-direct layer uses "is_office" below
    "createdAt"      timestamp(3) not null default current_timestamp,
    -- office contact details (folded from 0006). NOTE: 0006 added "is_office" as a
    -- SEPARATE column via `add column if not exists`, alongside Prisma's "isOffice".
    -- Both exist in the live 14-file schema; the app writes "is_office". Kept as-is to
    -- match the deployed shape — dropping "isOffice" would be a schema change, not a merge.
    "is_office"      boolean not null default false,
    "is_head_office" boolean not null default false,
    "address"        text,
    "phones"         text[] not null default '{}',
    "email"          text,
    "bank"           text,
    "has_ambulance"  boolean not null default false,
    constraint "towns_pkey" primary key ("id")
);

create table if not exists "branches" (
    "id"             text not null,
    "townId"         text not null,
    "address"        text not null,
    "phones"         text[],
    "bankAccount"    text,
    "hasAmbulance"   boolean not null default false,
    "stockUpdatedAt" timestamp(3),
    "createdAt"      timestamp(3) not null default current_timestamp,
    constraint "branches_pkey" primary key ("id")
);

-- roles / users are referenced by many FKs; create before dependants' FKs (section 5).
create table if not exists "roles" (
    "id"          text not null,
    "name"        text not null,
    "level"       integer not null,
    "permissions" jsonb not null,
    "isSystem"    boolean not null default false,
    constraint "roles_pkey" primary key ("id")
);

create table if not exists "users" (
    "id"               text not null,
    "name"             text not null,
    "email"            text not null,
    "passwordHash"     text,
    "phone"            text,
    "avatarUrl"        text,                    -- present in schema.prisma; absent from Prisma migration, added here
    "roleId"           text not null,
    "townId"           text,
    "status"           "UserStatus" not null default 'INVITED',
    "twoFactorSecret"  text,
    "twoFactorEnabled" boolean not null default false,
    "createdById"      text,
    "lastSignInAt"     timestamp(3),
    "createdAt"        timestamp(3) not null default current_timestamp,
    "updatedAt"        timestamp(3) not null,
    constraint "users_pkey" primary key ("id")
);

-- donors: branchId relaxed to nullable (0007/0010 town-based model) and id/mrNo/
-- updatedAt DB defaults folded in for direct PostgREST inserts (0001/0007).
-- The mrNo default references donor_mr_seq, so the sequence is created first (a
-- column default cannot reference a not-yet-created sequence).
create sequence if not exists "donor_mr_seq" start with 100000;
create table if not exists "donors" (
    "id"                    text not null default replace(gen_random_uuid()::text, '-', ''),
    "mrNo"                  text not null default 'MR-' || lpad(nextval('public.donor_mr_seq')::text, 6, '0'),
    "name"                  text not null,
    "bloodGroup"            "BloodGroup" not null,
    "rhFactor"              "RhFactor" not null,
    "dateOfBirth"           timestamp(3) not null,
    "phone"                 text,
    "emergencyContact"      text,
    "emergencyRelationship" text,
    "address"               text,
    "townId"                text not null,
    "branchId"              text,                    -- nullable: town-based model (0007)
    "quantityMl"            integer,
    "willingFrequency"      "WillingFrequency" not null default 'ANYTIME',
    "modeOfIssue"           "ModeOfIssue" not null default 'EXCHANGE',
    "lastDonatedAt"         timestamp(3),
    "timesDonated"          integer not null default 0,
    "deferredReason"        text,
    "deferredUntil"         timestamp(3),
    "consentToCall"         boolean not null default true,
    "consentHours"          text not null default 'ANY',
    "consentSms"            boolean not null default true,
    "consentEvents"         boolean not null default false,
    "createdById"           text,
    "createdAt"             timestamp(3) not null default current_timestamp,
    "updatedAt"             timestamp(3) not null default now(),
    "deletedAt"             timestamp(3),
    constraint "donors_pkey" primary key ("id")
);

create table if not exists "screenings" (
    "id"           text not null,
    "donorId"      text not null,
    "testedAt"     timestamp(3) not null,
    "hcv"          "ScreeningResult" not null,
    "hiv"          "ScreeningResult" not null,
    "hbsAg"        "ScreeningResult" not null,
    "vdrl"         "ScreeningResult" not null,
    "mp"           "ScreeningResult" not null,
    "performedBy"  text,
    "labReference" text,
    "createdAt"    timestamp(3) not null default current_timestamp,
    constraint "screenings_pkey" primary key ("id")
);

-- blood_requests: reference default (0004) folded in via sequence created first.
create sequence if not exists "blood_request_ref_seq" start with 1000;
create table if not exists "blood_requests" (
    "id"                    text not null default replace(gen_random_uuid()::text, '-', ''),
    "reference"             text not null default 'WEB-' || lpad(nextval('public.blood_request_ref_seq')::text, 6, '0'),
    "patientName"           text,                    -- never in any public response (INV-11)
    "hospital"              text not null,
    "townId"                text not null,
    "bloodGroup"            "BloodGroup" not null,
    "rhFactor"              "RhFactor" not null,
    "unitsNeeded"           integer not null default 1,
    "urgency"               "RequestUrgency" not null default 'URGENT',
    "requesterName"         text not null,
    "requesterRelationship" text,
    "requesterPhone"        text not null,
    "transportAvailable"    boolean not null default false,
    "exchangePossible"      boolean not null default true,
    "reportAvailable"       boolean not null default false,
    "caseNotes"             text,
    "status"                "RequestStatus" not null default 'OPEN',
    "source"                "RequestSource" not null default 'PUBLIC_FORM',
    "createdAt"             timestamp(3) not null default current_timestamp,
    "arrangedAt"            timestamp(3),
    "closedAt"              timestamp(3),
    constraint "blood_requests_pkey" primary key ("id")
);

create table if not exists "request_calls" (
    "id"         text not null,
    "requestId"  text not null,
    "donorId"    text,
    "calledById" text,
    "outcome"    "CallOutcome" not null,
    "notes"      text,
    "createdAt"  timestamp(3) not null default current_timestamp,
    constraint "request_calls_pkey" primary key ("id")
);

-- donations: branchId nullable, id/createdAt defaults, townId column (0010) folded in.
create table if not exists "donations" (
    "id"            text not null default replace(gen_random_uuid()::text, '-', ''),
    "donorId"       text not null,
    "requestId"     text,
    "branchId"      text,                            -- nullable: town-based model (0010)
    "townId"        text,                            -- town scoping key (0010)
    "donatedAt"     timestamp(3) not null,
    "quantityMl"    integer not null,
    "componentType" "ComponentType" not null default 'WHOLE_BLOOD',
    "recordedById"  text,
    "createdAt"     timestamp(3) not null default current_timestamp,
    constraint "donations_pkey" primary key ("id")
);

-- stock_levels: branchId nullable, id/updatedAt defaults, townId column (0010) folded in.
create table if not exists "stock_levels" (
    "id"             text not null default replace(gen_random_uuid()::text, '-', ''),
    "branchId"       text,                           -- nullable: town-based model (0010)
    "townId"         text,                           -- town scoping key (0010)
    "bloodGroup"     "BloodGroup" not null,
    "rhFactor"       "RhFactor" not null,
    "unitsAvailable" integer not null default 0,
    "updatedAt"      timestamp(3) not null default now(),
    "updatedById"    text,
    constraint "stock_levels_pkey" primary key ("id")
);

-- thalassemia_patients: id/updatedAt defaults (0011) folded in.
create table if not exists "thalassemia_patients" (
    "id"                      text not null default replace(gen_random_uuid()::text, '-', ''),
    "name"                    text not null,
    "dateOfBirth"             timestamp(3) not null,
    "bloodGroup"              "BloodGroup" not null,
    "rhFactor"                "RhFactor" not null,
    "guardianName"            text not null,
    "guardianPhone"           text not null,
    "townId"                  text not null,
    "transfusionIntervalDays" integer not null default 21,
    "nextTransfusionDue"      timestamp(3),
    "hospital"                text,
    "photoConsent"            boolean not null default false,
    "photoConsentDocumentId"  text,
    "createdAt"               timestamp(3) not null default current_timestamp,
    "updatedAt"               timestamp(3) not null default now(),
    constraint "thalassemia_patients_pkey" primary key ("id")
);

-- volunteers: id default (0012) folded in; partner-style extra columns are on partners.
create table if not exists "volunteers" (
    "id"        text not null default replace(gen_random_uuid()::text, '-', ''),
    "name"      text not null,
    "phone"     text not null,
    "email"     text,
    "townId"    text,
    "skills"    text,
    "status"    "VolunteerStatus" not null default 'APPLIED',
    "createdAt" timestamp(3) not null default current_timestamp,
    constraint "volunteers_pkey" primary key ("id")
);

-- partners: id default + org-wide extra columns (0013) folded in. sinceYear is in
-- schema.prisma (absent from Prisma migration) and preserved here.
create table if not exists "partners" (
    "id"        text not null default replace(gen_random_uuid()::text, '-', ''),
    "name"      text not null,
    "kind"      "PartnerKind" not null,
    "contact"   text,
    "phone"     text,
    "townId"    text,
    "logoId"    text,
    "sinceYear" text,                                -- present in schema.prisma, added here
    "createdAt" timestamp(3) not null default current_timestamp,
    -- first-class columns replacing the old "::STATUS=" contact codec (0013)
    "status"      text not null default 'active',
    "coordinator" text,
    "note"        text,
    "email"       text,
    "kindLabel"   text,
    constraint "partners_pkey" primary key ("id")
);

create table if not exists "announcements" (
    "id"          text not null,
    "title"       text not null,
    "body"        text not null,
    "state"       "PublishState" not null default 'DRAFT',
    "startsAt"    timestamp(3),
    "endsAt"      timestamp(3),
    "createdById" text,
    "createdAt"   timestamp(3) not null default current_timestamp,
    "updatedAt"   timestamp(3) not null,
    constraint "announcements_pkey" primary key ("id")
);

create table if not exists "events" (
    "id"        text not null,
    "title"     text not null,
    "location"  text,
    "townId"    text,
    "startsAt"  timestamp(3) not null,
    "endsAt"    timestamp(3),
    "body"      text,
    "state"     "PublishState" not null default 'DRAFT',
    "createdAt" timestamp(3) not null default current_timestamp,
    constraint "events_pkey" primary key ("id")
);

create table if not exists "media_assets" (
    "id"               text not null,
    "kind"             text not null default 'image',
    "url"              text not null,
    "alt"              text,
    "hasConsent"       boolean not null default false,
    "consentGrantedBy" text,
    "consentReason"    text,
    "uploadedById"     text,
    "createdAt"        timestamp(3) not null default current_timestamp,
    constraint "media_assets_pkey" primary key ("id")
);

create table if not exists "pages" (
    "id"        text not null,
    "slug"      text not null,
    "title"     text not null,
    "state"     "PublishState" not null default 'DRAFT',
    "createdAt" timestamp(3) not null default current_timestamp,
    "updatedAt" timestamp(3) not null,
    constraint "pages_pkey" primary key ("id")
);

create table if not exists "page_versions" (
    "id"          text not null,
    "pageId"      text not null,
    "version"     integer not null,
    "contentJson" jsonb not null,
    "publishedAt" timestamp(3),
    "createdById" text,
    "createdAt"   timestamp(3) not null default current_timestamp,
    constraint "page_versions_pkey" primary key ("id")
);

create table if not exists "messages" (
    "id"          text not null,
    "direction"   "MessageDirection" not null,
    "channel"     "MessageChannel" not null,
    "status"      "MessageStatus" not null default 'UNREAD',
    "fromName"    text,
    "fromPhone"   text,
    "toPhone"     text,
    "subject"     text,
    "body"        text not null,
    "townId"      text,
    "requestId"   text,
    "handledById" text,
    "createdAt"   timestamp(3) not null default current_timestamp,
    constraint "messages_pkey" primary key ("id")
);

create table if not exists "notification_logs" (
    "id"         text not null,
    "channel"    "MessageChannel" not null,
    "toPhone"    text not null,
    "body"       text not null,
    "status"     "MessageStatus" not null default 'QUEUED',
    "provider"   text,
    "providerId" text,
    "error"      text,
    "createdAt"  timestamp(3) not null default current_timestamp,
    constraint "notification_logs_pkey" primary key ("id")
);

create table if not exists "audit_log" (
    "id"         text not null,
    "actorId"    text,
    "action"     text not null,
    "entityType" text not null,
    "entityId"   text,
    "townId"     text,
    "reason"     text,
    "before"     jsonb,
    "after"      jsonb,
    "ip"         text,
    "createdAt"  timestamp(3) not null default current_timestamp,
    constraint "audit_log_pkey" primary key ("id")
);

create table if not exists "refresh_tokens" (
    "id"        text not null,
    "userId"    text not null,
    "tokenHash" text not null,
    "expiresAt" timestamp(3) not null,
    "revokedAt" timestamp(3),
    "createdAt" timestamp(3) not null default current_timestamp,
    constraint "refresh_tokens_pkey" primary key ("id")
);

create table if not exists "password_reset_tokens" (
    "id"        text not null,
    "userId"    text not null,
    "tokenHash" text not null,
    "expiresAt" timestamp(3) not null,
    "usedAt"    timestamp(3),
    "createdAt" timestamp(3) not null default current_timestamp,
    constraint "password_reset_tokens_pkey" primary key ("id")
);

create table if not exists "invitations" (
    "id"          text not null,
    "email"       text not null,
    "tokenHash"   text not null,
    "roleId"      text not null,
    "townId"      text,
    "createdById" text,
    "expiresAt"   timestamp(3) not null,
    "acceptedAt"  timestamp(3),
    "createdAt"   timestamp(3) not null default current_timestamp,
    constraint "invitations_pkey" primary key ("id")
);

create table if not exists "donor_otps" (
    "id"        text not null,
    "donorId"   text not null,
    "codeHash"  text not null,
    "expiresAt" timestamp(3) not null,
    "usedAt"    timestamp(3),
    "attempts"  integer not null default 0,
    "createdAt" timestamp(3) not null default current_timestamp,
    constraint "donor_otps_pkey" primary key ("id")
);

-- ─────────────────────────────────────────────────────────────────────────
-- 4. BASE INDEXES
-- ─────────────────────────────────────────────────────────────────────────
create unique index if not exists "towns_name_key" on "towns"("name");
create index        if not exists "donors_bloodGroup_rhFactor_townId_idx" on "donors"("bloodGroup", "rhFactor", "townId");
create index        if not exists "donors_deletedAt_idx" on "donors"("deletedAt");
create unique index if not exists "donors_branchId_mrNo_key" on "donors"("branchId", "mrNo");
create index        if not exists "screenings_donorId_testedAt_idx" on "screenings"("donorId", "testedAt");
create index        if not exists "donations_donorId_donatedAt_idx" on "donations"("donorId", "donatedAt");
create index        if not exists "donations_donatedAt_idx" on "donations"("donatedAt");
create unique index if not exists "blood_requests_reference_key" on "blood_requests"("reference");
create index        if not exists "blood_requests_status_townId_bloodGroup_rhFactor_idx" on "blood_requests"("status", "townId", "bloodGroup", "rhFactor");
create index        if not exists "request_calls_requestId_idx" on "request_calls"("requestId");
create unique index if not exists "stock_levels_branchId_bloodGroup_rhFactor_key" on "stock_levels"("branchId", "bloodGroup", "rhFactor");
create index        if not exists "thalassemia_patients_nextTransfusionDue_idx" on "thalassemia_patients"("nextTransfusionDue");
create index        if not exists "announcements_state_startsAt_endsAt_idx" on "announcements"("state", "startsAt", "endsAt");
create unique index if not exists "pages_slug_key" on "pages"("slug");
create unique index if not exists "page_versions_pageId_version_key" on "page_versions"("pageId", "version");
create index        if not exists "messages_direction_status_idx" on "messages"("direction", "status");
create unique index if not exists "users_email_key" on "users"("email");
create index        if not exists "users_roleId_townId_status_idx" on "users"("roleId", "townId", "status");
create unique index if not exists "roles_name_key" on "roles"("name");
create index        if not exists "audit_log_townId_actorId_action_idx" on "audit_log"("townId", "actorId", "action");
create index        if not exists "audit_log_createdAt_idx" on "audit_log"("createdAt");
create unique index if not exists "refresh_tokens_tokenHash_key" on "refresh_tokens"("tokenHash");
create index        if not exists "refresh_tokens_userId_idx" on "refresh_tokens"("userId");
create unique index if not exists "password_reset_tokens_tokenHash_key" on "password_reset_tokens"("tokenHash");
create unique index if not exists "invitations_tokenHash_key" on "invitations"("tokenHash");
create index        if not exists "donor_otps_donorId_idx" on "donor_otps"("donorId");

-- Town-based stock upsert target (0010): one stock row per (town, group, rh).
create unique index if not exists "stock_levels_town_group_uq"
  on "stock_levels" ("townId", "bloodGroup", "rhFactor")
  where "townId" is not null;

-- ─────────────────────────────────────────────────────────────────────────
-- 5. BASE FOREIGN KEYS
--    Added after all base tables exist. Guarded by a DO/EXCEPTION block each so
--    the file stays idempotent (ALTER … ADD CONSTRAINT has no IF NOT EXISTS).
-- ─────────────────────────────────────────────────────────────────────────
do $$ begin
  alter table "towns"                add constraint "towns_servedFromId_fkey" foreign key ("servedFromId") references "towns"("id") on delete set null on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "branches"             add constraint "branches_townId_fkey" foreign key ("townId") references "towns"("id") on delete restrict on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "donors"               add constraint "donors_townId_fkey" foreign key ("townId") references "towns"("id") on delete restrict on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "donors"               add constraint "donors_branchId_fkey" foreign key ("branchId") references "branches"("id") on delete restrict on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "donors"               add constraint "donors_createdById_fkey" foreign key ("createdById") references "users"("id") on delete set null on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "screenings"           add constraint "screenings_donorId_fkey" foreign key ("donorId") references "donors"("id") on delete restrict on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "donations"            add constraint "donations_donorId_fkey" foreign key ("donorId") references "donors"("id") on delete restrict on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "donations"            add constraint "donations_requestId_fkey" foreign key ("requestId") references "blood_requests"("id") on delete set null on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "donations"            add constraint "donations_branchId_fkey" foreign key ("branchId") references "branches"("id") on delete restrict on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "donations"            add constraint "donations_recordedById_fkey" foreign key ("recordedById") references "users"("id") on delete set null on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "donations"            add constraint "donations_townId_fkey" foreign key ("townId") references "towns"("id") on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "blood_requests"       add constraint "blood_requests_townId_fkey" foreign key ("townId") references "towns"("id") on delete restrict on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "request_calls"        add constraint "request_calls_requestId_fkey" foreign key ("requestId") references "blood_requests"("id") on delete restrict on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "request_calls"        add constraint "request_calls_calledById_fkey" foreign key ("calledById") references "users"("id") on delete set null on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "stock_levels"         add constraint "stock_levels_branchId_fkey" foreign key ("branchId") references "branches"("id") on delete restrict on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "stock_levels"         add constraint "stock_levels_updatedById_fkey" foreign key ("updatedById") references "users"("id") on delete set null on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "stock_levels"         add constraint "stock_levels_townId_fkey" foreign key ("townId") references "towns"("id") on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "thalassemia_patients" add constraint "thalassemia_patients_townId_fkey" foreign key ("townId") references "towns"("id") on delete restrict on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "thalassemia_patients" add constraint "thalassemia_patients_photoConsentDocumentId_fkey" foreign key ("photoConsentDocumentId") references "media_assets"("id") on delete set null on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "announcements"        add constraint "announcements_createdById_fkey" foreign key ("createdById") references "users"("id") on delete set null on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "media_assets"         add constraint "media_assets_uploadedById_fkey" foreign key ("uploadedById") references "users"("id") on delete set null on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "page_versions"        add constraint "page_versions_pageId_fkey" foreign key ("pageId") references "pages"("id") on delete restrict on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "page_versions"        add constraint "page_versions_createdById_fkey" foreign key ("createdById") references "users"("id") on delete set null on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "messages"             add constraint "messages_handledById_fkey" foreign key ("handledById") references "users"("id") on delete set null on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "users"                add constraint "users_roleId_fkey" foreign key ("roleId") references "roles"("id") on delete restrict on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "users"                add constraint "users_townId_fkey" foreign key ("townId") references "towns"("id") on delete set null on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "users"                add constraint "users_createdById_fkey" foreign key ("createdById") references "users"("id") on delete set null on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "audit_log"            add constraint "audit_log_actorId_fkey" foreign key ("actorId") references "users"("id") on delete set null on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "refresh_tokens"       add constraint "refresh_tokens_userId_fkey" foreign key ("userId") references "users"("id") on delete restrict on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "password_reset_tokens" add constraint "password_reset_tokens_userId_fkey" foreign key ("userId") references "users"("id") on delete restrict on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "invitations"          add constraint "invitations_createdById_fkey" foreign key ("createdById") references "users"("id") on delete set null on update cascade;
exception when duplicate_object then null; end $$;
do $$ begin
  alter table "donor_otps"           add constraint "donor_otps_donorId_fkey" foreign key ("donorId") references "donors"("id") on delete restrict on update cascade;
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- 6. SUPABASE-DIRECT NEW TABLES (+ sequences)
--    profiles / account_invites / contact_messages / service_charges / invoices
--    / invoice_items / financial_donations / yearly_intake. These reference
--    auth.users (Supabase) and towns (created above).
-- ─────────────────────────────────────────────────────────────────────────

-- profiles: one row per staff account, linked to auth.users. town_id NULL = head office.
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null default '',
  email      text,
  role_key   text not null default 'viewer',   -- head | manager | coordinator | clerk | lab | editor | viewer
  town_id    text references public.towns(id),
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- account_invites: invite-only account creation (no public signup grants access).
create table if not exists public.account_invites (
  email      text primary key,
  name       text not null default '',
  role_key   text not null default 'viewer',
  town_id    text references public.towns(id),
  invited_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- contact_messages: public-website form inbox (message | volunteer | partner | …).
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null default 'message',
  name       text,
  org        text,
  phone      text,
  email      text,
  town_id    text references public.towns(id),
  detail     text,
  status     text not null default 'NEW',        -- NEW | ANSWERED
  created_at timestamptz not null default now()
);

-- service_charges: global service price list (head office manages).
create table if not exists public.service_charges (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  category   text not null default 'service',   -- service | test | card | processing
  price_pkr  integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- invoices: per-office. Money/audit columns are server-set (0009): created_by
-- defaults to auth.uid(); subtotal/total driven by the item triggers.
create sequence if not exists public.invoice_no_seq start with 1000;
create table if not exists public.invoices (
  id             uuid primary key default gen_random_uuid(),
  town_id        text not null references public.towns(id),
  invoice_no     text not null default 'INV-' || lpad(nextval('public.invoice_no_seq')::text, 6, '0'),
  customer_name  text,
  customer_phone text,
  status         text not null default 'ISSUED',   -- DRAFT | ISSUED | PAID | WAIVED | CANCELLED
  is_waived      boolean not null default false,
  subtotal_pkr   integer not null default 0,
  total_pkr      integer not null default 0,
  notes          text,
  created_by     uuid references auth.users(id) default auth.uid(),   -- server-set (0009)
  created_at     timestamptz not null default now()
);

create table if not exists public.invoice_items (
  id                uuid primary key default gen_random_uuid(),
  invoice_id        uuid not null references public.invoices(id) on delete cascade,
  service_charge_id uuid references public.service_charges(id),
  description       text not null,
  qty               integer not null default 1,
  unit_price_pkr    integer not null default 0,   -- server-set from price list (0009 trigger)
  amount_pkr        integer not null default 0    -- server-computed (0009 trigger)
);

create table if not exists public.financial_donations (
  id          uuid primary key default gen_random_uuid(),
  town_id     text not null references public.towns(id),
  source      text,
  amount_pkr  integer not null default 0,
  method      text default 'cash',      -- cash | bank | other
  note        text,
  received_by uuid references auth.users(id) default auth.uid(),   -- server-set (0009)
  received_at timestamptz not null default now()
);

-- yearly_intake: public transparency figure (head office records/audits one row per year).
create table if not exists public.yearly_intake (
  year        integer primary key,
  bags        integer not null default 0,
  ccs         integer not null default 0,
  platelets   integer not null default 0,
  updated_by  uuid references auth.users(id) default auth.uid(),
  updated_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- 8. RLS HELPER + SUPPORT FUNCTIONS
--    (Section 7 post-table ALTERs are folded into the table defs above; the only
--    ALTERs that remain are the finance/town column-level grants in section 10,
--    kept there because they are privilege changes, not shape changes.)
--    Helpers are SECURITY DEFINER so a policy can read the caller's own profile
--    without recursing into profiles RLS. search_path pinned to public.
-- ─────────────────────────────────────────────────────────────────────────

create or replace function public.current_town_id() returns text
  language sql stable security definer set search_path = public as $$
  select town_id from public.profiles where id = auth.uid() and is_active
$$;

create or replace function public.is_staff() returns boolean
  language sql stable security definer set search_path = public as $$
  select coalesce((select is_active from public.profiles where id = auth.uid()), false)
$$;

create or replace function public.is_head() returns boolean
  language sql stable security definer set search_path = public as $$
  select coalesce((select is_active and town_id is null from public.profiles where id = auth.uid()), false)
$$;

create or replace function public.has_role(variadic roles text[]) returns boolean
  language sql stable security definer set search_path = public as $$
  select coalesce((select is_active and role_key = any(roles) from public.profiles where id = auth.uid()), false)
$$;

create or replace function public.in_scope(row_town text) returns boolean
  language sql stable security definer set search_path = public as $$
  select public.is_head() or row_town = public.current_town_id()
$$;

-- @updatedAt parity: bump updatedAt on UPDATE (donors, stock_levels, thalassemia).
create or replace function public.touch_updated_at() returns trigger
  language plpgsql as $$ begin new."updatedAt" = now(); return new; end $$;

-- Activate an invite when the matching auth user signs up.
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

-- Finance: price each catalog-linked item from the price list (server-authoritative).
create or replace function public.price_invoice_item() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if new.service_charge_id is not null then
    select price_pkr into new.unit_price_pkr from public.service_charges where id = new.service_charge_id;
  end if;
  new.unit_price_pkr := greatest(coalesce(new.unit_price_pkr, 0), 0);
  new.qty            := greatest(coalesce(new.qty, 1), 0);
  new.amount_pkr     := new.qty * new.unit_price_pkr;
  return new;
end $$;

-- Finance: keep invoice subtotal/total in sync with its items (waived => 0).
create or replace function public.recompute_invoice_total() returns trigger
  language plpgsql security definer set search_path = public as $$
declare inv uuid; sub integer;
begin
  inv := coalesce(new.invoice_id, old.invoice_id);
  select coalesce(sum(amount_pkr), 0) into sub from public.invoice_items where invoice_id = inv;
  update public.invoices
     set subtotal_pkr = sub,
         total_pkr = case when is_waived then 0 else sub end
   where id = inv;
  return null;
end $$;

-- audit_log immutability (INV-12): refuse UPDATE/DELETE/TRUNCATE.
create or replace function public.audit_log_is_append_only()
returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  raise exception 'audit_log is append-only: % is not permitted', tg_op;
end;
$$;

-- towns: only head office may change name or is_office (structural columns).
create or replace function public.guard_town_structural_columns() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null
     and (new.name is distinct from old.name or new.is_office is distinct from old.is_office)
     and not public.is_head() then
    raise exception 'Only head office may change a town''s name or office standing';
  end if;
  return new;
end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- 9. ENABLE RLS — DEFAULT DENY ON EVERY PUBLIC TABLE
--    With no permissive policy a table is service-role only, so nothing (users,
--    audit_log, tokens, …) is exposed until a policy in section 10 opts it in.
--    Runs AFTER all tables (base + supabase-direct) exist so coverage is total.
-- ─────────────────────────────────────────────────────────────────────────
do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', r.tablename);
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- 10. POLICIES + COLUMN-LEVEL GRANTS
--     Every drop-policy-if-exists precedes its create so re-running is safe.
--     Column-level grants (finance, towns) are the intentional post-table
--     privilege ALTERs — kept here because folding a REVOKE/GRANT into a CREATE
--     TABLE is not possible; they must run after the tables and their base
--     grants exist.
-- ─────────────────────────────────────────────────────────────────────────

-- ── towns: public reference data (read), scoped contact-column update, head insert.
grant select on public.towns to anon, authenticated;
drop policy if exists towns_read on public.towns;
create policy towns_read on public.towns for select to anon, authenticated using (true);

-- Column-level UPDATE: managers may write ONLY the four contact columns (0006);
-- head office may additionally rename / flip is_office, gated by a trigger (0014).
grant update (address, phones, email, bank, name, is_office) on public.towns to authenticated;
grant insert on public.towns to authenticated;

drop policy if exists towns_manage on public.towns;
create policy towns_manage on public.towns for update to authenticated
  using (public.is_head() or (public.has_role('manager') and id = public.current_town_id()))
  with check (public.is_head() or (public.has_role('manager') and id = public.current_town_id()));

drop policy if exists towns_insert on public.towns;
create policy towns_insert on public.towns for insert to authenticated
  with check (public.is_head() and coalesce(is_head_office, false) = false);

-- ── profiles: scoped read (self / head / manager-own-town), management, self name edit.
grant update (name) on public.profiles to authenticated;

drop policy if exists profiles_self_read on public.profiles;
drop policy if exists profiles_scope_read on public.profiles;
create policy profiles_scope_read on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or public.is_head()
    or (public.has_role('manager') and town_id = public.current_town_id())
  );

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

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ── account_invites: who may invite whom (head any; manager operational roles, own town).
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

-- ── donors: staff only, confined to their town; only some roles may write.
grant select, insert, update on public.donors to authenticated;
drop policy if exists donors_read on public.donors;
create policy donors_read on public.donors for select to authenticated
  using (public.is_staff() and "deletedAt" is null and public.in_scope("townId"));
drop policy if exists donors_write on public.donors;
create policy donors_write on public.donors for insert to authenticated
  with check (public.has_role('head','manager','clerk') and public.in_scope("townId"));
drop policy if exists donors_update on public.donors;
create policy donors_update on public.donors for update to authenticated
  using (public.has_role('head','manager','clerk') and public.in_scope("townId"))
  with check (public.in_scope("townId"));

-- ── screenings: staff read/write for donors in their scope.
grant select, insert on public.screenings to authenticated;
drop policy if exists screenings_read on public.screenings;
create policy screenings_read on public.screenings for select to authenticated
  using (public.is_staff() and exists (
    select 1 from public.donors d where d.id = screenings."donorId" and public.in_scope(d."townId")));
drop policy if exists screenings_write on public.screenings;
create policy screenings_write on public.screenings for insert to authenticated
  with check (public.has_role('head','manager','lab') and exists (
    select 1 from public.donors d where d.id = screenings."donorId" and public.in_scope(d."townId")));

-- ── blood_requests: public may CREATE (website form); staff read/act, scoped.
grant select, insert, update on public.blood_requests to anon, authenticated;
drop policy if exists requests_public_insert on public.blood_requests;
create policy requests_public_insert on public.blood_requests for insert to anon, authenticated
  with check (status = 'OPEN' and source = 'PUBLIC_FORM' and "unitsNeeded" between 1 and 20);
drop policy if exists requests_staff_read on public.blood_requests;
create policy requests_staff_read on public.blood_requests for select to authenticated
  using (public.is_staff() and public.in_scope("townId"));
drop policy if exists requests_staff_update on public.blood_requests;
create policy requests_staff_update on public.blood_requests for update to authenticated
  using (public.has_role('head','manager','coordinator') and public.in_scope("townId"))
  with check (public.in_scope("townId"));

-- ── donations: read within scope; write for operating roles, in the caller's town.
grant select, insert, update on public.donations to authenticated;
drop policy if exists donations_read on public.donations;
create policy donations_read on public.donations for select to authenticated
  using (public.is_head() or (public.is_staff() and public.in_scope("townId")));
drop policy if exists donations_write on public.donations;
create policy donations_write on public.donations for insert to authenticated
  with check (public.has_role('head','manager','clerk','lab') and public.in_scope("townId"));
drop policy if exists donations_update on public.donations;
create policy donations_update on public.donations for update to authenticated
  using (public.has_role('head','manager','clerk','lab') and public.in_scope("townId"))
  with check (public.in_scope("townId"));

-- ── stock_levels: read within scope; write for operating roles, in the caller's town.
grant select, insert, update on public.stock_levels to authenticated;
drop policy if exists stock_read on public.stock_levels;
create policy stock_read on public.stock_levels for select to authenticated
  using (public.is_head() or (public.is_staff() and public.in_scope("townId")));
drop policy if exists stock_write on public.stock_levels;
create policy stock_write on public.stock_levels for insert to authenticated
  with check (public.has_role('head','manager','clerk','lab') and public.in_scope("townId"));
drop policy if exists stock_update on public.stock_levels;
create policy stock_update on public.stock_levels for update to authenticated
  using (public.has_role('head','manager','clerk','lab') and public.in_scope("townId"))
  with check (public.in_scope("townId"));

-- ── thalassemia_patients: staff read in town; head/manager/clerk/lab write in town.
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

-- ── volunteers: staff read in scope; run-the-programme roles write in their town.
grant select, insert, update, delete on public.volunteers to authenticated;
drop policy if exists volunteers_read on public.volunteers;
create policy volunteers_read on public.volunteers for select to authenticated
  using (public.is_head() or (public.is_staff() and public.in_scope("townId")));
drop policy if exists volunteers_write on public.volunteers;
create policy volunteers_write on public.volunteers for insert to authenticated
  with check (public.has_role('head','manager','clerk','volunteer') and public.in_scope("townId"));
drop policy if exists volunteers_update on public.volunteers;
create policy volunteers_update on public.volunteers for update to authenticated
  using (public.has_role('head','manager','clerk','volunteer') and public.in_scope("townId"))
  with check (public.in_scope("townId"));
drop policy if exists volunteers_delete on public.volunteers;
create policy volunteers_delete on public.volunteers for delete to authenticated
  using (public.has_role('head','manager','clerk','volunteer') and public.in_scope("townId"));

-- ── partners: ORG-WIDE (no town scoping). Read = any staff; write = head/manager.
grant select, insert, update, delete on public.partners to authenticated;
drop policy if exists partners_read on public.partners;
create policy partners_read on public.partners for select to authenticated
  using (public.is_staff());
drop policy if exists partners_write on public.partners;
create policy partners_write on public.partners for insert to authenticated
  with check (public.has_role('head', 'manager'));
drop policy if exists partners_update on public.partners;
create policy partners_update on public.partners for update to authenticated
  using (public.has_role('head', 'manager'))
  with check (public.has_role('head', 'manager'));
drop policy if exists partners_delete on public.partners;
create policy partners_delete on public.partners for delete to authenticated
  using (public.has_role('head', 'manager'));

-- ── contact_messages: public may INSERT (always NEW); staff read/answer in office.
grant select, insert, update on public.contact_messages to anon, authenticated;
drop policy if exists messages_public_insert on public.contact_messages;
create policy messages_public_insert on public.contact_messages for insert to anon, authenticated
  with check (status = 'NEW');
drop policy if exists messages_staff_read on public.contact_messages;
create policy messages_staff_read on public.contact_messages for select to authenticated
  using (public.is_head() or (public.is_staff() and town_id = public.current_town_id()));
drop policy if exists messages_staff_update on public.contact_messages;
create policy messages_staff_update on public.contact_messages for update to authenticated
  using (public.is_head() or (public.is_staff() and town_id = public.current_town_id()))
  with check (public.is_head() or (public.is_staff() and town_id = public.current_town_id()));

-- ── service_charges: every staff reads the price list; only head office changes it.
grant select on public.service_charges to authenticated;
grant insert, update, delete on public.service_charges to authenticated;
drop policy if exists charges_read on public.service_charges;
create policy charges_read on public.service_charges for select to authenticated
  using (public.is_staff());
drop policy if exists charges_write on public.service_charges;
create policy charges_write on public.service_charges for all to authenticated
  using (public.is_head()) with check (public.is_head());

-- ── invoices: office-scoped. Column-level INSERT excludes money/audit columns so
--    they fall to defaults / triggers (server-authoritative pricing, INV finance).
grant select, update on public.invoices to authenticated;
grant insert (town_id, customer_name, customer_phone, status, is_waived, notes)
  on public.invoices to authenticated;
drop policy if exists invoices_read on public.invoices;
create policy invoices_read on public.invoices for select to authenticated
  using (public.is_head() or (public.is_staff() and public.in_scope(town_id)));
drop policy if exists invoices_write on public.invoices;
create policy invoices_write on public.invoices for insert to authenticated
  with check (public.has_role('head','manager','clerk') and public.in_scope(town_id));
drop policy if exists invoices_update on public.invoices;
create policy invoices_update on public.invoices for update to authenticated
  using (public.has_role('head','manager','clerk') and public.in_scope(town_id))
  with check (public.in_scope(town_id));

-- ── invoice_items: follow their invoice's scope. Column-level INSERT excludes
--    unit_price_pkr / amount_pkr (server-priced by trigger).
grant select, update, delete on public.invoice_items to authenticated;
grant insert (invoice_id, service_charge_id, description, qty)
  on public.invoice_items to authenticated;
drop policy if exists invoice_items_read on public.invoice_items;
create policy invoice_items_read on public.invoice_items for select to authenticated
  using (exists (select 1 from public.invoices i where i.id = invoice_items.invoice_id
                 and (public.is_head() or (public.is_staff() and public.in_scope(i.town_id)))));
drop policy if exists invoice_items_write on public.invoice_items;
create policy invoice_items_write on public.invoice_items for all to authenticated
  using (exists (select 1 from public.invoices i where i.id = invoice_items.invoice_id
                 and public.has_role('head','manager','clerk') and public.in_scope(i.town_id)))
  with check (exists (select 1 from public.invoices i where i.id = invoice_items.invoice_id
                 and public.has_role('head','manager','clerk') and public.in_scope(i.town_id)));

-- ── financial_donations: office-scoped. Column-level INSERT excludes received_by
--    (server-set to auth.uid()).
grant select on public.financial_donations to authenticated;
grant insert (town_id, source, amount_pkr, method, note)
  on public.financial_donations to authenticated;
drop policy if exists donations_read on public.financial_donations;
create policy donations_read on public.financial_donations for select to authenticated
  using (public.is_head() or (public.is_staff() and public.in_scope(town_id)));
drop policy if exists donations_write on public.financial_donations;
create policy donations_write on public.financial_donations for insert to authenticated
  with check (public.has_role('head','manager','clerk') and public.in_scope(town_id));

-- ── yearly_intake: everyone reads the public figure; only head office records it.
grant select on public.yearly_intake to authenticated;
grant insert, update on public.yearly_intake to authenticated;
drop policy if exists yearly_read on public.yearly_intake;
create policy yearly_read on public.yearly_intake for select to authenticated
  using (public.is_staff());
drop policy if exists yearly_write on public.yearly_intake;
create policy yearly_write on public.yearly_intake for all to authenticated
  using (public.is_head()) with check (public.is_head());

-- ── audit_log: READ-ONLY exposure (append-only). Head reads all; scoped staff own
--    town. Deliberately NO insert/update/delete policy — only the service role writes.
grant select on public.audit_log to authenticated;
drop policy if exists audit_log_read on public.audit_log;
create policy audit_log_read on public.audit_log for select to authenticated
  using (public.is_head() or (public.is_staff() and public.in_scope("townId")));

-- Every other public table (users, roles, tokens, invitations, donor_otps, events,
-- media_assets, pages, page_versions, messages, notification_logs, announcements,
-- request_calls, branches) has RLS enabled with NO policy → service-role only.

-- ─────────────────────────────────────────────────────────────────────────
-- 11. TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────

-- @updatedAt parity.
drop trigger if exists donors_touch_updated_at on public.donors;
create trigger donors_touch_updated_at before update on public.donors
  for each row execute function public.touch_updated_at();

drop trigger if exists stock_levels_touch_updated_at on public.stock_levels;
create trigger stock_levels_touch_updated_at before update on public.stock_levels
  for each row execute function public.touch_updated_at();

drop trigger if exists thalassemia_touch_updated_at on public.thalassemia_patients;
create trigger thalassemia_touch_updated_at before update on public.thalassemia_patients
  for each row execute function public.touch_updated_at();

-- Invite activation on new auth user.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Finance: server-authoritative pricing + total recomputation.
drop trigger if exists invoice_item_pricing on public.invoice_items;
create trigger invoice_item_pricing before insert or update on public.invoice_items
  for each row execute function public.price_invoice_item();

drop trigger if exists invoice_total_sync on public.invoice_items;
create trigger invoice_total_sync after insert or update or delete on public.invoice_items
  for each row execute function public.recompute_invoice_total();

-- audit_log immutability (INV-12). Row-level triggers do NOT fire on TRUNCATE, so
-- the statement-level trigger closes that hole.
drop trigger if exists audit_log_no_update on public.audit_log;
create trigger audit_log_no_update
  before update on public.audit_log
  for each row execute function public.audit_log_is_append_only();

drop trigger if exists audit_log_no_delete on public.audit_log;
create trigger audit_log_no_delete
  before delete on public.audit_log
  for each row execute function public.audit_log_is_append_only();

drop trigger if exists audit_log_no_truncate on public.audit_log;
create trigger audit_log_no_truncate
  before truncate on public.audit_log
  for each statement execute function public.audit_log_is_append_only();

-- towns: only head office may change name / is_office.
drop trigger if exists towns_guard_structural on public.towns;
create trigger towns_guard_structural before update on public.towns
  for each row execute function public.guard_town_structural_columns();

-- ─────────────────────────────────────────────────────────────────────────
-- 12. VIEWS
--     donor_eligibility is the SINGLE eligibility rule (INV-5) — the 90-day
--     cooldown and 180-day screening-stale thresholds live HERE and nowhere else.
--     It references Prisma's QUOTED camelCase columns exactly.
-- ─────────────────────────────────────────────────────────────────────────

create or replace view public.donor_eligibility
  with (security_invoker = on) as
select d.id,
  case
    when d."deletedAt" is not null                       then 'REMOVED'
    when d."deferredUntil" > now()                       then 'DEFERRED'
    when s.id is null                                    then 'NEVER_SCREENED'
    when not s.all_negative                              then 'REACTIVE'
    when s."testedAt" < now() - interval '180 days'      then 'SCREENING_STALE'
    when d."lastDonatedAt" > now() - interval '90 days'  then 'COOLDOWN'
    else 'ELIGIBLE'
  end as status
from public.donors d
left join lateral (
  select id, "testedAt",
         (hcv = 'NEGATIVE' and hiv = 'NEGATIVE' and "hbsAg" = 'NEGATIVE'
          and vdrl = 'NEGATIVE' and mp = 'NEGATIVE') as all_negative
  from public.screenings
  where "donorId" = d.id
  order by "testedAt" desc
  limit 1
) s on true;
grant select on public.donor_eligibility to authenticated;

-- Public "who needs blood now" board — SECURITY DEFINER (security_invoker = off):
-- bypasses blood_requests RLS but exposes ONLY safe columns and only open requests,
-- so the public never sees a patient name or a phone number (INV-11).
create or replace view public.public_open_requests
  with (security_invoker = off) as
  select
    r.reference,
    r."bloodGroup"::text || case when r."rhFactor" = 'NEGATIVE' then '−' else '+' end as group,
    r."bloodGroup",
    r."rhFactor",
    r."unitsNeeded",
    r.urgency,
    r.status,
    r."createdAt",
    t.name as town
  from public.blood_requests r
  join public.towns t on t.id = r."townId"
  where r.status in ('OPEN', 'ARRANGING');
grant select on public.public_open_requests to anon, authenticated;

-- Staff donor list with eligibility — security_invoker = on so the caller's donors
-- RLS applies (a branch sees only its own town).
create or replace view public.donors_with_eligibility
  with (security_invoker = on) as
  select
    d.id, d."mrNo", d.name, d.phone, d."townId",
    d."bloodGroup"::text || case when d."rhFactor" = 'NEGATIVE' then '−' else '+' end as group,
    d."bloodGroup", d."rhFactor",
    d."lastDonatedAt", d."timesDonated", d."consentToCall",
    t.name as town,
    coalesce(e.status, 'NEVER_SCREENED') as eligibility
  from public.donors d
  join public.towns t on t.id = d."townId"
  left join public.donor_eligibility e on e.id = d.id
  where d."deletedAt" is null;
grant select on public.donors_with_eligibility to authenticated;

-- Office income ledger (invoices + donations) — security_invoker = on so each caller
-- sees only their own office's income line.
create or replace view public.v_office_ledger with (security_invoker = on) as
  select 'INVOICE'::text as kind, i.id, i.town_id, i.customer_name as party,
         i.total_pkr as amount_pkr, i.status, i.created_at as at
  from public.invoices i
  where i.status in ('ISSUED', 'PAID')
  union all
  select 'DONATION'::text as kind, d.id, d.town_id, d.source as party,
         d.amount_pkr, 'RECEIVED'::text as status, d.received_at as at
  from public.financial_donations d;
grant select on public.v_office_ledger to authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- 13. CONSTRAINTS (value integrity)
--     Finance money bounds + status vocabularies + partner status. Guarded with
--     drop-if-exists so re-running is safe.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.invoices drop constraint if exists invoices_status_chk;
alter table public.invoices add  constraint invoices_status_chk
  check (status in ('DRAFT', 'ISSUED', 'PAID', 'WAIVED', 'CANCELLED'));

alter table public.service_charges drop constraint if exists service_charges_price_chk;
alter table public.service_charges add  constraint service_charges_price_chk check (price_pkr >= 0);

alter table public.financial_donations drop constraint if exists financial_donations_amount_chk;
alter table public.financial_donations add  constraint financial_donations_amount_chk check (amount_pkr >= 0);

alter table public.partners drop constraint if exists partners_status_check;
alter table public.partners add constraint partners_status_check
  check (status in ('active', 'pending', 'declined'));

-- ─────────────────────────────────────────────────────────────────────────
-- 14. SEEDS
-- ─────────────────────────────────────────────────────────────────────────

-- Default service price list (example PKR figures — head office sets the real
-- numbers in Settings). Only inserts a name that is not already present.
insert into public.service_charges (name, category, price_pkr)
select v.name, v.category, v.price
from (values
  ('Blood group card', 'card', 200),
  ('Cross-match', 'test', 500),
  ('HCV screening', 'test', 300),
  ('HIV screening', 'test', 300),
  ('HBsAg screening', 'test', 300),
  ('VDRL screening', 'test', 250),
  ('Malaria (MP) screening', 'test', 200)
) as v(name, category, price)
where not exists (select 1 from public.service_charges s where s.name = v.name);

-- ── Default super-admin login (so a fresh project works immediately) ─────────
-- Seeds ONE super-admin ACCOUNT (head office) so the account hierarchy exists on a fresh
-- project. For security the account is created with a RANDOM, UNKNOWN password (never
-- committed to source), so it CANNOT be used to log in until YOU set a password. Set it via
-- either route:
--   • Supabase Dashboard → Authentication → Users → admin@pashtoonkhwabloodbank.org →
--     "Reset password" (or send a magic link), OR
--   • run this once in the SQL editor with YOUR own strong password (do NOT commit it):
--       update auth.users
--          set encrypted_password = crypt('YOUR_STRONG_PASSWORD', gen_salt('bf'))
--        where email = 'admin@pashtoonkhwabloodbank.org';
-- Idempotent (skips if the email already exists). Soft-fails with a NOTICE if the GoTrue
-- schema differs — then create the user via Authentication → Users → Add user; the profile
-- seed below links it to the head-office (super-admin) role automatically.
do $$
declare
  uid uuid := '11111111-1111-1111-1111-111111111111';
  admin_email text := 'admin@pashtoonkhwabloodbank.org';
begin
  if not exists (select 1 from auth.users where lower(email) = admin_email) then
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
      admin_email, crypt(encode(gen_random_bytes(18), 'hex'), gen_salt('bf')), now(),
      now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
      '', '', '', ''
    );
    insert into auth.identities (
      provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      uid::text, uid,
      jsonb_build_object('sub', uid::text, 'email', admin_email, 'email_verified', true),
      'email', now(), now(), now()
    );
  end if;
exception when others then
  raise notice 'Default auth user not seeded (%). Create admin@pashtoonkhwabloodbank.org in Authentication -> Users, then re-run this migration; the profile seed will grant it head-office access.', sqlerrm;
end $$;

-- Head-office admin profile. Any auth user whose email is listed here becomes head
-- office (role 'head', town_id NULL = sees every town). RLS depends on this row, so
-- without it a signed-in user is authenticated but sees no data. Run AFTER the auth
-- user exists (Authentication → Users → Add user). Safe to re-run.
insert into public.profiles (id, name, email, role_key, town_id, is_active)
select u.id, 'Head Office Admin', u.email, 'head', null, true
from auth.users u
where lower(u.email) in (
  'admin@pashtoonkhwabloodbank.org',
  'nawazktk99@gmail.com'
)
on conflict (id) do update
  set role_key = 'head', town_id = null, is_active = true;

-- NOTE ON OFFICE SEED (0006): the six office contact rows (Quetta/Loralai/Pishin/
-- Zhob/Chaman/Muslim Bagh) are matched by town NAME via UPDATE. On a fresh install
-- the towns do not exist yet, so those UPDATEs would be no-ops. Seed the 14 towns
-- first (app/seed script), then those office details can be applied. They are NOT
-- inlined here because they depend on town rows this migration does not create.

commit;
