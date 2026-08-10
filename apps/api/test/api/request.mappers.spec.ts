import { describe, it, expect } from 'vitest';
import { BloodGroup, RhFactor, RequestStatus, RequestUrgency, RequestSource } from '@prisma/client';
import { toPublicRequest, toAdminRequest, formatReference } from '../../src/requests/request.mappers';

// A representative row as Prisma would return it (with the town relation included).
const req = {
  id: 'req1',
  reference: 'PBB-ABC123',
  patientName: 'Bibi Zarina',
  hospital: 'Civil Hospital, Quetta',
  townId: 'town-quetta',
  bloodGroup: BloodGroup.O,
  rhFactor: RhFactor.NEGATIVE,
  unitsNeeded: 3,
  urgency: RequestUrgency.CRITICAL,
  requesterName: 'Brother',
  requesterRelationship: 'Brother',
  requesterPhone: '0300 4412201',
  transportAvailable: false,
  exchangePossible: true,
  reportAvailable: false,
  caseNotes: 'ward 4',
  status: RequestStatus.OPEN,
  source: RequestSource.PUBLIC_FORM,
  createdAt: new Date('2026-08-10T09:00:00Z'),
  arrangedAt: null,
  closedAt: null,
  town: { name: 'Quetta' },
} as const;

describe('toPublicRequest() — INV-11 privacy', () => {
  const pub = toPublicRequest(req) as Record<string, unknown>;

  it('exposes only non-identifying fields', () => {
    expect(pub).toEqual({
      reference: 'PBB-ABC123',
      group: 'O−',
      bloodGroup: BloodGroup.O,
      rhFactor: RhFactor.NEGATIVE,
      unitsNeeded: 3,
      town: 'Quetta',
      urgency: RequestUrgency.CRITICAL,
      status: RequestStatus.OPEN,
      createdAt: req.createdAt,
    });
  });

  it('never leaks patient name, requester name, phone, or notes', () => {
    expect(pub.patientName).toBeUndefined();
    expect(pub.requesterName).toBeUndefined();
    expect(pub.requesterPhone).toBeUndefined();
    expect(pub.caseNotes).toBeUndefined();
  });
});

describe('toAdminRequest()', () => {
  it('includes the operational detail staff need', () => {
    const admin = toAdminRequest(req);
    expect(admin.patientName).toBe('Bibi Zarina');
    expect(admin.requesterPhone).toBe('0300 4412201');
    expect(admin.group).toBe('O−');
    expect(admin.hospital).toContain('Civil Hospital');
  });
});

describe('formatReference()', () => {
  it('produces a PBB-XXXXXX reference from a random token', () => {
    expect(formatReference('a1b2c3d4e5')).toBe('PBB-A1B2C3');
  });
  it('strips non-alphanumerics before slicing', () => {
    expect(formatReference('ab-cd-ef-gh')).toMatch(/^PBB-[A-Z0-9]{6}$/);
  });
});
