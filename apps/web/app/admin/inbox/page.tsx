'use client';

import { useState } from 'react';
import Link from 'next/link';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { agoLabel } from '../../../lib/adminData';

interface Submission {
  name: string;
  org: string;
  kind: string;
  phone: string;
  city: string;
  minsAgo: number;
  detail: string;
}

// Ported from the prototype's S.submissions store (public-form arrivals). Design phase:
// in-memory sample data; wires to the API (form submissions) later.
const SUBMISSIONS: Submission[] = [];

const FILTERS = ['Everything', 'Volunteers', 'Partners', 'Organisations', 'Messages', 'Donations'] as const;

export default function AdminInbox() {
  const [filter, setFilter] = useState(0);
  const [open, setOpen] = useState<Submission | null>(null);
  const subs = SUBMISSIONS;

  return (
    <AdminShell view="inbox" title="Inbox" subtitle={`${subs.length} waiting`}>
      <div className="row" style={css('gap:8px;margin-bottom:18px')}>
        {FILTERS.map((f, i) => (
          <button key={f} className={`pill${i === filter ? ' on' : ''}`} onClick={() => setFilter(i)}>{f}</button>
        ))}
      </div>

      {subs.length ? (
        <div className="atbl">
          <table>
            <thead><tr><th>From</th><th>Kind</th><th>Town</th><th>When</th><th>Status</th></tr></thead>
            <tbody>
              {subs.map((s, i) => (
                <tr key={i} onClick={() => setOpen(s)}>
                  <td className="m2"><div className="nm">{s.name || s.org || 'No name given'}</div><div className="sm">{s.kind} · {s.phone || ''}</div></td>
                  <td className="m1">{s.kind}</td>
                  <td>{s.city || '-'}</td>
                  <td className="sm">{agoLabel(s.minsAgo)}</td>
                  <td className="m3"><span className="tag no">New</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="acard aempty">
          <h3>Nothing waiting</h3>
          <p style={css('margin-top:8px;max-width:46ch;margin-inline:auto')}>Every form on the public website lands here - volunteers, partner organisations, foundations, messages and donation receipts.</p>
          <p style={css('margin-top:14px')}><Link href="/join/volunteer"><b>Try it: fill in the volunteer form →</b></Link></p>
        </div>
      )}

      <p className="ahint">
        The old website had a public comment box that displayed &quot;sorry, no comments&quot;. Everything now arrives
        here instead, where somebody can be held responsible for answering it.
      </p>

      <SubmissionSheet submission={open} onClose={() => setOpen(null)} />
    </AdminShell>
  );
}

function SubmissionSheet({ submission: s, onClose }: { submission: Submission | null; onClose: () => void }) {
  const isOpen = s !== null;
  const rows: [string, string][] = s
    ? [
        ['Name', s.name || s.org || 'No name given'],
        ['Phone', s.phone],
        ['City', s.city],
        ['Detail', s.detail],
      ].filter(([, v]) => v) as [string, string][]
    : [];
  return (
    <>
      <div className={`sheetov${isOpen ? ' on' : ''}`} onClick={onClose} />
      <div className={`sheet${isOpen ? ' open' : ''}`}>
        {s && (
          <>
            <button className="cl" onClick={onClose}>✕</button>
            <span className="tag no">{s.kind}</span>
            <h2 style={css('margin:12px 0 4px')}>{s.name || s.org || 'No name given'}</h2>
            <div className="sm">Received {agoLabel(s.minsAgo)}</div>
            <div style={css('margin:22px 0')}>
              {rows.map(([k, v]) => (
                <div className="drow" key={k}><span>{k}</span><b>{v}</b></div>
              ))}
            </div>
            <div className="row" style={css('gap:9px')}>
              {s.phone ? (
                <>
                  <a className="btn btn-p" style={css('flex:1')} href={`tel:${s.phone.replace(/ /g, '')}`}>Call</a>
                  <a className="btn btn-o" href={`https://wa.me/92${s.phone.replace(/\D/g, '').replace(/^0/, '')}`} target="_blank" rel="noopener">WhatsApp</a>
                </>
              ) : null}
            </div>
            <button type="button" className="btn btn-d" style={css('width:100%;margin-top:12px')} onClick={() => showToast('Marking as answered wires to the API')}>Mark as answered</button>
          </>
        )}
      </div>
    </>
  );
}
