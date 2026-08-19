import { supabase } from './supabaseClient';

// Blood-stock data layer (Supabase-direct). RLS (0010) scopes every read/write to the caller's
// town; head office sees all. Stock is held per town (this app is town-based, not branch-based):
// one row per (townId, bloodGroup, rhFactor), which is the upsert target added in 0010.

// Group symbol used across the admin UI, e.g. "O+" / "A−".
function groupLabel(bloodGroup: string, rhFactor: string): string {
  return `${bloodGroup}${rhFactor === 'NEGATIVE' ? '−' : '+'}`;
}

export interface StockRow {
  bloodGroup: string;
  rhFactor: string;
  unitsAvailable: number;
  townId: string | null;
}

interface RawStock {
  bloodGroup: string;
  rhFactor: string;
  unitsAvailable: number;
  townId: string | null;
}

// Per-group available counts, keyed by the group symbol ("O−", "A+", ...). When more than one row
// maps to the same group (e.g. head office reading several towns), the counts are summed.
export async function fetchStock(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('stock_levels')
    .select('bloodGroup,rhFactor,unitsAvailable,townId');
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as RawStock[];
  const byGroup: Record<string, number> = {};
  for (const r of rows) {
    const key = groupLabel(r.bloodGroup, r.rhFactor);
    byGroup[key] = (byGroup[key] ?? 0) + (r.unitsAvailable ?? 0);
  }
  return byGroup;
}

export interface UpsertStockInput {
  townId: string;
  bloodGroup: string;
  rhFactor: string;
  unitsAvailable: number;
}

// Save a group's available units for a town. Upserts on the (townId, bloodGroup, rhFactor) unique
// key from 0010, so re-saving a group overwrites its count instead of adding a duplicate row.
export async function upsertStock(input: UpsertStockInput): Promise<void> {
  const { error } = await supabase
    .from('stock_levels')
    .upsert(
      {
        townId: input.townId,
        bloodGroup: input.bloodGroup,
        rhFactor: input.rhFactor,
        unitsAvailable: input.unitsAvailable,
      },
      { onConflict: 'townId,bloodGroup,rhFactor' },
    );
  if (error) throw new Error(error.message);
}
