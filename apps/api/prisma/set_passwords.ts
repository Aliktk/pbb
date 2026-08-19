import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const hash = await argon2.hash('pbbadmin123');
  const result = await prisma.user.updateMany({
    data: {
      passwordHash: hash,
      status: 'ACTIVE',
    },
  });
  console.log('Successfully set password "pbbadmin123" for accounts:', result.count);
}

main()
  .catch((err) => console.error(err))
  .finally(() => prisma.$disconnect());
