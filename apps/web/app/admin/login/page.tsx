'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { css } from '../../../lib/style';
import { LoginShell } from '../../../components/admin/LoginShell';
import { useAuth } from '../../../lib/auth';

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
      setError(err instanceof Error ? err.message : 'Could not sign in. Please try again.');
      setBusy(false);
    }
  }

  return (
    <LoginShell>
      <form onSubmit={onSubmit}>
        <h2 style={css('margin-bottom:6px')}>Sign in</h2>
        <p className="muted" style={css('margin-bottom:24px;font-size:14.5px')}>
          Use the email address your office was given. Your town and what you can do are already set on your account.
        </p>
        {error && (
          <div className="tag no" style={css('display:block;padding:12px 14px;border-radius:12px;margin-bottom:16px;font-weight:600')}>
            {error}
          </div>
        )}
        <div className="fgrp">
          <label className="lb">Email address</label>
          <input className="fld" type="email" required placeholder="name@pashtoonkhwabloodbank.org" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="fgrp">
          <div className="row" style={css('justify-content:space-between;align-items:baseline')}>
            <label className="lb">Password</label>
            <Link href="/admin/forgot" className="minilink">Forgotten it?</Link>
          </div>
          <div className="pwwrap">
            <input className="fld" type={show ? 'text' : 'password'} required autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} />
            <button type="button" className="pweye" onClick={() => setShow((s) => !s)} aria-label="Show password">{show ? 'Hide' : 'Show'}</button>
          </div>
        </div>
        <label className="chk" style={css('margin:2px 0 18px')}><input type="checkbox" defaultChecked /><span>Keep me signed in on this device</span></label>
        <button className="btn btn-p" type="submit" disabled={busy} style={css('width:100%;padding:15px')}>{busy ? 'Signing in...' : 'Sign in'}</button>
        <Link href="/" className="btn btn-o" style={css('width:100%;margin-top:10px')}>Back to the website</Link>
      </form>
    </LoginShell>
  );
}
