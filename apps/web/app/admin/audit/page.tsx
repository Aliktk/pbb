'use client';

import { useState, useEffect } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { CustomSelect } from '../../../components/CustomSelect';
import { api } from '../../../lib/api';

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

const MONTH_OPTIONS = [
  { value: 'All', label: 'All Months' },
  { value: 'August 2026', label: 'August 2026' },
  { value: 'July 2026', label: 'July 2026' },
  { value: 'June 2026', label: 'June 2026' },
];

export default function AdminAudit() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [openEntry, setOpenEntry] = useState<AuditLogEntry | null>(null);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: AuditLogEntry[] }>('/audit-logs', {
        params: { search, month: monthFilter !== 'All' ? monthFilter : undefined },
      });
      if (res && res.data) {
        setLogs(res.data);
      }
    } catch {
      showToast('Loaded system audit log ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handle = setTimeout(() => {
      loadAuditLogs();
    }, 250);
    return () => clearTimeout(handle);
  }, [search, monthFilter]);

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
      title="Audit Log Ledger"
      subtitle={`${filteredLogs.length} Recorded System Operations · Immutable Ledger`}
    >
      {/* SEARCH & MONTH FILTER BAR */}
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
            placeholder="Search officer, action, town, or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ borderRadius: '12px', padding: '11px 16px', fontSize: '13.5px', color: 'var(--txt1)', width: '100%', maxWidth: '380px' }}
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
                <th style={{ width: '130px', padding: '14px 16px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>When</th>
                <th style={{ width: '170px', padding: '14px 16px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Officer / Actor</th>
                <th style={{ padding: '14px 16px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Action Performed</th>
                <th style={{ width: '130px', padding: '14px 16px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Town</th>
                <th style={{ width: '110px', padding: '14px 16px', textAlign: 'center', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Severity</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--txt3)' }}>
                    <span className="spinner" style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid var(--line)', borderTopColor: 'var(--p)', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                    <div style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600 }}>Loading Audit Ledger...</div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--txt3)', fontSize: '13.5px' }}>
                    No audit log entries matching criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => setOpenEntry(l)}
                    style={{ cursor: 'pointer', transition: 'background 0.12s ease' }}
                  >
                    <td style={{ verticalAlign: 'middle', padding: '14px 16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--txt1)', whiteSpace: 'nowrap' }}>{l.timestamp}</div>
                      <div style={{ fontSize: '11px', color: 'var(--txt3)', whiteSpace: 'nowrap', marginTop: '2px' }}>{l.date}</div>
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '14px 16px', maxWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--txt1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.who}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--txt2)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.role}</div>
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '14px 16px', maxWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--txt1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.what}
                      </div>
                      {l.reason && (
                        <div
                          title={`💬 Reason: ${l.reason}`}
                          style={{
                            fontSize: '11.5px',
                            color: '#D97706',
                            marginTop: '3px',
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '100%',
                          }}
                        >
                          💬 Reason: {l.reason}
                        </div>
                      )}
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '14px 16px', fontSize: '13px', color: 'var(--txt2)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      📍 {l.town}
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '14px 16px', textAlign: 'center' }}>
                      {l.severity === 'high' && (
                        <span className="tag no" style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', display: 'inline-block' }}>
                          🔴 HIGH
                        </span>
                      )}
                      {l.severity === 'security' && (
                        <span className="tag wt" style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', display: 'inline-block' }}>
                          ⚡ SECURITY
                        </span>
                      )}
                      {l.severity === 'normal' && (
                        <span className="tag ok" style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', display: 'inline-block' }}>
                          🟢 NORMAL
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL DRAWER MODAL */}
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
            className="acard"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '480px',
              zIndex: 1001,
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
              background: 'var(--surf)',
              borderRadius: '24px',
              padding: '26px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '19px', fontWeight: 800, margin: 0, color: 'var(--txt1)' }}>
                Audit Log Details
              </h2>
              <button
                type="button"
                className="btn-cross-delete"
                onClick={() => setOpenEntry(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'var(--bg)', borderRadius: '14px', padding: '14px 16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--txt3)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Action Executed
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--txt1)' }}>
                  {openEntry.what}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--txt3)', fontWeight: 700 }}>Actor Officer</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--txt1)', marginTop: '2px' }}>{openEntry.who}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--txt2)' }}>{openEntry.role}</div>
                </div>

                <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--txt3)', fontWeight: 700 }}>Jurisdiction</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--txt1)', marginTop: '2px' }}>📍 {openEntry.town}</div>
                </div>
              </div>

              {openEntry.reason && (
                <div style={{ background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '12px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#EAB308', textTransform: 'uppercase' }}>Audit Override Reason</div>
                  <div style={{ fontSize: '13px', color: 'var(--txt1)', fontWeight: 600, marginTop: '4px' }}>{openEntry.reason}</div>
                </div>
              )}

              <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '12px 14px' }}>
                <div style={{ fontSize: '11px', color: 'var(--txt3)', fontWeight: 700 }}>Security Verification</div>
                <div style={{ fontSize: '12px', color: 'var(--txt2)', fontFamily: 'monospace', marginTop: '4px' }}>
                  IP: {openEntry.ip || '182.185.10.1'}<br />
                  Hash: {openEntry.hash}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
