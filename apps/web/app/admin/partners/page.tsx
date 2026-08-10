'use client';

import { useState } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';

interface Partner {
  n: string;
  k: string;
  c: string;
  st: 'active' | 'pending';
  since: string;
  note: string;
}

const PARTNERS: Partner[] = [
  { n: 'Civil Hospital, Quetta', k: 'Hospital', c: 'Quetta', st: 'active', since: '2004', note: 'Highest referrer. Named coordinator assigned.' },
  { n: 'Bolan Medical Complex', k: 'Hospital', c: 'Quetta', st: 'active', since: '2007', note: '' },
  { n: 'DHQ Hospital, Zhob', k: 'Hospital', c: 'Zhob', st: 'active', since: '2011', note: '' },
  { n: 'Quetta Diagnostic Laboratory', k: 'Laboratory', c: 'Quetta', st: 'pending', since: '-', note: 'Offering overflow screening capacity. Awaiting committee.' },
  { n: 'Al-Khidmat Welfare Society', k: 'Welfare society', c: 'Loralai', st: 'active', since: '2015', note: 'Runs the Eid hide collection in Loralai.' },
  { n: 'Balochistan University', k: 'University', c: 'Quetta', st: 'active', since: '2019', note: 'Two campus drives a year.' },
  { n: 'Sherani Welfare Trust', k: 'Welfare society', c: 'Sherani', st: 'pending', since: '-', note: 'Asking for a branch in a town we serve without an office.' },
  { n: 'Rahmat Foundation', k: 'Foundation', c: '-', st: 'pending', since: '-', note: 'Offering to fund screening kits for one year.' },
];

export default function AdminPartners() {
  const [open, setOpen] = useState<Partner | null>(null);
  const l = PARTNERS;
  const pend = l.filter((p) => p.st === 'pending');

  const actions = (
    <>
      <span style={css('margin-left:auto')} />
      {/* head-office-only in production */}
      <button type="button" className="btn btn-p btn-s" onClick={() => showToast('Adding an organisation wires to the API')}>+ Add organisation</button>
    </>
  );

  return (
    <AdminShell view="partners" title="Partners & organisations" subtitle={`${l.length} on the books`} actions={actions}>
      {pend.length ? (
        <div className="alert">
          <div>
            <b>{pend.length} {pend.length === 1 ? 'organisation is' : 'organisations are'} waiting for a decision.</b> Each one has to be approved by the organising committee.
          </div>
        </div>
      ) : null}

      <div className="akpi">
        <div className="c"><div className="l">Active partners</div><div className="n">{l.filter((p) => p.st === 'active').length}</div></div>
        <div className="c"><div className="l">Awaiting approval</div><div className="n r">{pend.length}</div></div>
        <div className="c"><div className="l">Hospitals</div><div className="n">{l.filter((p) => p.k === 'Hospital').length}</div></div>
        <div className="c"><div className="l">Laboratories</div><div className="n">{l.filter((p) => p.k === 'Laboratory').length}</div></div>
      </div>

      <div className="atbl">
        <table>
          <thead><tr><th>Organisation</th><th>Kind</th><th>Town</th><th>Partner since</th><th>Status</th></tr></thead>
          <tbody>
            {l.map((p) => (
              <tr key={p.n} onClick={() => setOpen(p)}>
                <td className="m2"><div className="nm">{p.n}</div><div className="sm">{p.k} · {p.c}{p.note ? ' · ' + p.note : ''}</div></td>
                <td className="m1">{p.k}</td>
                <td>{p.c}</td>
                <td className="sm">{p.since}</td>
                <td className="m3">{p.st === 'active' ? <span className="tag ok">Active</span> : <span className="tag no">Waiting</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="ahint">
        Hospitals, laboratories, foundations, welfare societies, universities and other blood banks all live here.
        An approved partner gets a named coordinator, a direct line, and their logo on the public supporters page.
      </p>

      <PartnerSheet partner={open} onClose={() => setOpen(null)} />
    </AdminShell>
  );
}

function PartnerSheet({ partner: p, onClose }: { partner: Partner | null; onClose: () => void }) {
  const isOpen = p !== null;
  const rows: [string, string][] = p
    ? [
        ['Kind', p.k],
        ['Town', p.c],
        ['Partner since', p.since],
        ['Coordinator', p.st === 'active' ? 'Assigned' : 'Not yet'],
        ['Logo on the website', p.st === 'active' ? 'Yes' : 'No'],
      ]
    : [];
  return (
    <>
      <div className={`sheetov${isOpen ? ' on' : ''}`} onClick={onClose} />
      <div className={`sheet${isOpen ? ' open' : ''}`}>
        {p && (
          <>
            <button className="cl" onClick={onClose}>✕</button>
            <span className={`tag ${p.st === 'active' ? 'ok' : 'no'}`}>{p.st === 'active' ? 'Active partner' : 'Waiting for a decision'}</span>
            <h2 style={css('margin:12px 0 4px')}>{p.n}</h2>
            <div className="sm">{p.k} · {p.c}</div>
            <div style={css('margin:22px 0')}>
              {rows.map(([k, v]) => (
                <div className="drow" key={k}><span>{k}</span><b>{v}</b></div>
              ))}
            </div>
            {p.note ? <div className="ahint" style={css('margin:0 0 18px')}>{p.note}</div> : null}
            {p.st === 'pending' ? (
              <div className="row" style={css('gap:9px')}>
                <button type="button" className="btn btn-p" style={css('flex:1')} onClick={() => showToast('Approving an organisation wires to the API')}>Approve</button>
                <button type="button" className="btn btn-o" onClick={() => showToast('Declining an organisation wires to the API')}>Decline</button>
              </div>
            ) : (
              <div className="row" style={css('gap:9px')}>
                <button type="button" className="btn btn-o" style={css('flex:1')} onClick={() => showToast('Editing an organisation wires to the API')}>Edit details</button>
                <button type="button" className="btn btn-o" onClick={() => showToast('Ending a partnership wires to the API')}>End partnership</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
