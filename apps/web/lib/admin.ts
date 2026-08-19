// Admin panel model: sidebar groups, roles, and the ONE eligibility rule shared by the
// register, the record sheet and the search (so they cannot disagree - INV-5). Ported from
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
  mgr: ['overview', 'requests', 'find', 'inventory', 'inbox', 'donors', 'volunteers', 'thalassemia', 'ledger', 'record', 'partners', 'reports', 'branches', 'accounts', 'audit', 'profile'],
  emp: ['overview', 'requests', 'find', 'inventory', 'donors', 'record', 'profile'],
};

export const LANDING: Record<RoleKey, string> = { head: 'overview', mgr: 'overview', emp: 'requests' };

// Sidebar groups: [group title, [ [view, label], … ] ].
export const ADMIN_GROUPS: [string, [string, string][]][] = [
  [
    'Operations',
    [
      ['overview', 'Overview'],
      ['requests', 'Blood requests'],
      ['find', 'Find donors'],
      ['inbox', 'Inbox'],
      ['inventory', 'Inventory'],
    ],
  ],
  [
    'People',
    [
      ['donors', 'Donors'],
      ['thalassemia', 'Thalassemia'],
      ['volunteers', 'Volunteers'],
    ],
  ],
  [
    'Donations',
    [
      ['ledger', 'Donations ledger'],
      ['record', 'Record a donation'],
    ],
  ],
  [
    'Network',
    [
      ['network', 'All towns'],
      ['branches', 'Branches'],
      ['partners', 'Partners & organisations'],
    ],
  ],
  [
    'Insight',
    [
      ['reports', 'Reports'],
      ['audit', 'Log'],
      ['data', 'Data'],
    ],
  ],
  [
    'Settings & access',
    [
      ['accounts', 'Accounts & hierarchy'],
      ['roles', 'Roles & access'],
    ],
  ],
  [
    'You',
    [
      ['profile', 'Your account'],
    ],
  ],
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
  id: number; n: string; g: string; gx: 'Male' | 'Female'; p: string; c: string;
  last: string | null; times: number;
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
 * (which reads the view) and this function - the only place 90/180 appear in the web - is
 * deleted. Tracked by INV-5-web in scripts/invariants/run.mjs until then.
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  'Head Office Admin': ['overview', 'requests', 'find', 'inventory', 'inbox', 'donors', 'volunteers', 'thalassemia', 'ledger', 'record', 'network', 'partners', 'reports', 'branches', 'accounts', 'roles', 'data', 'audit', 'profile'],
  'Super Admin': ['overview', 'requests', 'find', 'inventory', 'inbox', 'donors', 'volunteers', 'thalassemia', 'ledger', 'record', 'network', 'partners', 'reports', 'branches', 'accounts', 'roles', 'data', 'audit', 'profile'],
  'Superadmin': ['overview', 'requests', 'find', 'inventory', 'inbox', 'donors', 'volunteers', 'thalassemia', 'ledger', 'record', 'network', 'partners', 'reports', 'branches', 'accounts', 'roles', 'data', 'audit', 'profile'],
  'Olus Yar': ['overview', 'requests', 'find', 'inventory', 'inbox', 'donors', 'volunteers', 'thalassemia', 'ledger', 'record', 'network', 'partners', 'reports', 'branches', 'accounts', 'roles', 'data', 'audit', 'profile'],
  'Executive': ['overview', 'requests', 'find', 'inventory', 'inbox', 'donors', 'volunteers', 'thalassemia', 'ledger', 'record', 'network', 'partners', 'reports', 'branches', 'accounts', 'roles', 'data', 'audit', 'profile'],
  'Executive Committee': ['overview', 'requests', 'find', 'inventory', 'inbox', 'donors', 'volunteers', 'thalassemia', 'ledger', 'record', 'network', 'partners', 'reports', 'branches', 'accounts', 'roles', 'data', 'audit', 'profile'],
  'Head Office Staff': ['overview', 'requests', 'find', 'inventory', 'donors', 'reports', 'accounts', 'profile'],
  'Branch Manager': ['overview', 'requests', 'find', 'inventory', 'donors', 'volunteers', 'record', 'branches', 'profile'],
  'Town Coordinator': ['overview', 'requests', 'find', 'inventory', 'donors', 'profile'],
  'Coordinator': ['overview', 'requests', 'find', 'inventory', 'donors', 'profile'],
  'Data Entry': ['overview', 'requests', 'find', 'donors', 'record', 'profile'],
  'Data Entry Clerk': ['overview', 'requests', 'find', 'donors', 'record', 'profile'],
  'Data Entry Officer': ['overview', 'requests', 'find', 'donors', 'record', 'profile'],
  'Accounts': ['overview', 'ledger', 'reports', 'audit', 'profile'],
  'Verifier': ['overview', 'requests', 'find', 'inventory', 'donors', 'volunteers', 'thalassemia', 'ledger', 'record', 'audit', 'profile'],
  'Volunteer Lead': ['overview', 'volunteers', 'profile'],
  'Medical / Lab Officer': ['overview', 'donors', 'record', 'profile'],
  'Content Editor': ['overview', 'reports', 'profile'],
  'Read Only': ['overview', 'requests', 'donors', 'reports', 'profile'],
};

export function isViewAllowedForRole(
  roleName: string | undefined,
  viewName: string,
  customMatrix?: Record<string, Record<string, string[]> | string[]>,
  userPermissions?: Record<string, string[]>
): boolean {
  if (!roleName) return false;
  const normalized = roleName.trim();

  // Top Admin Roles & Wildcard permissions have unrestricted access
  if (
    normalized === 'Head Office Admin' ||
    normalized === 'Super Admin' ||
    normalized === 'Superadmin' ||
    normalized === 'Olus Yar' ||
    normalized === 'Executive' ||
    (userPermissions && (userPermissions['*']?.includes('*') || userPermissions['*']?.includes('read')))
  ) {
    return true;
  }

  // Every signed-in user can view profile and overview
  if (viewName === 'profile' || viewName === 'overview') {
    return true;
  }

  // 1. Evaluate logged-in user's direct permissions matrix from auth session if provided
  if (userPermissions && typeof userPermissions === 'object') {
    const modPerms = userPermissions[viewName];
    if (Array.isArray(modPerms) && modPerms.length > 0) {
      return true;
    }
  }

  // 2. Evaluate custom matrix (passed as param or loaded from localStorage)
  let activeMatrix = customMatrix;
  if (!activeMatrix && typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('pbb_custom_role_matrix');
      if (saved) activeMatrix = JSON.parse(saved);
    } catch {}
  }

  if (activeMatrix) {
    const roleEntry = activeMatrix[normalized] || activeMatrix[roleName];
    if (roleEntry) {
      if (Array.isArray(roleEntry)) {
        if (roleEntry.includes(viewName)) return true;
      } else {
        const modulePerms = roleEntry[viewName];
        if (Array.isArray(modulePerms) && modulePerms.length > 0) {
          return true;
        }
      }
    }
  }

  // 3. Fall back to exact role permission mapping
  const allowedViews = DEFAULT_ROLE_PERMISSIONS[normalized];
  if (allowedViews) {
    return allowedViews.includes(viewName);
  }

  // 4. For any unmapped custom role, restrict access to essential operational views
  const restrictedFallback = ['overview', 'requests', 'find', 'donors', 'profile'];
  return restrictedFallback.includes(viewName);
}
