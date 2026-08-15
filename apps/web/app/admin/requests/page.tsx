'use client';

import { useCallback, useEffect, useState } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { api, ApiError } from '../../../lib/api';
import type { Paged, AdminRequestRow } from '../../../lib/apiTypes';

function bgTag(g: string) {
  return <span className={`abg${g.includes('−') ? ' r' : ''}`}>{g}</span>;
}

function agoLabel(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins} min ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)} hr ago`;
  return `${Math.floor(mins / 1440)} d ago`;
}

const URGENCY: Record<string, string> = {
  ROUTINE: 'Routine',
  URGENT: 'Urgent',
  CRITICAL: 'Critical',
};

export default function AdminRequests() {
  const [rows, setRows] = useState<AdminRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<AdminRequestRow | null>(null);
  const [donorCount, setDonorCount] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'ARRANGED' | 'CRITICAL'>('ALL');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Paged<AdminRequestRow>>('/requests?pageSize=100');
      setRows(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load requests. Is the API running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    api.get<Paged<unknown>>('/donors?pageSize=1').then((r) => setDonorCount(r.meta.total)).catch(() => setDonorCount(null));
  }, [load]);

  const openCount = rows.filter((r) => r.status === 'OPEN').length;
  const arrangedCount = rows.filter((r) => r.status === 'ARRANGED').length;

  async function changeStatus(row: AdminRequestRow, newStatus: 'ARRANGED' | 'OPEN' | 'FULFILLED') {
    try {
      const updated = await api.patch<AdminRequestRow>(`/requests/${row.id}/status`, { status: newStatus });
      setRows((cur) => cur.map((r) => (r.id === updated.id ? updated : r)));
      setOpen(updated);
      showToast(`Request marked as ${newStatus.toLowerCase()}.`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not update the request.');
    }
  }

  const filteredRows = rows.filter((r) => {
    if (statusFilter === 'OPEN' && r.status !== 'OPEN') return false;
    if (statusFilter === 'ARRANGED' && r.status !== 'ARRANGED') return false;
    if (statusFilter === 'CRITICAL' && r.urgency !== 'CRITICAL') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.reference.toLowerCase().includes(q) ||
        r.hospital.toLowerCase().includes(q) ||
        r.town.toLowerCase().includes(q) ||
        (r.patientName && r.patientName.toLowerCase().includes(q)) ||
        (r.requesterName && r.requesterName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const actions = (
    <button type="button" className="btn btn-o btn-s" onClick={load} disabled={loading}>
      {loading ? 'Refreshing...' : 'Refresh'}
    </button>
  );

  return (
    <AdminShell view="requests" title="Blood requests" subtitle={`${openCount} open`} actions={actions}>
      <div className="akpi">
        <div className="c"><div className="l">Open now</div><div className="n r">{openCount}</div></div>
        <div className="c"><div className="l">Arranged</div><div className="n">{arrangedCount}</div></div>
        <div className="c"><div className="l">Total shown</div><div className="n">{rows.length}</div></div>
        <div className="c"><div className="l">Donors on register</div><div className="n">{donorCount ?? '-'}</div></div>
      </div>

      <div className="afilters">
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            type="button"
            className={`btn btn-s ${statusFilter === 'ALL' ? 'btn-p' : 'btn-o'}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All ({rows.length})
          </button>
          <button
            type="button"
            className={`btn btn-s ${statusFilter === 'OPEN' ? 'btn-p' : 'btn-o'}`}
            onClick={() => setStatusFilter('OPEN')}
          >
            Open ({openCount})
          </button>
          <button
            type="button"
            className={`btn btn-s ${statusFilter === 'ARRANGED' ? 'btn-p' : 'btn-o'}`}
            onClick={() => setStatusFilter('ARRANGED')}
          >
            Arranged ({arrangedCount})
          </button>
          <button
            type="button"
            className={`btn btn-s ${statusFilter === 'CRITICAL' ? 'btn-p' : 'btn-o'}`}
            onClick={() => setStatusFilter('CRITICAL')}
          >
            Critical
          </button>
        </div>
        <input
          type="text"
          className="fld"
          style={{ maxWidth: '260px', marginLeft: 'auto', padding: '6px 12px', fontSize: '13.5px' }}
          placeholder="Search requests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error ? (
        <div className="acard aempty">
          <h3>Could not load requests</h3>
          <p style={css('margin-top:8px')}>{error}</p>
          <button type="button" className="btn btn-o" style={css('margin-top:14px')} onClick={load}>Try again</button>
        </div>
      ) : loading ? (
        <div className="acard aempty"><h3>Loading requests...</h3></div>
      ) : (
        <div className="atbl">
          <table>
            <thead><tr><th>Patient / hospital</th><th>Group</th><th>Units</th><th>Town</th><th>Asked</th><th>Status</th></tr></thead>
            <tbody>
              {filteredRows.length ? (
                filteredRows.map((r) => (
                  <tr key={r.id} onClick={() => setOpen(r)}>
                    <td className="m2"><div className="nm">{r.hospital}</div><div className="sm">{r.patientName || 'Patient name not given'} · {r.reference}{r.source === 'PUBLIC_FORM' ? ' · from the website' : ''}</div></td>
                    <td className="m1">{bgTag(r.group)}</td>
                    <td>{r.unitsNeeded}</td>
                    <td>{r.town}</td>
                    <td className="sm">{agoLabel(r.createdAt)}</td>
                    <td className="m3">{r.status === 'OPEN' ? <span className="tag no">Open</span> : r.status === 'ARRANGED' ? <span className="tag ok">Arranged</span> : <span className="tag gy">{r.status}</span>}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="aempty">No matching requests found. <b>Submit one on the website or clear filters.</b></td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="ahint">
        A list, not a board. Requests submitted on the public website land here the moment they arrive.
      </p>

      <RequestSheet request={open} onClose={() => setOpen(null)} onStatusChange={changeStatus} />
    </AdminShell>
  );
}

function RequestSheet({
  request: r,
  onClose,
  onStatusChange,
}: {
  request: AdminRequestRow | null;
  onClose: () => void;
  onStatusChange: (r: AdminRequestRow, status: 'ARRANGED' | 'OPEN' | 'FULFILLED') => void;
}) {
  const isOpen = r !== null;
  return (
    <>
      <div className={`sheetov${isOpen ? ' on' : ''}`} onClick={onClose} />
      <div className={`sheet${isOpen ? ' open' : ''}`}>
        {r && (
          <>
            <div className="sheet-header">
              <div className="sheet-top-row">
                <span className={`tag ${r.status === 'OPEN' ? 'no' : r.status === 'ARRANGED' ? 'ok' : 'gy'}`}>
                  {r.status === 'OPEN' ? 'Open' : r.status === 'ARRANGED' ? 'Arranged' : r.status}
                </span>
                <button className="cl" onClick={onClose} aria-label="Close detail panel">✕</button>
              </div>
              <div className="sheet-headline">
                <h2>
                  {bgTag(r.group)} <span style={{ marginLeft: '6px', fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>{r.unitsNeeded} {r.unitsNeeded === 1 ? 'unit' : 'units'}</span>
                </h2>
              </div>
              <div className="sheet-meta">
                {r.reference} · asked {agoLabel(r.createdAt)}{r.source === 'PUBLIC_FORM' ? ' · from the website' : ''}
              </div>
            </div>

            <div style={css('margin:18px 0')}>
              <div className="drow"><span>Patient</span><b>{r.patientName || 'Not given'}</b></div>
              <div className="drow"><span>Hospital</span><b>{r.hospital}</b></div>
              <div className="drow"><span>Town</span><b>{r.town}</b></div>
              <div className="drow"><span>Urgency</span><b>{URGENCY[r.urgency] ?? r.urgency}</b></div>
              <div className="fsec" style={css('margin:20px 0 10px')}><span>The attendant</span></div>
              <div className="drow"><span>Name / relationship</span><b>{r.requesterName}{r.requesterRelationship ? ` · ${r.requesterRelationship}` : ''}</b></div>
              <div className="drow"><span>Phone</span><b>{r.requesterPhone}</b></div>
              {r.caseNotes ? <div className="drow"><span>Notes</span><b>{r.caseNotes}</b></div> : null}
            </div>

            <div className="row" style={css('gap:9px')}>
              <a className="btn btn-p" style={css('flex:1')} href={`tel:${r.requesterPhone.replace(/ /g, '')}`}>Call {r.requesterName || 'requester'}</a>
              <a className="btn btn-o" href="/admin/find">Find a donor</a>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {r.status === 'OPEN' && (
                <button type="button" className="btn btn-d" style={{ width: '100%' }} onClick={() => onStatusChange(r, 'ARRANGED')}>
                  Mark arranged
                </button>
              )}
              {r.status === 'ARRANGED' && (
                <>
                  <button type="button" className="btn btn-p" style={{ width: '100%', background: '#16a34a', borderColor: '#16a34a' }} onClick={() => onStatusChange(r, 'FULFILLED')}>
                    Mark fulfilled
                  </button>
                  <button type="button" className="btn btn-o" style={{ width: '100%' }} onClick={() => onStatusChange(r, 'OPEN')}>
                    Re-open request
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
