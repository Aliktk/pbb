-- PBB - finance integrity hardening (fixes review of 0008).
-- Problem: 0008 let the client send the money columns (unit_price/amount/subtotal/total) and the
-- audit columns (created_by/received_by). A signed-in user could therefore mis-price a service,
-- inflate a total, or attribute an entry to someone else. Fix: the database sets all of these.
--   * audit columns default to auth.uid() and the client is not granted them
--   * invoice item prices are looked up from the price list by a trigger
--   * invoice subtotal/total are recomputed from the items by a trigger
--   * column-level INSERT grants stop the client from writing any money/audit column
-- Idempotent.

begin;

-- ── Audit columns are server-set ───────────────────────────────────────────
alter table public.invoices            alter column created_by  set default auth.uid();
alter table public.financial_donations alter column received_by set default auth.uid();

-- ── Column-level INSERT: client may write only these columns ────────────────
-- Money/audit/generated columns are excluded, so they fall to their defaults / triggers.
revoke insert on public.invoices from authenticated;
grant  insert (town_id, customer_name, customer_phone, status, is_waived, notes)
  on public.invoices to authenticated;

revoke insert on public.invoice_items from authenticated;
grant  insert (invoice_id, service_charge_id, description, qty)
  on public.invoice_items to authenticated;

revoke insert on public.financial_donations from authenticated;
grant  insert (town_id, source, amount_pkr, method, note)
  on public.financial_donations to authenticated;

-- ── Price each catalog-linked item from the price list (server-authoritative) ─
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
drop trigger if exists invoice_item_pricing on public.invoice_items;
create trigger invoice_item_pricing before insert or update on public.invoice_items
  for each row execute function public.price_invoice_item();

-- ── Keep invoice subtotal/total in sync with its items (waived => 0) ─────────
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
drop trigger if exists invoice_total_sync on public.invoice_items;
create trigger invoice_total_sync after insert or update or delete on public.invoice_items
  for each row execute function public.recompute_invoice_total();

-- ── Value integrity constraints ─────────────────────────────────────────────
alter table public.invoices drop constraint if exists invoices_status_chk;
alter table public.invoices add  constraint invoices_status_chk
  check (status in ('DRAFT', 'ISSUED', 'PAID', 'WAIVED', 'CANCELLED'));

alter table public.service_charges drop constraint if exists service_charges_price_chk;
alter table public.service_charges add  constraint service_charges_price_chk check (price_pkr >= 0);

alter table public.financial_donations drop constraint if exists financial_donations_amount_chk;
alter table public.financial_donations add  constraint financial_donations_amount_chk check (amount_pkr >= 0);

commit;
