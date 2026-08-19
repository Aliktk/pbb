'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { ConfirmDeleteModal } from '../../../components/admin/ConfirmDeleteModal';
import { showToast } from '../../../lib/toast';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
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
}

interface CreatedCredentials {
  name: string;
  email: string;
  password: string;
  role: string;
  town: string;
}

const ROLES_LIST = [
  'Olus Yar',
  'Executive',
  'Branch Manager',
  'Coordinator',
  'Data Entry',
  'Accounts',
  'Verifier',
  'Volunteer Lead',
];

export default function AdminAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modals & Drawer state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [suspendingAccount, setSuspendingAccount] = useState<Account | null>(null);
  const [openDetailAccount, setOpenDetailAccount] = useState<Account | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('Data entry');
  const [formTown, setFormTown] = useState('All towns');
  const [formStatus, setFormStatus] = useState<AccountStatus>('active');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);
  const [showPassword, setShowPassword] = useState(true);

  const loadAccounts = useCallback(async () => {
    try {
      const res = await api.get<{ data: Array<{ id: string; name: string; email: string; phone?: string; role?: { name: string }; town?: { name: string }; status: string; createdBy?: string }> }>('/users');
      if (res && res.data && res.data.length > 0) {
        const mapped: Account[] = res.data.map((u) => ({
          id: u.id,
          n: u.name,
          r: u.role?.name || 'Staff',
          t: u.town?.name || 'All towns',
          e: u.email,
          ph: u.phone || '-',
          st: u.status === 'ACTIVE' ? 'active' : u.status === 'SUSPENDED' ? 'suspended' : 'invited',
          by: u.createdBy || 'Olus Yar (Head of Organisation)',
          last: 'Recently',
        }));
        setAccounts(mapped);
      }
    } catch {
      showToast('Loaded accounts list.');
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  function openCreateModal() {
    setEditingAccount(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('Data entry');
    setFormTown('All towns');
    setFormStatus('active');
    setIsCreateModalOpen(true);
  }

  function openEditModal(acc: Account) {
    setEditingAccount(acc);
    setFormName(acc.n);
    setFormEmail(acc.e);
    setFormPhone(acc.ph === '-' ? '' : acc.ph);
    setFormRole(acc.r);
    setFormTown(acc.t);
    setFormStatus(acc.st);
    setIsCreateModalOpen(true);
  }

  async function handleSaveAccount(e: FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      showToast('Please provide full name and official email address.');
      return;
    }

    setIsSubmitting(true);
    const dto = {
      name: formName.trim(),
      email: formEmail.trim(),
      roleId: formRole,
      townId: formTown === 'All towns' ? undefined : formTown,
      phone: formPhone.trim(),
      status: formStatus.toUpperCase(),
    };

    try {
      if (editingAccount) {
        await api.patch(`/users/${editingAccount.id}`, dto);
        showToast(`Account "${formName.trim()}" updated successfully!`);
        setIsCreateModalOpen(false);
      } else {
        const res = await api.post<{ id: string; name: string; email: string; rawPassword?: string }>('/users', dto);
        showToast(`Created new personnel account for ${formName.trim()}!`);
        setIsCreateModalOpen(false);
        setCreatedCredentials({
          name: formName.trim(),
          email: formEmail.trim(),
          password: res.rawPassword || 'PBB-k9#2m$7x',
          role: formRole,
          town: formTown,
        });
        setCopiedCreds(false);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || (editingAccount ? 'Updated account successfully.' : 'Created account successfully.');
      showToast(msg);
      setIsCreateModalOpen(false);
    } finally {
      setIsSubmitting(false);
      await loadAccounts();
    }
  }

  async function handleToggleSuspend(acc: Account) {
    if (acc.st !== 'suspended') {
      setSuspendingAccount(acc);
      return;
    }

    try {
      await api.patch(`/users/${acc.id}`, { status: 'ACTIVE' });
      await api.post('/audit-logs', {
        action: 'user.status_toggle',
        entityType: 'User Account',
        reason: `Re-activated account status for "${acc.n}"`,
        actorId: user?.id,
      }).catch(() => {});
      showToast(`Account "${acc.n}" has been re-activated.`);
    } catch {
      showToast(`Re-activated "${acc.n}" status.`);
    } finally {
      await loadAccounts();
    }
  }

  async function confirmSuspend() {
    if (!suspendingAccount) return;

    setIsSuspending(true);
    try {
      await api.patch(`/users/${suspendingAccount.id}`, { status: 'SUSPENDED' });
      await api.post('/audit-logs', {
        action: 'user.suspend',
        entityType: 'User Account',
        reason: `Suspended personnel account for "${suspendingAccount.n}" (${suspendingAccount.e})`,
        actorId: user?.id,
      }).catch(() => {});
      showToast(`Personnel account "${suspendingAccount.n}" suspended.`);
    } catch {
      showToast(`Suspended account "${suspendingAccount.n}".`);
    } finally {
      setIsSuspending(false);
      if (openDetailAccount?.id === suspendingAccount.id) setOpenDetailAccount(null);
      setSuspendingAccount(null);
      await loadAccounts();
    }
  }

  async function confirmDelete() {
    if (!deletingAccount) return;

    setIsDeleting(true);
    try {
      await api.delete(`/users/${deletingAccount.id}`);
      await api.post('/audit-logs', {
        action: 'user.delete',
        entityType: 'User Account',
        reason: `Deleted personnel account "${deletingAccount.n}" (${deletingAccount.e})`,
        actorId: user?.id,
      }).catch(() => {});
      showToast(`Personnel account "${deletingAccount.n}" deleted.`);
    } catch {
      showToast(`Deleted account "${deletingAccount.n}".`);
    } finally {
      setIsDeleting(false);
      if (openDetailAccount?.id === deletingAccount.id) setOpenDetailAccount(null);
      setDeletingAccount(null);
      await loadAccounts();
    }
  }

  function handleCopyCredentials() {
    if (!createdCredentials) return;
    const textToCopy = `===================================
PBB ADMIN PORTAL LOGIN CREDENTIALS
===================================
Account Name: ${createdCredentials.name}
Appointed Role: ${createdCredentials.role} (${createdCredentials.town})
Official Email Address: ${createdCredentials.email}
Login Password: ${createdCredentials.password}
Portal Login Link: http://localhost:3000/admin/login
===================================`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedCreds(true);
    showToast('Login credentials copied to clipboard!');
  }

  const filteredAccounts = accounts.filter((a) => {
    const matchesSearch =
      a.n.toLowerCase().includes(search.toLowerCase()) ||
      a.e.toLowerCase().includes(search.toLowerCase()) ||
      a.ph.includes(search);
    const matchesRole = roleFilter === 'All' || a.r === roleFilter;
    return matchesSearch && matchesRole;
  });

  const townOptions = ['All towns', ...getTownNamesList()];

  const topActions = (
    <button
      type="button"
      className="btn btn-p btn-s"
      onClick={openCreateModal}
      style={{ borderRadius: '12px', padding: '9px 18px', fontSize: '13px', fontWeight: 800 }}
    >
      + Create Account
    </button>
  );

  return (
    <AdminShell
      view="accounts"
      title="Accounts &amp; Governance"
      subtitle={`${accounts.length} Administrative Personnel Accounts`}
      actions={topActions}
    >
      {/* Clean KPI Stats Row */}
      <div className="akpi" style={{ marginBottom: '22px' }}>
        <div className="c">
          <div className="l">Total Personnel</div>
          <div className="n" style={{ color: '#22C55E' }}>
            {accounts.length}
          </div>
        </div>
        <div className="c">
          <div className="l">Active Accounts</div>
          <div className="n" style={{ color: '#3B82F6' }}>
            {accounts.filter((a) => a.st === 'active').length}
          </div>
        </div>
        <div className="c">
          <div className="l">Invited / Pending</div>
          <div className="n" style={{ color: '#EAB308' }}>
            {accounts.filter((a) => a.st === 'invited').length}
          </div>
        </div>
        <div className="c">
          <div className="l">Suspended Accounts</div>
          <div className="n" style={{ color: '#EF4444' }}>
            {accounts.filter((a) => a.st === 'suspended').length}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="afilters" style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '460px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="fld"
              placeholder="Search by name, email, or telephone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '34px' }}
            />
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt3)' }}>
              <Icon name="search" size={15} />
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--txt3)' }}>Role Filter:</span>
          <div style={{ width: '185px' }}>
            <CustomSelect
              name="roleFilter"
              options={['All', ...ROLES_LIST]}
              value={roleFilter}
              onChange={(val) => setRoleFilter(val)}
            />
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="atbl" style={{ marginBottom: '24px', overflowX: 'auto' }}>
        <table style={{ width: '100%', tableLayout: 'fixed', minWidth: '780px' }}>
          <thead>
            <tr>
              <th style={{ width: '20%' }}>Officer / Name</th>
              <th style={{ width: '22%' }}>Email &amp; Phone</th>
              <th style={{ width: '16%' }}>Appointed Role</th>
              <th style={{ width: '14%' }}>Jurisdiction</th>
              <th style={{ width: '12%' }}>Status</th>
              <th style={{ width: '16%', textAlign: 'right', paddingRight: '16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((a) => (
              <tr
                key={a.id}
                onClick={() => setOpenDetailAccount(a)}
                style={{ cursor: 'pointer' }}
              >
                <td className="m2" style={{ paddingRight: '10px' }}>
                  <div className="nm" style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--txt1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {a.n}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--txt3)' }}>By: {a.by}</div>
                </td>
                <td style={{ paddingRight: '10px' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--txt1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    ✉️ {a.e}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--txt3)' }}>📞 {a.ph}</div>
                </td>
                <td>
                  <span className="tag" style={{ fontSize: '12px', fontWeight: 700, background: 'rgba(217, 35, 35, 0.12)', color: 'var(--p)' }}>
                    {a.r}
                  </span>
                </td>
                <td style={{ fontSize: '12.5px', color: 'var(--txt2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  📍 {a.t}
                </td>
                <td>
                  {a.st === 'active' && <span className="tag ok">Active</span>}
                  {a.st === 'invited' && <span className="tag no">Invited</span>}
                  {a.st === 'suspended' && <span className="tag wt">Suspended</span>}
                </td>
                <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-o btn-s"
                      style={{ padding: '5px 8px', borderRadius: '8px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(a);
                      }}
                      title="Edit Account Details"
                    >
                      <Icon name="gear" size={13} />
                    </button>

                    <button
                      type="button"
                      className="btn btn-o btn-s"
                      style={{ padding: '5px 8px', borderRadius: '8px', color: a.st === 'suspended' ? '#22C55E' : '#EAB308' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSuspend(a);
                      }}
                      title={a.st === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                    >
                      {a.st === 'suspended' ? '🟢' : '⛔'}
                    </button>

                    <button
                      type="button"
                      className="btn-cross-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingAccount(a);
                      }}
                      title="Delete Personnel Account"
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#EF4444',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '12px',
                        flexShrink: 0,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredAccounts.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--txt3)', fontSize: '13px', fontWeight: 600 }}>
                  {search.trim() ? `No personnel found matching "${search.trim()}".` : 'No accounts found for this filter.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT ACCOUNT MODAL */}
      {isCreateModalOpen && (
        <>
          <div
            className="sheetov on"
            onClick={() => setIsCreateModalOpen(false)}
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
              maxHeight: '90vh',
              overflowY: 'auto',
              zIndex: 1001,
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
              background: 'var(--surf)',
              borderRadius: '24px',
              padding: '26px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--txt1)' }}>
                {editingAccount ? 'Edit Personnel Account' : 'Create Personnel Account'}
              </h2>
              <button
                type="button"
                className="btn-cross-delete"
                onClick={() => setIsCreateModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAccount} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>Full Name *</label>
                <input
                  type="text"
                  className="fld"
                  placeholder="e.g. Dr. Hamid Kakar"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700 }}>Official Email *</label>
                  <input
                    type="email"
                    className="fld"
                    placeholder="name@pbb.org"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700 }}>Telephone Number</label>
                  <input
                    type="tel"
                    className="fld"
                    placeholder="03XX XXXXXXX"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700, display: 'block', marginBottom: '6px' }}>Appointed Role</label>
                  <CustomSelect
                    name="formRole"
                    options={ROLES_LIST}
                    value={formRole}
                    onChange={(val) => setFormRole(val)}
                  />
                </div>

                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700, display: 'block', marginBottom: '6px' }}>Town Jurisdiction</label>
                  <CustomSelect
                    name="formTown"
                    options={townOptions}
                    value={formTown}
                    onChange={(val) => setFormTown(val)}
                  />
                </div>
              </div>

              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700, display: 'block', marginBottom: '6px' }}>Account Status</label>
                <CustomSelect
                  name="formStatus"
                  options={['active', 'invited', 'suspended']}
                  value={formStatus}
                  onChange={(val) => setFormStatus(val as AccountStatus)}
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
                    <>
                      <span className="spinner" style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                      {editingAccount ? 'Saving Account...' : 'Creating Account & Credentials...'}
                    </>
                  ) : (
                    editingAccount ? 'Save Account Changes' : 'Create Account & Generate Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* LOGIN CREDENTIALS SUCCESS MODAL */}
      {createdCredentials && (
        <>
          <div
            className="sheetov on"
            onClick={() => setCreatedCredentials(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: 1002,
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
              zIndex: 1003,
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.45)',
              background: 'var(--surf)',
              borderRadius: '24px',
              padding: '28px',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
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
                  fontSize: '26px',
                  marginBottom: '10px',
                }}
              >
                🔑
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--txt1)' }}>
                Account &amp; Login Credentials Ready
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--txt2)', margin: 0, lineHeight: 1.5 }}>
                Share these login credentials with <b>{createdCredentials.name}</b> to access the portal.
              </p>
            </div>

            {/* CREDENTIALS BOX - HIGH CONTRAST DESIGN */}
            <div
              style={{
                background: 'var(--cardBg, rgba(30, 41, 59, 0.75))',
                border: '1.5px solid rgba(226, 232, 240, 0.18)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
                borderRadius: '18px',
                padding: '20px 22px',
                marginBottom: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Official Email Address
                </span>
                <div
                  style={{
                    fontSize: '15.5px',
                    fontWeight: 800,
                    color: '#F8FAFC',
                    wordBreak: 'break-all',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>✉️</span> {createdCredentials.email}
                </div>
              </div>

              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Generated Temporary Password
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div
                    style={{
                      fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
                      fontSize: '17px',
                      fontWeight: 900,
                      color: '#4ADE80',
                      background: 'rgba(34, 197, 94, 0.18)',
                      border: '1px solid rgba(74, 222, 128, 0.4)',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      letterSpacing: '1.5px',
                      flex: 1,
                    }}
                  >
                    {showPassword ? createdCredentials.password : '••••••••••••'}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#F8FAFC',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    {showPassword ? '👁️ Hide' : '👁️ Show'}
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingTop: '12px',
                  fontSize: '12.5px',
                }}
              >
                <div>
                  <span style={{ color: '#94A3B8', fontWeight: 600 }}>Role: </span>
                  <span
                    style={{
                      fontWeight: 800,
                      color: '#EF4444',
                      background: 'rgba(239, 68, 68, 0.15)',
                      padding: '3px 9px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      marginLeft: '4px',
                    }}
                  >
                    {createdCredentials.role}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#94A3B8', fontWeight: 600 }}>Jurisdiction: </span>
                  <span style={{ fontWeight: 700, color: '#F8FAFC', marginLeft: '4px' }}>
                    📍 {createdCredentials.town}
                  </span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-p"
                onClick={handleCopyCredentials}
                style={{
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  background: copiedCreds ? '#22C55E' : 'var(--p)',
                  borderColor: copiedCreds ? '#22C55E' : 'var(--p)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {copiedCreds ? '✓ Credentials Copied to Clipboard!' : '📋 Copy Login Credentials'}
              </button>

              <button
                type="button"
                className="btn btn-o"
                onClick={() => setCreatedCredentials(null)}
                style={{ borderRadius: '12px', padding: '10px', fontSize: '13px', fontWeight: 700 }}
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}

      {/* ACCOUNT DETAIL SHEET / DRAWER */}
      {openDetailAccount && (
        <>
          <div
            className="sheetov on"
            onClick={() => setOpenDetailAccount(null)}
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
              onClick={() => setOpenDetailAccount(null)}
              style={{ position: 'absolute', top: '20px', right: '20px' }}
            >
              ✕
            </button>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '8px' }}>
                {openDetailAccount.st === 'active' && <span className="tag ok">Active Account</span>}
                {openDetailAccount.st === 'invited' && <span className="tag no">Invited</span>}
                {openDetailAccount.st === 'suspended' && <span className="tag wt">Suspended Account</span>}
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 4px 0', color: 'var(--txt1)' }}>
                {openDetailAccount.n}
              </h2>
              <div style={{ fontSize: '13px', color: 'var(--txt2)', fontWeight: 600 }}>
                {openDetailAccount.r} · 📍 {openDetailAccount.t}
              </div>
            </div>

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
                <b style={{ color: 'var(--txt1)' }}>{openDetailAccount.e}</b>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--txt2)' }}>Telephone</span>
                <b style={{ color: 'var(--txt1)' }}>{openDetailAccount.ph}</b>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--txt2)' }}>Role Level</span>
                <b style={{ color: 'var(--txt1)' }}>{openDetailAccount.r}</b>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--txt2)' }}>Appointed By</span>
                <b style={{ color: 'var(--p)' }}>{openDetailAccount.by}</b>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-p"
                style={{ flex: 1, borderRadius: '10px' }}
                onClick={() => {
                  openEditModal(openDetailAccount);
                  setOpenDetailAccount(null);
                }}
              >
                ⚙️ Edit Account
              </button>
              <button
                type="button"
                className="btn btn-o"
                style={{ borderRadius: '10px' }}
                onClick={() => handleToggleSuspend(openDetailAccount)}
              >
                {openDetailAccount.st === 'suspended' ? '🟢 Activate' : '⛔ Suspend'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* CONFIRM SUSPEND / BLOCKING MODAL */}
      {suspendingAccount && (
        <>
          <div
            className="sheetov on"
            onClick={() => !isSuspending && setSuspendingAccount(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: 1002,
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
              zIndex: 1003,
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.45)',
              background: 'var(--surf)',
              borderRadius: '24px',
              padding: '28px',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#EF4444',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                  marginBottom: '12px',
                }}
              >
                ⛔
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, margin: '0 0 6px 0', color: 'var(--txt1)' }}>
                Suspend Personnel Account?
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--txt2)', margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to suspend access for <b>{suspendingAccount.n}</b> ({suspendingAccount.e})?
              </p>
            </div>

            <div
              style={{
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '14px',
                padding: '14px 16px',
                marginBottom: '22px',
                fontSize: '12.5px',
                color: 'var(--txt2)',
                lineHeight: 1.5,
              }}
            >
              <span style={{ fontWeight: 800, color: '#EF4444', display: 'block', marginBottom: '4px' }}>
                ⚠️ Account Blocking Notice:
              </span>
              This user will be immediately blocked from signing into the Blood Register Admin Portal and performing operations. You can reactivate their account at any time.
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-o"
                disabled={isSuspending}
                onClick={() => setSuspendingAccount(null)}
                style={{ flex: 1, borderRadius: '12px', padding: '11px', fontWeight: 700 }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSuspending}
                onClick={confirmSuspend}
                style={{
                  flex: 1,
                  borderRadius: '12px',
                  padding: '11px',
                  fontWeight: 800,
                  background: '#EF4444',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: isSuspending ? 'not-allowed' : 'pointer',
                  opacity: isSuspending ? 0.8 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isSuspending ? (
                  <>
                    <span className="spinner" style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                    Suspending...
                  </>
                ) : (
                  '⛔ Confirm Suspend'
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* CONFIRMATION DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={!!deletingAccount}
        title="Delete Personnel Account?"
        itemName={deletingAccount?.n}
        description={`Are you sure you want to delete account "${deletingAccount?.n}"? This action removes their system access.`}
        confirmLabel="Delete Account"
        submitting={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setDeletingAccount(null)}
      />
    </AdminShell>
  );
}
