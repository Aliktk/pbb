// Role presentation helpers for the Supabase-direct model.
//
// The real access rules live in the database (Row Level Security in supabase/migrations).
// These maps are ONLY for the UI: a friendly label to show, and a coarse permission map so the
// panel can hide buttons a role would not use. The server (RLS) is what actually enforces access,
// so nothing here is a security boundary.

export type RoleKey = 'head' | 'manager' | 'coordinator' | 'clerk' | 'lab' | 'editor' | 'viewer';

interface RoleMeta {
  label: string;
  level: number;
  permissions: Record<string, string[]>;
}

const ALL: Record<string, string[]> = { '*': ['*'] };

// Coarse, presentation-only permission map keyed by role. Kept generous for senior roles; RLS
// still decides what each call may actually read or write.
const ROLES: Record<RoleKey, RoleMeta> = {
  head: { label: 'Head office', level: 100, permissions: ALL },
  manager: { label: 'Town manager', level: 80, permissions: ALL },
  coordinator: {
    label: 'Coordinator',
    level: 60,
    permissions: { donors: ['read'], requests: ['read', 'update'], screenings: ['read'] },
  },
  clerk: {
    label: 'Clerk',
    level: 40,
    permissions: { donors: ['read', 'create', 'update'], requests: ['read'] },
  },
  lab: {
    label: 'Lab',
    level: 40,
    permissions: { donors: ['read'], screenings: ['read', 'create'] },
  },
  editor: {
    label: 'Content editor',
    level: 30,
    permissions: { content: ['read', 'update'], media: ['read', 'update'], pages: ['read', 'update'] },
  },
  viewer: { label: 'Viewer', level: 10, permissions: { donors: ['read'], requests: ['read'] } },
};

function metaFor(roleKey: string): RoleMeta {
  return ROLES[(roleKey as RoleKey)] ?? ROLES.viewer;
}

export function roleLabel(roleKey: string): string {
  return metaFor(roleKey).label;
}

export function roleLevel(roleKey: string): number {
  return metaFor(roleKey).level;
}

export function permissionsFor(roleKey: string): Record<string, string[]> {
  return metaFor(roleKey).permissions;
}
