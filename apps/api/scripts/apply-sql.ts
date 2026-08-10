/**
 * Apply a .sql file to the Supabase Postgres over the DIRECT connection (multi-statement).
 * Used for RLS / policies / views that live outside Prisma's migration history.
 *
 *   node --env-file-if-exists=../../.env --import tsx scripts/apply-sql.ts path/to/file.sql
 */
import { readFileSync } from 'node:fs';
import { Client } from 'pg';

async function main(): Promise<void> {
  const file = process.argv[2];
  if (!file) throw new Error('Usage: apply-sql.ts <file.sql>');
  const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
  if (!connectionString) throw new Error('DATABASE_URL / DIRECT_URL is not set');

  const sql = readFileSync(file, 'utf8');
  // Supabase presents a valid public certificate; verify it (do not disable TLS checks).
  const client = new Client({ connectionString, ssl: true });
  await client.connect();
  try {
    await client.query(sql);
    // eslint-disable-next-line no-console
    console.log(`Applied ${file}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('apply-sql failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
