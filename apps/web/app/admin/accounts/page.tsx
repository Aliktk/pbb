'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { useAuth } from '../../../lib/auth';
import { assignableRoles, roleLabel, roleIsScoped, ROLES, ROLE_ORDER, type RoleKey } from '../../../lib/roles';
import {
  fetchStaff, fetchInvites, createInvite, deleteInvite, setAccountActive, updateAccountRoleTown,
  type StaffAccount, type AccountInvite,
} from '../../../lib/accounts';
import { fetchTowns, type Town } from '../../../lib/towns';
import { showToast } from '../../../lib/toast';

// Accounts & hierarchy - live, backed by Supabase. Row Level Security scopes the whole page:
// head office sees every office; an office manager sees only their own. The frontend adds no
// permission logic - it reads and writes, and the database (0003) decides what is allowed.

export default function AdminAccounts() {
  const { user } = useAuth();
  const myRole = (user?.role.id ?? 'viewer') as string;
  const myTownId = user?.townId ?? null;
  const isHead = myRole === 'head';
  const assignable = useMemo(() => assignableRoles(myRole), [myRole]);

  const [staff, setStaff] = useState<StaffAccount[]>([]);
  const [invites, setInvites] = useState<AccountInvite[]>([]);
  const [towns, setTowns] = useState<Town[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState<StaffAccount | null>(null);
  const [creating, setCreating] = useState(false);

  async function reload() {
    setError(null);
    try {
      const [s, i, t] = await Promise.all([fetchStaff(), fetchInvites(), fetchTowns()]);
      setStaff(s);
      setInvites(i);
      setTowns(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the register.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  const townName = (id: string | null) => (id ? towns.find((t) => t.id === id)?.name ?? id : 'All towns');

  const actions = assignable.length ? (
    <>
      <span style={css('margin-left:auto')} />
      <button className="btn btn-p btn-s" onClick={() => setCreating(true)}>+ Create an account</button>
    </>
  ) : (
    <><span style={css('margin-left:auto')} /><span className="sm">Your role cannot create accounts</span></>
  );

  const activeCount = staff.filter((a) => a.is_active).length;
  const suspended = staff.filter((a) => !a.is_active).length;

  const subtitle = isHead ? `${staff.length} people · all offices` : `${townName(myTownId)} office`;

  return (
    <AdminShell view="accounts" title="Accounts" subtitle={subtitle} actions={actions}>
      {loading ? (
        <p className="muted" style={css('padding:24px 0')}>Loading the register…</p>
      ) : error ? (
        <div className="tag no" style={css('display:block;padding:14px 16px;border-radius:12px')}>{error}</div>
      ) : (
        <>
          {invites.length ? (
            <div className="alert">
              <div><b>{invites.length} {invites.length === 1 ? 'invitation has' : 'invitations have'} not been accepted yet.</b> The person becomes active the moment they sign up with their invited email and choose a password.</div>
            </div>
          ) : null}

          <div className="akpi">
            <div className="c"><div className="l">Active accounts</div><div className="n">{activeCount}</div></div>
            <div className="c"><div className="l">Invited, not yet accepted</div><div className="n r">{invites.length}</div></div>
            <div className="c"><div className="l">Suspended</div><div className="n">{suspended}</div></div>
            <div className="c"><div className="l">{isHead ? 'Offices in view' : 'Your office'}</div><div className="n">{isHead ? '14' : '1'}</div></div>
          </div>

          {/* Role separation - generated from the one role model, so UI and database never drift. */}
          <div className="acard" style={css('margin-bottom:18px')}>
            <h3 style={css('margin-bottom:6px')}>Roles, and who may create them</h3>
            <p className="sm" style={css('margin-bottom:18px')}>An account is only ever created by someone above it. Head office runs the whole organisation; an office manager runs one office and creates that office&apos;s staff. Nobody can sign themselves up into access.</p>
            <div style={css('display:grid;gap:8px')}>
              {ROLE_ORDER.map((k) => (
                <div key={k} className="drow" style={css('align-items:flex-start')}>
                  <span style={css('min-width:150px')}><b>{ROLES[k].label}</b><br /><span className="sm">{ROLES[k].scoped ? 'One office' : 'All offices'}</span></span>
                  <span className="sm" style={css('text-align:left;flex:1')}>{ROLES[k].description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending invitations */}
          {invites.length ? (
            <div className="atbl" style={css('margin-bottom:18px')}>
              <h3 style={css('margin:2px 0 10px')}>Waiting to sign up</h3>
              <table>
                <thead><tr><th>Person</th><th>Role</th><th>Office</th><th /></tr></thead>
                <tbody>
                  {invites.map((i) => (
                    <tr key={i.email}>
                      <td className="m2"><div className="nm">{i.name || i.email}</div><div className="sm">{i.email}</div></td>
                      <td>{roleLabel(i.role_key)}</td>
                      <td>{townName(i.town_id)}</td>
                      <td className="m3"><button type="button" className="btn btn-o btn-s" onClick={async () => { await deleteInvite(i.email); showToast('Invitation cancelled'); reload(); }}>Cancel</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {/* The register */}
          <div className="atbl">
            <table>
              <thead><tr><th>Person</th><th>Role</th><th>Office</th><th>Status</th></tr></thead>
              <tbody>
                {staff.map((a) => (
                  <tr key={a.id} onClick={() => setOpen(a)} style={css('cursor:pointer')}>
                    <td className="m2"><div className="nm">{a.name}</div><div className="sm">{a.email} · {roleLabel(a.role_key)} · {townName(a.town_id)}</div></td>
                    <td className="m1">{roleLabel(a.role_key)}</td>
                    <td>{townName(a.town_id)}</td>
                    <td className="m3">{a.is_active ? <span className="tag ok">Active</span> : <span className="tag wt">Suspended</span>}</td>
                  </tr>
                ))}
                {staff.length === 0 ? <tr><td colSpan={4} className="muted" style={css('padding:18px')}>No accounts yet.</td></tr> : null}
              </tbody>
            </table>
          </div>

          <p className="ahint">There is no public sign-up into access. Every account here was invited by a named person above it, and access is granted by the database only when the invited email signs up.</p>
        </>
      )}

      <AccountSheet
        account={open}
        towns={towns}
        canManage={assignable.length > 0}
        assignable={assignable}
        townName={townName}
        onClose={() => setOpen(null)}
        onChanged={() => { setOpen(null); reload(); }}
      />
      <CreateAccountSheet
        open={creating}
        isHead={isHead}
        myTownId={myTownId}
        towns={towns}
        assignable={assignable}
        onClose={() => setCreating(false)}
        onCreated={() => { setCreating(false); reload(); }}
      />
    </AdminShell>
  );
}

// ─────────────────────────── View / manage one account ────────────────────
function AccountSheet({
  account: a, towns, canManage, assignable, townName, onClose, onChanged,
}: {
  account: StaffAccount | null;
  towns: Town[];
  canManage: boolean;
  assignable: RoleKey[];
  townName: (id: string | null) => string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const isOpen = a !== null;
  const [role, setRole] = useState<RoleKey>('viewer');
  const [townId, setTownId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (a) { setRole(a.role_key); setTownId(a.town_id); }
  }, [a]);

  async function saveRoleTown() {
    if (!a) return;
    setBusy(true);
    try {
      await updateAccountRoleTown(a.id, role, roleIsScoped(role) ? townId : null);
      showToast('Role and office updated');
      onChanged();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not update');
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive() {
    if (!a) return;
    setBusy(true);
    try {
      await setAccountActive(a.id, !a.is_active);
      showToast(a.is_active ? 'Account suspended' : 'Account restored');
      onChanged();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not update');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className={`sheetov${isOpen ? ' on' : ''}`} onClick={onClose} />
      <div className={`sheet${isOpen ? ' open' : ''}`}>
        {a && (
          <>
            <button className="cl" onClick={onClose}>✕</button>
            {a.is_active ? <span className="tag ok">Active</span> : <span className="tag wt">Suspended</span>}
            <h2 style={css('margin:12px 0 4px')}>{a.name}</h2>
            <div className="sm">{roleLabel(a.role_key)} · {townName(a.town_id)}</div>
            <div style={css('margin:22px 0')}>
              <div className="drow"><span>Email</span><b>{a.email || '-'}</b></div>
              <div className="drow"><span>Role</span><b>{roleLabel(a.role_key)}</b></div>
              <div className="drow"><span>Office</span><b>{townName(a.town_id)}</b></div>
            </div>

            {canManage ? (
              <>
                <div className="fgrp">
                  <label className="lb">Change role</label>
                  <select className="fld" value={role} onChange={(e) => setRole(e.target.value as RoleKey)}>
                    {assignable.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
                  </select>
                </div>
                {roleIsScoped(role) ? (
                  <div className="fgrp">
                    <label className="lb">Office</label>
                    <select className="fld" value={townId ?? ''} onChange={(e) => setTownId(e.target.value || null)}>
                      <option value="">Select an office</option>
                      {towns.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                ) : null}
                <button type="button" className="btn btn-p" style={css('width:100%')} disabled={busy} onClick={saveRoleTown}>Save role &amp; office</button>
                <button type="button" className="btn btn-d" style={css('width:100%;margin-top:10px')} disabled={busy} onClick={toggleActive}>{a.is_active ? 'Suspend this account' : 'Restore this account'}</button>
              </>
            ) : (
              <p className="ahint">Your role can view accounts but not change them.</p>
            )}
            <p className="ahint" style={css('margin-top:18px')}>Every change is enforced by the database, and only within the offices you are allowed to manage.</p>
          </>
        )}
      </div>
    </>
  );
}

// ─────────────────────────── Create an account (invite) ───────────────────
function CreateAccountSheet({
  open, isHead, myTownId, towns, assignable, onClose, onCreated,
}: {
  open: boolean;
  isHead: boolean;
  myTownId: string | null;
  towns: Town[];
  assignable: RoleKey[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<RoleKey>(assignable[assignable.length - 1] ?? 'viewer');
  const [townId, setTownId] = useState<string | null>(isHead ? null : myTownId);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) { setName(''); setEmail(''); setRole(assignable[assignable.length - 1] ?? 'viewer'); setTownId(isHead ? null : myTownId); setDone(false); }
  }, [open]);

  const scoped = roleIsScoped(role);
  // A manager always creates within their own office; head may choose (or all offices for org-wide roles).
  const effectiveTown = isHead ? (scoped ? townId : null) : myTownId;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (scoped && !effectiveTown) { showToast('Choose an office for this role'); return; }
    setBusy(true);
    try {
      await createInvite({ email, name, role_key: role, town_id: scoped ? effectiveTown : null });
      setDone(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not create the invitation');
    } finally {
      setBusy(false);
    }
  }

  const signupUrl = typeof window !== 'undefined' ? `${window.location.origin}/admin/signup` : '/admin/signup';

  return (
    <>
      <div className={`sheetov${open ? ' on' : ''}`} onClick={onClose} />
      <div className={`sheet${open ? ' open' : ''}`}>
        {open && done && (
          <>
            <button className="cl" onClick={onClose}>✕</button>
            <div className="tick">✓</div>
            <h2 style={css('margin-bottom:6px')}>Invitation created</h2>
            <p className="sm" style={css('margin-bottom:18px')}><b>{name || email}</b> can now sign up as <b>{roleLabel(role)}</b>. Send them this link and their email address - they choose their own password, which you never see.</p>
            <div className="fgrp"><label className="lb">Sign-up link to share</label><input className="fld" readOnly value={signupUrl} onFocus={(e) => e.target.select()} /></div>
            <button className="btn btn-p" style={css('width:100%')} onClick={onCreated}>Done</button>
            <button className="btn btn-o" style={css('width:100%;margin-top:10px')} onClick={() => setDone(false)}>Create another</button>
          </>
        )}
        {open && !done && (
          <>
            <button className="cl" onClick={onClose}>✕</button>
            <h2 style={css('margin-bottom:4px')}>Create an account</h2>
            <p className="sm" style={css('margin-bottom:22px')}>{isHead ? 'You are head office - you may create any role for any office.' : 'You are an office manager - you may create staff for your own office.'}</p>
            <form onSubmit={onSubmit}>
              <div className="fgrp"><label className="lb">Their full name</label><input className="fld" required placeholder="As it should appear in the register" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="fgrp"><label className="lb">Email address</label><input className="fld" type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>

              <div className="fgrp">
                <label className="lb">Role</label>
                <div className="pickgrid">
                  {assignable.map((r) => (
                    <button type="button" key={r} className={`pickopt${r === role ? ' on' : ''}`} onClick={() => setRole(r)}>
                      <b>{roleLabel(r)}</b><span>{ROLES[r].description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {scoped ? (
                <div className="fgrp">
                  <label className="lb">Office</label>
                  {isHead ? (
                    <select className="fld" value={townId ?? ''} onChange={(e) => setTownId(e.target.value || null)} required>
                      <option value="">Select an office</option>
                      {towns.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  ) : (
                    <input className="fld" readOnly value={towns.find((t) => t.id === myTownId)?.name ?? 'Your office'} />
                  )}
                </div>
              ) : (
                <p className="sm" style={css('margin-bottom:16px')}>This role works across all offices.</p>
              )}

              <div className="ahint" style={css('margin-bottom:16px')}>The person becomes active only when they sign up with this exact email. Until then nothing changes, and an uninvited sign-up is given no access at all.</div>
              <button className="btn btn-p" style={css('width:100%;padding:15px')} disabled={busy}>{busy ? 'Creating…' : 'Create the invitation'}</button>
              <button type="button" className="btn btn-o" style={css('width:100%;margin-top:10px')} onClick={onClose}>Cancel</button>
            </form>
          </>
        )}
      </div>
    </>
  );
}
