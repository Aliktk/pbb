import { Controller, Get, Injectable, Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../rbac/decorators';

@Injectable()
export class TownsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const data = await this.prisma.town.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, isOffice: true },
    });
    return { data };
  }
}

/** Public read of the town list, so forms and filters use real town ids (not free text). */
@Controller('towns')
export class TownsController {
  constructor(private readonly towns: TownsService) {}

  @Public()
  @Get()
  list() {
    return this.towns.list();
  }
}

@Module({
  controllers: [TownsController],
  providers: [TownsService],
})
export class TownsModule {}
