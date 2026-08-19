import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateRoleDto {
  name: string;
  level?: number;
  permissions?: Record<string, string[]>;
}

const DEFAULT_SYSTEM_ROLES = [
  {
    name: 'Olus Yar',
    level: 0,
    isSystem: true,
    permissions: {
      overview: ['read', 'write'],
      requests: ['read', 'write', 'delete'],
      find: ['read', 'write'],
      inventory: ['read', 'write'],
      inbox: ['read', 'write'],
      donors: ['read', 'write', 'delete'],
      volunteers: ['read', 'write', 'delete'],
      thalassemia: ['read', 'write', 'delete'],
      ledger: ['read', 'write'],
      record: ['read', 'write'],
      network: ['read', 'write'],
      partners: ['read', 'write', 'delete'],
      reports: ['read', 'write', 'export'],
      branches: ['read', 'write', 'delete'],
      accounts: ['read', 'write', 'delete'],
      roles: ['read', 'write', 'delete'],
      audit: ['read'],
    },
  },
  {
    name: 'Executive',
    level: 1,
    isSystem: true,
    permissions: {
      overview: ['read', 'write'],
      requests: ['read', 'write', 'delete'],
      find: ['read', 'write'],
      inventory: ['read', 'write'],
      inbox: ['read', 'write'],
      donors: ['read', 'write', 'delete'],
      volunteers: ['read', 'write', 'delete'],
      thalassemia: ['read', 'write', 'delete'],
      ledger: ['read', 'write'],
      record: ['read', 'write'],
      network: ['read', 'write'],
      partners: ['read', 'write', 'delete'],
      reports: ['read', 'write', 'export'],
      branches: ['read', 'write', 'delete'],
      accounts: ['read', 'write', 'delete'],
      roles: ['read', 'write', 'delete'],
      audit: ['read'],
    },
  },
  {
    name: 'Branch Manager',
    level: 2,
    isSystem: true,
    permissions: {
      overview: ['read'],
      requests: ['read', 'write'],
      find: ['read'],
      inventory: ['read', 'write'],
      donors: ['read', 'write'],
      volunteers: ['read', 'write'],
      record: ['read', 'write'],
      branches: ['read'],
    },
  },
  {
    name: 'Coordinator',
    level: 3,
    isSystem: true,
    permissions: {
      overview: ['read'],
      requests: ['read', 'write'],
      find: ['read'],
      inventory: ['read'],
      donors: ['read', 'write'],
    },
  },
  {
    name: 'Data Entry',
    level: 4,
    isSystem: true,
    permissions: {
      overview: ['read'],
      requests: ['read', 'write'],
      find: ['read'],
      donors: ['read', 'write'],
      record: ['read', 'write'],
    },
  },
  {
    name: 'Accounts',
    level: 5,
    isSystem: true,
    permissions: {
      overview: ['read'],
      ledger: ['read', 'write'],
      reports: ['read', 'export'],
      audit: ['read'],
    },
  },
  {
    name: 'Verifier',
    level: 6,
    isSystem: true,
    permissions: {
      overview: ['read'],
      requests: ['read', 'write'],
      find: ['read'],
      inventory: ['read'],
      donors: ['read', 'write'],
      volunteers: ['read'],
      thalassemia: ['read'],
      ledger: ['read'],
      record: ['read', 'write'],
      audit: ['read'],
    },
  },
  {
    name: 'Volunteer Lead',
    level: 7,
    isSystem: true,
    permissions: {
      overview: ['read'],
      volunteers: ['read', 'write'],
    },
  },
];

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureSeeded() {
    const count = await this.prisma.role.count();
    if (count === 0) {
      for (const r of DEFAULT_SYSTEM_ROLES) {
        await this.prisma.role.create({
          data: {
            name: r.name,
            level: r.level,
            isSystem: r.isSystem,
            permissions: r.permissions,
          },
        }).catch(() => {});
      }
    }
  }

  async list() {
    await this.ensureSeeded();
    const roles = await this.prisma.role.findMany({
      orderBy: { level: 'asc' },
    });
    return { data: roles, meta: { total: roles.length } };
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.role.findFirst({
      where: { name: { equals: dto.name.trim(), mode: 'insensitive' } },
    });
    if (existing) throw new ConflictException('Role with this title already exists');

    const role = await this.prisma.role.create({
      data: {
        name: dto.name.trim(),
        level: dto.level || 10,
        permissions: dto.permissions || {},
        isSystem: false,
      },
    });

    return role;
  }

  async update(id: string, dto: Partial<CreateRoleDto>) {
    const existing = await this.prisma.role.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Role not found');

    const updated = await this.prisma.role.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.level !== undefined ? { level: dto.level } : {}),
        ...(dto.permissions ? { permissions: dto.permissions } : {}),
      },
    });

    return updated;
  }

  async remove(id: string) {
    const existing = await this.prisma.role.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Role not found');

    const fallbackRole = await this.prisma.role.findFirst({
      where: { id: { not: id } },
      orderBy: { level: 'asc' },
    });

    if (fallbackRole) {
      await this.prisma.user.updateMany({
        where: { roleId: id },
        data: { roleId: fallbackRole.id },
      }).catch(() => {});
    }

    return await this.prisma.role.delete({ where: { id } });
  }
}
