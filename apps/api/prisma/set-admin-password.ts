/**
 * Set (or reset) the head office admin's password so you can actually sign in. The seed leaves
 * passwordHash null on purpose ("no self-registration"), so run this once after seeding.
 *
 *   pnpm --filter @pbb/api auth:set-password                 # default account + password
 *   SEED_ADMIN_PASSWORD='...' pnpm --filter @pbb/api auth:set-password
 *   pnpm --filter @pbb/api auth:set-password myPasswordHere  # password as an argument
 */
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const email = process.env.ADMIN_EMAIL ?? 'admin@pashtoonkhwabloodbank.org';
const password = process.env.SEED_ADMIN_PASSWORD ?? process.argv[2] ?? 'pbbadmin123';

async function main(): Promise<void> {
  const passwordHash = await argon2.hash(password);
  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash, status: 'ACTIVE' },
  });
  // eslint-disable-next-line no-console
  console.log(`Password set for ${user.email} (status ${user.status}). You can now sign in.`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to set the admin password:', err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
