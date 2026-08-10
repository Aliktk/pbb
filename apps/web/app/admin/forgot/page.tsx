'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { css } from '../../../lib/style';
import { LoginShell } from '../../../components/admin/LoginShell';

// Forgotten password — always proceeds to "check your email" (never reveals whether the
// address exists), matching the API's 202 behaviour (§4).
export default function AdminForgot() {
  const router = useRouter();
  return (
    <LoginShell>
      <h2 style={css('margin-bottom:6px')}>Forgotten password</h2>
      <p className="muted" style={css('margin-bottom:24px;font-size:14.5px')}>
        Type your email address. If it belongs to an account, a link to set a new password is sent to it.
        For safety we do not say whether it did.
      </p>
      <div className="fgrp"><label className="lb">Email address</label><input className="fld" type="email" placeholder="name@pashtoonkhwabloodbank.org" /></div>
      <button className="btn btn-p" style={css('width:100%;padding:15px')} onClick={() => router.push('/admin/sent')}>Send the link</button>
      <Link href="/admin/login" className="btn btn-o" style={css('width:100%;margin-top:10px')}>Back to sign in</Link>
      <div className="ahint" style={css('margin-top:22px')}>
        No email? Telephone the head office on 081-2836820. They can reset it, but they cannot see your old one.
      </div>
    </LoginShell>
  );
}
