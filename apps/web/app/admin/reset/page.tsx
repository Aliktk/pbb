'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { css } from '../../../lib/style';
import { LoginShell } from '../../../components/admin/LoginShell';
import { supabase } from '../../../lib/supabaseClient';

// Landing page for the password-reset email link. Supabase (detectSessionInUrl) turns the link
// into a temporary recovery session; the person then chooses a new password here.
export default function AdminReset() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [checked, setChecked] = useState(false);
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let alive = true;
    // ONLY a recovery link unlocks this form. A normal signed-in session must NOT be able to
    // change the password here (that belongs on the profile page). detectSessionInUrl fires
    // PASSWORD_RECOVERY when it processes the reset link's token.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (!alive) return;
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
        setChecked(true);
      }
    });
    // If no recovery event arrives shortly, treat the link as missing/expired.
    const t = setTimeout(() => { if (alive) setChecked(true); }, 1500);
    return () => {
      alive = false;
      clearTimeout(t);
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (pass.length < 8) {
      setError('Choose a password of at least 8 characters.');
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password: pass });
    if (err) {
      setError(err.message);
      setBusy(false);
      return;
    }
    setDone(true);
    setBusy(false);
    setTimeout(() => router.replace('/admin/login'), 1600);
  }

  if (done) {
    return (
      <LoginShell>
        <div className="tick">✓</div>
        <h2 style={css('margin-bottom:6px')}>Password updated</h2>
        <p className="muted" style={css('margin-bottom:24px;font-size:14.5px')}>You can now sign in with your new password. Redirecting…</p>
        <Link href="/admin/login" className="btn btn-p" style={css('width:100%')}>Go to sign in</Link>
      </LoginShell>
    );
  }

  if (checked && !ready) {
    return (
      <LoginShell>
        <h2 style={css('margin-bottom:6px')}>Reset link invalid or expired</h2>
        <p className="muted" style={css('margin-bottom:24px;font-size:14.5px')}>
          This password-reset link is no longer valid. Request a new one and use it promptly.
        </p>
        <Link href="/admin/forgot" className="btn btn-p" style={css('width:100%')}>Request a new link</Link>
        <Link href="/admin/login" className="btn btn-o" style={css('width:100%;margin-top:10px')}>Back to sign in</Link>
      </LoginShell>
    );
  }

  return (
    <LoginShell>
      <form onSubmit={onSubmit}>
        <h2 style={css('margin-bottom:6px')}>Choose a new password</h2>
        <p className="muted" style={css('margin-bottom:24px;font-size:14.5px')}>
          Set a new password for your account. Nobody else ever sees it.
        </p>
        {error && (
          <div className="tag no" style={css('display:block;padding:12px 14px;border-radius:12px;margin-bottom:16px;font-weight:600')}>{error}</div>
        )}
        <div className="fgrp">
          <label className="lb">New password</label>
          <div className="pwwrap">
            <input
              className="fld"
              type={show ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
            <button type="button" className="pweye" onClick={() => setShow((s) => !s)} aria-label="Show password">{show ? 'Hide' : 'Show'}</button>
          </div>
        </div>
        <button className="btn btn-p" type="submit" disabled={busy || !ready} style={css('width:100%;padding:15px')}>
          {busy ? 'Saving…' : ready ? 'Save new password' : 'Verifying link…'}
        </button>
        <Link href="/admin/login" className="btn btn-o" style={css('width:100%;margin-top:10px')}>Back to sign in</Link>
      </form>
    </LoginShell>
  );
}
