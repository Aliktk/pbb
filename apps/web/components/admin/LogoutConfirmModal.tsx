'use client';

import { useState } from 'react';
import { Icon } from '../Icon';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export function LogoutConfirmModal({ isOpen, onClose, onConfirm }: LogoutConfirmModalProps) {
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleConfirm() {
    try {
      setSubmitting(true);
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#18191E',
          border: '1px solid #2D3039',
          borderRadius: '24px',
          padding: '28px',
          color: '#FFFFFF',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Warning Icon Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'rgba(224, 43, 32, 0.15)',
              border: '1px solid rgba(224, 43, 32, 0.25)',
              color: '#E02B20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name="logout" size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '19px', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              Sign Out of Admin
            </h3>
            <span style={{ fontSize: '13px', color: '#9CA0A8', fontWeight: 500 }}>
              Confirm your session termination
            </span>
          </div>
        </div>

        <p style={{ fontSize: '14px', lineHeight: 1.55, color: '#D1D5DB', margin: '0 0 24px' }}>
          Are you sure you want to log out of the Blood Register admin portal? Any unsaved edits will be discarded.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              flex: 1,
              height: '44px',
              borderRadius: '12px',
              background: '#24262E',
              border: '1px solid #363945',
              color: '#E5E7EB',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            style={{
              flex: 1,
              height: '44px',
              borderRadius: '12px',
              background: 'var(--red)',
              border: 0,
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(224, 43, 32, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'opacity 0.2s ease',
            }}
          >
            {submitting ? (
              'Signing Out...'
            ) : (
              <>
                <Icon name="logout" size={16} />
                Yes, Sign Out
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
