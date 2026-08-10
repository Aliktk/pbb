// Access + refresh tokens live in localStorage so a signed-in admin survives a page reload.
// SSR-guarded (there is no localStorage on the server). A later hardening step can move these
// to httpOnly cookies; the rest of the client only talks to this module, so that swap is local.

const ACCESS_KEY = 'pbb.accessToken';
const REFRESH_KEY = 'pbb.refreshToken';

function available(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export const tokenStore = {
  get access(): string | null {
    return available() ? window.localStorage.getItem(ACCESS_KEY) : null;
  },
  get refresh(): string | null {
    return available() ? window.localStorage.getItem(REFRESH_KEY) : null;
  },
  set(accessToken: string, refreshToken: string): void {
    if (!available()) return;
    window.localStorage.setItem(ACCESS_KEY, accessToken);
    window.localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear(): void {
    if (!available()) return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};
