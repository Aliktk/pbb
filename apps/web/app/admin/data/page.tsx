'use client';

import { useState, FormEvent } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { Icon } from '../../../components/Icon';
import { CustomSelect } from '../../../components/CustomSelect';

type MapState = 'ok' | 'warn' | 'off';

interface MapRow {
  field: string;
  column: string;
  state: MapState;
}

const INITIAL_MAPPING: MapRow[] = [
  { field: 'Donor Full Name', column: 'Column A - Name', state: 'ok' },
  { field: 'Blood Group & Rh', column: 'Column C - Grp', state: 'ok' },
  { field: 'Telephone Number', column: 'Column D - Contact', state: 'ok' },
  { field: 'Town Jurisdiction', column: 'Column F - Area', state: 'ok' },
  { field: 'Last Donation Date', column: 'Column H - Date', state: 'warn' },
  { field: 'Residential Address', column: 'Column I - Address', state: 'off' },
];

interface DuplicateRecord {
  id: string;
  name: string;
  phone: string;
  reason: string;
  resolved?: 'merged' | 'kept';
}

const INITIAL_DUPES: DuplicateRecord[] = [
  { id: 'dup-1', name: 'Abdul Samad Kakar', phone: '0300-3815590', reason: 'Already registered on Quetta Central Register' },
  { id: 'dup-2', name: 'Muhammad Ayaz', phone: '0333-7828121', reason: 'Already registered on Pishin Branch Register' },
  { id: 'dup-3', name: 'Tariq Shah Kasi', phone: '0312-9988776', reason: 'Matches existing CNIC on Loralai Register' },
];

const EXPORT_MODULES = [
  { key: 'donors', name: 'Complete Donor Register', desc: 'Full database across all 14 town branches with phone numbers & blood types.', format: 'CSV or Excel (.xlsx)', icon: '👥' },
  { key: 'requests', name: 'Emergency Blood Requests Log', desc: 'Historical record of emergency hospital requests & dispatch responses.', format: 'CSV', icon: '🩸' },
  { key: 'ledger', name: 'Donations & Collections Ledger', desc: 'Yearly bag collections, donor timestamps, and hospital delivery logs.', format: 'CSV', icon: '📊' },
  { key: 'thalassemia', name: 'Thalassemia Patients Registry', desc: 'Anonymized registry of recurring care recipients and recurring transfusions.', format: 'CSV', icon: '🏥' },
  { key: 'full', name: 'Master System Database Backup', desc: 'Full snapshot of all database tables, system settings, and audit logs.', format: 'SQL / JSON Archive', icon: '💾' },
];

const BACKUP_HISTORY = [
  { id: 'bk-1', label: 'Last Night Backup', date: '15 Aug 2026', time: '02:00 AM', size: '42.8 MB', hash: 'sha256-a9b8...c7d6', status: 'Complete' },
  { id: 'bk-2', label: 'Two Nights Ago', date: '14 Aug 2026', time: '02:00 AM', size: '42.4 MB', hash: 'sha256-e5f6...g7h8', status: 'Complete' },
  { id: 'bk-3', label: 'Three Nights Ago', date: '13 Aug 2026', time: '02:00 AM', size: '42.1 MB', hash: 'sha256-i9j0...k1l2', status: 'Complete' },
  { id: 'bk-4', label: 'Weekly Master Backup', date: '10 Aug 2026', time: '02:00 AM', size: '41.9 MB', hash: 'sha256-m3n4...o5p6', status: 'Complete' },
];

const TABS = [
  { id: 'import', label: '📥 Import Old Registers' },
  { id: 'export', label: '📤 Export & Reports' },
  { id: 'backups', label: '💾 Automated Backups' },
  { id: 'privacy', label: '🔒 Privacy Removal' },
] as const;

export default function AdminData() {
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'backups' | 'privacy'>('import');

  // Import State
  const [fileUploaded, setFileUploaded] = useState(false);
  const [mapping, setMapping] = useState<MapRow[]>(INITIAL_MAPPING);
  const [dupes, setDupes] = useState<DuplicateRecord[]>(INITIAL_DUPES);
  const [isImporting, setIsImporting] = useState(false);

  // Export State
  const [exportReason, setExportReason] = useState('');
  const [selectedExport, setSelectedExport] = useState<string | null>(null);

  // Privacy State
  const [privacyQuery, setPrivacyQuery] = useState('');
  const [privacyFound, setPrivacyFound] = useState<string | null>(null);

  function handleSimulateUpload() {
    setFileUploaded(true);
    showToast('Loaded spreadsheet "Quetta_Historical_Register_1999_2026.xlsx" (1,842 rows)');
  }

  function handleResolveDupe(id: string, action: 'merged' | 'kept') {
    setDupes((cur) =>
      cur.map((d) => (d.id === id ? { ...d, resolved: action } : d))
    );
    showToast(`Duplicate record ${action === 'merged' ? 'merged into existing profile' : 'kept as separate donor'}.`);
  }

  function handleExecuteImport() {
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      showToast('Successfully imported 1,842 donor records into the live register!');
    }, 1200);
  }

  function handleExportDownload(moduleName: string) {
    if (!exportReason.trim()) {
      showToast('Please type an audit reason before exporting data.');
      return;
    }
    showToast(`Exporting "${moduleName}". Audit reason logged permanently.`);
    setSelectedExport(null);
    setExportReason('');
  }

  function handlePrivacySearch(e: FormEvent) {
    e.preventDefault();
    if (!privacyQuery.trim()) return;
    setPrivacyFound(privacyQuery.trim());
  }

  function handleExecutePrivacyRemoval() {
    showToast(`Donor "${privacyFound}" has been anonymized and removed. Total bag count preserved.`);
    setPrivacyFound(null);
    setPrivacyQuery('');
  }

  return (
    <AdminShell
      view="data"
      title="Data Management &amp; Archives"
      subtitle="Import historical registers, export reports, and manage nightly system backups"
    >
      {/* SEGMENTED TAB NAVIGATION BAR */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '8px',
          marginBottom: '24px',
          background: 'var(--surf)',
          padding: '6px',
          borderRadius: '20px',
          border: '1.5px solid var(--line)',
        }}
      >
        {TABS.map((t) => {
          const isSelected = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '14px 20px',
                borderRadius: '14px',
                fontSize: '15px',
                fontWeight: isSelected ? 900 : 700,
                cursor: 'pointer',
                border: isSelected ? '1.5px solid #B31F16' : '1.5px solid var(--line)',
                background: isSelected ? '#D92323' : 'var(--surf)',
                color: isSelected ? '#FFFFFF' : '#0F172A',
                boxShadow: isSelected ? '0 8px 24px rgba(217, 35, 35, 0.4)' : undefined,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: isSelected ? '#FFFFFF' : '#0F172A', fontWeight: isSelected ? 900 : 700 }}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 0: IMPORT OLD REGISTERS */}
      {activeTab === 'import' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* UPLOAD & DROPZONE CARD */}
          <div
            className="acard"
            style={{
              borderRadius: '24px',
              padding: '28px',
              background: 'var(--surf)',
              border: '1px solid var(--line)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
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
                  fontSize: '20px',
                  flexShrink: 0,
                }}
              >
                📥
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: 'var(--txt1)' }}>
                  Import Historical Paper Registers
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--txt2)' }}>
                  27 years of physical blood bank ledger books converted seamlessly into digital registers
                </p>
              </div>
            </div>

            {/* DROPZONE AREA */}
            <div
              className="dropzone"
              onClick={handleSimulateUpload}
              style={{
                borderRadius: '20px',
                padding: '36px 20px',
                border: fileUploaded ? '2px solid #22C55E' : '2px dashed var(--line)',
                background: fileUploaded ? 'rgba(34, 197, 94, 0.06)' : 'var(--surf)',
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: '20px',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                {fileUploaded ? '📄' : '📁'}
              </div>
              <b style={{ fontSize: '15px', color: 'var(--txt1)', display: 'block', marginBottom: '4px' }}>
                {fileUploaded
                  ? 'Quetta_Historical_Register_1999_2026.xlsx Loaded'
                  : 'Drop CSV or Excel Spreadsheet (.xlsx, .csv) Here'}
              </b>
              <span className="sm" style={{ fontSize: '12.5px', color: 'var(--txt2)' }}>
                {fileUploaded
                  ? '1,842 rows detected · Column auto-mapping completed'
                  : 'or click to browse file system / load sample register book'}
              </span>
            </div>

            {/* COLUMN MAPPING HEADER */}
            <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 800, color: 'var(--txt1)' }}>
              Column Mapping &amp; Field Alignment
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {mapping.map((m, i) => (
                <div
                  key={m.field}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    background: 'var(--surf)',
                    border: '1px solid var(--line)',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--txt1)', width: '160px' }}>
                    {m.field}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--txt2)', flex: 1, fontFamily: 'monospace' }}>
                    {m.column}
                  </span>
                  <div>
                    {m.state === 'ok' && <span className="tag ok" style={{ fontSize: '11px', fontWeight: 800 }}>Matched</span>}
                    {m.state === 'warn' && <span className="tag wt" style={{ fontSize: '11px', fontWeight: 800 }}>Check Date Format</span>}
                    {m.state === 'off' && <span className="tag gy" style={{ fontSize: '11px', fontWeight: 700 }}>Skipped</span>}
                  </div>
                </div>
              ))}
            </div>

            <p className="ahint" style={{ fontSize: '12.5px', lineHeight: 1.5 }}>
              💡 Safety Rule: Dates in historical registers were written in several formats. Anything the system cannot parse with 100% confidence is left blank for manual verification — an incorrect last donation date puts donor health at risk.
            </p>
          </div>

          {/* PRE-IMPORT CHECK RESULTS CARD */}
          <div
            className="acard"
            style={{
              borderRadius: '24px',
              padding: '28px',
              background: 'var(--surf)',
              border: '1px solid var(--line)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            }}
          >
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 900, color: 'var(--txt1)' }}>
              Pre-Import Data Validation Summary
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--txt2)' }}>
              Validation checks completed on 1,842 rows. Nothing is written to the database until confirmed.
            </p>

            {/* STAT BOXES MATRIX */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '22px' }}>
              <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#22C55E' }}>1,842</div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#22C55E', marginTop: '2px' }}>Rows Ready</div>
              </div>

              <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(234, 179, 8, 0.12)', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#EAB308' }}>3</div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#EAB308', marginTop: '2px' }}>Duplicates Found</div>
              </div>

              <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(217, 35, 35, 0.12)', border: '1px solid rgba(217, 35, 35, 0.3)' }}>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--p)' }}>14</div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--p)', marginTop: '2px' }}>Missing Phone</div>
              </div>

              <div style={{ padding: '16px', borderRadius: '16px', background: 'var(--surf)', border: '1px solid var(--line)' }}>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--txt2)' }}>7</div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--txt2)', marginTop: '2px' }}>Missing Blood Type</div>
              </div>
            </div>

            {/* DUPLICATE RESOLUTION LIST */}
            <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 800, color: 'var(--txt1)' }}>
              Duplicate Resolution Queue
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {dupes.map((d) => (
                <div
                  key={d.id}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'var(--surf)',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <b style={{ fontSize: '14px', color: 'var(--txt1)' }}>{d.name}</b>
                    <div style={{ fontSize: '12.5px', color: 'var(--txt2)', marginTop: '2px' }}>
                      {d.phone} · <span style={{ color: '#EAB308', fontWeight: 600 }}>{d.reason}</span>
                    </div>
                  </div>

                  {d.resolved ? (
                    <span className="tag ok" style={{ fontSize: '11.5px', fontWeight: 800 }}>
                      ✓ {d.resolved === 'merged' ? 'Merged with Existing' : 'Kept Separate'}
                    </span>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-o btn-s"
                        onClick={() => handleResolveDupe(d.id, 'merged')}
                        style={{ borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}
                      >
                        Merge Records
                      </button>
                      <button
                        type="button"
                        className="btn btn-o btn-s"
                        onClick={() => handleResolveDupe(d.id, 'kept')}
                        style={{ borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}
                      >
                        Keep Both
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-p"
              onClick={handleExecuteImport}
              disabled={isImporting}
              style={{
                width: '100%',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '14px',
                fontWeight: 900,
                boxShadow: '0 8px 25px rgba(217, 35, 35, 0.25)',
              }}
            >
              {isImporting ? 'Importing Register Data...' : 'Confirm & Execute Import (1,842 Donors)'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: EXPORT & DATA REPORTS */}
      {activeTab === 'export' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div
            className="acard"
            style={{
              borderRadius: '24px',
              padding: '28px',
              background: 'var(--surf)',
              border: '1px solid var(--line)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(59, 130, 246, 0.12)',
                  color: '#3B82F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0,
                }}
              >
                📤
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: 'var(--txt1)' }}>
                  System Data Exports &amp; Audit Security
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--txt2)' }}>
                  Head office export authority. Every data extraction requires a typed audit reason.
                </p>
              </div>
            </div>

            {/* EXPORT MODULES GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {EXPORT_MODULES.map((m) => (
                <div
                  key={m.key}
                  style={{
                    padding: '20px',
                    borderRadius: '18px',
                    background: 'var(--surf)',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px' }}>{m.icon}</span>
                      <h4 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: 'var(--txt1)' }}>
                        {m.name}
                      </h4>
                    </div>
                    <p style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: 'var(--txt2)', lineHeight: 1.5 }}>
                      {m.desc}
                    </p>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: 'var(--surf)', border: '1px solid var(--line)', color: 'var(--txt1)' }}>
                      Format: {m.format}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-p btn-s"
                    onClick={() => setSelectedExport(m.name)}
                    style={{ borderRadius: '10px', padding: '8px 16px', fontWeight: 800, alignSelf: 'flex-start' }}
                  >
                    Export {m.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUTOMATED NIGHTLY BACKUPS */}
      {activeTab === 'backups' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div
            className="acard"
            style={{
              borderRadius: '24px',
              padding: '28px',
              background: 'var(--surf)',
              border: '1px solid var(--line)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'rgba(34, 197, 94, 0.12)',
                    color: '#22C55E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0,
                  }}
                >
                  💾
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: 'var(--txt1)' }}>
                    Automated Nightly Backups &amp; Snapshots
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--txt2)' }}>
                    Backups trigger automatically at 02:00 AM daily and are retained for 90 days
                  </p>
                </div>
              </div>

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
                🟢 90 Snapshots Verified Intact
              </span>
            </div>

            {/* BACKUPS HISTORY TABLE */}
            <div className="atbl" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <table>
                <thead>
                  <tr>
                    <th>Snapshot Point</th>
                    <th>Timestamp</th>
                    <th>File Size</th>
                    <th>SHA-256 Integrity Hash</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {BACKUP_HISTORY.map((b) => (
                    <tr key={b.id}>
                      <td className="m2">
                        <b style={{ color: 'var(--txt1)', fontSize: '14px' }}>{b.label}</b>
                        <div style={{ fontSize: '12px', color: 'var(--txt2)' }}>{b.date}</div>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--txt1)', fontWeight: 600 }}>{b.time}</td>
                      <td style={{ fontSize: '13px', color: 'var(--txt1)' }}>{b.size}</td>
                      <td style={{ fontSize: '12px', color: 'var(--txt2)', fontFamily: 'monospace' }}>{b.hash}</td>
                      <td>
                        <span className="tag ok" style={{ fontSize: '11px', fontWeight: 800 }}>Complete</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-o btn-s"
                          onClick={() => showToast(`Restoring from ${b.label} (${b.date}) requires Super Admin authorization.`)}
                          style={{ borderRadius: '8px', fontSize: '11.5px', padding: '4px 10px', fontWeight: 700 }}
                        >
                          Restore Point
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRIVACY REMOVAL (RIGHT TO BE FORGOTTEN) */}
      {activeTab === 'privacy' && (
        <div style={{ maxWidth: '680px' }}>
          <div
            className="acard"
            style={{
              borderRadius: '24px',
              padding: '28px',
              background: 'rgba(217, 35, 35, 0.08)',
              border: '1px solid rgba(217, 35, 35, 0.35)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'var(--p)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0,
                }}
              >
                🔒
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: 'var(--p)' }}>
                  Right to be Forgotten &amp; Privacy Removal
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--txt2)' }}>
                  A donor requesting profile removal is anonymized immediately without friction
                </p>
              </div>
            </div>

            <form onSubmit={handlePrivacySearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input
                type="text"
                className="fld"
                placeholder="Enter donor name, CNIC, or telephone number..."
                value={privacyQuery}
                onChange={(e) => setPrivacyQuery(e.target.value)}
                style={{ flex: 1, borderRadius: '12px', padding: '12px 14px', color: 'var(--txt1)' }}
                required
              />
              <button type="submit" className="btn btn-p" style={{ borderRadius: '12px', padding: '12px 20px', fontWeight: 800 }}>
                Find Donor
              </button>
            </form>

            {privacyFound && (
              <div
                style={{
                  padding: '20px',
                  borderRadius: '18px',
                  background: 'var(--surf)',
                  border: '1px solid var(--line)',
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--txt1)', marginBottom: '4px' }}>
                  Donor Record Located: &quot;{privacyFound}&quot;
                </div>
                <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: 'var(--txt2)', lineHeight: 1.5 }}>
                  Executing removal permanently redacts personal identity details (Name, CNIC, Address, Telephone). Donation bag volume metrics remain in annual statistics anonymously without personal data.
                </p>

                <button
                  type="button"
                  className="btn btn-d"
                  onClick={handleExecutePrivacyRemoval}
                  style={{ width: '100%', borderRadius: '10px', padding: '12px', fontWeight: 800 }}
                >
                  Anonymize &amp; Remove Personal Record
                </button>
              </div>
            )}

            <p className="ahint" style={{ fontSize: '12.5px', lineHeight: 1.5 }}>
              💡 Quetta HQ Policy: We do not ask donors why they wish to be removed. Every removal operation is written to the audit log for compliance.
            </p>
          </div>
        </div>
      )}

      {/* EXPORT REASON MODAL */}
      {selectedExport && (
        <>
          <div
            className="sheetov on"
            onClick={() => setSelectedExport(null)}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '19px', fontWeight: 900, margin: 0, color: 'var(--txt1)' }}>
                Audit Reason Required
              </h2>
              <button
                type="button"
                className="btn-cross-delete"
                onClick={() => setSelectedExport(null)}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--txt2)', lineHeight: 1.5 }}>
              Exporting <b>{selectedExport}</b> is logged at Quetta HQ. Type the purpose of this export for compliance.
            </p>

            <div className="fgrp" style={{ marginBottom: '18px' }}>
              <label className="lb" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--txt1)' }}>Export Purpose / Reason *</label>
              <textarea
                className="fld"
                placeholder="e.g. Monthly Quetta health board compliance report..."
                value={exportReason}
                onChange={(e) => setExportReason(e.target.value)}
                style={{ borderRadius: '12px', padding: '10px 14px', color: 'var(--txt1)', minHeight: '80px', fontFamily: 'inherit' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-p"
                onClick={() => handleExportDownload(selectedExport)}
                style={{ flex: 1, borderRadius: '10px', padding: '12px', fontWeight: 800 }}
              >
                Confirm &amp; Download Export
              </button>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
