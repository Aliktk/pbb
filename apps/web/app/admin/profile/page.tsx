'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../lib/auth';
import { Icon } from '../../../components/Icon';

// My profile, wired straight to Supabase. The signed-in user comes from useAuth (their profiles
// row, RLS-scoped). "Save Profile Changes" updates profiles.name for their own row (0014 grants a
// column-level UPDATE on name + a self-row policy). "Update Password" calls supabase.auth. Email,
// role and town are shown read-only here because a user cannot change their own role/town, and
// email is the Auth identity - it is not edited on this screen.

export default function AdminProfile() {
  const { user: authUser, refetchUser } = useAuth();
  const [loading, setLoading] = useState(true);

  // Editable field: display name only.
  const [name, setName] = useState('');
  // Avatar preview is LOCAL ONLY - there is no avatar column in profiles, so it is not persisted.
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const email = authUser?.email ?? '';

  // Seed the form from the authenticated user's profile (already loaded by the auth provider).
  useEffect(() => {
    if (authUser) {
      setName(authUser.name || '');
    }
    setLoading(false);
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
          showToast('Avatar preview set (shown here only - not saved to the database).');
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  }

  // Save Profile Changes - updates only the display name on the caller's own profiles row.
  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter your full name.');
      return;
    }
    if (!authUser) return;

    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: name.trim() })
        .eq('id', authUser.id);
      if (error) throw new Error(error.message);

      await refetchUser();
      showToast('Profile name updated.');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Could not update your profile.');
    } finally {
      setIsSavingProfile(false);
    }
  }

  // Update Password - via Supabase Auth for the signed-in user.
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

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);

      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated.');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Could not update your password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  const roleName = authUser?.role?.name || 'Staff';
  const townName = authUser?.townId ? 'Assigned town' : 'All towns';

  return (
    <AdminShell
      view="profile"
      title="My Administrative Profile"
      subtitle={`${name || authUser?.name || 'Signed-in user'} · ${roleName}`}
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
                      alt={name || 'Profile Picture'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '36px', fontWeight: 900, color: 'var(--p)' }}>
                      {(name || authUser?.name || 'A').slice(0, 2).toUpperCase()}
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
                  {name || authUser?.name}
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
                  ✉️ {email}
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
              Update your display name. Your email, role and town are managed by the head office and
              shown here read-only.
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
                  <label className="lb" style={{ fontWeight: 700 }}>Email Address (read-only)</label>
                  <input
                    type="email"
                    className="fld"
                    value={email}
                    disabled
                    readOnly
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700 }}>Role &amp; Town (read-only)</label>
                  <input
                    type="text"
                    className="fld"
                    value={`${roleName} · ${townName}`}
                    disabled
                    readOnly
                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                  />
                </div>

                <div className="fgrp">
                  <label className="lb" style={{ fontWeight: 700 }}>Profile Avatar (preview only, not saved)</label>
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
