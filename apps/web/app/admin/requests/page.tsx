'use client';

import { useCallback, useEffect, useState } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { fetchAdminRequests, updateRequestStatus, countDonors } from '../../../lib/requests';
import type { AdminRequestRow } from '../../../lib/apiTypes';

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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await fetchAdminRequests());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    countDonors().then(setDonorCount).catch(() => setDonorCount(null));
  }, [load]);

  const openCount = rows.filter((r) => r.status === 'OPEN').length;
  const arrangedCount = rows.filter((r) => r.status === 'ARRANGED').length;

  async function markArranged(row: AdminRequestRow) {
    try {
      const updated = await updateRequestStatus(row.id, 'ARRANGED');
      setRows((cur) => cur.map((r) => (r.id === updated.id ? updated : r)));
      setOpen(updated);
      showToast('Marked as arranged.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not update the request.');
    }
  }

  const actions = (
    <>
      <span style={css('margin-left:auto')} />
      <button type="button" className="btn btn-o btn-s" onClick={load}>Refresh</button>
    </>
  );

  return (
    <AdminShell view="requests" title="Blood requests" subtitle={`${openCount} open`} actions={actions}>
      <div className="akpi">
        <div className="c"><div className="l">Open now</div><div className="n r">{openCount}</div></div>
        <div className="c"><div className="l">Arranged</div><div className="n">{arrangedCount}</div></div>
        <div className="c"><div className="l">Total shown</div><div className="n">{rows.length}</div></div>
        <div className="c"><div className="l">Donors on register</div><div className="n">{donorCount ?? '-'}</div></div>
      </div>

      {error ? (
        <div className="acard aempty">
          <h3>Could not load requests</h3>
          <p style={css('margin-top:8px')}>{error}</p>
          <button type="button" className="btn btn-o" style={css('margin-top:14px')} onClick={load}>Try again</button>
        </div>
      ) : loading ? (
        <div className="acard aempty"><h3>Loading requests</h3></div>
      ) : (
        <div className="atbl">
          <table>
            <thead><tr><th>Patient / hospital</th><th>Group</th><th>Units</th><th>Town</th><th>Asked</th><th>Status</th></tr></thead>
            <tbody>
              {rows.length ? (
                rows.map((r) => (
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
                <tr><td colSpan={6} className="aempty">No requests yet. <b>Submit one on the website and refresh.</b></td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="ahint">
        A list, not a board. Requests submitted on the public website land here the moment they arrive.
      </p>

      <RequestSheet request={open} onClose={() => setOpen(null)} onArrange={markArranged} />
    </AdminShell>
  );
}

function RequestSheet({
  request: r,
  onClose,
  onArrange,
}: {
  request: AdminRequestRow | null;
  onClose: () => void;
  onArrange: (r: AdminRequestRow) => void;
}) {
  const isOpen = r !== null;
  return (
    <>
      <div className={`sheetov${isOpen ? ' on' : ''}`} onClick={onClose} />
      <div className={`sheet${isOpen ? ' open' : ''}`}>
        {r && (
          <>
            <button className="cl" onClick={onClose}>✕</button>
            <span className={`tag ${r.status === 'OPEN' ? 'no' : 'ok'}`}>{r.status === 'OPEN' ? 'Open' : r.status === 'ARRANGED' ? 'Arranged' : r.status}</span>
            <h2 style={css('margin:12px 0 4px')}>{bgTag(r.group)} <span style={css('margin-left:8px')}>{r.unitsNeeded} {r.unitsNeeded === 1 ? 'unit' : 'units'}</span></h2>
            <div className="mono2" style={css('color:var(--mid)')}>{r.reference} · asked {agoLabel(r.createdAt)}{r.source === 'PUBLIC_FORM' ? ' · from the website' : ''}</div>
            <div style={css('margin:22px 0')}>
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
            {r.status === 'OPEN' && <button type="button" className="btn btn-d" style={css('width:100%;margin-top:12px')} onClick={() => onArrange(r)}>Mark arranged</button>}
          </>
        )}
      </div>
    </>
  );
}
