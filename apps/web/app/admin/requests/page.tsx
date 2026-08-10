'use client';

import { useState } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { REQUESTS, DONORS, DONATIONS_TODAY, agoLabel, type AdminRequest } from '../../../lib/adminData';

function bgTag(g: string) {
  return <span className={`abg${g.includes('−') ? ' r' : ''}`}>{g}</span>;
}

export default function AdminRequests() {
  const [open, setOpen] = useState<AdminRequest | null>(null);
  const list = REQUESTS;
  const openCount = list.filter((r) => r.st === 'open').length;

  const actions = (
    <>
      <span style={css('margin-left:auto')} />
      <button type="button" className="btn btn-p btn-s" onClick={() => showToast('New request wires to POST /requests')}>+ New request</button>
    </>
  );

  return (
    <AdminShell view="requests" title="Blood requests" subtitle={`${openCount} open`} actions={actions}>
      <div className="akpi">
        <div className="c"><div className="l">Open now</div><div className="n r">{openCount}</div></div>
        <div className="c"><div className="l">Arranged</div><div className="n">{list.filter((r) => r.st === 'done').length}</div></div>
        <div className="c"><div className="l">Donors on register</div><div className="n">{DONORS.length}</div></div>
        <div className="c"><div className="l">Recorded today</div><div className="n">{DONATIONS_TODAY.length}</div></div>
      </div>

      <div className="atbl">
        <table>
          <thead><tr><th>Patient / hospital</th><th>Group</th><th>Units</th><th>Town</th><th>Asked</th><th>Status</th></tr></thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} onClick={() => setOpen(r)}>
                <td className="m2"><div className="nm">{r.hosp}</div><div className="sm">{r.pt || 'Patient name not given'} · {r.id}{r.src === 'web' ? ' · from the website' : ''}</div></td>
                <td className="m1">{bgTag(r.g)}</td>
                <td>{r.u}</td>
                <td>{r.c}</td>
                <td className="sm">{agoLabel(r.minsAgo)}</td>
                <td className="m3">{r.st === 'open' ? <span className="tag no">Open</span> : <span className="tag ok">Arranged</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="ahint">
        A list, not a board. Requests sent from the public website land here the moment they are submitted —
        <b> try it: submit one on the site and come back.</b>
      </p>

      <RequestSheet request={open} onClose={() => setOpen(null)} />
    </AdminShell>
  );
}

function RequestSheet({ request: r, onClose }: { request: AdminRequest | null; onClose: () => void }) {
  const isOpen = r !== null;
  return (
    <>
      <div className={`sheetov${isOpen ? ' on' : ''}`} onClick={onClose} />
      <div className={`sheet${isOpen ? ' open' : ''}`}>
        {r && (
          <>
            <button className="cl" onClick={onClose}>✕</button>
            <span className={`tag ${r.st === 'open' ? 'no' : 'ok'}`}>{r.st === 'open' ? 'Open' : 'Arranged'}</span>
            <h2 style={css('margin:12px 0 4px')}>{bgTag(r.g)} <span style={css('margin-left:8px')}>{r.u} {r.u === 1 ? 'unit' : 'units'}</span></h2>
            <div className="mono2" style={css('color:var(--mid)')}>{r.id} · asked {agoLabel(r.minsAgo)}{r.src === 'web' ? ' · from the website' : ''}</div>
            <div style={css('margin:22px 0')}>
              <div className="drow"><span>Patient</span><b>{r.pt}</b></div>
              <div className="drow"><span>Hospital</span><b>{r.hosp}</b></div>
              <div className="drow"><span>Town</span><b>{r.c}</b></div>
              <div className="drow"><span>Urgency</span><b>{r.urg}</b></div>
              <div className="fsec" style={css('margin:20px 0 10px')}><span>The attendant</span></div>
              <div className="drow"><span>Name / relationship</span><b>{r.by}</b></div>
              <div className="drow"><span>Phone</span><b>{r.ph}</b></div>
            </div>
            <div className="row" style={css('gap:9px')}>
              <a className="btn btn-p" style={css('flex:1')} href={`tel:${r.ph.replace(/ /g, '')}`}>Call {r.by || 'requester'}</a>
              <a className="btn btn-o" href="/admin/find">Find a donor</a>
            </div>
            {r.st === 'open' && <button type="button" className="btn btn-d" style={css('width:100%;margin-top:12px')} onClick={() => showToast('Marking arranged wires to the API')}>Mark arranged</button>}
          </>
        )}
      </div>
    </>
  );
}
