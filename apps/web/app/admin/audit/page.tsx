'use client';

import { useState } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { CustomSelect } from '../../../components/CustomSelect';

type SeverityLevel = 'high' | 'normal' | 'security';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  date: string;
  month: string;
  who: string;
  role: string;
  what: string;
  town: string;
  severity: SeverityLevel;
  reason?: string;
  ip?: string;
  hash?: string;
}

const AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'aud-101', timestamp: '2 mins ago', date: '15 Aug 2026', month: 'August 2026', who: 'Pishin desk', role: 'Data entry', what: 'Added new donor record "Bibi Hawa Kakar" (A+)', town: 'Pishin', severity: 'normal', ip: '182.185.12.44', hash: 'sha256-a9b8c7d6' },
  { id: 'aud-102', timestamp: '18 mins ago', date: '15 Aug 2026', month: 'August 2026', who: 'Website Portal', role: 'System', what: 'Emergency blood request submitted for BMC Hospital', town: 'Quetta', severity: 'normal', ip: '39.40.88.101', hash: 'sha256-e5f6g7h8' },
  { id: 'aud-103', timestamp: '1 hour ago', date: '15 Aug 2026', month: 'August 2026', who: 'Zhob coordinator', role: 'Branch manager', what: 'Marked emergency blood request #REQ-9921 as Arranged', town: 'Zhob', severity: 'normal', ip: '182.185.45.89', hash: 'sha256-i9j0k1l2' },
  { id: 'aud-104', timestamp: '2 hours ago', date: '15 Aug 2026', month: 'August 2026', who: 'Dr. Naseer Muhammad', role: 'Medical Verifier', what: 'Approved lab blood test screening for 4 donors', town: 'All towns', severity: 'security', ip: '182.185.99.12', hash: 'sha256-m3n4o5p6' },
  { id: 'aud-105', timestamp: 'Yesterday', date: '14 Aug 2026', month: 'August 2026', who: 'Olus Yar', role: 'Apex Admin', what: 'Granted photo consent override for donor T-027', town: 'Pishin', severity: 'high', reason: 'Parental consent form signed physically at Pishin drive.', ip: '182.185.10.1', hash: 'sha256-q7r8s9t0' },
  { id: 'aud-106', timestamp: 'Yesterday', date: '14 Aug 2026', month: 'August 2026', who: 'Head Office Admin', role: 'Executive', what: 'Exported full donor registry list (.csv)', town: 'All towns', severity: 'high', reason: 'Annual provincial health board audit compliance check.', ip: '182.185.10.2', hash: 'sha256-u1v2w3x4' },
  { id: 'aud-107', timestamp: '12 Aug 2026', date: '12 Aug 2026', month: 'August 2026', who: 'Zhob coordinator', role: 'Branch manager', what: 'Registered 2 new emergency donor profiles', town: 'Zhob', severity: 'normal', ip: '182.185.45.89', hash: 'sha256-y5z6a7b8' },
  { id: 'aud-108', timestamp: '10 Aug 2026', date: '10 Aug 2026', month: 'August 2026', who: 'Zhob coordinator', role: 'Branch manager', what: 'Updated blood bag inventory stock count', town: 'Zhob', severity: 'normal', ip: '182.185.45.89', hash: 'sha256-c9d0e1f2' },
  { id: 'aud-201', timestamp: '28 Jul 2026', date: '28 Jul 2026', month: 'July 2026', who: 'Loralai desk', role: 'Data entry', what: 'Logged 12 blood bags collected during Loralai Drive', town: 'Loralai', severity: 'normal', ip: '182.185.33.12', hash: 'sha256-g3h4i5j6' },
  { id: 'aud-202', timestamp: '24 Jul 2026', date: '24 Jul 2026', month: 'July 2026', who: 'Olus Yar', role: 'Apex Admin', what: 'Changed minimum donor eligibility weight threshold to 50kg', town: 'All towns', severity: 'security', reason: 'Provincial medical board safety guideline compliance.', ip: '182.185.10.1', hash: 'sha256-k7l8m9n0' },
  { id: 'aud-203', timestamp: '15 Jul 2026', date: '15 Jul 2026', month: 'July 2026', who: 'Dr. Hamid Khan', role: 'Executive', what: 'Appointed new Zhob Branch Coordinator', town: 'Zhob', severity: 'security', ip: '182.185.10.3', hash: 'sha256-o1p2q3r4' },
  { id: 'aud-204', timestamp: '05 Jul 2026', date: '05 Jul 2026', month: 'July 2026', who: 'Head Office Admin', role: 'Executive', what: 'Exported quarterly financial donations ledger', town: 'All towns', severity: 'high', reason: 'Quarterly financial report auditing.', ip: '182.185.10.2', hash: 'sha256-s5t6u7v8' },
  { id: 'aud-301', timestamp: '20 Jun 2026', date: '20 Jun 2026', month: 'June 2026', who: 'Chaman volunteer', role: 'Volunteer lead', what: 'Created awareness event "Chaman Youth Blood Drive"', town: 'Chaman', severity: 'normal', ip: '182.185.66.44', hash: 'sha256-w9x0y1z2' },
  { id: 'aud-302', timestamp: '10 Jun 2026', date: '10 Jun 2026', month: 'June 2026', who: 'Olus Yar', role: 'Apex Admin', what: 'Anonymized & deleted requested donor record', town: 'Quetta', severity: 'high', reason: 'Right to be forgotten request by donor.', ip: '182.185.10.1', hash: 'sha256-a3b4c5d6' },
];

const MONTH_OPTIONS = [
  { value: 'All', label: 'All Months' },
  { value: 'August 2026', label: 'August 2026' },
  { value: 'July 2026', label: 'July 2026' },
  { value: 'June 2026', label: 'June 2026' },
];

export default function AdminAudit() {
  const [logs] = useState<AuditLogEntry[]>(AUDIT_LOGS);
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('All');
  const [openEntry, setOpenEntry] = useState<AuditLogEntry | null>(null);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.who.toLowerCase().includes(search.toLowerCase()) ||
      log.what.toLowerCase().includes(search.toLowerCase()) ||
      log.town.toLowerCase().includes(search.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(search.toLowerCase()));
    const matchesMonth = monthFilter === 'All' || log.month === monthFilter;
    return matchesSearch && matchesMonth;
  });

  return (
    <AdminShell
      view="audit"
      title="Audit Log"
      subtitle={`${filteredLogs.length} Recorded System Operations · Immutable Ledger`}
    >
      {/* CLEAN SEARCH & MONTH FILTER BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
          <input
            type="text"
            className="fld"
            placeholder="Search officer, action, or town..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ borderRadius: '12px', padding: '11px 16px', fontSize: '13.5px', color: 'var(--txt1)', width: '100%', maxWidth: '360px' }}
          />
        </div>

        <div style={{ width: '220px' }}>
          <CustomSelect
            name="monthFilter"
            options={MONTH_OPTIONS}
            value={monthFilter}
            onChange={(val) => setMonthFilter(val)}
            direction="down"
          />
        </div>
      </div>

      {/* STREAMLINED AUDIT LOG TABLE CARD */}
      <div
        className="acard"
        style={{
          borderRadius: '20px',
          padding: '0',
          marginBottom: '24px',
          background: 'var(--surf)',
          border: '1px solid var(--line)',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div className="atbl" style={{ border: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: '130px' }}>When</th>
                <th style={{ width: '180px' }}>Who</th>
                <th>What</th>
                <th style={{ width: '120px' }}>Town</th>
                <th style={{ width: '110px' }}>Severity</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setOpenEntry(log)}
                  style={{ cursor: 'pointer', transition: 'background 0.15s ease' }}
                >
                  <td className="m1 sm" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <b style={{ color: 'var(--txt1)', fontSize: '13px', display: 'block' }}>{log.timestamp}</b>
                    <span style={{ fontSize: '11.5px', color: 'var(--txt2)' }}>{log.date}</span>
                  </td>

                  <td className="m2" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <div className="nm" style={{ fontWeight: 800, color: 'var(--txt1)', fontSize: '13.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.who}
                    </div>
                    <div className="sm" style={{ fontSize: '12px', color: 'var(--txt2)' }}>
                      {log.role}
                    </div>
                  </td>

                  <td style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--txt1)', lineHeight: 1.4 }}>
                      {log.what}
                    </div>
                    {log.reason && (
                      <div style={{ fontSize: '12px', color: '#EAB308', fontStyle: 'italic', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Reason: &quot;{log.reason}&quot;
                      </div>
                    )}
                  </td>

                  <td style={{ width: '120px', whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '99px',
                        background: 'rgba(59, 130, 246, 0.12)',
                        color: '#3B82F6',
                        maxWidth: '100px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      📍 {log.town}
                    </span>
                  </td>

                  <td className="m3" style={{ width: '110px' }}>
                    {log.severity === 'high' && (
                      <span className="tag wt" style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(217, 35, 35, 0.15)', color: 'var(--p)' }}>
                        High Risk
                      </span>
                    )}
                    {log.severity === 'security' && (
                      <span className="tag wt" style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(234, 179, 8, 0.15)', color: '#EAB308' }}>
                        Security
                      </span>
                    )}
                    {log.severity === 'normal' && (
                      <span className="tag ok" style={{ fontSize: '11px', fontWeight: 700 }}>
                        Normal
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--txt2)' }}>
                    No audit log entries match the search or month filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CLEAN EXPLANATION CARDS */}
      <div className="g2" style={{ gap: '16px', alignItems: 'stretch' }}>
        <div
          className="acard"
          style={{
            borderRadius: '18px',
            padding: '20px',
            background: 'var(--surf)',
            border: '1px solid var(--line)',
          }}
        >
          <h3 style={{ margin: '0 0 6px 0', fontSize: '15.5px', fontWeight: 800, color: 'var(--txt1)' }}>
            The log cannot be edited
          </h3>
          <p className="sm" style={{ margin: 0, fontSize: '12.5px', color: 'var(--txt2)', lineHeight: 1.5 }}>
            Not by branch staff, and not by head office. An organisation holding medical records can show exactly who looked at them.
          </p>
        </div>

        <div
          className="acard"
          style={{
            borderRadius: '18px',
            padding: '20px',
            background: 'var(--surf)',
            border: '1px solid var(--line)',
          }}
        >
          <h3 style={{ margin: '0 0 6px 0', fontSize: '15.5px', fontWeight: 800, color: 'var(--p)' }}>
            Three operations that ask why
          </h3>
          <p className="sm" style={{ margin: 0, fontSize: '12.5px', color: 'var(--txt2)', lineHeight: 1.5 }}>
            Deleting a record, exporting the donor list, and granting photo consent. Each writes a line here with the typed reason.
          </p>
        </div>
      </div>

      {/* AUDIT ENTRY DETAIL DRAWER */}
      {openEntry && (
        <>
          <div
            className="sheetov on"
            onClick={() => setOpenEntry(null)}
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
            className="sheet open"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '420px',
              zIndex: 1001,
              background: 'var(--surf)',
              borderLeft: '1px solid var(--line)',
              boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.3)',
              padding: '26px',
              overflowY: 'auto',
            }}
          >
            <button
              type="button"
              className="btn-cross-delete"
              onClick={() => setOpenEntry(null)}
              style={{ position: 'absolute', top: '20px', right: '20px' }}
            >
              ✕
            </button>

            <div style={{ marginBottom: '20px' }}>
              <span className="tag ok" style={{ fontSize: '11px', fontWeight: 800, marginBottom: '6px', display: 'inline-block' }}>
                {openEntry.id}
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 900, margin: '2px 0 4px 0', color: 'var(--txt1)' }}>
                Audit Entry Detail
              </h2>
              <div style={{ fontSize: '12.5px', color: 'var(--txt2)' }}>
                {openEntry.date} · {openEntry.timestamp}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '20px',
                background: 'var(--surf)',
                padding: '16px',
                borderRadius: '16px',
                border: '1px solid var(--line)',
              }}
            >
              <div>
                <span style={{ fontSize: '11.5px', color: 'var(--txt2)', textTransform: 'uppercase', fontWeight: 700 }}>Action Executed</span>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--txt1)', marginTop: '2px' }}>
                  {openEntry.what}
                </div>
              </div>

              {openEntry.reason && (
                <div>
                  <span style={{ fontSize: '11.5px', color: 'var(--txt2)', textTransform: 'uppercase', fontWeight: 700 }}>Typed Reason</span>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#EAB308', marginTop: '2px', fontStyle: 'italic' }}>
                    &quot;{openEntry.reason}&quot;
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingTop: '8px', borderTop: '1px solid var(--line)' }}>
                <span style={{ color: 'var(--txt2)' }}>Officer</span>
                <b style={{ color: 'var(--txt1)' }}>{openEntry.who}</b>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--txt2)' }}>Role</span>
                <b style={{ color: 'var(--txt1)' }}>{openEntry.role}</b>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--txt2)' }}>Town</span>
                <b style={{ color: '#3B82F6' }}>📍 {openEntry.town}</b>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--txt2)' }}>IP Address</span>
                <b style={{ color: 'var(--txt1)', fontFamily: 'monospace' }}>{openEntry.ip || '182.185.10.1'}</b>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--txt2)' }}>Hash</span>
                <b style={{ color: 'var(--txt2)', fontFamily: 'monospace' }}>{openEntry.hash || 'sha256-a9b8'}</b>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-p"
              onClick={() => {
                showToast(`Exported certificate for entry ${openEntry.id}`);
                setOpenEntry(null);
              }}
              style={{ width: '100%', borderRadius: '10px', padding: '11px', fontWeight: 800 }}
            >
              Export Entry Certificate
            </button>
          </div>
        </>
      )}
    </AdminShell>
  );
}
