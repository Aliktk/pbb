import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../rbac/auth-user';
import type { PermissionMatrix } from '../rbac/permissions';

interface AccessPayload {
  sub: string;
}

/**
 * Validates the bearer access token and rebuilds the AuthUser from the database on every
 * request. Loading fresh (rather than trusting claims in the token) means a suspended account
 * or a changed role stops working immediately, not when the token happens to expire.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: AccessPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException();
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
      level: user.role.level,
      townId: user.townId,
      status: user.status,
      permissions: (user.role.permissions ?? {}) as PermissionMatrix,
    };
  }
}
