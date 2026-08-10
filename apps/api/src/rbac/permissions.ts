// The permission matrix and the pure checks over it. This is the single source of the
// "what may this role do" decision (INV-10): guards, services and tests all call `can()` so
// they can never disagree. The matrix shape matches Role.permissions in the schema/seed:
//   { resource: [actions] }   with  '*'  meaning "all" for either a resource or an action.
// e.g. { '*': ['*'] } (head office admin), { donors: ['read','write'], requests: ['read'] }.

export type PermissionMatrix = Record<string, string[]>;

/** Does this permission matrix grant `action` on `resource`? Wildcards apply at both levels. */
export function can(perms: PermissionMatrix | null | undefined, resource: string, action: string): boolean {
  if (!perms) return false;
  const wildcard = perms['*'];
  if (wildcard && (wildcard.includes('*') || wildcard.includes(action))) return true;
  const res = perms[resource];
  return Boolean(res && (res.includes('*') || res.includes(action)));
}

/**
 * Role hierarchy: `level` is depth, lower = more senior (0 = head office admin). A creator
 * can only grant a role strictly weaker than their own - never at or above it (§8.3, T1). This
 * is the rule the account-creation flow (Wave 2) enforces; kept here so it is unit-tested and
 * shared, not re-derived per call site.
 */
export function canAssignRole(creatorLevel: number, targetLevel: number): boolean {
  return targetLevel > creatorLevel;
}
