'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { css } from '../../../lib/style';
import { LoginShell } from '../../../components/admin/LoginShell';
import { supabase } from '../../../lib/supabaseClient';

// Invited-account sign-up. The person was invited by head office or their office manager (a row
// in account_invites). They sign up here with that exact email and a password they choose; a
// database trigger turns the invite into their real access. An uninvited sign-up gets no access.

export default function AdminSignup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setNote(null);
    if (pass.length < 8) { setError('Choose a password of at least 8 characters.'); return; }
    setBusy(true);
    try {
      const { data, error: err } = await supabase.auth.signUp({ email: email.trim(), password: pass });
      if (err) { setError(err.message); setBusy(false); return; }
      // If email confirmation is off (recommended for staff), a session is returned immediately
      // and the profile trigger has already run. Otherwise the person must confirm by email first.
      if (data.session) {
        router.replace('/admin/overview');
      } else {
        setNote('Your account was created. If sign-in does not work immediately, your email may need confirming first - ask head office.');
        setBusy(false);
      }
    } catch {
      setError('Could not create the account. Check your connection and try again.');
      setBusy(false);
    }
  }

  return (
    <LoginShell>
      <form onSubmit={onSubmit}>
        <h2 style={css('margin-bottom:6px')}>Set up your account</h2>
        <p className="muted" style={css('margin-bottom:24px;font-size:14.5px')}>
          Use the exact email address you were invited with, and choose a password. Nobody else ever sees it.
        </p>
        {error && (
          <div className="tag no" style={css('display:block;padding:12px 14px;border-radius:12px;margin-bottom:16px;font-weight:600')}>{error}</div>
        )}
        {note && (
          <div className="tag ok" style={css('display:block;padding:12px 14px;border-radius:12px;margin-bottom:16px;font-weight:600')}>{note}</div>
        )}
        <div className="fgrp">
          <label className="lb">Email address</label>
          <input className="fld" type="email" required placeholder="the email you were invited with" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="fgrp">
          <label className="lb">Choose a password</label>
          <div className="pwwrap">
            <input className="fld" type={show ? 'text' : 'password'} required autoComplete="new-password" value={pass} onChange={(e) => setPass(e.target.value)} />
            <button type="button" className="pweye" onClick={() => setShow((s) => !s)} aria-label="Show password">{show ? 'Hide' : 'Show'}</button>
          </div>
        </div>
        <button className="btn btn-p" type="submit" disabled={busy} style={css('width:100%;padding:15px')}>{busy ? 'Creating…' : 'Create my account'}</button>
        <Link href="/admin/login" className="btn btn-o" style={css('width:100%;margin-top:10px')}>I already have an account</Link>
      </form>
    </LoginShell>
  );
}
