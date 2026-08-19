'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { useAuth } from '../../../lib/auth';
import { Icon } from '../../../components/Icon';
import { CustomSelect } from '../../../components/CustomSelect';
import { fetchTowns, type Town } from '../../../lib/towns';
import {
  fetchPartners,
  createPartner,
  updatePartner,
  deletePartner,
  setPartnerStatus,
  type Partner,
  type PartnerKind,
} from '../../../lib/partners';
import { ConfirmDeleteModal } from '../../../components/admin/ConfirmDeleteModal';

// The page's local row shape mirrors the lib Partner. Kept as an alias so the existing JSX (which
// refers to PartnerItem throughout) does not need touching.
type PartnerItem = Partner;

function getCategoryBadgeStyle(kind?: string) {
  const k = (kind || '').toLowerCase();
  if (k.includes('hosp')) {
    return { background: 'rgba(225, 29, 72, 0.12)', color: '#E11D48', border: '1px solid rgba(225, 29, 72, 0.25)' };
  }
  if (k.includes('lab')) {
    return { background: 'rgba(14, 165, 233, 0.12)', color: '#0284C7', border: '1px solid rgba(14, 165, 233, 0.25)' };
  }
  if (k.includes('social')) {
    return { background: 'rgba(13, 148, 136, 0.12)', color: '#0D9488', border: '1px solid rgba(13, 148, 136, 0.25)' };
  }
  if (k.includes('welfare') || k.includes('society')) {
    return { background: 'rgba(147, 51, 234, 0.12)', color: '#7E22CE', border: '1px solid rgba(147, 51, 234, 0.25)' };
  }
  if (k.includes('uni')) {
    return { background: 'rgba(79, 70, 229, 0.12)', color: '#4338CA', border: '1px solid rgba(79, 70, 229, 0.25)' };
  }
  if (k.includes('found')) {
    return { background: 'rgba(217, 119, 6, 0.12)', color: '#D97706', border: '1px solid rgba(217, 119, 6, 0.25)' };
  }
  if (k.includes('gov')) {
    return { background: 'rgba(71, 85, 105, 0.12)', color: '#334155', border: '1px solid rgba(71, 85, 105, 0.25)' };
  }
  return { background: 'rgba(99, 102, 241, 0.12)', color: '#4F46E5', border: '1px solid rgba(99, 102, 241, 0.25)' };
}

export default function AdminPartners() {
  const { user } = useAuth();
  // Presentation-only gate; RLS is the real enforcer. Only head office and managers may curate.
  const canWrite = user?.role.id === 'head' || user?.role.id === 'manager';

  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [towns, setTowns] = useState<Town[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'declined'>('all');
  const [kindFilter, setKindFilter] = useState('All Categories');

  const tableRef = useRef<HTMLDivElement>(null);

  function scrollToPendingTable() {
    setStatusFilter('pending');
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  // Modal / Drawer state
  const [selectedPartner, setSelectedPartner] = useState<PartnerItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingPartner, setDeletingPartner] = useState<PartnerItem | null>(null);

  // Form State. formTownId is the selected town's id, or '' for an org-wide partner (no town).
  const [formName, setFormName] = useState('');
  const [formKind, setFormKind] = useState<PartnerKind>('Hospital');
  const [formTownId, setFormTownId] = useState('');
  const [formCoordinator, setFormCoordinator] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'pending'>('active');
  const [formSince, setFormSince] = useState<string>('2024');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPartners = useCallback(async () => {
    setError(null);
    try {
      const [partnerList, townList] = await Promise.all([fetchPartners(), fetchTowns()]);
      setPartners(partnerList);
      setTowns(townList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load partners.');
      setPartners([]);
    }
  }, []);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  async function handleApprove(p: PartnerItem) {
    try {
      const updated = await setPartnerStatus(p.id, 'active');
      setPartners((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
      if (selectedPartner?.id === p.id) setSelectedPartner(updated);
      showToast(`Approved "${p.name}" as an active partner. Published to supporters page.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : `Could not approve "${p.name}".`);
    }
  }

  async function handleDecline(p: PartnerItem) {
    try {
      const updated = await setPartnerStatus(p.id, 'declined');
      setPartners((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
      if (selectedPartner?.id === p.id) setSelectedPartner(updated);
      showToast(`Declined application from "${p.name}".`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : `Could not decline "${p.name}".`);
    }
  }

  async function confirmDelete() {
    if (!deletingPartner) return;
    setIsDeleting(true);
    const target = deletingPartner;
    try {
      await deletePartner(target.id);
      setPartners((prev) => prev.filter((x) => x.id !== target.id));
      if (selectedPartner?.id === target.id) setSelectedPartner(null);
      setDeletingPartner(null);
      showToast(`Partner "${target.name}" removed.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : `Could not remove "${target.name}".`);
    } finally {
      setIsDeleting(false);
    }
  }

  function townIdForName(name: string): string {
    return towns.find((t) => t.name === name)?.id ?? '';
  }

  function openCreateModal() {
    setEditingId(null);
    setFormName('');
    setFormKind('Hospital');
    setFormTownId('');
    setFormCoordinator('');
    setFormPhone('');
    setFormNote('');
    setFormStatus('active');
    setFormSince(new Date().getFullYear().toString());
    setIsModalOpen(true);
  }

  function openEditModal(p: PartnerItem) {
    setEditingId(p.id);
    setFormName(p.name);
    setFormKind(p.kind);
    setFormTownId(p.townId ?? townIdForName(p.town));
    setFormCoordinator(p.coordinator === 'Assigned Officer' ? '' : p.coordinator);
    setFormPhone(p.phone || '');
    setFormNote(p.note);
    setFormStatus(p.status === 'declined' ? 'pending' : p.status);
    setFormSince(p.since !== '-' ? p.since : new Date().getFullYear().toString());
    setIsModalOpen(true);
  }

  async function handleSavePartner(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Please enter an organisation name.');
      return;
    }

    setIsSubmitting(true);
    const name = formName.trim();
    const payload = {
      name,
      kind: formKind,
      townId: formTownId || null,
      status: formStatus,
      since: formSince,
      note: formNote,
      coordinator: formCoordinator,
      phone: formPhone,
    };

    try {
      if (editingId) {
        const updated = await updatePartner(editingId, payload);
        setPartners((prev) => prev.map((x) => (x.id === editingId ? updated : x)));
        if (selectedPartner?.id === editingId) setSelectedPartner(updated);
        showToast('Partner details updated.');
      } else {
        const created = await createPartner(payload);
        setPartners((prev) => [created, ...prev]);
        showToast(`Added new organisation "${name}".`);
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save the partner.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredPartners = partners.filter((p) => {
    if (statusFilter === 'active' && p.status !== 'active') return false;
    if (statusFilter === 'pending' && p.status !== 'pending') return false;
    if (statusFilter === 'declined' && p.status !== 'declined') return false;
    if (kindFilter !== 'All Categories' && p.kind !== kindFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.kind.toLowerCase().includes(q) ||
        p.town.toLowerCase().includes(q) ||
        p.note.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeCount = partners.filter((p) => p.status === 'active').length;
  const pendingCount = partners.filter((p) => p.status === 'pending').length;
  const hospitalCount = partners.filter((p) => p.kind === 'Hospital').length;
  const labCount = partners.filter((p) => p.kind === 'Laboratory' || p.kind === 'Foundation').length;

  const kindOptions = [
    { value: 'Hospital', label: 'Hospital' },
    { value: 'Laboratory', label: 'Laboratory' },
    { value: 'Welfare society', label: 'Welfare society' },
    { value: 'Social Welfare', label: 'Social Welfare' },
    { value: 'University', label: 'University' },
    { value: 'Foundation', label: 'Foundation' },
    { value: 'Government', label: 'Government' },
  ];

  const categoryFilterOptions = [
    { value: 'All Categories', label: 'All Categories' },
    ...kindOptions,
  ];

  const townOptions = [
    { value: '', label: 'Organisation-wide (no town)' },
    ...towns.map((t) => ({ value: t.id, label: t.name })),
  ];

  const topActions = canWrite ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button type="button" className="btn btn-p btn-s" onClick={openCreateModal}>
        <Icon name="plus" size={14} />
        <span style={{ marginLeft: '4px' }}>+ Add Organisation</span>
      </button>
    </div>
  ) : null;

  return (
    <AdminShell
      view="partners"
      title="Partners &amp; Organisations"
      subtitle={`${activeCount} active partners · ${pendingCount} awaiting approval`}
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

      {/* High-Contrast Pending Decision Callout Card */}
      {pendingCount > 0 && (
        <div
          className="acard"
          style={{
            marginBottom: '22px',
            borderRadius: '18px',
            padding: '18px 22px',
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.14) 0%, rgba(217, 119, 6, 0.08) 100%)',
            border: '1px solid rgba(234, 179, 8, 0.45)',
            boxShadow: '0 8px 25px rgba(234, 179, 8, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(234, 179, 8, 0.22)',
                color: '#FACC15',
                border: '1px solid rgba(250, 204, 21, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0,
              }}
            >
              ⚠️
            </div>
            <div>
              <h4 style={{ margin: '0 0 3px 0', fontSize: '15px', fontWeight: 800, color: 'var(--txt1)' }}>
                {pendingCount} {pendingCount === 1 ? 'Organisation Awaiting Decision' : 'Organisations Awaiting Committee Decision'}
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--txt2)', lineHeight: 1.5 }}>
                Approved partners are assigned a named coordinator, direct dispatch lines, and placement on the public supporters showcase.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-s"
            onClick={scrollToPendingTable}
            style={{
              background: '#EAB308',
              color: '#0F172A',
              border: 'none',
              fontWeight: 800,
              borderRadius: '10px',
              padding: '8px 16px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Review Pending ({pendingCount}) →
          </button>
        </div>
      )}

      {/* KPI Stats Row */}
      <div className="akpi" style={{ marginBottom: '20px' }}>
        <div className="c">
          <div className="l">Active Partners</div>
          <div className="n" style={{ color: '#22C55E' }}>
            {activeCount}
          </div>
        </div>
        <div className="c">
          <div className="l">Awaiting Approval</div>
          <div className="n" style={{ color: pendingCount > 0 ? '#EAB308' : 'var(--txt2)' }}>
            {pendingCount}
          </div>
        </div>
        <div className="c">
          <div className="l">Referring Hospitals</div>
          <div className="n" style={{ color: 'var(--p)' }}>
            {hospitalCount}
          </div>
        </div>
        <div className="c">
          <div className="l">Labs &amp; Foundations</div>
          <div className="n" style={{ color: '#3B82F6' }}>
            {labCount}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="afilters" style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '520px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="fld"
              placeholder="Search organisation by name, town, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '34px' }}
            />
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt3)' }}>
              <Icon name="search" size={15} />
            </span>
          </div>

          <div style={{ width: '160px' }}>
            <CustomSelect
              name="kindFilter"
              options={categoryFilterOptions}
              value={kindFilter}
              onChange={(val) => setKindFilter(val)}
            />
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
            All ({partners.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('active')}
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
              border: statusFilter === 'active' ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(34, 197, 94, 0.25)',
              background: statusFilter === 'active' ? 'rgba(34, 197, 94, 0.18)' : 'rgba(34, 197, 94, 0.08)',
              color: '#22C55E',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
            Active ({activeCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
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
              border: statusFilter === 'pending' ? '1px solid rgba(234, 179, 8, 0.5)' : '1px solid rgba(234, 179, 8, 0.25)',
              background: statusFilter === 'pending' ? 'rgba(234, 179, 8, 0.18)' : 'rgba(234, 179, 8, 0.08)',
              color: '#EAB308',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EAB308' }} />
            Pending ({pendingCount})
          </button>
        </div>
      </div>

      {/* Partners Table */}
      <div className="atbl" ref={tableRef} style={{ marginBottom: '24px', overflowX: 'hidden' }}>
        <table style={{ width: '100%', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '34%' }}>Organisation &amp; Details</th>
              <th style={{ width: '14%' }}>Category Kind</th>
              <th style={{ width: '12%' }}>Town</th>
              <th style={{ width: '12%' }}>Partner Since</th>
              <th style={{ width: '12%' }}>Status</th>
              <th style={{ width: '16%', textAlign: 'right', paddingRight: '16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPartners.map((p) => {
              const isSelected = selectedPartner?.id === p.id;
              return (
                <tr
                  key={p.id}
                  onClick={() => setSelectedPartner(p)}
                  style={{
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(217, 35, 35, 0.04)' : undefined,
                  }}
                >
                  <td className="m2" style={{ paddingRight: '10px' }}>
                    <div className="nm" style={{ fontWeight: 700, fontSize: '14px', color: isSelected ? 'var(--p)' : 'var(--txt1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                    </div>
                    <div className="sm" style={{ fontSize: '11.5px', color: 'var(--txt2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                      {p.note}
                    </div>
                  </td>

                  <td>
                    <span
                      className="tag"
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        display: 'inline-block',
                        ...getCategoryBadgeStyle(p.kind),
                      }}
                    >
                      {p.kind}
                    </span>
                  </td>

                  <td style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--txt2)' }}>
                    {p.town || 'Org-wide'}
                  </td>

                  <td style={{ fontSize: '12.5px', color: 'var(--txt3)' }}>
                    {p.since}
                  </td>

                  <td>
                    <span
                      className="tag"
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        background:
                          p.status === 'active'
                            ? 'rgba(34, 197, 94, 0.12)'
                            : p.status === 'pending'
                            ? 'rgba(234, 179, 8, 0.12)'
                            : 'rgba(239, 68, 68, 0.12)',
                        color:
                          p.status === 'active'
                            ? '#22C55E'
                            : p.status === 'pending'
                            ? '#EAB308'
                            : '#EF4444',
                        border:
                          p.status === 'active'
                            ? '1px solid rgba(34, 197, 94, 0.3)'
                            : p.status === 'pending'
                            ? '1px solid rgba(234, 179, 8, 0.3)'
                            : '1px solid rgba(239, 68, 68, 0.3)',
                      }}
                    >
                      {p.status === 'active' ? '🟢 Active' : p.status === 'pending' ? '⚠️ Waiting' : '❌ Declined'}
                    </span>
                  </td>

                  {/* Actions Column with 16% width + 16px padding */}
                  <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-o btn-s"
                        style={{ padding: '5px 8px', borderRadius: '8px', flexShrink: 0 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(p);
                        }}
                        title="Edit Partner Details"
                      >
                        <Icon name="gear" size={13} />
                      </button>

                      <button
                        type="button"
                        className="btn btn-o btn-s"
                        style={{ padding: '5px 8px', borderRadius: '8px', flexShrink: 0 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPartner(p);
                        }}
                        title="Inspect Organisation Details"
                      >
                        <Icon name="search" size={13} />
                      </button>

                      <button
                        type="button"
                        className="btn-cross-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingPartner(p);
                        }}
                        title="Delete Organisation"
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
            {filteredPartners.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--txt3)', fontSize: '13px', fontWeight: 600 }}>
                  {search.trim() ? `No organisation found matching "${search.trim()}".` : 'No partner organisations found for this filter.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="ahint">
        Hospitals, laboratories, foundations, welfare societies, universities and other blood banks all live here.
        An approved partner gets a named coordinator, a direct line, and their logo on the public supporters page.
      </p>

      {/* INSPECTOR DRAWER SHEET */}
      {selectedPartner && (
        <>
          <div
            className="sheetov on"
            onClick={() => setSelectedPartner(null)}
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
              onClick={() => setSelectedPartner(null)}
              style={{ position: 'absolute', top: '20px', right: '20px' }}
            >
              ✕
            </button>

            <span
              className="tag"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                background: selectedPartner.status === 'active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                color: selectedPartner.status === 'active' ? '#22C55E' : '#EAB308',
                marginBottom: '10px',
                display: 'inline-block',
              }}
            >
              {selectedPartner.status === 'active' ? '🟢 Active Partner' : selectedPartner.status === 'pending' ? '⚠️ Waiting for Committee Decision' : '❌ Application Declined'}
            </span>

            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '8px 0 4px 0', color: 'var(--txt1)' }}>
              {selectedPartner.name}
            </h2>
            <div className="sm" style={{ fontSize: '13px', color: 'var(--txt2)', marginBottom: '18px' }}>
              {selectedPartner.kind} · {selectedPartner.town || 'Organisation-wide'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', alignItems: 'center' }}>
                <span style={{ color: 'var(--txt3)' }}>Category Kind:</span>
                <span
                  className="tag"
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: '6px',
                    ...getCategoryBadgeStyle(selectedPartner.kind),
                  }}
                >
                  {selectedPartner.kind}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--txt3)' }}>Town District:</span>
                <b style={{ color: 'var(--txt1)' }}>{selectedPartner.town || 'Organisation-wide'}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--txt3)' }}>Partner Since:</span>
                <b style={{ color: 'var(--txt1)' }}>{selectedPartner.since}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--txt3)' }}>Named Coordinator:</span>
                <b style={{ color: 'var(--p)' }}>{selectedPartner.coordinator}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--txt3)' }}>Public Website Placement:</span>
                <b style={{ color: selectedPartner.status === 'active' ? '#22C55E' : 'var(--txt3)' }}>
                  {selectedPartner.status === 'active' ? '✓ Visible on Supporters Page' : 'Hidden'}
                </b>
              </div>
            </div>

            {selectedPartner.note && (
              <div className="ahint" style={{ marginBottom: '20px', fontSize: '13px', lineHeight: 1.5 }}>
                <b>Proposal / Partnership Note:</b><br />
                {selectedPartner.note}
              </div>
            )}

            {selectedPartner.status === 'pending' ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-p"
                  style={{ flex: 1, borderRadius: '10px' }}
                  onClick={() => handleApprove(selectedPartner)}
                >
                  ✓ Approve Partner
                </button>
                <button
                  type="button"
                  className="btn btn-o"
                  style={{ borderRadius: '10px' }}
                  onClick={() => handleDecline(selectedPartner)}
                >
                  Decline
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-o"
                  style={{ flex: 1, borderRadius: '10px' }}
                  onClick={() => {
                    openEditModal(selectedPartner);
                    setSelectedPartner(null);
                  }}
                >
                  ⚙️ Edit Details
                </button>
                <button
                  type="button"
                  className="btn btn-o"
                  style={{ borderRadius: '10px', color: '#EF4444', borderColor: 'rgba(239,68,68,0.3)' }}
                  onClick={() => setDeletingPartner(selectedPartner)}
                >
                  End Partnership
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* CREATE / EDIT PARTNER MODAL */}
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
              maxWidth: '520px',
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
                {editingId ? 'Edit Partner Details' : 'Add New Organisation'}
              </h2>
              <button
                type="button"
                className="btn-cross-delete"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePartner} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>Organisation Name *</label>
                <input
                  type="text"
                  className="fld"
                  placeholder="e.g. Civil Hospital, Quetta Diagnostic Lab"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700, display: 'block', marginBottom: '6px' }}>Category Kind</label>
                  <CustomSelect
                    name="formKind"
                    options={kindOptions}
                    value={formKind}
                    onChange={(val) => setFormKind(val as any)}
                  />
                </div>

                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700 }}>Partner Since (Year)</label>
                  <input
                    type="number"
                    className="fld"
                    placeholder="e.g. 2004"
                    min={1990}
                    max={2030}
                    value={formSince}
                    onChange={(e) => setFormSince(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700, display: 'block', marginBottom: '6px' }}>Town District</label>
                  <CustomSelect
                    name="formTown"
                    options={townOptions}
                    value={formTownId}
                    onChange={(val) => setFormTownId(val)}
                  />
                </div>

                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700 }}>Direct Contact Phone</label>
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
                <label className="lb" style={{ fontWeight: 700 }}>Appointed Coordinator / Contact Person</label>
                <input
                  type="text"
                  className="fld"
                  placeholder="e.g. Dr. Tariq Kakar"
                  value={formCoordinator}
                  onChange={(e) => setFormCoordinator(e.target.value)}
                />
              </div>

              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700, display: 'block', marginBottom: '8px' }}>Approval Standing Status</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setFormStatus('active')}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: formStatus === 'active' ? '1.5px solid #22C55E' : '1px solid var(--bdr1)',
                      background: formStatus === 'active' ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg2)',
                      color: formStatus === 'active' ? '#22C55E' : 'var(--txt2)',
                    }}
                  >
                    ✓ Approved &amp; Active
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormStatus('pending')}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: formStatus === 'pending' ? '1.5px solid #EAB308' : '1px solid var(--bdr1)',
                      background: formStatus === 'pending' ? 'rgba(234, 179, 8, 0.15)' : 'var(--bg2)',
                      color: formStatus === 'pending' ? '#EAB308' : 'var(--txt2)',
                    }}
                  >
                    ⚠️ Pending Committee Decision
                  </button>
                </div>
              </div>

              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>Partnership Summary / Operational Scope</label>
                <textarea
                  className="fld"
                  rows={3}
                  placeholder="Describe blood exchange protocol, annual campaigns, or screening cooperation..."
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-p"
                  style={{
                    flex: 1,
                    borderRadius: '12px',
                    padding: '12px',
                    fontWeight: 700,
                    opacity: isSubmitting ? 0.8 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                      {editingId ? 'Saving Changes...' : 'Registering Organisation...'}
                    </>
                  ) : (
                    editingId ? 'Save Partner Changes' : 'Register Organisation'
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* CONFIRMATION DELETE MODAL */}
      <ConfirmDeleteModal
        isOpen={!!deletingPartner}
        title="End Partnership?"
        itemName={deletingPartner?.name}
        description={`Are you sure you want to remove "${deletingPartner?.name}"? This will remove them from active partner lists and public supporter showcases.`}
        confirmLabel="End Partnership"
        submitting={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setDeletingPartner(null)}
      />
    </AdminShell>
  );
}
