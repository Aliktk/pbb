'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { api } from '../../../lib/api';
import { Icon } from '../../../components/Icon';
import { CustomSelect } from '../../../components/CustomSelect';
import { getTownNamesList } from '../../../lib/towns';

export interface PartnerItem {
  id: string;
  name: string;
  kind: 'Hospital' | 'Laboratory' | 'Welfare society' | 'University' | 'Foundation';
  town: string;
  status: 'active' | 'pending' | 'declined';
  since: string;
  note: string;
  coordinator: string;
  phone?: string;
  email?: string;
}

const INITIAL_PARTNERS: PartnerItem[] = [
  {
    id: 'prt-1',
    name: 'Civil Hospital, Quetta',
    kind: 'Hospital',
    town: 'Quetta',
    status: 'active',
    since: '2004',
    note: 'Highest referring hospital. Named coordinator assigned for 24/7 blood exchange.',
    coordinator: 'Dr. Tariq Kakar',
    phone: '081-2836820',
  },
  {
    id: 'prt-2',
    name: 'Bolan Medical Complex',
    kind: 'Hospital',
    town: 'Quetta',
    status: 'active',
    since: '2007',
    note: 'Major medical center partner for thalassemic children transfusion schedules.',
    coordinator: 'Dr. Sanaullah',
    phone: '081-2839500',
  },
  {
    id: 'prt-3',
    name: 'DHQ Hospital, Zhob',
    kind: 'Hospital',
    town: 'Zhob',
    status: 'active',
    since: '2011',
    note: 'District branch hospital partner in Northern Balochistan corridor.',
    coordinator: 'Malik Rahim',
    phone: '0822-413902',
  },
  {
    id: 'prt-4',
    name: 'Quetta Diagnostic Laboratory',
    kind: 'Laboratory',
    town: 'Quetta',
    status: 'pending',
    since: '-',
    note: 'Offering overflow ELISA screening capacity. Awaiting organizing committee decision.',
    coordinator: 'Assigned upon approval',
    phone: '081-2840011',
  },
  {
    id: 'prt-5',
    name: 'Al-Khidmat Welfare Society',
    kind: 'Welfare society',
    town: 'Loralai',
    status: 'active',
    since: '2015',
    note: 'Organizes annual cattle hide collection campaign during Eid-ul-Adha in Loralai.',
    coordinator: 'Bilal Ahmad',
    phone: '0824-662066',
  },
  {
    id: 'prt-6',
    name: 'Balochistan University Campus',
    kind: 'University',
    town: 'Quetta',
    status: 'active',
    since: '2019',
    note: 'Hosts two student voluntary blood donation awareness drives per year.',
    coordinator: 'Student Affairs Desk',
  },
  {
    id: 'prt-7',
    name: 'Sherani Welfare Trust',
    kind: 'Welfare society',
    town: 'Sherani',
    status: 'pending',
    since: '-',
    note: 'Requesting to open a permanent branch desk in Sherani district.',
    coordinator: 'Under Committee Review',
  },
  {
    id: 'prt-8',
    name: 'Rahmat Medical Foundation',
    kind: 'Foundation',
    town: 'Pashtoonkhwa Regional',
    status: 'pending',
    since: '-',
    note: 'Offering to fund virus ELISA screening kits for 500 blood bags per year.',
    coordinator: 'Executive Board',
  },
];

export default function AdminPartners() {
  const [partners, setPartners] = useState<PartnerItem[]>(INITIAL_PARTNERS);
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

  // Form State
  const [formName, setFormName] = useState('');
  const [formKind, setFormKind] = useState<PartnerItem['kind']>('Hospital');
  const [formTown, setFormTown] = useState('Quetta');
  const [formCoordinator, setFormCoordinator] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'pending'>('active');

  // Load from localStorage or API on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pbb_admin_partners');
      if (saved) {
        setPartners(JSON.parse(saved));
      }
    } catch {}

    api
      .get<PartnerItem[]>('/cms/partners')
      .then((res) => {
        if (res && Array.isArray(res) && res.length > 0) {
          setPartners(res);
        }
      })
      .catch(() => {});
  }, []);

  function savePartnersList(newList: PartnerItem[]) {
    setPartners(newList);
    try {
      localStorage.setItem('pbb_admin_partners', JSON.stringify(newList));
    } catch {}
  }

  function handleApprove(p: PartnerItem) {
    const currentYear = new Date().getFullYear().toString();
    const next = partners.map((item) => {
      if (item.id === p.id) {
        return {
          ...item,
          status: 'active' as const,
          since: item.since === '-' ? currentYear : item.since,
          coordinator: item.coordinator.includes('Review') || item.coordinator.includes('approval') ? 'Assigned Officer' : item.coordinator,
        };
      }
      return item;
    });
    savePartnersList(next);
    showToast(`Approved "${p.name}" as an active partner! Published to supporters page.`);
    if (selectedPartner?.id === p.id) {
      setSelectedPartner({ ...p, status: 'active', since: currentYear });
    }
  }

  function handleDecline(p: PartnerItem) {
    const next = partners.map((item) => {
      if (item.id === p.id) {
        return { ...item, status: 'declined' as const };
      }
      return item;
    });
    savePartnersList(next);
    showToast(`Declined application from "${p.name}".`);
    if (selectedPartner?.id === p.id) {
      setSelectedPartner({ ...p, status: 'declined' });
    }
  }

  function confirmDelete() {
    if (!deletingPartner) return;
    const next = partners.filter((p) => p.id !== deletingPartner.id);
    savePartnersList(next);
    if (selectedPartner?.id === deletingPartner.id) setSelectedPartner(null);
    showToast(`Partner "${deletingPartner.name}" removed.`);
    setDeletingPartner(null);
  }

  function openCreateModal() {
    setEditingId(null);
    setFormName('');
    setFormKind('Hospital');
    setFormTown('Quetta');
    setFormCoordinator('Duty Coordinator');
    setFormPhone('081-2836820');
    setFormNote('');
    setFormStatus('active');
    setIsModalOpen(true);
  }

  function openEditModal(p: PartnerItem) {
    setEditingId(p.id);
    setFormName(p.name);
    setFormKind(p.kind);
    setFormTown(p.town);
    setFormCoordinator(p.coordinator);
    setFormPhone(p.phone || '');
    setFormNote(p.note);
    setFormStatus(p.status === 'declined' ? 'pending' : p.status);
    setIsModalOpen(true);
  }

  function handleSavePartner(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Please enter an organisation name.');
      return;
    }

    if (editingId) {
      const next = partners.map((p) => {
        if (p.id === editingId) {
          return {
            ...p,
            name: formName.trim(),
            kind: formKind,
            town: formTown,
            coordinator: formCoordinator.trim() || 'Assigned Officer',
            phone: formPhone.trim(),
            note: formNote.trim(),
            status: formStatus,
            since: p.since === '-' && formStatus === 'active' ? new Date().getFullYear().toString() : p.since,
          };
        }
        return p;
      });
      savePartnersList(next);
      showToast('Partner details updated successfully!');
    } else {
      const newPartner: PartnerItem = {
        id: `prt-${Date.now()}`,
        name: formName.trim(),
        kind: formKind,
        town: formTown,
        status: formStatus,
        since: formStatus === 'active' ? new Date().getFullYear().toString() : '-',
        note: formNote.trim() || 'Partner organisation registered with PBB network.',
        coordinator: formCoordinator.trim() || 'Assigned Officer',
        phone: formPhone.trim(),
      };

      savePartnersList([newPartner, ...partners]);
      showToast(`Added new organisation "${newPartner.name}"!`);
    }

    setIsModalOpen(false);
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
    { value: 'University', label: 'University' },
    { value: 'Foundation', label: 'Foundation' },
  ];

  const categoryFilterOptions = [
    { value: 'All Categories', label: 'All Categories' },
    ...kindOptions,
  ];

  const townOptions = getTownNamesList().map((t) => ({ value: t, label: t }));

  const topActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button type="button" className="btn btn-p btn-s" onClick={openCreateModal}>
        <Icon name="plus" size={14} />
        <span style={{ marginLeft: '4px' }}>+ Add Organisation</span>
      </button>
    </div>
  );

  return (
    <AdminShell
      view="partners"
      title="Partners &amp; Organisations"
      subtitle={`${activeCount} active partners · ${pendingCount} awaiting approval`}
      actions={topActions}
    >
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
                        background:
                          p.kind === 'Hospital'
                            ? 'rgba(217,35,35,0.12)'
                            : p.kind === 'Laboratory'
                            ? 'rgba(59,130,246,0.12)'
                            : 'rgba(234,179,8,0.12)',
                        color:
                          p.kind === 'Hospital'
                            ? 'var(--p)'
                            : p.kind === 'Laboratory'
                            ? '#3B82F6'
                            : '#EAB308',
                      }}
                    >
                      {p.kind}
                    </span>
                  </td>

                  <td style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--txt2)' }}>
                    {p.town}
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
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--txt3)' }}>
                  No organisations found matching "{search}".
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
              {selectedPartner.kind} · {selectedPartner.town}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--txt3)' }}>Category Kind:</span>
                <b style={{ color: 'var(--txt1)' }}>{selectedPartner.kind}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--txt3)' }}>Town District:</span>
                <b style={{ color: 'var(--txt1)' }}>{selectedPartner.town}</b>
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

            <form onSubmit={handleSavePartner} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                  <label className="lb" style={{ fontWeight: 700, display: 'block', marginBottom: '6px' }}>Town District</label>
                  <CustomSelect
                    name="formTown"
                    options={townOptions}
                    value={formTown}
                    onChange={(val) => setFormTown(val)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700 }}>Appointed Coordinator</label>
                  <input
                    type="text"
                    className="fld"
                    placeholder="e.g. Dr. Tariq Kakar"
                    value={formCoordinator}
                    onChange={(e) => setFormCoordinator(e.target.value)}
                  />
                </div>

                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700 }}>Contact Phone</label>
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
                <label className="lb" style={{ fontWeight: 700 }}>Proposal / Operational Note</label>
                <textarea
                  className="fld"
                  rows={3}
                  placeholder="Details regarding referral arrangement or screening capacity..."
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                />
              </div>

              {/* Status Selector */}
              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>Partnership Status</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className={`tag ${formStatus === 'active' ? 'ok' : 'gy'}`}
                    onClick={() => setFormStatus('active')}
                    style={{ padding: '6px 14px', cursor: 'pointer' }}
                  >
                    🟢 Active Partner
                  </button>
                  <button
                    type="button"
                    className={`tag ${formStatus === 'pending' ? 'ok' : 'gy'}`}
                    onClick={() => setFormStatus('pending')}
                    style={{ padding: '6px 14px', cursor: 'pointer' }}
                  >
                    ⚠️ Pending Committee Decision
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-p" style={{ flex: 1, borderRadius: '10px' }}>
                  {editingId ? 'Save Partner Changes' : 'Register Organisation'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* CONFIRMATION DELETE MODAL */}
      {deletingPartner && (
        <>
          <div
            className="sheetov on"
            onClick={() => setDeletingPartner(null)}
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
              maxWidth: '440px',
              zIndex: 1001,
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
              background: 'var(--surf)',
              borderRadius: '24px',
              padding: '26px',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>⚠️</span>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--txt1)' }}>
                End Partnership?
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--txt2)', margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to remove <b>"{deletingPartner.name}"</b>? This will remove them from active partner lists and public supporter showcases.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-o"
                style={{ flex: 1, borderRadius: '10px' }}
                onClick={() => setDeletingPartner(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-p"
                style={{ flex: 1, borderRadius: '10px', background: '#DC2626', borderColor: '#DC2626' }}
                onClick={confirmDelete}
              >
                End Partnership
              </button>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
