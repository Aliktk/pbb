import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../rbac/auth-user';
import type { PermissionMatrix } from '../rbac/permissions';
import type { LoginDto } from './dto/login.dto';

const DAY_MS = 86_400_000;
const DEFAULT_REFRESH_TTL_MS = 30 * DAY_MS;

/** Parse a duration like "30d", "12h", "45m", "3600s" into ms. Returns null if unparseable. */
function parseDurationMs(value: string | undefined): number | null {
  if (!value) return null;
  const m = /^(\d+)\s*([smhd])$/.exec(value.trim());
  if (!m) return null;
  const n = Number(m[1]);
  const unit = { s: 1000, m: 60_000, h: 3_600_000, d: DAY_MS }[m[2] as 's' | 'm' | 'h' | 'd'];
  return n * unit;
}

/** The safe, public-facing shape of a user - never the password hash or 2FA secret. */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: { id: string; name: string; level: number };
  townId: string | null;
  status: string;
  permissions: PermissionMatrix;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

@Injectable()
export class AuthService {
  private readonly refreshSecret: string;
  private readonly refreshTtlMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    config: ConfigService,
  ) {
    // Fail loud if the refresh secret is absent - a missing pepper must never silently
    // degrade to unpeppered hashes.
    this.refreshSecret = config.getOrThrow<string>('JWT_REFRESH_SECRET');
    this.refreshTtlMs = parseDurationMs(config.get<string>('JWT_REFRESH_TTL')) ?? DEFAULT_REFRESH_TTL_MS;
  }

  /** Email + password → access + rotating refresh token. Generic errors: no user enumeration. */
  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { role: true },
    });
    const invalid = new UnauthorizedException('Invalid email or password');
    if (!user || user.status !== 'ACTIVE' || !user.passwordHash) throw invalid;

    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) throw invalid;

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastSignInAt: new Date() },
    });

    return this.issue(user.id, this.toPublicUser(user));
  }

  /** Rotate a refresh token: the old one is revoked and a fresh pair is issued. */
  async refresh(rawToken: string): Promise<AuthTokens> {
    const tokenHash = this.hashToken(rawToken);
    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { role: true } } },
    });
    const invalid = new UnauthorizedException('Invalid or expired session');
    if (!record || record.revokedAt || record.expiresAt < new Date()) throw invalid;
    if (record.user.status !== 'ACTIVE') throw invalid;

    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });

    return this.issue(record.userId, this.toPublicUser(record.user));
  }

  /** Revoke a refresh token. Idempotent - an unknown token is a no-op, never an error. */
  async logout(rawToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Map the request-scoped AuthUser to its public shape (used by GET /auth/me). */
  publicUser(user: AuthUser): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      avatarUrl: user.avatarUrl || null,
      role: { id: user.roleId, name: user.roleName, level: user.level },
      townId: user.townId,
      status: user.status,
      permissions: user.permissions,
    };
  }

  // ── internals ────────────────────────────────────────────────────────────

  private async issue(userId: string, user: PublicUser): Promise<AuthTokens> {
    const accessToken = await this.jwt.signAsync({ sub: userId });
    const refreshToken = await this.createRefreshToken(userId);
    return { accessToken, refreshToken, user };
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const raw = randomBytes(48).toString('base64url');
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(raw),
        expiresAt: new Date(Date.now() + this.refreshTtlMs),
      },
    });
    return raw;
  }

  private hashToken(raw: string): string {
    return createHmac('sha256', this.refreshSecret).update(raw).digest('hex');
  }

  private toPublicUser(user: any): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      avatarUrl: user.avatarUrl || null,
      role: { id: user.role.id, name: user.role.name, level: user.role.level },
      townId: user.townId,
      status: user.status,
      permissions: (user.role.permissions ?? {}) as PermissionMatrix,
    };
  }
}
