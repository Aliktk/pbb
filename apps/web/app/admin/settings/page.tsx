'use client';

import { AdminShell } from '../../../components/admin/AdminShell';

export default function AdminSettings() {
  return (
    <AdminShell
      view="settings"
      title="Site Settings"
      subtitle="Managed by head office"
    >
      <div className="acard" style={{ padding: '40px', textAlign: 'center', borderRadius: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--txt1)' }}>
          ⚙️ Settings are managed by head office
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--txt2)', margin: 0 }}>
          There is nothing to configure on this screen for now. More options are coming soon.
        </p>
      </div>
    </AdminShell>
  );
}
