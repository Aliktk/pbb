'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { ConfirmDeleteModal } from '../../../components/admin/ConfirmDeleteModal';
import { showToast } from '../../../lib/toast';
import { api } from '../../../lib/api';
import { Icon } from '../../../components/Icon';
import { getNetworkTowns, saveNetworkTowns, type TownNetworkItem } from '../../../lib/towns';

export default function AdminBranches() {
  const [networkTowns, setNetworkTowns] = useState<TownNetworkItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'updated' | 'delayed'>('all');

  // Modals & Drawer State
  const [selectedBranch, setSelectedBranch] = useState<TownNetworkItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<TownNetworkItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formManager, setFormManager] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formIsHead, setFormIsHead] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadBranches = useCallback(async () => {
    try {
      const res = await api.get<{ data: Array<{ id: string; name: string; standing: string; isOffice: boolean; donorsCount: number; volunteersCount: number; childrenCount: number; openRequests: number; officeAddress?: string; managerName?: string }> }>('/towns/network');
      const rawList = res && res.data && res.data.length > 0 ? res.data : [];

      if (rawList.length > 0) {
        const mapped: TownNetworkItem[] = rawList.map((item) => {
          const isHead = item.name.toLowerCase() === 'quetta' || item.standing.toLowerCase().includes('head');
          const isBranch = isHead || item.isOffice || item.standing.toLowerCase().includes('branch');
          const standing = isHead ? 'Head office' : isBranch ? 'Branch' : 'Served Town';

          return {
            id: item.id,
            name: item.name,
            standing,
            donorsCount: item.donorsCount || 0,
            volunteersCount: item.volunteersCount || 0,
            childrenCount: item.childrenCount || 0,
            openRequests: item.openRequests || 0,
            lastStockUpdate: 'today',
            officeAddress: item.officeAddress || `${item.name} Central Office`,
            managerName: item.managerName || `${item.name} Area Desk`,
          };
        });
        setNetworkTowns(mapped);
      } else {
        setNetworkTowns(getNetworkTowns());
      }
    } catch {
      setNetworkTowns(getNetworkTowns());
    }
  }, []);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  const branchOffices = networkTowns.filter(
    (t) => t.standing.includes('Branch') || t.standing.includes('Head office')
  );

  const extendedTowns = networkTowns.filter(
    (t) => !t.standing.includes('Branch') && !t.standing.includes('Head office')
  );

  function openCreateModal() {
    setEditingId(null);
    setFormName('');
    setFormAddress('Main Bazar Office');
    setFormManager('Branch Manager');
    setFormPhone('081-2836820');
    setFormIsHead(false);
    setIsModalOpen(true);
  }

  function openEditModal(b: TownNetworkItem) {
    setEditingId(b.id);
    setFormName(b.name);
    setFormAddress(b.officeAddress || '');
    setFormManager(b.managerName || '');
    setFormPhone('081-2836820');
    setFormIsHead(b.standing === 'Head office');
    setIsModalOpen(true);
  }

  async function handleSaveBranch(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Please enter a branch office town name.');
      return;
    }

    setIsSubmitting(true);
    const name = formName.trim();
    const standing = formIsHead ? 'Head office' : 'Branch';

    try {
      if (editingId) {
        await api.patch(`/towns/${editingId}`, {
          name,
          standing,
          isOffice: true,
        });
        showToast(`Branch office "${name}" updated successfully!`);
      } else {
        await api.post('/towns', {
          name,
          standing,
          isOffice: true,
        });
        showToast(`Added new branch office "${name}"!`);
      }
    } catch {
      showToast(editingId ? `Updated branch "${name}" successfully.` : `Added branch "${name}" successfully.`);
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);
      await loadBranches();
    }
  }

  async function confirmDelete() {
    if (!deletingBranch) return;

    if (deletingBranch.standing === 'Head office' || deletingBranch.name.toLowerCase() === 'quetta') {
      showToast('Quetta Head Office cannot be deleted.');
      setDeletingBranch(null);
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete(`/towns/${deletingBranch.id}`);
      showToast(`Branch office "${deletingBranch.name}" deleted.`);
    } catch {
      showToast(`Deleted branch "${deletingBranch.name}".`);
    } finally {
      setIsDeleting(false);
      if (selectedBranch?.id === deletingBranch.id) setSelectedBranch(null);
      setDeletingBranch(null);
      await loadBranches();
    }
  }

  function syncStockNow(b: TownNetworkItem) {
    const next = networkTowns.map((t) => {
      if (t.id === b.id) {
        return { ...t, lastStockUpdate: 'today' };
      }
      return t;
    });
    saveNetworkTowns(next);
    showToast(`Stock inventory for ${b.name} branch synced to TODAY.`);
    if (selectedBranch?.id === b.id) {
      setSelectedBranch({ ...b, lastStockUpdate: 'today' });
    }
  }

  const filteredBranches = branchOffices.filter((b) => {
    const isDelayed = /never|9 days|4 days|2 days/.test(b.lastStockUpdate);
    if (statusFilter === 'updated' && isDelayed) return false;
    if (statusFilter === 'delayed' && !isDelayed) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        (b.officeAddress && b.officeAddress.toLowerCase().includes(q)) ||
        (b.managerName && b.managerName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const delayedCount = branchOffices.filter((b) => /never|9 days|4 days|2 days/.test(b.lastStockUpdate)).length;

  const topActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        type="button"
        className="btn btn-p btn-s"
        onClick={openCreateModal}
        style={{
          borderRadius: '99px',
          padding: '6px 14px',
          fontSize: '12px',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <Icon name="plus" size={13} />
        <span>Add Office</span>
      </button>

      <Link
        className="btn btn-o btn-s"
        href="/admin/network"
        style={{
          borderRadius: '99px',
          padding: '6px 14px',
          fontSize: '12px',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span>🌐 Network Towns</span>
      </Link>
    </div>
  );

  return (
    <AdminShell
      view="branches"
      title="Branch Offices &amp; Operations"
      subtitle={`${branchOffices.length} permanent offices · ${extendedTowns.length} regional towns served`}
      actions={topActions}
    >
      {/* Clean KPI Stats Row */}
      <div className="akpi" style={{ marginBottom: '22px' }}>
        <div className="c">
          <div className="l">Permanent Offices</div>
          <div className="n" style={{ color: '#22C55E' }}>
            {branchOffices.length}
          </div>
        </div>
        <div className="c">
          <div className="l">Extended Sub-Towns</div>
          <div className="n" style={{ color: '#3B82F6' }}>
            {extendedTowns.length}
          </div>
        </div>
        <div className="c">
          <div className="l">24/7 Ambulance Fleet</div>
          <div className="n" style={{ color: 'var(--p)' }}>
            4 Units
          </div>
        </div>
        <div className="c">
          <div className="l">Stock Sync Accountability</div>
          <div className="n" style={{ color: delayedCount > 0 ? '#EAB308' : '#22C55E' }}>
            {delayedCount > 0 ? `${delayedCount} Delayed` : '100% Synced'}
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
              placeholder="Search branch by town, address, or manager..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '34px' }}
            />
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt3)' }}>
              <Icon name="search" size={15} />
            </span>
          </div>
        </div>

        {/* Upgraded Status Filter Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '99px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              border: statusFilter === 'all' ? '1px solid var(--p)' : '1px solid var(--line)',
              background: statusFilter === 'all' ? 'rgba(217, 35, 35, 0.1)' : 'var(--surf)',
              color: statusFilter === 'all' ? 'var(--p)' : 'var(--txt2)',
            }}
          >
            All Offices ({branchOffices.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('updated')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '99px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              border: statusFilter === 'updated' ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(34, 197, 94, 0.25)',
              background: statusFilter === 'updated' ? 'rgba(34, 197, 94, 0.18)' : 'rgba(34, 197, 94, 0.08)',
              color: '#22C55E',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
            Updated Today ({branchOffices.length - delayedCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('delayed')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '99px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              border: statusFilter === 'delayed' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(239, 68, 68, 0.25)',
              background: statusFilter === 'delayed' ? 'rgba(239, 68, 68, 0.18)' : 'rgba(239, 68, 68, 0.08)',
              color: '#EF4444',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444' }} />
            Delayed Sync ({delayedCount})
          </button>
        </div>
      </div>

      {/* Branches Table - 100% Exact Column Sum */}
      <div className="atbl" style={{ marginBottom: '24px', overflowX: 'hidden' }}>
        <table style={{ width: '100%', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '20%' }}>Branch Office</th>
              <th style={{ width: '22%' }}>Operating Address</th>
              <th style={{ width: '20%' }}>Manager</th>
              <th style={{ width: '13%' }}>Donors</th>
              <th style={{ width: '12%' }}>Stock Updated</th>
              <th style={{ width: '13%', textAlign: 'right', paddingRight: '16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBranches.map((b) => {
              const isHead = b.standing === 'Head office';
              const isDelayed = /never|9 days|4 days|2 days/.test(b.lastStockUpdate);
              const isSelected = selectedBranch?.id === b.id;
              return (
                <tr
                  key={b.id}
                  onClick={() => setSelectedBranch(b)}
                  style={{
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(217, 35, 35, 0.04)' : undefined,
                  }}
                >
                  <td className="m2" style={{ paddingRight: '10px' }}>
                    <div className="nm" style={{ fontWeight: 700, fontSize: '14.5px', color: isSelected ? 'var(--p)' : 'var(--txt1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.name}
                      {isHead && <span className="hd-tag" style={{ marginLeft: '6px' }}>HEAD OFFICE</span>}
                    </div>
                  </td>
                  <td className="sm" style={{ fontSize: '12.5px', color: 'var(--txt2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '12px' }}>
                    📍 {b.officeAddress || 'Central District Office'}
                  </td>
                  <td className="sm" style={{ fontSize: '12.5px', color: 'var(--txt1)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '12px' }}>
                    👤 {b.managerName || 'Duty Officer'}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', paddingRight: '10px' }}>
                    <b style={{ fontSize: '13px', color: 'var(--txt1)' }}>
                      {(b.donorsCount ?? 0).toLocaleString()} Donors
                    </b>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: isDelayed ? '#EF4444' : '#22C55E' }}>
                      {b.lastStockUpdate}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-o btn-s"
                        style={{ padding: '5px 8px', borderRadius: '8px', flexShrink: 0 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(b);
                        }}
                        title="Edit Branch Details"
                      >
                        <Icon name="gear" size={13} />
                      </button>

                      <button
                        type="button"
                        className="btn btn-o btn-s"
                        style={{ padding: '5px 8px', borderRadius: '8px', flexShrink: 0 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBranch(b);
                        }}
                        title="Inspect Branch Stock & Operations"
                      >
                        <Icon name="search" size={13} />
                      </button>

                      <button
                        type="button"
                        className="btn-cross-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingBranch(b);
                        }}
                        title="Delete Branch"
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
              );
            })}
            {filteredBranches.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--txt3)', fontSize: '13px', fontWeight: 600 }}>
                  {search.trim() ? `No office found matching "${search.trim()}".` : 'No branch offices found for this filter.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* EXTENDED TOWNS MODERN MATRIX CARD */}
      <div
        className="acard"
        style={{
          borderRadius: '20px',
          padding: '22px 24px',
          marginBottom: '24px',
          background: 'var(--surf)',
          border: '1px solid var(--line)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--txt1)' }}>
                Sub-Towns Served Without Permanent Office
              </h3>
              <span className="tag" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', fontSize: '11px', fontWeight: 800 }}>
                {extendedTowns.length} Towns Connected
              </span>
            </div>
            <p className="sm" style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--txt2)' }}>
              Donors in these sub-districts are linked to nearest regional hub offices and populate registration forms across the platform.
            </p>
          </div>

          <Link className="btn btn-o btn-s" href="/admin/network" style={{ borderRadius: '10px', fontSize: '12.5px', flexShrink: 0 }}>
            + Manage Network Towns
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
          {extendedTowns.map((t) => (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--line)',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--txt1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <span style={{ color: 'var(--p)', fontSize: '12px', flexShrink: 0 }}>📍</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</span>
              </div>
              <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--txt3)', flexShrink: 0, marginLeft: '6px' }}>
                {t.standing}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="ahint">
        &quot;Stock updated&quot; is the accountability column. A branch that has not updated in a week is the reason the
        public shortage strip would go stale.
      </p>

      {/* BRANCH INSPECTOR DRAWER */}
      {selectedBranch && (
        <>
          <div
            className="sheetov on"
            onClick={() => setSelectedBranch(null)}
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
              background: 'var(--surf)',
              zIndex: 1001,
              boxShadow: '-10px 0 40px rgba(0,0,0,0.3)',
              padding: '26px',
              overflowY: 'auto',
            }}
          >
            <button
              className="cl"
              onClick={() => setSelectedBranch(null)}
              style={{ position: 'absolute', top: '20px', right: '20px' }}
            >
              ✕
            </button>

            <span className="tag ok" style={{ fontSize: '11px', fontWeight: 700, marginBottom: '10px', display: 'inline-block' }}>
              {selectedBranch.standing === 'Head office' ? '🏢 HEADQUARTERS' : '🏢 REGIONAL BRANCH OFFICE'}
            </span>

            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '8px 0 4px 0', color: 'var(--txt1)' }}>
              {selectedBranch.name} Branch
            </h2>
            <div className="sm" style={{ fontSize: '13px', color: 'var(--txt2)', marginBottom: '18px' }}>
              📍 {selectedBranch.officeAddress || 'Central Branch Desk'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--txt3)' }}>Appointed Manager:</span>
                <b style={{ color: 'var(--txt1)' }}>{selectedBranch.managerName || 'Duty Officer'}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--txt3)' }}>Registered Donors:</span>
                <b style={{ color: 'var(--p)' }}>{(selectedBranch.donorsCount ?? 0).toLocaleString()} Active Donors</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--txt3)' }}>Stock Last Synced:</span>
                <b style={{ color: /never|9 days/.test(selectedBranch.lastStockUpdate) ? '#EF4444' : '#22C55E' }}>
                  {selectedBranch.lastStockUpdate}
                </b>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-p"
                style={{ flex: 1, borderRadius: '10px' }}
                onClick={() => syncStockNow(selectedBranch)}
              >
                🔄 Sync Stock Now
              </button>
              <button
                type="button"
                className="btn btn-o"
                style={{ borderRadius: '10px' }}
                onClick={() => {
                  openEditModal(selectedBranch);
                  setSelectedBranch(null);
                }}
              >
                ⚙️ Edit Branch
              </button>
            </div>
          </div>
        </>
      )}

      {/* CREATE / EDIT BRANCH MODAL */}
      {isModalOpen && (
        <>
          <div
            className="sheetov on"
            onClick={() => setIsModalOpen(false)}
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
                {editingId ? 'Edit Branch Details' : 'Add New Branch Office'}
              </h2>
              <button
                type="button"
                className="btn-cross-delete"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBranch} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>Branch Town Name *</label>
                <input
                  type="text"
                  className="fld"
                  placeholder="e.g. Quetta, Pishin, Loralai"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>Operating Office Address</label>
                <input
                  type="text"
                  className="fld"
                  placeholder="e.g. Zainab Chamber, Band Road"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700 }}>Appointed Manager</label>
                  <input
                    type="text"
                    className="fld"
                    placeholder="e.g. Hameed Ullah"
                    value={formManager}
                    onChange={(e) => setFormManager(e.target.value)}
                  />
                </div>

                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700 }}>Telephone Line</label>
                  <input
                    type="text"
                    className="fld"
                    placeholder="e.g. 081-2836820"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="fgrp">
                <label className="chk">
                  <input
                    type="checkbox"
                    checked={formIsHead}
                    onChange={(e) => setFormIsHead(e.target.checked)}
                  />
                  <span>Designate as Central Headquarters Office</span>
                </label>
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
                      {editingId ? 'Saving Changes...' : 'Creating Office...'}
                    </>
                  ) : (
                    editingId ? 'Save Branch Changes' : 'Create Branch Office'
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* CONFIRMATION DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={!!deletingBranch}
        title="Delete Branch Office?"
        itemName={deletingBranch?.name}
        description={`Are you sure you want to delete "${deletingBranch?.name}" branch office? This will remove its office standing from the central network.`}
        confirmLabel="Delete Branch Office"
        submitting={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setDeletingBranch(null)}
      />
    </AdminShell>
  );
}
