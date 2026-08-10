import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { scopeWhere } from '../rbac/scope';
import type { AuthUser } from '../rbac/auth-user';
import { groupLabel } from '../common/blood-group';
import { callableStatuses, donorListWhere } from './donor.query';
import type { ListDonorsQuery } from './dto/list-donors.query';
import type { SearchDonorsQuery } from './dto/search-donors.query';
import type { CreateDonorDto } from './dto/create-donor.dto';

const DONOR_SELECT = {
  id: true,
  mrNo: true,
  name: true,
  bloodGroup: true,
  rhFactor: true,
  phone: true,
  townId: true,
  town: { select: { name: true } },
  branchId: true,
  lastDonatedAt: true,
  timesDonated: true,
  deferredReason: true,
  deferredUntil: true,
  consentToCall: true,
} satisfies Prisma.DonorSelect;

type DonorRow = Prisma.DonorGetPayload<{ select: typeof DONOR_SELECT }>;

const NEVER = 'NEVER_SCREENED';

function row(d: DonorRow) {
  return {
    id: d.id,
    mrNo: d.mrNo,
    name: d.name,
    group: groupLabel(d.bloodGroup, d.rhFactor),
    bloodGroup: d.bloodGroup,
    rhFactor: d.rhFactor,
    phone: d.phone,
    town: d.town?.name ?? null,
    townId: d.townId,
    lastDonatedAt: d.lastDonatedAt,
    timesDonated: d.timesDonated,
    consentToCall: d.consentToCall,
  };
}

@Injectable()
export class DonorsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Paged, filtered, town-scoped register. Eligibility comes from the DB view (INV-5). */
  async list(user: AuthUser, q: ListDonorsQuery) {
    const where = donorListWhere({ q: q.q, group: q.group, rh: q.rh, townId: q.townId }, user);
    const [total, donors] = await this.prisma.$transaction([
      this.prisma.donor.count({ where }),
      this.prisma.donor.findMany({
        where,
        select: DONOR_SELECT,
        orderBy: { name: 'asc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);
    const statusById = await this.statusFor(donors.map((d) => d.id));
    return {
      data: donors.map((d) => ({ ...row(d), eligibility: statusById.get(d.id) ?? NEVER })),
      meta: { total, page: q.page, pageSize: q.pageSize },
    };
  }

  async getById(user: AuthUser, id: string) {
    const donor = await this.prisma.donor.findFirst({
      where: { id, deletedAt: null, ...scopeWhere(user) },
      select: {
        ...DONOR_SELECT,
        dateOfBirth: true,
        address: true,
        emergencyContact: true,
        emergencyRelationship: true,
        willingFrequency: true,
        modeOfIssue: true,
        screenings: { orderBy: { testedAt: 'desc' }, take: 1 },
      },
    });
    if (!donor) throw new NotFoundException('Donor not found');
    const status = (await this.statusFor([donor.id])).get(donor.id) ?? NEVER;
    return {
      ...row(donor),
      dateOfBirth: donor.dateOfBirth,
      address: donor.address,
      emergencyContact: donor.emergencyContact,
      emergencyRelationship: donor.emergencyRelationship,
      willingFrequency: donor.willingFrequency,
      modeOfIssue: donor.modeOfIssue,
      latestScreening: donor.screenings[0] ?? null,
      eligibility: status,
    };
  }

  /**
   * Emergency search: callable donors of a group/Rh, town-scoped, ordered by longest since
   * last donation (never-donated first) so the calls spread around. Only consenting donors,
   * and only those the eligibility view marks callable.
   */
  async search(user: AuthUser, q: SearchDonorsQuery) {
    const scope = scopeWhere(user);
    const where: Prisma.DonorWhereInput = {
      deletedAt: null,
      consentToCall: true,
      bloodGroup: q.group,
      rhFactor: q.rh,
      ...scope,
    };
    if (!scope.townId && q.townId) where.townId = q.townId;

    const donors = await this.prisma.donor.findMany({
      where,
      select: DONOR_SELECT,
      orderBy: { lastDonatedAt: { sort: 'asc', nulls: 'first' } },
    });
    const statusById = await this.statusFor(donors.map((d) => d.id));
    const allowed = new Set(callableStatuses(q.includeCooldown));
    const data = donors
      .map((d) => ({ ...row(d), eligibility: statusById.get(d.id) ?? NEVER }))
      .filter((d) => allowed.has(d.eligibility));
    return { data, meta: { total: data.length } };
  }

  async create(user: AuthUser, dto: CreateDonorDto) {
    // A town-scoped user can only add donors to their own town.
    const scope = scopeWhere(user);
    const townId = scope.townId ?? dto.townId;
    try {
      const created = await this.prisma.donor.create({
        data: {
          mrNo: dto.mrNo,
          name: dto.name,
          bloodGroup: dto.bloodGroup,
          rhFactor: dto.rhFactor,
          dateOfBirth: new Date(dto.dateOfBirth),
          phone: dto.phone,
          emergencyContact: dto.emergencyContact,
          emergencyRelationship: dto.emergencyRelationship,
          address: dto.address,
          townId,
          branchId: dto.branchId,
          quantityMl: dto.quantityMl,
          willingFrequency: dto.willingFrequency,
          modeOfIssue: dto.modeOfIssue,
          consentToCall: dto.consentToCall ?? true,
          createdById: user.id,
        },
        select: DONOR_SELECT,
      });
      return { ...row(created), eligibility: NEVER };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('A donor with that MR number already exists in this branch');
      }
      throw e;
    }
  }

  /** Map donor ids → eligibility status from the view, in one query. */
  private async statusFor(ids: string[]): Promise<Map<string, string>> {
    if (ids.length === 0) return new Map();
    const rows = await this.prisma.donorEligibility.findMany({ where: { id: { in: ids } } });
    return new Map(rows.map((r) => [r.id, r.status]));
  }
}
