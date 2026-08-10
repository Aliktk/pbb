'use client';

import { useState, type FormEvent } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { TOWNS } from '../../../lib/nav';
import { showToast } from '../../../lib/toast';

// Accounts & hierarchy, ported from pbb-admin4.js (PAGES['admin/accounts']). The register is
// created top-down: every account is made by a named person above it, and can only be given a
// role at or below the creator's own — that is what stops accounts nobody remembers making.
// Rendered as head office (ROLE='head', SCOPE=null); real RBAC is enforced server-side (T1).

type AccountStatus = 'active' | 'invited' | 'suspended';

interface Account {
  n: string; r: string; t: string; e: string; ph: string;
  st: AccountStatus; by: string; last: string; tfa: 0 | 1;
}

const ACCOUNTS: Account[] = [
  { n: 'Olus Yar', r: 'Olus Yar', t: 'All towns', e: 'organizer@pbb.org', ph: '0300-3815590', st: 'active', by: '—', last: 'now', tfa: 1 },
  { n: 'Dr. Hamid Khan Achakzai', r: 'Executive', t: 'All towns', e: 'committee@pbb.org', ph: '—', st: 'active', by: 'Olus Yar', last: '2 hours ago', tfa: 1 },
  { n: 'Mr. Faqir Khushal Khan Kasi', r: 'Executive', t: 'All towns', e: 'faqir@pbb.org', ph: '—', st: 'active', by: 'Olus Yar', last: 'yesterday', tfa: 0 },
  { n: 'Dr. Naseer Muhammad', r: 'Verifier', t: 'All towns', e: 'lab@pbb.org', ph: '—', st: 'active', by: 'Olus Yar', last: '3 hours ago', tfa: 1 },
  { n: 'Zhob coordinator', r: 'Branch manager', t: 'Zhob', e: 'zhob@pbb.org', ph: '0822-413902', st: 'active', by: 'Dr. Hamid Khan Achakzai', last: 'yesterday', tfa: 0 },
  { n: 'Pishin desk', r: 'Data entry', t: 'Pishin', e: 'pishin@pbb.org', ph: '0826-421288', st: 'active', by: 'Zhob coordinator', last: '3 days ago', tfa: 0 },
  { n: 'Loralai desk', r: 'Data entry', t: 'Loralai', e: 'loralai@pbb.org', ph: '0824-662066', st: 'suspended', by: 'Dr. Hamid Khan Achakzai', last: '41 days ago', tfa: 0 },
  { n: 'Chaman volunteer lead', r: 'Volunteer lead', t: 'Chaman', e: 'chaman@pbb.org', ph: '—', st: 'invited', by: 'Dr. Hamid Khan Achakzai', last: '—', tfa: 0 },
];

// Who each role may create. Nobody can create at or above their own level. (CANMAKE, head shown.)
const CANMAKE: string[] = ['Executive', 'Verifier', 'Accounts', 'Branch manager', 'Coordinator', 'Data entry', 'Volunteer lead'];

const ROLEDESC: Record<string, string> = {
  Executive: 'All towns. Publishes the website.',
  Verifier: 'Approves records. Sees no telephone numbers.',
  Accounts: 'Money and receipts only.',
  'Branch manager': 'One town, and the people in it.',
  Coordinator: 'Answers requests, calls donors.',
  'Data entry': 'Adds donors and donations.',
  'Volunteer lead': 'Volunteers and camps.',
};

// head-office-only in production
const HEAD_WHO = 'Head office';

function statusTag(st: AccountStatus) {
  if (st === 'active') return <span className="tag ok">Active</span>;
  if (st === 'invited') return <span className="tag no">Invited</span>;
  return <span className="tag wt">Suspended</span>;
}

function statusSheetTag(st: AccountStatus) {
  if (st === 'active') return <span className="tag ok">Active</span>;
  if (st === 'invited') return <span className="tag no">Invited — has not signed in yet</span>;
  return <span className="tag wt">Suspended</span>;
}

export default function AdminAccounts() {
  // Rendered as head office: whole register visible, no town scope.
  const list = ACCOUNTS;
  const pend = list.filter((a) => a.st === 'invited');

  const [open, setOpen] = useState<Account | null>(null);
  const [creating, setCreating] = useState(false);
  const [sent, setSent] = useState<{ name: string; role: string } | null>(null);

  const actions = (
    <>
      <span style={css('margin-left:auto')} />
      {CANMAKE.length ? (
        <button className="btn btn-p btn-s" onClick={() => { setSent(null); setCreating(true); }}>+ Create an account</button>
      ) : (
        <span className="sm">Your role cannot create accounts</span>
      )}
    </>
  );

  return (
    <AdminShell view="accounts" title="Accounts" subtitle={`${list.length} ${list.length === 1 ? 'person' : 'people'}`} actions={actions}>
      {pend.length ? (
        <div className="alert">
          <div><b>{pend.length} {pend.length === 1 ? 'invitation has' : 'invitations have'} not been accepted yet.</b> The link expires after seven days, then the account is deleted on its own.</div>
          <button type="button" className="btn btn-w btn-s" onClick={() => showToast('Resending the invitation wires to the API')}>Send it again</button>
        </div>
      ) : null}

      <div className="akpi">
        <div className="c"><div className="l">Active accounts</div><div className="n">{list.filter((a) => a.st === 'active').length}</div></div>
        <div className="c"><div className="l">Invited, not yet accepted</div><div className="n r">{pend.length}</div></div>
        <div className="c"><div className="l">Suspended</div><div className="n">{list.filter((a) => a.st === 'suspended').length}</div></div>
        <div className="c"><div className="l">With two-step sign in</div><div className="n">{list.filter((a) => a.tfa).length} of {list.length}</div></div>
      </div>

      <div className="acard" style={css('margin-bottom:18px')}>
        <h3 style={css('margin-bottom:6px')}>Who answers to whom</h3>
        <p className="sm" style={css('margin-bottom:20px')}>An account can only be created by somebody above it, and can only be given a role at or below their own. That is what stops the register quietly growing accounts nobody remembers making.</p>
        <div className="tree">
          <div className="tnode t1"><div className="tbox"><b>Olus Yar</b><span>Head of the organisation · all fourteen towns</span><i>Creates and removes anybody. The only role that can delete a record or export the register.</i></div></div>
          <div className="tkids">
            <div className="tnode t2"><div className="tbox"><b>Executive</b><span>2 members of the organising committee</span><i>All towns. Publishes the website. Creates branch managers.</i></div>
              <div className="tkids">
                <div className="tnode t3"><div className="tbox"><b>Branch manager</b><span>6 towns</span><i>One town. Creates data entry and coordinator accounts for that town only.</i></div>
                  <div className="tkids">
                    <div className="tnode t4"><div className="tbox"><b>Coordinator</b><span>Answers requests, calls donors</span></div></div>
                    <div className="tnode t4"><div className="tbox"><b>Data entry</b><span>Adds donors and donations</span></div></div>
                    <div className="tnode t4"><div className="tbox"><b>Volunteer lead</b><span>Volunteers and camps</span></div></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="tnode t2"><div className="tbox"><b>Verifier</b><span>Laboratory · Dr. Naseer Muhammad</span><i>Approves donor records across every town. Sees no telephone numbers.</i></div></div>
            <div className="tnode t2"><div className="tbox"><b>Accounts</b><span>Money and receipts only</span></div></div>
          </div>
        </div>
      </div>

      <div className="atbl">
        <table>
          <thead><tr><th>Person</th><th>Role</th><th>Town</th><th>Created by</th><th>Two-step</th><th>Status</th></tr></thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.e} onClick={() => setOpen(a)}>
                <td className="m2"><div className="nm">{a.n}</div><div className="sm">{a.r} · {a.t} · {a.e}</div></td>
                <td className="m1">{a.r}</td>
                <td>{a.t}</td>
                <td className="sm">{a.by}</td>
                <td>{a.tfa ? <span className="tag ok">On</span> : <span className="tag gy">Off</span>}</td>
                <td className="m3">{statusTag(a.st)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="ahint">There is no way to sign up for an account. Every one on this list was created by a named person above it, and that name cannot be edited afterwards. If somebody asks for access, the person above them creates it — or nobody does.</p>

      <AccountSheet account={open} onClose={() => setOpen(null)} />
      <CreateAccountSheet
        open={creating}
        sent={sent}
        onClose={() => { setCreating(false); setSent(null); }}
        onCreated={(name, role) => setSent({ name, role })}
        onAnother={() => setSent(null)}
      />
    </AdminShell>
  );
}

function AccountSheet({ account: a, onClose }: { account: Account | null; onClose: () => void }) {
  const isOpen = a !== null;
  const rows: [string, string][] = a
    ? [['Email', a.e], ['Telephone', a.ph], ['Role', a.r], ['Sees', a.t], ['Account created by', a.by], ['Last signed in', a.last], ['Two-step sign in', a.tfa ? 'On' : 'Off']]
    : [];
  return (
    <>
      <div className={`sheetov${isOpen ? ' on' : ''}`} onClick={onClose} />
      <div className={`sheet${isOpen ? ' open' : ''}`}>
        {a && (
          <>
            <button className="cl" onClick={onClose}>✕</button>
            {statusSheetTag(a.st)}
            <h2 style={css('margin:12px 0 4px')}>{a.n}</h2>
            <div className="sm">{a.r} · {a.t}</div>
            <div style={css('margin:22px 0')}>
              {rows.map(([k, v]) => <div className="drow" key={k}><span>{k}</span><b>{v}</b></div>)}
            </div>
            {a.st === 'invited' ? (
              <div className="row" style={css('gap:9px')}>
                <button type="button" className="btn btn-p" style={css('flex:1')} onClick={() => showToast('Resending the invitation wires to the API')}>Send the invitation again</button>
                <button type="button" className="btn btn-o" onClick={() => showToast('Cancelling the invitation wires to the API')}>Cancel it</button>
              </div>
            ) : (
              <>
                <div className="row" style={css('gap:9px')}>
                  <button type="button" className="btn btn-o" style={css('flex:1')} onClick={() => showToast('Changing role or town wires to the API')}>Change role or town</button>
                  <button type="button" className="btn btn-o" onClick={() => showToast('Reset sends a one-time link — wires to the API')}>Reset password</button>
                </div>
                <button type="button" className="btn btn-o" style={css('width:100%;margin-top:10px')} onClick={() => showToast('Requiring two-step sign in wires to the API')}>Require two-step sign in</button>
                <button type="button" className="btn btn-d" style={css('width:100%;margin-top:10px')} onClick={() => showToast(a.st === 'suspended' ? 'Restoring this account wires to the API' : 'Suspending this account wires to the API')}>{a.st === 'suspended' ? 'Restore this account' : 'Suspend this account'}</button>
              </>
            )}
            <p className="ahint" style={css('margin-top:18px')}>Every change here is written to the log with the name of whoever made it.</p>
          </>
        )}
      </div>
    </>
  );
}

// Create an account — no password is ever typed here. The person receives a one-time link and
// sets their own, so the creator never knows it and never needs to. Head office may grant any role.
function CreateAccountSheet({
  open, sent, onClose, onCreated, onAnother,
}: {
  open: boolean;
  sent: { name: string; role: string } | null;
  onClose: () => void;
  onCreated: (name: string, role: string) => void;
  onAnother: () => void;
}) {
  const allowed = CANMAKE;
  const [name, setName] = useState('');
  const [role, setRole] = useState(allowed[allowed.length - 1]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onCreated(name.trim() || 'The new account', role);
  }

  const summary: [string, string][] = sent
    ? [['Created by', HEAD_WHO], ['Role', sent.role], ['Sees', 'All fourteen towns'], ['Link expires', 'in 7 days'], ['Written to the log', 'yes, permanently']]
    : [];

  return (
    <>
      <div className={`sheetov${open ? ' on' : ''}`} onClick={onClose} />
      <div className={`sheet${open ? ' open' : ''}`}>
        {open && sent && (
          <>
            <button className="cl" onClick={onClose}>✕</button>
            <div className="tick">✓</div>
            <h2 style={css('margin-bottom:6px')}>Invitation sent</h2>
            <p className="sm" style={css('margin-bottom:20px')}>{sent.name} has been created as <b>{sent.role}</b> and can do nothing until they open the link and set a password.</p>
            <div style={css('margin-bottom:20px')}>
              {summary.map(([k, v]) => <div className="drow" key={k}><span>{k}</span><b>{v}</b></div>)}
            </div>
            <button className="btn btn-p" style={css('width:100%')} onClick={onClose}>Done</button>
            <button className="btn btn-o" style={css('width:100%;margin-top:10px')} onClick={() => { setName(''); setRole(allowed[allowed.length - 1]); onAnother(); }}>Create another</button>
          </>
        )}
        {open && !sent && (
          <>
            <button className="cl" onClick={onClose}>✕</button>
            <h2 style={css('margin-bottom:4px')}>Create an account</h2>
            <p className="sm" style={css('margin-bottom:22px')}>You are creating this as <b>{HEAD_WHO}</b>. Your name is attached to it permanently.</p>
            <form onSubmit={onSubmit}>
              <div className="fgrp"><label className="lb">Their full name</label><input className="fld" required placeholder="As it should appear in the log" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="g2" style={css('gap:14px')}>
                <div className="fgrp"><label className="lb">Email address</label><input className="fld" type="email" required placeholder="name@pashtoonkhwabloodbank.org" /></div>
                <div className="fgrp"><label className="lb">Telephone</label><input className="fld" type="tel" placeholder="03XX XXXXXXX" /></div>
              </div>

              <div className="fgrp">
                <label className="lb">What they will be</label>
                <div className="pickgrid">
                  {allowed.map((r) => (
                    <button type="button" key={r} className={`pickopt${r === role ? ' on' : ''}`} onClick={() => setRole(r)}>
                      <b>{r}</b><span>{ROLEDESC[r] ?? ''}</span>
                    </button>
                  ))}
                </div>
                <div className="sm" style={css('margin-top:8px')}>You may grant any role.</div>
              </div>

              <div className="fgrp">
                <label className="lb">Which town they may see</label>
                <select className="fld">
                  {['All fourteen towns', ...TOWNS].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div className="acard" style={css('padding:14px 16px;background:var(--bg);margin-bottom:18px')}>
                <label className="togrow" style={css('border:0;padding:6px 0')}><span>Require two-step sign in</span><input type="checkbox" defaultChecked /><i /></label>
                <label className="togrow" style={css('padding:6px 0')}><span>May see donors&apos; telephone numbers</span><input type="checkbox" defaultChecked /><i /></label>
                <label className="togrow" style={css('border:0;padding:6px 0')}><span>May export lists</span><input type="checkbox" /><i /></label>
                <p className="sm" style={css('margin-top:8px')}>These sit on top of the role. Anything not switched on here is refused even if the role would normally allow it.</p>
              </div>

              <div className="ahint" style={css('margin-bottom:16px')}>They receive a single link that works once and expires in seven days. They choose their own password — you will never see it, and if they forget it you can only reset it, never read it.</div>
              <button className="btn btn-p" style={css('width:100%;padding:15px')}>Create and send the invitation</button>
              <button type="button" className="btn btn-o" style={css('width:100%;margin-top:10px')} onClick={onClose}>Cancel</button>
            </form>
          </>
        )}
      </div>
    </>
  );
}
