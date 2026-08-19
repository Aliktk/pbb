// Canonical role model for the Supabase-direct system. ONE source of truth for the UI, aligned
// exactly with the database policies in supabase/migrations (0001 + 0003).
//
// The real access rules live in the database (Row Level Security). These maps are for the UI:
// a friendly label, whether the role is org-wide or tied to one office/town, a coarse permission
// map (to hide buttons), and - importantly - who each role is allowed to create.

export type RoleKey = 'head' | 'manager' | 'coordinator' | 'clerk' | 'lab' | 'volunteer' | 'editor' | 'viewer';

export interface RoleMeta {
  key: RoleKey;
  label: string;
  level: number;
  /** true = one office/town; false = whole organisation (all towns). */
  scoped: boolean;
  description: string;
  permissions: Record<string, string[]>;
}

const ALL: Record<string, string[]> = { '*': ['*'] };

// Order matters: senior first. Drives listings and pickers.
export const ROLES: Record<RoleKey, RoleMeta> = {
  head: { key: 'head', label: 'Head office', level: 100, scoped: false, description: 'Super admin. All fourteen towns; creates and removes anyone.', permissions: ALL },
  manager: { key: 'manager', label: 'Office manager', level: 80, scoped: true, description: 'Runs one office and the people in it.', permissions: ALL },
  coordinator: { key: 'coordinator', label: 'Coordinator', level: 60, scoped: true, description: 'Answers requests and calls donors.', permissions: { donors: ['read'], requests: ['read', 'update'], screenings: ['read'] } },
  clerk: { key: 'clerk', label: 'Data entry', level: 50, scoped: true, description: 'Adds donors and donations.', permissions: { donors: ['read', 'create', 'update'], requests: ['read'] } },
  lab: { key: 'lab', label: 'Lab / verifier', level: 50, scoped: true, description: 'Screens and verifies donors.', permissions: { donors: ['read'], screenings: ['read', 'create'] } },
  volunteer: { key: 'volunteer', label: 'Volunteer lead', level: 40, scoped: true, description: 'Volunteers and camps.', permissions: { volunteers: ['read', 'update'], events: ['read', 'update'] } },
  editor: { key: 'editor', label: 'Content editor', level: 30, scoped: false, description: 'Website content only.', permissions: { content: ['read', 'update'], media: ['read', 'update'], pages: ['read', 'update'] } },
  viewer: { key: 'viewer', label: 'Viewer', level: 10, scoped: true, description: 'Read-only.', permissions: { donors: ['read'], requests: ['read'] } },
};

export const ROLE_ORDER: RoleKey[] = ['head', 'manager', 'coordinator', 'clerk', 'lab', 'volunteer', 'editor', 'viewer'];

// Which roles a creator may assign. MUST match the database policies:
//   - head invites/manages any role (0003 invites_create / profiles_manage: is_head()).
//   - manager invites/manages only these operational roles, and only in their own town.
//   - everyone else cannot create accounts.
const MANAGER_ASSIGNABLE: RoleKey[] = ['coordinator', 'clerk', 'lab', 'volunteer'];

export function assignableRoles(creatorRoleKey: string): RoleKey[] {
  if (creatorRoleKey === 'head') return ROLE_ORDER; // head office may grant any role, including another head
  if (creatorRoleKey === 'manager') return MANAGER_ASSIGNABLE;
  return [];
}

export function canCreateAccounts(roleKey: string): boolean {
  return assignableRoles(roleKey).length > 0;
}

function metaFor(roleKey: string): RoleMeta {
  return ROLES[(roleKey as RoleKey)] ?? ROLES.viewer;
}

export function roleLabel(roleKey: string): string {
  return metaFor(roleKey).label;
}

export function roleLevel(roleKey: string): number {
  return metaFor(roleKey).level;
}

export function roleIsScoped(roleKey: string): boolean {
  return metaFor(roleKey).scoped;
}

export function permissionsFor(roleKey: string): Record<string, string[]> {
  return metaFor(roleKey).permissions;
}
