import {
  Injectable,
  CanActivate,
  ForbiddenException,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY, PERMISSIONS_KEY } from './decorators';
import { can } from './permissions';
import type { AuthUser } from './auth-user';

/**
 * Global authorization guard (INV-10). Runs after JwtAuthGuard, so req.user is set. Reads the
 * @Permissions(...) required by the handler and confirms the user's role grants every one.
 * Routes with no @Permissions() only require authentication; @Public() routes are skipped.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const required =
      this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];
    if (required.length === 0) return true;

    const user = context.switchToHttp().getRequest().user as AuthUser | undefined;
    if (!user) throw new ForbiddenException('No authenticated user');

    const ok = required.every((perm) => {
      const [resource, action] = perm.split(':');
      return can(user.permissions, resource, action);
    });
    if (!ok) throw new ForbiddenException('You do not have permission to do that');
    return true;
  }
}
