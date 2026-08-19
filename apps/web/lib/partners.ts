import { supabase } from './supabaseClient';

// Partners (hospitals, labs, foundations, welfare societies, ...), read/written straight from the
// `partners` table (Supabase-direct, BCP model). Partners are ORG-WIDE: any active staff may read
// the directory; only head office and managers may curate it. RLS enforces this - see 0013_partners.
// This is the ONE place the web reads/writes partners from.
//
// status / coordinator / note / kindLabel are real columns (added in 0013). The page's category set
// (Hospital, Laboratory, Welfare society, University, Social Welfare, Foundation, Government) is wider
// than the narrow PartnerKind DB enum, so we persist the exact label in kindLabel and map a best-fit
// enum value into the NOT NULL `kind` column for schema compatibility.

export type PartnerKind =
  | 'Hospital'
  | 'Laboratory'
  | 'Welfare society'
  | 'Social Welfare'
  | 'University'
  | 'Foundation'
  | 'Government';

export type PartnerStatus = 'active' | 'pending' | 'declined';

export interface Partner {
  id: string;
  name: string;
  kind: PartnerKind;
  town: string;
  townId: string | null;
  status: PartnerStatus;
  since: string;
  note: string;
  coordinator: string;
  phone?: string;
  email?: string;
}

// The DB enum PartnerKind: HOSPITAL | LABORATORY | FOUNDATION | CORPORATE | GOVERNMENT. Map the
// page's richer label onto the closest enum member so the NOT NULL enum column always gets a value.
function kindToEnum(kind: PartnerKind): string {
  switch (kind) {
    case 'Hospital':
      return 'HOSPITAL';
    case 'Laboratory':
      return 'LABORATORY';
    case 'Foundation':
      return 'FOUNDATION';
    case 'Government':
      return 'GOVERNMENT';
    case 'University':
    case 'Welfare society':
    case 'Social Welfare':
    default:
      return 'CORPORATE';
  }
}

const VALID_KINDS: PartnerKind[] = [
  'Hospital',
  'Laboratory',
  'Welfare society',
  'Social Welfare',
  'University',
  'Foundation',
  'Government',
];

// Prefer the exact stored label; fall back to a best guess from the DB enum when kindLabel is empty
// (rows created before this migration, or via another path).
function resolveKind(kindLabel: string | null, enumKind: string | null): PartnerKind {
  if (kindLabel && VALID_KINDS.includes(kindLabel as PartnerKind)) return kindLabel as PartnerKind;
  const k = (enumKind ?? '').toUpperCase();
  if (k.includes('LAB')) return 'Laboratory';
  if (k.includes('FOUND')) return 'Foundation';
  if (k.includes('GOV')) return 'Government';
  if (k.includes('HOSP')) return 'Hospital';
  if (k.includes('CORP')) return 'Welfare society';
  return 'Hospital';
}

function normalizeStatus(raw: string | null): PartnerStatus {
  if (raw === 'pending' || raw === 'declined') return raw;
  return 'active';
}

interface RawPartner {
  id: string;
  name: string;
  kind: string | null;
  kindLabel: string | null;
  contact: string | null;
  phone: string | null;
  email: string | null;
  townId: string | null;
  status: string | null;
  coordinator: string | null;
  note: string | null;
  sinceYear: string | null;
  createdAt: string;
  town?: { name: string | null } | null;
}

function mapPartner(r: RawPartner): Partner {
  const since =
    r.sinceYear?.trim() ||
    (r.status === 'active' && r.createdAt ? new Date(r.createdAt).getFullYear().toString() : '-');
  return {
    id: r.id,
    name: r.name,
    kind: resolveKind(r.kindLabel, r.kind),
    town: r.town?.name ?? '',
    townId: r.townId,
    status: normalizeStatus(r.status),
    since,
    note: r.note ?? '',
    coordinator: r.coordinator?.trim() || 'Assigned Officer',
    phone: r.phone ?? undefined,
    email: r.email ?? undefined,
  };
}

// Read the partner + its town name via the towns FK. RLS returns the full org-wide directory to any
// active staff, so no explicit filter is needed here.
const SELECT =
  'id,name,kind,kindLabel,contact,phone,email,townId,status,coordinator,note,sinceYear,createdAt,town:towns(name)';

export async function fetchPartners(): Promise<Partner[]> {
  const { data, error } = await supabase
    .from('partners')
    .select(SELECT)
    .order('createdAt', { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as RawPartner[]).map(mapPartner);
}

async function fetchPartnerById(id: string): Promise<Partner | null> {
  const { data, error } = await supabase.from('partners').select(SELECT).eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapPartner(data as unknown as RawPartner) : null;
}

export interface NewPartnerInput {
  name: string;
  kind: PartnerKind;
  townId?: string | null;
  status: PartnerStatus;
  since?: string;
  note?: string;
  coordinator?: string;
  phone?: string | null;
  email?: string | null;
}

export async function createPartner(input: NewPartnerInput): Promise<Partner> {
  const row: Record<string, unknown> = {
    name: input.name,
    kind: kindToEnum(input.kind),
    kindLabel: input.kind,
    status: input.status,
    townId: input.townId ?? null,
    coordinator: input.coordinator?.trim() || null,
    note: input.note?.trim() || null,
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || null,
    sinceYear: input.since?.trim() || null,
  };
  const { data, error } = await supabase.from('partners').insert(row).select('id').single();
  if (error) throw new Error(error.message);
  const partner = await fetchPartnerById(data.id as string);
  if (!partner) throw new Error('Partner saved but could not be read back.');
  return partner;
}

export interface PartnerPatch {
  name?: string;
  kind?: PartnerKind;
  townId?: string | null;
  status?: PartnerStatus;
  since?: string;
  note?: string;
  coordinator?: string;
  phone?: string | null;
  email?: string | null;
}

export async function updatePartner(id: string, patch: PartnerPatch): Promise<Partner> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.kind !== undefined) {
    row.kind = kindToEnum(patch.kind);
    row.kindLabel = patch.kind;
  }
  if (patch.townId !== undefined) row.townId = patch.townId;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.since !== undefined) row.sinceYear = patch.since.trim() || null;
  if (patch.note !== undefined) row.note = patch.note.trim() || null;
  if (patch.coordinator !== undefined) row.coordinator = patch.coordinator.trim() || null;
  if (patch.phone !== undefined) row.phone = patch.phone?.trim() || null;
  if (patch.email !== undefined) row.email = patch.email?.trim() || null;

  const { error } = await supabase.from('partners').update(row).eq('id', id);
  if (error) throw new Error(error.message);
  const partner = await fetchPartnerById(id);
  if (!partner) throw new Error('Partner updated but could not be read back.');
  return partner;
}

export async function deletePartner(id: string): Promise<void> {
  const { error } = await supabase.from('partners').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// Approve / decline a pending application. Writes the status and reads the row back so the caller
// gets the canonical value from the DB.
export async function setPartnerStatus(id: string, status: PartnerStatus): Promise<Partner> {
  const { error } = await supabase.from('partners').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
  const partner = await fetchPartnerById(id);
  if (!partner) throw new Error('Status updated but the partner could not be read back.');
  return partner;
}
