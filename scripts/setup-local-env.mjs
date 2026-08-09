#!/usr/bin/env node
// Writes a local .env from the documented template if one does not already exist.
// Run on your own machine (the CI/agent sandbox blocks .env writes on purpose).
import { existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, '.env');

if (existsSync(target)) {
  console.log('.env already exists — leaving it untouched.');
  process.exit(0);
}

const template = `# Local dev — Docker Postgres + Redis. Swap DB urls for Supabase in prod (see docs/DEPLOYMENT.md).
# Docker Postgres is published on 5433 (5432 is often taken by a native Postgres).
DATABASE_URL="postgresql://pbb:pbb_dev_password@localhost:5433/pbb?schema=public"
DIRECT_URL="postgresql://pbb:pbb_dev_password@localhost:5433/pbb?schema=public"
REDIS_URL="redis://localhost:6379"

JWT_ACCESS_SECRET="dev-access-secret-change-me-32-chars-min"
JWT_REFRESH_SECRET="dev-refresh-secret-change-me-32-chars-min"
JWT_ACCESS_TTL="15m"
JWT_REFRESH_TTL="30d"
ARGON2_MEMORY_KiB=19456
TOTP_ISSUER="Pashtoonkhwa Blood Bank"

NOTIFICATIONS_DRIVER="console"
WHATSAPP_ENABLED="false"

STORAGE_DRIVER="local"
SUPABASE_URL=""
SUPABASE_SERVICE_ROLE_KEY=""
SUPABASE_STORAGE_BUCKET="pbb-media"

NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
API_PORT=4000
WEB_PORT=3000

RATE_LIMIT_PUBLIC_PER_MIN=20
SCREENING_STALE_DAYS=180
DONATION_COOLDOWN_DAYS=90
STOCK_STALE_HOURS=48
`;

writeFileSync(target, template, 'utf8');
console.log('Wrote .env for local development. Edit secrets before any real use.');
