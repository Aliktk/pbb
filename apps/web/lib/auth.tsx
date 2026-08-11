'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from './supabaseClient';
import { permissionsFor, roleLabel, roleLevel } from './roles';
import type { PublicUser } from './apiTypes';

// Authentication for the Supabase-direct model (BCP shape).
//
// Supabase Auth is the identity provider: signInWithPassword / getSession / onAuthStateChange.
// After a session exists we read the caller's row from `profiles` for their role and town, then
// build the same PublicUser shape the panel already consumes. Access is enforced by Row Level
// Security in the database, so `can()` here is presentation only (it just hides UI).

interface ProfileRow {
  id: string;
  name: string | null;
  email: string | null;
  role_key: string;
  town_id: string | null;
  is_active: boolean;
}

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Does the signed-in user's role grant `resource:action`? Presentation only; the DB (RLS) enforces. */
  can: (resource: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toPublicUser(profile: ProfileRow): PublicUser {
  return {
    id: profile.id,
    name: profile.name?.trim() || profile.email || 'Staff',
    email: profile.email ?? '',
    role: { id: profile.role_key, name: roleLabel(profile.role_key), level: roleLevel(profile.role_key) },
    townId: profile.town_id,
    status: profile.is_active ? 'ACTIVE' : 'INACTIVE',
    permissions: permissionsFor(profile.role_key),
  };
}

// A signed-in user whose profile row is not readable yet (migrations not applied, or the head
// office has not created their profile). They are authenticated but see nothing until a profile
// exists, which RLS guarantees anyway. Keeps setup from hard-locking anyone out.
function fallbackUser(id: string, email: string | null | undefined): PublicUser {
  return toPublicUser({ id, name: null, email: email ?? null, role_key: 'viewer', town_id: null, is_active: true });
}

async function loadProfile(id: string, email: string | null | undefined): Promise<PublicUser> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,name,email,role_key,town_id,is_active')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    console.warn('No profile row for this account yet; signing in with limited access.', error?.message ?? '');
    return fallbackUser(id, email);
  }
  return toPublicUser(data as ProfileRow);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore an existing session on load, and keep in sync with sign-in / sign-out / token refresh.
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!alive) return;
      if (session?.user) {
        setUser(await loadProfile(session.user.id, session.user.email));
      }
      if (alive) setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;
      if (session?.user) {
        loadProfile(session.user.id, session.user.email).then((u) => {
          if (alive) setUser(u);
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(friendlyAuthError(error.message));
    if (data.user) setUser(await loadProfile(data.user.id, data.user.email));
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const can = useCallback(
    (resource: string, action: string) => {
      const perms = user?.permissions;
      if (!perms) return false;
      const wild = perms['*'];
      if (wild && (wild.includes('*') || wild.includes(action))) return true;
      const res = perms[resource];
      return Boolean(res && (res.includes('*') || res.includes(action)));
    },
    [user],
  );

  return <AuthContext.Provider value={{ user, loading, login, logout, can }}>{children}</AuthContext.Provider>;
}

// Turn Supabase's auth error text into something a person can act on.
function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Wrong email or password. Please try again.';
  if (m.includes('email not confirmed')) return 'This account is not confirmed yet. Ask the head office to confirm it.';
  if (m.includes('invalid api key')) return 'The site is not connected to the database yet. Please contact the administrator.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'Cannot reach the server. Check your connection and try again.';
  return message;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
