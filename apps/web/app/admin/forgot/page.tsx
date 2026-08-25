'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { css } from '../../../lib/style';
import { LoginShell } from '../../../components/admin/LoginShell';
import { sendPasswordReset } from '../../../lib/accounts';

// Forgotten password. We always show "check your email" and never reveal whether the address
// exists (enumeration-safe). Requires the project's SMTP + /admin/reset in the Auth redirect
// allow-list for the email to actually arrive.
export default function AdminForgot() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      await sendPasswordReset(email);
    } catch {
      // Deliberately ignored: never reveal whether the address exists.
    } finally {
      setSent(true);
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <LoginShell>
        <div className="tick">✓</div>
        <h2 style={css('margin-bottom:6px')}>Check your email</h2>
        <p className="muted" style={css('margin-bottom:24px;font-size:14.5px')}>
          If <b>{email}</b> belongs to an account, a link to set a new password has been sent to it.
          The link opens a page here where you choose your new password.
        </p>
        <Link href="/admin/login" className="btn btn-p" style={css('width:100%')}>Back to sign in</Link>
      </LoginShell>
    );
  }

  return (
    <LoginShell>
      <form onSubmit={onSubmit}>
        <h2 style={css('margin-bottom:6px')}>Forgotten password</h2>
        <p className="muted" style={css('margin-bottom:24px;font-size:14.5px')}>
          Type your email address. If it belongs to an account, a link to set a new password is sent to it.
          For safety we do not say whether it did.
        </p>
        <div className="fgrp">
          <label className="lb">Email address</label>
          <input
            className="fld"
            type="email"
            required
            placeholder="name@pashtoonkhwabloodbank.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button className="btn btn-p" type="submit" disabled={busy} style={css('width:100%;padding:15px')}>
          {busy ? 'Sending…' : 'Send the link'}
        </button>
        <Link href="/admin/login" className="btn btn-o" style={css('width:100%;margin-top:10px')}>Back to sign in</Link>
        <div className="ahint" style={css('margin-top:22px')}>
          No email? Telephone the head office on 081-2836820. They can reset it, but they cannot see your old one.
        </div>
      </form>
    </LoginShell>
  );
}
