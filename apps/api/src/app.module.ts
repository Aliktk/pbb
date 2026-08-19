import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';
import { NOTIFICATION_PORT } from './notifications/notification.port';
import { ConsoleNotifier } from './notifications/console.notifier';
import { AuthModule } from './auth/auth.module';
import { DonorsModule } from './donors/donors.module';
import { RequestsModule } from './requests/requests.module';
import { TownsModule } from './towns/towns.module';
import { InventoryModule } from './inventory/inventory.module';
import { VolunteersModule } from './volunteers/volunteers.module';
import { ThalassemiaModule } from './thalassemia/thalassemia.module';
import { DonationsModule } from './donations/donations.module';
import { PartnersModule } from './partners/partners.module';
import { MessagesModule } from './messages/messages.module';
import { BranchesModule } from './branches/branches.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuditModule } from './audit/audit.module';
import { JwtAuthGuard } from './rbac/jwt-auth.guard';
import { PermissionsGuard } from './rbac/permissions.guard';

/**
 * Root module. Feature modules register here as they land.
 *
 * Security is global and fail-closed: JwtAuthGuard authenticates every route (except @Public),
 * then PermissionsGuard enforces @Permissions(...). A new endpoint is therefore locked by
 * default - it must opt out with @Public() or opt in with @Permissions().
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    ThrottlerModule.forRoot([
      { ttl: 60_000, limit: Number(process.env.RATE_LIMIT_DEFAULT_PER_MIN ?? 120) },
    ]),
    PrismaModule,
    AuthModule,
    DonorsModule,
    RequestsModule,
    TownsModule,
    InventoryModule,
    VolunteersModule,
    ThalassemiaModule,
    DonationsModule,
    PartnersModule,
    MessagesModule,
    BranchesModule,
    UsersModule,
    RolesModule,
    AuditModule,
  ],
  controllers: [HealthController],
  providers: [
    // Notification driver is selected by env; console is the safe default.
    { provide: NOTIFICATION_PORT, useClass: ConsoleNotifier },
    // Guard order: throttle first (cheap, blocks floods before any DB work), then authenticate,
    // then authorize.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
