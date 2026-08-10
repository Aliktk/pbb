import { createClient } from '@supabase/supabase-js';

// Browser Supabase client (BCP model): the frontend talks straight to Supabase (Auth +
// PostgREST), and RLS enforces access. The anon key is public by design - it is safe to ship
// because Row Level Security (see supabase/migrations) decides what each caller may read/write.
//
// Set these in .env.local (local) and in Vercel (Project -> Settings -> Environment Variables):
//   NEXT_PUBLIC_SUPABASE_URL       = https://<project-ref>.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY  = the project's anon / publishable key (Dashboard -> API)

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!url || !anonKey) {
  // Do not throw at import (would break SSR/build); fail visibly when a call is actually made.
  // eslint-disable-next-line no-console
  console.warn('Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(url || 'http://localhost:54321', anonKey || 'public-anon-key', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
