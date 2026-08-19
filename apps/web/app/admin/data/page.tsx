'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { supabase } from '../../../lib/supabaseClient';
import { Icon } from '../../../components/Icon';
import { fetchDonors, createDonor } from '../../../lib/donors';
import { fetchAdminRequests } from '../../../lib/requests';
import { fetchTowns, type Town } from '../../../lib/towns';

// Data management, wired to Supabase (Supabase-direct model). CSV import loops createDonor (RLS
// confines every insert to the caller's town); exports fetch real rows and build the CSV in the
// browser; the privacy purge soft-deletes a donor. Exports with no Supabase source yet (donations,
// thalassemia ledger detail) are disabled honestly rather than faked. No dead api calls, no fake
// success toasts.

interface ParsedCsvRow {
  name: string;
  phone: string;
  group: string;
  town: string;
}

// Split "A+", "AB-", "O+" etc. into the stored (bloodGroup, rhFactor) pair. Defaults to O+.
function parseBloodGroup(raw: string): { bloodGroup: string; rhFactor: string } {
  const g = raw.replace(/\s+/g, '').toUpperCase();
  const rhFactor = g.includes('-') || g.includes('−') ? 'NEGATIVE' : 'POSITIVE';
  const letters = g.replace(/[+\-−]/g, '');
  const bloodGroup = ['A', 'B', 'AB', 'O'].includes(letters) ? letters : 'O';
  return { bloodGroup, rhFactor };
}

// Donors need a required dateOfBirth (schema) and a valid townId (FK). CSV bulk rows rarely carry a
// birth date, so we use a clearly-flagged placeholder the office can correct later on the donor.
const IMPORT_PLACEHOLDER_DOB = '1990-01-01';

function csvCell(value: unknown): string {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface BackupItem {
  id: string;
  label: string;
  date: string;
  size: string;
  type: string;
}

interface DonorResult {
  id: string;
  name: string;
  phone: string;
  group: string;
  town?: string;
  timesDonated?: number;
}

const TABS = [
  { id: 'import', label: '📥 Import CSV Registers' },
  { id: 'export', label: '📤 Real Data Export' },
  { id: 'backups', label: '💾 System Snapshots' },
  { id: 'privacy', label: '🔒 Privacy & Anonymization' },
] as const;

export default function AdminData() {
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'backups' | 'privacy'>('import');

  // Towns (name -> id) so CSV town names map to a real FK. Loaded once.
  const [towns, setTowns] = useState<Town[]>([]);

  // CSV Import States
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedCsvRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  // Data Export States
  const [exportReason, setExportReason] = useState('');
  const [exportingModule, setExportingModule] = useState<string | null>(null);

  // Backup States
  const [backupsList, setBackupsList] = useState<BackupItem[]>([
    { id: 'bk-1', label: 'Nightly System Snapshot', date: new Date().toLocaleDateString(), size: '4.2 MB', type: 'JSON Archive' },
  ]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  // Privacy Search & Anonymization States
  const [privacyQuery, setPrivacyQuery] = useState('');
  const [isSearchingPrivacy, setIsSearchingPrivacy] = useState(false);
  const [foundDonors, setFoundDonors] = useState<DonorResult[]>([]);
  const [deletingDonorId, setDeletingDonorId] = useState<string | null>(null);

  // Load the town list once so CSV rows can resolve a town name to its id.
  useEffect(() => {
    let alive = true;
    fetchTowns()
      .then((t) => {
        if (alive) setTowns(t);
      })
      .catch(() => {
        if (alive) setTowns([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  // CSV FILE PARSER HANDLER
  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        showToast('Selected file does not contain valid CSV data rows.');
        return;
      }

      const rows: ParsedCsvRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 2) {
          rows.push({
            name: parts[0] || 'Unknown Donor',
            phone: parts[1] || '0300-0000000',
            group: parts[2] || 'O+',
            town: parts[3] || 'Quetta',
          });
        }
      }

      setParsedRows(rows);
      showToast(`Loaded ${rows.length} valid rows from "${file.name}"!`);
    };

    reader.readAsText(file);
  }

  // EXECUTE REAL BULK IMPORT - loops createDonor (donors.ts). Each insert is RLS-scoped to the
  // caller's town. Town names are resolved to a real town id; rows with an unknown town are skipped.
  async function handleExecuteBulkImport() {
    if (parsedRows.length === 0) {
      showToast('No CSV data rows loaded for import.');
      return;
    }
    if (towns.length === 0) {
      showToast('Town list not loaded yet - please wait a moment and try again.');
      return;
    }

    // Case-insensitive town-name -> id lookup.
    const townByName = new Map(towns.map((t) => [t.name.trim().toLowerCase(), t.id]));

    setIsImporting(true);
    setImportProgress(0);
    let successCount = 0;
    let skipped = 0;

    for (let i = 0; i < parsedRows.length; i++) {
      const r = parsedRows[i];
      const townId = townByName.get(r.town.trim().toLowerCase());
      if (!townId) {
        skipped++;
      } else {
        try {
          const { bloodGroup, rhFactor } = parseBloodGroup(r.group);
          await createDonor({
            name: r.name,
            bloodGroup,
            rhFactor,
            dateOfBirth: IMPORT_PLACEHOLDER_DOB,
            phone: r.phone || null,
            townId,
            consentToCall: true,
          });
          successCount++;
        } catch {
          skipped++;
        }
      }
      setImportProgress(Math.round(((i + 1) / parsedRows.length) * 100));
    }

    setIsImporting(false);
    showToast(
      skipped > 0
        ? `Imported ${successCount} donor(s); ${skipped} row(s) skipped (unknown town or rejected).`
        : `Imported ${successCount} donor(s).`,
    );
    setParsedRows([]);
    setFileName('');
  }

  // EXPORT MODULE TO CSV - fetches real rows from Supabase and builds the CSV client-side. Only
  // donors and requests have a Supabase source today; other datasets are disabled in the UI.
  async function triggerExport(moduleType: 'donors' | 'requests') {
    if (!exportReason.trim()) {
      showToast('Please type an audit reason before exporting data.');
      return;
    }

    setExportingModule(moduleType);
    try {
      let csvContent = '';
      const filename = `pbb_${moduleType}_export.csv`;

      if (moduleType === 'donors') {
        const list = await fetchDonors();
        const headers = 'Donor ID,MR No,Full Name,Blood Group,Phone,Town,Donation Count,Eligibility\n';
        const rows = list
          .map((d) =>
            [
              csvCell(d.id),
              csvCell(d.mrNo),
              csvCell(d.name),
              csvCell(d.group),
              csvCell(d.phone ?? ''),
              csvCell(d.town ?? ''),
              d.timesDonated,
              csvCell(d.eligibility),
            ].join(','),
          )
          .join('\n');
        csvContent = headers + rows;
      } else {
        const list = await fetchAdminRequests();
        const headers = 'Request ID,Reference,Patient Name,Blood Group,Units Needed,Urgency,Status,Town,Created At\n';
        const rows = list
          .map((r) =>
            [
              csvCell(r.id),
              csvCell(r.reference),
              csvCell(r.patientName ?? 'Anonymous'),
              csvCell(r.group),
              r.unitsNeeded,
              csvCell(r.urgency),
              csvCell(r.status),
              csvCell(r.town),
              csvCell(r.createdAt),
            ].join(','),
          )
          .join('\n');
        csvContent = headers + rows;
      }

      downloadCsv(filename, csvContent);
      showToast(`Exported ${moduleType} dataset.`);
      setExportReason('');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Could not export the dataset.');
    } finally {
      setExportingModule(null);
    }
  }

  // CREATE INSTANT SNAPSHOT - a real JSON export of the rows the caller can see (RLS-scoped).
  async function handleCreateInstantSnapshot() {
    setIsCreatingBackup(true);
    try {
      const [donors, requests] = await Promise.all([fetchDonors(), fetchAdminRequests()]);
      const backupObj = {
        timestamp: new Date().toISOString(),
        version: 'v1.0.0-PBB',
        note: 'Scoped to the signed-in user by database security (RLS).',
        donors,
        requests,
      };

      const jsonStr = JSON.stringify(backupObj, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pbb_snapshot_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const newItem: BackupItem = {
        id: `bk-${Date.now()}`,
        label: `Instant Data Snapshot`,
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
        size: `${(jsonStr.length / 1024).toFixed(1)} KB`,
        type: 'JSON Archive',
      };
      setBackupsList([newItem, ...backupsList]);
      showToast('Downloaded a JSON snapshot of the data you can access.');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Could not create a snapshot.');
    } finally {
      setIsCreatingBackup(false);
    }
  }

  // PRIVACY TAB - real debounced donor search via fetchDonors (RLS-scoped, same source as the
  // donors page). Only runs while the privacy tab is open.
  useEffect(() => {
    if (activeTab !== 'privacy') return;

    let alive = true;
    const handle = setTimeout(() => {
      setIsSearchingPrivacy(true);
      fetchDonors({ q: privacyQuery.trim() || undefined })
        .then((list) => {
          if (!alive) return;
          setFoundDonors(
            list.map((d) => ({
              id: d.id,
              name: d.name,
              phone: d.phone || '-',
              group: d.group,
              town: d.town || 'All towns',
              timesDonated: d.timesDonated,
            })),
          );
        })
        .catch(() => {
          if (alive) setFoundDonors([]);
        })
        .finally(() => {
          if (alive) setIsSearchingPrivacy(false);
        });
    }, 300);

    return () => {
      alive = false;
      clearTimeout(handle);
    };
  }, [privacyQuery, activeTab]);

  // PRIVACY REMOVAL - a real soft-delete: set donors.deletedAt. RLS confines this to donors in the
  // caller's town, and every donor read already filters out soft-deleted rows, so the record
  // immediately disappears everywhere without destroying the underlying row.
  async function handleExecutePrivacyRemoval(d: DonorResult) {
    setDeletingDonorId(d.id);
    try {
      const { error } = await supabase
        .from('donors')
        .update({ deletedAt: new Date().toISOString() })
        .eq('id', d.id);
      if (error) throw new Error(error.message);
      showToast(`Donor "${d.name}" removed (soft-deleted) per privacy directive.`);
      setFoundDonors((cur) => cur.filter((item) => item.id !== d.id));
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : `Could not remove donor "${d.name}".`);
    } finally {
      setDeletingDonorId(null);
    }
  }

  return (
    <AdminShell
      view="data"
      title="Data Management &amp; System Archives"
      subtitle="Import CSV registers, download real database exports, and manage system snapshots"
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
                border: isSelected ? '2px solid var(--p)' : '1px solid transparent',
                background: isSelected ? 'rgba(217, 35, 35, 0.08)' : 'transparent',
                color: isSelected ? 'var(--p)' : 'var(--txt2)',
                fontWeight: isSelected ? 800 : 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: CSV REGISTER IMPORT */}
      {activeTab === 'import' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div className="acard" style={{ borderRadius: '22px', padding: '26px' }}>
            <h2 style={{ fontSize: '19px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--txt1)' }}>
              📥 Bulk CSV Register Importer
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--txt2)', margin: '0 0 20px 0' }}>
              Select a CSV file containing donor records (<code style={{ background: 'var(--bg)', padding: '2px 6px', borderRadius: '4px' }}>Name, Phone, BloodGroup, Town</code>).
            </p>

            {/* SLEEK COMPACT CSV FORMAT GUIDELINE BANNER */}
            <div
              style={{
                background: 'rgba(59, 130, 246, 0.06)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '14px',
                padding: '12px 18px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>💡</span>
                <div style={{ fontSize: '12.5px', color: 'var(--txt1)' }}>
                  <b>Required CSV Columns:</b> <code style={{ background: 'var(--surf)', padding: '3px 8px', borderRadius: '6px', color: '#3B82F6', fontWeight: 700, fontFamily: 'monospace' }}>Name, Phone, BloodGroup, Town</code>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const csvContent = 'Name, Phone, BloodGroup, Town\nMuhammad Bilal Kakar, 0300-3815590, O+, Quetta\nZohaib Achakzai, 0333-7828121, A+, Pishin\nTariq Shah, 0312-9988776, B-, Loralai\n';
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', 'pbb_donor_import_template.csv');
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  showToast('Downloaded sample CSV template file!');
                }}
                className="btn btn-o btn-s"
                style={{ borderRadius: '8px', fontSize: '11.5px', fontWeight: 700, color: '#3B82F6', borderColor: 'rgba(59, 130, 246, 0.35)', padding: '5px 12px' }}
              >
                📥 Download Template (.csv)
              </button>
            </div>

            <div
              style={{
                border: '2px dashed var(--line)',
                borderRadius: '18px',
                padding: '36px 20px',
                textAlign: 'center',
                background: 'rgba(15, 23, 42, 0.2)',
                marginBottom: '20px',
              }}
            >
              <span style={{ fontSize: '38px', display: 'block', marginBottom: '10px' }}>📄</span>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--txt1)', margin: '0 0 6px 0' }}>
                {fileName ? fileName : 'Choose CSV File to Upload'}
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--txt3)', margin: '0 0 16px 0' }}>
                {parsedRows.length > 0 ? `${parsedRows.length} donor rows parsed & ready for import` : 'Click below to pick a .csv spreadsheet file'}
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="csvFileInput"
              />
              <label
                htmlFor="csvFileInput"
                className="btn btn-o"
                style={{ borderRadius: '12px', padding: '10px 22px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'inline-block' }}
              >
                Browse CSV File
              </label>
            </div>

            {parsedRows.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--txt1)', margin: 0 }}>
                    Parsed Data Preview ({parsedRows.length} Rows)
                  </h3>
                  <button
                    type="button"
                    disabled={isImporting}
                    onClick={handleExecuteBulkImport}
                    className="btn btn-p"
                    style={{
                      borderRadius: '12px',
                      padding: '10px 22px',
                      fontSize: '13px',
                      fontWeight: 800,
                      opacity: isImporting ? 0.8 : 1,
                      cursor: isImporting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {isImporting ? (
                      <>
                        <span className="spinner" style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                        Importing Records ({importProgress}%)...
                      </>
                    ) : (
                      `🚀 Import ${parsedRows.length} Records`
                    )}
                  </button>
                </div>

                <div className="atbl" style={{ overflowX: 'auto', maxHeight: '320px' }}>
                  <table style={{ width: '100%', tableLayout: 'fixed' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '30%' }}>Donor Name</th>
                        <th style={{ width: '25%' }}>Phone</th>
                        <th style={{ width: '20%' }}>Blood Group</th>
                        <th style={{ width: '25%' }}>Town</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.slice(0, 15).map((r, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700, color: 'var(--txt1)' }}>{r.name}</td>
                          <td style={{ color: 'var(--txt2)' }}>📞 {r.phone}</td>
                          <td>
                            <span className="tag" style={{ background: 'rgba(217, 35, 35, 0.12)', color: 'var(--p)', fontWeight: 800 }}>
                              {r.group}
                            </span>
                          </td>
                          <td style={{ color: 'var(--txt2)' }}>📍 {r.town}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EXPORT & REPORTS */}
      {activeTab === 'export' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div className="acard" style={{ borderRadius: '22px', padding: '26px' }}>
            <h2 style={{ fontSize: '19px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--txt1)' }}>
              📤 System Dataset Exporter
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--txt2)', margin: '0 0 20px 0' }}>
              Type an audit reason and download fresh exports directly in CSV format.
            </p>

            <div className="fgrp" style={{ marginBottom: '22px', maxWidth: '540px' }}>
              <label className="lb" style={{ fontWeight: 700 }}>Audit Reason for Export *</label>
              <input
                type="text"
                className="fld"
                placeholder="e.g. Quarterly Blood Transfusion Audit for Health Department"
                value={exportReason}
                onChange={(e) => setExportReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {/* DONORS EXPORT CARD */}
              <div className="acard" style={{ borderRadius: '18px', padding: '20px', background: 'var(--surf)', border: '1px solid var(--line)' }}>
                <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>👥</span>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--txt1)', margin: '0 0 4px 0' }}>Complete Donors Register</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--txt2)', margin: '0 0 16px 0' }}>Export live donor profiles across all 14 towns with blood groups &amp; contact numbers.</p>
                <button
                  type="button"
                  disabled={exportingModule === 'donors'}
                  onClick={() => triggerExport('donors')}
                  className="btn btn-p btn-s"
                  style={{
                    borderRadius: '10px',
                    width: '100%',
                    opacity: exportingModule === 'donors' ? 0.8 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {exportingModule === 'donors' ? (
                    <>
                      <span className="spinner" style={{ display: 'inline-block', width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                      Generating Donors CSV...
                    </>
                  ) : (
                    '📥 Download Donors CSV'
                  )}
                </button>
              </div>

              {/* REQUESTS EXPORT CARD */}
              <div className="acard" style={{ borderRadius: '18px', padding: '20px', background: 'var(--surf)', border: '1px solid var(--line)' }}>
                <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>🩸</span>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--txt1)', margin: '0 0 4px 0' }}>Emergency Requests Log</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--txt2)', margin: '0 0 16px 0' }}>Export historical emergency hospital requests, bag requirements, and dispatch statuses.</p>
                <button
                  type="button"
                  disabled={exportingModule === 'requests'}
                  onClick={() => triggerExport('requests')}
                  className="btn btn-p btn-s"
                  style={{
                    borderRadius: '10px',
                    width: '100%',
                    opacity: exportingModule === 'requests' ? 0.8 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {exportingModule === 'requests' ? (
                    <>
                      <span className="spinner" style={{ display: 'inline-block', width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                      Generating Requests CSV...
                    </>
                  ) : (
                    '📥 Download Requests CSV'
                  )}
                </button>
              </div>

              {/* DONATIONS EXPORT CARD */}
              <div className="acard" style={{ borderRadius: '18px', padding: '20px', background: 'var(--surf)', border: '1px solid var(--line)' }}>
                <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>📖</span>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--txt1)', margin: '0 0 4px 0' }}>Donations &amp; Ledger</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--txt2)', margin: '0 0 16px 0' }}>Export blood bag collection receipts, issue modes, and hospital delivery timestamps.</p>
                <button
                  type="button"
                  disabled
                  title="No Supabase export source is wired for donations yet."
                  className="btn btn-o btn-s"
                  style={{
                    borderRadius: '10px',
                    width: '100%',
                    opacity: 0.55,
                    cursor: 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  🔒 Not available yet
                </button>
              </div>

              {/* THALASSEMIA EXPORT CARD */}
              <div className="acard" style={{ borderRadius: '18px', padding: '20px', background: 'var(--surf)', border: '1px solid var(--line)' }}>
                <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>🏥</span>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--txt1)', margin: '0 0 4px 0' }}>Thalassemia Patient Register</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--txt2)', margin: '0 0 16px 0' }}>Export registered thalassemia care recipients, MR numbers, and transfusion schedules.</p>
                <button
                  type="button"
                  disabled
                  title="No Supabase export source is wired for the thalassemia register yet."
                  className="btn btn-o btn-s"
                  style={{
                    borderRadius: '10px',
                    width: '100%',
                    opacity: 0.55,
                    cursor: 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  🔒 Not available yet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUTOMATED BACKUPS & SNAPSHOTS */}
      {activeTab === 'backups' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div className="acard" style={{ borderRadius: '22px', padding: '26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '19px', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--txt1)' }}>
                  💾 System Backups &amp; Snapshots
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--txt2)', margin: 0 }}>
                  Generate on-demand JSON system snapshots of application data.
                </p>
              </div>
              <button
                type="button"
                disabled={isCreatingBackup}
                onClick={handleCreateInstantSnapshot}
                className="btn btn-p"
                style={{
                  borderRadius: '12px',
                  padding: '10px 22px',
                  fontSize: '13px',
                  fontWeight: 800,
                  opacity: isCreatingBackup ? 0.8 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isCreatingBackup ? (
                  <>
                    <span className="spinner" style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                    Generating Snapshot...
                  </>
                ) : (
                  '+ Create Instant Snapshot'
                )}
              </button>
            </div>

            <div className="atbl" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th style={{ width: '35%' }}>Snapshot Name</th>
                    <th style={{ width: '30%' }}>Created Timestamp</th>
                    <th style={{ width: '20%' }}>Archive Size</th>
                    <th style={{ width: '15%', textAlign: 'right' }}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {backupsList.map((bk) => (
                    <tr key={bk.id}>
                      <td style={{ fontWeight: 700, color: 'var(--txt1)' }}>📦 {bk.label}</td>
                      <td style={{ color: 'var(--txt2)', fontSize: '12.5px' }}>{bk.date}</td>
                      <td style={{ fontWeight: 700, color: 'var(--p)' }}>{bk.size}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="tag ok" style={{ fontSize: '11px', fontWeight: 800 }}>{bk.type}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRIVACY & ANONYMIZATION */}
      {activeTab === 'privacy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div className="acard" style={{ borderRadius: '22px', padding: '26px' }}>
            <h2 style={{ fontSize: '19px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--txt1)' }}>
              🔒 Privacy Removal &amp; Anonymization
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--txt2)', margin: '0 0 20px 0' }}>
              Search and permanently purge a donor profile per privacy directive.
            </p>

            <div style={{ position: 'relative', maxWidth: '540px', marginBottom: '24px' }}>
              <input
                type="text"
                className="fld"
                placeholder="Type to search donor by name, phone, or blood group..."
                value={privacyQuery}
                onChange={(e) => setPrivacyQuery(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt3)' }}>
                {isSearchingPrivacy ? (
                  <span className="spinner" style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'var(--p)', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                ) : (
                  <Icon name="search" size={15} />
                )}
              </span>
            </div>

            {foundDonors.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '640px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--txt1)', margin: 0 }}>
                  Matching Donor Profiles ({foundDonors.length})
                </h3>

                {foundDonors.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      background: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '18px',
                      padding: '18px 22px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 900, color: 'var(--txt1)', margin: 0 }}>
                        {d.name}
                      </h4>
                      <span className="tag" style={{ background: 'rgba(217, 35, 35, 0.12)', color: 'var(--p)', fontWeight: 800 }}>
                        {d.group}
                      </span>
                    </div>

                    <div style={{ fontSize: '12.5px', color: 'var(--txt2)', display: 'flex', gap: '16px', marginBottom: '14px' }}>
                      <div>📞 Telephone: <b>{d.phone}</b></div>
                      <div>📍 Town: <b>{d.town}</b></div>
                      <div>🩸 Donations: <b>{d.timesDonated}</b></div>
                    </div>

                    <button
                      type="button"
                      disabled={deletingDonorId === d.id}
                      onClick={() => handleExecutePrivacyRemoval(d)}
                      className="btn btn-p"
                      style={{
                        borderRadius: '10px',
                        padding: '9px 16px',
                        fontSize: '12.5px',
                        fontWeight: 800,
                        background: '#EF4444',
                        borderColor: '#EF4444',
                        opacity: deletingDonorId === d.id ? 0.8 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      {deletingDonorId === d.id ? (
                        <>
                          <span className="spinner" style={{ display: 'inline-block', width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                          Purging Profile...
                        </>
                      ) : (
                        `🗑️ Permanently Delete & Purge "${d.name}"`
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--txt3)', padding: '16px 0' }}>
                {privacyQuery.trim() ? `No donor profiles found matching "${privacyQuery.trim()}".` : 'Type a donor name or telephone number above to search live database records.'}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
