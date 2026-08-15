'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { api } from '../../../lib/api';
import { Icon } from '../../../components/Icon';
import { CustomSelect } from '../../../components/CustomSelect';
import { IMG } from '../../../lib/images';

export interface AnnouncementItem {
  id: string;
  title: string;
  kind: 'Blood Camp' | 'Notice' | 'Appeal' | 'Awareness';
  date: string;
  body: string;
  image: string;
  status: 'live' | 'expired';
  location: string;
}

const IMAGE_PRESETS = [
  { label: 'Community Camp', url: IMG.community },
  { label: 'Building Premises', url: IMG.building },
  { label: 'Screened Blood Bags', url: IMG.bloodBags },
  { label: 'Emergency Ambulance', url: IMG.ambulance },
  { label: 'Medical Team Drive', url: IMG.medicalTeam },
  { label: 'Partnership', url: IMG.partnership },
  { label: 'Clinical Lab', url: IMG.screeningLab },
];

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Free Donation Camp & Screening, Pishin',
    kind: 'Blood Camp',
    date: '12 September',
    body: 'Band Road branch desk, 9:00 AM to 4:00 PM. Walk in, or pre-register online so our clinical team knows how many voluntary donors to prepare for.',
    image: IMG.community,
    status: 'live',
    location: 'Strip · Home · News',
  },
  {
    id: 'ann-2',
    title: 'New Quetta Central Premises — Construction Final Phase',
    kind: 'Notice',
    date: '3 September',
    body: 'Construction of the new Quetta central facility has entered its final inspection phase. The expanded cold storage capacity will hold up to 400 screened bags.',
    image: IMG.building,
    status: 'live',
    location: 'Home · News',
  },
  {
    id: 'ann-3',
    title: 'Eid-ul-Adha Cattle Hide Collection Campaign',
    kind: 'Appeal',
    date: 'Runs to 20 June',
    body: 'Volunteers collect cattle hides across all branch networks. Request a dedicated collection team from your neighborhood or welfare society.',
    image: IMG.partnership,
    status: 'expired',
    location: 'Strip · News',
  },
  {
    id: 'ann-4',
    title: 'Thalassemia Patient Transfusion Schedule — September',
    kind: 'Notice',
    date: '28 August',
    body: 'Guardians of registered children can collect the updated monthly schedule from their local branch or view direct dispatch logs online.',
    image: IMG.clinician,
    status: 'live',
    location: 'News',
  },
  {
    id: 'ann-5',
    title: 'Mass Awareness Drive, Quetta University Campus',
    kind: 'Awareness',
    date: '14 August',
    body: 'Over 280 students registered as first-time voluntary donors during a two-day campus awareness campaign organized by PBB volunteers.',
    image: IMG.portraitA,
    status: 'live',
    location: 'News',
  },
];

export default function AdminAnnouncements() {
  const [items, setItems] = useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'expired'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<AnnouncementItem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formKind, setFormKind] = useState<'Blood Camp' | 'Notice' | 'Appeal' | 'Awareness'>('Blood Camp');
  const [formDate, setFormDate] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formImage, setFormImage] = useState(IMG.community);
  const [formStatus, setFormStatus] = useState<'live' | 'expired'>('live');
  const [formLocations, setFormLocations] = useState<{ strip: boolean; home: boolean; news: boolean }>({
    strip: true,
    home: true,
    news: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage or API on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pbb_admin_announcements');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {}

    api
      .get<AnnouncementItem[]>('/cms/announcements')
      .then((res) => {
        if (res && Array.isArray(res) && res.length > 0) {
          setItems(res);
        }
      })
      .catch(() => {});
  }, []);

  function toggleStatus(id: string) {
    setItems((prev) => {
      const next = prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'live' ? ('expired' as const) : ('live' as const);
          showToast(`Announcement "${item.title}" status changed to ${nextStatus.toUpperCase()}.`);
          return { ...item, status: nextStatus };
        }
        return item;
      });
      try {
        localStorage.setItem('pbb_admin_announcements', JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function confirmDelete() {
    if (!deletingItem) return;

    setItems((prev) => {
      const next = prev.filter((i) => i.id !== deletingItem.id);
      try {
        localStorage.setItem('pbb_admin_announcements', JSON.stringify(next));
      } catch {}
      return next;
    });

    showToast(`Announcement "${deletingItem.title}" deleted.`);
    setDeletingItem(null);
  }

  function openCreateModal() {
    setEditingId(null);
    setFormTitle('');
    setFormKind('Blood Camp');
    setFormDate('Today');
    setFormBody('');
    setFormImage(IMG.community);
    setFormStatus('live');
    setFormLocations({ strip: true, home: true, news: true });
    setIsModalOpen(true);
  }

  function openEditModal(item: AnnouncementItem) {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormKind(item.kind);
    setFormDate(item.date);
    setFormBody(item.body);
    setFormImage(item.image || IMG.community);
    setFormStatus(item.status);
    setFormLocations({
      strip: item.location.includes('Strip'),
      home: item.location.includes('Home'),
      news: item.location.includes('News'),
    });
    setIsModalOpen(true);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setFormImage(dataUrl);
        showToast(`Uploaded image: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSaveAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Please enter an announcement title.');
      return;
    }

    const locs: string[] = [];
    if (formLocations.strip) locs.push('Strip');
    if (formLocations.home) locs.push('Home');
    if (formLocations.news) locs.push('News');
    const locationString = locs.length > 0 ? locs.join(' · ') : 'News';

    if (editingId) {
      // Edit existing
      setItems((prev) => {
        const next = prev.map((item) => {
          if (item.id === editingId) {
            return {
              ...item,
              title: formTitle.trim(),
              kind: formKind,
              date: formDate.trim() || 'Today',
              body: formBody.trim(),
              image: formImage,
              status: formStatus,
              location: locationString,
            };
          }
          return item;
        });
        try {
          localStorage.setItem('pbb_admin_announcements', JSON.stringify(next));
        } catch {}
        return next;
      });
      showToast('Announcement updated successfully!');
    } else {
      // Create new
      const newItem: AnnouncementItem = {
        id: `ann-${Date.now()}`,
        title: formTitle.trim(),
        kind: formKind,
        date: formDate.trim() || 'Today',
        body: formBody.trim(),
        image: formImage,
        status: formStatus,
        location: locationString,
      };

      setItems((prev) => {
        const next = [newItem, ...prev];
        try {
          localStorage.setItem('pbb_admin_announcements', JSON.stringify(next));
        } catch {}
        return next;
      });
      showToast('New announcement created and published to public pages!');
    }

    setIsModalOpen(false);
  }

  const filteredItems = items.filter((item) => {
    if (statusFilter === 'live' && item.status !== 'live') return false;
    if (statusFilter === 'expired' && item.status !== 'expired') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.body.toLowerCase().includes(q) ||
        item.kind.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const liveCount = items.filter((i) => i.status === 'live').length;
  const expiredCount = items.filter((i) => i.status === 'expired').length;

  const kindOptions = [
    { value: 'Blood Camp', label: 'Blood Camp' },
    { value: 'Notice', label: 'Notice' },
    { value: 'Appeal', label: 'Appeal' },
    { value: 'Awareness', label: 'Awareness' },
  ];

  const topActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button type="button" className="btn btn-p btn-s" onClick={openCreateModal}>
        <Icon name="plus" size={14} />
        <span style={{ marginLeft: '4px' }}>+ New Announcement</span>
      </button>
    </div>
  );

  return (
    <AdminShell
      view="announcements"
      title="Announcements & Bulletins"
      subtitle={`${liveCount} live bulletins · ${expiredCount} expired`}
      actions={topActions}
    >
      {/* KPI Stats Row */}
      <div className="akpi" style={{ marginBottom: '20px' }}>
        <div className="c">
          <div className="l">Total Announcements</div>
          <div className="n" style={{ color: 'var(--p)' }}>
            {items.length}
          </div>
        </div>
        <div className="c">
          <div className="l">Live on Public Site</div>
          <div className="n" style={{ color: '#22C55E' }}>
            {liveCount}
          </div>
        </div>
        <div className="c">
          <div className="l">Expired / Archived</div>
          <div className="n" style={{ color: 'var(--txt2)' }}>
            {expiredCount}
          </div>
        </div>
        <div className="c">
          <div className="l">Placements Active</div>
          <div className="n" style={{ fontSize: '15px' }}>
            Home · News Page · Top Bar
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
              placeholder="Search announcements by title or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '34px' }}
            />
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt3)' }}>
              <Icon name="search" size={15} />
            </span>
          </div>
        </div>

        {/* Upgraded Filter Badges */}
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
            All ({items.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('live')}
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
              border: statusFilter === 'live' ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(34, 197, 94, 0.25)',
              background: statusFilter === 'live' ? 'rgba(34, 197, 94, 0.18)' : 'rgba(34, 197, 94, 0.08)',
              color: '#22C55E',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
            Live ({liveCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('expired')}
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
              border: statusFilter === 'expired' ? '1px solid rgba(148, 163, 184, 0.5)' : '1px solid rgba(148, 163, 184, 0.25)',
              background: statusFilter === 'expired' ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.08)',
              color: '#94A3B8',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94A3B8' }} />
            Expired ({expiredCount})
          </button>
        </div>
      </div>

      {/* Announcements Table */}
      <div className="atbl" style={{ marginBottom: '24px', overflowX: 'hidden' }}>
        <table style={{ width: '100%', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '32%' }}>Announcement Title &amp; Excerpt</th>
              <th style={{ width: '14%' }}>Category</th>
              <th style={{ width: '14%' }}>Schedule</th>
              <th style={{ width: '14%' }}>Placements</th>
              <th style={{ width: '10%' }}>Status</th>
              <th style={{ width: '16%', textAlign: 'right', paddingRight: '16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((a) => (
              <tr key={a.id}>
                {/* Image Thumbnail + Title + Excerpt */}
                <td className="m2" style={{ paddingRight: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={a.image || IMG.community}
                      alt={a.title}
                      style={{
                        width: '54px',
                        height: '42px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: '1px solid var(--line)',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div className="nm" style={{ fontWeight: 700, fontSize: '14px', color: 'var(--txt1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.title}
                      </div>
                      <div className="sm" style={{ fontSize: '11.5px', color: 'var(--txt2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                        {a.body}
                      </div>
                    </div>
                  </div>
                </td>

                <td>
                  <span
                    className="tag"
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      background:
                        a.kind === 'Blood Camp'
                          ? 'rgba(217,35,35,0.12)'
                          : a.kind === 'Notice'
                          ? 'rgba(59,130,246,0.12)'
                          : 'rgba(234,179,8,0.12)',
                      color:
                        a.kind === 'Blood Camp'
                          ? 'var(--p)'
                          : a.kind === 'Notice'
                          ? '#3B82F6'
                          : '#EAB308',
                    }}
                  >
                    {a.kind}
                  </span>
                </td>

                <td style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--txt2)' }}>
                  {a.date}
                </td>

                <td style={{ fontSize: '12px', color: 'var(--txt3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {a.location}
                </td>

                <td>
                  <button
                    type="button"
                    onClick={() => toggleStatus(a.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 8px',
                      borderRadius: '99px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      border: a.status === 'live' ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(148, 163, 184, 0.3)',
                      background: a.status === 'live' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(148, 163, 184, 0.1)',
                      color: a.status === 'live' ? '#22C55E' : '#94A3B8',
                    }}
                    title="Click to toggle live visibility"
                  >
                    <span
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        background: a.status === 'live' ? '#22C55E' : '#94A3B8',
                        boxShadow: a.status === 'live' ? '0 0 6px #22C55E' : 'none',
                      }}
                    />
                    {a.status === 'live' ? 'Live' : 'Expired'}
                  </button>
                </td>

                <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-o btn-s"
                      style={{ padding: '5px 8px', borderRadius: '8px', flexShrink: 0 }}
                      onClick={() => openEditModal(a)}
                      title="Edit Announcement"
                    >
                      <Icon name="gear" size={13} />
                    </button>

                    <Link
                      href="/news"
                      target="_blank"
                      className="btn btn-o btn-s"
                      style={{ padding: '5px 8px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
                      title="Preview on Public News Page"
                    >
                      <Icon name="search" size={13} />
                    </Link>

                    <button
                      type="button"
                      className="btn-cross-delete"
                      onClick={() => setDeletingItem(a)}
                      title="Delete Announcement"
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
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--txt3)' }}>
                  No announcements found matching "{search}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT ANNOUNCEMENT MODAL */}
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
              maxWidth: '560px',
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
                {editingId ? 'Edit Announcement' : 'Create New Announcement'}
              </h2>
              <button
                type="button"
                className="btn-cross-delete"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>Announcement Title *</label>
                <input
                  type="text"
                  className="fld"
                  placeholder="e.g. Free Blood Donation Camp, Pishin"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
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
                  <label className="lb" style={{ fontWeight: 700 }}>Schedule Date</label>
                  <input
                    type="text"
                    className="fld"
                    placeholder="e.g. 12 September 2026"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>Details &amp; Description</label>
                <textarea
                  className="fld"
                  rows={3}
                  placeholder="Full bulletin description for site visitors..."
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                />
              </div>

              {/* IMAGE SELECTION & DEVICE FILE UPLOAD */}
              <div className="fgrp">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="lb" style={{ fontWeight: 700, margin: 0 }}>
                    Announcement Cover Image
                  </label>
                  <button
                    type="button"
                    className="btn btn-o btn-s"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ fontSize: '11.5px', padding: '4px 10px', borderRadius: '8px' }}
                  >
                    📁 Upload from Device
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Preset Thumbnails Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                  {IMAGE_PRESETS.map((preset) => {
                    const isSelected = formImage === preset.url;
                    return (
                      <div
                        key={preset.label}
                        onClick={() => setFormImage(preset.url)}
                        style={{
                          border: isSelected ? '2px solid var(--p)' : '1px solid var(--line)',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'all 0.18s ease',
                          background: isSelected ? 'rgba(217, 35, 35, 0.08)' : 'var(--surf)',
                          padding: '3px',
                          textAlign: 'center',
                        }}
                        className="sec-tile"
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          style={{ width: '100%', height: '44px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                        <span style={{ fontSize: '9.5px', display: 'block', fontWeight: 600, marginTop: '2px', color: isSelected ? 'var(--p)' : 'var(--txt2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {preset.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Image URL Field */}
                <input
                  type="text"
                  className="fld"
                  placeholder="Custom image URL or uploaded Data URL"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                />
              </div>

              {/* Placement Checkboxes */}
              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>Where it appears on public pages</label>
                <div style={{ display: 'flex', gap: '14px', marginTop: '6px' }}>
                  <label className="chk">
                    <input
                      type="checkbox"
                      checked={formLocations.strip}
                      onChange={(e) => setFormLocations({ ...formLocations, strip: e.target.checked })}
                    />
                    <span>Top Alert Strip</span>
                  </label>
                  <label className="chk">
                    <input
                      type="checkbox"
                      checked={formLocations.home}
                      onChange={(e) => setFormLocations({ ...formLocations, home: e.target.checked })}
                    />
                    <span>Homepage Card</span>
                  </label>
                  <label className="chk">
                    <input
                      type="checkbox"
                      checked={formLocations.news}
                      onChange={(e) => setFormLocations({ ...formLocations, news: e.target.checked })}
                    />
                    <span>Public News Page</span>
                  </label>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>Visibility Status</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className={`tag ${formStatus === 'live' ? 'ok' : 'gy'}`}
                    onClick={() => setFormStatus('live')}
                    style={{ padding: '6px 14px', cursor: 'pointer' }}
                  >
                    🟢 Live (Published)
                  </button>
                  <button
                    type="button"
                    className={`tag ${formStatus === 'expired' ? 'ok' : 'gy'}`}
                    onClick={() => setFormStatus('expired')}
                    style={{ padding: '6px 14px', cursor: 'pointer' }}
                  >
                    ⚪ Expired (Archived)
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-p" style={{ flex: 1, borderRadius: '10px' }}>
                  {editingId ? 'Save & Publish Changes' : 'Create & Publish Bulletin'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* CONFIRMATION DELETE MODAL */}
      {deletingItem && (
        <>
          <div
            className="sheetov on"
            onClick={() => setDeletingItem(null)}
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
                Delete Announcement?
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--txt2)', margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to delete <b>"{deletingItem.title}"</b>? This will remove it from the public website bulletins.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-o"
                style={{ flex: 1, borderRadius: '10px' }}
                onClick={() => setDeletingItem(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-p"
                style={{ flex: 1, borderRadius: '10px', background: '#DC2626', borderColor: '#DC2626' }}
                onClick={confirmDelete}
              >
                Delete Bulletin
              </button>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
