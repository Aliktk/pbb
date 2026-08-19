import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ComponentType } from '@prisma/client';

export interface RecordDonationDto {
  donorId: string;
  branchId: string;
  donatedAt?: string;
  quantityMl?: number;
  componentType?: ComponentType;
  requestId?: string;
}

@Injectable()
export class DonationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(donorId?: string) {
    const where = donorId ? { donorId } : {};
    const donations = await this.prisma.donation.findMany({
      where,
      include: {
        donor: {
          include: {
            town: true,
          },
        },
        branch: {
          include: {
            town: true,
          },
        },
        recordedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { donatedAt: 'desc' },
    });
    return { data: donations, meta: { total: donations.length } };
  }

  async record(dto: RecordDonationDto, recordedById?: string) {
    const donor = await this.prisma.donor.findUnique({ where: { id: dto.donorId } });
    if (!donor) throw new NotFoundException('Donor not found');

    const donatedAt = dto.donatedAt ? new Date(dto.donatedAt) : new Date();

    let branchId = dto.branchId;
    const branchExists = branchId ? await this.prisma.branch.findUnique({ where: { id: branchId } }) : null;
    if (!branchExists) {
      const townBranch = donor.branchId
        ? await this.prisma.branch.findUnique({ where: { id: donor.branchId } })
        : await this.prisma.branch.findFirst({ where: { townId: donor.townId } });
      const defaultBranch = townBranch || (await this.prisma.branch.findFirst());
      if (defaultBranch) {
        branchId = defaultBranch.id;
      }
    }

    if (!branchId) {
      throw new Error('No valid branch found to associate donation.');
    }

    const [donation] = await this.prisma.$transaction([
      this.prisma.donation.create({
        data: {
          donorId: dto.donorId,
          branchId,
          donatedAt,
          quantityMl: dto.quantityMl || 350,
          componentType: dto.componentType || ComponentType.WHOLE_BLOOD,
          requestId: dto.requestId || null,
          recordedById: recordedById || null,
        },
        include: {
          donor: { include: { town: true } },
          branch: { include: { town: true } },
        },
      }),
      this.prisma.donor.update({
        where: { id: dto.donorId },
        data: {
          lastDonatedAt: donatedAt,
          timesDonated: { increment: 1 },
        },
      }),
    ]);

    return donation;
  }
}
