import { Prisma, type BloodGroup, type RhFactor } from '@prisma/client';
import { scopeWhere } from '../rbac/scope';
import type { AuthUser } from '../rbac/auth-user';

export interface DonorFilters {
  q?: string;
  group?: BloodGroup;
  rh?: RhFactor;
  townId?: string;
}

/**
 * Build the Prisma `where` for a donor list/search. Always excludes removed donors and applies
 * the caller's town scope (INV-2). A town-scoped user can never widen past their own town, even
 * by passing a different townId — the scope wins.
 */
export function donorListWhere(f: DonorFilters, user: AuthUser): Prisma.DonorWhereInput {
  const scope = scopeWhere(user); // {} (global) or { townId }
  const where: Prisma.DonorWhereInput = { deletedAt: null, ...scope };

  if (f.group) where.bloodGroup = f.group;
  if (f.rh) where.rhFactor = f.rh;
  // Only a global-scope caller may pick a town; a scoped caller is pinned to theirs.
  if (!scope.townId && f.townId) where.townId = f.townId;

  const q = f.q?.trim();
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q } },
      { mrNo: { contains: q, mode: 'insensitive' } },
    ];
  }
  return where;
}

/** Which eligibility statuses count as callable for the emergency search. */
export function callableStatuses(includeCooldown: boolean): string[] {
  return includeCooldown ? ['ELIGIBLE', 'COOLDOWN'] : ['ELIGIBLE'];
}
