// Admin panel model: sidebar groups, roles, and the ONE eligibility rule shared by the
// register, the record sheet and the search (so they cannot disagree — INV-5). Ported from
// pbb-admin.js. Design phase: data is in-memory sample data; wires to the API later.

export type RoleKey = 'head' | 'mgr' | 'emp';

export interface Role {
  key: RoleKey;
  who: string;
  sub: string;
  scope: string | null; // town scope; null = all branches
  short: string; // role-switcher label
}

export const ROLES: Role[] = [
  { key: 'head', who: 'Head office', sub: 'Sees all fourteen towns', scope: null, short: 'Head office' },
  { key: 'mgr', who: 'Zhob branch manager', sub: 'Sees Zhob only', scope: 'Zhob', short: 'Zhob' },
  { key: 'emp', who: 'Data entry, Pishin', sub: 'Adds and edits donors', scope: 'Pishin', short: 'Data entry' },
];

// Which views each role may reach (null = all). Mirrors ALLOW in the prototype.
export const ALLOW: Record<RoleKey, string[] | null> = {
  head: null,
  mgr: ['overview', 'requests', 'find', 'inventory', 'inbox', 'whatsapp', 'donors', 'volunteers', 'thalassemia', 'ledger', 'record', 'partners', 'reports', 'branches', 'accounts', 'audit', 'profile'],
  emp: ['overview', 'requests', 'find', 'inventory', 'donors', 'record', 'profile'],
};

export const LANDING: Record<RoleKey, string> = { head: 'overview', mgr: 'overview', emp: 'requests' };

// Sidebar groups: [group title, [ [view, label], … ] ]. Ported from AGROUPS.
export const ADMIN_GROUPS: [string, [string, string][]][] = [
  ['Operations', [['overview', 'Overview'], ['requests', 'Blood requests'], ['find', 'Find donors'], ['inventory', 'Inventory'], ['inbox', 'Inbox'], ['whatsapp', 'WhatsApp']]],
  ['Registry', [['donors', 'Donors'], ['volunteers', 'Volunteers'], ['thalassemia', 'Thalassemia'], ['ledger', 'Donations ledger'], ['record', 'Record a donation']]],
  ['Content', [['homepage', 'Homepage'], ['pages', 'Pages'], ['announcements', 'Announcements'], ['events', 'Events'], ['media', 'Media']]],
  ['Network', [['network', 'All towns'], ['partners', 'Partners & organisations'], ['reports', 'Reports']]],
  ['Organisation', [['branches', 'Branches'], ['settings', 'Site settings'], ['accounts', 'Accounts & hierarchy'], ['roles', 'Roles & access'], ['data', 'Data'], ['audit', 'Log']]],
  ['You', [['profile', 'Your account']]],
];

// Mobile bottom-bar items: [view, label, glyph]. Ported from ANAV.
export const ADMIN_MOBNAV: [string, string, string][] = [
  ['overview', 'Overview', '◎'], ['requests', 'Requests', '✚'], ['donors', 'Donors', '≡'], ['find', 'Find', '⌕'],
];

export const GROUPS = ['O+', 'O−', 'A+', 'A−', 'B+', 'B−', 'AB+', 'AB−'] as const;
export const ISSUE: Record<string, string> = { 'W/O/R': 'Without replacement', 'W/R': 'With replacement', 'P/D': 'Patient donation' };
export const TESTS: [string, string][] = [['hcv', 'HCV'], ['hiv', 'HIV'], ['hbs', 'HBs/IG'], ['vdrl', 'VDRL'], ['mp', 'MP']];

export function daysSince(date: string | null): number | null {
  return date ? Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000) : null;
}

export interface Screening { hcv: string; hiv: string; hbs: string; vdrl: string; mp: string }

export interface Donor {
  id: number; n: string; g: string; p: string; c: string; last: string | null; times: number;
  mr: string; dob: string; emg: string; emgr: string; addr: string; ml: number; freq: string;
  issue: string; tests: Screening | null; tested: string | null; defer: string | null;
}

export function allNegative(tests: Screening | null): boolean | null {
  return tests ? TESTS.every(([k]) => tests[k as keyof Screening] === '-ve') : null;
}

export interface Eligibility { ok: 0 | 1; tag: 'ok' | 'no' | 'gy' | 'wt'; lab: string; why: string }

/**
 * DESIGN-PHASE ONLY. Mirrors the DB `donor_eligibility` view so the admin can render the
 * sample data offline. Once the web is wired to the API, eligibility comes from the server
 * (which reads the view) and this function — the only place 90/180 appear in the web — is
 * deleted. Tracked by INV-5-web in scripts/invariants/run.mjs until then.
 */
export function elig(d: Donor): Eligibility {
  if (d.defer) return { ok: 0, tag: 'no', lab: 'Deferred', why: 'Deferred — ' + d.defer };
  if (!d.tests) return { ok: 0, tag: 'gy', lab: 'Not screened', why: 'Not screened — the five tests must be done first' };
  if (!allNegative(d.tests)) return { ok: 0, tag: 'no', lab: 'Reactive', why: 'A screening result was reactive. Do not call.' };
  const sd = daysSince(d.tested);
  if (sd !== null && sd > 180) return { ok: 0, tag: 'wt', lab: 'Screen again', why: 'Screened ' + sd + ' days ago. Repeat before issuing.' };
  const n = daysSince(d.last);
  if (n !== null && n < 90) return { ok: 0, tag: 'wt', lab: 90 - n + ' days to wait', why: 'Can give again in ' + (90 - n) + ' days' };
  return { ok: 1, tag: 'ok', lab: 'Can give', why: 'Yes, today' };
}
