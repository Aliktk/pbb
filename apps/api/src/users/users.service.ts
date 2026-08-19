import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';

export interface CreateUserDto {
  name: string;
  email: string;
  phone?: string;
  roleId: string;
  townId?: string;
  status?: string;
  password?: string;
  avatarUrl?: string;
}

function generateRandomPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const symbols = '!@#$%&*';
  let result = 'PBB-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  result += symbols.charAt(Math.floor(Math.random() * symbols.length));
  for (let i = 0; i < 3; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const DEFAULT_USERS = [
  { name: 'Olus Yar', email: 'organizer@pbb.org', roleName: 'Head of Organisation', phone: '0300-3815590', status: UserStatus.ACTIVE, townName: 'Quetta' },
  { name: 'Dr. Hamid Khan Achakzai', email: 'committee@pbb.org', roleName: 'Executive', phone: '0300-1234567', status: UserStatus.ACTIVE, townName: 'Quetta' },
  { name: 'Mr. Faqir Khushal Khan Kasi', email: 'faqir@pbb.org', roleName: 'Executive', phone: '0333-7890123', status: UserStatus.ACTIVE, townName: 'Quetta' },
  { name: 'Dr. Naseer Muhammad', email: 'lab@pbb.org', roleName: 'Verifier', phone: '0312-4567890', status: UserStatus.ACTIVE, townName: 'Quetta' },
  { name: 'Zhob Branch Manager', email: 'zhob@pbb.org', roleName: 'Branch manager', phone: '0822-413902', status: UserStatus.ACTIVE, townName: 'Zhob' },
  { name: 'Pishin Data Entry', email: 'pishin@pbb.org', roleName: 'Data entry', phone: '0826-421288', status: UserStatus.ACTIVE, townName: 'Pishin' },
  { name: 'Loralai Desk Officer', email: 'loralai@pbb.org', roleName: 'Data entry', phone: '0824-662066', status: UserStatus.SUSPENDED, townName: 'Loralai' },
  { name: 'Chaman Volunteer Lead', email: 'chaman@pbb.org', roleName: 'Volunteer lead', phone: '0345-9988776', status: UserStatus.INVITED, townName: 'Chaman' },
];

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrCreateRole(roleIdentifier: string) {
    let role = await this.prisma.role.findUnique({ where: { id: roleIdentifier } }).catch(() => null);
    if (!role) {
      role = await this.prisma.role.findFirst({ where: { name: { equals: roleIdentifier.trim(), mode: 'insensitive' } } });
    }
    if (!role) {
      role = await this.prisma.role.create({
        data: {
          name: roleIdentifier.trim(),
          level: 10,
          permissions: {},
        },
      });
    }
    return role;
  }

  private async ensureSeeded() {
    const count = await this.prisma.user.count();
    if (count === 0) {
      for (const u of DEFAULT_USERS) {
        const role = await this.getOrCreateRole(u.roleName);
        const town = await this.prisma.town.findFirst({ where: { name: { equals: u.townName, mode: 'insensitive' } } });
        await this.prisma.user.create({
          data: {
            name: u.name,
            email: u.email,
            phone: u.phone,
            status: u.status,
            roleId: role.id,
            townId: town?.id || null,
          },
        }).catch(() => {});
      }
    }
  }

  async list() {
    await this.ensureSeeded();
    const users = await this.prisma.user.findMany({
      include: {
        role: true,
        town: true,
        createdBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return {
      data: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        avatarUrl: u.avatarUrl,
        role: u.role,
        town: u.town,
        townId: u.townId,
        status: u.status,
        createdBy: u.createdBy ? u.createdBy.name : 'Olus Yar (Head of Organisation)',
        createdAt: u.createdAt,
        lastSignInAt: u.lastSignInAt,
      })),
      meta: { total: users.length },
    };
  }

  async create(dto: CreateUserDto, createdById?: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase().trim() } });
    if (existing) throw new ConflictException('User with this email already exists');

    const role = await this.getOrCreateRole(dto.roleId);
    let townId = dto.townId || null;
    if (townId && !townId.startsWith('c')) {
      const town = await this.prisma.town.findFirst({ where: { name: { equals: townId, mode: 'insensitive' } } });
      if (town) townId = town.id;
    }

    const rawPassword = dto.password ? dto.password.trim() : generateRandomPassword();
    let passwordHash: string | null = null;
    try {
      passwordHash = await argon2.hash(rawPassword);
    } catch {
      passwordHash = rawPassword;
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        roleId: role.id,
        townId,
        phone: dto.phone ? dto.phone.trim() : null,
        status: dto.status === 'SUSPENDED' ? UserStatus.SUSPENDED : UserStatus.ACTIVE,
        createdById,
      },
      include: {
        role: true,
        town: true,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      town: user.town,
      status: user.status,
      rawPassword,
      createdAt: user.createdAt,
    };
  }

  async update(id: string, dto: Partial<CreateUserDto>) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User account not found');

    let roleId = existing.roleId;
    if (dto.roleId) {
      const role = await this.getOrCreateRole(dto.roleId);
      roleId = role.id;
    }

    let townId = dto.townId !== undefined ? dto.townId : existing.townId;
    if (townId && !townId.startsWith('c')) {
      const town = await this.prisma.town.findFirst({ where: { name: { equals: townId, mode: 'insensitive' } } });
      townId = town ? town.id : null;
    }

    let status = existing.status;
    if (dto.status) {
      const stUpper = dto.status.toUpperCase();
      if (stUpper === 'ACTIVE') status = UserStatus.ACTIVE;
      else if (stUpper === 'SUSPENDED') status = UserStatus.SUSPENDED;
      else if (stUpper === 'INVITED') status = UserStatus.INVITED;
    }

    let passwordHash = existing.passwordHash;
    if (dto.password && dto.password.length >= 6) {
      passwordHash = await argon2.hash(dto.password);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.email ? { email: dto.email.toLowerCase().trim() } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone ? dto.phone.trim() : null } : {}),
        ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
        ...(dto.password ? { passwordHash } : {}),
        roleId,
        townId,
        status,
      },
      include: {
        role: true,
        town: true,
      },
    });

    return user;
  }

  async remove(id: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User account not found');

    await this.prisma.user.updateMany({ where: { createdById: id }, data: { createdById: null } }).catch(() => {});
    await this.prisma.donor.updateMany({ where: { createdById: id }, data: { createdById: null } }).catch(() => {});
    await this.prisma.donation.updateMany({ where: { recordedById: id }, data: { recordedById: null } }).catch(() => {});
    await this.prisma.requestCall.updateMany({ where: { calledById: id }, data: { calledById: null } }).catch(() => {});
    await this.prisma.stockLevel.updateMany({ where: { updatedById: id }, data: { updatedById: null } }).catch(() => {});
    await this.prisma.announcement.updateMany({ where: { createdById: id }, data: { createdById: null } }).catch(() => {});
    await this.prisma.mediaAsset.updateMany({ where: { uploadedById: id }, data: { uploadedById: null } }).catch(() => {});
    await this.prisma.pageVersion.updateMany({ where: { createdById: id }, data: { createdById: null } }).catch(() => {});
    await this.prisma.message.updateMany({ where: { handledById: id }, data: { handledById: null } }).catch(() => {});
    await this.prisma.invitation.updateMany({ where: { createdById: id }, data: { createdById: null } }).catch(() => {});
    await this.prisma.refreshToken.deleteMany({ where: { userId: id } }).catch(() => {});
    await this.prisma.passwordResetToken.deleteMany({ where: { userId: id } }).catch(() => {});
    await this.prisma.auditLog.deleteMany({ where: { actorId: id } }).catch(() => {});

    return await this.prisma.user.delete({ where: { id } });
  }
}
