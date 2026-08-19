'use client';

import { AdminShell } from '../../../components/admin/AdminShell';

export default function AdminSettings() {
  return (
    <AdminShell
      view="settings"
      title="Site Settings"
      subtitle="Page currently disabled"
    >
      <div className="acard" style={{ padding: '40px', textAlign: 'center', borderRadius: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--txt1)' }}>
          ⚙️ Site Settings Currently Unavailable
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--txt2)', margin: 0 }}>
          This page has been commented out and disabled as requested.
        </p>
      </div>
    </AdminShell>
  );
}
