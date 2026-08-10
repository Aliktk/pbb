import { BloodGroup, RhFactor } from '@prisma/client';

/**
 * The one place blood group + Rh is turned into a display label ("O−", "AB+"). Uses the same
 * minus sign (U+2212) the web uses in BLOOD_GROUPS so the two never disagree visually.
 */
export function groupLabel(group: BloodGroup, rh: RhFactor): string {
  return `${group}${rh === RhFactor.POSITIVE ? '+' : '−'}`;
}
