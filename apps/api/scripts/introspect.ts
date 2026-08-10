import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const tables = await prisma.$queryRawUnsafe<{ name: string; kind: string; rls: boolean }[]>(
    `select c.relname as name, c.relkind::text as kind, c.relrowsecurity as rls
     from pg_class c join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind in ('r','v') order by c.relname`,
  );
  // eslint-disable-next-line no-console
  console.log('=== public tables/views (RLS) ===');
  for (const r of tables) {
    // eslint-disable-next-line no-console
    console.log(`${r.rls ? 'RLS-ON ' : 'RLS-OFF'} ${r.kind === 'v' ? '(view)' : '     '} ${r.name}`);
  }
  for (const t of ['donors', 'blood_requests', 'towns', 'users']) {
    const cols = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
      `select column_name from information_schema.columns where table_schema='public' and table_name=$1 order by ordinal_position`,
      t,
    );
    // eslint-disable-next-line no-console
    console.log(`\n=== ${t} columns ===\n` + cols.map((c) => c.column_name).join(', '));
  }
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
