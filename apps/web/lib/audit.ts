import { supabase } from './supabaseClient';
import { roleLabel } from './roles';

// Audit trail, read straight from the `audit_log` table. RLS (0014) scopes it: head office sees
// every town, scoped staff see only their own town. The table is append-only - the browser never
// writes it (only the service role does), so this module is read-only by design.
//
// audit_log.actorId / townId are plain columns (no PostgREST-embeddable FK to profiles/towns), so
// we read the rows first and then resolve actor names and town names with small follow-up lookups.

export type AuditSeverity = 'high' | 'normal' | 'security';

// The row shape the audit page renders. Kept deliberately close to the page's original interface
// so the JSX did not have to change.
export interface AuditEntry {
  id: string;
  timestamp: string; // HH:MM local
  date: string; // e.g. "19 Aug 2026"
  month: string; // e.g. "August 2026" (drives the month filter)
  who: string;
  role: string;
  what: string;
  town: string;
  severity: AuditSeverity;
  reason?: string;
  ip?: string;
}

interface RawAuditRow {
  id: string;
  actorId: string | null;
  action: string;
  entityType: string;
  townId: string | null;
  reason: string | null;
  ip: string | null;
  createdAt: string;
}

// Actions we want to visually flag. Security-sensitive first, then destructive/high-impact.
function severityFor(action: string): AuditSeverity {
  const a = action.toLowerCase();
  if (a.includes('password') || a.includes('login') || a.includes('permission') || a.includes('role')) {
    return 'security';
  }
  if (a.includes('delete') || a.includes('purge') || a.includes('anonymize') || a.includes('export')) {
    return 'high';
  }
  return 'normal';
}

function two(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function mapAudit(
  r: RawAuditRow,
  actors: Map<string, { name: string; role: string }>,
  townNames: Map<string, string>,
): AuditEntry {
  const when = new Date(r.createdAt);
  const valid = !Number.isNaN(when.getTime());
  const actor = r.actorId ? actors.get(r.actorId) : undefined;
  return {
    id: r.id,
    timestamp: valid ? `${two(when.getHours())}:${two(when.getMinutes())}` : '',
    date: valid ? when.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '',
    month: valid ? when.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : '',
    who: actor?.name ?? 'System',
    role: actor?.role ?? 'System',
    what: `${r.action} · ${r.entityType}`,
    town: (r.townId ? townNames.get(r.townId) : undefined) ?? (r.townId ? r.townId : 'All towns'),
    severity: severityFor(r.action),
    reason: r.reason ?? undefined,
    ip: r.ip ?? undefined,
  };
}

// Most recent first. RLS decides which rows come back; the page adds a client-side text filter.
export async function fetchAuditLog(): Promise<AuditEntry[]> {
  const { data, error } = await supabase
    .from('audit_log')
    .select('id,actorId,action,entityType,townId,reason,ip,createdAt')
    .order('createdAt', { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as RawAuditRow[];

  // Resolve actor names/roles (from profiles, RLS-scoped) and town names in one round trip each.
  const actorIds = Array.from(new Set(rows.map((r) => r.actorId).filter((id): id is string => Boolean(id))));
  const townIds = Array.from(new Set(rows.map((r) => r.townId).filter((id): id is string => Boolean(id))));

  const actors = new Map<string, { name: string; role: string }>();
  if (actorIds.length > 0) {
    const { data: profs } = await supabase
      .from('profiles')
      .select('id,name,role_key')
      .in('id', actorIds);
    for (const p of (profs ?? []) as Array<{ id: string; name: string | null; role_key: string | null }>) {
      actors.set(p.id, {
        name: p.name?.trim() || 'Staff',
        role: p.role_key ? roleLabel(p.role_key) : 'Staff',
      });
    }
  }

  const townNames = new Map<string, string>();
  if (townIds.length > 0) {
    const { data: towns } = await supabase.from('towns').select('id,name').in('id', townIds);
    for (const t of (towns ?? []) as Array<{ id: string; name: string }>) {
      townNames.set(t.id, t.name);
    }
  }

  return rows.map((r) => mapAudit(r, actors, townNames));
}
