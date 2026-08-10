'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { css } from '../../../lib/style';
import { LoginShell } from '../../../components/admin/LoginShell';

const DEMO: [string, string][] = [
  ['admin@pashtoonkhwabloodbank.org', 'Head office · Sees all fourteen towns'],
  ['zhob@pashtoonkhwabloodbank.org', 'Zhob branch manager · Sees Zhob only'],
  ['pishin@pashtoonkhwabloodbank.org', 'Data entry, Pishin · Adds and edits donors'],
];

// Admin sign-in. Design phase: any demo account signs in to the overview. Real auth
// (email+password, argon2, JWT, TOTP) is T1.
export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);

  return (
    <LoginShell>
      <h2 style={css('margin-bottom:6px')}>Sign in</h2>
      <p className="muted" style={css('margin-bottom:24px;font-size:14.5px')}>
        Use the email address your office was given. Your town and what you can do are already set on your account.
      </p>
      <div className="fgrp">
        <label className="lb">Email address</label>
        <input className="fld" type="email" placeholder="name@pashtoonkhwabloodbank.org" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="fgrp">
        <div className="row" style={css('justify-content:space-between;align-items:baseline')}>
          <label className="lb">Password</label>
          <Link href="/admin/forgot" className="minilink">Forgotten it?</Link>
        </div>
        <div className="pwwrap">
          <input className="fld" type={show ? 'text' : 'password'} autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} />
          <button type="button" className="pweye" onClick={() => setShow((s) => !s)} aria-label="Show password">{show ? 'Hide' : 'Show'}</button>
        </div>
      </div>
      <label className="chk" style={css('margin:2px 0 18px')}><input type="checkbox" defaultChecked /><span>Keep me signed in on this device</span></label>
      <button className="btn btn-p" style={css('width:100%;padding:15px')} onClick={() => router.push('/admin/overview')}>Sign in</button>
      <Link href="/" className="btn btn-o" style={css('width:100%;margin-top:10px')}>Back to the website</Link>
      <div className="demobox">
        <div className="qlab" style={css('margin-bottom:8px')}>For this demonstration</div>
        <p className="sm" style={css('margin-bottom:12px')}>
          Real accounts are created by the head office. Tap one to fill the form - each lands in a different
          part of the panel, because the account decides that, not the person signing in.
        </p>
        {DEMO.map(([e, desc]) => (
          <button type="button" key={e} className="demorow" onClick={() => { setEmail(e); setPass('demo1234'); }}>
            <b>{e}</b><span>{desc}</span>
          </button>
        ))}
      </div>
    </LoginShell>
  );
}
