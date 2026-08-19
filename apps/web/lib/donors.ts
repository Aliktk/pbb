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

// Neutralise PostgREST .or() filter metacharacters (comma, parentheses, quotes, backslash) and the
// ilike wildcards (% _ *) so a search term can never alter the query grammar - it is only ever a
// literal substring to match. RLS still scopes results to the caller's town regardless.
function sanitizeSearch(raw: string): string {
  return raw.replace(/[,()"'\\%_*]/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function fetchDonors(filters: DonorFilters = {}): Promise<DonorRow[]> {
  let query = supabase.from('donors_with_eligibility').select('*');
  const q = filters.q ? sanitizeSearch(filters.q) : '';
  if (q) {
    query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,mrNo.ilike.%${q}%`);
  }
  if (filters.bloodGroup) query = query.eq('bloodGroup', filters.bloodGroup);
  if (filters.rhFactor) query = query.eq('rhFactor', filters.rhFactor);
  if (filters.townId) query = query.eq('townId', filters.townId);
  const { data, error } = await query.order('name', { ascending: true }).limit(200);
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as RawDonor[]).map(mapDonor);
}

export async function fetchDonorById(id: string): Promise<DonorRow | null> {
  const { data, error } = await supabase.from('donors_with_eligibility').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapDonor(data as unknown as RawDonor) : null;
}

export interface NewDonorInput {
  name: string;
  mrNo?: string;
  bloodGroup: string;
  rhFactor: string;
  dateOfBirth: string;
  phone?: string | null;
  townId: string;
  consentToCall: boolean;
}

// Register a donor. branchId is left unset (nullable per 0007); the town scopes the record and
// RLS confines the insert to the caller's town. The written row is read back from the view so the
// caller gets computed group/eligibility.
export async function createDonor(input: NewDonorInput): Promise<DonorRow> {
  const row: Record<string, unknown> = {
    name: input.name,
    bloodGroup: input.bloodGroup,
    rhFactor: input.rhFactor,
    dateOfBirth: input.dateOfBirth,
    phone: input.phone ?? null,
    townId: input.townId,
    consentToCall: input.consentToCall,
  };
  if (input.mrNo) row.mrNo = input.mrNo;
  const { data, error } = await supabase.from('donors').insert(row).select('id').single();
  if (error) throw new Error(error.message);
  const donor = await fetchDonorById(data.id as string);
  if (!donor) throw new Error('Donor saved but could not be read back.');
  return donor;
}

export interface DonorPatch {
  name?: string;
  mrNo?: string;
  bloodGroup?: string;
  rhFactor?: string;
  phone?: string | null;
  townId?: string;
  consentToCall?: boolean;
}

export async function updateDonor(id: string, patch: DonorPatch): Promise<DonorRow> {
  const { error } = await supabase.from('donors').update(patch).eq('id', id);
  if (error) throw new Error(error.message);
  const donor = await fetchDonorById(id);
  if (!donor) throw new Error('Donor updated but could not be read back.');
  return donor;
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
