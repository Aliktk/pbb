import { Injectable, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Single Prisma client for the whole API. Prisma is the schema authority and the only
 * path to the database - no raw pg pools elsewhere. Reads of the eligibility view go
 * through `donorEligibility` (a typed Prisma view), never through hand-written arithmetic.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
