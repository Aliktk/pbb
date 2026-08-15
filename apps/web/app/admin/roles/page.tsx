'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { Icon } from '../../../components/Icon';
import { CustomSelect } from '../../../components/CustomSelect';

interface RoleCard {
  key: string;
  n: string; // role name
  d: string; // description
  c: number; // personnel count
  icon: string;
}

const INITIAL_ROLES: RoleCard[] = [
  { key: 'olus', n: 'Apex Admin (Olus Yar)', d: 'Full system authorization across all 14 towns, including deleting records, staff management, and system logs.', c: 2, icon: '👑' },
  { key: 'exec', n: 'Executive Committee', d: 'All towns scope. Approves branch managers and publishes live website emergency banners. Cannot delete records.', c: 3, icon: '🏛️' },
  { key: 'bm', n: 'Branch Manager', d: 'Single town jurisdiction. Manages local requests, donors, stock inventory, and field staff.', c: 6, icon: '🏢' },
  { key: 'coord', n: 'Coordinator', d: 'Answers emergency blood calls, dispatches donors, and logs responses. Cannot edit core records.', c: 4, icon: '📞' },
  { key: 'de', n: 'Data Entry', d: 'Adds and updates donor registrations and donation logs for their assigned town.', c: 14, icon: '📝' },
  { key: 'acc', n: 'Accounts', d: 'Financial auditing, donation receipts, and welfare expenditure entries.', c: 2, icon: '💰' },
  { key: 'verif', n: 'Medical Verifier', d: 'Screening laboratory desk. Approves medical blood group test eligibility. Phone numbers redacted.', c: 2, icon: '🧪' },
  { key: 'vol', n: 'Volunteer Lead', d: 'Coordinates community volunteers and blood drive donation camps.', c: 3, icon: '🤝' },
];

interface PermRow {
  area: string;
  action: string;
  cells: Record<string, string>; // mapping from role key to cell value
}

const INITIAL_PERMS: PermRow[] = [
  { area: 'Donors', action: 'View donor records', cells: { olus: 'All', exec: 'All', bm: 'Own town', coord: 'Own town', de: 'Own town', acc: '-', verif: 'All', vol: '-' } },
  { area: 'Donors', action: 'Add and edit donors', cells: { olus: '✓', exec: '✓', bm: '✓', coord: '✓', de: '✓', acc: '-', verif: '-', vol: '-' } },
  { area: 'Donors', action: 'Delete or merge records', cells: { olus: '✓', exec: '-', bm: '-', coord: '-', de: '-', acc: '-', verif: '-', vol: '-' } },
  { area: 'Requests', action: 'Answer & dispatch calls', cells: { olus: '✓', exec: '✓', bm: '✓', coord: '✓', de: '-', acc: '-', verif: '-', vol: '-' } },
  { area: 'Inventory', action: 'Update branch blood stock', cells: { olus: '✓', exec: '-', bm: '✓', coord: '-', de: '✓', acc: '-', verif: '-', vol: '-' } },
  { area: 'Ledger', action: 'Record blood donations', cells: { olus: '✓', exec: '✓', bm: '✓', coord: '✓', de: '✓', acc: '✓', verif: '-', vol: '-' } },
  { area: 'Money', action: 'Verify financial receipts', cells: { olus: '✓', exec: '✓', bm: '-', coord: '-', de: '-', acc: '✓', verif: '✓', vol: '-' } },
  { area: 'Website', action: 'Edit & publish web content', cells: { olus: '✓', exec: '✓', bm: '-', coord: '-', de: '-', acc: '-', verif: '-', vol: '✓' } },
  { area: 'Settings', action: 'Change system thresholds', cells: { olus: '✓', exec: '-', bm: '-', coord: '-', de: '-', acc: '-', verif: '-', vol: '-' } },
  { area: 'Staff', action: 'Create & manage accounts', cells: { olus: '✓', exec: '-', bm: '-', coord: '-', de: '-', acc: '-', verif: '-', vol: '-' } },
];

const STAFF_SAMPLE: [string, string, string, string][] = [
  ['Olus Yar', 'Apex Admin (Olus Yar)', 'All 14 Towns', 'Active Now'],
  ['Dr. Hamid Khan Achakzai', 'Executive Committee', 'All 14 Towns', '2 hours ago'],
  ['Dr. Naseer Muhammad', 'Medical Verifier', 'All 14 Towns', '3 hours ago'],
  ['Zhob Branch Manager', 'Branch Manager', 'Zhob District', 'Yesterday'],
  ['Pishin Data Entry', 'Data Entry', 'Pishin District', '3 days ago'],
];

export default function AdminRoles() {
  const [roles, setRoles] = useState<RoleCard[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pbb_roles_list');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_ROLES;
  });

  const [perms, setPerms] = useState<PermRow[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pbb_perms_matrix');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_PERMS;
  });

  const [isNewRoleOpen, setIsNewRoleOpen] = useState(false);
  const [roleTitle, setRoleTitle] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [templateRole, setTemplateRole] = useState('bm');

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem('pbb_roles_list', JSON.stringify(roles));
      localStorage.setItem('pbb_perms_matrix', JSON.stringify(perms));
    } catch {}
  }, [roles, perms]);

  // Toggle permission matrix cell state
  function toggleCell(rowIdx: number, roleKey: string) {
    const nextPerms = perms.map((row, i) => {
      if (i === rowIdx) {
        const currentVal = row.cells[roleKey] || '-';
        let nextVal = '✓';
        if (currentVal === '✓') nextVal = '-';
        else if (currentVal === '-') nextVal = 'Own town';
        else if (currentVal === 'Own town') nextVal = 'All';
        else if (currentVal === 'All') nextVal = '✓';

        showToast(`Updated "${row.action}" for ${roles.find((r) => r.key === roleKey)?.n} to [ ${nextVal} ]`);
        return {
          ...row,
          cells: {
            ...row.cells,
            [roleKey]: nextVal,
          },
        };
      }
      return row;
    });
    setPerms(nextPerms);
  }

  function handleCreateRole(e: FormEvent) {
    e.preventDefault();
    if (!roleTitle.trim()) {
      showToast('Please enter role title.');
      return;
    }

    const key = `custom-${Date.now()}`;
    const newRoleCard: RoleCard = {
      key,
      n: roleTitle.trim(),
      d: roleDesc.trim() || 'Custom defined administrative role level.',
      c: 1,
      icon: '🛡️',
    };

    // Copy template permissions
    const templatePerms = perms.map((row) => ({
      ...row,
      cells: {
        ...row.cells,
        [key]: row.cells[templateRole] || '-',
      },
    }));

    setRoles([...roles, newRoleCard]);
    setPerms(templatePerms);
    setIsNewRoleOpen(false);
    setRoleTitle('');
    setRoleDesc('');
    showToast(`Created new administrative role "${newRoleCard.n}"!`);
  }

  const templateOptions = roles.map((r) => ({ value: r.key, label: r.n }));

  const actions = (
    <button
      type="button"
      className="btn btn-p btn-s"
      onClick={() => setIsNewRoleOpen(true)}
      style={{ borderRadius: '12px', padding: '9px 18px', fontSize: '13px', fontWeight: 800 }}
    >
      + New Role Definition
    </button>
  );

  return (
    <AdminShell
      view="roles"
      title="Role &amp; Access Governance Matrix"
      subtitle={`${roles.length} Role Definitions · 36 Staff Members Across 14 Towns`}
      actions={actions}
    >
      {/* ROLE TILES GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '26px' }}>
        {roles.map((r) => (
          <div
            key={r.key}
            className="acard"
            style={{
              borderRadius: '20px',
              padding: '20px',
              background: 'var(--surf)',
              border: '1px solid var(--line)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
              transition: 'all 0.2s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{r.icon}</span>
                  <b style={{ fontSize: '15.5px', color: 'var(--txt1)', fontWeight: 800 }}>{r.n}</b>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--txt2)', lineHeight: 1.5 }}>
                {r.d}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--line)' }}>
              <span className="tag gy" style={{ fontSize: '11px', fontWeight: 800 }}>
                👤 {r.c} {r.c === 1 ? 'person' : 'people'}
              </span>

              <button
                type="button"
                className="btn btn-o btn-s"
                onClick={() => showToast(`Editing permission switches for ${r.n}`)}
                style={{ borderRadius: '8px', fontSize: '11.5px', padding: '4px 10px', fontWeight: 700 }}
              >
                Edit Matrix
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PERMISSIONS MATRIX TABLE CARD */}
      <div
        className="acard"
        style={{
          borderRadius: '24px',
          padding: '26px',
          marginBottom: '26px',
          background: 'var(--surf)',
          border: '1px solid var(--line)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: '0 0 2px 0', fontSize: '18px', fontWeight: 900, color: 'var(--txt1)' }}>
              Interactive Access Switch Matrix
            </h3>
            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--txt2)' }}>
              Click any cell to toggle permissions (✓ Allowed · - Denied · Own town · All towns)
            </p>
          </div>

          <button
            type="button"
            className="btn btn-o btn-s"
            onClick={() => showToast('Saved all role permission switches to system storage!')}
            style={{ borderRadius: '10px', padding: '8px 16px', fontWeight: 800 }}
          >
            Save Matrix State
          </button>
        </div>

        {/* MATRIX TABLE CONTAINER */}
        <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid var(--line)' }}>
          <table className="permtbl" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surf)', borderBottom: '1px solid var(--line)' }}>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '12px', color: 'var(--txt2)', fontWeight: 800 }}>Area</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: '12px', color: 'var(--txt2)', fontWeight: 800 }}>Action</th>
                {roles.map((r) => (
                  <th key={r.key} style={{ padding: '12px 10px', textAlign: 'center', fontSize: '11.5px', color: 'var(--txt1)', fontWeight: 800, minWidth: '100px' }}>
                    {r.n}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {perms.map((p, rowIdx) => (
                <tr key={`${p.area}-${p.action}`} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td className="pa" style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 800, color: 'var(--p)' }}>{p.area}</td>
                  <td className="pact" style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 700, color: 'var(--txt1)' }}>{p.action}</td>
                  {roles.map((r) => {
                    const c = p.cells[r.key] || '-';
                    return (
                      <td
                        key={r.key}
                        className="pc"
                        onClick={() => toggleCell(rowIdx, r.key)}
                        style={{
                          padding: '10px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        {c === '✓' && <span className="yes" style={{ color: '#22C55E', fontWeight: 900, fontSize: '16px' }}>✓</span>}
                        {c === '-' && <span className="no2" style={{ color: 'var(--txt2)', opacity: 0.5, fontWeight: 700 }}>-</span>}
                        {c !== '✓' && c !== '-' && (
                          <span
                            className="scopetag"
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: '99px',
                              background: c === 'All' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                              color: c === 'All' ? '#22C55E' : '#3B82F6',
                              border: c === 'All' ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(59, 130, 246, 0.35)',
                            }}
                          >
                            {c}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SAFEGUARD BANNERS */}
      <div className="g2" style={{ gap: '18px', marginBottom: '26px', alignItems: 'stretch' }}>
        <div
          className="acard"
          style={{
            borderRadius: '20px',
            padding: '24px',
            background: 'var(--surf)',
            border: '1px solid var(--line)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '20px' }}>🌐</span>
            <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 800, color: 'var(--txt1)' }}>
              Row-Level Tenant Isolation (&quot;Own Town&quot;)
            </h3>
          </div>
          <p className="sm" style={{ margin: 0, fontSize: '13px', color: 'var(--txt2)', lineHeight: 1.55 }}>
            Enforced directly inside the database query engine. A Zhob branch officer requesting donor records receives only Zhob rows — no modified web address or API parameter can return Quetta or Chaman data.
          </p>
        </div>

        <div
          className="acard"
          style={{
            borderRadius: '20px',
            padding: '24px',
            background: 'rgba(217, 35, 35, 0.08)',
            border: '1px solid rgba(217, 35, 35, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '20px' }}>🔒</span>
            <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 800, color: 'var(--p)' }}>
              Top 3 Protected Governance Safeguards
            </h3>
          </div>
          <p className="sm" style={{ margin: 0, fontSize: '13px', color: 'var(--txt2)', lineHeight: 1.55 }}>
            Deleting a record, exporting the full donor register, and modifying minor consent. Reserved strictly for Apex Leadership, and every invocation writes a signed audit record to the Quetta HQ log.
          </p>
        </div>
      </div>

      {/* STAFF ACCOUNTS SECTION WITH DIRECT ACCESSIBILITY LINK */}
      <div
        className="acard"
        style={{
          borderRadius: '24px',
          padding: '26px',
          background: 'var(--surf)',
          border: '1px solid var(--line)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: '0 0 2px 0', fontSize: '18px', fontWeight: 900, color: 'var(--txt1)' }}>
              Appointed Staff Lineage Overview
            </h3>
            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--txt2)' }}>
              Active personnel linked to these role definitions across all 14 town branches
            </p>
          </div>

          <Link
            href="/admin/accounts"
            className="btn btn-p btn-s"
            style={{ textDecoration: 'none', borderRadius: '10px', padding: '8px 16px', fontWeight: 800 }}
          >
            Manage Accounts &amp; Lineage →
          </Link>
        </div>

        <div className="atbl" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Officer Name</th>
                <th>Assigned Role Level</th>
                <th>Town Jurisdiction</th>
                <th>Last Active Sign-in</th>
              </tr>
            </thead>
            <tbody>
              {STAFF_SAMPLE.map(([n, r, t, l]) => (
                <tr key={n}>
                  <td className="m2">
                    <div className="nm" style={{ fontWeight: 800, color: 'var(--txt1)', fontSize: '14px' }}>
                      {n}
                    </div>
                  </td>
                  <td className="m1" style={{ fontWeight: 700, color: 'var(--txt1)', fontSize: '13px' }}>
                    {r}
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
                      📍 {t}
                    </span>
                  </td>
                  <td className="m3 sm" style={{ fontSize: '12.5px', color: 'var(--txt2)', fontWeight: 600 }}>
                    {l}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW ROLE MODAL */}
      {isNewRoleOpen && (
        <>
          <div
            className="sheetov on"
            onClick={() => setIsNewRoleOpen(false)}
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
              maxWidth: '480px',
              zIndex: 1001,
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
              background: 'var(--surf)',
              borderRadius: '24px',
              padding: '26px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 900, margin: 0, color: 'var(--txt1)' }}>
                Define New Role Level
              </h2>
              <button
                type="button"
                className="btn-cross-delete"
                onClick={() => setIsNewRoleOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRole} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt1)' }}>Role Title *</label>
                <input
                  type="text"
                  className="fld"
                  placeholder="e.g. Regional Field Inspector"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  style={{ borderRadius: '10px', padding: '10px 14px', color: 'var(--txt1)' }}
                  required
                />
              </div>

              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt1)' }}>Role Description</label>
                <textarea
                  className="fld"
                  placeholder="Summarize screen access &amp; administrative scope..."
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  style={{ borderRadius: '10px', padding: '10px 14px', color: 'var(--txt1)', minHeight: '80px', fontFamily: 'inherit' }}
                />
              </div>

              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt1)', marginBottom: '6px', display: 'block' }}>
                  Copy Initial Permissions From
                </label>
                <CustomSelect
                  name="templateRole"
                  options={templateOptions}
                  value={templateRole}
                  onChange={(val) => setTemplateRole(val)}
                  direction="up"
                />
              </div>

              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-p" style={{ flex: 1, borderRadius: '10px', padding: '12px', fontWeight: 800 }}>
                  Create Role Definition
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </AdminShell>
  );
}
