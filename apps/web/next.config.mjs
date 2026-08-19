import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Load env from the monorepo root so a single root `.env` feeds the whole workspace. Next only
// reads env files in this app folder by default, so without this the root `.env` (where the
// Supabase keys live locally) would be ignored. On Vercel the root `.env` is not deployed, so the
// project's dashboard Environment Variables are used instead - both paths work.
// Only NEXT_PUBLIC_* values are inlined into the browser bundle; other keys stay server-side.
const here = dirname(fileURLToPath(import.meta.url));
for (const name of ['.env', '.env.local']) {
  try {
    const text = readFileSync(resolve(here, '../../', name), 'utf8');
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      if (key in process.env) continue; // real environment wins over the file
      let value = trimmed.slice(eq + 1).trim();
      if (value.length >= 2 && ((value[0] === '"' && value.endsWith('"')) || (value[0] === "'" && value.endsWith("'")))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  } catch {
    // No root env file here (e.g. on Vercel with Root Directory = apps/web) - that is expected.
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Public site pages are Server Components - fast on 3G, indexable (Harness §2).
  // Media may come from Supabase Storage / Cloudinary - allow their hosts here per env.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  transpilePackages: ['@pbb/types'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
