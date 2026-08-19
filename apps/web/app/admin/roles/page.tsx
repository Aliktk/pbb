'use client';

import { useState, useEffect } from 'react';
import { AdminShell } from '../../../components/admin/AdminShell';
import { ROLES, ROLE_ORDER, type RoleKey } from '../../../lib/roles';
import { fetchStaff } from '../../../lib/accounts';

// Roles are FIXED in the Supabase-direct model. The real access rules live in the database (Row
// Level Security); lib/roles.ts is the single UI-side source of truth for labels, scope and a
// coarse permission map. This page is therefore an HONEST, read-only view of that model - there is
// no editable roles table, so there are no create/edit/delete actions and nothing is ever "saved".
// It only reads how many accounts currently hold each role (via profiles / fetchStaff).

// Turn the coarse permission map from lib/roles.ts into short human-readable lines.
function summarisePermissions(perms: Record<string, string[]>): string[] {
  if (perms['*']) return ['Full access to every module'];
  const lines = Object.entries(perms).map(([resource, actions]) => {
    const label = resource.charAt(0).toUpperCase() + resource.slice(1);
    return `${label}: ${actions.join(', ')}`;
  });
  return lines.length > 0 ? lines : ['No module permissions'];
}

export default function AdminRoles() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleKey>('head');

  // Read the account register (RLS-scoped) and tally how many hold each role.
  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchStaff()
      .then((staff) => {
        if (!alive) return;
        const tally: Record<string, number> = {};
        for (const s of staff) {
          tally[s.role_key] = (tally[s.role_key] ?? 0) + 1;
        }
        setCounts(tally);
        setTotal(staff.length);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Could not read the account register.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const activeRole = ROLES[selectedRole];
  const orgWideCount = ROLE_ORDER.filter((k) => !ROLES[k].scoped).length;

  return (
    <AdminShell
      view="roles"
      title="Roles &amp; Permission Governance"
      subtitle={`${ROLE_ORDER.length} Fixed System Roles · Enforced by database security`}
    >
      {/* Honest banner: roles are fixed, this is a read-only reference. */}
      <div
        style={{
          background: 'rgba(59, 130, 246, 0.06)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '14px',
          padding: '14px 18px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <span style={{ fontSize: '20px' }}>🛡️</span>
        <div style={{ fontSize: '13px', color: 'var(--txt1)' }}>
          <b>Roles are fixed in this system.</b> Access is enforced by database Row Level Security, not
          by an editable table. This page is a read-only reference: it shows each role, its scope, and
          how many accounts currently hold it. To change who has which role, use{' '}
          <b>Accounts &amp; Hierarchy</b>.
        </div>
      </div>

      {/* KPI GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="acard" style={{ borderRadius: '20px', padding: '20px 22px', background: 'var(--surf)', border: '1px solid var(--line)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3.5px', background: '#22C55E' }} />
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
            Fixed System Roles
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--txt1)', lineHeight: 1 }}>
            {ROLE_ORDER.length} <span style={{ fontSize: '13px', fontWeight: 700, color: '#22C55E' }}>Roles</span>
          </div>
        </div>

        <div className="acard" style={{ borderRadius: '20px', padding: '20px 22px', background: 'var(--surf)', border: '1px solid var(--line)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3.5px', background: '#3B82F6' }} />
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
            Organisation-wide Roles
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--txt1)', lineHeight: 1 }}>
            {orgWideCount} <span style={{ fontSize: '13px', fontWeight: 700, color: '#3B82F6' }}>All towns</span>
          </div>
        </div>

        <div className="acard" style={{ borderRadius: '20px', padding: '20px 22px', background: 'var(--surf)', border: '1px solid var(--line)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3.5px', background: '#A855F7' }} />
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
            Office-scoped Roles
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--txt1)', lineHeight: 1 }}>
            {ROLE_ORDER.length - orgWideCount} <span style={{ fontSize: '13px', fontWeight: 700, color: '#A855F7' }}>One office</span>
          </div>
        </div>

        <div className="acard" style={{ borderRadius: '20px', padding: '20px 22px', background: 'var(--surf)', border: '1px solid var(--line)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3.5px', background: 'var(--p)' }} />
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
            Accounts You Can See
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--txt1)', lineHeight: 1 }}>
            {loading ? '…' : total} <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--p)' }}>Staff</span>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: 'var(--p)', fontWeight: 600 }}>
          Account counts unavailable: {error}
        </div>
      )}

      {/* SECTION HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 2px 0', color: 'var(--txt1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>👑</span> System Roles Directory
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--txt2)', margin: 0 }}>
            Select a role card below to inspect its scope and coarse permissions.
          </p>
        </div>
        <span className="tag" style={{ fontSize: '11.5px', fontWeight: 700 }}>
          {ROLE_ORDER.length} Roles
        </span>
      </div>

      {/* ROLES CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {ROLE_ORDER.map((key) => {
          const role = ROLES[key];
          const isSelected = key === selectedRole;
          const count = counts[key] ?? 0;

          return (
            <div
              key={key}
              className="acard"
              onClick={() => setSelectedRole(key)}
              style={{
                borderRadius: '18px',
                padding: '18px 20px',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                border: isSelected ? '2.5px solid var(--p)' : '1px solid var(--line)',
                background: isSelected ? 'rgba(217, 35, 35, 0.05)' : 'var(--surf)',
                boxShadow: isSelected ? '0 8px 25px rgba(217, 35, 35, 0.15)' : 'none',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className="tag" style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' }}>
                  LEVEL {role.level}
                </span>
                <span
                  className="tag"
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    background: role.scoped ? 'rgba(234, 179, 8, 0.15)' : 'rgba(59, 130, 246, 0.12)',
                    color: role.scoped ? '#EAB308' : '#3B82F6',
                  }}
                >
                  {role.scoped ? '📍 One office' : '🌐 All towns'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '16.5px', fontWeight: 800, margin: 0, color: isSelected ? 'var(--p)' : 'var(--txt1)' }}>
                  {role.label}
                </h3>
              </div>

              <p style={{ fontSize: '12.5px', color: 'var(--txt2)', margin: '0 0 10px 0' }}>{role.description}</p>

              <div style={{ fontSize: '12.5px', color: 'var(--txt2)', borderTop: '1px solid var(--line)', paddingTop: '10px', marginTop: '4px' }}>
                <span>{loading ? 'Counting…' : `${count} account${count === 1 ? '' : 's'} with this role`}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* PERMISSIONS DETAIL FOR SELECTED ROLE (read-only) */}
      <div className="acard" style={{ borderRadius: '22px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid var(--line)', paddingBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 900, margin: '0 0 4px 0', color: 'var(--txt1)' }}>
              Role: <span style={{ color: 'var(--p)' }}>{activeRole.label}</span>
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--txt2)', margin: 0 }}>
              {activeRole.scoped ? 'Scoped to a single office/town.' : 'Applies across the whole organisation (all towns).'}{' '}
              This is a read-only view of the fixed role model.
            </p>
          </div>
          <span className="tag" style={{ fontSize: '11.5px', fontWeight: 800, background: 'rgba(148, 163, 184, 0.15)', color: 'var(--txt2)' }}>
            🔒 Fixed
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {summarisePermissions(activeRole.permissions).map((line, idx) => (
            <div key={idx} style={{ background: 'var(--bg)', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', color: 'var(--txt1)', fontWeight: 600 }}>
              ✅ {line}
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
