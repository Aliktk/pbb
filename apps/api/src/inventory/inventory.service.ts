import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BloodGroup, RhFactor } from '@prisma/client';

export interface UpdateStockDto {
  branchId: string;
  bloodGroup: BloodGroup;
  rhFactor: RhFactor;
  unitsAvailable: number;
}

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async listStock(branchId?: string) {
    const where = branchId ? { branchId } : {};
    let stock = await this.prisma.stockLevel.findMany({
      where,
      include: {
        branch: {
          include: {
            town: true,
          },
        },
      },
      orderBy: [{ branchId: 'asc' }, { bloodGroup: 'asc' }, { rhFactor: 'asc' }],
    });

    // If a branch is specified and has no stock levels yet, initialize default rows
    if (branchId && stock.length === 0) {
      const groups = [BloodGroup.O, BloodGroup.A, BloodGroup.B, BloodGroup.AB];
      const rhs = [RhFactor.POSITIVE, RhFactor.NEGATIVE];
      const createData = [];
      for (const g of groups) {
        for (const rh of rhs) {
          createData.push({
            branchId,
            bloodGroup: g,
            rhFactor: rh,
            unitsAvailable: 0,
          });
        }
      }
      await this.prisma.stockLevel.createMany({ data: createData, skipDuplicates: true });

      stock = await this.prisma.stockLevel.findMany({
        where: { branchId },
        include: {
          branch: {
            include: { town: true },
          },
        },
        orderBy: [{ bloodGroup: 'asc' }, { rhFactor: 'asc' }],
      });
    }

    return { data: stock };
  }

  async updateStock(dto: UpdateStockDto, updatedById?: string) {
    const { branchId, bloodGroup, rhFactor, unitsAvailable } = dto;

    const existing = await this.prisma.stockLevel.findUnique({
      where: {
        branchId_bloodGroup_rhFactor: {
          branchId,
          bloodGroup,
          rhFactor,
        },
      },
    });

    if (!existing) {
      return this.prisma.stockLevel.create({
        data: {
          branchId,
          bloodGroup,
          rhFactor,
          unitsAvailable: Math.max(0, unitsAvailable),
          updatedById,
        },
        include: {
          branch: { include: { town: true } },
        },
      });
    }

    const updated = await this.prisma.stockLevel.update({
      where: {
        branchId_bloodGroup_rhFactor: {
          branchId,
          bloodGroup,
          rhFactor,
        },
      },
      data: {
        unitsAvailable: Math.max(0, unitsAvailable),
        updatedById,
      },
      include: {
        branch: { include: { town: true } },
      },
    });

    await this.prisma.branch.update({
      where: { id: branchId },
      data: { stockUpdatedAt: new Date() },
    });

    return updated;
  }

  async bulkUpdateStock(
    branchId: string,
    items: Array<{ bloodGroup: BloodGroup; rhFactor: RhFactor; unitsAvailable: number }>,
    updatedById?: string,
  ) {
    const results = [];
    for (const item of items) {
      const res = await this.updateStock(
        {
          branchId,
          bloodGroup: item.bloodGroup,
          rhFactor: item.rhFactor,
          unitsAvailable: item.unitsAvailable,
        },
        updatedById,
      );
      results.push(res);
    }
    return { data: results, count: results.length };
  }
}
