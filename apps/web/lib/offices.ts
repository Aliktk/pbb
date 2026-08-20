import { supabase } from './supabaseClient';

// Offices (towns that have a physical branch), read from the towns table. Public read is open;
// updates are RLS-scoped (head any office, manager their own) - see migration 0006. This is the
// ONE source of branch contact details, so the public site and the admin never disagree.

export interface Office {
  id: string;
  name: string;
  isHeadOffice: boolean;
  address: string | null;
  phones: string[];
  email: string | null;
  bank: string | null;
  hasAmbulance: boolean;
}

interface RawOffice {
  id: string; name: string; is_head_office: boolean; address: string | null;
  phones: string[] | null; email: string | null; bank: string | null; has_ambulance: boolean;
}

function mapOffice(r: RawOffice): Office {
  return {
    id: r.id,
    name: r.name,
    isHeadOffice: r.is_head_office,
    address: r.address,
    phones: r.phones ?? [],
    email: r.email,
    bank: r.bank,
    hasAmbulance: r.has_ambulance,
  };
}

// Static fallback branch list, shared by the /branches list and the /branch/[id] detail page.
// Used while the towns table loads or if it cannot be reached, so those pages are never empty.
// Only Quetta (head office) and Chaman have confirmed contact details; other branches carry only
// what has been verified and otherwise show an honest "to follow" state.
export const FALLBACK_OFFICES: Office[] = [
  { id: 'quetta', name: 'Quetta', isHeadOffice: true, address: 'Zainab Chamber, Shara-e-Adalat, near Quetta Press Club', phones: ['081-2836820', '081-2839500'], email: 'admin@pashtoonkhwabloodbank.org', bank: null, hasAmbulance: true },
  { id: 'loralai', name: 'Loralai', isHeadOffice: false, address: 'Sayed Abdul Qadir Road', phones: ['0824-662066'], email: null, bank: 'UBL Loralai · A/C 2101-1', hasAmbulance: false },
  { id: 'pishin', name: 'Pishin', isHeadOffice: false, address: 'Band Road', phones: ['0826-421288'], email: null, bank: 'NBP Pishin · A/C 4589-93', hasAmbulance: false },
  { id: 'zhob', name: 'Zhob', isHeadOffice: false, address: 'Sharbat Khan Road', phones: ['0822-413902'], email: null, bank: 'Bank Islami Zhob · A/C 1048-0088676-0001', hasAmbulance: false },
  { id: 'chaman', name: 'Chaman', isHeadOffice: false, address: 'Khushi Muhammad Road, District Chaman', phones: ['0333-3151503', '0826-612281'], email: 'pbb.chaman@gmail.com', bank: null, hasAmbulance: false },
  { id: 'muslimbagh', name: 'Muslim Bagh', isHeadOffice: false, address: 'Aryan Market, Muslim Bagh Bazar', phones: [], email: null, bank: null, hasAmbulance: false },
];

const COLUMNS = 'id,name,is_head_office,address,phones,email,bank,has_ambulance';

export async function fetchOffices(): Promise<Office[]> {
  const { data, error } = await supabase
    .from('towns')
    .select(COLUMNS)
    .eq('is_office', true)
    .order('is_head_office', { ascending: false })
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as RawOffice[]).map(mapOffice);
}

export interface OfficeEdit {
  address?: string | null;
  phones?: string[];
  email?: string | null;
  bank?: string | null;
}

export async function updateOffice(id: string, patch: OfficeEdit): Promise<Office> {
  const { data, error } = await supabase
    .from('towns')
    .update({
      address: patch.address ?? null,
      phones: patch.phones ?? [],
      email: patch.email ?? null,
      bank: patch.bank ?? null,
    })
    .eq('id', id)
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapOffice(data as RawOffice);
}
