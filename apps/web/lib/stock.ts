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
// maps to the same group (e.g. head office reading several towns), the counts are summed. Pass a
// townId to read a single town's levels; omit it to read everything RLS allows (aggregated).
export async function fetchStock(townId?: string): Promise<Record<string, number>> {
  let query = supabase.from('stock_levels').select('bloodGroup,rhFactor,unitsAvailable,townId');
  if (townId) query = query.eq('townId', townId);
  const { data, error } = await query;
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

// Save every group's available units for one town in a single upsert. Same (townId, bloodGroup,
// rhFactor) conflict target as upsertStock, so re-saving overwrites counts instead of duplicating.
export async function saveStockLevels(
  townId: string,
  items: ReadonlyArray<{ bloodGroup: string; rhFactor: string; unitsAvailable: number }>,
): Promise<void> {
  if (items.length === 0) return;
  const rows = items.map((item) => ({
    townId,
    bloodGroup: item.bloodGroup,
    rhFactor: item.rhFactor,
    unitsAvailable: item.unitsAvailable,
  }));
  const { error } = await supabase
    .from('stock_levels')
    .upsert(rows, { onConflict: 'townId,bloodGroup,rhFactor' });
  if (error) throw new Error(error.message);
}
