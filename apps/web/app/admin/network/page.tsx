'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { useAuth } from '../../../lib/auth';
import { Icon } from '../../../components/Icon';
import { CustomSelect } from '../../../components/CustomSelect';
import { TownSheet } from '../../../components/admin/TownSheet';
import { ConfirmDeleteModal } from '../../../components/admin/ConfirmDeleteModal';
import {
  fetchNetworkTowns,
  createTown,
  updateTown,
  type TownNetworkItem,
} from '../../../lib/towns';

export default function AdminNetwork() {
  const { user } = useAuth();
  // Office scoping: head office (role 'head', no town pin) manages every town; any other office
  // user sees only their own town. Presentation only - the DB (RLS + the 0013 trigger) enforces.
  const isHead = user?.role.id === 'head';
  const myTownId = user?.townId ?? null;

  const [towns, setTowns] = useState<TownNetworkItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTown, setSelectedTown] = useState<TownNetworkItem | null>(null);
  const [search, setSearch] = useState('');
  const [standingFilter, setStandingFilter] = useState<'all' | 'branches' | 'served'>('all');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TownNetworkItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<TownNetworkItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formStanding, setFormStanding] = useState('Branch');
  const [formAddress, setFormAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadNetworkData = useCallback(async () => {
    setError(null);
    try {
      const all = await fetchNetworkTowns();
      // Office scoping: head office sees the whole network; a branch user sees only their own town.
      const scoped = isHead || !myTownId ? all : all.filter((t) => t.id === myTownId);
      setTowns(isHead ? all : scoped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the town network.');
      setTowns([]);
    }
  }, [isHead, myTownId]);

  useEffect(() => {
    loadNetworkData();
  }, [loadNetworkData]);

  function openCreateModal() {
    setEditingItem(null);
    setFormName('');
    setFormStanding('Branch');
    setFormAddress('');
    setIsModalOpen(true);
  }

  function openEditModal(item: TownNetworkItem) {
    setEditingItem(item);
    setFormName(item.name);
    setFormStanding(item.standing);
    setFormAddress(item.officeAddress || '');
    setIsModalOpen(true);
  }

  async function confirmDelete() {
    if (!deletingItem) return;
    // Town deletion is a destructive, org-structural action that also cascades to donors/requests;
    // it is not exposed through the public PostgREST surface (no towns DELETE grant/policy). Rather
    // than pretend it worked, tell the operator where it belongs.
    showToast('Removing a town is a head-office data operation and is not available from this page.');
    setDeletingItem(null);
  }

  async function handleSaveTown(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Please enter a town name.');
      return;
    }

    const name = formName.trim();
    const isOffice = formStanding.includes('Branch') || formStanding.includes('Head office');
    const address = formAddress.trim() || null;
    setIsSaving(true);

    try {
      if (editingItem) {
        // Only send columns that actually changed. name/is_office are head-only (0013 trigger);
        // address is editable by head (any town) or a manager (own town) via the 0006 grant.
        const patch: { name?: string; isOffice?: boolean; address?: string | null } = {};
        if (name !== editingItem.name) patch.name = name;
        if (isOffice !== Boolean(editingItem.isOffice)) patch.isOffice = isOffice;
        if (address !== (editingItem.officeAddress ?? null)) patch.address = address;
        await updateTown(editingItem.id, patch);
        showToast(`Updated details for town "${name}".`);
      } else {
        await createTown({ name, isOffice });
        showToast(`Added new town "${name}" to the PBB network.`);
      }
      setIsModalOpen(false);
      await loadNetworkData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save the town.');
    } finally {
      setIsSaving(false);
    }
  }

  const filteredTowns = towns.filter((t) => {
    const isBranch = t.standing.includes('Branch') || t.standing.includes('Head office');
    if (standingFilter === 'branches' && !isBranch) return false;
    if (standingFilter === 'served' && isBranch) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.standing.toLowerCase().includes(q) ||
        (t.officeAddress && t.officeAddress.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const branchOfficesCount = towns.filter((t) => t.standing.includes('Branch') || t.standing.includes('Head office')).length;

  const standingOptions = [
    { value: 'Head office', label: 'Head office (Central Hub)' },
    { value: 'Branch', label: 'Permanent Branch Office' },
    { value: 'Served from Quetta', label: 'Served from Quetta' },
    { value: 'Served from Pishin', label: 'Served from Pishin' },
    { value: 'Served from Loralai', label: 'Served from Loralai' },
    { value: 'Served from Zhob', label: 'Served from Zhob' },
    { value: 'Served from Chaman', label: 'Served from Chaman' },
    { value: 'Served from Muslim Bagh', label: 'Served from Muslim Bagh' },
  ];

  // Adding / renaming towns is head office only (RLS + the 0013 trigger). Hide the control otherwise.
  const topActions = isHead ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button type="button" className="btn btn-p btn-s" onClick={openCreateModal}>
        <Icon name="plus" size={14} />
        <span style={{ marginLeft: '4px' }}>+ Add a Town</span>
      </button>
    </div>
  ) : null;

  return (
    <AdminShell
      view="network"
      title="The Network &amp; Towns"
      subtitle={isHead ? `${towns.length} towns covered across Pashtoonkhwa` : 'Your office'}
      actions={topActions}
    >
      {error && (
        <div
          className="acard"
          style={{
            marginBottom: '18px',
            padding: '14px 18px',
            borderRadius: '14px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#EF4444',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {/* KPI Stats Row */}
      <div className="akpi" style={{ marginBottom: '20px' }}>
        <div className="c">
          <div className="l">Towns Covered</div>
          <div className="n" style={{ color: 'var(--p)' }}>
            {towns.length}
          </div>
        </div>
        <div className="c">
          <div className="l">Permanent Offices</div>
          <div className="n" style={{ color: '#22C55E' }}>
            {branchOfficesCount}
          </div>
        </div>
        <div className="c">
          <div className="l">Served Towns</div>
          <div className="n" style={{ color: '#3B82F6' }}>
            {towns.length - branchOfficesCount}
          </div>
        </div>
        <div className="c">
          <div className="l">Head Office</div>
          <div className="n" style={{ color: '#F87171' }}>
            {towns.some((t) => t.standing === 'Head office') ? 'Quetta' : '-'}
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
              placeholder="Search towns by name, address, or standing..."
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
            onClick={() => setStandingFilter('all')}
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
              border: standingFilter === 'all' ? '1px solid var(--p)' : '1px solid var(--line)',
              background: standingFilter === 'all' ? 'rgba(217, 35, 35, 0.1)' : 'var(--surf)',
              color: standingFilter === 'all' ? 'var(--p)' : 'var(--txt2)',
            }}
          >
            All ({towns.length})
          </button>

          <button
            type="button"
            onClick={() => setStandingFilter('branches')}
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
              border: standingFilter === 'branches' ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(34, 197, 94, 0.25)',
              background: standingFilter === 'branches' ? 'rgba(34, 197, 94, 0.18)' : 'rgba(34, 197, 94, 0.08)',
              color: '#22C55E',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
            Offices ({branchOfficesCount})
          </button>

          <button
            type="button"
            onClick={() => setStandingFilter('served')}
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
              border: standingFilter === 'served' ? '1px solid rgba(148, 163, 184, 0.5)' : '1px solid rgba(148, 163, 184, 0.25)',
              background: standingFilter === 'served' ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.08)',
              color: '#94A3B8',
            }}
          >
            Sub-towns ({towns.length - branchOfficesCount})
          </button>
        </div>
      </div>

      {/* Network Table */}
      <div className="atbl" style={{ marginBottom: '24px', overflowX: 'hidden' }}>
        <table style={{ width: '100%', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Town &amp; Office Location</th>
              <th style={{ width: '21%' }}>Standing &amp; Manager</th>
              <th style={{ width: '10%' }}>Donors</th>
              <th style={{ width: '14%' }}>Open Requests</th>
              <th style={{ width: '12%' }}>Stock Updated</th>
              <th style={{ width: '18%', textAlign: 'right', paddingRight: '16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTowns.map((t) => {
              const isBranch = t.standing.includes('Branch') || t.standing.includes('Head office');
              return (
                <tr key={t.id} onClick={() => setSelectedTown(t)} style={{ cursor: 'pointer' }}>
                  <td className="m2" style={{ paddingRight: '10px' }}>
                    <div className="nm" style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--txt1)' }}>
                      {t.name}
                    </div>
                    <div className="sm" style={{ fontSize: '11.5px', color: 'var(--txt3)', marginTop: '2px' }}>
                      📍 {t.officeAddress || (isBranch ? 'Branch Office' : 'Regional Dispatch')}
                    </div>
                  </td>

                  <td>
                    <div>
                      <span
                        className="tag"
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          background: t.standing === 'Head office' ? 'rgba(217,35,35,0.15)' : isBranch ? 'rgba(34,197,94,0.12)' : 'rgba(148,163,184,0.1)',
                          color: t.standing === 'Head office' ? 'var(--p)' : isBranch ? '#22C55E' : '#94A3B8',
                        }}
                      >
                        {t.standing}
                      </span>
                      {t.managerName && (
                        <div style={{ fontSize: '11px', color: 'var(--txt2)', marginTop: '2px' }}>
                          👤 {t.managerName}
                        </div>
                      )}
                    </div>
                  </td>

                  <td>
                    <span className="sm" style={{ fontSize: '12px', color: 'var(--txt3)' }} title="Open the town to see its donors">—</span>
                  </td>

                  <td>
                    <span className="sm" style={{ fontSize: '12px', color: 'var(--txt3)' }} title="Open the town to see its blood requests">—</span>
                  </td>

                  <td style={{ fontSize: '12px', fontWeight: 600, color: 'var(--txt3)' }}>
                    {t.lastStockUpdate}
                  </td>

                  <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-o btn-s"
                        style={{ padding: '5px 8px', borderRadius: '8px', flexShrink: 0 }}
                        onClick={() => openEditModal(t)}
                        title="Edit Town Details"
                      >
                        <Icon name="gear" size={13} />
                      </button>

                      <Link
                        href="/branches"
                        target="_blank"
                        className="btn btn-o btn-s"
                        style={{ padding: '5px 8px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
                        title="View Public Branch Page"
                      >
                        <Icon name="search" size={13} />
                      </Link>

                      <button
                        type="button"
                        className="btn-cross-delete"
                        onClick={() => setDeletingItem(t)}
                        title="Delete Town"
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
            {filteredTowns.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--txt3)' }}>
                  {search ? `No towns found matching "${search}".` : 'No towns have been added to the network yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 2-COLUMN HIGH-END FEATURE CARDS EQUAL HEIGHT */}
      <div className="g2" style={{ gap: '20px', alignItems: 'stretch' }}>
        {/* CARD 1: NETWORK EXPANSION & ONBOARDING */}
        <div
          className="acard"
          style={{
            borderRadius: '20px',
            padding: '22px',
            background: 'var(--surf)',
            border: '1px solid var(--line)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(59, 130, 246, 0.12)',
                    color: '#3B82F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon name="plus" size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: 'var(--txt1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Network Expansion &amp; Onboarding
                </h3>
              </div>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '99px',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  background: 'rgba(59, 130, 246, 0.12)',
                  color: '#3B82F6',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                🌐 Auto-Propagated
              </span>
            </div>

            <p className="sm" style={{ margin: '0 0 14px 0', fontSize: '13px', color: 'var(--txt2)', lineHeight: 1.55 }}>
              A town joins the Pashtoonkhwa Blood Bank network when approved by the organizing committee. Adding a town here automatically updates all dropdowns, donor registration forms, and branch maps across the application.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--line)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--txt1)', fontWeight: 600 }}>
                <span style={{ color: '#22C55E' }}>✓</span>
                <span>Automatic real-time sync across all 14+ town portals</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--txt1)', fontWeight: 600 }}>
                <span style={{ color: '#22C55E' }}>✓</span>
                <span>Instant integration with donor forms, maps, and filters</span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-p"
              style={{ borderRadius: '10px', fontSize: '12.5px', padding: '8px 16px' }}
              onClick={openCreateModal}
            >
              + Add a New Town
            </button>
          </div>
        </div>

        {/* CARD 2: INTER-BRANCH COLD-CHAIN SHARING */}
        <div
          className="acard"
          style={{
            borderRadius: '20px',
            padding: '22px',
            background: 'var(--surf)',
            border: '1px solid rgba(34, 197, 94, 0.35)',
            boxShadow: '0 8px 30px rgba(34, 197, 94, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(34, 197, 94, 0.12)',
                    color: '#22C55E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon name="shield" size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: 'var(--txt1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Inter-Branch Cold-Chain Sharing
                </h3>
              </div>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '99px',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: '1px solid rgba(34, 197, 94, 0.35)',
                  background: 'rgba(34, 197, 94, 0.12)',
                  color: '#22C55E',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
                Real-Time Visibility
              </span>
            </div>

            <p className="sm" style={{ margin: '0 0 14px 0', fontSize: '13px', color: 'var(--txt2)', lineHeight: 1.55 }}>
              Any branch can inspect stock levels and open emergency calls across all regional centers. Donors are only contacted by their own town manager unless explicit permission for regional dispatch has been granted.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--txt1)', fontWeight: 600 }}>
              <span style={{ color: '#22C55E' }}>🔒</span>
              <span>100% stock &amp; emergency request visibility across hubs</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--txt1)', fontWeight: 600 }}>
              <span style={{ color: '#22C55E' }}>🔒</span>
              <span>Donor contact privacy preserved by local branch managers</span>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT TOWN MODAL */}
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
              zIndex: 1100,
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
              zIndex: 1101,
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
              background: 'var(--surf)',
              borderRadius: '24px',
              padding: '26px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--txt1)' }}>
                {editingItem ? 'Edit Town Details' : 'Add New Town to Network'}
              </h2>
              <button
                type="button"
                className="btn-cross-delete"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTown} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>Town Name *</label>
                <input
                  type="text"
                  className="fld"
                  placeholder="e.g. Gwadar, Kharan, Khuzdar"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700, display: 'block', marginBottom: '6px' }}>Office Standing</label>
                <CustomSelect
                  name="formStanding"
                  options={standingOptions}
                  value={formStanding}
                  onChange={(val) => setFormStanding(val)}
                />
              </div>

              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>Branch Address / Location</label>
                <input
                  type="text"
                  className="fld"
                  placeholder="e.g. Band Road Main Desk"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                />
              </div>

              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={isSaving} className="btn btn-p" style={{ flex: 1, borderRadius: '10px', opacity: isSaving ? 0.8 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                  {isSaving ? 'Saving…' : editingItem ? 'Save Changes' : 'Add Town to Network'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* CONFIRMATION DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={!!deletingItem}
        title="Delete Town from Network?"
        itemName={deletingItem?.name}
        description={`Are you sure you want to delete town "${deletingItem?.name}"? This will remove the town from all application dropdowns, filters, and branch maps.`}
        confirmLabel="Delete Town"
        onConfirm={confirmDelete}
        onClose={() => setDeletingItem(null)}
      />

      {/* Town Details Side Drawer */}
      <TownSheet
        town={selectedTown}
        onEdit={openEditModal}
        onDelete={(t) => setDeletingItem(t)}
        onClose={() => setSelectedTown(null)}
      />
    </AdminShell>
  );
}
