import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateBranchDto {
  townId: string;
  address: string;
  phones?: string[];
  bankAccount?: string;
  hasAmbulance?: boolean;
}

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const branches = await this.prisma.branch.findMany({
      include: {
        town: true,
        stock: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return { data: branches, meta: { total: branches.length } };
  }

  async create(dto: CreateBranchDto) {
    return this.prisma.branch.create({
      data: {
        townId: dto.townId,
        address: dto.address,
        phones: dto.phones || [],
        bankAccount: dto.bankAccount || null,
        hasAmbulance: dto.hasAmbulance || false,
      },
      include: {
        town: true,
      },
    });
  }
}
