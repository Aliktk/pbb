'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from './api';
import { tokenStore } from './tokenStore';
import type { AuthTokens, PublicUser } from './apiTypes';

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
  /** Does the signed-in user's role grant `resource:action`? Presentation only; the server enforces. */
  can: (resource: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refetchUser = useCallback(async () => {
    if (!tokenStore.access) return;
    try {
      const me = await api.get<PublicUser>('/auth/me');
      setUser(me);
    } catch {
      // Keep existing user on error
    }
  }, []);

  // On first load, if we have a token, ask the server who we are. A bad/expired token clears.
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!tokenStore.access) {
        setLoading(false);
        return;
      }
      try {
        const me = await api.get<PublicUser>('/auth/me');
        if (alive) setUser(me);
      } catch {
        tokenStore.clear();
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await api.post<AuthTokens>('/auth/login', { email, password }, { auth: false });
    tokenStore.set(tokens.accessToken, tokens.refreshToken);
    setUser(tokens.user);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = tokenStore.refresh;
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken }, { auth: false });
      } catch {
        // best effort; clearing the local tokens is what matters
      }
    }
    tokenStore.clear();
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

  return <AuthContext.Provider value={{ user, loading, login, logout, refetchUser, can }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
