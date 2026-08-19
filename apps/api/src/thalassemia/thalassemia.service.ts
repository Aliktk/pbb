import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BloodGroup, RhFactor } from '@prisma/client';

export interface CreateThalassemiaPatientDto {
  name: string;
  dateOfBirth?: string;
  bloodGroup: BloodGroup;
  rhFactor: RhFactor;
  guardianName?: string;
  guardianPhone?: string;
  townId?: string;
  hospital?: string;
  transfusionIntervalDays?: number;
  photoConsent?: boolean;
}

@Injectable()
export class ThalassemiaService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const patients = await this.prisma.thalassemiaPatient.findMany({
      include: {
        town: true,
      },
      orderBy: { nextTransfusionDue: 'asc' },
    });
    return { data: patients, meta: { total: patients.length } };
  }

  async create(dto: CreateThalassemiaPatientDto) {
    let resolvedTownId = dto.townId || null;
    if (resolvedTownId) {
      const townMatch = await this.prisma.town.findFirst({
        where: {
          OR: [
            { id: resolvedTownId },
            { name: { equals: resolvedTownId, mode: 'insensitive' } },
          ],
        },
      });
      if (townMatch) {
        resolvedTownId = townMatch.id;
      }
    }

    if (!resolvedTownId) {
      const firstTown = await this.prisma.town.findFirst();
      if (firstTown) resolvedTownId = firstTown.id;
    }

    if (!resolvedTownId) {
      throw new Error('No town found to associate thalassemia patient');
    }

    const dob = dto.dateOfBirth ? new Date(dto.dateOfBirth) : new Date(Date.now() - 6 * 365.25 * 86400000);
    const interval = dto.transfusionIntervalDays || 21;
    const nextDue = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);

    return this.prisma.thalassemiaPatient.create({
      data: {
        name: dto.name,
        dateOfBirth: isNaN(dob.getTime()) ? new Date(Date.now() - 6 * 365.25 * 86400000) : dob,
        bloodGroup: dto.bloodGroup,
        rhFactor: dto.rhFactor,
        guardianName: dto.guardianName || 'Family Guardian',
        guardianPhone: dto.guardianPhone || 'Not provided',
        townId: resolvedTownId,
        hospital: dto.hospital || null,
        transfusionIntervalDays: interval,
        nextTransfusionDue: nextDue,
        photoConsent: dto.photoConsent ?? false,
      },
      include: {
        town: true,
      },
    });
  }

  async update(id: string, dto: Partial<CreateThalassemiaPatientDto>) {
    const existing = await this.prisma.thalassemiaPatient.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Thalassemia patient not found');

    let resolvedTownId = dto.townId !== undefined ? dto.townId : existing.townId;
    if (resolvedTownId) {
      const townMatch = await this.prisma.town.findFirst({
        where: {
          OR: [
            { id: resolvedTownId },
            { name: { equals: resolvedTownId, mode: 'insensitive' } },
          ],
        },
      });
      if (townMatch) resolvedTownId = townMatch.id;
    }

    return this.prisma.thalassemiaPatient.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.dateOfBirth ? { dateOfBirth: new Date(dto.dateOfBirth) } : {}),
        ...(dto.bloodGroup ? { bloodGroup: dto.bloodGroup } : {}),
        ...(dto.rhFactor ? { rhFactor: dto.rhFactor } : {}),
        ...(dto.guardianName !== undefined ? { guardianName: dto.guardianName } : {}),
        ...(dto.guardianPhone !== undefined ? { guardianPhone: dto.guardianPhone } : {}),
        ...(dto.photoConsent !== undefined ? { photoConsent: dto.photoConsent } : {}),
        townId: resolvedTownId,
      },
      include: {
        town: true,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.thalassemiaPatient.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Thalassemia patient not found');

    await this.prisma.thalassemiaPatient.delete({ where: { id } });
    return { success: true, message: 'Thalassemia patient deleted successfully' };
  }
}
