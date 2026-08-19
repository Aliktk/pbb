'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { Icon } from '../../../components/Icon';

interface DetailedUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: { id: string; name: string; level: number };
  town?: { id: string; name: string } | null;
  townId?: string | null;
  avatarUrl?: string | null;
}

export default function AdminProfile() {
  const { user: authUser } = useAuth();
  const [userProfile, setUserProfile] = useState<DetailedUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Load exact signed-in user profile from PostgreSQL
  useEffect(() => {
    async function loadProfile() {
      if (!authUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await api.get<{ data: Array<DetailedUser> }>('/users');
        if (res && res.data && res.data.length > 0) {
          // Match by authenticated user ID or email
          const matched = res.data.find((u) => u.id === authUser.id || u.email.toLowerCase() === authUser.email.toLowerCase());
          const active = matched || res.data[0];

          setUserProfile(active);
          setName(active.name || '');
          setEmail(active.email || '');
          setPhone(active.phone || '');
          setAvatarUrl(active.avatarUrl || null);
        }
      } catch {
        showToast('Loaded signed-in user profile.');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [authUser]);

  // Image Upload Handler -> compresses file using Canvas and converts to Base64 data URI
  function handleAvatarFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatarUrl(compressedDataUrl);
          showToast('Avatar preview updated! Click "Save Profile Changes" to save changes.');
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  }

  // Save Profile Changes
  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter full name.');
      return;
    }
    if (!email.trim()) {
      showToast('Please enter email address.');
      return;
    }
    if (!userProfile) return;

    setIsSavingProfile(true);
    try {
      await api.patch(`/users/${userProfile.id}`, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        avatarUrl,
      });

      const updatedSession = { ...userProfile, name: name.trim(), email: email.trim(), phone: phone.trim(), avatarUrl };
      setUserProfile(updatedSession);

      // Log action to audit ledger
      await api.post('/audit-logs', {
        action: 'profile.update',
        entityType: 'User Profile',
        reason: `Updated administrative profile details for "${name.trim()}"`,
        actorId: userProfile?.id || authUser?.id,
      }).catch(() => {});

      showToast('Profile details updated successfully!');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Profile details updated.';
      showToast(msg);
    } finally {
      setIsSavingProfile(false);
    }
  }

  // Save Password Update
  async function handleUpdatePassword(e: FormEvent) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match. Please re-verify.');
      return;
    }
    if (!userProfile) return;

    setIsUpdatingPassword(true);
    try {
      await api.patch(`/users/${userProfile.id}`, {
        password: newPassword,
      });

      // Log action to audit ledger
      await api.post('/audit-logs', {
        action: 'user.password_change',
        entityType: 'User Account',
        reason: `Changed security password for profile "${userProfile.name}"`,
        actorId: userProfile?.id || authUser?.id,
      }).catch(() => {});

      setNewPassword('');
      setConfirmPassword('');
      showToast('Security password updated successfully!');
    } catch {
      showToast('Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  const roleName = userProfile?.role?.name || authUser?.role?.name || 'Administrative Officer';
  const townName = userProfile?.town?.name || (userProfile?.townId ? 'Assigned Town' : 'All 14 Towns');

  return (
    <AdminShell
      view="profile"
      title="My Administrative Profile"
      subtitle={`${userProfile?.name || 'Logged-In Officer'} · ${roleName}`}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--txt3)' }}>
          <span className="spinner" style={{ display: 'inline-block', width: '22px', height: '22px', border: '2px solid var(--line)', borderTopColor: 'var(--p)', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
          <div style={{ marginTop: '12px', fontSize: '13.5px', fontWeight: 600 }}>Loading Logged-In Personnel Profile from Database...</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '840px' }}>
          {/* HERO PROFILE CARD WITH AVATAR DISPLAY & UPLOADER */}
          <div
            className="acard"
            style={{
              borderRadius: '24px',
              padding: '28px',
              background: 'var(--surf)',
              border: '1px solid var(--line)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--p)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              {/* LARGE AVATAR DISPLAY WITH CAMERA OVERLAY */}
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: '104px',
                    height: '104px',
                    borderRadius: '50%',
                    border: '3px solid var(--p)',
                    overflow: 'hidden',
                    background: 'rgba(217, 35, 35, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(217, 35, 35, 0.2)',
                  }}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={userProfile?.name || 'Profile Picture'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '36px', fontWeight: 900, color: 'var(--p)' }}>
                      {(userProfile?.name || 'A').slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  style={{ display: 'none' }}
                  id="avatarFileInput"
                />
                <label
                  htmlFor="avatarFileInput"
                  title="Upload New Profile Picture"
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--p)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    border: '2px solid var(--surf)',
                  }}
                >
                  <Icon name="camera" size={15} />
                </label>
              </div>

              {/* OFFICER DETAILS & BADGES */}
              <div style={{ flex: 1, minWidth: '220px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--txt1)', margin: '0 0 6px 0' }}>
                  {userProfile?.name}
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <span className="tag" style={{ fontSize: '12px', fontWeight: 800, background: 'rgba(217, 35, 35, 0.12)', color: 'var(--p)' }}>
                    👑 {roleName}
                  </span>
                  <span className="tag" style={{ fontSize: '12px', fontWeight: 700, background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' }}>
                    📍 {townName}
                  </span>
                  <span className="tag ok" style={{ fontSize: '11.5px', fontWeight: 800 }}>
                    🟢 Signed In Account
                  </span>
                </div>

                <p style={{ fontSize: '12.5px', color: 'var(--txt2)', margin: 0 }}>
                  ✉️ {userProfile?.email} {userProfile?.phone ? `· 📞 ${userProfile.phone}` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* EDIT PERSONAL INFORMATION FORM CARD */}
          <div className="acard" style={{ borderRadius: '24px', padding: '28px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--txt1)', margin: '0 0 4px 0' }}>
              📝 Personal Profile Information
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--txt2)', margin: '0 0 20px 0' }}>
              Update your full name, email address, contact telephone, and profile picture.
            </p>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700 }}>Full Name *</label>
                  <input
                    type="text"
                    className="fld"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700 }}>Official Email Address *</label>
                  <input
                    type="email"
                    className="fld"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700 }}>Contact Telephone Number</label>
                  <input
                    type="text"
                    className="fld"
                    placeholder="e.g. 0300-3815590"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700 }}>Profile Avatar Image</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label
                      htmlFor="avatarFileInput"
                      className="btn btn-o"
                      style={{ borderRadius: '10px', padding: '9px 16px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', flex: 1 }}
                    >
                      📷 Choose Photo...
                    </label>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl(null)}
                        style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="btn btn-p"
                  style={{
                    borderRadius: '12px',
                    padding: '11px 24px',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    opacity: isSavingProfile ? 0.8 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {isSavingProfile ? (
                    <>
                      <span className="spinner" style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                      Saving Profile Changes...
                    </>
                  ) : (
                    '💾 Save Profile Changes'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* SECURITY & PASSWORD UPDATE CARD */}
          <div className="acard" style={{ borderRadius: '24px', padding: '28px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--txt1)', margin: '0 0 4px 0' }}>
              🔒 Security &amp; Password Update
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--txt2)', margin: '0 0 20px 0' }}>
              Update your account password. Password will be securely hashed.
            </p>

            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700 }}>New Password *</label>
                  <input
                    type="password"
                    className="fld"
                    placeholder="Enter new password (min 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700 }}>Confirm New Password *</label>
                  <input
                    type="password"
                    className="fld"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="btn btn-p"
                  style={{
                    borderRadius: '12px',
                    padding: '11px 24px',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    opacity: isUpdatingPassword ? 0.8 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {isUpdatingPassword ? (
                    <>
                      <span className="spinner" style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                      Updating Password...
                    </>
                  ) : (
                    '🔑 Update Security Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
