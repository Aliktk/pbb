import type { PermissionMatrix } from './permissions';

/**
 * The authenticated principal attached to every request by the JWT strategy. Loaded fresh from
 * the database per request (so a suspended account or a changed permission takes effect at
 * once). Never contains the password hash or 2FA secret - only what authorization needs.
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  roleId: string;
  roleName: string;
  level: number;
  townId: string | null;
  status: string;
  permissions: PermissionMatrix;
}
