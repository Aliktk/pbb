'use client';

import { useState, useEffect, FormEvent } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { TOWNS } from '../../../lib/nav';
import { showToast } from '../../../lib/toast';
import { Icon } from '../../../components/Icon';
import { CustomSelect } from '../../../components/CustomSelect';
import { getTownNamesList } from '../../../lib/towns';

type AccountStatus = 'active' | 'invited' | 'suspended';

interface Account {
  id: string;
  n: string;
  r: string;
  t: string;
  e: string;
  ph: string;
  st: AccountStatus;
  by: string;
  last: string;
  tfa: 0 | 1;
}

const INITIAL_ACCOUNTS: Account[] = [
  { id: 'acc-1', n: 'Olus Yar', r: 'Olus Yar', t: 'All towns', e: 'organizer@pbb.org', ph: '0300-3815590', st: 'active', by: 'System Founding Protocol', last: 'Just now', tfa: 1 },
  { id: 'acc-2', n: 'Dr. Hamid Khan Achakzai', r: 'Executive', t: 'All towns', e: 'committee@pbb.org', ph: '0300-1234567', st: 'active', by: 'Olus Yar', last: '2 hours ago', tfa: 1 },
  { id: 'acc-3', n: 'Mr. Faqir Khushal Khan Kasi', r: 'Executive', t: 'All towns', e: 'faqir@pbb.org', ph: '0333-7890123', st: 'active', by: 'Olus Yar', last: 'Yesterday', tfa: 0 },
  { id: 'acc-4', n: 'Dr. Naseer Muhammad', r: 'Verifier', t: 'All towns', e: 'lab@pbb.org', ph: '0312-4567890', st: 'active', by: 'Olus Yar', last: '3 hours ago', tfa: 1 },
  { id: 'acc-5', n: 'Zhob Branch Manager', r: 'Branch manager', t: 'Zhob', e: 'zhob@pbb.org', ph: '0822-413902', st: 'active', by: 'Dr. Hamid Khan Achakzai', last: 'Yesterday', tfa: 0 },
  { id: 'acc-6', n: 'Pishin Data Entry', r: 'Data entry', t: 'Pishin', e: 'pishin@pbb.org', ph: '0826-421288', st: 'active', by: 'Zhob Branch Manager', last: '3 days ago', tfa: 0 },
  { id: 'acc-7', n: 'Loralai Desk Officer', r: 'Data entry', t: 'Loralai', e: 'loralai@pbb.org', ph: '0824-662066', st: 'suspended', by: 'Dr. Hamid Khan Achakzai', last: '41 days ago', tfa: 0 },
  { id: 'acc-8', n: 'Chaman Volunteer Lead', r: 'Volunteer lead', t: 'Chaman', e: 'chaman@pbb.org', ph: '0345-9988776', st: 'invited', by: 'Dr. Hamid Khan Achakzai', last: '-', tfa: 0 },
];

const CANMAKE: string[] = ['Executive', 'Verifier', 'Accounts', 'Branch manager', 'Coordinator', 'Data entry', 'Volunteer lead'];

const ROLEDESC: Record<string, string> = {
  Executive: 'All towns scope. Publishes website, approves branch managers.',
  Verifier: 'Approves donor records across all towns. Phone numbers redacted.',
  Accounts: 'Financial accounting, receipts and audit logs.',
  'Branch manager': 'Single town jurisdiction. Manages local coordinators.',
  Coordinator: 'Answers emergency requests, dispatches donor calls.',
  'Data entry': 'Adds donor records, registers blood donations.',
  'Volunteer lead': 'Manages camp volunteers and awareness drives.',
};

const HEAD_WHO = 'Olus Yar (Head of Organisation)';

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pbb_accounts_list');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_ACCOUNTS;
  });

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [townFilter, setTownFilter] = useState('All');
  const [openAccount, setOpenAccount] = useState<Account | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [sentAccount, setSentAccount] = useState<{ name: string; role: string; town: string } | null>(null);

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem('pbb_accounts_list', JSON.stringify(accounts));
    } catch {}
  }, [accounts]);

  // Actions
  function handleToggleSuspend(accId: string) {
    setAccounts((cur) =>
      cur.map((a) => {
        if (a.id === accId) {
          const nextSt: AccountStatus = a.st === 'suspended' ? 'active' : 'suspended';
          showToast(`Account "${a.n}" is now ${nextSt.toUpperCase()}.`);
          return { ...a, st: nextSt };
        }
        return a;
      })
    );
    if (openAccount?.id === accId) {
      setOpenAccount((prev) => prev ? { ...prev, st: prev.st === 'suspended' ? 'active' : 'suspended' } : null);
    }
  }

  function handleToggle2FA(accId: string) {
    setAccounts((cur) =>
      cur.map((a) => {
        if (a.id === accId) {
          const nextTfa: 0 | 1 = a.tfa === 1 ? 0 : 1;
          showToast(`Two-step verification for "${a.n}" turned ${nextTfa ? 'ON' : 'OFF'}.`);
          return { ...a, tfa: nextTfa };
        }
        return a;
      })
    );
    if (openAccount?.id === accId) {
      setOpenAccount((prev) => prev ? { ...prev, tfa: prev.tfa === 1 ? 0 : 1 } : null);
    }
  }

  function handleResendInvite(name: string) {
    showToast(`Re-sent invitation email & SMS link to "${name}".`);
  }

  function handleCreateAccountSuccess(newAcc: Account) {
    setAccounts((cur) => [newAcc, ...cur]);
    setSentAccount({ name: newAcc.n, role: newAcc.r, town: newAcc.t });
    showToast(`Account invitation created for ${newAcc.n}!`);
  }

  // Filtered accounts
  const filteredAccounts = accounts.filter((a) => {
    const matchesSearch =
      a.n.toLowerCase().includes(search.toLowerCase()) ||
      a.e.toLowerCase().includes(search.toLowerCase()) ||
      a.ph.includes(search);
    const matchesRole = roleFilter === 'All' || a.r === roleFilter;
    const matchesTown = townFilter === 'All' || a.t === townFilter;
    return matchesSearch && matchesRole && matchesTown;
  });

  const activeCount = accounts.filter((a) => a.st === 'active').length;
  const pendingCount = accounts.filter((a) => a.st === 'invited').length;
  const suspendedCount = accounts.filter((a) => a.st === 'suspended').length;
  const tfaCount = accounts.filter((a) => a.tfa === 1).length;

  const actions = (
    <button
      type="button"
      className="btn btn-p btn-s"
      onClick={() => { setSentAccount(null); setIsCreating(true); }}
      style={{ borderRadius: '12px', padding: '9px 18px', fontSize: '13px', fontWeight: 800 }}
    >
      + Create Account
    </button>
  );

  return (
    <AdminShell
      view="accounts"
      title="Accounts &amp; Hierarchy Governance"
      subtitle={`${accounts.length} Administrative Personnel Across 14 Town Branches`}
      actions={actions}
    >
      {/* PENDING INVITATIONS BANNER */}
      {pendingCount > 0 && (
        <div
          className="acard"
          style={{
            borderRadius: '18px',
            padding: '16px 20px',
            marginBottom: '20px',
            background: 'rgba(234, 179, 8, 0.12)',
            border: '1px solid rgba(234, 179, 8, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>⏳</span>
            <div>
              <b style={{ fontSize: '14px', color: 'var(--txt1)' }}>
                {pendingCount} {pendingCount === 1 ? 'Account Invitation Pending' : 'Account Invitations Pending'}
              </b>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--txt2)' }}>
                One-time activation links expire after 7 days. Once activated, officers set their own encrypted passwords.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-o btn-s"
            onClick={() => showToast('Resent invitation notifications to all pending accounts.')}
            style={{ borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}
          >
            Resend All Pending Links
          </button>
        </div>
      )}

      {/* OVERVIEW KPI MATRIX */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        <div className="acard" style={{ borderRadius: '18px', padding: '18px', background: 'var(--surf)', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--txt2)', textTransform: 'uppercase' }}>Active Personnel</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#22C55E', margin: '4px 0 2px 0' }}>{activeCount}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--txt2)' }}>Authorized &amp; operational</div>
        </div>

        <div className="acard" style={{ borderRadius: '18px', padding: '18px', background: 'var(--surf)', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--txt2)', textTransform: 'uppercase' }}>Invited Pending</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#EAB308', margin: '4px 0 2px 0' }}>{pendingCount}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--txt2)' }}>Awaiting password setup</div>
        </div>

        <div className="acard" style={{ borderRadius: '18px', padding: '18px', background: 'var(--surf)', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--txt2)', textTransform: 'uppercase' }}>Suspended Accounts</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--p)', margin: '4px 0 2px 0' }}>{suspendedCount}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--txt2)' }}>Access revoked</div>
        </div>

        <div className="acard" style={{ borderRadius: '18px', padding: '18px', background: 'var(--surf)', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--txt2)', textTransform: 'uppercase' }}>2FA Privacy Protection</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#3B82F6', margin: '4px 0 2px 0' }}>{tfaCount} / {accounts.length}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--txt2)' }}>SMS verification shield</div>
        </div>
      </div>

      {/* VISUAL HIERARCHY TREE CARD - WHO ANSWERS TO WHOM */}
      <div
        className="acard"
        style={{
          borderRadius: '24px',
          padding: '28px',
          marginBottom: '26px',
          background: 'var(--surf)',
          border: '1px solid var(--line)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(217, 35, 35, 0.12)',
              color: 'var(--p)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              flexShrink: 0,
            }}
          >
            👑
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: 'var(--txt1)' }}>
              Top-Down Administrative Lineage &amp; Hierarchy
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--txt2)', lineHeight: 1.5 }}>
              Strict creation chain: Every account is appointed by an authorized superior. Nobody can grant roles at or above their own level.
            </p>
          </div>
        </div>

        {/* HIERARCHY TREE CARDS GRID */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* LEVEL 1: APEX HEAD OF ORGANISATION */}
          <div
            style={{
              padding: '20px 24px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(217, 35, 35, 0.12) 0%, var(--surf) 100%)',
              border: '1px solid rgba(217, 35, 35, 0.35)',
              boxShadow: '0 8px 25px rgba(217, 35, 35, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'var(--p)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 900,
                  boxShadow: '0 4px 14px rgba(217, 35, 35, 0.3)',
                }}
              >
                👑
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <b style={{ fontSize: '16.5px', color: 'var(--txt1)', fontWeight: 900 }}>Olus Yar</b>
                  <span className="tag ok" style={{ fontSize: '11px', fontWeight: 800 }}>Apex Administrator</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--txt2)', marginTop: '2px' }}>
                  Head of the Organisation · All 14 Town Branches Jurisdiction
                </div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--txt2)', maxWidth: '420px', lineHeight: 1.45, fontStyle: 'italic' }}>
              Appoints Executive Committee &amp; Lab Verifiers. Deletes records and manages full system security dispatches.
            </div>
          </div>

          {/* LEVEL 2: EXECUTIVE & VERIFIER TIER */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px', paddingLeft: '20px', borderLeft: '2px dashed rgba(217, 35, 35, 0.3)' }}>
            {/* EXECUTIVE COMMITTEE */}
            <div
              style={{
                padding: '18px',
                borderRadius: '18px',
                background: 'var(--surf)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '18px' }}>🏛️</span>
                <b style={{ fontSize: '15px', color: 'var(--txt1)' }}>Executive Committee</b>
                <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '99px', background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', marginLeft: 'auto' }}>
                  2 Officers
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--txt2)', lineHeight: 1.5 }}>
                Dr. Hamid Khan Achakzai &amp; Faqir Khushal Khan Kasi. Manages branch managers and publishes public site content.
              </p>
            </div>

            {/* VERIFIER & LAB DESK */}
            <div
              style={{
                padding: '18px',
                borderRadius: '18px',
                background: 'var(--surf)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '18px' }}>🧪</span>
                <b style={{ fontSize: '15px', color: 'var(--txt1)' }}>Medical Verifier</b>
                <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '99px', background: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', marginLeft: 'auto' }}>
                  Laboratory Desk
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--txt2)', lineHeight: 1.5 }}>
                Dr. Naseer Muhammad. Approves medical eligibility &amp; donor blood group screening records. Privacy redacted.
              </p>
            </div>
          </div>

          {/* LEVEL 3: REGIONAL BRANCH MANAGERS & FIELD DESK */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', paddingLeft: '40px', borderLeft: '2px dashed rgba(59, 130, 246, 0.3)' }}>
            <div style={{ padding: '16px', borderRadius: '16px', background: 'var(--surf)', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--txt1)', marginBottom: '4px' }}>
                🏢 Branch Managers
              </div>
              <div style={{ fontSize: '12px', color: 'var(--txt2)' }}>
                6 Regional Hubs (Zhob, Pishin, Chaman, Loralai...). Appoints local town coordinators.
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '16px', background: 'var(--surf)', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--txt1)', marginBottom: '4px' }}>
                📝 Field Operations Desk
              </div>
              <div style={{ fontSize: '12px', color: 'var(--txt2)' }}>
                Coordinators, Data Entry Officers, Volunteer Leads answering emergency blood calls.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE ACCOUNTS REGISTER TABLE */}
      <div
        className="acard"
        style={{
          borderRadius: '24px',
          padding: '24px',
          background: 'var(--surf)',
          border: '1px solid var(--line)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* TABLE SEARCH & FILTER HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', gap: '14px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--txt1)' }}>
              Registered Personnel Directory
            </h3>
            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--txt2)' }}>
              Click any account row to open permissions, password reset, and status controls
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="fld"
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '220px', borderRadius: '10px', padding: '8px 12px', fontSize: '12.5px' }}
            />

            <select
              className="fld"
              value={townFilter}
              onChange={(e) => setTownFilter(e.target.value)}
              style={{ borderRadius: '10px', padding: '8px 12px', fontSize: '12.5px', width: '130px' }}
            >
              <option value="All">All Towns</option>
              <option value="All towns">All towns</option>
              {TOWNS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ACCOUNTS TABLE */}
        <div className="atbl" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Person &amp; Contact</th>
                <th>Role Level</th>
                <th>Town Jurisdiction</th>
                <th>Appointed By</th>
                <th>2FA Protection</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => setOpenAccount(a)}
                  style={{ cursor: 'pointer', transition: 'background 0.15s ease' }}
                >
                  <td className="m2">
                    <div className="nm" style={{ fontWeight: 800, color: 'var(--txt1)', fontSize: '14px' }}>
                      {a.n}
                    </div>
                    <div className="sm" style={{ fontSize: '12px', color: 'var(--txt2)' }}>
                      {a.e} {a.ph !== '-' && `· ${a.ph}`}
                    </div>
                  </td>
                  <td className="m1" style={{ fontWeight: 700, color: 'var(--txt1)', fontSize: '13px' }}>
                    {a.r}
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '99px',
                        background: 'rgba(59, 130, 246, 0.12)',
                        color: '#3B82F6',
                      }}
                    >
                      📍 {a.t}
                    </span>
                  </td>
                  <td className="sm" style={{ fontSize: '12.5px', color: 'var(--txt2)', fontWeight: 600 }}>
                    {a.by}
                  </td>
                  <td>
                    {a.tfa ? (
                      <span className="tag ok" style={{ fontSize: '11px', fontWeight: 800 }}>🛡️ Active</span>
                    ) : (
                      <span className="tag gy" style={{ fontSize: '11px', fontWeight: 700 }}>Off</span>
                    )}
                  </td>
                  <td className="m3">
                    {a.st === 'active' && <span className="tag ok">Active</span>}
                    {a.st === 'invited' && <span className="tag no">Invited</span>}
                    {a.st === 'suspended' && <span className="tag wt">Suspended</span>}
                  </td>
                </tr>
              ))}

              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--txt2)' }}>
                    No personnel found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="ahint" style={{ marginTop: '16px', fontSize: '12.5px', lineHeight: 1.5 }}>
          💡 Permanent Lineage Safeguard: Every single account on this list was created by a named officer above it. This creator field is written to the immutable log and cannot be modified.
        </p>
      </div>

      {/* ACCOUNT DETAIL SHEET / DRAWER */}
      {openAccount && (
        <>
          <div
            className="sheetov on"
            onClick={() => setOpenAccount(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 1000,
            }}
          />
          <div
            className="sheet open"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '440px',
              zIndex: 1001,
              background: 'var(--surf)',
              borderLeft: '1px solid var(--line)',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.3)',
              padding: '28px',
              overflowY: 'auto',
            }}
          >
            <button
              type="button"
              className="btn-cross-delete"
              onClick={() => setOpenAccount(null)}
              style={{ position: 'absolute', top: '20px', right: '20px' }}
            >
              ✕
            </button>

            {/* ACCOUNT HEADER */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '8px' }}>
                {openAccount.st === 'active' && <span className="tag ok">Active Account</span>}
                {openAccount.st === 'invited' && <span className="tag no">Invited — Awaiting Password Setup</span>}
                {openAccount.st === 'suspended' && <span className="tag wt">Suspended Account</span>}
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 4px 0', color: 'var(--txt1)' }}>
                {openAccount.n}
              </h2>
              <div style={{ fontSize: '13px', color: 'var(--txt2)', fontWeight: 600 }}>
                {openAccount.r} · 📍 {openAccount.t}
              </div>
            </div>

            {/* DETAIL ROWS */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '24px',
                background: 'var(--surf)',
                padding: '16px',
                borderRadius: '16px',
                border: '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--txt2)' }}>Email Address</span>
                <b style={{ color: 'var(--txt1)' }}>{openAccount.e}</b>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--txt2)' }}>Telephone</span>
                <b style={{ color: 'var(--txt1)' }}>{openAccount.ph}</b>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--txt2)' }}>Role Level</span>
                <b style={{ color: 'var(--txt1)' }}>{openAccount.r}</b>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--txt2)' }}>Appointed By</span>
                <b style={{ color: 'var(--p)' }}>{openAccount.by}</b>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--txt2)' }}>Last Activity</span>
                <b style={{ color: 'var(--txt1)' }}>{openAccount.last}</b>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--txt2)' }}>2FA Protection</span>
                <b style={{ color: openAccount.tfa ? '#22C55E' : 'var(--txt2)' }}>
                  {openAccount.tfa ? 'Enabled' : 'Disabled'}
                </b>
              </div>
            </div>

            {/* ACTIONS BUTTONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {openAccount.st === 'invited' ? (
                <>
                  <button
                    type="button"
                    className="btn btn-p"
                    onClick={() => handleResendInvite(openAccount.n)}
                    style={{ borderRadius: '10px', padding: '12px' }}
                  >
                    Resend Invitation Link
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-o"
                    onClick={() => handleToggle2FA(openAccount.id)}
                    style={{ borderRadius: '10px', padding: '10px', fontWeight: 700 }}
                  >
                    {openAccount.tfa ? 'Disable 2FA Shield' : 'Require Two-Step Verification (2FA)'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-o"
                    onClick={() => showToast(`Sent one-time password reset email to ${openAccount.e}`)}
                    style={{ borderRadius: '10px', padding: '10px', fontWeight: 700 }}
                  >
                    Send One-Time Password Reset Link
                  </button>

                  <button
                    type="button"
                    className={`btn ${openAccount.st === 'suspended' ? 'btn-p' : 'btn-d'}`}
                    onClick={() => handleToggleSuspend(openAccount.id)}
                    style={{ borderRadius: '10px', padding: '11px', marginTop: '6px', fontWeight: 800 }}
                  >
                    {openAccount.st === 'suspended' ? 'Restore Active Account Status' : 'Suspend Personnel Account'}
                  </button>
                </>
              )}
            </div>

            <p className="ahint" style={{ marginTop: '20px', fontSize: '12px', lineHeight: 1.5 }}>
              🔒 Every audit operation on this account is permanently signed and saved into the Quetta HQ central governance log.
            </p>
          </div>
        </>
      )}

      {/* CREATE ACCOUNT MODAL */}
      {isCreating && (
        <CreateAccountSheet
          open={isCreating}
          sent={sentAccount}
          onClose={() => { setIsCreating(false); setSentAccount(null); }}
          onCreated={handleCreateAccountSuccess}
          onAnother={() => setSentAccount(null)}
        />
      )}
    </AdminShell>
  );
}

function CreateAccountSheet({
  open,
  sent,
  onClose,
  onCreated,
  onAnother,
}: {
  open: boolean;
  sent: { name: string; role: string; town: string } | null;
  onClose: () => void;
  onCreated: (acc: Account) => void;
  onAnother: () => void;
}) {
  const allowedRoles = CANMAKE;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(allowedRoles[allowedRoles.length - 1]);
  const [town, setTown] = useState('All towns');
  const [req2FA, setReq2FA] = useState(true);

  const townOptions = [
    { value: 'All towns', label: 'All fourteen towns' },
    ...getTownNamesList().map((t) => ({ value: t, label: t })),
  ];

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter full name.');
      return;
    }
    if (!email.trim()) {
      showToast('Please enter official email address.');
      return;
    }

    const newAcc: Account = {
      id: `acc-${Date.now()}`,
      n: name.trim(),
      r: role,
      t: town,
      e: email.trim(),
      ph: phone.trim() || '-',
      st: 'invited',
      by: HEAD_WHO,
      last: '-',
      tfa: req2FA ? 1 : 0,
    };

    onCreated(newAcc);
  }

  return (
    <>
      <div
        className="sheetov on"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 1000,
        }}
      />
      <div
        className="acard"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 1001,
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
          background: 'var(--surf)',
          borderRadius: '24px',
          padding: '28px',
        }}
      >
        <button
          type="button"
          className="btn-cross-delete"
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px' }}
        >
          ✕
        </button>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#22C55E',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: 900,
                marginBottom: '14px',
              }}
            >
              ✓
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 6px 0', color: 'var(--txt1)' }}>
              Account Invitation Sent!
            </h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '13.5px', color: 'var(--txt2)', lineHeight: 1.5 }}>
              <b>{sent.name}</b> has been invited as <b>{sent.role}</b> for 📍 {sent.town}. They will receive a single activation link to set their own password.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-p"
                onClick={onClose}
                style={{ borderRadius: '12px', padding: '12px', fontWeight: 800 }}
              >
                Done
              </button>

              <button
                type="button"
                className="btn btn-o"
                onClick={() => {
                  setName('');
                  setEmail('');
                  setPhone('');
                  onAnother();
                }}
                style={{ borderRadius: '12px', padding: '10px', fontWeight: 700 }}
              >
                Create Another Account
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '18px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 900, margin: '0 0 4px 0', color: 'var(--txt1)' }}>
                Create New Personnel Account
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--txt2)' }}>
                Appointing as <b>{HEAD_WHO}</b>. Permanently attached to account lineage.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt1)' }}>Full Name *</label>
                <input
                  type="text"
                  className="fld"
                  placeholder="e.g. Dr. Hamid Kakar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ borderRadius: '10px', padding: '10px 14px', color: 'var(--txt1)' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt1)' }}>Official Email *</label>
                  <input
                    type="email"
                    className="fld"
                    placeholder="name@pbb.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ borderRadius: '10px', padding: '10px 14px', color: 'var(--txt1)' }}
                    required
                  />
                </div>

                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt1)' }}>Telephone Number</label>
                  <input
                    type="tel"
                    className="fld"
                    placeholder="03XX XXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ borderRadius: '10px', padding: '10px 14px', color: 'var(--txt1)' }}
                  />
                </div>
              </div>

              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt1)', marginBottom: '8px', display: 'block' }}>
                  Select Role Level
                </label>
                <div className="pickgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                  {allowedRoles.map((r) => (
                    <button
                      type="button"
                      key={r}
                      className={`pickopt${r === role ? ' on' : ''}`}
                      onClick={() => setRole(r)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '12px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        border: r === role ? '1px solid var(--p)' : '1px solid var(--line)',
                        background: r === role ? 'rgba(217, 35, 35, 0.12)' : 'var(--surf)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <b style={{ fontSize: '13px', color: r === role ? 'var(--p)' : 'var(--txt1)', display: 'block' }}>{r}</b>
                      <span style={{ fontSize: '11.5px', color: 'var(--txt2)', lineHeight: 1.35 }}>{ROLEDESC[r]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt1)', marginBottom: '6px', display: 'block' }}>
                  Town Jurisdiction
                </label>
                <CustomSelect
                  name="town"
                  options={townOptions}
                  value={town}
                  onChange={(val) => setTown(val)}
                  direction="up"
                />
              </div>

              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  background: 'var(--surf)',
                  border: '1px solid var(--line)',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--txt1)' }}>
                    Require Two-Step SMS Verification (2FA)
                  </span>
                  <input
                    type="checkbox"
                    checked={req2FA}
                    onChange={(e) => setReq2FA(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--p)' }}
                  />
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-p"
                style={{ marginTop: '8px', borderRadius: '12px', padding: '13px', fontSize: '14px', fontWeight: 800 }}
              >
                Create Account &amp; Send Invitation Link
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
