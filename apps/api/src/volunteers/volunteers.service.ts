import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VolunteerStatus } from '@prisma/client';

export interface CreateVolunteerDto {
  name: string;
  phone: string;
  email?: string;
  townId?: string;
  skills?: string | string[];
}

@Injectable()
export class VolunteersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(status?: VolunteerStatus) {
    const where = status ? { status } : {};
    const volunteers = await this.prisma.volunteer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return { data: volunteers, meta: { total: volunteers.length } };
  }

  async create(dto: CreateVolunteerDto) {
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

    const skillsStr = Array.isArray(dto.skills) ? dto.skills.join(', ') : dto.skills || null;

    return this.prisma.volunteer.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email || null,
        townId: resolvedTownId,
        skills: skillsStr,
        status: VolunteerStatus.APPLIED,
      },
    });
  }

  async updateStatus(id: string, status: VolunteerStatus) {
    const volunteer = await this.prisma.volunteer.findUnique({ where: { id } });
    if (!volunteer) throw new NotFoundException('Volunteer not found');

    return this.prisma.volunteer.update({
      where: { id },
      data: { status },
    });
  }

  async update(id: string, dto: Partial<CreateVolunteerDto> & { status?: VolunteerStatus }) {
    const existing = await this.prisma.volunteer.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Volunteer not found');

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

    const skillsStr = dto.skills !== undefined ? (Array.isArray(dto.skills) ? dto.skills.join(', ') : dto.skills) : existing.skills;

    return this.prisma.volunteer.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.phone ? { phone: dto.phone } : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
        ...(dto.status ? { status: dto.status } : {}),
        townId: resolvedTownId,
        skills: skillsStr,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.volunteer.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Volunteer not found');

    await this.prisma.volunteer.delete({ where: { id } });
    return { success: true, message: 'Volunteer deleted successfully' };
  }
}
