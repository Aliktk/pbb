-- PBB - Finance domain (Phase 1): a global service price list, per-office invoices, and per-office
-- charitable money donations, unified into an office income ledger. Every money row is scoped to a
-- town (office): an office sees only its own finance; head office sees all and can segregate by town.
-- All amounts are whole PKR (integer) to avoid floating-point money bugs.
-- Idempotent. Apply in the Supabase SQL editor (or via the apply-sql script).

begin;

-- ─────────────── Service price list (global, head office manages) ──────────────
create table if not exists public.service_charges (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  category   text not null default 'service',   -- service | test | card | processing
  price_pkr  integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─────────────────────── Invoices (per office) ─────────────────────────────
create sequence if not exists public.invoice_no_seq start with 1000;
create table if not exists public.invoices (
  id            uuid primary key default gen_random_uuid(),
  town_id       text not null references public.towns(id),
  invoice_no    text not null default 'INV-' || lpad(nextval('public.invoice_no_seq')::text, 6, '0'),
  customer_name text,
  customer_phone text,
  status        text not null default 'ISSUED',   -- DRAFT | ISSUED | PAID | WAIVED | CANCELLED
  is_waived     boolean not null default false,   -- free for a patient who cannot pay
  subtotal_pkr  integer not null default 0,
  total_pkr     integer not null default 0,
  notes         text,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now()
);

create table if not exists public.invoice_items (
  id                uuid primary key default gen_random_uuid(),
  invoice_id        uuid not null references public.invoices(id) on delete cascade,
  service_charge_id uuid references public.service_charges(id),
  description       text not null,
  qty               integer not null default 1,
  unit_price_pkr    integer not null default 0,
  amount_pkr        integer not null default 0
);

-- ───────────── Charitable money donations (per office) ──────────────────────
create table if not exists public.financial_donations (
  id          uuid primary key default gen_random_uuid(),
  town_id     text not null references public.towns(id),
  source      text,                     -- who gave it
  amount_pkr  integer not null default 0,
  method      text default 'cash',      -- cash | bank | other
  note        text,
  received_by uuid references auth.users(id),
  received_at timestamptz not null default now()
);

-- ─────────────────────────────── RLS ───────────────────────────────────────
alter table public.service_charges     enable row level security;
alter table public.invoices            enable row level security;
alter table public.invoice_items       enable row level security;
alter table public.financial_donations enable row level security;

grant select on public.service_charges to authenticated;
grant insert, update, delete on public.service_charges to authenticated;
grant select, insert, update on public.invoices to authenticated;
grant select, insert, update, delete on public.invoice_items to authenticated;
grant select, insert on public.financial_donations to authenticated;

-- service_charges: every staff member may read the price list; only head office may change it.
drop policy if exists charges_read on public.service_charges;
create policy charges_read on public.service_charges for select to authenticated
  using (public.is_staff());
drop policy if exists charges_write on public.service_charges;
create policy charges_write on public.service_charges for all to authenticated
  using (public.is_head()) with check (public.is_head());

-- invoices: office-scoped. Head sees all; staff see and act within their own town.
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

-- invoice_items: follow their invoice's scope.
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

-- financial_donations: office-scoped.
drop policy if exists donations_read on public.financial_donations;
create policy donations_read on public.financial_donations for select to authenticated
  using (public.is_head() or (public.is_staff() and public.in_scope(town_id)));
drop policy if exists donations_write on public.financial_donations;
create policy donations_write on public.financial_donations for insert to authenticated
  with check (public.has_role('head','manager','clerk') and public.in_scope(town_id));

-- ─────────────── Office income ledger (invoices + donations) ────────────────
-- security_invoker=on so each caller's RLS applies: an office sees only its own income line.
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

-- ───────────── Seed the default service list (head office edits prices) ─────
-- Example PKR prices - the head office should set the real figures in Settings.
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

commit;
