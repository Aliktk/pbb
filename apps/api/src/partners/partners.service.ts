import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PartnerKind } from '@prisma/client';

export interface CreatePartnerDto {
  name: string;
  kind: string;
  contact?: string;
  phone?: string;
  townId?: string;
  sinceYear?: string | number;
}

const SEED_PARTNERS = [
  { name: 'Civil Hospital, Quetta', kind: PartnerKind.HOSPITAL, contact: 'Dr. Tariq Kakar::STATUS=active::TOWN=Quetta::KIND=Hospital::NOTE=Highest referring hospital. Named coordinator assigned for 24/7 blood exchange.', phone: '081-2836820', sinceYear: '2004' },
  { name: 'Bolan Medical Complex', kind: PartnerKind.HOSPITAL, contact: 'Dr. Sanaullah::STATUS=active::TOWN=Quetta::KIND=Hospital::NOTE=Major medical center partner for thalassemic children transfusion schedules.', phone: '081-2839500', sinceYear: '2007' },
  { name: 'DHQ Hospital, Zhob', kind: PartnerKind.HOSPITAL, contact: 'Malik Rahim::STATUS=active::TOWN=Zhob::KIND=Hospital::NOTE=District branch hospital partner in Northern Balochistan corridor.', phone: '0822-413902', sinceYear: '2011' },
  { name: 'Quetta Diagnostic Laboratory', kind: PartnerKind.LABORATORY, contact: 'Assigned upon approval::STATUS=pending::TOWN=Quetta::KIND=Laboratory::NOTE=Offering overflow ELISA screening capacity. Awaiting organizing committee decision.', phone: '081-2840011', sinceYear: '2022' },
  { name: 'Al-Khidmat Welfare Society', kind: PartnerKind.FOUNDATION, contact: 'Bilal Ahmad::STATUS=active::TOWN=Loralai::KIND=Welfare society::NOTE=Organizes annual cattle hide collection campaign during Eid-ul-Adha in Loralai.', phone: '0824-662066', sinceYear: '2015' },
  { name: 'Balochistan University Campus', kind: PartnerKind.CORPORATE, contact: 'Student Affairs Desk::STATUS=active::TOWN=Quetta::KIND=University::NOTE=Hosts two student voluntary blood donation awareness drives per year.', phone: '081-9211100', sinceYear: '2019' },
  { name: 'Sherani Welfare Trust', kind: PartnerKind.FOUNDATION, contact: 'Under Committee Review::STATUS=pending::TOWN=Sherani::KIND=Welfare society::NOTE=Requesting to open a permanent branch desk in Sherani district.', phone: '0822-556677', sinceYear: '2023' },
  { name: 'Rahmat Medical Foundation', kind: PartnerKind.FOUNDATION, contact: 'Executive Board::STATUS=pending::TOWN=Quetta::KIND=Foundation::NOTE=Offering to fund virus ELISA screening kits for 500 blood bags per year.', phone: '081-4455667', sinceYear: '2021' },
];

function normalizeKind(kindStr?: string): PartnerKind {
  if (!kindStr) return PartnerKind.HOSPITAL;
  const k = kindStr.toUpperCase();
  if (k.includes('LAB')) return PartnerKind.LABORATORY;
  if (k.includes('FOUND') || k.includes('WELFARE') || k.includes('SOCIETY')) return PartnerKind.FOUNDATION;
  if (k.includes('UNI') || k.includes('CORP')) return PartnerKind.CORPORATE;
  if (k.includes('GOV')) return PartnerKind.GOVERNMENT;
  return PartnerKind.HOSPITAL;
}

@Injectable()
export class PartnersService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureSeeded() {
    await this.prisma.$executeRawUnsafe(`ALTER TABLE "partners" ADD COLUMN IF NOT EXISTS "sinceYear" TEXT;`).catch(() => {});
    const count = await this.prisma.partner.count().catch(() => 0);
    if (count === 0) {
      for (const p of SEED_PARTNERS) {
        await this.prisma.partner.create({ data: p }).catch(() => {});
      }
    }
  }

  async list() {
    await this.ensureSeeded();
    const partners = await this.prisma.partner.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { data: partners, meta: { total: partners.length } };
  }

  async create(dto: CreatePartnerDto) {
    await this.ensureSeeded();
    const kind = normalizeKind(dto.kind);
    const sinceYear = dto.sinceYear ? String(dto.sinceYear) : undefined;
    return this.prisma.partner.create({
      data: {
        name: dto.name,
        kind,
        contact: dto.contact || null,
        phone: dto.phone || null,
        townId: dto.townId || null,
        sinceYear: sinceYear || null,
      },
    });
  }

  async update(id: string, dto: Partial<CreatePartnerDto>) {
    await this.ensureSeeded();
    const data: any = {};
    if (dto.name) data.name = dto.name;
    if (dto.kind) data.kind = normalizeKind(dto.kind);
    if (dto.contact !== undefined) data.contact = dto.contact;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.townId !== undefined) data.townId = dto.townId;
    if (dto.sinceYear !== undefined) data.sinceYear = dto.sinceYear ? String(dto.sinceYear) : null;

    return this.prisma.partner.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.prisma.partner.delete({ where: { id } }).catch(() => null);
    return { success: true, message: 'Partner deleted successfully' };
  }
}
