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

export interface MediaItem {
  id: string;
  filename: string;
  title: string;
  url: string;
  category: 'Camps & Drives' | 'Facilities & Labs' | 'Vehicles' | 'Thalassemia Care' | 'People & Staff' | 'Partnerships';
  size: string;
  dimensions: string;
  usedCount: number;
  usedPages: string[];
  consentStatus: 'verified' | 'pending';
  uploadedAt: string;
  uploadedBy: string;
}

const INITIAL_MEDIA: MediaItem[] = [
  {
    id: 'med-1',
    filename: 'hero-blood-donation.jpg',
    title: 'Blood Donor Bench Quetta',
    url: IMG.heroDonation,
    category: 'Camps & Drives',
    size: '1.4 MB',
    dimensions: '1920 × 1280',
    usedCount: 3,
    usedPages: ['Homepage Hero', 'Public News Page', 'About Story'],
    consentStatus: 'verified',
    uploadedAt: 'Today, 10:15 AM',
    uploadedBy: 'Super Admin',
  },
  {
    id: 'med-2',
    filename: 'quetta-headquarters-building.jpg',
    title: 'Quetta Press Club Central Office',
    url: IMG.building,
    category: 'Facilities & Labs',
    size: '2.1 MB',
    dimensions: '2048 × 1365',
    usedCount: 2,
    usedPages: ['Homepage Network Map', 'Branches Directory'],
    consentStatus: 'verified',
    uploadedAt: 'Yesterday',
    uploadedBy: 'Olus Yar',
  },
  {
    id: 'med-3',
    filename: 'screened-blood-bags-inventory.jpg',
    title: 'Cold Storage Screened Blood Bags',
    url: IMG.bloodBags,
    category: 'Facilities & Labs',
    size: '980 KB',
    dimensions: '1600 × 1066',
    usedCount: 4,
    usedPages: ['Live Inventory Bar', 'Services Screening', 'News Bulletin #2'],
    consentStatus: 'verified',
    uploadedAt: '3 days ago',
    uploadedBy: 'Web Administrator',
  },
  {
    id: 'med-4',
    filename: 'emergency-ambulance-quetta.jpg',
    title: '24/7 Rapid Ambulance Unit',
    url: IMG.ambulance,
    category: 'Vehicles',
    size: '1.8 MB',
    dimensions: '1920 × 1080',
    usedCount: 2,
    usedPages: ['Homepage Pillars', 'Services Ambulance'],
    consentStatus: 'verified',
    uploadedAt: '5 days ago',
    uploadedBy: 'Super Admin',
  },
  {
    id: 'med-5',
    filename: 'elisa-screening-laboratory.jpg',
    title: 'ELISA Diagnostic Screening Station',
    url: IMG.screeningLab,
    category: 'Facilities & Labs',
    size: '1.2 MB',
    dimensions: '1600 × 1200',
    usedCount: 1,
    usedPages: ['Services Page'],
    consentStatus: 'verified',
    uploadedAt: '1 week ago',
    uploadedBy: 'Web Administrator',
  },
  {
    id: 'med-6',
    filename: 'medical-team-camp-dispatch.jpg',
    title: 'Medical Clinical Team Drive',
    url: IMG.medicalTeam,
    category: 'People & Staff',
    size: '2.4 MB',
    dimensions: '2048 × 1536',
    usedCount: 2,
    usedPages: ['Committee & Staff', 'Pishin Camp Announcement'],
    consentStatus: 'verified',
    uploadedAt: '2 weeks ago',
    uploadedBy: 'Olus Yar',
  },
  {
    id: 'med-7',
    filename: 'pishin-community-blood-drive.jpg',
    title: 'Pishin Branch Community Camp',
    url: IMG.community,
    category: 'Camps & Drives',
    size: '1.6 MB',
    dimensions: '1920 × 1280',
    usedCount: 3,
    usedPages: ['Homepage Announcements', 'News Dispatch #1'],
    consentStatus: 'verified',
    uploadedAt: '2 weeks ago',
    uploadedBy: 'Super Admin',
  },
  {
    id: 'med-8',
    filename: 'thalassemia-patient-care.jpg',
    title: 'Thalassemia Child Transfusion Care',
    url: IMG.clinician,
    category: 'Thalassemia Care',
    size: '1.1 MB',
    dimensions: '1400 × 1050',
    usedCount: 1,
    usedPages: ['Thalassemia Patient Registry'],
    consentStatus: 'verified',
    uploadedAt: '3 weeks ago',
    uploadedBy: 'Web Administrator',
  },
  {
    id: 'med-9',
    filename: 'healthcare-partnership-network.jpg',
    title: 'Official Healthcare Sponsor Network',
    url: IMG.partnership,
    category: 'Partnerships',
    size: '1.7 MB',
    dimensions: '1920 × 1280',
    usedCount: 1,
    usedPages: ['News Article #3'],
    consentStatus: 'verified',
    uploadedAt: '1 month ago',
    uploadedBy: 'Super Admin',
  },
  {
    id: 'med-10',
    filename: 'balochistan-coverage-terrain.jpg',
    title: 'Balochistan Regional Network Landscape',
    url: IMG.landscape,
    category: 'Facilities & Labs',
    size: '2.8 MB',
    dimensions: '2560 × 1440',
    usedCount: 1,
    usedPages: ['Coverage & Network Map'],
    consentStatus: 'verified',
    uploadedAt: '1 month ago',
    uploadedBy: 'Olus Yar',
  },
];

const CATEGORIES = [
  'All Categories',
  'Camps & Drives',
  'Facilities & Labs',
  'Vehicles',
  'Thalassemia Care',
  'People & Staff',
  'Partnerships',
];

export default function AdminMedia() {
  const [items, setItems] = useState<MediaItem[]>(INITIAL_MEDIA);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [usageFilter, setUsageFilter] = useState<'all' | 'used' | 'unused'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals state
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MediaItem | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state for editing metadata
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<MediaItem['category']>('Camps & Drives');
  const [editConsent, setEditConsent] = useState<'verified' | 'pending'>('verified');

  // Load from localStorage or API on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pbb_admin_media_library');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {}

    api
      .get<MediaItem[]>('/cms/media')
      .then((res) => {
        if (res && Array.isArray(res) && res.length > 0) {
          setItems(res);
        }
      })
      .catch(() => {});
  }, []);

  function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    const newMediaItems: MediaItem[] = [];
    Array.from(files).forEach((file, index) => {
      if (!file.type.startsWith('image/')) {
        showToast(`Skipped ${file.name}: only image files are supported.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          const item: MediaItem = {
            id: `med-${Date.now()}-${index}`,
            filename: file.name,
            title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' '),
            url: dataUrl,
            category: 'Camps & Drives',
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            dimensions: 'Original High-Res',
            usedCount: 0,
            usedPages: [],
            consentStatus: 'verified',
            uploadedAt: 'Just now',
            uploadedBy: 'Super Admin',
          };

          setItems((prev) => {
            const next = [item, ...prev];
            try {
              localStorage.setItem('pbb_admin_media_library', JSON.stringify(next));
            } catch {}
            return next;
          });

          showToast(`Uploaded asset: ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function confirmDelete() {
    if (!deletingItem) return;

    setItems((prev) => {
      const next = prev.filter((i) => i.id !== deletingItem.id);
      try {
        localStorage.setItem('pbb_admin_media_library', JSON.stringify(next));
      } catch {}
      return next;
    });

    if (previewItem?.id === deletingItem.id) setPreviewItem(null);
    showToast(`Deleted asset: ${deletingItem.filename}`);
    setDeletingItem(null);
  }

  function openEditModal(item: MediaItem) {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditCategory(item.category);
    setEditConsent(item.consentStatus);
  }

  function handleSaveMetadata(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem) return;

    setItems((prev) => {
      const next = prev.map((item) => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            title: editTitle.trim() || item.filename,
            category: editCategory,
            consentStatus: editConsent,
          };
        }
        return item;
      });
      try {
        localStorage.setItem('pbb_admin_media_library', JSON.stringify(next));
      } catch {}
      return next;
    });

    showToast(`Updated metadata for "${editTitle || editingItem.filename}"`);
    setEditingItem(null);
  }

  function copyImageLink(url: string) {
    try {
      navigator.clipboard.writeText(url);
      showToast('Image URL copied to clipboard!');
    } catch {
      showToast('Failed to copy. URL selected in console.');
    }
  }

  const filteredItems = items.filter((item) => {
    if (usageFilter === 'used' && item.usedCount === 0) return false;
    if (usageFilter === 'unused' && item.usedCount > 0) return false;
    if (selectedCategory !== 'All Categories' && item.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.filename.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const usedAssetsCount = items.filter((i) => i.usedCount > 0).length;
  const verifiedConsentCount = items.filter((i) => i.consentStatus === 'verified').length;

  const categoryOptions = CATEGORIES.map((c) => ({ value: c, label: c }));
  const editCategoryOptions = CATEGORIES.filter((c) => c !== 'All Categories').map((c) => ({ value: c, label: c }));

  const topActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        type="button"
        className="btn btn-p btn-s"
        onClick={() => fileInputRef.current?.click()}
      >
        <Icon name="plus" size={14} />
        <span style={{ marginLeft: '4px' }}>📁 Upload Files</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileUpload(e.target.files)}
        style={{ display: 'none' }}
      />
    </div>
  );

  return (
    <AdminShell
      view="media"
      title="Media Library &amp; Assets"
      subtitle={`${items.length} total files · ${usedAssetsCount} active on live site`}
      actions={topActions}
    >
      {/* KPI Stats Row */}
      <div className="akpi" style={{ marginBottom: '20px' }}>
        <div className="c">
          <div className="l">Total Media Assets</div>
          <div className="n" style={{ color: 'var(--p)' }}>
            {items.length}
          </div>
        </div>
        <div className="c">
          <div className="l">Live Site Usage</div>
          <div className="n" style={{ color: '#22C55E' }}>
            {usedAssetsCount} Files
          </div>
        </div>
        <div className="c">
          <div className="l">Patient Consent Verified</div>
          <div className="n" style={{ color: '#3B82F6' }}>
            🛡️ {verifiedConsentCount}
          </div>
        </div>
        <div className="c">
          <div className="l">Cloud Storage Used</div>
          <div className="n" style={{ fontSize: '15px' }}>
            24.8 MB / 5.0 GB
          </div>
        </div>
      </div>

      {/* DRAG & DROP UPLOAD ZONE */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        style={{
          border: isDragOver ? '2px dashed var(--p)' : '1.5px dashed var(--line)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          background: isDragOver ? 'rgba(217, 35, 35, 0.06)' : 'var(--surf)',
          transition: 'all 0.2s ease',
          marginBottom: '22px',
          cursor: 'pointer',
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(217, 35, 35, 0.1)', color: 'var(--p)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
          <Icon name="image" size={22} />
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--txt1)' }}>
          Drag &amp; Drop media files here, or click to upload
        </h3>
        <p className="sm" style={{ margin: '0 0 12px 0', color: 'var(--txt2)' }}>
          Supports PNG, JPG, WebP, SVG (up to 10MB per file). Uploaded assets automatically integrate with page pickers.
        </p>
        <button
          type="button"
          className="btn btn-o btn-s"
          style={{ borderRadius: '10px', fontSize: '12px' }}
        >
          📁 Browse Local Files from Computer
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="afilters" style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '560px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="fld"
              placeholder="Search assets by title, filename, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '34px' }}
            />
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt3)' }}>
              <Icon name="search" size={15} />
            </span>
          </div>

          <div style={{ width: '170px' }}>
            <CustomSelect
              name="categoryFilter"
              options={categoryOptions}
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
            />
          </div>
        </div>

        {/* View Switcher & Usage Filter Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setUsageFilter('all')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '99px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              border: usageFilter === 'all' ? '1px solid var(--p)' : '1px solid var(--line)',
              background: usageFilter === 'all' ? 'rgba(217, 35, 35, 0.1)' : 'var(--surf)',
              color: usageFilter === 'all' ? 'var(--p)' : 'var(--txt2)',
            }}
          >
            All ({items.length})
          </button>

          <button
            type="button"
            onClick={() => setUsageFilter('used')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '99px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              border: usageFilter === 'used' ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(34, 197, 94, 0.25)',
              background: usageFilter === 'used' ? 'rgba(34, 197, 94, 0.18)' : 'rgba(34, 197, 94, 0.08)',
              color: '#22C55E',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
            Used ({usedAssetsCount})
          </button>

          <button
            type="button"
            onClick={() => setUsageFilter('unused')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '99px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              border: usageFilter === 'unused' ? '1px solid rgba(148, 163, 184, 0.5)' : '1px solid rgba(148, 163, 184, 0.25)',
              background: usageFilter === 'unused' ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.08)',
              color: '#94A3B8',
            }}
          >
            Unused ({items.length - usedAssetsCount})
          </button>

          {/* View Toggle */}
          <div style={{ display: 'flex', gap: '2px', background: 'var(--surf)', padding: '2px', borderRadius: '8px', border: '1px solid var(--line)', marginLeft: '4px' }}>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'grid' ? 'rgba(217, 35, 35, 0.15)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--p)' : 'var(--txt2)',
                cursor: 'pointer',
              }}
              title="Grid View"
            >
              ▦
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'list' ? 'rgba(217, 35, 35, 0.15)' : 'transparent',
                color: viewMode === 'list' ? 'var(--p)' : 'var(--txt2)',
                cursor: 'pointer',
              }}
              title="List View"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* VIEWMODE 1: AMAZING MEDIA GRID GALLERY */}
      {viewMode === 'grid' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="sec-tile"
              style={{
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid var(--line)',
                background: 'var(--surf)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
              }}
            >
              {/* Image Frame */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '145px',
                  backgroundColor: '#0F172A',
                  overflow: 'hidden',
                }}
                onClick={() => setPreviewItem(item)}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Consent & Usage Overlay Badges */}
                <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '4px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '99px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      backdropFilter: 'blur(4px)',
                      color: '#22C55E',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                    }}
                  >
                    🛡️ Consented
                  </span>
                </div>

                <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '99px',
                      background: item.usedCount > 0 ? 'rgba(34, 197, 94, 0.9)' : 'rgba(148, 163, 184, 0.8)',
                      color: '#FFF',
                    }}
                  >
                    {item.usedCount > 0 ? `Used ×${item.usedCount}` : 'Unused'}
                  </span>
                </div>
              </div>

              {/* Card Meta & Controls */}
              <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <b
                    style={{ fontSize: '13.5px', color: 'var(--txt1)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}
                    onClick={() => setPreviewItem(item)}
                  >
                    {item.title}
                  </b>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--p)', fontWeight: 700 }}>
                      {item.category}
                    </span>
                    <span style={{ fontSize: '10.5px', color: 'var(--txt3)' }}>
                      {item.size}
                    </span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--line)' }}>
                  <button
                    type="button"
                    className="btn btn-o btn-s"
                    style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '6px' }}
                    onClick={() => setPreviewItem(item)}
                    title="View Full Resolution"
                  >
                    🔍 View
                  </button>

                  <button
                    type="button"
                    className="btn btn-o btn-s"
                    style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '6px' }}
                    onClick={() => copyImageLink(item.url)}
                    title="Copy Image Link"
                  >
                    📋 Copy
                  </button>

                  <button
                    type="button"
                    className="btn btn-o btn-s"
                    style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '6px' }}
                    onClick={() => openEditModal(item)}
                    title="Edit Metadata"
                  >
                    ⚙️
                  </button>

                  <button
                    type="button"
                    className="btn-cross-delete"
                    onClick={() => setDeletingItem(item)}
                    title="Delete Asset"
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#EF4444',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '11px',
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--txt3)', background: 'var(--surf)', borderRadius: '16px', border: '1px solid var(--line)' }}>
              No media files found matching "{search}".
            </div>
          )}
        </div>
      )}

      {/* VIEWMODE 2: LIST TABLE VIEW */}
      {viewMode === 'list' && (
        <div className="atbl" style={{ marginBottom: '24px', overflowX: 'hidden' }}>
          <table style={{ width: '100%', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: '36%' }}>Asset &amp; Filename</th>
                <th style={{ width: '16%' }}>Category</th>
                <th style={{ width: '12%' }}>Dimensions</th>
                <th style={{ width: '12%' }}>Consent</th>
                <th style={{ width: '10%' }}>Usage</th>
                <th style={{ width: '14%', textAlign: 'right', paddingRight: '16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td className="m2" style={{ paddingRight: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={item.url}
                        alt={item.title}
                        style={{ width: '48px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--line)', cursor: 'pointer' }}
                        onClick={() => setPreviewItem(item)}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div className="nm" style={{ fontWeight: 700, fontSize: '14px', color: 'var(--txt1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title}
                        </div>
                        <div className="sm" style={{ fontSize: '11px', color: 'var(--txt3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.filename} · {item.size}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--p)' }}>
                    {item.category}
                  </td>

                  <td style={{ fontSize: '12px', color: 'var(--txt2)' }}>
                    {item.dimensions}
                  </td>

                  <td>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#22C55E' }}>
                      🛡️ Consented
                    </span>
                  </td>

                  <td>
                    <span className={`tag ${item.usedCount > 0 ? 'ok' : 'gy'}`} style={{ fontSize: '11px' }}>
                      {item.usedCount > 0 ? `Used ×${item.usedCount}` : 'Unused'}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-o btn-s"
                        style={{ padding: '5px 8px', borderRadius: '8px' }}
                        onClick={() => setPreviewItem(item)}
                        title="View Full Resolution"
                      >
                        🔍
                      </button>

                      <button
                        type="button"
                        className="btn btn-o btn-s"
                        style={{ padding: '5px 8px', borderRadius: '8px' }}
                        onClick={() => openEditModal(item)}
                        title="Edit Metadata"
                      >
                        ⚙️
                      </button>

                      <button
                        type="button"
                        className="btn-cross-delete"
                        onClick={() => setDeletingItem(item)}
                        title="Delete Asset"
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
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2-COLUMN HIGH-END FEATURE CARDS EQUAL HEIGHT */}
      <div className="g2" style={{ gap: '20px', alignItems: 'stretch' }}>
        {/* CARD 1: CENTRALIZED DISTRIBUTION */}
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
                  <Icon name="image" size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: 'var(--txt1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Centralized Asset Repository
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
                Live Sync
              </span>
            </div>

            <p className="sm" style={{ margin: '0 0 14px 0', fontSize: '13px', color: 'var(--txt2)', lineHeight: 1.55 }}>
              Upload once, deploy everywhere. The public homepage, news bulletins, branch photos, and page blocks all pick assets from this unified library.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--txt1)', fontWeight: 600 }}>
              <span style={{ color: '#22C55E' }}>✓</span>
              <span>Single source of truth across all 14 town portals</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--txt1)', fontWeight: 600 }}>
              <span style={{ color: '#22C55E' }}>✓</span>
              <span>Automatic usage tracking prevents deleting live media</span>
            </div>
          </div>
        </div>

        {/* CARD 2: PATIENT & CHILD CONSENT PROTECTION */}
        <div
          className="acard"
          style={{
            borderRadius: '20px',
            padding: '22px',
            background: 'var(--surf)',
            border: '1px solid rgba(217, 35, 35, 0.35)',
            boxShadow: '0 8px 30px rgba(217, 35, 35, 0.06)',
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
                    background: 'rgba(217, 35, 35, 0.12)',
                    color: 'var(--p)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon name="shield" size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: 'var(--txt1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Patient &amp; Child Consent Compliance
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
                  border: '1px solid rgba(217, 35, 35, 0.35)',
                  background: 'rgba(217, 35, 35, 0.12)',
                  color: 'var(--p)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                🛡️ Enforced Shield
              </span>
            </div>

            <p className="sm" style={{ margin: '0 0 14px 0', fontSize: '13px', color: 'var(--txt2)', lineHeight: 1.55 }}>
              Photographs of thalassemic children, minor patients, and voluntary donors carry an enforced consent flag.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--txt1)', fontWeight: 600 }}>
              <span style={{ color: 'var(--p)' }}>🔒</span>
              <span>Mandatory verified consent before public publishing</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--txt1)', fontWeight: 600 }}>
              <span style={{ color: 'var(--p)' }}>🔒</span>
              <span>Automated blocker refuses unverified media pickers</span>
            </div>
          </div>
        </div>
      </div>

      {/* FULL RESOLUTION LIGHTBOX PREVIEW MODAL */}
      {previewItem && (
        <>
          <div
            className="sheetov on"
            onClick={() => setPreviewItem(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
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
              width: '92%',
              maxWidth: '740px',
              maxHeight: '90vh',
              overflowY: 'auto',
              zIndex: 1001,
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.5)',
              background: 'var(--surf)',
              borderRadius: '24px',
              padding: '26px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--p)', fontWeight: 800 }}>
                  Media Asset Inspector
                </span>
                <h2 style={{ fontSize: '19px', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--txt1)' }}>
                  {previewItem.title}
                </h2>
              </div>
              <button
                type="button"
                className="btn-cross-delete"
                onClick={() => setPreviewItem(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '18px', textAlign: 'center', backgroundColor: '#0B0F19', borderRadius: '16px', padding: '12px', border: '1px solid var(--line)' }}>
              <img
                src={previewItem.url}
                alt={previewItem.title}
                style={{ maxWidth: '100%', maxHeight: '360px', objectFit: 'contain', borderRadius: '10px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <div>
                <span className="sm" style={{ fontSize: '11px', color: 'var(--txt3)' }}>Filename:</span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--txt1)' }}>{previewItem.filename}</div>
              </div>
              <div>
                <span className="sm" style={{ fontSize: '11px', color: 'var(--txt3)' }}>Category:</span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--p)' }}>{previewItem.category}</div>
              </div>
              <div>
                <span className="sm" style={{ fontSize: '11px', color: 'var(--txt3)' }}>File Size &amp; Resolution:</span>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--txt1)' }}>{previewItem.size} · {previewItem.dimensions}</div>
              </div>
              <div>
                <span className="sm" style={{ fontSize: '11px', color: 'var(--txt3)' }}>Live Public Placements:</span>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#22C55E' }}>
                  {previewItem.usedPages.length > 0 ? previewItem.usedPages.join(', ') : 'Not assigned to public pages'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-p"
                style={{ flex: 1, borderRadius: '10px' }}
                onClick={() => copyImageLink(previewItem.url)}
              >
                📋 Copy Image Link
              </button>
              <button
                type="button"
                className="btn btn-o"
                style={{ borderRadius: '10px' }}
                onClick={() => {
                  openEditModal(previewItem);
                  setPreviewItem(null);
                }}
              >
                ⚙️ Edit Metadata
              </button>
            </div>
          </div>
        </>
      )}

      {/* EDIT METADATA MODAL */}
      {editingItem && (
        <>
          <div
            className="sheetov on"
            onClick={() => setEditingItem(null)}
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
              <h2 style={{ fontSize: '19px', fontWeight: 800, margin: 0, color: 'var(--txt1)' }}>Edit Asset Metadata</h2>
              <button
                type="button"
                className="btn-cross-delete"
                onClick={() => setEditingItem(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMetadata} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>Asset Display Title</label>
                <input
                  type="text"
                  className="fld"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700, display: 'block', marginBottom: '6px' }}>Category</label>
                <CustomSelect
                  name="editCategory"
                  options={editCategoryOptions}
                  value={editCategory}
                  onChange={(val) => setEditCategory(val as any)}
                />
              </div>

              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>Patient / Child Consent Flag</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button
                    type="button"
                    className={`tag ${editConsent === 'verified' ? 'ok' : 'gy'}`}
                    onClick={() => setEditConsent('verified')}
                    style={{ padding: '6px 14px', cursor: 'pointer' }}
                  >
                    🛡️ Verified Consent
                  </button>
                  <button
                    type="button"
                    className={`tag ${editConsent === 'pending' ? 'ok' : 'gy'}`}
                    onClick={() => setEditConsent('pending')}
                    style={{ padding: '6px 14px', cursor: 'pointer' }}
                  >
                    ⚠️ Pending Consent
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-p" style={{ flex: 1, borderRadius: '10px' }}>
                  Save Metadata Changes
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
                Delete Media Asset?
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--txt2)', margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to delete <b>"{deletingItem.filename}"</b>?
                {deletingItem.usedCount > 0 && (
                  <span style={{ display: 'block', color: 'var(--p)', fontWeight: 700, marginTop: '6px' }}>
                    ⚠️ Warning: This file is currently used on {deletingItem.usedCount} live public pages ({deletingItem.usedPages.join(', ')}).
                  </span>
                )}
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
                Delete File
              </button>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
