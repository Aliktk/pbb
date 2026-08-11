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
