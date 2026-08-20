/**
 * Seed - the fourteen towns, six branch offices, eight roles, and ~200 donors spread
 * across ALL SEVEN eligibility states so the donor_eligibility view can be proven against
 * a fixture that exercises every case (T0 gate). IDs are explicit and data is deterministic
 * so `prisma migrate reset` reproduces the seed exactly. Screening/donation dates are
 * relative to now() because the view compares against now() - this keeps each donor in its
 * intended bucket whenever the reset runs.
 */
import { PrismaClient, BloodGroup, RhFactor, ScreeningResult, UserStatus } from '@prisma/client';

// SAFETY GUARD: this file seeds ~200 FAKE donors and demo offices for the legacy Prisma/NestJS
// database. Production runs on Supabase (see supabase/migrations/0000_init.sql), which seeds only
// the single super-admin. This fixture must never touch a real database. It refuses to run unless
// PBB_DEV_FIXTURES=1 is explicitly set, so `pnpm db:seed` cannot accidentally inject test data.
if (process.env.PBB_DEV_FIXTURES !== '1') {
  // eslint-disable-next-line no-console
  console.error(
    'Refusing to run the dev fixture seed. It creates ~200 FAKE donors and is for local dev only.\n' +
      'Set PBB_DEV_FIXTURES=1 to run it against a throwaway local database. Never run against production.',
  );
  process.exit(1);
}

const prisma = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;
const ago = (days: number) => new Date(Date.now() - days * DAY);
const ahead = (days: number) => new Date(Date.now() + days * DAY);

// The 14 towns (Route inventory / prototype PBBTOWNS). Six are branch offices.
const OFFICES = ['Quetta', 'Pishin', 'Zhob', 'Loralai', 'Chaman', 'Sibi'] as const;
const TOWNS: { name: string; office: (typeof OFFICES)[number] }[] = [
  { name: 'Quetta', office: 'Quetta' },
  { name: 'Pishin', office: 'Pishin' },
  { name: 'Zhob', office: 'Zhob' },
  { name: 'Loralai', office: 'Loralai' },
  { name: 'Chaman', office: 'Chaman' },
  { name: 'Sibi', office: 'Sibi' },
  { name: 'Muslim Bagh', office: 'Zhob' },
  { name: 'Killa Saifullah', office: 'Zhob' },
  { name: 'Dukki', office: 'Loralai' },
  { name: 'Musakhel', office: 'Loralai' },
  { name: 'Sherani', office: 'Zhob' },
  { name: 'Harnai', office: 'Sibi' },
  { name: 'Ziarat', office: 'Quetta' },
  { name: 'Qila Abdullah', office: 'Chaman' },
];

// Eight roles. `level` is hierarchy depth: lower = more senior. A creator can never grant
// a role at or above their own, nor place a user outside their own town (T1 / §8.3).
const ROLES = [
  { id: 'role-superadmin', name: 'Head Office Admin', level: 0, perms: { '*': ['*'] } },
  { id: 'role-hostaff', name: 'Head Office Staff', level: 1, perms: { donors: ['read', 'write'], requests: ['read', 'write'], inventory: ['read'], analytics: ['read'], accounts: ['read'] } },
  { id: 'role-manager', name: 'Branch Manager', level: 2, perms: { donors: ['read', 'write'], requests: ['read', 'write'], inventory: ['read', 'write'], accounts: ['read', 'write'], analytics: ['read'] } },
  { id: 'role-coordinator', name: 'Coordinator', level: 3, perms: { donors: ['read'], requests: ['read', 'write'], search: ['read'] } },
  { id: 'role-clerk', name: 'Data Entry Clerk', level: 4, perms: { donors: ['read', 'write'], donations: ['write'], import: ['write'] } },
  { id: 'role-lab', name: 'Medical / Lab Officer', level: 4, perms: { donors: ['read'], screenings: ['write'] } },
  { id: 'role-editor', name: 'Content Editor', level: 3, perms: { content: ['read', 'write'], media: ['read', 'write'] } },
  { id: 'role-viewer', name: 'Read Only', level: 5, perms: { donors: ['read'], requests: ['read'], analytics: ['read'] } },
] as const;

const GROUPS: BloodGroup[] = [BloodGroup.O, BloodGroup.A, BloodGroup.B, BloodGroup.AB];
const RH: RhFactor[] = [RhFactor.POSITIVE, RhFactor.NEGATIVE];

type Bucket =
  | 'ELIGIBLE'
  | 'COOLDOWN'
  | 'SCREENING_STALE'
  | 'REACTIVE'
  | 'NEVER_SCREENED'
  | 'DEFERRED'
  | 'REMOVED';

// Deterministic distribution across ~200 donors covering all seven cases.
function bucketFor(i: number): Bucket {
  if (i % 17 === 0) return 'REMOVED';
  if (i % 13 === 0) return 'DEFERRED';
  if (i % 11 === 0) return 'REACTIVE';
  if (i % 7 === 0) return 'SCREENING_STALE';
  if (i % 5 === 0) return 'COOLDOWN';
  if (i % 3 === 0) return 'NEVER_SCREENED';
  return 'ELIGIBLE';
}

async function main(): Promise<void> {
  console.log('Seeding PBB…');

  // Reset in dependency order (idempotent seed).
  await prisma.donorOtp.deleteMany();
  await prisma.screening.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.donor.deleteMany();
  await prisma.stockLevel.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.town.deleteMany();

  // Roles
  for (const r of ROLES) {
    await prisma.role.create({
      data: { id: r.id, name: r.name, level: r.level, permissions: r.perms, isSystem: true },
    });
  }

  // Towns (offices first so servedFrom can reference them)
  const townId: Record<string, string> = {};
  for (const t of TOWNS.filter((t) => OFFICES.includes(t.office) && t.name === t.office)) {
    const row = await prisma.town.create({
      data: { id: `town-${slug(t.name)}`, name: t.name, isOffice: true },
    });
    townId[t.name] = row.id;
  }
  for (const t of TOWNS.filter((t) => !(OFFICES.includes(t.office) && t.name === t.office))) {
    const row = await prisma.town.create({
      data: {
        id: `town-${slug(t.name)}`,
        name: t.name,
        isOffice: false,
        servedFromId: townId[t.office],
      },
    });
    townId[t.name] = row.id;
  }

  // Branches (one per office town)
  const branchId: Record<string, string> = {};
  for (const office of OFFICES) {
    const row = await prisma.branch.create({
      data: {
        id: `branch-${slug(office)}`,
        townId: townId[office]!,
        address: `${office} branch office, Balochistan`,
        phones: office === 'Quetta' ? ['081-2836820', '081-2839500'] : [`08x-${office.length}00000`],
        hasAmbulance: office === 'Quetta' || office === 'Sibi',
        bankAccount: office === 'Quetta' ? 'PK00PBB0000000001999' : null,
        stockUpdatedAt: office === 'Chaman' ? ago(3) : ago(0), // Chaman stale (>48h) for §8.6
      },
    });
    branchId[office] = row.id;
    // Stock levels for all 8 group/rh combos
    for (const g of GROUPS) {
      for (const rh of RH) {
        await prisma.stockLevel.create({
          data: {
            branchId: row.id,
            bloodGroup: g,
            rhFactor: rh,
            unitsAvailable: (g === BloodGroup.O && rh === RhFactor.NEGATIVE) ? 1 : (office.length + g.length) % 12,
          },
        });
      }
    }
  }

  // A superadmin account (ACTIVE, others INVITED to honour "no self-registration")
  await prisma.user.create({
    data: {
      id: 'user-admin',
      name: 'Head Office Admin',
      email: 'admin@pashtoonkhwabloodbank.org',
      // passwordHash intentionally null-safe placeholder; real hash set by T1 auth seed.
      passwordHash: null,
      roleId: 'role-superadmin',
      townId: townId['Quetta'],
      status: UserStatus.ACTIVE,
    },
  });

  // Donors - deterministic, ~200, spread across all seven eligibility buckets.
  const counts: Record<Bucket, number> = {
    ELIGIBLE: 0, COOLDOWN: 0, SCREENING_STALE: 0, REACTIVE: 0,
    NEVER_SCREENED: 0, DEFERRED: 0, REMOVED: 0,
  };
  const N = 200;
  for (let i = 1; i <= N; i++) {
    const bucket = bucketFor(i);
    counts[bucket]++;
    const town = TOWNS[i % TOWNS.length]!;
    const office = town.office;
    const g = GROUPS[i % GROUPS.length]!;
    const rh = RH[i % RH.length]!;
    const donor = await prisma.donor.create({
      data: {
        id: `donor-${String(i).padStart(4, '0')}`,
        mrNo: `${slug(office).toUpperCase().slice(0, 3)}-${String(i).padStart(4, '0')}`,
        name: `Donor ${i}`,
        bloodGroup: g,
        rhFactor: rh,
        dateOfBirth: ago(365 * (20 + (i % 30))),
        phone: `03${String(100000000 + i * 7).slice(0, 9)}`,
        address: `House ${i}, ${town.name}`,
        townId: townId[town.name]!,
        branchId: branchId[office]!,
        quantityMl: 350,
        timesDonated: i % 9,
        lastDonatedAt:
          bucket === 'COOLDOWN' ? ago(30) : bucket === 'ELIGIBLE' ? ago(200) : null,
        deferredUntil: bucket === 'DEFERRED' ? ahead(60) : null,
        deferredReason: bucket === 'DEFERRED' ? 'Low haemoglobin at last visit' : null,
        deletedAt: bucket === 'REMOVED' ? ago(1) : null,
        createdById: 'user-admin',
      },
    });

    // Screenings per bucket
    if (bucket === 'REACTIVE') {
      await prisma.screening.create({
        data: {
          donorId: donor.id, testedAt: ago(20),
          hcv: ScreeningResult.NEGATIVE, hiv: ScreeningResult.NEGATIVE,
          hbsAg: ScreeningResult.POSITIVE, vdrl: ScreeningResult.NEGATIVE, mp: ScreeningResult.NEGATIVE,
          performedBy: 'Lab', labReference: `LR-${i}`,
        },
      });
    } else if (bucket === 'SCREENING_STALE') {
      await prisma.screening.create({
        data: {
          donorId: donor.id, testedAt: ago(220), // > 180 days
          hcv: ScreeningResult.NEGATIVE, hiv: ScreeningResult.NEGATIVE,
          hbsAg: ScreeningResult.NEGATIVE, vdrl: ScreeningResult.NEGATIVE, mp: ScreeningResult.NEGATIVE,
          performedBy: 'Lab', labReference: `LR-${i}`,
        },
      });
    } else if (bucket === 'COOLDOWN' || bucket === 'ELIGIBLE' || bucket === 'DEFERRED' || bucket === 'REMOVED') {
      // recent, all-negative screening so the deciding factor is the bucket condition
      await prisma.screening.create({
        data: {
          donorId: donor.id, testedAt: ago(30),
          hcv: ScreeningResult.NEGATIVE, hiv: ScreeningResult.NEGATIVE,
          hbsAg: ScreeningResult.NEGATIVE, vdrl: ScreeningResult.NEGATIVE, mp: ScreeningResult.NEGATIVE,
          performedBy: 'Lab', labReference: `LR-${i}`,
        },
      });
    }
    // NEVER_SCREENED: no screening row at all.
  }

  console.log('Eligibility bucket distribution:', counts);
  console.log(`Seeded ${TOWNS.length} towns, ${OFFICES.length} branches, ${ROLES.length} roles, ${N} donors.`);
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
