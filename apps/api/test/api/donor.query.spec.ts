import { describe, it, expect } from 'vitest';
import { BloodGroup, RhFactor } from '@prisma/client';
import { donorListWhere, callableStatuses } from '../../src/donors/donor.query';
import type { AuthUser } from '../../src/rbac/auth-user';

const globalUser: AuthUser = {
  id: 'u0', name: 'Head', email: 'h@pbb.org', phone: null, avatarUrl: null, roleId: 'r0', roleName: 'Head Office Admin',
  level: 0, townId: 'town-quetta', status: 'ACTIVE', permissions: { '*': ['*'] },
};
const scopedUser: AuthUser = {
  id: 'u1', name: 'Mgr', email: 'm@pbb.org', phone: null, avatarUrl: null, roleId: 'r2', roleName: 'Branch Manager',
  level: 2, townId: 'town-zhob', status: 'ACTIVE', permissions: { donors: ['read', 'write'] },
};

describe('donorListWhere()', () => {
  it('always excludes removed donors', () => {
    expect(donorListWhere({}, globalUser).deletedAt).toBeNull();
  });

  it('applies no town filter for a global-scope user', () => {
    expect(donorListWhere({}, globalUser).townId).toBeUndefined();
  });

  it('confines a scoped user to their own town', () => {
    expect(donorListWhere({}, scopedUser).townId).toBe('town-zhob');
  });

  it('ignores a townId a scoped user tries to pass (cannot widen scope)', () => {
    expect(donorListWhere({ townId: 'town-quetta' }, scopedUser).townId).toBe('town-zhob');
  });

  it('lets a global user filter by a chosen town', () => {
    expect(donorListWhere({ townId: 'town-chaman' }, globalUser).townId).toBe('town-chaman');
  });

  it('maps group/rh filters through', () => {
    const where = donorListWhere({ group: BloodGroup.O, rh: RhFactor.NEGATIVE }, globalUser);
    expect(where.bloodGroup).toBe(BloodGroup.O);
    expect(where.rhFactor).toBe(RhFactor.NEGATIVE);
  });

  it('builds a name/phone/mr OR search', () => {
    const where = donorListWhere({ q: 'kakar' }, globalUser);
    expect(where.OR).toHaveLength(3);
  });
});

describe('callableStatuses()', () => {
  it('is ELIGIBLE-only by default', () => {
    expect(callableStatuses(false)).toEqual(['ELIGIBLE']);
  });
  it('adds COOLDOWN when asked', () => {
    expect(callableStatuses(true)).toContain('COOLDOWN');
  });
});
