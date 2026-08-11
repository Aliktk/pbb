'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { fetchMessages, markMessageAnswered, type InboxMessage, type MessageKind } from '../../../lib/messages';

// Inbox - every public-website form lands here (the channel that replaced the old comment box).
// Backed by Supabase; RLS scopes it to the signed-in person's office.

const KIND_LABEL: Record<MessageKind, string> = {
  message: 'Message',
  volunteer: 'Volunteer',
  partner: 'Partner',
  organisation: 'Organisation',
  donor: 'Donor sign-up',
  donation: 'Donation',
};

const FILTERS: [string, MessageKind[] | null][] = [
  ['Everything', null],
  ['Volunteers', ['volunteer']],
  ['Partners', ['partner']],
  ['Organisations', ['organisation']],
  ['Messages', ['message']],
  ['Donor sign-ups', ['donor']],
];

function agoLabel(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins} min ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)} hr ago`;
  return `${Math.floor(mins / 1440)} d ago`;
}

export default function AdminInbox() {
  const [filter, setFilter] = useState(0);
  const [open, setOpen] = useState<InboxMessage | null>(null);
  const [rows, setRows] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    setError(null);
    try {
      setRows(await fetchMessages());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the inbox.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  const kinds = FILTERS[filter][1];
  const shown = kinds ? rows.filter((r) => kinds.includes(r.kind)) : rows;
  const waiting = rows.filter((r) => r.status === 'NEW').length;

  async function answer(m: InboxMessage) {
    try {
      await markMessageAnswered(m.id);
      showToast('Marked as answered');
      setOpen(null);
      reload();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not update');
    }
  }

  return (
    <AdminShell view="inbox" title="Inbox" subtitle={`${waiting} waiting`}>
      <div className="row" style={css('gap:8px;margin-bottom:18px')}>
        {FILTERS.map(([f], i) => (
          <button key={f} className={`pill${i === filter ? ' on' : ''}`} onClick={() => setFilter(i)}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div className="acard aempty"><h3>Loading the inbox…</h3></div>
      ) : error ? (
        <div className="tag no" style={css('display:block;padding:14px 16px;border-radius:12px')}>{error}</div>
      ) : shown.length ? (
        <div className="atbl">
          <table>
            <thead><tr><th>From</th><th>Kind</th><th>When</th><th>Status</th></tr></thead>
            <tbody>
              {shown.map((s) => (
                <tr key={s.id} onClick={() => setOpen(s)} style={css('cursor:pointer')}>
                  <td className="m2"><div className="nm">{s.name || s.org || 'No name given'}</div><div className="sm">{KIND_LABEL[s.kind]} · {s.phone || s.email || ''}</div></td>
                  <td className="m1">{KIND_LABEL[s.kind]}</td>
                  <td className="sm">{agoLabel(s.created_at)}</td>
                  <td className="m3">{s.status === 'NEW' ? <span className="tag no">New</span> : <span className="tag ok">Answered</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="acard aempty">
          <h3>Nothing waiting</h3>
          <p style={css('margin-top:8px;max-width:46ch;margin-inline:auto')}>Every form on the public website lands here - volunteers, partner organisations, foundations, messages and donor sign-ups.</p>
          <p style={css('margin-top:14px')}><Link href="/contact"><b>Try it: send a message from the contact page →</b></Link></p>
        </div>
      )}

      <p className="ahint">
        The old website had a public comment box that displayed &quot;sorry, no comments&quot;. Everything now arrives
        here instead, where somebody can be held responsible for answering it.
      </p>

      <MessageSheet message={open} onClose={() => setOpen(null)} onAnswer={answer} />
    </AdminShell>
  );
}

function MessageSheet({ message: s, onClose, onAnswer }: { message: InboxMessage | null; onClose: () => void; onAnswer: (m: InboxMessage) => void }) {
  const isOpen = s !== null;
  const rows: [string, string][] = s
    ? ([
        ['Name', s.name || s.org || 'No name given'],
        ['Phone', s.phone ?? ''],
        ['Email', s.email ?? ''],
        ['Detail', s.detail ?? ''],
      ].filter(([, v]) => v) as [string, string][])
    : [];
  return (
    <>
      <div className={`sheetov${isOpen ? ' on' : ''}`} onClick={onClose} />
      <div className={`sheet${isOpen ? ' open' : ''}`}>
        {s && (
          <>
            <button className="cl" onClick={onClose}>✕</button>
            <span className={`tag ${s.status === 'NEW' ? 'no' : 'ok'}`}>{KIND_LABEL[s.kind]}</span>
            <h2 style={css('margin:12px 0 4px')}>{s.name || s.org || 'No name given'}</h2>
            <div className="sm">Received {agoLabel(s.created_at)}</div>
            <div style={css('margin:22px 0')}>
              {rows.map(([k, v]) => (
                <div className="drow" key={k}><span>{k}</span><b>{v}</b></div>
              ))}
            </div>
            {s.phone ? <a className="btn btn-p" style={css('width:100%')} href={`tel:${s.phone.replace(/ /g, '')}`}>Call {s.name || 'them'}</a> : null}
            {s.status === 'NEW' ? <button type="button" className="btn btn-d" style={css('width:100%;margin-top:10px')} onClick={() => onAnswer(s)}>Mark as answered</button> : null}
          </>
        )}
      </div>
    </>
  );
}
