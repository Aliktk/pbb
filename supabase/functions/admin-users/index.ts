// PBB admin-users Edge Function.
//
// Privileged account operations that the browser (anon key) is NOT allowed to do:
//   • set-password  — force-set another staff account's password
//   • delete-user   — permanently delete a staff account (its profile cascades via FK)
//
// The service-role key lives ONLY here on the server, never in the frontend. Every call is
// authorized: (1) the caller must present a valid Supabase session (JWT), (2) that caller's
// profile must be an ACTIVE head-office (super-admin) row, and (3) the TARGET must be a known
// staff account that is NOT itself head office (heads cannot manage other heads or themselves).
//
// Deploy:  supabase functions deploy admin-users
// (SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are injected automatically.)
// Optional: set ADMIN_FN_ALLOWED_ORIGINS = comma-separated origins allowed to call this.

import { createClient } from 'jsr:@supabase/supabase-js@2';

// Origins allowed to call this credentialed admin function. Configure ADMIN_FN_ALLOWED_ORIGINS
// (comma-separated) for production; otherwise localhost and *.vercel.app are reflected.
const CONFIGURED_ORIGINS = (Deno.env.get('ADMIN_FN_ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

function allowedOrigin(req: Request): string {
  const origin = req.headers.get('Origin') ?? '';
  if (CONFIGURED_ORIGINS.length) {
    return CONFIGURED_ORIGINS.includes(origin) ? origin : CONFIGURED_ORIGINS[0];
  }
  if (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) {
    return origin;
  }
  return 'null';
}

function corsHeaders(req: Request): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': allowedOrigin(req),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

function json(req: Request, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return json(req, 405, { error: 'Method not allowed' });

  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader) return json(req, 401, { error: 'Not authenticated' });

    // (1) Identify the caller from their own JWT (verified by GoTrue, not decoded locally).
    const caller = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: userErr } = await caller.auth.getUser();
    if (userErr || !userData?.user) return json(req, 401, { error: 'Not authenticated' });
    const callerId = userData.user.id;

    // Service-role client — bypasses RLS. Used for the authorization lookups and the actual work.
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    // (2) Authorize the caller: must be an active head-office profile.
    const { data: prof, error: profErr } = await admin
      .from('profiles')
      .select('role_key, is_active')
      .eq('id', callerId)
      .single();
    if (profErr || !prof || !prof.is_active || prof.role_key !== 'head') {
      return json(req, 403, { error: 'Only an active head-office account may manage staff accounts.' });
    }

    const body = await req.json().catch(() => null);
    const action: string | undefined = body?.action;
    const userId: string | undefined = body?.userId;
    const password: string | undefined = body?.password;

    if (action !== 'set-password' && action !== 'delete-user') {
      return json(req, 400, { error: 'Unknown action.' });
    }
    if (!userId) return json(req, 400, { error: 'A target account is required.' });
    if (userId === callerId) return json(req, 400, { error: 'You cannot manage your own account here.' });

    // (3) Authorize the TARGET: must be a known staff account that is not itself head office.
    const { data: target } = await admin
      .from('profiles')
      .select('role_key')
      .eq('id', userId)
      .single();
    if (!target) return json(req, 404, { error: 'No such staff account.' });
    if (target.role_key === 'head') {
      return json(req, 403, { error: 'You cannot manage another head-office account from here.' });
    }

    if (action === 'set-password') {
      if (!password || password.length < 8 || password.length > 128) {
        return json(req, 400, { error: 'The new password must be between 8 and 128 characters.' });
      }
      const { error } = await admin.auth.admin.updateUserById(userId, { password });
      if (error) {
        console.error('admin.updateUserById failed:', error.message);
        return json(req, 400, { error: 'Could not set the password. Confirm the account still exists.' });
      }
      return json(req, 200, { ok: true });
    }

    // delete-user — deleting the auth user cascades the profile row (FK ON DELETE CASCADE).
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) {
      console.error('admin.deleteUser failed:', error.message);
      return json(req, 400, { error: 'Could not delete the account. Confirm it still exists.' });
    }
    return json(req, 200, { ok: true });
  } catch (e) {
    console.error('admin-users unhandled error:', e);
    return json(req, 500, { error: 'An unexpected error occurred. Please try again.' });
  }
});
