// Shapes returned by the PBB API (apps/api). Kept in one place so the client and every screen
// agree with the server responses. These mirror the API's response mappers.

export interface ApiRole {
  id: string;
  name: string;
  level: number;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: ApiRole;
  townId: string | null;
  status: string;
  permissions: Record<string, string[]>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

export interface Paged<T> {
  data: T[];
  meta: { total: number; page?: number; pageSize?: number };
}

export interface DonorRow {
  id: string;
  mrNo: string;
  name: string;
  group: string;
  bloodGroup: string;
  rhFactor: string;
  phone: string | null;
  town: string | null;
  townId: string;
  lastDonatedAt: string | null;
  timesDonated: number;
  consentToCall: boolean;
  eligibility: string;
}

export interface AdminRequestRow {
  id: string;
  reference: string;
  patientName: string | null;
  hospital: string;
  town: string;
  townId: string;
  group: string;
  bloodGroup: string;
  rhFactor: string;
  unitsNeeded: number;
  urgency: string;
  status: string;
  source: string;
  requesterName: string;
  requesterRelationship: string | null;
  requesterPhone: string;
  transportAvailable: boolean;
  exchangePossible: boolean;
  caseNotes: string | null;
  createdAt: string;
  arrangedAt: string | null;
  closedAt: string | null;
}

export interface PublicRequestRow {
  reference: string;
  group: string;
  bloodGroup: string;
  rhFactor: string;
  unitsNeeded: number;
  town: string;
  urgency: string;
  status: string;
  createdAt: string;
}
