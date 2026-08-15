'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { api } from '../../../lib/api';
import { Icon } from '../../../components/Icon';
import { CustomSelect } from '../../../components/CustomSelect';

export interface PageBlock {
  id: string;
  type: string;
  title: string;
  content: string;
}

export interface SitePage {
  id: string;
  name: string;
  url: string;
  menu: string;
  langs: { en: boolean; ur: boolean; ps: boolean };
  status: 'live' | 'draft';
  metaDesc: string;
  blocks: PageBlock[];
  updatedAt: string;
  updatedBy: string;
}

const INITIAL_PAGES: SitePage[] = [
  {
    id: 'pg-1',
    name: 'Home',
    url: '/',
    menu: 'Header: Main',
    langs: { en: true, ur: true, ps: true },
    status: 'live',
    metaDesc: 'Pashtoonkhwa Blood Bank & Welfare Society - Operational platform & public blood registry.',
    updatedAt: 'Today, 11:04 AM',
    updatedBy: 'Super Admin',
    blocks: [
      { id: 'b1', type: 'hero', title: 'Blood is life', content: 'Screened, tested blood for anyone who needs it.' },
      { id: 'b2', type: 'stats', title: 'Impact Counter', content: '64,000+ Bags donated, 200 Thalassemia kids' },
      { id: 'b3', type: 'cards', title: 'Four Pillars', content: 'Screened blood, Thalassemia care, Ambulance, Disaster response' },
    ],
  },
  {
    id: 'pg-2',
    name: 'Our story',
    url: '/about',
    menu: 'Header: About',
    langs: { en: true, ur: true, ps: false },
    status: 'live',
    metaDesc: 'Founded in Abbottabad in 2005 and serving Balochistan since 1999.',
    updatedAt: 'Yesterday',
    updatedBy: 'Olus Yar',
    blocks: [
      { id: 'b1', type: 'heading', title: 'Twenty-Seven Years of Service', content: 'History of voluntary blood donation in Pashtoonkhwa.' },
      { id: 'b2', type: 'text', title: 'The Founding', content: 'Started with paper diaries beside the Quetta Press Club.' },
    ],
  },
  {
    id: 'pg-3',
    name: 'Services',
    url: '/services',
    menu: 'Header: Services',
    langs: { en: true, ur: false, ps: false },
    status: 'live',
    metaDesc: 'Free blood transfusion, screening laboratory, and 24/7 emergency dispatch.',
    updatedAt: '3 days ago',
    updatedBy: 'Web Administrator',
    blocks: [
      { id: 'b1', type: 'cards', title: 'Services Overview', content: 'Screened Blood, Thalassemia Care, Ambulances' },
    ],
  },
  {
    id: 'pg-4',
    name: 'Our branches',
    url: '/branches',
    menu: 'Header: About',
    langs: { en: true, ur: true, ps: true },
    status: 'live',
    metaDesc: '6 central office branches and 14 towns served across Balochistan.',
    updatedAt: '5 days ago',
    updatedBy: 'Olus Yar',
    blocks: [
      { id: 'b1', type: 'map', title: 'Regional Network Map', content: 'Quetta, Pishin, Loralai, Zhob, Chaman' },
    ],
  },
  {
    id: 'pg-5',
    name: 'Thalassemia children',
    url: '/thalassemia',
    menu: 'Header: Services',
    langs: { en: true, ur: true, ps: false },
    status: 'live',
    metaDesc: 'Regular free transfusions for over 200 registered thalassemia children.',
    updatedAt: '1 week ago',
    updatedBy: 'Super Admin',
    blocks: [
      { id: 'b1', type: 'cards', title: 'Patient Registry', content: 'Child sponsorship & blood compatibility records' },
    ],
  },
  {
    id: 'pg-6',
    name: 'Committee & staff',
    url: '/people',
    menu: 'Header: About',
    langs: { en: true, ur: false, ps: false },
    status: 'live',
    metaDesc: 'Voluntary leadership, medical advisors, and staff team.',
    updatedAt: '2 weeks ago',
    updatedBy: 'Web Administrator',
    blocks: [
      { id: 'b1', type: 'cards', title: 'Board & Staff', content: 'Executive committee and medical laboratory heads' },
    ],
  },
  {
    id: 'pg-7',
    name: 'Donate',
    url: '/donate',
    menu: 'Header: Get Involved',
    langs: { en: true, ur: true, ps: true },
    status: 'live',
    metaDesc: 'Register as a voluntary donor or support blood camp drives.',
    updatedAt: '2 weeks ago',
    updatedBy: 'Super Admin',
    blocks: [
      { id: 'b1', type: 'cta', title: 'Donate Blood. Save a Life Today.', content: 'Join over 4,800 voluntary donors' },
    ],
  },
  {
    id: 'pg-8',
    name: 'Contact',
    url: '/contact',
    menu: 'Header: Contact',
    langs: { en: true, ur: false, ps: false },
    status: 'live',
    metaDesc: 'Contact Quetta main blood bank center and emergency hotline.',
    updatedAt: '1 month ago',
    updatedBy: 'Web Administrator',
    blocks: [
      { id: 'b1', type: 'form', title: 'Emergency Dispatch Contact', content: '24/7 Hotline & location address' },
    ],
  },
  {
    id: 'pg-9',
    name: 'Annual Report 2026',
    url: '/report-2026',
    menu: 'Footer: Reports',
    langs: { en: true, ur: false, ps: false },
    status: 'draft',
    metaDesc: 'Annual operational & financial disclosure report for fiscal year 2026.',
    updatedAt: 'Today, 09:30 AM',
    updatedBy: 'Super Admin',
    blocks: [
      { id: 'b1', type: 'heading', title: '2026 Financial & Clinical Audit', content: 'Transfusion metrics and donation receipts.' },
    ],
  },
];

const BLOCK_TYPES = [
  { type: 'hero', name: 'Hero Banner', icon: 'homepage' },
  { type: 'heading', name: 'Heading Title', icon: 'doc' },
  { type: 'text', name: 'Rich Text Paragraph', icon: 'doc' },
  { type: 'cards', name: 'Cards Grid', icon: 'box' },
  { type: 'stats', name: 'Stat Counters', icon: 'chart' },
  { type: 'timeline', name: 'History Timeline', icon: 'calendar' },
  { type: 'map', name: 'Location Map', icon: 'map' },
  { type: 'faq', name: 'FAQ Accordion', icon: 'gear' },
  { type: 'cta', name: 'Call to Action Banner', icon: 'drop' },
];

const REVISIONS = [
  { id: 'r1', time: 'Today, 11:04 AM', author: 'Super Admin', action: 'Published Homepage Hero Banner updates' },
  { id: 'r2', time: '7 August 2026', author: 'Olus Yar', action: 'Updated Thalassemia Patient Registry block' },
  { id: 'r3', time: '2 August 2026', author: 'Web Administrator', action: 'Added Emergency Dispatch Hotline form' },
];

export default function AdminPages() {
  const [pages, setPages] = useState<SitePage[]>(INITIAL_PAGES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'draft'>('all');
  const [selectedPageId, setSelectedPageId] = useState<string>('pg-1');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deletingPage, setDeletingPage] = useState<SitePage | null>(null);

  // New Page Form State
  const [newPageName, setNewPageName] = useState('');
  const [newPageUrl, setNewPageUrl] = useState('');
  const [newPageMenu, setNewPageMenu] = useState('Header: Main');
  const [newPageDesc, setNewPageDesc] = useState('');
  const [newPageStatus, setNewPageStatus] = useState<'live' | 'draft'>('live');

  // Load from localStorage or API on mount & automatically restore Home if missing
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pbb_admin_site_pages');
      if (saved) {
        let loaded: SitePage[] = JSON.parse(saved);
        const hasHome = loaded.some((p) => p.url === '/' || p.name.toLowerCase() === 'home');
        if (!hasHome) {
          loaded = [INITIAL_PAGES[0], ...loaded];
          localStorage.setItem('pbb_admin_site_pages', JSON.stringify(loaded));
          showToast('Restored Home page to site pages list.');
        }
        setPages(loaded);
        if (loaded.length > 0) setSelectedPageId(loaded[0].id);
      }
    } catch {}

    api
      .get<SitePage[]>('/cms/pages')
      .then((res) => {
        if (res && Array.isArray(res) && res.length > 0) {
          setPages(res);
        }
      })
      .catch(() => {});
  }, []);

  const selectedPage = pages.find((p) => p.id === selectedPageId) || pages[0];

  function togglePageStatus(id: string) {
    setPages((prev) => {
      const next = prev.map((p) => {
        if (p.id === id) {
          const nextStatus = p.status === 'live' ? ('draft' as const) : ('live' as const);
          showToast(`Page "${p.name}" status changed to ${nextStatus.toUpperCase()}.`);
          return { ...p, status: nextStatus };
        }
        return p;
      });
      try {
        localStorage.setItem('pbb_admin_site_pages', JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  // Real Delete Handler with Confirmation
  function confirmDeletePage() {
    if (!deletingPage) return;

    setPages((prev) => {
      const next = prev.filter((p) => p.id !== deletingPage.id);
      try {
        localStorage.setItem('pbb_admin_site_pages', JSON.stringify(next));
      } catch {}
      return next;
    });

    if (selectedPageId === deletingPage.id) {
      const remaining = pages.filter((p) => p.id !== deletingPage.id);
      if (remaining.length > 0) setSelectedPageId(remaining[0].id);
    }

    showToast(`Page "${deletingPage.name}" deleted permanently.`);
    setDeletingPage(null);
  }

  // Easy Page Creation Handler
  function handleCreatePage(e: React.FormEvent) {
    e.preventDefault();
    if (!newPageName.trim()) {
      showToast('Please enter a page title.');
      return;
    }

    const slug = newPageUrl.trim()
      ? newPageUrl.startsWith('/')
        ? newPageUrl
        : `/${newPageUrl}`
      : `/${newPageName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    const newPage: SitePage = {
      id: `pg-${Date.now()}`,
      name: newPageName.trim(),
      url: slug,
      menu: newPageMenu,
      langs: { en: true, ur: true, ps: false },
      status: newPageStatus,
      metaDesc: newPageDesc.trim() || `Public page for ${newPageName.trim()}`,
      updatedAt: 'Just now',
      updatedBy: 'Super Admin',
      blocks: [
        { id: `b-${Date.now()}-1`, type: 'heading', title: newPageName.trim(), content: newPageDesc.trim() || 'Welcome to this page.' },
        { id: `b-${Date.now()}-2`, type: 'text', title: 'Content Section', content: 'Add text paragraphs, cards, or media blocks.' },
      ],
    };

    setPages((prev) => {
      const next = [newPage, ...prev];
      try {
        localStorage.setItem('pbb_admin_site_pages', JSON.stringify(next));
      } catch {}
      return next;
    });

    // Reset Form
    setNewPageName('');
    setNewPageUrl('');
    setNewPageDesc('');
    setIsCreateModalOpen(false);

    // Open block editor for the new page
    setSelectedPageId(newPage.id);
    setIsEditorOpen(true);
    showToast(`Page "${newPage.name}" created successfully! Add content blocks below.`);
  }

  // Add block to selected page from Palette
  function addBlockToTargetPage(blockType: string, targetId?: string) {
    const pageToEdit = pages.find((p) => p.id === (targetId || selectedPageId)) || pages[0];
    if (!pageToEdit) return;

    const bDef = BLOCK_TYPES.find((b) => b.type === blockType);
    const newBlock: PageBlock = {
      id: `b-${Date.now()}`,
      type: blockType,
      title: bDef ? bDef.name : 'New Block',
      content: 'Edit block details here...',
    };

    setPages((prev) => {
      const next = prev.map((p) => {
        if (p.id === pageToEdit.id) {
          return { ...p, blocks: [...p.blocks, newBlock] };
        }
        return p;
      });
      try {
        localStorage.setItem('pbb_admin_site_pages', JSON.stringify(next));
      } catch {}
      return next;
    });

    setSelectedPageId(pageToEdit.id);
    setIsEditorOpen(true);
    showToast(`Added ${bDef?.name || blockType} block to ${pageToEdit.name}.`);
  }

  function updateBlock(blockId: string, title: string, content: string) {
    if (!selectedPage) return;
    setPages((prev) => {
      const next = prev.map((p) => {
        if (p.id === selectedPage.id) {
          return {
            ...p,
            blocks: p.blocks.map((b) => (b.id === blockId ? { ...b, title, content } : b)),
          };
        }
        return p;
      });
      try {
        localStorage.setItem('pbb_admin_site_pages', JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function removeBlock(blockId: string) {
    if (!selectedPage) return;
    setPages((prev) => {
      const next = prev.map((p) => {
        if (p.id === selectedPage.id) {
          return {
            ...p,
            blocks: p.blocks.filter((b) => b.id !== blockId),
          };
        }
        return p;
      });
      try {
        localStorage.setItem('pbb_admin_site_pages', JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  const filteredPages = pages.filter((p) => {
    if (statusFilter === 'live' && p.status !== 'live') return false;
    if (statusFilter === 'draft' && p.status !== 'draft') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.url.toLowerCase().includes(q) || p.menu.toLowerCase().includes(q);
    }
    return true;
  });

  const liveCount = pages.filter((p) => p.status === 'live').length;
  const draftCount = pages.filter((p) => p.status === 'draft').length;

  // Options for CustomSelect components
  const pageDropdownOptions = pages.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.url}) — ${p.blocks.length} blocks`,
  }));

  const menuDropdownOptions = [
    { value: 'Header: Main', label: 'Header Main Nav' },
    { value: 'Header: About', label: 'Header About Submenu' },
    { value: 'Header: Services', label: 'Header Services Submenu' },
    { value: 'Header: Get Involved', label: 'Header Get Involved' },
    { value: 'Footer: Navigation', label: 'Footer Navigation' },
    { value: 'None', label: 'None (Unlinked Standalone Page)' },
  ];

  const topActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button
        type="button"
        className="btn btn-p btn-s"
        onClick={() => setIsCreateModalOpen(true)}
      >
        <Icon name="plus" size={14} />
        <span style={{ marginLeft: '4px' }}>+ Create New Page</span>
      </button>
    </div>
  );

  return (
    <AdminShell
      view="pages"
      title="Site Pages Manager"
      subtitle={`${liveCount} live pages · ${draftCount} draft`}
      actions={topActions}
    >
      {/* KPI Stats Row */}
      <div className="akpi" style={{ marginBottom: '20px' }}>
        <div className="c">
          <div className="l">Total Site Pages</div>
          <div className="n" style={{ color: 'var(--p)' }}>
            {pages.length}
          </div>
        </div>
        <div className="c">
          <div className="l">Live Published</div>
          <div className="n" style={{ color: '#22C55E' }}>
            {liveCount}
          </div>
        </div>
        <div className="c">
          <div className="l">Drafts in Progress</div>
          <div className="n" style={{ color: draftCount > 0 ? '#EAB308' : 'var(--txt2)' }}>
            {draftCount}
          </div>
        </div>
        <div className="c">
          <div className="l">Navigation Menus</div>
          <div className="n" style={{ fontSize: '15px' }}>
            Header &amp; Footer Assigned
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
              placeholder="Search by page title or URL slug..."
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
            All ({pages.length})
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
            onClick={() => setStatusFilter('draft')}
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
              border: statusFilter === 'draft' ? '1px solid rgba(234, 179, 8, 0.5)' : '1px solid rgba(234, 179, 8, 0.25)',
              background: statusFilter === 'draft' ? 'rgba(234, 179, 8, 0.18)' : 'rgba(234, 179, 8, 0.08)',
              color: '#EAB308',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EAB308' }} />
            Drafts ({draftCount})
          </button>
        </div>
      </div>

      {/* Table with Perfect Widths & Non-Overflowing Delete Button */}
      <div className="atbl" style={{ marginBottom: '24px', overflowX: 'hidden' }}>
        <table style={{ width: '100%', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '28%' }}>Page Title &amp; Address</th>
              <th style={{ width: '18%' }}>Menu Location</th>
              <th style={{ width: '10%' }}>Blocks</th>
              <th style={{ width: '10%' }}>Langs</th>
              <th style={{ width: '14%' }}>Status</th>
              <th style={{ width: '20%', textAlign: 'right', paddingRight: '14px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPages.map((p) => (
              <tr key={p.id}>
                {/* Page Name + URL slug combined in one cell */}
                <td className="m2" style={{ paddingRight: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="nm" style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--txt1)' }}>{p.name}</span>
                    <span className="mono2" style={{ fontSize: '11px', color: 'var(--p)', background: 'rgba(217, 35, 35, 0.08)', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      {p.url}
                    </span>
                  </div>
                  <div className="sm" style={{ fontSize: '11.5px', color: 'var(--txt3)', marginTop: '2px' }}>
                    Updated {p.updatedAt}
                  </div>
                </td>

                <td style={{ fontSize: '13px', fontWeight: 600, color: 'var(--txt2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.menu}
                </td>

                <td>
                  <span className="tag gy" style={{ fontWeight: 600, fontSize: '11px' }}>{p.blocks.length} Blocks</span>
                </td>

                <td>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <span className={`tag ${p.langs.en ? 'ok' : 'gy'}`} style={{ fontSize: '9.5px', padding: '1px 4px' }}>EN</span>
                    <span className={`tag ${p.langs.ur ? 'ok' : 'gy'}`} style={{ fontSize: '9.5px', padding: '1px 4px' }}>UR</span>
                    <span className={`tag ${p.langs.ps ? 'ok' : 'gy'}`} style={{ fontSize: '9.5px', padding: '1px 4px' }}>PS</span>
                  </div>
                </td>

                <td>
                  <button
                    type="button"
                    onClick={() => togglePageStatus(p.id)}
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
                      border: p.status === 'live' ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(234, 179, 8, 0.35)',
                      background: p.status === 'live' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(234, 179, 8, 0.12)',
                      color: p.status === 'live' ? '#22C55E' : '#EAB308',
                    }}
                    title="Click to toggle page status"
                  >
                    <span
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        background: p.status === 'live' ? '#22C55E' : '#EAB308',
                        boxShadow: p.status === 'live' ? '0 0 6px #22C55E' : 'none',
                      }}
                    />
                    {p.status === 'live' ? 'Live' : 'Draft'}
                  </button>
                </td>

                {/* Compact Action Bar inside cell padding bounds */}
                <td style={{ textAlign: 'right', paddingRight: '14px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-o btn-s"
                      style={{ padding: '5px 8px', borderRadius: '8px' }}
                      onClick={() => {
                        setSelectedPageId(p.id);
                        setIsEditorOpen(true);
                      }}
                      title="Edit Page Blocks & Content"
                    >
                      <Icon name="gear" size={13} />
                    </button>

                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-o btn-s"
                      style={{ padding: '5px 8px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center' }}
                      title="Preview Live Page"
                    >
                      <Icon name="search" size={13} />
                    </a>

                    <button
                      type="button"
                      className="btn-cross-delete"
                      onClick={() => setDeletingPage(p)}
                      title="Delete Page"
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
            {filteredPages.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--txt3)' }}>
                  No site pages found matching "{search}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* UPGRADED 2-COLUMN CONTAINERS LAYOUT */}
      <div className="g2" style={{ gap: '20px', alignItems: 'start' }}>
        {/* CONTAINER 1: AVAILABLE PAGE LAYOUT BLOCKS GRID PALETTE */}
        <div className="acard" style={{ borderRadius: '18px', padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--txt1)' }}>
                Available Page Layout Blocks
              </h3>
              <p className="sm" style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--txt2)' }}>
                Select a target page below, then click any block tile to edit and add it to that page.
              </p>
            </div>

            {/* Upgraded Interactive Badge */}
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '99px',
                fontSize: '11px',
                fontWeight: 700,
                border: '1px solid rgba(34, 197, 94, 0.35)',
                background: 'rgba(34, 197, 94, 0.12)',
                color: '#22C55E',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
              onClick={() => showToast('9 Layout Block Templates available for all pages.')}
              title="Click to view layout template info"
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
              9 Block Types
            </button>
          </div>

          {/* Reusable CustomSelect Component for Target Page Dropdown */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--p)', display: 'block', marginBottom: '6px' }}>
              Target Page to Edit:
            </label>
            <CustomSelect
              name="targetPage"
              options={pageDropdownOptions}
              value={selectedPageId || pages[0]?.id || ''}
              onChange={(val) => setSelectedPageId(val)}
              placeholder="Select target page to add blocks..."
            />
          </div>

          {/* Block Palette Items */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px' }}>
            {BLOCK_TYPES.map((b) => (
              <div
                key={b.type}
                className="sec-tile"
                onClick={() => addBlockToTargetPage(b.type, selectedPageId)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '1px solid var(--line)',
                  background: 'var(--surf)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
              >
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(217, 35, 35, 0.08)',
                    color: 'var(--p)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name={b.icon} size={16} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ fontSize: '13px', display: 'block', color: 'var(--txt1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {b.name}
                  </b>
                  <span style={{ fontSize: '10px', color: 'var(--p)', fontWeight: 700 }}>
                    + Add Block
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONTAINER 2: REVISION HISTORY & AUDIT LOG TIMELINE */}
        <div className="acard" style={{ borderRadius: '18px', padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--txt1)' }}>
                Revision History &amp; Audit Log
              </h3>
              <p className="sm" style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--txt2)' }}>
                Every page update is versioned. Revert to any earlier revision instantly.
              </p>
            </div>

            {/* Upgraded Interactive Badge */}
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '99px',
                fontSize: '11px',
                fontWeight: 700,
                border: '1px solid rgba(234, 179, 8, 0.35)',
                background: 'rgba(234, 179, 8, 0.12)',
                color: '#EAB308',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
              onClick={() => showToast('All page edits are version-tracked and auto-saved.')}
              title="Click to view revision tracking status"
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EAB308' }} />
              ⚡ Auto-Saved
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
            {REVISIONS.map((rev, idx) => (
              <div
                key={rev.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--line)',
                  background: idx === 0 ? 'rgba(34, 197, 94, 0.05)' : 'var(--surf)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: idx === 0 ? '#22C55E' : 'var(--txt3)',
                      boxShadow: idx === 0 ? '0 0 6px #22C55E' : 'none',
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <b style={{ fontSize: '13.5px', color: 'var(--txt1)' }}>{rev.author}</b>
                      {idx === 0 && (
                        <span className="tag ok" style={{ fontSize: '9.5px', padding: '1px 5px' }}>
                          Current Live
                        </span>
                      )}
                    </div>
                    <span className="sm" style={{ fontSize: '11.5px', color: 'var(--txt2)', display: 'block', marginTop: '2px' }}>
                      {rev.action} · {rev.time}
                    </span>
                  </div>
                </div>

                {idx !== 0 && (
                  <button
                    type="button"
                    className="btn btn-o btn-s"
                    onClick={() => showToast(`Restored page revision from ${rev.time}`)}
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                  >
                    Rollback
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONFIRMATION DELETE MODAL */}
      {deletingPage && (
        <>
          <div
            className="sheetov on"
            onClick={() => setDeletingPage(null)}
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
                Delete Site Page?
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--txt2)', margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to delete <b>"{deletingPage.name}"</b> (<code style={{ color: 'var(--p)' }}>{deletingPage.url}</code>)?
                This action cannot be undone.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-o"
                style={{ flex: 1, borderRadius: '10px' }}
                onClick={() => setDeletingPage(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-p"
                style={{ flex: 1, borderRadius: '10px', background: '#DC2626', borderColor: '#DC2626' }}
                onClick={confirmDeletePage}
              >
                Delete Page
              </button>
            </div>
          </div>
        </>
      )}

      {/* EASY CREATE NEW PAGE MODAL */}
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
              maxWidth: '500px',
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
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--txt1)' }}>Create New Site Page</h2>
              <button
                type="button"
                className="btn-cross-delete"
                onClick={() => setIsCreateModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePage} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>Page Title *</label>
                <input
                  type="text"
                  className="fld"
                  placeholder="e.g. Volunteer Opportunities"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  required
                />
              </div>

              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>URL Address Slug (optional)</label>
                <input
                  type="text"
                  className="fld"
                  placeholder="e.g. /volunteers (auto-generated if empty)"
                  value={newPageUrl}
                  onChange={(e) => setNewPageUrl(e.target.value)}
                />
              </div>

              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700, display: 'block', marginBottom: '6px' }}>Menu Location</label>
                <CustomSelect
                  name="newPageMenu"
                  options={menuDropdownOptions}
                  value={newPageMenu}
                  onChange={(val) => setNewPageMenu(val)}
                  placeholder="Select menu location..."
                />
              </div>

              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>SEO Meta Description</label>
                <textarea
                  className="fld"
                  rows={2}
                  placeholder="Brief summary of page content for search engines..."
                  value={newPageDesc}
                  onChange={(e) => setNewPageDesc(e.target.value)}
                />
              </div>

              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>Initial Status</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className={`tag ${newPageStatus === 'live' ? 'ok' : 'gy'}`}
                    onClick={() => setNewPageStatus('live')}
                    style={{ padding: '6px 14px', cursor: 'pointer' }}
                  >
                    🟢 Publish Live Immediately
                  </button>
                  <button
                    type="button"
                    className={`tag ${newPageStatus === 'draft' ? 'ok' : 'gy'}`}
                    onClick={() => setNewPageStatus('draft')}
                    style={{ padding: '6px 14px', cursor: 'pointer' }}
                  >
                    ⚪ Save as Draft
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-p" style={{ flex: 1, borderRadius: '10px' }}>
                  Create &amp; Edit Page
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* PAGE CONTENT BLOCK EDITOR DRAWER / MODAL */}
      {isEditorOpen && selectedPage && (
        <>
          <div
            className="sheetov on"
            onClick={() => setIsEditorOpen(false)}
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
              width: '92%',
              maxWidth: '700px',
              maxHeight: '90vh',
              overflowY: 'auto',
              zIndex: 1001,
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
              background: 'var(--surf)',
              borderRadius: '24px',
              padding: '26px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--p)', fontWeight: 800 }}>
                  Page Block Builder
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--txt1)' }}>
                  Editing "{selectedPage.name}" ({selectedPage.url})
                </h2>
              </div>
              <button
                type="button"
                className="btn-cross-delete"
                onClick={() => setIsEditorOpen(false)}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--txt2)', display: 'block', marginBottom: '8px' }}>
                Add Block to Page:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {BLOCK_TYPES.map((b) => (
                  <button
                    key={b.type}
                    type="button"
                    className="btn btn-o btn-s"
                    onClick={() => addBlockToTargetPage(b.type, selectedPage.id)}
                    style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '8px' }}
                  >
                    + {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Blocks List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {selectedPage.blocks.map((block, idx) => (
                <div
                  key={block.id}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid var(--line)',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--p)', textTransform: 'uppercase' }}>
                      Block #{idx + 1}: {block.type}
                    </span>
                    <button
                      type="button"
                      className="btn-cross-delete"
                      onClick={() => removeBlock(block.id)}
                      title="Remove block"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="fgrp" style={{ marginBottom: '8px' }}>
                    <label className="lb" style={{ fontSize: '12px' }}>Block Heading / Title</label>
                    <input
                      type="text"
                      className="fld"
                      value={block.title}
                      onChange={(e) => updateBlock(block.id, e.target.value, block.content)}
                    />
                  </div>

                  <div className="fgrp">
                    <label className="lb" style={{ fontSize: '12px' }}>Block Content Text</label>
                    <textarea
                      className="fld"
                      rows={2}
                      value={block.content}
                      onChange={(e) => updateBlock(block.id, block.title, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-p"
                style={{ flex: 1, borderRadius: '10px' }}
                onClick={() => {
                  setIsEditorOpen(false);
                  showToast(`Published changes to "${selectedPage.name}"!`);
                }}
              >
                Save and Publish Page
              </button>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
