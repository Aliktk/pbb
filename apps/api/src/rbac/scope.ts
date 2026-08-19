import type { AuthUser } from './auth-user';
import { can } from './permissions';

/**
 * Town scope (INV-2). A user sees every town if their role holds the global wildcard
 * (head office admin), or if they are not pinned to a town (head office staff, townId null).
 * Everyone else is confined to their own town's rows.
 */
export function isGlobalScope(user?: Pick<AuthUser, 'permissions' | 'townId'> | null): boolean {
  if (!user) return true;
  return can(user.permissions, '*', '*') || user.townId === null;
}

/**
 * A Prisma `where` fragment that confines a query to the user's town - or `{}` for a
 * global-scope user. `field` is the town foreign key on the model being queried (townId).
 */
export function scopeWhere(
  user?: Pick<AuthUser, 'permissions' | 'townId'> | null,
  field = 'townId',
): Record<string, string> {
  if (!user || isGlobalScope(user)) return {};
  return { [field]: user.townId as string };
}
