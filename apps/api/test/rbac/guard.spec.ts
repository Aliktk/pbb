import { describe, it, expect } from 'vitest';
import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { PermissionsGuard } from '../../src/rbac/permissions.guard';
import { IS_PUBLIC_KEY, PERMISSIONS_KEY } from '../../src/rbac/decorators';
import type { AuthUser } from '../../src/rbac/auth-user';

// A reflector stub returning the public flag and the required-permissions list per metadata key.
function reflector(required: string[] | undefined, isPublic = false): Reflector {
  return {
    getAllAndOverride: (key: string) => (key === IS_PUBLIC_KEY ? isPublic : required),
  } as unknown as Reflector;
}

function context(user: AuthUser | undefined): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

const manager: AuthUser = {
  id: 'u1',
  name: 'Branch Manager',
  email: 'm@pbb.org',
  roleId: 'role-manager',
  roleName: 'Branch Manager',
  level: 2,
  townId: 'town-zhob',
  status: 'ACTIVE',
  permissions: { donors: ['read', 'write'], requests: ['read', 'write'] },
};

describe('PermissionsGuard', () => {
  it('allows a route with no @Permissions() (auth-only)', () => {
    const guard = new PermissionsGuard(reflector(undefined));
    expect(guard.canActivate(context(manager))).toBe(true);
  });

  it('allows when the user holds every required permission', () => {
    const guard = new PermissionsGuard(reflector(['donors:read', 'donors:write']));
    expect(guard.canActivate(context(manager))).toBe(true);
  });

  it('forbids when any required permission is missing', () => {
    const guard = new PermissionsGuard(reflector(['content:write']));
    expect(() => guard.canActivate(context(manager))).toThrow(ForbiddenException);
  });

  it('skips checks entirely for @Public() routes', () => {
    const guard = new PermissionsGuard(reflector(['content:write'], true));
    expect(guard.canActivate(context(undefined))).toBe(true);
  });

  it('forbids when there is no authenticated user', () => {
    const guard = new PermissionsGuard(reflector(['donors:read']));
    expect(() => guard.canActivate(context(undefined))).toThrow(ForbiddenException);
  });
});
