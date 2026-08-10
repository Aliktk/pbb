// Project-wide text sanitizer.
//
// Cleans human-readable content across tracked files: replaces em/en dashes with plain
// hyphens, strips hidden Unicode artifacts, normalises no-break spaces, and trims trailing
// whitespace. Runs on the output of `git ls-files`, so generated and ignored folders
// (node_modules, .next, dist, .git) are never touched.
//
// Deliberately preserved:
//   - U+2212 MINUS SIGN, the blood-group notation ("O-") used across the app and API.
//   - U+200C / U+200D (ZWNJ / ZWJ) and the bidi marks (U+200E/F), which Arabic-script text
//     (Urdu, Pashto) needs to join and order correctly.
//   - prisma/migrations (editing an applied migration breaks Prisma's checksum), the vendored
//     _handoff prototype, .env files, lockfiles, and this script itself.
//
// The target characters are declared by numeric code point and the patterns are built at
// runtime, so this source file contains only ASCII and can never corrupt its own rules.
//
// Usage:  node scripts/sanitize.mjs           (dry run, reports only)
//         node scripts/sanitize.mjs --write    (apply changes)

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const WRITE = process.argv.includes('--write');

const TEXT_EXT = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.md', '.mdx',
  '.css', '.sql', '.prisma', '.txt', '.yml', '.yaml', '.html',
]);

const EXCLUDE_DIRS = ['/migrations/', '_handoff/'];
const EXCLUDE_FILES = [
  /(^|\/)\.env/,
  /\.lock$/,
  /(^|\/)(pnpm-lock|package-lock)\.ya?ml?$/,
  /(^|\/)yarn\.lock$/,
  /(^|\/)sanitize\.mjs$/,
];

const charClass = (codes) => new RegExp('[' + codes.map((c) => String.fromCodePoint(c)).join('') + ']', 'g');

// Em dash (0x2014), horizontal bar (0x2015), en dash (0x2013) -> plain hyphen.
const DASHES = charClass([0x2014, 0x2015, 0x2013]);
// Zero-width space, word joiner, BOM, soft hyphen, replacement character -> removed.
// NOTE: ZWNJ (0x200C) / ZWJ (0x200D) and bidi marks are intentionally absent (multilingual).
const INVISIBLE = charClass([0x200b, 0x2060, 0xfeff, 0x00ad, 0xfffd]);
// No-break space (0x00A0) -> normal space.
const NBSP = charClass([0x00a0]);

function ext(path) {
  const dot = path.lastIndexOf('.');
  return dot === -1 ? '' : path.slice(dot).toLowerCase();
}

function included(path) {
  if (!TEXT_EXT.has(ext(path))) return false;
  if (EXCLUDE_DIRS.some((d) => path.includes(d))) return false;
  if (EXCLUDE_FILES.some((re) => re.test(path))) return false;
  return true;
}

function sanitize(text) {
  const counts = { dash: 0, invisible: 0, nbsp: 0, trailing: 0 };

  let out = text.replace(DASHES, () => (counts.dash++, '-'));
  out = out.replace(INVISIBLE, () => (counts.invisible++, ''));
  out = out.replace(NBSP, () => (counts.nbsp++, ' '));
  out = out.replace(/[ \t]+(\r?\n)/g, (_m, nl) => (counts.trailing++, nl));
  out = out.replace(/[ \t]+$/, () => (counts.trailing++, ''));

  return { out, counts, changed: out !== text };
}

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean)
  .filter(included);

const totals = { dash: 0, invisible: 0, nbsp: 0, trailing: 0 };
const changedFiles = [];

for (const file of files) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue; // unreadable / binary, skip
  }
  const { out, counts, changed } = sanitize(text);
  if (!changed) continue;
  for (const k of Object.keys(totals)) totals[k] += counts[k];
  changedFiles.push({ file, counts });
  if (WRITE) writeFileSync(file, out);
}

console.log(`${WRITE ? 'Applied' : 'Would change'}: ${changedFiles.length} of ${files.length} scanned files`);
console.log(`  dashes: ${totals.dash}  invisible: ${totals.invisible}  nbsp: ${totals.nbsp}  trailing-ws: ${totals.trailing}`);
for (const { file, counts } of changedFiles) {
  const parts = Object.entries(counts).filter(([, v]) => v > 0).map(([k, v]) => `${k}:${v}`);
  console.log(`  ${file}  (${parts.join(', ')})`);
}
if (!WRITE) console.log('\nDry run. Re-run with --write to apply.');
