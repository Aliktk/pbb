import { supabase } from './supabaseClient';
import type { DonorRow } from './apiTypes';

// Donors, read from the `donors_with_eligibility` view. The view is security_invoker=on, so RLS
// scopes it to the caller's town automatically, and eligibility ("can this person give today?")
// is computed by the database - never in the browser (INV-5). This is the ONE place the web
// reads donors from.

interface RawDonor {
  id: string; mrNo: string | null; name: string; phone: string | null; townId: string;
  group: string; bloodGroup: string; rhFactor: string; lastDonatedAt: string | null;
  timesDonated: number; consentToCall: boolean; town: string | null; eligibility: string;
}

function mapDonor(r: RawDonor): DonorRow {
  return {
    id: r.id,
    mrNo: r.mrNo ?? '',
    name: r.name,
    group: r.group,
    bloodGroup: r.bloodGroup,
    rhFactor: r.rhFactor,
    phone: r.phone,
    town: r.town,
    townId: r.townId,
    lastDonatedAt: r.lastDonatedAt,
    timesDonated: r.timesDonated,
    consentToCall: r.consentToCall,
    eligibility: r.eligibility,
  };
}

export interface DonorFilters {
  q?: string;
  bloodGroup?: string;
  rhFactor?: string;
  townId?: string;
}

export async function fetchDonors(filters: DonorFilters = {}): Promise<DonorRow[]> {
  let query = supabase.from('donors_with_eligibility').select('*');
  if (filters.q && filters.q.trim()) {
    const q = filters.q.trim();
    query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,mrNo.ilike.%${q}%`);
  }
  if (filters.bloodGroup) query = query.eq('bloodGroup', filters.bloodGroup);
  if (filters.rhFactor) query = query.eq('rhFactor', filters.rhFactor);
  if (filters.townId) query = query.eq('townId', filters.townId);
  const { data, error } = await query.order('name', { ascending: true }).limit(200);
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as RawDonor[]).map(mapDonor);
}

// The emergency search: only consenting, callable donors of the exact group. Eligibility filtering
// mirrors the old API - eligible now, plus cooldown when the coordinator opts in.
export async function searchEligibleDonors(input: {
  bloodGroup: string;
  rhFactor: string;
  includeCooldown: boolean;
}): Promise<DonorRow[]> {
  let query = supabase
    .from('donors_with_eligibility')
    .select('*')
    .eq('bloodGroup', input.bloodGroup)
    .eq('rhFactor', input.rhFactor)
    .eq('consentToCall', true);
  query = input.includeCooldown
    ? query.in('eligibility', ['ELIGIBLE', 'COOLDOWN'])
    : query.eq('eligibility', 'ELIGIBLE');
  const { data, error } = await query.limit(200);
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as RawDonor[]).map(mapDonor);
}
