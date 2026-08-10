'use client';

import Link from 'next/link';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { ALLOW, ROLES } from '../../../lib/admin';
import { showToast } from '../../../lib/toast';

// Your account, ported from pbb-admin5.js (PAGES['admin/profile']). Rendered as head office
// (ROLE='head', SCOPE=null). A password is set only by its owner - nobody else can see it,
// including the super admin; they can only reset it. Office is set by whoever created the account.

// Head-office contact detail (ROLES.head in the prototype - office/phone/email are not on the
// shared lib/admin ROLES, so the extra fields are held here alongside who/sub from the shared list).
const ME = {
  who: ROLES[0].who,
  sub: ROLES[0].sub,
  email: 'admin@pashtoonkhwabloodbank.org',
  phone: '081-2836820',
  office: 'Zainab Chamber, Shara-e-Adalat, Quetta',
};

// Screens the head office can open: ALLOW.head is null (all), so fall back to the prototype's 24.
const SCREENS = ALLOW.head?.length ?? 24;

const SESSIONS: [string, string, boolean][] = [
  ['This device', 'Quetta · now', true],
  ['Office desktop', 'Quetta · 2 days ago', false],
  ['Phone', 'Zhob · 8 days ago', false],
];

export default function AdminProfile() {
  return (
    <AdminShell view="profile" title="Your account" subtitle={ME.who}>
      <div className="g2" style={css('gap:18px;align-items:start')}>
        <div>
          <div className="acard">
            <h3 style={css('margin-bottom:18px')}>Your details</h3>
            <div className="row" style={css('gap:16px;margin-bottom:20px')}>
              <div className="avatar" aria-hidden style={css('display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--mid);font-weight:600')}>Photo</div>
              <div style={css('flex:1')}>
                <b style={css('font-size:17px')}>{ME.who}</b>
                <div className="sm">{ME.sub}</div>
                <div className="row" style={css('gap:8px;margin-top:10px')}>
                  <button type="button" className="btn btn-o btn-s" onClick={() => showToast('Changing your photo wires to the API')}>Change photo</button>
                  <button type="button" className="btn btn-o btn-s" onClick={() => showToast('Removing your photo wires to the API')}>Remove</button>
                </div>
              </div>
            </div>
            <div className="fgrp"><label className="lb">Full name</label><input className="fld" defaultValue={ME.who} /></div>
            <div className="fgrp"><label className="lb">Office</label><input className="fld" defaultValue={ME.office} disabled style={css('opacity:.65')} /><div className="sm" style={css('margin-top:6px')}>Set by whoever created your account. Ask them to move you.</div></div>
            <div className="g2" style={css('gap:14px')}>
              <div className="fgrp"><label className="lb">Telephone</label><input className="fld" type="tel" defaultValue={ME.phone} /></div>
              <div className="fgrp"><label className="lb">Email</label><input className="fld" type="email" defaultValue={ME.email} /></div>
            </div>
            <div className="fgrp"><label className="lb">Language you prefer</label><select className="fld"><option>English</option><option>اردو Urdu</option><option>پښتو Pashto</option></select></div>
            <button type="button" className="btn btn-p" style={css('width:100%')} onClick={() => showToast('Saved - wires to the API')}>Save</button>
          </div>

          <div className="acard" style={css('margin-top:18px')}>
            <h3 style={css('margin-bottom:6px')}>Password</h3>
            <p className="sm" style={css('margin-bottom:16px')}>Change it here. Nobody else can see it, including the super admin - they can only reset it.</p>
            <div className="fgrp"><label className="lb">Current password</label><input className="fld" type="password" /></div>
            <div className="g2" style={css('gap:14px')}>
              <div className="fgrp"><label className="lb">New password</label><input className="fld" type="password" /></div>
              <div className="fgrp"><label className="lb">Type it again</label><input className="fld" type="password" /></div>
            </div>
            <button type="button" className="btn btn-o" style={css('width:100%')} onClick={() => showToast('Changing your password wires to the API')}>Change password</button>
          </div>
        </div>

        <div>
          <div className="acard">
            <h3 style={css('margin-bottom:6px')}>Two-step sign in</h3>
            <p className="sm" style={css('margin-bottom:16px')}>A code sent to your phone each time you sign in from a new device. Required for anyone who can see telephone numbers.</p>
            <div className="listrow">
              <div><b>Currently</b><div className="sm">On, by SMS to {ME.phone}</div></div>
              <span className="tag ok">On</span>
            </div>
            <button type="button" className="btn btn-o" style={css('width:100%;margin-top:14px')} onClick={() => showToast('Two-step setup wires to the API')}>Turn off</button>
          </div>

          <div className="acard" style={css('margin-top:18px')}>
            <h3 style={css('margin-bottom:6px')}>What you can do here</h3>
            <p className="sm" style={css('margin-bottom:14px')}>Set by the organising committee. Ask them if you need more.</p>
            <div className="drow"><span>Role</span><b>{ME.who}</b></div>
            <div className="drow"><span>You can see</span><b>All fourteen towns</b></div>
            <div className="drow"><span>Screens you can open</span><b>{SCREENS}</b></div>
            <Link href="/admin/roles" className="btn btn-o" style={css('width:100%;margin-top:14px')}>See what each role can do</Link>
          </div>

          <div className="acard" style={css('margin-top:18px')}>
            <h3 style={css('margin-bottom:16px')}>Where you are signed in</h3>
            {SESSIONS.map(([d, w, cur]) => (
              <div className="listrow" key={d}>
                <div><b>{d}</b><div className="sm">{w}</div></div>
                {cur ? <span className="tag ok">This one</span> : <button type="button" className="btn btn-o btn-s" onClick={() => showToast('Signing out this session wires to the API')}>Sign out</button>}
              </div>
            ))}
            <button type="button" className="btn btn-d" style={css('width:100%;margin-top:14px')} onClick={() => showToast('Signing out everywhere else wires to the API')}>Sign out everywhere else</button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
