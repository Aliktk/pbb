// The single client for the PBB API. Attaches the access token, and on a 401 tries the
// refresh token once before giving up. Every error becomes an ApiError carrying the server's
// message (from the { ok:false, error:{ message } } envelope), so screens can show it directly.

import { tokenStore } from './tokenStore';
import type { AuthTokens } from './apiTypes';

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean; // attach the access token (default true)
  retry?: boolean; // allow one refresh-and-retry on 401 (default true)
  params?: Record<string, string | number | boolean | undefined>;
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = tokenStore.refresh;
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const tokens = (await res.json()) as AuthTokens;
    tokenStore.set(tokens.accessToken, tokens.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, retry = true, params } = options;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && tokenStore.access) headers.Authorization = `Bearer ${tokenStore.access}`;

  let fullPath = path;
  if (params) {
    const qp = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '') {
        qp.append(key, String(val));
      }
    }
    const qStr = qp.toString();
    if (qStr) {
      fullPath += (fullPath.includes('?') ? '&' : '?') + qStr;
    }
  }

  const res = await fetch(`${BASE}${fullPath}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && retry && (await tryRefresh())) {
    return request<T>(path, { ...options, retry: false });
  }

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    let rawMsg = json?.error?.message ?? res.statusText ?? 'Request failed';
    if (
      rawMsg.toLowerCase().includes("can't reach database") ||
      rawMsg.toLowerCase().includes('prisma') ||
      rawMsg.toLowerCase().includes('invocation in') ||
      rawMsg.toLowerCase().includes('econnrefused')
    ) {
      rawMsg = 'Unable to connect to the database server. Please check database connectivity and try again.';
    }
    throw new ApiError(res.status, rawMsg, json?.error?.code);
  }
  return json as T;
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'PATCH', body }),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'DELETE' }),
};
