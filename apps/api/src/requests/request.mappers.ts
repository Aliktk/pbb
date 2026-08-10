import type { BloodRequest, Town } from '@prisma/client';
import { groupLabel } from '../common/blood-group';

type RequestWithTown = BloodRequest & { town: Pick<Town, 'name'> };

/**
 * PUBLIC projection of a request (INV-11). NEVER includes the patient name, the requester name,
 * any phone number, or case notes - only what the public "who needs blood now" board may show.
 */
export function toPublicRequest(r: RequestWithTown) {
  return {
    reference: r.reference,
    group: groupLabel(r.bloodGroup, r.rhFactor),
    bloodGroup: r.bloodGroup,
    rhFactor: r.rhFactor,
    unitsNeeded: r.unitsNeeded,
    town: r.town.name,
    urgency: r.urgency,
    status: r.status,
    createdAt: r.createdAt,
  };
}

/** ADMIN projection - the full record staff need to act on the request. */
export function toAdminRequest(r: RequestWithTown) {
  return {
    id: r.id,
    reference: r.reference,
    patientName: r.patientName,
    hospital: r.hospital,
    town: r.town.name,
    townId: r.townId,
    group: groupLabel(r.bloodGroup, r.rhFactor),
    bloodGroup: r.bloodGroup,
    rhFactor: r.rhFactor,
    unitsNeeded: r.unitsNeeded,
    urgency: r.urgency,
    status: r.status,
    source: r.source,
    requesterName: r.requesterName,
    requesterRelationship: r.requesterRelationship,
    requesterPhone: r.requesterPhone,
    transportAvailable: r.transportAvailable,
    exchangePossible: r.exchangePossible,
    caseNotes: r.caseNotes,
    createdAt: r.createdAt,
    arrangedAt: r.arrangedAt,
    closedAt: r.closedAt,
  };
}

/** Format a request reference from a random token. Kept pure so the format is unit-tested. */
export function formatReference(rand: string): string {
  return `PBB-${rand.replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase()}`;
}
