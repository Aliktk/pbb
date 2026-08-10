import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';
import { NOTIFICATION_PORT } from './notifications/notification.port';
import { ConsoleNotifier } from './notifications/console.notifier';
import { AuthModule } from './auth/auth.module';
import { DonorsModule } from './donors/donors.module';
import { RequestsModule } from './requests/requests.module';
import { JwtAuthGuard } from './rbac/jwt-auth.guard';
import { PermissionsGuard } from './rbac/permissions.guard';

/**
 * Root module. Feature modules (InventoryModule, ContentModule, NotificationsModule) register
 * here as they land — each owned by exactly one track (see docs/BUILD-PLAN.md file-ownership).
 *
 * Security is global and fail-closed: JwtAuthGuard authenticates every route (except @Public),
 * then PermissionsGuard enforces @Permissions(...). A new endpoint is therefore locked by
 * default — it must opt out with @Public() or opt in with @Permissions().
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { ttl: 60_000, limit: Number(process.env.RATE_LIMIT_PUBLIC_PER_MIN ?? 20) },
    ]),
    PrismaModule,
    AuthModule,
    DonorsModule,
    RequestsModule,
  ],
  controllers: [HealthController],
  providers: [
    // Notification driver is selected by env; console is the safe default.
    { provide: NOTIFICATION_PORT, useClass: ConsoleNotifier },
    // Order matters: authenticate first, then authorize.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
