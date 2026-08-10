import { describe, it, expect } from 'vitest';
import { isGlobalScope, scopeWhere } from '../../src/rbac/scope';
import type { PermissionMatrix } from '../../src/rbac/permissions';

const wildcard: PermissionMatrix = { '*': ['*'] };
const scoped: PermissionMatrix = { donors: ['read', 'write'] };

describe('isGlobalScope()', () => {
  it('is global for the wildcard role even when pinned to a town', () => {
    expect(isGlobalScope({ permissions: wildcard, townId: 'town-quetta' })).toBe(true);
  });

  it('is global for a head-office user with no town', () => {
    expect(isGlobalScope({ permissions: scoped, townId: null })).toBe(true);
  });

  it('is confined for a branch user with a town', () => {
    expect(isGlobalScope({ permissions: scoped, townId: 'town-zhob' })).toBe(false);
  });
});

describe('scopeWhere()', () => {
  it('returns an empty filter for global scope', () => {
    expect(scopeWhere({ permissions: wildcard, townId: 'town-quetta' })).toEqual({});
  });

  it('confines to the user town otherwise', () => {
    expect(scopeWhere({ permissions: scoped, townId: 'town-zhob' })).toEqual({ townId: 'town-zhob' });
  });

  it('honours a custom field name', () => {
    expect(scopeWhere({ permissions: scoped, townId: 'town-zhob' }, 'donorTownId')).toEqual({
      donorTownId: 'town-zhob',
    });
  });
});
