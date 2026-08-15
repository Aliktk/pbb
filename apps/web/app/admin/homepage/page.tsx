'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { api } from '../../../lib/api';
import { Icon } from '../../../components/Icon';
import { ImageSlot } from '../../../components/ImageSlot';
import { IMG } from '../../../lib/images';
import { EXACT_HOMEPAGE_SECTIONS, type HomepageSection } from '../../../lib/homepageCms';

const HERO_IMAGE_PRESETS = [
  { label: 'Blood Donation', url: IMG.heroDonation },
  { label: 'Screened Blood Bags', url: IMG.bloodBags },
  { label: 'Screening Lab', url: IMG.screeningLab },
  { label: 'Emergency Ambulance', url: IMG.ambulance },
  { label: 'Medical Team Drive', url: IMG.medicalTeam },
  { label: 'Community Camp', url: IMG.community },
  { label: 'Quetta Main Building', url: IMG.building },
];

const STOCK: [string, string, string][] = [
  ['O−', 'cr', 'Critical'],
  ['AB−', 'lo', 'Low'],
  ['B−', 'lo', 'Low'],
  ['A−', 'ok', 'Available'],
  ['O+', 'ok', 'Available'],
  ['A+', 'ok', 'Available'],
  ['B+', 'ok', 'Available'],
  ['AB+', 'ok', 'Available'],
];

const CHART: [number, number, number][] = [
  [1999, 360, 12],
  [2000, 720, 18],
  [2001, 1080, 24],
  [2002, 1440, 30],
  [2003, 2160, 40],
  [2004, 2747, 48],
  [2005, 3118, 54],
  [2006, 3968, 64],
  [2007, 4582, 72],
  [2008, 5905, 88],
  [2009, 5920, 89],
  [2010, 6937, 96],
  [2011, 9484, 100],
  [2012, 5120, 55],
];

export default function AdminHomepage() {
  const [sections, setSections] = useState<HomepageSection[]>(EXACT_HOMEPAGE_SECTIONS);
  const [viewMode, setViewMode] = useState<'builder' | 'full_preview'>('builder');
  const [editingId, setEditingId] = useState<string>('sec-hero');
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isModified, setIsModified] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage or API on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pbb_admin_homepage_sections');
      if (saved) {
        setSections(JSON.parse(saved));
      }
    } catch {
      // Fallback
    }

    api
      .get<HomepageSection[]>('/cms/homepage')
      .then((res) => {
        if (res && Array.isArray(res) && res.length > 0) {
          setSections(res);
        }
      })
      .catch(() => {});
  }, []);

  const selectedSection = sections.find((s) => s.id === editingId) || sections[0];

  function toggleLive(id: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, live: !s.live } : s))
    );
    setIsModified(true);
    showToast('Section visibility updated.');
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setSections((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
    setIsModified(true);
  }

  function moveDown(index: number) {
    if (index === sections.length - 1) return;
    setSections((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
    setIsModified(true);
  }

  function deleteSection(id: string) {
    if (sections.length <= 1) {
      showToast('At least one section must remain.');
      return;
    }
    setSections((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) {
      const remaining = sections.filter((s) => s.id !== id);
      setEditingId(remaining[0]?.id || '');
    }
    setIsModified(true);
    showToast('Section removed.');
  }

  function updateConfigField(key: string, value: any) {
    if (!selectedSection) return;
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === selectedSection.id) {
          return {
            ...s,
            config: {
              ...s.config,
              [key]: value,
            },
          };
        }
        return s;
      })
    );
    setIsModified(true);
  }

  function updateSectionName(name: string) {
    if (!selectedSection) return;
    setSections((prev) =>
      prev.map((s) => (s.id === selectedSection.id ? { ...s, name } : s))
    );
    setIsModified(true);
  }

  // Directly create a new section without opening a modal popup
  function handleDirectAddNewSection() {
    const newId = `sec-custom-${Date.now()}`;
    const newCount = sections.length + 1;
    const newSec: HomepageSection = {
      id: newId,
      key: 'custom_block',
      name: `New Section #${newCount}`,
      live: true,
      desc: 'Custom content block',
      category: 'challenge',
      config: {
        heading: `New Section #${newCount} Title`,
        lead: 'Enter your custom description or announcements for this section.',
        btnText: 'Explore More',
        btnLink: '/',
      },
    };

    setSections((prev) => [...prev, newSec]);
    setEditingId(newId);
    setIsModified(true);
    showToast('New section added! Customize its content on the right panel.');
  }

  // Handle local image file upload from device
  function handleHeroImageFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
        updateConfigField('heroImage', dataUrl);
        showToast(`Uploaded hero image: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSaveAndPublish() {
    try {
      localStorage.setItem('pbb_admin_homepage_sections', JSON.stringify(sections));
    } catch {}

    api.post('/cms/homepage', { sections }).catch(() => {});

    setIsModified(false);
    showToast('Homepage layout published successfully!');
  }

  function handleResetDefaults() {
    setSections(EXACT_HOMEPAGE_SECTIONS);
    setIsModified(true);
    localStorage.removeItem('pbb_admin_homepage_sections');
    showToast('Homepage reset to default content.');
  }

  const liveCount = sections.filter((s) => s.live).length;
  const totalCount = sections.length;

  const topActions = (
    <>
      <button
        type="button"
        className={`btn btn-s ${viewMode === 'builder' ? 'btn-p' : 'btn-o'}`}
        onClick={() => setViewMode('builder')}
      >
        <Icon name="gear" size={14} />
        <span style={{ marginLeft: '4px' }}>Section Editor</span>
      </button>

      <button
        type="button"
        className={`btn btn-s ${viewMode === 'full_preview' ? 'btn-p' : 'btn-o'}`}
        onClick={() => setViewMode('full_preview')}
      >
        <Icon name="search" size={14} />
        <span style={{ marginLeft: '4px' }}>Live Preview</span>
      </button>

      <button
        type="button"
        className="btn btn-o btn-s"
        onClick={handleResetDefaults}
        title="Reset to initial default layout"
      >
        Reset
      </button>

      <button
        type="button"
        className={`btn btn-p btn-s ${isModified ? 'pulse' : ''}`}
        onClick={handleSaveAndPublish}
      >
        {isModified ? 'Publish Changes *' : 'Published ✓'}
      </button>
    </>
  );

  return (
    <AdminShell
      view="homepage"
      title="Homepage Manager"
      subtitle={`${liveCount} of ${totalCount} sections active on public site`}
      actions={topActions}
    >
      {/* VIEW 1: SECTION BUILDER & EDITOR */}
      {viewMode === 'builder' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '20px',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Homepage Section Tiles List */}
          <div
            className="acard"
            style={{
              padding: '18px',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--txt1)' }}>
                Homepage Sequence
              </h3>
              <span className="sm" style={{ fontSize: '11px', color: 'var(--txt3)' }}>
                Click section to edit
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sections.map((s, idx) => {
                const isSelected = s.id === editingId;
                return (
                  <div
                    key={s.id}
                    className="sec-tile"
                    onClick={() => setEditingId(s.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid var(--p)' : '1px solid var(--line)',
                      background: isSelected ? 'rgba(217, 35, 35, 0.05)' : 'var(--surf)',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isSelected ? '0 6px 20px rgba(217, 35, 35, 0.15)' : 'none',
                    }}
                  >
                    {/* Order Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveUp(idx);
                        }}
                        disabled={idx === 0}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: idx === 0 ? 'var(--line)' : 'var(--txt2)',
                          cursor: idx === 0 ? 'default' : 'pointer',
                          fontSize: '10px',
                          padding: '0 2px',
                        }}
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--txt3)' }}>
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveDown(idx);
                        }}
                        disabled={idx === sections.length - 1}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: idx === sections.length - 1 ? 'var(--line)' : 'var(--txt2)',
                          cursor: idx === sections.length - 1 ? 'default' : 'pointer',
                          fontSize: '10px',
                          padding: '0 2px',
                        }}
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Title & Description */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ fontSize: '13.5px', display: 'block', color: isSelected ? 'var(--p)' : 'var(--txt1)' }}>
                        {s.name}
                      </b>
                      <span className="sm" style={{ display: 'block', fontSize: '11.5px', color: 'var(--txt2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.desc}
                      </span>
                    </div>

                    {/* Upgraded Live / Hidden Pill Badge */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLive(s.id);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        borderRadius: '99px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        border: s.live ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(148, 163, 184, 0.3)',
                        background: s.live ? 'rgba(34, 197, 94, 0.12)' : 'rgba(148, 163, 184, 0.1)',
                        color: s.live ? '#22C55E' : '#94A3B8',
                      }}
                      title="Click to toggle live visibility"
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: s.live ? '#22C55E' : '#94A3B8',
                          boxShadow: s.live ? '0 0 6px #22C55E' : 'none',
                        }}
                      />
                      {s.live ? 'Live' : 'Hidden'}
                    </button>

                    {/* Delete Cross Button with Hover Animation */}
                    <button
                      type="button"
                      className="btn-cross-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSection(s.id);
                      }}
                      title="Remove section"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Direct Add New Section Button */}
            <button
              type="button"
              className="addrow"
              onClick={handleDirectAddNewSection}
              style={{
                marginTop: '14px',
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1.5px dashed var(--line)',
                background: 'transparent',
                color: 'var(--p)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              + Add New Section
            </button>
          </div>

          {/* Right Column: Editor Form & Live Mini Preview */}
          {selectedSection && (
            <div
              className="acard"
              style={{
                padding: '20px',
                borderRadius: '16px',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '18px',
                  borderBottom: '1px solid var(--line)',
                  paddingBottom: '12px',
                }}
              >
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--p)', fontWeight: 800 }}>
                    Section Editor
                  </span>
                  <input
                    type="text"
                    className="fld"
                    value={selectedSection.name}
                    onChange={(e) => updateSectionName(e.target.value)}
                    style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 0 0', padding: '4px 8px', border: '1px solid transparent', background: 'transparent' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => toggleLive(selectedSection.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '99px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    border: selectedSection.live ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(148, 163, 184, 0.3)',
                    background: selectedSection.live ? 'rgba(34, 197, 94, 0.12)' : 'rgba(148, 163, 184, 0.1)',
                    color: selectedSection.live ? '#22C55E' : '#94A3B8',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: selectedSection.live ? '#22C55E' : '#94A3B8' }} />
                  {selectedSection.live ? 'Live ✓' : 'Hidden ✕'}
                </button>
              </div>

              {/* EDITABLE FORM FIELDS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {selectedSection.key === 'hero' && (
                  <>
                    {/* HERO IMAGE SELECTOR & SYSTEM FILE UPLOAD */}
                    <div className="fgrp">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <label className="lb" style={{ fontWeight: 700, color: 'var(--txt1)', margin: 0 }}>
                          Hero Section Image
                        </label>
                        {/* System File Upload Button */}
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
                          onChange={handleHeroImageFileUpload}
                          style={{ display: 'none' }}
                        />
                      </div>

                      {/* Image Presets Selector Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                        {HERO_IMAGE_PRESETS.map((preset) => {
                          const isCurrent = (selectedSection.config.heroImage || IMG.heroDonation) === preset.url;
                          return (
                            <div
                              key={preset.label}
                              onClick={() => updateConfigField('heroImage', preset.url)}
                              style={{
                                border: isCurrent ? '2px solid var(--p)' : '1px solid var(--line)',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transition: 'all 0.18s ease',
                                background: isCurrent ? 'rgba(217, 35, 35, 0.08)' : 'var(--surf)',
                                padding: '4px',
                                textAlign: 'center',
                              }}
                              className="sec-tile"
                              title={preset.label}
                            >
                              <img
                                src={preset.url}
                                alt={preset.label}
                                style={{ width: '100%', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                              />
                              <span style={{ fontSize: '10px', display: 'block', fontWeight: 600, marginTop: '2px', color: isCurrent ? 'var(--p)' : 'var(--txt2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {preset.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Custom Image URL Input */}
                      <input
                        type="text"
                        className="fld"
                        placeholder="Image URL or uploaded file Data URL"
                        value={selectedSection.config.heroImage || ''}
                        onChange={(e) => updateConfigField('heroImage', e.target.value)}
                      />
                    </div>

                    <div className="fgrp">
                      <label className="lb" style={{ fontWeight: 700, color: 'var(--txt1)' }}>Eyebrow Badge Tagline</label>
                      <input
                        type="text"
                        className="fld"
                        value={selectedSection.config.eyebrowBadge || ''}
                        onChange={(e) => updateConfigField('eyebrowBadge', e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="fgrp">
                        <label className="lb" style={{ fontWeight: 700, color: 'var(--txt1)' }}>Headline Part 1</label>
                        <input
                          type="text"
                          className="fld"
                          value={selectedSection.config.headlinePart1 || ''}
                          onChange={(e) => updateConfigField('headlinePart1', e.target.value)}
                        />
                      </div>
                      <div className="fgrp">
                        <label className="lb" style={{ fontWeight: 700, color: 'var(--txt1)' }}>Highlight Word</label>
                        <input
                          type="text"
                          className="fld"
                          value={selectedSection.config.headlineHighlight || ''}
                          onChange={(e) => updateConfigField('headlineHighlight', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="fgrp">
                      <label className="lb" style={{ fontWeight: 700, color: 'var(--txt1)' }}>Subheadline Description</label>
                      <textarea
                        className="fld"
                        rows={3}
                        value={selectedSection.config.subheadline || ''}
                        onChange={(e) => updateConfigField('subheadline', e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="fgrp">
                        <label className="lb" style={{ fontWeight: 700, color: 'var(--txt1)' }}>Primary Button Text</label>
                        <input
                          type="text"
                          className="fld"
                          value={selectedSection.config.primaryBtnText || ''}
                          onChange={(e) => updateConfigField('primaryBtnText', e.target.value)}
                        />
                      </div>
                      <div className="fgrp">
                        <label className="lb" style={{ fontWeight: 700, color: 'var(--txt1)' }}>Secondary Button Text</label>
                        <input
                          type="text"
                          className="fld"
                          value={selectedSection.config.secondaryBtnText || ''}
                          onChange={(e) => updateConfigField('secondaryBtnText', e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                {selectedSection.key === 'shortage_strip' && (
                  <>
                    <div className="fgrp">
                      <label className="lb" style={{ fontWeight: 700, color: 'var(--txt1)' }}>Section Category Label</label>
                      <input
                        type="text"
                        className="fld"
                        value={selectedSection.config.label || ''}
                        onChange={(e) => updateConfigField('label', e.target.value)}
                      />
                    </div>
                    <div className="fgrp">
                      <label className="lb" style={{ fontWeight: 700, color: 'var(--txt1)' }}>Stock Bar Title</label>
                      <input
                        type="text"
                        className="fld"
                        value={selectedSection.config.title || ''}
                        onChange={(e) => updateConfigField('title', e.target.value)}
                      />
                    </div>
                    <div className="fgrp">
                      <label className="lb" style={{ fontWeight: 700, color: 'var(--txt1)' }}>Live Status Subtext</label>
                      <input
                        type="text"
                        className="fld"
                        value={selectedSection.config.updatedText || ''}
                        onChange={(e) => updateConfigField('updatedText', e.target.value)}
                      />
                    </div>
                    <div className="fgrp">
                      <label className="lb" style={{ fontWeight: 700, color: 'var(--txt1)' }}>Footer Alert Message</label>
                      <textarea
                        className="fld"
                        rows={2}
                        value={selectedSection.config.footerNote || ''}
                        onChange={(e) => updateConfigField('footerNote', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {selectedSection.key === 'what_we_do' && (
                  <>
                    <div className="fgrp">
                      <label className="lb" style={{ fontWeight: 700, color: 'var(--txt1)' }}>Section Heading</label>
                      <input
                        type="text"
                        className="fld"
                        value={selectedSection.config.heading || ''}
                        onChange={(e) => updateConfigField('heading', e.target.value)}
                      />
                    </div>
                    <div className="fgrp">
                      <label className="lb" style={{ fontWeight: 700, color: 'var(--txt1)' }}>Sub-lead Description</label>
                      <textarea
                        className="fld"
                        rows={2}
                        value={selectedSection.config.lead || ''}
                        onChange={(e) => updateConfigField('lead', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {!['hero', 'shortage_strip', 'what_we_do'].includes(selectedSection.key) && (
                  <>
                    <div className="fgrp">
                      <label className="lb" style={{ fontWeight: 700, color: 'var(--txt1)' }}>Section Heading</label>
                      <input
                        type="text"
                        className="fld"
                        value={selectedSection.config.heading || selectedSection.config.title || selectedSection.name}
                        onChange={(e) => updateConfigField('heading', e.target.value)}
                      />
                    </div>
                    <div className="fgrp">
                      <label className="lb" style={{ fontWeight: 700, color: 'var(--txt1)' }}>Sub-lead Description</label>
                      <textarea
                        className="fld"
                        rows={3}
                        value={selectedSection.config.lead || selectedSection.config.desc || selectedSection.desc}
                        onChange={(e) => updateConfigField('lead', e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="fgrp">
                        <label className="lb" style={{ fontWeight: 700, color: 'var(--txt1)' }}>Button Label</label>
                        <input
                          type="text"
                          className="fld"
                          value={selectedSection.config.btnText || ''}
                          onChange={(e) => updateConfigField('btnText', e.target.value)}
                        />
                      </div>
                      <div className="fgrp">
                        <label className="lb" style={{ fontWeight: 700, color: 'var(--txt1)' }}>Button Link</label>
                        <input
                          type="text"
                          className="fld"
                          value={selectedSection.config.btnLink || ''}
                          onChange={(e) => updateConfigField('btnLink', e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* INLINE LIVE COMPONENT PREVIEW */}
              <div
                style={{
                  marginTop: '20px',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--line)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--p)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Component Live Preview
                  </span>
                  <span className="tag ok" style={{ fontSize: '10px' }}>
                    Live Sync
                  </span>
                </div>

                <div
                  style={{
                    background: '#0B0F19',
                    border: '1px solid var(--line)',
                    borderRadius: '10px',
                    padding: '14px',
                    color: '#F8FAFC',
                  }}
                >
                  {selectedSection.key === 'hero' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: '12px', alignItems: 'center' }}>
                      <div>
                        <span style={{ background: 'rgba(217,35,35,0.2)', color: '#F87171', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
                          {selectedSection.config.eyebrowBadge}
                        </span>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '6px 0 4px 0', color: '#FFF' }}>
                          {selectedSection.config.headlinePart1} <span style={{ color: '#F87171' }}>{selectedSection.config.headlineHighlight}</span>
                        </h3>
                        <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0, lineHeight: '1.4' }}>
                          {selectedSection.config.subheadline}
                        </p>
                      </div>
                      <img
                        src={selectedSection.config.heroImage || IMG.heroDonation}
                        alt="Hero thumbnail"
                        style={{ width: '90px', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    </div>
                  )}

                  {selectedSection.key === 'shortage_strip' && (
                    <div>
                      <div style={{ fontWeight: 800, color: '#F87171', marginBottom: '4px', fontSize: '14px' }}>
                        {selectedSection.config.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                        {selectedSection.config.footerNote}
                      </div>
                    </div>
                  )}

                  {!['hero', 'shortage_strip'].includes(selectedSection.key) && (
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#FFF', fontSize: '14px' }}>
                        {selectedSection.config.heading || selectedSection.config.title || selectedSection.name}
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>
                        {selectedSection.config.lead || selectedSection.config.desc || selectedSection.desc}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Save & Publish */}
              <div style={{ marginTop: '18px' }}>
                <button
                  type="button"
                  className="btn btn-p"
                  style={{ width: '100%', borderRadius: '10px' }}
                  onClick={handleSaveAndPublish}
                >
                  Publish Changes
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: FULL HOMEPAGE LIVE VISUAL PREVIEW */}
      {viewMode === 'full_preview' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 0 40px 0' }}>
          {/* Device Switcher */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'var(--surf)', padding: '6px 12px', borderRadius: '12px', border: '1px solid var(--line)' }}>
            <span style={{ fontSize: '12px', color: 'var(--txt2)', fontWeight: 700, alignSelf: 'center', marginRight: '6px' }}>
              Preview Mode:
            </span>
            <button
              type="button"
              className={`tag ${devicePreview === 'desktop' ? 'ok' : 'gy'}`}
              onClick={() => setDevicePreview('desktop')}
            >
              Desktop
            </button>
            <button
              type="button"
              className={`tag ${devicePreview === 'tablet' ? 'ok' : 'gy'}`}
              onClick={() => setDevicePreview('tablet')}
            >
              Tablet (768px)
            </button>
            <button
              type="button"
              className={`tag ${devicePreview === 'mobile' ? 'ok' : 'gy'}`}
              onClick={() => setDevicePreview('mobile')}
            >
              Mobile (375px)
            </button>
          </div>

          <div
            style={{
              width:
                devicePreview === 'desktop'
                  ? '100%'
                  : devicePreview === 'tablet'
                  ? '768px'
                  : '375px',
              maxWidth: '100%',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: '#0B0F19',
              borderRadius: '20px',
              border: '2px solid var(--line)',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Mock Browser Bar */}
            <div
              style={{
                background: '#1E293B',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#EF4444' }} />
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#F59E0B' }} />
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10B981' }} />
                <span style={{ marginLeft: '10px', fontSize: '12px', color: 'var(--txt3)', fontFamily: 'monospace' }}>
                  http://localhost:3000/
                </span>
              </div>
              <span className="tag ok" style={{ fontSize: '10px' }}>
                Live Site Mockup
              </span>
            </div>

            {/* Public Homepage Components */}
            <div className="home-container" style={{ padding: '0 0 40px 0' }}>
              {sections
                .filter((s) => s.live)
                .map((s) => (
                  <div key={s.id}>
                    {/* Hero Section */}
                    {s.key === 'hero' && (
                      <header className="hero-pro" style={{ padding: '40px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="wrap">
                          <div className="hero-grid">
                            <div className="hero-content">
                              <div className="eyebrow-badge">
                                <span className="dot-pulse" />
                                <span>{s.config.eyebrowBadge}</span>
                              </div>

                              <h1 className="hero-title" style={{ fontSize: '30px', color: '#FFF' }}>
                                {s.config.headlinePart1}<br />
                                We keep the <span className="highlight-text">{s.config.headlineHighlight}</span>.
                              </h1>

                              <p className="hero-desc" style={{ color: '#94A3B8' }}>
                                {s.config.subheadline}
                              </p>

                              <div className="hero-actions" style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" className="btn btn-primary-glow">
                                  {s.config.primaryBtnText}
                                </button>
                                <button type="button" className="btn btn-hero-secondary">
                                  {s.config.secondaryBtnText}
                                </button>
                              </div>
                            </div>

                            <div className="hero-visual">
                              <div className="visual-card-frame">
                                <ImageSlot
                                  ratio="4/3.6"
                                  style="border-radius:20px; width:100%; height:220px; object-fit:cover;"
                                  src={s.config.heroImage || IMG.heroDonation}
                                  placeholder="Hero blood donation photo"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </header>
                    )}

                    {/* Stock Alert Bar */}
                    {s.key === 'shortage_strip' && (
                      <div className="wrap" style={{ padding: '20px' }}>
                        <div className="stock-panel-pro" style={{ background: '#1E293B', padding: '18px', borderRadius: '14px' }}>
                          <div className="stock-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                            <div>
                              <span className="section-label" style={{ color: 'var(--p)' }}>{s.config.label}</span>
                              <h3 className="stock-title" style={{ fontSize: '17px', color: '#FFF', margin: 0 }}>{s.config.title}</h3>
                            </div>
                            <span className="live-status-pill" style={{ fontSize: '11px', color: '#94A3B8' }}>
                              🟢 {s.config.updatedText}
                            </span>
                          </div>

                          <div className="stock-groups-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(75px, 1fr))', gap: '6px' }}>
                            {STOCK.map(([g, c, st]) => (
                              <div key={g} className={`stock-card stock-${c}`} style={{ padding: '8px', background: '#0F172A', borderRadius: '8px', textAlign: 'center' }}>
                                <span className="group-name" style={{ display: 'block', fontWeight: 800, color: c === 'cr' ? '#F87171' : '#FFF' }}>{g}</span>
                                <span className="group-status" style={{ fontSize: '10px', color: c === 'cr' ? '#F87171' : '#94A3B8' }}>{st}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Generic fallback */}
                    {!['hero', 'shortage_strip'].includes(s.key) && (
                      <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <h4 style={{ color: '#FFF', margin: '0 0 4px 0', fontSize: '15px' }}>
                          {s.config.heading || s.config.title || s.name}
                        </h4>
                        <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                          {s.config.lead || s.config.desc || s.desc}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
