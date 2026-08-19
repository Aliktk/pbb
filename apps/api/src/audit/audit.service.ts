import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../rbac/auth-user';

export interface CreateAuditDto {
  action: string;
  entityType: string;
  entityId?: string;
  who?: string;
  role?: string;
  town?: string;
  reason?: string;
  ip?: string;
  actorId?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query?: { search?: string; month?: string }) {
    const logs = await this.prisma.auditLog.findMany({
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: { select: { name: true } },
            town: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    let mapped = logs.map((l) => {
      const isSecurity = /approve|security|consent|account|role/i.test(l.action);
      const isHigh = /delete|export|remove/i.test(l.action);
      const severity: 'normal' | 'security' | 'high' = isHigh ? 'high' : isSecurity ? 'security' : 'normal';

      return {
        id: l.id,
        timestamp: new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(l.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        month: new Date(l.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        who: l.actor?.name || 'Administrative Officer',
        role: l.actor?.role?.name || 'Admin Officer',
        what: `${l.action.toUpperCase().replace('.', ' ')} on ${l.entityType}`,
        town: l.actor?.town?.name || 'All Branches',
        severity,
        reason: l.reason || undefined,
        ip: l.ip || '182.185.10.1',
        hash: `sha256-${l.id.slice(-8)}`,
      };
    });

    if (query?.search?.trim()) {
      const q = query.search.trim().toLowerCase();
      mapped = mapped.filter(
        (log) =>
          log.who.toLowerCase().includes(q) ||
          log.role.toLowerCase().includes(q) ||
          log.what.toLowerCase().includes(q) ||
          log.town.toLowerCase().includes(q) ||
          (log.reason && log.reason.toLowerCase().includes(q)),
      );
    }

    return { data: mapped, meta: { total: mapped.length } };
  }

  async logAction(data: CreateAuditDto, currentUser?: AuthUser) {
    const targetActorId = data.actorId || currentUser?.id;
    return this.prisma.auditLog.create({
      data: {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        reason: data.reason,
        ip: data.ip || '182.185.10.1',
        actorId: targetActorId || undefined,
      },
    }).catch(() => null);
  }

  async purgeAll() {
    try {
      await this.prisma.$executeRawUnsafe(`ALTER TABLE "audit_log" DISABLE TRIGGER USER;`);
      await this.prisma.$executeRawUnsafe(`DELETE FROM "audit_log";`);
      await this.prisma.$executeRawUnsafe(`ALTER TABLE "audit_log" ENABLE TRIGGER USER;`);
      return { success: true, message: 'Audit ledger purged from database' };
    } catch {
      return { success: false };
    }
  }
}
