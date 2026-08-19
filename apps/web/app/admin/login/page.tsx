'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoginShell } from '../../../components/admin/LoginShell';
import { useAuth } from '../../../lib/auth';
import { ApiError } from '../../../lib/api';

export default function AdminLogin() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email.trim(), pass);
      router.replace('/admin/overview');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid email or password. Please check your credentials.');
      setBusy(false);
    }
  }

  return (
    <LoginShell>
      <form onSubmit={onSubmit} className="login-form">
        <div className="login-form-header">
          <span className="sponsor-badge-pill">HEAD OFFICE &amp; BRANCH DISPATCH</span>
          <h2 className="login-form-title">Sign In to Control Panel</h2>
          <p className="login-form-sub">
            Use the official staff credentials assigned to your account to access system records.
          </p>
        </div>

        {error && (
          <div className="login-error-alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="fgrp">
          <label className="lb">Official Email Address</label>
          <div className="login-input-wrapper">
            <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input
              className="fld login-input-iconic"
              type="email"
              required
              placeholder="name@pashtoonkhwabloodbank.org"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="fgrp">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
            <label className="lb" style={{ margin: 0 }}>Password</label>
            <Link href="/admin/forgot" className="login-forgot-link">
              Forgotten password?
            </Link>
          </div>
          <div className="pwwrap login-input-wrapper">
            <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              className="fld login-input-iconic"
              type={show ? 'text' : 'password'}
              required
              placeholder="••••••••••••"
              autoComplete="current-password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
            <button
              type="button"
              className="pweye"
              onClick={() => setShow((s) => !s)}
              aria-label="Toggle password visibility"
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <label className="chk" style={{ margin: '14px 0 24px' }}>
          <input type="checkbox" defaultChecked />
          <span>Keep me securely signed in on this device</span>
        </label>

        <button
          type="submit"
          disabled={busy}
          className="btn-crimson-pill"
          style={{ width: '100%', justifyContent: 'center', padding: '16px 28px', fontSize: '15.5px' }}
        >
          {busy ? 'Verifying & Signing In...' : 'Sign In to Control Panel →'}
        </button>

        <Link
          href="/"
          className="btn-glass-pill"
          style={{ width: '100%', justifyContent: 'center', marginTop: '12px', padding: '13px 24px', fontSize: '14px' }}
        >
          ← Return to Public Website
        </Link>
      </form>
    </LoginShell>
  );
}
