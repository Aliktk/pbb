import { supabase } from './supabaseClient';
import type { AdminRequestRow, PublicRequestRow } from './apiTypes';

// Blood requests, backed by Supabase. RLS (0001) does the enforcing: the public may INSERT an
// open request from the website; staff may read/update within their town; the public board reads
// a PII-free view. The frontend just reads and writes.

function groupLabel(bloodGroup: string, rhFactor: string): string {
  return `${bloodGroup}${rhFactor === 'NEGATIVE' ? '−' : '+'}`;
}

// blood_requests joined to its town, mapped to the shape the admin screen expects.
interface RawRequest {
  id: string; reference: string; patientName: string | null; hospital: string; townId: string;
  bloodGroup: string; rhFactor: string; unitsNeeded: number; urgency: string; status: string;
  source: string; requesterName: string; requesterRelationship: string | null; requesterPhone: string;
  transportAvailable: boolean; exchangePossible: boolean; caseNotes: string | null;
  createdAt: string; arrangedAt: string | null; closedAt: string | null;
  towns: { name: string } | null;
}

const ADMIN_COLUMNS =
  'id,reference,patientName,hospital,townId,bloodGroup,rhFactor,unitsNeeded,urgency,status,source,' +
  'requesterName,requesterRelationship,requesterPhone,transportAvailable,exchangePossible,caseNotes,' +
  'createdAt,arrangedAt,closedAt,towns(name)';

function mapAdminRequest(r: RawRequest): AdminRequestRow {
  return {
    id: r.id,
    reference: r.reference,
    patientName: r.patientName,
    hospital: r.hospital,
    town: r.towns?.name ?? r.townId,
    townId: r.townId,
    group: groupLabel(r.bloodGroup, r.rhFactor),
    bloodGroup: r.bloodGroup,
    rhFactor: r.rhFactor,
    unitsNeeded: r.unitsNeeded,
    urgency: r.urgency,
    status: r.status,
    source: r.source,
    requesterName: r.requesterName,
    requesterRelationship: r.requesterRelationship,
    requesterPhone: r.requesterPhone,
    transportAvailable: r.transportAvailable,
    exchangePossible: r.exchangePossible,
    caseNotes: r.caseNotes,
    createdAt: r.createdAt,
    arrangedAt: r.arrangedAt,
    closedAt: r.closedAt,
  };
}

export async function fetchAdminRequests(): Promise<AdminRequestRow[]> {
  const { data, error } = await supabase
    .from('blood_requests')
    .select(ADMIN_COLUMNS)
    .order('createdAt', { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as RawRequest[]).map(mapAdminRequest);
}

export async function updateRequestStatus(id: string, status: 'OPEN' | 'ARRANGED' | 'CLOSED'): Promise<AdminRequestRow> {
  const patch: Record<string, unknown> = { status };
  if (status === 'ARRANGED') patch.arrangedAt = new Date().toISOString();
  if (status === 'CLOSED') patch.closedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from('blood_requests')
    .update(patch)
    .eq('id', id)
    .select(ADMIN_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return mapAdminRequest(data as unknown as RawRequest);
}

export async function countOpenRequests(): Promise<number> {
  const { count, error } = await supabase
    .from('blood_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'OPEN');
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function countDonors(): Promise<number> {
  const { count, error } = await supabase
    .from('donors_with_eligibility')
    .select('id', { count: 'exact', head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

// The public "who needs blood now" board - a PII-free view (no names, no phones).
export async function fetchPublicNeeds(): Promise<PublicRequestRow[]> {
  const { data, error } = await supabase
    .from('public_open_requests')
    .select('reference,group,bloodGroup,rhFactor,unitsNeeded,town,urgency,status,createdAt')
    .order('createdAt', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicRequestRow[];
}

export interface PublicRequestInput {
  patientName?: string;
  hospital: string;
  townId: string;
  bloodGroup: string;
  rhFactor: string;
  unitsNeeded: number;
  urgency: string;
  requesterName: string;
  requesterRelationship?: string;
  requesterPhone: string;
  transportAvailable: boolean;
  exchangePossible: boolean;
  caseNotes?: string;
}

// Submit a request from the public website. status/source are set explicitly so the row satisfies
// the RLS insert check (status OPEN, source PUBLIC_FORM, units 1-20). reference is defaulted by 0004.
export async function submitPublicRequest(input: PublicRequestInput): Promise<{ reference: string; status: string }> {
  const { data, error } = await supabase
    .from('blood_requests')
    .insert({
      patientName: input.patientName ?? null,
      hospital: input.hospital,
      townId: input.townId,
      bloodGroup: input.bloodGroup,
      rhFactor: input.rhFactor,
      unitsNeeded: input.unitsNeeded,
      urgency: input.urgency,
      requesterName: input.requesterName,
      requesterRelationship: input.requesterRelationship ?? null,
      requesterPhone: input.requesterPhone,
      transportAvailable: input.transportAvailable,
      exchangePossible: input.exchangePossible,
      caseNotes: input.caseNotes ?? null,
      status: 'OPEN',
      source: 'PUBLIC_FORM',
    })
    .select('reference,status')
    .single();
  if (error) throw new Error(error.message);
  return data as { reference: string; status: string };
}
