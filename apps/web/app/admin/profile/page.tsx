'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { CustomSelect } from '../../../components/CustomSelect';

interface UserProfile {
  name: string;
  roleTitle: string;
  email: string;
  phone: string;
  office: string;
  language: string;
  tfaEnabled: boolean;
}

const INITIAL_PROFILE: UserProfile = {
  name: 'Olus Yar',
  roleTitle: 'Head of Organisation (Apex Administrator)',
  email: 'organizer@pbb.org',
  phone: '0300-3815590',
  office: 'Zainab Chamber, Shara-e-Adalat, Quetta',
  language: 'English',
  tfaEnabled: true,
};

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  time: string;
  isCurrent: boolean;
  icon: string;
}

const INITIAL_SESSIONS: ActiveSession[] = [
  { id: 'sess-1', device: 'Quetta Workstation (Chrome on Windows)', location: 'Quetta HQ', time: 'Active Now', isCurrent: true, icon: '💻' },
  { id: 'sess-2', device: 'Mobile App (iPhone 15 Pro)', location: 'Quetta Central', time: '2 hours ago', isCurrent: false, icon: '📱' },
  { id: 'sess-3', device: 'Zhob Branch Terminal', location: 'Zhob Hub', time: '3 days ago', isCurrent: false, icon: '🖥️' },
];

const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English (US / UK)' },
  { value: 'Urdu', label: 'اردو Urdu' },
  { value: 'Pashto', label: 'پښتو Pashto' },
];

export default function AdminProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pbb_admin_profile');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_PROFILE;
  });

  const [sessions, setSessions] = useState<ActiveSession[]>(INITIAL_SESSIONS);

  // Form inputs
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [language, setLanguage] = useState(profile.language);

  // Password inputs
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // Persist profile
  useEffect(() => {
    try {
      localStorage.setItem('pbb_admin_profile', JSON.stringify(profile));
    } catch {}
  }, [profile]);

  function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter full name.');
      return;
    }
    if (!email.trim()) {
      showToast('Please enter email address.');
      return;
    }

    const updated = {
      ...profile,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      language,
    };

    setProfile(updated);
    showToast('Updated profile details successfully!');
  }

  function handleUpdatePassword(e: FormEvent) {
    e.preventDefault();
    if (!currPass) {
      showToast('Please enter your current password.');
      return;
    }
    if (!newPass || newPass.length < 6) {
      showToast('New password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      showToast('New passwords do not match.');
      return;
    }

    setCurrPass('');
    setNewPass('');
    setConfirmPass('');
    showToast('Password changed successfully!');
  }

  function handleToggle2FA() {
    const nextState = !profile.tfaEnabled;
    setProfile({ ...profile, tfaEnabled: nextState });
    showToast(`Two-step SMS verification turned ${nextState ? 'ON' : 'OFF'}.`);
  }

  function handleSignOutSession(id: string) {
    setSessions((cur) => cur.filter((s) => s.id !== id));
    showToast('Signed out active device session.');
  }

  function handleSignOutEverywhere() {
    setSessions((cur) => cur.filter((s) => s.isCurrent));
    showToast('Signed out all other active device sessions!');
  }

  return (
    <AdminShell
      view="profile"
      title="Account &amp; Security Settings"
      subtitle={`${profile.name} · ${profile.roleTitle}`}
    >
      {/* HERO EXECUTIVE PROFILE CARD */}
      <div
        className="acard"
        style={{
          borderRadius: '24px',
          padding: '24px 28px',
          marginBottom: '24px',
          background: 'var(--surf)',
          border: '1px solid var(--line)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'var(--p)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 900,
              boxShadow: '0 8px 24px rgba(217, 35, 35, 0.3)',
              flexShrink: 0,
            }}
          >
            👑
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 900, margin: 0, color: 'var(--txt1)' }}>
                {profile.name}
              </h2>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 10px',
                  borderRadius: '99px',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  background: 'rgba(34, 197, 94, 0.15)',
                  color: '#22C55E',
                  border: '1px solid rgba(34, 197, 94, 0.35)',
                }}
              >
                ✓ Verified Officer
              </span>
            </div>
            <div style={{ fontSize: '13.5px', color: 'var(--txt2)', fontWeight: 600 }}>
              {profile.roleTitle}
            </div>
            <div style={{ fontSize: '12.5px', color: '#3B82F6', fontWeight: 700, marginTop: '2px' }}>
              📍 {profile.office}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-o btn-s"
            onClick={() => showToast('Profile avatar upload connected to media storage.')}
            style={{ borderRadius: '10px', fontSize: '12px', fontWeight: 700 }}
          >
            Update Avatar
          </button>
        </div>
      </div>

      {/* 2-COLUMN PROFILE & SECURITY GRID */}
      <div className="g2" style={{ gap: '22px', alignItems: 'start' }}>
        {/* LEFT COLUMN: PERSONAL DETAILS & PASSWORD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* PERSONAL DETAILS CARD */}
          <div
            className="acard"
            style={{
              borderRadius: '24px',
              padding: '26px',
              background: 'var(--surf)',
              border: '1px solid var(--line)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 900, color: 'var(--txt1)' }}>
              Personal Details &amp; Contact Info
            </h3>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt1)' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  className="fld"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ borderRadius: '10px', padding: '10px 14px', color: 'var(--txt1)', fontWeight: 600 }}
                  required
                />
              </div>

              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt1)' }}>
                  Official Station Office (Read-Only)
                </label>
                <input
                  type="text"
                  className="fld"
                  value={profile.office}
                  disabled
                  style={{ borderRadius: '10px', padding: '10px 14px', color: 'var(--txt2)', opacity: 0.7 }}
                />
                <div style={{ fontSize: '11.5px', color: 'var(--txt2)', marginTop: '4px' }}>
                  Station assignment is set by the Organising Committee at Quetta HQ.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt1)' }}>
                    Telephone Number
                  </label>
                  <input
                    type="tel"
                    className="fld"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ borderRadius: '10px', padding: '10px 14px', color: 'var(--txt1)', fontWeight: 600 }}
                  />
                </div>

                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt1)' }}>
                    Official Email *
                  </label>
                  <input
                    type="email"
                    className="fld"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ borderRadius: '10px', padding: '10px 14px', color: 'var(--txt1)', fontWeight: 600 }}
                    required
                  />
                </div>
              </div>

              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt1)', marginBottom: '6px', display: 'block' }}>
                  Preferred System Language
                </label>
                <CustomSelect
                  name="language"
                  options={LANGUAGE_OPTIONS}
                  value={language}
                  onChange={(val) => setLanguage(val)}
                  direction="down"
                />
              </div>

              <button
                type="submit"
                className="btn btn-p"
                style={{ marginTop: '8px', borderRadius: '12px', padding: '12px', fontSize: '14px', fontWeight: 800 }}
              >
                Save Profile Changes
              </button>
            </form>
          </div>

          {/* PASSWORD CHANGE CARD */}
          <div
            className="acard"
            style={{
              borderRadius: '24px',
              padding: '26px',
              background: 'var(--surf)',
              border: '1px solid var(--line)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
            }}
          >
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 900, color: 'var(--txt1)' }}>
              Password &amp; Access Credentials
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: 'var(--txt2)' }}>
              Passwords are end-to-end encrypted. Nobody can read your password; super admins can only issue reset links.
            </p>

            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="fgrp">
                <label className="lb" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt1)' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  className="fld"
                  placeholder="••••••••"
                  value={currPass}
                  onChange={(e) => setCurrPass(e.target.value)}
                  style={{ borderRadius: '10px', padding: '10px 14px', color: 'var(--txt1)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt1)' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    className="fld"
                    placeholder="Min 6 characters"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    style={{ borderRadius: '10px', padding: '10px 14px', color: 'var(--txt1)' }}
                  />
                </div>

                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt1)' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="fld"
                    placeholder="Repeat new password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    style={{ borderRadius: '10px', padding: '10px 14px', color: 'var(--txt1)' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-o"
                style={{ marginTop: '4px', borderRadius: '12px', padding: '12px', fontWeight: 800 }}
              >
                Update Password Credentials
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: 2FA, ACCESS PERMISSIONS, & SESSIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* TWO-STEP SMS VERIFICATION SHIELD CARD */}
          <div
            className="acard"
            style={{
              borderRadius: '24px',
              padding: '26px',
              background: 'var(--surf)',
              border: '1px solid var(--line)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: '0 0 2px 0', fontSize: '17px', fontWeight: 900, color: 'var(--txt1)' }}>
                  Two-Step SMS Verification (2FA)
                </h3>
                <div style={{ fontSize: '12.5px', color: 'var(--txt2)' }}>
                  SMS authentication code required when signing in from new devices.
                </div>
              </div>

              {/* REFINED SLEEK STATUS BADGE */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '99px',
                  fontSize: '12px',
                  fontWeight: 800,
                  background: profile.tfaEnabled ? 'rgba(34, 197, 94, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                  color: profile.tfaEnabled ? '#22C55E' : 'var(--txt2)',
                  border: profile.tfaEnabled ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(148, 163, 184, 0.35)',
                  boxShadow: profile.tfaEnabled ? '0 4px 12px rgba(34, 197, 94, 0.15)' : undefined,
                }}
              >
                {profile.tfaEnabled ? '🛡️ 2FA Active' : '⚪ 2FA Off'}
              </span>
            </div>

            <div
              style={{
                padding: '14px 16px',
                borderRadius: '14px',
                background: 'var(--surf)',
                border: '1px solid var(--line)',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <b style={{ fontSize: '13.5px', color: 'var(--txt1)' }}>SMS Dispatch Number</b>
                <div style={{ fontSize: '12px', color: 'var(--txt2)' }}>{profile.phone}</div>
              </div>

              <button
                type="button"
                className={`btn ${profile.tfaEnabled ? 'btn-o' : 'btn-p'} btn-s`}
                onClick={handleToggle2FA}
                style={{ borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}
              >
                {profile.tfaEnabled ? 'Disable 2FA Shield' : 'Enable 2FA Shield'}
              </button>
            </div>
          </div>

          {/* AUTHORIZED SCOPE CARD */}
          <div
            className="acard"
            style={{
              borderRadius: '24px',
              padding: '26px',
              background: 'var(--surf)',
              border: '1px solid var(--line)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
            }}
          >
            <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: 900, color: 'var(--txt1)' }}>
              Assigned Administrative Scope
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: 'var(--txt2)' }}>
              Permissions attached to your Apex Administrator role level.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '8px', borderBottom: '1px solid var(--line)' }}>
                <span style={{ color: 'var(--txt2)' }}>Role Level</span>
                <b style={{ color: 'var(--p)' }}>Apex Admin (Olus Yar)</b>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingBottom: '8px', borderBottom: '1px solid var(--line)' }}>
                <span style={{ color: 'var(--txt2)' }}>Town Jurisdiction</span>
                <b style={{ color: '#3B82F6' }}>All 14 Town Branches</b>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--txt2)' }}>Accessible Screens</span>
                <b style={{ color: '#22C55E' }}>24 Operational Desks</b>
              </div>
            </div>

            <Link
              href="/admin/roles"
              className="btn btn-o btn-s"
              style={{ display: 'block', textAlign: 'center', borderRadius: '10px', padding: '10px', fontWeight: 800, textDecoration: 'none' }}
            >
              View Full Role Matrix →
            </Link>
          </div>

          {/* ACTIVE SESSIONS CARD */}
          <div
            className="acard"
            style={{
              borderRadius: '24px',
              padding: '26px',
              background: 'var(--surf)',
              border: '1px solid var(--line)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
            }}
          >
            <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: 900, color: 'var(--txt1)' }}>
              Active Device Sessions
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: 'var(--txt2)' }}>
              Devices currently signed in to your account.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
              {sessions.map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: 'var(--surf)',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '200px' }}>
                    <span style={{ fontSize: '20px' }}>{s.icon}</span>
                    <div>
                      <b style={{ fontSize: '13px', color: 'var(--txt1)', display: 'block' }}>{s.device}</b>
                      <span style={{ fontSize: '11.5px', color: 'var(--txt2)' }}>{s.location} · {s.time}</span>
                    </div>
                  </div>

                  {/* REFINED SLEEK THIS DEVICE BADGE */}
                  {s.isCurrent ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 12px',
                        borderRadius: '99px',
                        fontSize: '12px',
                        fontWeight: 800,
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: '#22C55E',
                        border: '1px solid rgba(34, 197, 94, 0.35)',
                        boxShadow: '0 2px 8px rgba(34, 197, 94, 0.12)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      🟢 Current Session
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-o btn-s"
                      onClick={() => handleSignOutSession(s.id)}
                      style={{ borderRadius: '8px', fontSize: '11.5px', padding: '4px 12px', fontWeight: 700 }}
                    >
                      Sign Out
                    </button>
                  )}
                </div>
              ))}
            </div>

            {sessions.length > 1 && (
              <button
                type="button"
                className="btn btn-d"
                onClick={handleSignOutEverywhere}
                style={{ width: '100%', borderRadius: '12px', padding: '11px', fontWeight: 800 }}
              >
                Sign Out All Other Devices
              </button>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
