import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, RequestStatus } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { scopeWhere } from '../rbac/scope';
import type { AuthUser } from '../rbac/auth-user';
import { formatReference, toAdminRequest, toPublicRequest } from './request.mappers';
import type { CreateRequestDto } from './dto/create-request.dto';
import type { ListRequestsQuery } from './dto/list-requests.query';
import type { UpdateRequestStatusDto } from './dto/update-request-status.dto';

const TOWN = { town: { select: { name: true } } } as const;

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public intake from the website form. Returns only the reference + status (no PII echo). */
  async createPublic(dto: CreateRequestDto) {
    const town = await this.prisma.town.findUnique({ where: { id: dto.townId } });
    if (!town) throw new BadRequestException('Unknown town');

    const reference = await this.allocateReference();
    const created = await this.prisma.bloodRequest.create({
      data: {
        reference,
        patientName: dto.patientName,
        hospital: dto.hospital,
        townId: dto.townId,
        bloodGroup: dto.bloodGroup,
        rhFactor: dto.rhFactor,
        unitsNeeded: dto.unitsNeeded ?? 1,
        urgency: dto.urgency ?? 'URGENT',
        requesterName: dto.requesterName,
        requesterRelationship: dto.requesterRelationship,
        requesterPhone: dto.requesterPhone,
        transportAvailable: dto.transportAvailable ?? false,
        exchangePossible: dto.exchangePossible ?? true,
        caseNotes: dto.caseNotes,
        source: 'PUBLIC_FORM',
      },
    });
    return { reference: created.reference, status: created.status };
  }

  /** The public "who needs blood now" board - open requests, no names or phones (INV-11). */
  async listPublic() {
    const rows = await this.prisma.bloodRequest.findMany({
      where: { status: { in: [RequestStatus.OPEN, RequestStatus.ARRANGING] } },
      include: TOWN,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return { data: rows.map(toPublicRequest) };
  }

  /** Admin list - full records, town-scoped. */
  async listAdmin(user: AuthUser, q: ListRequestsQuery) {
    const scope = scopeWhere(user);
    const where: Prisma.BloodRequestWhereInput = { ...scope };
    if (q.status) where.status = q.status;
    if (!scope.townId && q.townId) where.townId = q.townId;

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.bloodRequest.count({ where }),
      this.prisma.bloodRequest.findMany({
        where,
        include: TOWN,
        orderBy: { createdAt: 'desc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);
    return { data: rows.map(toAdminRequest), meta: { total, page: q.page, pageSize: q.pageSize } };
  }

  async getAdmin(user: AuthUser, id: string) {
    const found = await this.prisma.bloodRequest.findFirst({
      where: { id, ...scopeWhere(user) },
      include: TOWN,
    });
    if (!found) throw new NotFoundException('Request not found');
    return toAdminRequest(found);
  }

  async updateStatus(user: AuthUser, id: string, dto: UpdateRequestStatusDto) {
    const existing = await this.prisma.bloodRequest.findFirst({ where: { id, ...scopeWhere(user) } });
    if (!existing) throw new NotFoundException('Request not found');

    const data: Prisma.BloodRequestUpdateInput = { status: dto.status };
    if (dto.status === RequestStatus.ARRANGED && !existing.arrangedAt) data.arrangedAt = new Date();
    if (
      (dto.status === RequestStatus.CLOSED || dto.status === RequestStatus.CANCELLED) &&
      !existing.closedAt
    ) {
      data.closedAt = new Date();
    }
    const updated = await this.prisma.bloodRequest.update({ where: { id }, data, include: TOWN });
    return toAdminRequest(updated);
  }

  /** Allocate a unique PBB-XXXXXX reference, retrying on the rare collision. */
  private async allocateReference(): Promise<string> {
    for (let i = 0; i < 5; i++) {
      const ref = formatReference(randomBytes(6).toString('hex'));
      const clash = await this.prisma.bloodRequest.findUnique({ where: { reference: ref } });
      if (!clash) return ref;
    }
    throw new ConflictException('Could not allocate a request reference - please try again');
  }
}
