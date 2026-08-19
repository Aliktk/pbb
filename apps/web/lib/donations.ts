import { supabase } from './supabaseClient';

// Donations data layer (Supabase-direct). RLS (0010) scopes every read/write to the caller's town;
// head office sees all. The register is town-based: the browser sends a townId, never a branchId.
// A donation joins to its donor for the display name and blood group; the row is written directly
// and read back so the caller gets the mapped shape the ledger/record pages use.

// Blood group symbol, e.g. "O+" / "A−", the same convention as the donor views.
function groupLabel(bloodGroup: string, rhFactor: string): string {
  return `${bloodGroup}${rhFactor === 'NEGATIVE' ? '−' : '+'}`;
}

// The shape the ledger and record pages render.
export interface DonationRow {
  id: string;
  donatedAt: string;
  quantityMl: number;
  donor: {
    name: string;
    bloodGroup: string;
    rhFactor: string;
    group: string;
    town?: { name: string | null };
  };
  townId: string | null;
  town: string | null;
}

interface RawDonation {
  id: string;
  donatedAt: string;
  quantityMl: number;
  townId: string | null;
  donor: { name: string; bloodGroup: string; rhFactor: string } | null;
  town: { name: string | null } | null;
}

function mapDonation(r: RawDonation): DonationRow {
  const bloodGroup = r.donor?.bloodGroup ?? '';
  const rhFactor = r.donor?.rhFactor ?? 'POSITIVE';
  const townName = r.town?.name ?? null;
  return {
    id: r.id,
    donatedAt: r.donatedAt,
    quantityMl: r.quantityMl,
    donor: {
      name: r.donor?.name ?? 'Unknown donor',
      bloodGroup,
      rhFactor,
      group: groupLabel(bloodGroup, rhFactor),
      town: { name: townName },
    },
    townId: r.townId,
    town: townName,
  };
}

// donations has exactly one FK to donors and one to towns, so PostgREST resolves these embeds by
// target table without an explicit constraint hint.
const SELECT =
  'id,donatedAt,quantityMl,townId,donor:donors(name,bloodGroup,rhFactor),town:towns(name)';

// Recent donations, newest first. RLS confines the list to the caller's town (head office: all).
export async function fetchDonations(limit = 300): Promise<DonationRow[]> {
  const { data, error } = await supabase
    .from('donations')
    .select(SELECT)
    .order('donatedAt', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as RawDonation[]).map(mapDonation);
}

export interface CreateDonationInput {
  donorId: string;
  townId: string;
  quantityMl: number;
  donatedAt: string; // ISO date (yyyy-mm-dd) or full timestamp
  requestId?: string | null;
}

// Record a donation. branchId is left unset (nullable per 0010); the townId scopes the row and RLS
// confines the insert to the caller's town. The written row is read back mapped so the page can
// append it to its "recorded this session" list.
export async function createDonation(input: CreateDonationInput): Promise<DonationRow> {
  const row: Record<string, unknown> = {
    donorId: input.donorId,
    townId: input.townId,
    quantityMl: input.quantityMl,
    donatedAt: input.donatedAt,
  };
  if (input.requestId) row.requestId = input.requestId;
  const { data, error } = await supabase.from('donations').insert(row).select('id').single();
  if (error) throw new Error(error.message);

  const { data: readBack, error: readErr } = await supabase
    .from('donations')
    .select(SELECT)
    .eq('id', data.id as string)
    .single();
  if (readErr) throw new Error(readErr.message);
  return mapDonation(readBack as unknown as RawDonation);
}
