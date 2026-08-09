#!/usr/bin/env node
/**
 * Invariant checks (Harness §7). These catch the class of bug unit tests miss because each
 * unit is individually correct. This runner grows as tracks land; today it enforces the
 * static invariants that can be proven without a running app, and reports which DB/E2E
 * invariants are pending their owning track. Exit non-zero on any hard failure.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const results = [];
const record = (id, status, detail) => results.push({ id, status, detail });

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (['node_modules', '.git', 'dist', '.next', '_handoff'].includes(name)) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(repo);
const codeFiles = files.filter((f) => ['.ts', '.tsx'].includes(extname(f)));

// INV-5 — ONE ELIGIBILITY RULE. The thresholds 90 / 180 must appear ONLY in migration 002.
// Any 90/180 day-window arithmetic in DOMAIN code means a second copy of the rule. Seeds,
// tests and fixtures legitimately reference the thresholds to CONSTRUCT data that lands in
// each bucket, so they are out of scope — the invariant hunts duplicated logic, not fixtures.
{
  const offenders = [];
  const rx = /\b(90|180)\b/;
  const isFixture = (f) =>
    /(^|[\\/])(seed|.*\.(test|spec)|.*\.fixture)\.(ts|tsx|mjs)$/i.test(f) ||
    /[\\/](test|tests|__tests__|scripts|prisma[\\/]migrations)[\\/]/i.test(f);
  for (const f of codeFiles) {
    if (isFixture(f)) continue;
    const text = readFileSync(f, 'utf8');
    text.split('\n').forEach((line, i) => {
      if (!rx.test(line)) return;
      // allow when clearly not a day-window (heuristic: mentions days / cooldown / stale / interval)
      if (/day|cooldown|stale|screening|interval|eligib/i.test(line)) {
        offenders.push(`${f}:${i + 1}  ${line.trim()}`);
      }
    });
  }
  if (offenders.length === 0) {
    record('INV-5', 'pass', 'no day-window arithmetic (90/180) in application code');
  } else {
    record('INV-5', 'fail', 'eligibility thresholds found outside migration 002:\n    ' + offenders.join('\n    '));
  }
}

// INV-4 — PROSE MATCHES DATA (partial static form): no obvious hardcoded stat literals in
// user-facing copy. Full rule is a lint rule the web app owns (T4). Report as pending there.
record('INV-4', 'pending', 'numeric-literal-near-data lint rule owned by T4 (web)');

// DB / E2E invariants that need a running system — owned by later tracks.
record('INV-1', 'pending', 'one-source-per-number — asserted by T5 dashboard tests');
record('INV-2', 'pending', 'scoped header ⇒ scoped body — T5/T6 E2E');
record('INV-3', 'pending', 'referential sweep — nightly job (T8) + T2 import');
record('INV-5-db', 'proven', 'view returns all 7 states (verified in T0 handoff)');
record('INV-6', 'pending', 'migration data-correctness tests — per migration');
record('INV-7', 'pending', 'visible error state — T4 error boundaries');
record('INV-8', 'pending', 'plurals + empty states at 0/1/many — T4/T5 render tests');
record('INV-9', 'pending', 'no dead controls — E2E clicks every button (T4/T5)');
record('INV-10', 'pending', 'server-side permissions — T1 test:rbac');
record('INV-11', 'pending', 'privacy of phones/patient names — T1/T3 payload asserts');
record('INV-12', 'proven', 'audit_log append-only (verified in T0 handoff)');

// Report
let failed = 0;
for (const r of results) {
  const mark = { pass: '✓', proven: '✓', pending: '·', fail: '✗' }[r.status] ?? '?';
  if (r.status === 'fail') failed++;
  console.log(`${mark} ${r.id.padEnd(10)} ${r.status.toUpperCase().padEnd(8)} ${r.detail}`);
}
console.log(`\n${results.length} invariants tracked · ${failed} hard failure(s).`);
process.exit(failed > 0 ? 1 : 0);
