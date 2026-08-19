import { supabase } from './supabaseClient';

// Finance data layer (Phase 1). RLS (0008) scopes every read/write to the caller's office; head
// office sees all and can filter by town. Money is whole PKR (integers).

export interface ServiceCharge {
  id: string;
  name: string;
  category: string;
  price_pkr: number;
  is_active: boolean;
}

export interface LedgerEntry {
  kind: 'INVOICE' | 'DONATION';
  id: string;
  town_id: string;
  party: string | null;
  amount_pkr: number;
  status: string;
  at: string;
}

export interface InvoiceLineInput {
  serviceChargeId?: string | null;
  description: string;
  qty: number;
  unitPricePkr: number;
}

export interface CreateInvoiceInput {
  townId: string;
  customerName?: string;
  customerPhone?: string;
  isWaived: boolean;
  notes?: string;
  items: InvoiceLineInput[];
}

export interface RecordDonationInput {
  townId: string;
  source?: string;
  amountPkr: number;
  method?: string;
  note?: string;
}

export async function fetchServiceCharges(): Promise<ServiceCharge[]> {
  const { data, error } = await supabase
    .from('service_charges')
    .select('id,name,category,price_pkr,is_active')
    .eq('is_active', true)
    .order('name');
  if (error) throw new Error(error.message);
  return (data ?? []) as ServiceCharge[];
}

export async function fetchLedger(): Promise<LedgerEntry[]> {
  const { data, error } = await supabase
    .from('v_office_ledger')
    .select('kind,id,town_id,party,amount_pkr,status,at')
    .order('at', { ascending: false })
    .limit(300);
  if (error) throw new Error(error.message);
  return (data ?? []) as LedgerEntry[];
}

// The client sends only the town, customer, status/waive and the item (service + qty). The
// database prices each item from the price list, computes the totals, and stamps created_by =
// auth.uid() - so money and audit fields cannot be forged from the browser (see 0009).
export async function createInvoice(input: CreateInvoiceInput): Promise<string> {
  const { data, error } = await supabase
    .from('invoices')
    .insert({
      town_id: input.townId,
      customer_name: input.customerName ?? null,
      customer_phone: input.customerPhone ?? null,
      status: input.isWaived ? 'WAIVED' : 'ISSUED',
      is_waived: input.isWaived,
      notes: input.notes ?? null,
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  const invoiceId = data.id as string;
  if (input.items.length) {
    const rows = input.items.map((it) => ({
      invoice_id: invoiceId,
      service_charge_id: it.serviceChargeId ?? null,
      description: it.description,
      qty: it.qty,
    }));
    const { error: itemsErr } = await supabase.from('invoice_items').insert(rows);
    if (itemsErr) throw new Error(itemsErr.message);
  }
  return invoiceId;
}

export async function recordDonation(input: RecordDonationInput): Promise<void> {
  const { error } = await supabase.from('financial_donations').insert({
    town_id: input.townId,
    source: input.source ?? null,
    amount_pkr: input.amountPkr,
    method: input.method ?? 'cash',
    note: input.note ?? null,
  });
  if (error) throw new Error(error.message);
}
