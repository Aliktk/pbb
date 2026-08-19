'use client';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  description?: string;
  confirmLabel?: string;
  submitting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDeleteModal({
  isOpen,
  title = 'Confirm Deletion',
  itemName,
  description,
  confirmLabel = 'Yes, Delete Record',
  submitting = false,
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="sheetov on"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 1100,
          opacity: 1,
          visibility: 'visible',
        }}
      />

      {/* Modal Dialog */}
      <div
        className="acard"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '440px',
          zIndex: 1101,
          boxShadow: '0 25px 70px rgba(220, 38, 38, 0.2), 0 10px 30px rgba(0, 0, 0, 0.2)',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8F8 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          padding: '28px',
          overflow: 'hidden',
        }}
      >
        {/* Top Danger Gradient Stripe */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '5px',
            background: 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)',
          }}
        />

        {/* Danger Warning Icon Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              backgroundColor: 'rgba(254, 226, 226, 0.9)',
              border: '1px solid rgba(252, 165, 165, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              color: '#DC2626',
              flexShrink: 0,
            }}
          >
            🗑️
          </div>
          <div>
            <h3 style={{ fontSize: '19px', fontWeight: 800, margin: 0, color: 'var(--ink, #0f172a)' }}>
              {title}
            </h3>
            {itemName && (
              <span
                style={{
                  display: 'inline-block',
                  marginTop: '2px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#DC2626',
                }}
              >
                {itemName}
              </span>
            )}
          </div>
        </div>

        {/* Message Body */}
        <p style={{ margin: '0 0 20px', fontSize: '14px', lineHeight: 1.5, color: 'var(--mid, #475569)' }}>
          {description || (
            <>
              Are you sure you want to permanently delete {itemName ? <b>{itemName}</b> : 'this record'}? This action cannot be undone.
            </>
          )}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-o"
            style={{ flex: 1, padding: '11px', borderRadius: '12px', fontSize: '13.5px', fontWeight: 700 }}
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-d"
            style={{
              flex: 1.3,
              padding: '11px',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 700,
              backgroundColor: submitting ? '#991B1B' : '#DC2626',
              color: '#FFFFFF',
              borderColor: submitting ? '#991B1B' : '#DC2626',
              boxShadow: submitting ? 'none' : '0 4px 14px rgba(220, 38, 38, 0.35)',
              opacity: submitting ? 0.85 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner" style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                Deleting...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </>
  );
}
