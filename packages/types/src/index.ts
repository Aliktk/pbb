// Shared DTOs + Zod schemas. Validation at the system boundary (coding-style: validate
// all external input). The seven eligibility states are the ONE source (INV-5) shared by
// API and Web so no screen invents its own copy.

import { z } from 'zod';

export const ELIGIBILITY_STATES = [
  'REMOVED',
  'DEFERRED',
  'NEVER_SCREENED',
  'REACTIVE',
  'SCREENING_STALE',
  'COOLDOWN',
  'ELIGIBLE',
] as const;
export type EligibilityStatus = (typeof ELIGIBILITY_STATES)[number];

export const BLOOD_GROUPS = ['A', 'B', 'AB', 'O'] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const RH_FACTORS = ['POSITIVE', 'NEGATIVE'] as const;
export type RhFactor = (typeof RH_FACTORS)[number];

/** Human label for a group, e.g. { A, POSITIVE } → "A+". The ONLY place +/− is derived. */
export function bloodLabel(group: BloodGroup, rh: RhFactor): string {
  return `${group}${rh === 'POSITIVE' ? '+' : '−'}`;
}

export const screeningResult = z.enum(['NEGATIVE', 'POSITIVE', 'PENDING']);

// Public blood-request intake (the emergency form). Server re-validates; never trust the client.
export const createRequestSchema = z.object({
  hospital: z.string().min(2).max(160),
  townId: z.string().min(1),
  bloodGroup: z.enum(BLOOD_GROUPS),
  rhFactor: z.enum(RH_FACTORS),
  unitsNeeded: z.number().int().min(1).max(20).default(1),
  urgency: z.enum(['ROUTINE', 'URGENT', 'CRITICAL']).default('URGENT'),
  patientName: z.string().max(120).optional(), // stored, never returned publicly (INV-11)
  requesterName: z.string().min(2).max(120),
  requesterRelationship: z.string().max(60).optional(),
  requesterPhone: z.string().min(7).max(20),
  transportAvailable: z.boolean().default(false),
  exchangePossible: z.boolean().default(true),
  reportAvailable: z.boolean().default(false),
  caseNotes: z.string().max(1000).optional(),
  // honeypot: must be empty; a filled value is a bot (public form hardening, §4)
  website: z.string().max(0).optional(),
});
export type CreateRequestInput = z.infer<typeof createRequestSchema>;

// Emergency search query — the whole product (§8.1). p95 < 200ms at 50k donors.
export const eligibleSearchSchema = z.object({
  bloodGroup: z.enum(BLOOD_GROUPS),
  rhFactor: z.enum(RH_FACTORS),
  townId: z.string().optional(),
  limit: z.number().int().min(1).max(200).default(50),
});
export type EligibleSearchInput = z.infer<typeof eligibleSearchSchema>;

// A donor row as it appears in a NON-privileged context: no phone number (INV-11).
export interface PublicNeed {
  reference: string;
  town: string;
  bloodGroup: BloodGroup;
  rhFactor: RhFactor;
  unitsNeeded: number;
  urgency: 'ROUTINE' | 'URGENT' | 'CRITICAL';
  createdAt: string;
  // NOTE: intentionally no patientName, no requesterPhone.
}

// Standard API envelope (patterns.md: consistent response shape).
export interface ApiOk<T> {
  ok: true;
  data: T;
  meta?: { total: number; page: number; limit: number };
}
export interface ApiErr {
  ok: false;
  error: { code: string; message: string; details?: unknown };
}
export type ApiResponse<T> = ApiOk<T> | ApiErr;
