import { describe, it, expect } from 'vitest';
import { can, canAssignRole, type PermissionMatrix } from '../../src/rbac/permissions';

// The seeded matrices (prisma/seed.ts) - kept in sync so the tests exercise real shapes.
const HEAD_ADMIN: PermissionMatrix = { '*': ['*'] };
const BRANCH_MANAGER: PermissionMatrix = {
  donors: ['read', 'write'],
  requests: ['read', 'write'],
  inventory: ['read', 'write'],
  accounts: ['read', 'write'],
  analytics: ['read'],
};
const VIEWER: PermissionMatrix = { donors: ['read'], requests: ['read'], analytics: ['read'] };

describe('can()', () => {
  it('grants everything to the wildcard role', () => {
    expect(can(HEAD_ADMIN, 'donors', 'write')).toBe(true);
    expect(can(HEAD_ADMIN, 'anything', 'delete')).toBe(true);
  });

  it('honours resource + action for a scoped role', () => {
    expect(can(BRANCH_MANAGER, 'donors', 'write')).toBe(true);
    expect(can(BRANCH_MANAGER, 'analytics', 'read')).toBe(true);
  });

  it('denies actions the role does not hold', () => {
    expect(can(BRANCH_MANAGER, 'analytics', 'write')).toBe(false);
    expect(can(BRANCH_MANAGER, 'content', 'write')).toBe(false);
    expect(can(VIEWER, 'donors', 'write')).toBe(false);
    expect(can(VIEWER, 'requests', 'write')).toBe(false);
  });

  it('denies against a null/empty matrix (fail-closed)', () => {
    expect(can(null, 'donors', 'read')).toBe(false);
    expect(can(undefined, 'donors', 'read')).toBe(false);
    expect(can({}, 'donors', 'read')).toBe(false);
  });

  it('supports an action wildcard on a single resource', () => {
    expect(can({ donors: ['*'] }, 'donors', 'delete')).toBe(true);
    expect(can({ donors: ['*'] }, 'requests', 'read')).toBe(false);
  });
});

describe('canAssignRole()', () => {
  it('lets a creator grant only strictly weaker roles', () => {
    expect(canAssignRole(2, 3)).toBe(true); // manager (2) → coordinator (3)
    expect(canAssignRole(2, 5)).toBe(true);
  });

  it('refuses granting a role at or above the creator', () => {
    expect(canAssignRole(2, 2)).toBe(false); // never a peer
    expect(canAssignRole(2, 1)).toBe(false); // never a senior
    expect(canAssignRole(0, 0)).toBe(false);
  });
});
