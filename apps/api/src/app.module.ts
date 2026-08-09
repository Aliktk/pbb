import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';
import { NOTIFICATION_PORT } from './notifications/notification.port';
import { ConsoleNotifier } from './notifications/console.notifier';

/**
 * Root module. Wave 1+ feature modules (AuthModule, DonorsModule, RequestsModule,
 * InventoryModule, ContentModule, NotificationsModule) register here as they land — each
 * owned by exactly one track (see docs/BUILD-PLAN.md file-ownership map).
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { ttl: 60_000, limit: Number(process.env.RATE_LIMIT_PUBLIC_PER_MIN ?? 20) },
    ]),
    PrismaModule,
  ],
  controllers: [HealthController],
  providers: [
    // Notification driver is selected by env; console is the safe default.
    { provide: NOTIFICATION_PORT, useClass: ConsoleNotifier },
  ],
})
export class AppModule {}
