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

// INV-5 - ONE ELIGIBILITY RULE. The thresholds 90 / 180 must appear ONLY in migration 002.
// Any 90/180 day-window arithmetic in DOMAIN code means a second copy of the rule. Seeds,
// tests and fixtures legitimately reference the thresholds to CONSTRUCT data that lands in
// each bucket, so they are out of scope - the invariant hunts duplicated logic, not fixtures.
{
  // Only ARITHMETIC/comparison on the day-windows counts - user-facing copy ("90 days
  // since your last donation") and config-value display (["Days between donations", 90])
  // are not a second copy of the RULE. Match a comparison/subtraction adjacent to 90/180.
  const arith = /(?:[<>]=?\s*(?:90|180)\b)|(?:\b(?:90|180)\s*[<>-])|(?:-\s*(?:90|180)\b)/;
  const isFixture = (f) =>
    /(^|[\\/])(seed|.*\.(test|spec)|.*\.fixture)\.(ts|tsx|mjs)$/i.test(f) ||
    /[\\/](test|tests|__tests__|scripts|prisma[\\/]migrations)[\\/]/i.test(f);
  const prod = [];   // apps/api/src - production server path: MUST NOT duplicate the rule
  const design = []; // apps/web - design-phase sample-data logic, to be replaced by API reads
  for (const f of codeFiles) {
    if (isFixture(f)) continue;
    const text = readFileSync(f, 'utf8');
    text.split('\n').forEach((line, i) => {
      if (!arith.test(line)) return;
      const hit = `${f.replace(repo, '.')}:${i + 1}  ${line.trim()}`;
      if (/[\\/]apps[\\/]api[\\/]src[\\/]/.test(f)) prod.push(hit);
      else if (/[\\/]apps[\\/]web[\\/]/.test(f)) design.push(hit);
      else prod.push(hit);
    });
  }
  if (prod.length) {
    record('INV-5', 'fail', 'eligibility arithmetic in production code (must read the view, not recompute):\n    ' + prod.join('\n    '));
  } else {
    record('INV-5', 'pass', 'no eligibility arithmetic in the production API path (only migration 002 owns 90/180)');
  }
  // Design-phase duplication is TRACKED and VISIBLE (not silently ignored): the web admin
  // renders sample data with a mirror of the rule until it is wired to the API, at which
  // point eligibility comes from the server (which reads donor_eligibility) and these go.
  if (design.length) {
    record('INV-5-web', 'note', `design-phase: web recomputes eligibility on sample data (${design.length} sites) - remove when wired to the API:\n    ` + design.join('\n    '));
  }
}

// INV-4 - PROSE MATCHES DATA (partial static form): no obvious hardcoded stat literals in
// user-facing copy. Full rule is a lint rule the web app owns (T4). Report as pending there.
record('INV-4', 'pending', 'numeric-literal-near-data lint rule owned by T4 (web)');

// DB / E2E invariants that need a running system - owned by later tracks.
record('INV-1', 'pending', 'one-source-per-number - asserted by T5 dashboard tests');
record('INV-2', 'pending', 'scoped header ⇒ scoped body - T5/T6 E2E');
record('INV-3', 'pending', 'referential sweep - nightly job (T8) + T2 import');
record('INV-5-db', 'proven', 'view returns all 7 states (verified in T0 handoff)');
record('INV-6', 'pending', 'migration data-correctness tests - per migration');
record('INV-7', 'pending', 'visible error state - T4 error boundaries');
record('INV-8', 'pending', 'plurals + empty states at 0/1/many - T4/T5 render tests');
record('INV-9', 'pending', 'no dead controls - E2E clicks every button (T4/T5)');
record('INV-10', 'pending', 'server-side permissions - T1 test:rbac');
record('INV-11', 'pending', 'privacy of phones/patient names - T1/T3 payload asserts');
record('INV-12', 'proven', 'audit_log append-only (verified in T0 handoff)');

// Report
let failed = 0;
for (const r of results) {
  const mark = { pass: '✓', proven: '✓', pending: '·', note: '!', fail: '✗' }[r.status] ?? '?';
  if (r.status === 'fail') failed++;
  console.log(`${mark} ${r.id.padEnd(10)} ${r.status.toUpperCase().padEnd(8)} ${r.detail}`);
}
console.log(`\n${results.length} invariants tracked · ${failed} hard failure(s).`);
process.exit(failed > 0 ? 1 : 0);
