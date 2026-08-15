'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { Icon } from '../../../components/Icon';
import { CustomSelect } from '../../../components/CustomSelect';
import { ROLES } from '../../../lib/admin';
import { getTownNamesList } from '../../../lib/towns';

const TABS = ['Settings', 'Features', 'Manage admins'] as const;

interface FeatureItem {
  key: string;
  label: string;
  desc: string;
  on: boolean;
  locked?: string;
}

const FEATURE_GROUPS: [string, FeatureItem[]][] = [
  ['Public website', [
    { key: 'shortage', label: 'Shortage strip on the home page', desc: 'The live “what we are short of today” banner.', on: true },
    { key: 'request', label: 'Online blood request', desc: 'Lets the public submit a request from the website.', on: true },
    { key: 'donorReg', label: 'Donor registration form', desc: 'The three-minute “register as a donor” form.', on: true },
    { key: 'volunteerReg', label: 'Volunteer & organisation forms', desc: 'Sign-ups for volunteers, partners and new town branches.', on: true },
    { key: 'needs', label: 'Who-needs-blood board', desc: 'The public list of open requests, shown without names.', on: true },
    { key: 'gallery', label: 'Photos & videos', desc: 'The public media gallery.', on: true },
    { key: 'events', label: 'Event registration', desc: 'Let people register to attend camps and events.', on: false },
  ]],
  ['Operations', [
    { key: 'inbox', label: 'Public form inbox', desc: 'Route every website form into the admin Inbox.', on: true },
    { key: 'crosscity', label: 'Cross-town donor calls', desc: 'Allow a branch to call a willing donor in another town during an emergency.', on: true },
    { key: 'twoStep', label: 'Two-step sign in', desc: 'Require an SMS code for anyone who can see phone numbers.', on: true },
    { key: 'sms', label: 'SMS notifications', desc: 'Send donors and requesters SMS updates.', on: false, locked: 'Waiting on the SMS gateway account' },
  ]],
];

interface AdminUser {
  id?: string;
  who: string;
  sub: string;
  scope?: string | null;
}

export default function AdminSettings() {
  const [tab, setTab] = useState(0);

  // General Settings State
  const [orgName, setOrgName] = useState('Pashtoonkhwa Blood Bank & Welfare Society');
  const [orgAddress, setOrgAddress] = useState('Zainab Chamber, Shara-e-Adalat, Quetta');
  const [orgPhone, setOrgPhone] = useState('081-2836820');
  const [orgPhone2, setOrgPhone2] = useState('081-2839500');
  const [orgEmail, setOrgEmail] = useState('admin@pashtoonkhwabloodbank.org');
  const [orgFounded, setOrgFounded] = useState('24 March 1999');

  // Eligibility Criteria State
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(60);
  const [minWeight, setMinWeight] = useState(50);
  const [daysBetween, setDaysBetween] = useState(90);
  const [maxCalls, setMaxCalls] = useState(2);

  // Features State
  const [features, setFeatures] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(FEATURE_GROUPS.flatMap(([, fs]) => fs.map((f) => [f.key, f.on])))
  );

  // Admins State
  const [admins, setAdmins] = useState<AdminUser[]>(ROLES);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminTown, setAdminTown] = useState('Quetta');
  const [adminRole, setAdminRole] = useState('Town Coordinator');

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const savedOrg = localStorage.getItem('pbb_org_settings');
      if (savedOrg) {
        const p = JSON.parse(savedOrg);
        if (p.orgName) setOrgName(p.orgName);
        if (p.orgAddress) setOrgAddress(p.orgAddress);
        if (p.orgPhone) setOrgPhone(p.orgPhone);
        if (p.orgPhone2) setOrgPhone2(p.orgPhone2);
        if (p.orgEmail) setOrgEmail(p.orgEmail);
      }

      const savedRules = localStorage.getItem('pbb_eligibility_rules');
      if (savedRules) {
        const p = JSON.parse(savedRules);
        if (p.minAge) setMinAge(p.minAge);
        if (p.maxAge) setMaxAge(p.maxAge);
        if (p.minWeight) setMinWeight(p.minWeight);
        if (p.daysBetween) setDaysBetween(p.daysBetween);
        if (p.maxCalls) setMaxCalls(p.maxCalls);
      }

      const savedFeats = localStorage.getItem('pbb_feature_switches');
      if (savedFeats) {
        setFeatures(JSON.parse(savedFeats));
      }
    } catch {}
  }, []);

  function handleSaveOrg(e: React.FormEvent) {
    e.preventDefault();
    const data = { orgName, orgAddress, orgPhone, orgPhone2, orgEmail, orgFounded };
    try {
      localStorage.setItem('pbb_org_settings', JSON.stringify(data));
    } catch {}
    showToast('Saved organisation settings! Updated across header, footer and printed forms.');
  }

  function handleSaveRules(e: React.FormEvent) {
    e.preventDefault();
    const data = { minAge, maxAge, minWeight, daysBetween, maxCalls };
    try {
      localStorage.setItem('pbb_eligibility_rules', JSON.stringify(data));
    } catch {}
    showToast('Saved donor eligibility criteria! Synchronized with public Services page.');
  }

  function toggleFeature(key: string, locked?: string) {
    if (locked) {
      showToast(locked);
      return;
    }
    const next = { ...features, [key]: !features[key] };
    setFeatures(next);
    try {
      localStorage.setItem('pbb_feature_switches', JSON.stringify(next));
    } catch {}
    showToast(`Feature "${key}" turned ${!features[key] ? 'ON' : 'OFF'}.`);
  }

  function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!adminName.trim()) {
      showToast('Please enter administrator name.');
      return;
    }
    const newAdmin: AdminUser = {
      id: `adm-${Date.now()}`,
      who: adminName.trim(),
      sub: adminRole,
      scope: adminTown,
    };
    setAdmins([...admins, newAdmin]);
    setIsAddAdminOpen(false);
    showToast(`Added administrator "${newAdmin.who}" for ${newAdmin.scope}.`);
  }

  const onCount = Object.values(features).filter(Boolean).length;
  const townOptions = getTownNamesList().map((t) => ({ value: t, label: t }));
  const roleOptions = [
    { value: 'Town Coordinator', label: 'Town Coordinator' },
    { value: 'Regional Branch Officer', label: 'Regional Branch Officer' },
    { value: 'Central Executive', label: 'Central Executive' },
    { value: 'Super Administrator', label: 'Super Administrator' },
  ];

  return (
    <AdminShell view="settings" title="Site settings" subtitle="Organisation, features and administrators">
      {/* 3 CLEAN TAB PILLS */}
      <div className="row" style={css('gap:8px;margin-bottom:20px')}>
        {TABS.map((t, i) => (
          <button key={t} className={`pill${i === tab ? ' on' : ''}`} onClick={() => setTab(i)}>
            {t}
          </button>
        ))}
      </div>

      {/* TAB 0: SETTINGS */}
      {tab === 0 && (
        <div className="g2" style={{ gap: '20px', alignItems: 'stretch' }}>
          {/* LEFT: THE ORGANISATION */}
          <div
            className="acard"
            style={{
              borderRadius: '20px',
              padding: '26px',
              background: 'var(--surf)',
              border: '1px solid var(--line)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(217, 35, 35, 0.12)',
                    color: 'var(--p)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0,
                  }}
                >
                  <Icon name="building" size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--txt1)' }}>
                    The organisation
                  </h3>
                  <p className="sm" style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: 'var(--txt2)' }}>
                    Master identity and primary branch contact details
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveOrg} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt1)' }}>Organisation Name</label>
                  <input
                    className="fld"
                    type="text"
                    style={{ borderRadius: '10px', padding: '10px 14px', color: 'var(--txt1)' }}
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                  />
                </div>

                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt1)' }}>Head office address</label>
                  <input
                    className="fld"
                    type="text"
                    style={{ borderRadius: '10px', padding: '10px 14px', color: 'var(--txt1)' }}
                    value={orgAddress}
                    onChange={(e) => setOrgAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt1)' }}>Primary phone</label>
                  <input
                    className="fld"
                    type="tel"
                    style={{ borderRadius: '10px', padding: '10px 14px', color: 'var(--txt1)' }}
                    value={orgPhone}
                    onChange={(e) => setOrgPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt1)' }}>Second phone</label>
                  <input
                    className="fld"
                    type="tel"
                    style={{ borderRadius: '10px', padding: '10px 14px', color: 'var(--txt1)' }}
                    value={orgPhone2}
                    onChange={(e) => setOrgPhone2(e.target.value)}
                  />
                </div>

                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt1)' }}>Official email</label>
                  <input
                    className="fld"
                    type="email"
                    style={{ borderRadius: '10px', padding: '10px 14px', color: 'var(--txt1)' }}
                    value={orgEmail}
                    onChange={(e) => setOrgEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt1)' }}>Founded date</label>
                  <input
                    className="fld"
                    type="text"
                    style={{ borderRadius: '10px', padding: '10px 14px', color: 'var(--txt1)' }}
                    value={orgFounded}
                    onChange={(e) => setOrgFounded(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-p"
                  style={{ width: '100%', marginTop: '6px', borderRadius: '10px', padding: '11px', fontSize: '13.5px', fontWeight: 800 }}
                >
                  Save organisation settings
                </button>
              </form>
            </div>

            <p className="ahint" style={{ marginTop: '16px', fontSize: '12.5px', lineHeight: 1.5 }}>
              Changed here, changed everywhere - the header, the footer, every contact block and every printed form.
            </p>
          </div>

          {/* RIGHT: DONOR RULES & LANGUAGES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', justifyContent: 'space-between' }}>
            <div
              className="acard"
              style={{
                borderRadius: '20px',
                padding: '26px',
                background: 'var(--surf)',
                border: '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(217, 35, 35, 0.12)',
                    color: 'var(--p)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0,
                  }}
                >
                  <Icon name="drop" size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--txt1)' }}>
                    Who can donate
                  </h3>
                  <p className="sm" style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: 'var(--txt2)' }}>
                    The same numbers the public Services page shows
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveRules} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="row" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: '13.5px', color: 'var(--txt1)' }}>Minimum age</span>
                  <input
                    className="fld"
                    type="number"
                    style={{ width: '84px', textAlign: 'center', borderRadius: '8px', padding: '6px', color: 'var(--txt1)' }}
                    value={minAge}
                    onChange={(e) => setMinAge(Number(e.target.value))}
                  />
                </div>

                <div className="row" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: '13.5px', color: 'var(--txt1)' }}>Maximum age</span>
                  <input
                    className="fld"
                    type="number"
                    style={{ width: '84px', textAlign: 'center', borderRadius: '8px', padding: '6px', color: 'var(--txt1)' }}
                    value={maxAge}
                    onChange={(e) => setMaxAge(Number(e.target.value))}
                  />
                </div>

                <div className="row" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: '13.5px', color: 'var(--txt1)' }}>Minimum weight (kg)</span>
                  <input
                    className="fld"
                    type="number"
                    style={{ width: '84px', textAlign: 'center', borderRadius: '8px', padding: '6px', color: 'var(--txt1)' }}
                    value={minWeight}
                    onChange={(e) => setMinWeight(Number(e.target.value))}
                  />
                </div>

                <div className="row" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: '13.5px', color: 'var(--txt1)' }}>Days between donations</span>
                  <input
                    className="fld"
                    type="number"
                    style={{ width: '84px', textAlign: 'center', borderRadius: '8px', padding: '6px', color: 'var(--txt1)' }}
                    value={daysBetween}
                    onChange={(e) => setDaysBetween(Number(e.target.value))}
                  />
                </div>

                <div className="row" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: '13.5px', color: 'var(--txt1)' }}>Most calls to one donor per day</span>
                  <input
                    className="fld"
                    type="number"
                    style={{ width: '84px', textAlign: 'center', borderRadius: '8px', padding: '6px', color: 'var(--txt1)' }}
                    value={maxCalls}
                    onChange={(e) => setMaxCalls(Number(e.target.value))}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-o btn-s"
                  style={{ marginTop: '8px', borderRadius: '8px', padding: '8px 16px', fontWeight: 700, width: 'fit-content' }}
                >
                  Save eligibility rules
                </button>
              </form>
            </div>

            <div
              className="acard"
              style={{
                borderRadius: '20px',
                padding: '24px',
                background: 'var(--surf)',
                border: '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(59, 130, 246, 0.12)',
                    color: '#3B82F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0,
                  }}
                >
                  <Icon name="pages" size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--txt1)' }}>
                    Languages
                  </h3>
                  <p className="sm" style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: 'var(--txt2)' }}>
                    Multi-language localization status
                  </p>
                </div>
              </div>

              <div className="row" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <span style={{ flex: 1, fontWeight: 600, fontSize: '13.5px', color: 'var(--txt1)' }}>English</span>
                <span className="tag ok" style={{ fontSize: '11px', fontWeight: 700 }}>default</span>
              </div>
              <div className="row" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <span style={{ flex: 1, fontWeight: 600, fontSize: '13.5px', color: 'var(--txt1)' }}>اردو Urdu</span>
                <span className="tag ok" style={{ fontSize: '11px', fontWeight: 700 }}>live</span>
              </div>
              <div className="row" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <span style={{ flex: 1, fontWeight: 600, fontSize: '13.5px', color: 'var(--txt1)' }}>پښتو Pashto</span>
                <span className="tag wt" style={{ fontSize: '11px', fontWeight: 700, background: 'rgba(234, 179, 8, 0.15)', color: '#EAB308' }}>62% translated</span>
              </div>
              <p className="ahint" style={{ marginTop: '12px', fontSize: '12.5px', lineHeight: 1.5 }}>
                A language stays off until it is complete. Anything untranslated falls back to English rather than showing blank.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: FEATURES */}
      {tab === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* HEADER ROW */}
          <div
            className="acard"
            style={{
              borderRadius: '20px',
              padding: '20px 24px',
              background: 'var(--surf)',
              border: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'rgba(217, 35, 35, 0.12)',
                  color: 'var(--p)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0,
                }}
              >
                <Icon name="gear" size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--txt1)' }}>
                  Platform Module &amp; Feature Controls
                </h3>
                <p className="sm" style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: 'var(--txt2)' }}>
                  Toggle public portals and administrative operational modules live across the system
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: '99px',
                  fontSize: '12px',
                  fontWeight: 800,
                  background: 'rgba(34, 197, 94, 0.15)',
                  color: '#22C55E',
                  border: '1px solid rgba(34, 197, 94, 0.35)',
                }}
              >
                🟢 {onCount} / 11 Modules Active
              </span>

              <button
                type="button"
                className="btn btn-p btn-s"
                onClick={() => showToast('Saved all feature switch states!')}
                style={{ borderRadius: '10px', padding: '8px 16px', fontWeight: 800 }}
              >
                Save Switches
              </button>
            </div>
          </div>

          {/* FEATURE GROUPS GRID */}
          {FEATURE_GROUPS.map(([group, fs]) => (
            <div
              className="acard"
              key={group}
              style={{
                borderRadius: '20px',
                padding: '24px',
                background: 'var(--surf)',
                border: '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 800, color: 'var(--txt1)' }}>
                  {group}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--txt2)', fontWeight: 600 }}>
                  {fs.filter((f) => features[f.key]).length} of {fs.length} Active
                </span>
              </div>

              {/* 2-COLUMN TILES MATRIX */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '14px' }}>
                {fs.map((f) => {
                  const isOn = features[f.key];
                  return (
                    <div
                      key={f.key}
                      style={{
                        padding: '18px',
                        borderRadius: '16px',
                        background: 'var(--surf)',
                        border: f.locked
                          ? '1px solid rgba(234, 179, 8, 0.35)'
                          : isOn
                          ? '1px solid rgba(34, 197, 94, 0.4)'
                          : '1px solid var(--line)',
                        boxShadow: isOn ? '0 6px 20px rgba(34, 197, 94, 0.06)' : undefined,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '14px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px', gap: '10px' }}>
                          <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: 'var(--txt1)', lineHeight: 1.3 }}>
                            {f.label}
                          </h4>

                          {/* GLOWING STATUS BADGE */}
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '3px 9px',
                              borderRadius: '99px',
                              flexShrink: 0,
                              background: f.locked
                                ? 'rgba(234, 179, 8, 0.15)'
                                : isOn
                                ? 'rgba(34, 197, 94, 0.15)'
                                : 'var(--surf)',
                              color: f.locked ? '#EAB308' : isOn ? '#22C55E' : 'var(--txt2)',
                              border: f.locked
                                ? '1px solid rgba(234, 179, 8, 0.35)'
                                : isOn
                                ? '1px solid rgba(34, 197, 94, 0.35)'
                                : '1px solid var(--line)',
                            }}
                          >
                            {f.locked ? '🔒 Locked' : isOn ? '🟢 Active' : '⚪ Off'}
                          </span>
                        </div>

                        <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--txt2)', lineHeight: 1.5 }}>
                          {f.locked ? f.locked : f.desc}
                        </p>
                      </div>

                      {/* MODERN TOGGLE BUTTON UI */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--line)' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, color: f.locked ? '#EAB308' : isOn ? '#22C55E' : 'var(--txt2)' }}>
                          {f.locked ? 'Gateway Dependency' : isOn ? 'Enabled on Live Site' : 'Hidden from Site'}
                        </span>

                        <button
                          type="button"
                          className={`btn ${f.locked ? 'btn-o' : isOn ? 'btn-p' : 'btn-o'}`}
                          style={{
                            borderRadius: '99px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            padding: '5px 14px',
                            opacity: f.locked ? 0.6 : 1,
                            flexShrink: 0,
                          }}
                          onClick={() => toggleFeature(f.key, f.locked)}
                        >
                          {f.locked ? 'Locked' : isOn ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <p className="ahint" style={{ fontSize: '12.5px', lineHeight: 1.5 }}>
            💡 Turning a feature off hides it everywhere at once — the public page, navigation menus, and the admin management screens feeding it. A locked feature is built and awaiting external gateway authorization.
          </p>
        </div>
      )}

      {/* TAB 2: MANAGE ADMINS */}
      {tab === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* HEADER BAR */}
          <div
            className="acard"
            style={{
              borderRadius: '20px',
              padding: '20px 24px',
              background: 'var(--surf)',
              border: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'rgba(217, 35, 35, 0.12)',
                  color: 'var(--p)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0,
                }}
              >
                <Icon name="users" size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--txt1)' }}>
                  Appointed Personnel &amp; Coordinators
                </h3>
                <p className="sm" style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: 'var(--txt2)' }}>
                  Authorized administrators managing regional donor registers across all 14 town centers
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-p"
              onClick={() => setIsAddAdminOpen(true)}
              style={{ borderRadius: '12px', padding: '9px 18px', fontSize: '13px', fontWeight: 800 }}
            >
              + Add Administrator
            </button>
          </div>

          {/* PERSONNEL TILES GRID MATRIX */}
          <div className="acard" style={{ borderRadius: '20px', padding: '24px', background: 'var(--surf)', border: '1px solid var(--line)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {admins.map((r) => (
                <div
                  key={r.id || r.who}
                  style={{
                    padding: '18px',
                    borderRadius: '16px',
                    background: 'var(--surf)',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'rgba(217, 35, 35, 0.12)',
                        color: 'var(--p)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      👤
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--txt1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.who}
                      </h4>
                      <span style={{ fontSize: '12.5px', color: 'var(--txt2)', fontWeight: 600 }}>
                        {r.sub}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--line)' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: '99px',
                        background: 'rgba(59, 130, 246, 0.12)',
                        color: '#3B82F6',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                      }}
                    >
                      📍 {r.scope ? `${r.scope} District` : 'All 14 Towns'}
                    </span>

                    <button
                      type="button"
                      className="btn btn-o btn-s"
                      style={{ borderRadius: '8px', fontSize: '11.5px', padding: '5px 12px', fontWeight: 700 }}
                      onClick={() => showToast(`Managing rights for ${r.who}`)}
                    >
                      Manage Rights
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACCOUNTS & ROLES WOWED FEATURE CARDS */}
          <div className="g2" style={{ gap: '22px', alignItems: 'stretch' }}>
            {/* ACCOUNTS & HIERARCHY CARD */}
            <Link
              href="/admin/accounts"
              style={{ textDecoration: 'none' }}
            >
              <div
                className="acard sec-tile"
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '26px',
                  padding: '28px',
                  background: 'var(--surf)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  boxShadow: '0 16px 45px rgba(59, 130, 246, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '20px',
                  height: '100%',
                  transition: 'all 0.25s ease',
                }}
              >
                {/* TOP ACCENT LINE */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)',
                  }}
                />

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '16px',
                        background: 'rgba(59, 130, 246, 0.15)',
                        color: '#3B82F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        boxShadow: '0 6px 18px rgba(59, 130, 246, 0.25)',
                      }}
                    >
                      <Icon name="accounts" size={24} />
                    </div>

                    <span
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 800,
                        padding: '5px 12px',
                        borderRadius: '99px',
                        background: 'rgba(59, 130, 246, 0.15)',
                        color: '#3B82F6',
                        border: '1px solid rgba(59, 130, 246, 0.35)',
                      }}
                    >
                      🏢 14 Branch Offices
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 8px 0', fontSize: '19px', fontWeight: 900, color: 'var(--txt1)' }}>
                    Accounts &amp; Hierarchy
                  </h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '13.5px', color: 'var(--txt2)', lineHeight: 1.55 }}>
                    Manage account lineage, branch office assignments, password resets, and account suspensions across all 14 regional town centers.
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: 'var(--surf)', border: '1px solid var(--line)', color: 'var(--txt1)' }}>
                      ✓ Branch Lineage
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: 'var(--surf)', border: '1px solid var(--line)', color: 'var(--txt1)' }}>
                      ✓ Password Resets
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: 'var(--surf)', border: '1px solid var(--line)', color: 'var(--txt1)' }}>
                      ✓ Account Locks
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--line)',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#3B82F6' }}>
                    Open Accounts &amp; Lineage Directory
                  </span>
                  <span
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#3B82F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '16px',
                    }}
                  >
                    →
                  </span>
                </div>
              </div>
            </Link>

            {/* ROLES & ACCESS MATRIX CARD */}
            <Link
              href="/admin/roles"
              style={{ textDecoration: 'none' }}
            >
              <div
                className="acard sec-tile"
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '26px',
                  padding: '28px',
                  background: 'var(--surf)',
                  border: '1px solid rgba(34, 197, 94, 0.35)',
                  boxShadow: '0 16px 45px rgba(34, 197, 94, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '20px',
                  height: '100%',
                  transition: 'all 0.25s ease',
                }}
              >
                {/* TOP ACCENT LINE */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #22C55E 0%, #4ADE80 100%)',
                  }}
                />

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '16px',
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: '#22C55E',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        boxShadow: '0 6px 18px rgba(34, 197, 94, 0.25)',
                      }}
                    >
                      <Icon name="roles" size={24} />
                    </div>

                    <span
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 800,
                        padding: '5px 12px',
                        borderRadius: '99px',
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: '#22C55E',
                        border: '1px solid rgba(34, 197, 94, 0.35)',
                      }}
                    >
                      🛡️ 4 Access Tiers
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 8px 0', fontSize: '19px', fontWeight: 900, color: 'var(--txt1)' }}>
                    Roles &amp; Access Matrix
                  </h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '13.5px', color: 'var(--txt2)', lineHeight: 1.55 }}>
                    Define screen visibility, export privileges, and donor contact privacy safeguards per administrative role level.
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: 'var(--surf)', border: '1px solid var(--line)', color: 'var(--txt1)' }}>
                      ✓ Screen Visibility
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: 'var(--surf)', border: '1px solid var(--line)', color: 'var(--txt1)' }}>
                      ✓ Privacy Shields
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: 'var(--surf)', border: '1px solid var(--line)', color: 'var(--txt1)' }}>
                      ✓ Export Rights
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--line)',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#22C55E' }}>
                    Configure Role Permissions Matrix
                  </span>
                  <span
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: 'rgba(34, 197, 94, 0.15)',
                      color: '#22C55E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '16px',
                    }}
                  >
                    →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          <p className="ahint" style={{ fontSize: '12.5px', lineHeight: 1.5 }}>
            💡 An administrator can only create accounts weaker than their own, and only within the towns they are responsible for. A password is set by its owner — a super admin can reset it but never view it.
          </p>
        </div>
      )}

      {/* CREATE ADMIN MODAL */}
      {isAddAdminOpen && (
        <>
          <div
            className="sheetov on"
            onClick={() => setIsAddAdminOpen(false)}
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
                Add New Administrator
              </h2>
              <button
                type="button"
                className="btn-cross-delete"
                onClick={() => setIsAddAdminOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>Full Name *</label>
                <input
                  type="text"
                  className="fld"
                  placeholder="e.g. Dr. Tariq Kakar"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                />
              </div>

              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700 }}>Official Email Address</label>
                <input
                  type="email"
                  className="fld"
                  placeholder="e.g. tariq@pashtoonkhwabloodbank.org"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700, display: 'block', marginBottom: '6px' }}>Appointed Role</label>
                  <CustomSelect
                    name="adminRole"
                    options={roleOptions}
                    value={adminRole}
                    onChange={(val) => setAdminRole(val)}
                    direction="up"
                  />
                </div>

                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700, display: 'block', marginBottom: '6px' }}>Town Jurisdiction</label>
                  <CustomSelect
                    name="adminTown"
                    options={townOptions}
                    value={adminTown}
                    onChange={(val) => setAdminTown(val)}
                    direction="up"
                  />
                </div>
              </div>

              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-p" style={{ flex: 1, borderRadius: '10px' }}>
                  Register Administrator
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </AdminShell>
  );
}
