import { Body, Controller, Delete, Get, Injectable, Module, Param, Patch, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../rbac/decorators';

const DEFAULT_TOWNS = [
  { name: 'Quetta', isOffice: true },
  { name: 'Pishin', isOffice: true },
  { name: 'Loralai', isOffice: true },
  { name: 'Zhob', isOffice: true },
  { name: 'Chaman', isOffice: true },
  { name: 'Muslim Bagh', isOffice: true },
  { name: 'Killa Saifullah', isOffice: false },
  { name: 'Dukki', isOffice: false },
  { name: 'Musakhel', isOffice: false },
  { name: 'Sherani', isOffice: false },
  { name: 'Harnai', isOffice: false },
  { name: 'Ziarat', isOffice: false },
  { name: 'Qila Abdullah', isOffice: false },
  { name: 'Sibi', isOffice: false },
];

export interface CreateTownDto {
  name: string;
  isOffice?: boolean;
  standing?: string;
  officeAddress?: string;
  managerName?: string;
}

@Injectable()
export class TownsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureSeeded() {
    const count = await this.prisma.town.count();
    if (count === 0) {
      for (const t of DEFAULT_TOWNS) {
        await this.prisma.town.create({ data: { name: t.name, isOffice: t.isOffice } }).catch(() => {});
      }
    }
  }

  async list() {
    await this.ensureSeeded();
    const data = await this.prisma.town.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, isOffice: true },
    });
    return { data };
  }

  async network() {
    await this.ensureSeeded();
    const towns = await this.prisma.town.findMany({
      orderBy: { name: 'asc' },
    });

    const items = await Promise.all(
      towns.map(async (t) => {
        const townFilter = {
          OR: [
            { townId: t.id },
            { town: { name: { equals: t.name, mode: 'insensitive' as const } } },
          ],
        };

        const [donorsCount, volunteersCount, childrenCount, requestsCount] = await Promise.all([
          this.prisma.donor.count({ where: { ...townFilter, deletedAt: null } }).catch(() => 0),
          this.prisma.volunteer.count({ where: { ...townFilter } }).catch(() => 0),
          this.prisma.thalassemiaPatient.count({ where: { ...townFilter } }).catch(() => 0),
          this.prisma.bloodRequest.count({ where: { ...townFilter, status: 'OPEN' } }).catch(() => 0),
        ]);

        return {
          id: t.id,
          name: t.name,
          standing: t.name.toLowerCase() === 'quetta' ? 'Head office' : t.isOffice ? 'Branch' : 'Served Town',
          isOffice: t.isOffice,
          donorsCount,
          volunteersCount,
          childrenCount,
          openRequests: requestsCount,
          lastStockUpdate: 'today',
          officeAddress: t.isOffice ? `${t.name} Central Office` : undefined,
          managerName: t.isOffice ? `${t.name} Area Desk` : undefined,
        };
      })
    );

    return { data: items };
  }

  async create(dto: CreateTownDto) {
    const isOffice = dto.isOffice ?? (dto.standing ? dto.standing.toLowerCase().includes('branch') || dto.standing.toLowerCase().includes('head') : true);
    const existing = await this.prisma.town.findFirst({
      where: { name: { equals: dto.name.trim(), mode: 'insensitive' } },
    });

    if (existing) {
      return this.prisma.town.update({
        where: { id: existing.id },
        data: { isOffice },
      });
    }

    return this.prisma.town.create({
      data: {
        name: dto.name.trim(),
        isOffice,
      },
    });
  }

  async update(id: string, dto: Partial<CreateTownDto>) {
    const isOffice = dto.isOffice ?? (dto.standing ? dto.standing.toLowerCase().includes('branch') || dto.standing.toLowerCase().includes('head') : undefined);
    return this.prisma.town.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(isOffice !== undefined ? { isOffice } : {}),
      },
    });
  }

  async remove(id: string) {
    try {
      const quetta = await this.prisma.town.findFirst({ where: { name: { equals: 'Quetta', mode: 'insensitive' } } });
      if (quetta && quetta.id !== id) {
        await this.prisma.donor.updateMany({ where: { townId: id }, data: { townId: quetta.id } }).catch(() => {});
        await this.prisma.volunteer.updateMany({ where: { townId: id }, data: { townId: quetta.id } }).catch(() => {});
        await this.prisma.bloodRequest.updateMany({ where: { townId: id }, data: { townId: quetta.id } }).catch(() => {});
      }
      await this.prisma.branch.deleteMany({ where: { townId: id } }).catch(() => {});
      return await this.prisma.town.delete({ where: { id } });
    } catch {
      return null;
    }
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

  @Public()
  @Get('network')
  network() {
    return this.towns.network();
  }

  @Public()
  @Post()
  create(@Body() dto: CreateTownDto) {
    return this.towns.create(dto);
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateTownDto>) {
    return this.towns.update(id, dto);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.towns.remove(id);
  }
}

@Module({
  controllers: [TownsController],
  providers: [TownsService],
  exports: [TownsService],
})
export class TownsModule {}
