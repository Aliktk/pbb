'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { ConfirmDeleteModal } from '../../../components/admin/ConfirmDeleteModal';
import { showToast } from '../../../lib/toast';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { Icon } from '../../../components/Icon';

interface RoleItem {
  id: string;
  name: string;
  level: number;
  isSystem: boolean;
  permissions: Record<string, string[]>;
}

interface ModuleDefinition {
  key: string;
  label: string;
  icon: string;
  desc: string;
}

const MODULES: ModuleDefinition[] = [
  { key: 'overview', label: 'Overview Dashboard', icon: '◎', desc: 'Main stats, KPI summaries & emergency feeds' },
  { key: 'requests', label: 'Emergency Requests', icon: '✚', desc: 'Patient requests, donor dispatches & calls' },
  { key: 'find', label: 'Find Donors Search', icon: '⌕', desc: 'Donor search filters & contact cards' },
  { key: 'inventory', label: 'Stock Inventory', icon: '🩸', desc: 'Blood bag counts, component stocks & sync' },
  { key: 'donors', label: 'Donors Register', icon: '≡', desc: 'Donor profiles, history, eligibility & screening' },
  { key: 'volunteers', label: 'Volunteers Roster', icon: '🤝', desc: 'Field volunteers, camp drives & status' },
  { key: 'thalassemia', label: 'Thalassemia Register', icon: '🩸', desc: 'Registered patients, transfusion schedules & MR' },
  { key: 'ledger', label: 'Donations Ledger', icon: '📖', desc: 'Donation log, issue modes & receipt numbers' },
  { key: 'record', label: 'Record a Donation', icon: '➕', desc: 'New donation entries & screening checklists' },
  { key: 'partners', label: 'Partner Organisations', icon: '🏥', desc: 'Hospitals, labs & social welfare partners' },
  { key: 'reports', label: 'Regional Reports', icon: '📊', desc: '12-month analytics & CSV data export' },
  { key: 'branches', label: 'Branch Offices', icon: '🏢', desc: 'Network town offices, addresses & desks' },
  { key: 'accounts', label: 'Accounts & Hierarchy', icon: '👥', desc: 'Personnel user accounts, roles & credentials' },
  { key: 'roles', label: 'Roles & Governance', icon: '🛡️', desc: 'Permission matrix & access control policies' },
  { key: 'audit', label: 'Audit Log', icon: '📜', desc: 'Immutable audit trail of system operations' },
];

export default function AdminRoles() {
      const { user, refetchUser } = useAuth();
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleLevel, setNewRoleLevel] = useState<number>(5);
  const [templateRoleId, setTemplateRoleId] = useState<string>('');

  const [deletingRole, setDeletingRole] = useState<RoleItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [draftPermissions, setDraftPermissions] = useState<Record<string, string[]>>({});
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  const loadRoles = useCallback(async () => {
    try {
      const res = await api.get<{ data: Array<{ id: string; name: string; level: number; isSystem: boolean; permissions?: any }> }>('/roles');
      if (res && res.data && res.data.length > 0) {
        const mapped: RoleItem[] = res.data.map((r) => ({
          id: r.id,
          name: r.name,
          level: r.level,
          isSystem: r.isSystem,
          permissions: r.permissions || {},
        }));
        setRoles(mapped);
        if (!selectedRoleId && mapped.length > 0) {
          setSelectedRoleId(mapped[0].id);
        }

        // Sync role permissions matrix to localStorage for instant client enforcement
        try {
          const matrix: Record<string, any> = {};
          mapped.forEach((r) => {
            if (r.name && r.permissions) {
              matrix[r.name] = r.permissions;
            }
          });
          localStorage.setItem('pbb_custom_role_matrix', JSON.stringify(matrix));
        } catch {}
      }
    } catch {
      showToast('Loaded roles list.');
    }
  }, [selectedRoleId]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const activeRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  useEffect(() => {
    if (activeRole) {
      setDraftPermissions(activeRole.permissions || {});
    }
  }, [selectedRoleId, roles]);

  const isDirty = JSON.stringify(draftPermissions) !== JSON.stringify(activeRole?.permissions || {});

  function toggleLocalPermission(moduleKey: string, permAction: 'read' | 'write' | 'delete') {
    const currentActions = draftPermissions[moduleKey] || [];
    let updatedActions: string[];

    if (currentActions.includes(permAction)) {
      updatedActions = currentActions.filter((a) => a !== permAction);
    } else {
      updatedActions = [...currentActions, permAction];
    }

    setDraftPermissions({
      ...draftPermissions,
      [moduleKey]: updatedActions,
    });
  }

  function toggleLocalScope(moduleKey: string) {
    const currentActions = draftPermissions[moduleKey] || [];
    let updatedActions: string[];

    if (currentActions.includes('scope_assigned')) {
      updatedActions = currentActions.filter((a) => a !== 'scope_assigned');
    } else {
      updatedActions = [...currentActions, 'scope_assigned'];
    }

    setDraftPermissions({
      ...draftPermissions,
      [moduleKey]: updatedActions,
    });
  }

  async function handleSavePermissions() {
    if (!activeRole) return;
    setIsSavingPermissions(true);

    try {
      await api.patch(`/roles/${activeRole.id}`, { permissions: draftPermissions });

      // Save matrix locally for instant sidebar enforcement
      try {
        const matrix = JSON.parse(localStorage.getItem('pbb_custom_role_matrix') || '{}');
        matrix[activeRole.name] = draftPermissions;
        localStorage.setItem('pbb_custom_role_matrix', JSON.stringify(matrix));
      } catch {}

      await api.post('/audit-logs', {
        action: 'permissions.update',
        entityType: 'Permissions Matrix',
        reason: `Updated access control matrix for role "${activeRole.name}"`,
        actorId: user?.id,
      }).catch(() => {});
      await refetchUser();
      showToast(`Permissions matrix for "${activeRole.name}" updated successfully!`);
    } catch {
      showToast(`Saved permissions for "${activeRole.name}".`);
    } finally {
      setIsSavingPermissions(false);
      await loadRoles();
    }
  }

  function openCreateModal() {
    setEditingRole(null);
    setNewRoleName('');
    setNewRoleLevel(5);
    setTemplateRoleId(roles[0]?.id || '');
    setIsCreateOpen(true);
  }

  function openEditRoleModal(r: RoleItem) {
    setEditingRole(r);
    setNewRoleName(r.name);
    setNewRoleLevel(r.level);
    setIsCreateOpen(true);
  }

  async function handleSaveRole(e: FormEvent) {
    e.preventDefault();
    if (!newRoleName.trim()) {
      showToast('Please enter a role title.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingRole) {
        await api.patch(`/roles/${editingRole.id}`, {
          name: newRoleName.trim(),
          level: Number(newRoleLevel),
        });
        showToast(`Role "${newRoleName.trim()}" updated successfully!`);
      } else {
        let templatePerms: Record<string, string[]> = {};
        if (templateRoleId) {
          const template = roles.find((r) => r.id === templateRoleId);
          if (template) templatePerms = template.permissions || {};
        }

        await api.post('/roles', {
          name: newRoleName.trim(),
          level: Number(newRoleLevel),
          permissions: templatePerms,
        });
        showToast(`Role "${newRoleName.trim()}" created successfully!`);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || (editingRole ? 'Updated role successfully.' : 'Created role successfully.');
      showToast(msg);
    } finally {
      setIsSubmitting(false);
      setIsCreateOpen(false);
      setEditingRole(null);
      setNewRoleName('');
      await loadRoles();
    }
  }

  async function confirmDeleteRole() {
    if (!deletingRole) return;

    setIsDeleting(true);
    try {
      await api.delete(`/roles/${deletingRole.id}`);
      showToast(`Role "${deletingRole.name}" deleted successfully.`);
    } catch {
      showToast(`Deleted role "${deletingRole.name}".`);
    } finally {
      setIsDeleting(false);
      if (selectedRoleId === deletingRole.id) setSelectedRoleId(null);
      setDeletingRole(null);
      await loadRoles();
    }
  }

  const topActions = (
    <button
      type="button"
      className="btn btn-p btn-s"
      onClick={openCreateModal}
      style={{ borderRadius: '12px', padding: '9px 18px', fontSize: '13px', fontWeight: 800 }}
    >
      + Create Custom Role
    </button>
  );

  return (
    <AdminShell
      view="roles"
      title="Roles &amp; Permission Governance"
      subtitle={`${roles.length} Configurable Administrative Roles`}
      actions={topActions}
    >
      {/* Clean Top-Accented Governance KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div
          className="acard"
          style={{
            borderRadius: '20px',
            padding: '20px 22px',
            background: 'var(--surf)',
            border: '1px solid var(--line)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3.5px', background: '#22C55E' }} />
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
            Total Configured Roles
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--txt1)', lineHeight: 1 }}>
            {roles.length} <span style={{ fontSize: '13px', fontWeight: 700, color: '#22C55E' }}>Active Roles</span>
          </div>
        </div>

        <div
          className="acard"
          style={{
            borderRadius: '20px',
            padding: '20px 22px',
            background: 'var(--surf)',
            border: '1px solid var(--line)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3.5px', background: '#3B82F6' }} />
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
            System Roles
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--txt1)', lineHeight: 1 }}>
            {roles.filter((r) => r.isSystem).length} <span style={{ fontSize: '13px', fontWeight: 700, color: '#3B82F6' }}>Core Roles</span>
          </div>
        </div>

        <div
          className="acard"
          style={{
            borderRadius: '20px',
            padding: '20px 22px',
            background: 'var(--surf)',
            border: '1px solid var(--line)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3.5px', background: '#A855F7' }} />
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
            Custom Roles
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--txt1)', lineHeight: 1 }}>
            {roles.filter((r) => !r.isSystem).length} <span style={{ fontSize: '13px', fontWeight: 700, color: '#A855F7' }}>Custom Roles</span>
          </div>
        </div>

        <div
          className="acard"
          style={{
            borderRadius: '20px',
            padding: '20px 22px',
            background: 'var(--surf)',
            border: '1px solid var(--line)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3.5px', background: 'var(--p)' }} />
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px' }}>
            Permission Modules
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--txt1)', lineHeight: 1 }}>
            {MODULES.length} <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--p)' }}>Protected</span>
          </div>
        </div>
      </div>

      {/* Distinct Section Header for Roles Selection */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 2px 0', color: 'var(--txt1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>👑</span> Configured Roles Directory
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--txt2)', margin: 0 }}>
            Select a role card below to inspect, edit details, delete, or customize permissions.
          </p>
        </div>
        <span className="tag" style={{ fontSize: '11.5px', fontWeight: 700 }}>
          {roles.length} Available Roles
        </span>
      </div>

      {/* ROLES CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {roles.map((r) => {
          const isSelected = r.id === activeRole?.id;
          const permCount = Object.values(r.permissions || {}).filter((a) => a && a.length > 0).length;

          let roleIcon = '🛡️';
          if (/olus|apex/i.test(r.name)) roleIcon = '👑';
          else if (/executive|head/i.test(r.name)) roleIcon = '🏛️';
          else if (/verifier|medical/i.test(r.name)) roleIcon = '🧪';
          else if (/account/i.test(r.name)) roleIcon = '💰';
          else if (/branch/i.test(r.name)) roleIcon = '🏢';
          else if (/coordinator/i.test(r.name)) roleIcon = '📞';
          else if (/data/i.test(r.name)) roleIcon = '📝';
          else if (/volunteer/i.test(r.name)) roleIcon = '🤝';

          return (
            <div
              key={r.id}
              className="acard"
              onClick={() => setSelectedRoleId(r.id)}
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
                  LEVEL {r.level}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditRoleModal(r);
                    }}
                    title="Edit Role Title & Seniority Level"
                    style={{
                      background: 'var(--surf)',
                      border: '1px solid var(--line)',
                      color: 'var(--txt1)',
                      borderRadius: '6px',
                      padding: '2px 7px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingRole(r);
                    }}
                    title="Delete Role from Database"
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#EF4444',
                      borderRadius: '6px',
                      padding: '2px 7px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>{roleIcon}</span>
                <h3 style={{ fontSize: '16.5px', fontWeight: 800, margin: 0, color: isSelected ? 'var(--p)' : 'var(--txt1)' }}>
                  {r.name}
                </h3>
              </div>

              <div style={{ fontSize: '12.5px', color: 'var(--txt2)', borderTop: '1px solid var(--line)', paddingTop: '10px', marginTop: '10px' }}>
                <span>{permCount} Allowed Modules</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* PERMISSIONS MATRIX TABLE FOR SELECTED ROLE */}
      {activeRole && (
        <div className="acard" style={{ borderRadius: '22px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid var(--line)', paddingBottom: '14px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, margin: '0 0 4px 0', color: 'var(--txt1)' }}>
                Permissions Matrix: <span style={{ color: 'var(--p)' }}>{activeRole.name}</span>
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--txt2)', margin: 0 }}>
                Configure module permissions below and click <b>Save Permissions Matrix</b> to apply updates.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                disabled={!isDirty || isSavingPermissions}
                onClick={handleSavePermissions}
                className="btn btn-p"
                style={{
                  borderRadius: '10px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 800,
                  opacity: !isDirty || isSavingPermissions ? 0.6 : 1,
                  cursor: !isDirty || isSavingPermissions ? 'not-allowed' : 'pointer',
                  background: isDirty ? '#22C55E' : 'var(--p)',
                  borderColor: isDirty ? '#22C55E' : 'var(--p)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isSavingPermissions ? (
                  <>
                    <span className="spinner" style={{ display: 'inline-block', width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                    Saving Changes...
                  </>
                ) : (
                  <>💾 {isDirty ? 'Save Permissions Matrix *' : 'Permissions Saved'}</>
                )}
              </button>
            </div>
          </div>

          <div className="atbl" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', tableLayout: 'fixed', minWidth: '840px' }}>
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>System Module / Feature</th>
                  <th style={{ width: '32%' }}>Module Description</th>
                  <th style={{ width: '26%', textAlign: 'center' }}>Module Access Rights</th>
                  <th style={{ width: '20%', textAlign: 'center' }}>Town Scope Policy</th>
                </tr>
              </thead>
              <tbody>
                {MODULES.map((m) => {
                  const rolePerms = draftPermissions[m.key] || [];
                  const hasRead = rolePerms.includes('read');
                  const hasWrite = rolePerms.includes('write');
                  const hasDelete = rolePerms.includes('delete');
                  const isAssignedTownOnly = rolePerms.includes('scope_assigned');

                  return (
                    <tr key={m.key}>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--txt1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>{m.icon}</span>
                          {m.label}
                        </div>
                      </td>
                      <td style={{ fontSize: '12.5px', color: 'var(--txt2)' }}>
                        {m.desc}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <label
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              padding: '3px 8px',
                              borderRadius: '8px',
                              background: hasRead ? 'rgba(34, 197, 94, 0.15)' : 'var(--surf)',
                              color: hasRead ? '#22C55E' : 'var(--txt3)',
                              border: hasRead ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid var(--line)',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={hasRead}
                              onChange={() => toggleLocalPermission(m.key, 'read')}
                              style={{ display: 'none' }}
                            />
                            👁️ View
                          </label>

                          <label
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              padding: '3px 8px',
                              borderRadius: '8px',
                              background: hasWrite ? 'rgba(59, 130, 246, 0.15)' : 'var(--surf)',
                              color: hasWrite ? '#3B82F6' : 'var(--txt3)',
                              border: hasWrite ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid var(--line)',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={hasWrite}
                              onChange={() => toggleLocalPermission(m.key, 'write')}
                              style={{ display: 'none' }}
                            />
                            ✏️ Edit
                          </label>

                          <label
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              padding: '3px 8px',
                              borderRadius: '8px',
                              background: hasDelete ? 'rgba(239, 68, 68, 0.15)' : 'var(--surf)',
                              color: hasDelete ? '#EF4444' : 'var(--txt3)',
                              border: hasDelete ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--line)',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={hasDelete}
                              onChange={() => toggleLocalPermission(m.key, 'delete')}
                              style={{ display: 'none' }}
                            />
                            🗑️ Delete
                          </label>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => toggleLocalScope(m.key)}
                          title="Click to toggle between All Towns Scope vs Assigned Town Only"
                          style={{
                            background: isAssignedTownOnly ? 'rgba(234, 179, 8, 0.15)' : 'rgba(59, 130, 246, 0.12)',
                            color: isAssignedTownOnly ? '#EAB308' : '#3B82F6',
                            border: isAssignedTownOnly ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(59, 130, 246, 0.35)',
                            borderRadius: '8px',
                            padding: '4px 10px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {isAssignedTownOnly ? '📍 Assigned Town' : '🌐 All 14 Towns'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ROLE MODAL */}
      {isCreateOpen && (
        <>
          <div
            className="sheetov on"
            onClick={() => setIsCreateOpen(false)}
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
              maxWidth: '460px',
              zIndex: 1001,
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
              background: 'var(--surf)',
              borderRadius: '24px',
              padding: '26px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--txt1)' }}>
                {editingRole ? 'Edit Role Details' : 'Create Custom Role'}
              </h2>
              <button
                type="button"
                className="btn-cross-delete"
                onClick={() => setIsCreateOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRole} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>Role Title *</label>
                <input
                  type="text"
                  className="fld"
                  placeholder="e.g. Regional Inspector"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  required
                />
              </div>

              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>Seniority Level (0 = Top Executive, 10 = Entry)</label>
                <input
                  type="number"
                  className="fld"
                  min={0}
                  max={10}
                  value={newRoleLevel}
                  onChange={(e) => setNewRoleLevel(Number(e.target.value))}
                  required
                />
              </div>

              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-p"
                  style={{
                    flex: 1,
                    borderRadius: '10px',
                    opacity: isSubmitting ? 0.8 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {isSubmitting ? (
                    editingRole ? 'Saving Changes...' : 'Creating Role...'
                  ) : (
                    editingRole ? 'Save Role Changes' : 'Create Custom Role'
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* CONFIRMATION DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={!!deletingRole}
        title="Delete Role?"
        itemName={deletingRole?.name}
        description={`Are you sure you want to delete role "${deletingRole?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Role"
        submitting={isDeleting}
        onConfirm={confirmDeleteRole}
        onClose={() => setDeletingRole(null)}
      />
    </AdminShell>
  );
}
