// Read-only Supabase readiness check for the Supabase-direct (BCP) model.
// Reads the same env the web app uses, then verifies: anon key valid? towns readable (public)?
// profiles table present (migration applied)? It NEVER prints the key value - only diagnostics.
//
// Run: node scripts/check-supabase.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const env = {};
for (const name of ['.env', '.env.local', 'apps/web/.env.local']) {
  try {
    for (const line of readFileSync(resolve(root, name), 'utf8').split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const eq = t.indexOf('=');
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if (v.length >= 2 && ((v[0] === '"' && v.endsWith('"')) || (v[0] === "'" && v.endsWith("'")))) v = v.slice(1, -1);
      if (!(k in env)) env[k] = v;
    }
  } catch {
    /* file may not exist */
  }
}

const url = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const mask = (s) => (s ? `${s.slice(0, 6)}…${s.slice(-4)} (len ${s.length})` : '(missing)');
console.log('Project URL :', url || '(missing)');
console.log('Anon key    :', mask(anon), anon.startsWith('eyJ') ? '[looks like a JWT]' : anon ? '[NOT a JWT - suspicious]' : '');

if (!url || !anon) {
  console.log('\nRESULT: env is incomplete. Both NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.');
  process.exit(1);
}

const H = { apikey: anon, Authorization: `Bearer ${anon}` };
const get = async (path) => {
  try {
    const r = await fetch(`${url}${path}`, { headers: H });
    const body = await r.text();
    return { status: r.status, body };
  } catch (e) {
    return { status: 0, body: String(e?.message || e) };
  }
};

console.log('\nChecking...');

// 1) Is the anon key valid at all?
const settings = await get('/auth/v1/settings');
const keyValid = settings.status === 200;
console.log(`1. Anon key accepted by Auth      : ${keyValid ? 'YES' : 'NO'}  (HTTP ${settings.status})`);
if (!keyValid) console.log(`   -> ${settings.body.slice(0, 160)}`);

// 2) Public towns readable? (migration grants anon SELECT on towns)
const towns = await get('/rest/v1/towns?select=id,name&limit=3');
const townsOk = towns.status === 200;
let townCount = null;
try { townCount = JSON.parse(towns.body).length; } catch { /* not json */ }
console.log(`2. towns table readable (public)  : ${townsOk ? `YES (${townCount} sample rows)` : 'NO'}  (HTTP ${towns.status})`);
if (!townsOk) console.log(`   -> ${towns.body.slice(0, 160)}`);

// 3) profiles table present? (0001 migration). Under RLS anon gets [] or 401, but a MISSING table
//    returns a PostgREST "relation does not exist" style error, which tells us the migration ran.
const profiles = await get('/rest/v1/profiles?select=id&limit=1');
const missing = /relation.*does not exist|could not find the table|PGRST205/i.test(profiles.body);
console.log(`3. profiles table exists          : ${missing ? 'NO - migration NOT applied' : 'YES (or RLS-hidden, which is fine)'}  (HTTP ${profiles.status})`);
if (missing) console.log(`   -> ${profiles.body.slice(0, 160)}`);

// 4) public needs view present?
const needs = await get('/rest/v1/public_open_requests?select=reference&limit=1');
const needsMissing = /does not exist|could not find|PGRST205/i.test(needs.body);
console.log(`4. public_open_requests view      : ${needsMissing ? 'NO - migration NOT applied' : 'YES'}  (HTTP ${needs.status})`);

console.log('\nSummary:');
if (!keyValid) {
  console.log('  The anon key is not valid for this project. Copy the CURRENT anon key from');
  console.log('  Supabase Dashboard -> Settings -> API, into root .env as NEXT_PUBLIC_SUPABASE_ANON_KEY.');
} else if (missing) {
  console.log('  Key works, but the schema/migration is not applied yet. Run');
  console.log('  supabase/migrations/0001_supabase_direct.sql in the Supabase SQL editor.');
} else {
  console.log('  Backend looks ready: key valid and tables present. Login should work once the app is');
  console.log('  rebuilt/restarted, provided your auth user exists and has a profiles row (0002).');
}
