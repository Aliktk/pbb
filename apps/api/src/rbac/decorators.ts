import { SetMetadata, createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthUser } from './auth-user';

/** Marks a route as public — the JWT and permission guards skip it. */
export const IS_PUBLIC_KEY = 'rbac:public';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Requires the caller's role to grant every listed permission (AND). Each entry is
 * "resource:action", e.g. @Permissions('donors:read'), @Permissions('donors:write').
 */
export const PERMISSIONS_KEY = 'rbac:permissions';
export const Permissions = (...perms: string[]) => SetMetadata(PERMISSIONS_KEY, perms);

/** Injects the authenticated user attached by the JWT strategy. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => ctx.switchToHttp().getRequest().user,
);
