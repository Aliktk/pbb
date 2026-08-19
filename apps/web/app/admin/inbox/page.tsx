'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { fetchMessages, markMessageAnswered, type InboxMessage } from '../../../lib/messages';

export interface Submission {
  id: string;
  name: string;
  org: string;
  kind: 'Volunteer' | 'Partner' | 'Organisation' | 'Message' | 'Donation';
  phone: string;
  email?: string;
  city: string;
  createdAt: string;
  detail: string;
  status: 'NEW' | 'ANSWERED' | 'IN_PROGRESS';
}

function agoLabel(isoOrMins: string | number): string {
  const date = typeof isoOrMins === 'number' ? Date.now() - isoOrMins * 60000 : new Date(isoOrMins).getTime();
  const mins = Math.max(0, Math.round((Date.now() - date) / 60000));
  if (mins < 60) return `${mins} min ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)} hr ago`;
  return `${Math.floor(mins / 1440)} d ago`;
}

// Map a Supabase inbox row (contact_messages) to the shape this screen renders.
const KIND_MAP: Record<string, Submission['kind']> = {
  volunteer: 'Volunteer', partner: 'Partner', organisation: 'Organisation',
  message: 'Message', donation: 'Donation', donor: 'Message',
};

function toSubmission(m: InboxMessage): Submission {
  return {
    id: m.id,
    name: m.name || 'Web Submitter',
    org: m.org || '',
    kind: KIND_MAP[m.kind] ?? 'Message',
    phone: m.phone || '',
    email: m.email || undefined,
    city: '',
    createdAt: m.created_at,
    detail: m.detail || '',
    status: m.status === 'ANSWERED' ? 'ANSWERED' : 'NEW',
  };
}

const CATEGORIES = ['Everything', 'Volunteers', 'Partners', 'Organisations', 'Messages', 'Donations'] as const;

function categoryBadge(kind: string) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    Volunteer: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
    Partner: { bg: '#F3E8FF', color: '#7E22CE', border: '#E9D5FF' },
    Organisation: { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
    Message: { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' },
    Donation: { bg: '#FFE4E6', color: '#BE123C', border: '#FECDD3' },
  };
  const s = styles[kind] || { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: '8px',
        fontSize: '12.5px',
        fontWeight: 700,
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {kind}
    </span>
  );
}

export default function AdminInbox() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Everything');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<Submission | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchMessages();
      setSubmissions(rows.map(toSubmission));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the inbox.');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markAnswered(sub: Submission) {
    try {
      await markMessageAnswered(sub.id);
    } catch {
      // best effort; still reflect it in the UI
    }
    setSubmissions((cur) =>
      cur.map((item) => (item.id === sub.id ? { ...item, status: 'ANSWERED' } : item)),
    );
    setOpen((cur) => (cur?.id === sub.id ? { ...cur, status: 'ANSWERED' } : cur));
    showToast(`Marked submission from ${sub.name || sub.org} as answered.`);
  }

  const newCount = submissions.filter((s) => s.status === 'NEW').length;
  const answeredCount = submissions.filter((s) => s.status === 'ANSWERED').length;
  const volunteerCount = submissions.filter((s) => s.kind === 'Volunteer').length;
  const partnerCount = submissions.filter((s) => s.kind === 'Partner' || s.kind === 'Organisation').length;

  const filteredSubmissions = submissions.filter((s) => {
    if (activeCategory === 'Volunteers' && s.kind !== 'Volunteer') return false;
    if (activeCategory === 'Partners' && s.kind !== 'Partner') return false;
    if (activeCategory === 'Organisations' && s.kind !== 'Organisation') return false;
    if (activeCategory === 'Messages' && s.kind !== 'Message') return false;
    if (activeCategory === 'Donations' && s.kind !== 'Donation') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.org.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.detail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const actions = (
    <button type="button" className="btn btn-o btn-s" onClick={load} disabled={loading}>
      {loading ? 'Refreshing...' : 'Refresh Inbox'}
    </button>
  );

  return (
    <AdminShell view="inbox" title="Inbox" subtitle={`${newCount} pending response`} actions={actions}>
      {/* Top KPI Stat Cards */}
      <div className="akpi">
        <div className="c">
          <div className="l">Pending Response</div>
          <div className="n r">{newCount}</div>
        </div>
        <div className="c">
          <div className="l">Answered & Closed</div>
          <div className="n" style={{ color: '#16A34A' }}>{answeredCount}</div>
        </div>
        <div className="c">
          <div className="l">Volunteer Applications</div>
          <div className="n">{volunteerCount}</div>
        </div>
        <div className="c">
          <div className="l">Partner Inquiries</div>
          <div className="n">{partnerCount}</div>
        </div>
      </div>

      {/* Category Filter Pills & Search Input Aligned */}
      <div className="afilters" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`btn btn-s ${activeCategory === cat ? 'btn-p' : 'btn-o'}`}
              style={{ borderRadius: '99px', padding: '6px 14px', fontSize: '13px' }}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div style={{ minWidth: '240px', flex: '0 1 280px' }}>
          <input
            type="text"
            className="fld"
            style={{ width: '100%', height: '38px', padding: '0 14px', fontSize: '13.5px', borderRadius: '12px' }}
            placeholder="Search inbox submissions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Submissions Table / Empty State */}
      {filteredSubmissions.length ? (
        <div className="atbl">
          <table>
            <thead>
              <tr>
                <th>From / Submitter</th>
                <th>Category</th>
                <th>Town / City</th>
                <th>Received</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((s) => (
                <tr key={s.id} onClick={() => setOpen(s)}>
                  <td className="m2">
                    <div className="nm">{s.name || s.org || 'No name given'}</div>
                    <div className="sm">
                      {s.org ? `${s.org} · ` : ''}{s.phone || 'No phone'}
                    </div>
                  </td>
                  <td className="m1">
                    {categoryBadge(s.kind)}
                  </td>
                  <td>{s.city || '-'}</td>
                  <td className="sm">{agoLabel(s.createdAt)}</td>
                  <td className="m3">
                    {s.status === 'NEW' ? (
                      <span className="tag no">New</span>
                    ) : (
                      <span className="tag ok">Answered</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="acard aempty">
          <h3>No submissions in inbox</h3>
          <p style={css('margin-top:8px;max-width:46ch;margin-inline:auto')}>
            Every message submitted from the website arrives here directly in real time.
          </p>
        </div>
      )}

      <p className="ahint">
        All public form messages land directly in this inbox for administrator review and response.
      </p>

      {/* Side Drawer Detail Sheet */}
      <SubmissionSheet
        submission={open}
        onClose={() => setOpen(null)}
        onMarkAnswered={markAnswered}
      />
    </AdminShell>
  );
}

function SubmissionSheet({
  submission: s,
  onClose,
  onMarkAnswered,
}: {
  submission: Submission | null;
  onClose: () => void;
  onMarkAnswered: (s: Submission) => void;
}) {
  const isOpen = s !== null;
  return (
    <>
      <div className={`sheetov${isOpen ? ' on' : ''}`} onClick={onClose} />
      <div className={`sheet${isOpen ? ' open' : ''}`}>
        {s && (
          <>
            <div className="sheet-header">
              <div className="sheet-top-row">
                <span className={`tag ${s.status === 'NEW' ? 'no' : 'ok'}`}>
                  {s.status === 'NEW' ? 'New Submission' : 'Answered'}
                </span>
                <button className="cl" onClick={onClose} aria-label="Close detail panel">✕</button>
              </div>
              <div className="sheet-headline">
                <h2>
                  <span className="tag gy" style={{ fontSize: '13px', padding: '4px 8px' }}>{s.kind}</span>
                  <span>{s.name || s.org || 'No name given'}</span>
                </h2>
              </div>
              <div className="sheet-meta">
                {s.id} · Received {agoLabel(s.createdAt)}{s.city ? ` · ${s.city}` : ''}
              </div>
            </div>

            <div style={css('margin:18px 0')}>
              <div className="drow"><span>Submitter Name</span><b>{s.name || 'Not provided'}</b></div>
              {s.org ? <div className="drow"><span>Organisation</span><b>{s.org}</b></div> : null}
              <div className="drow"><span>Phone Number</span><b>{s.phone || 'None'}</b></div>
              {s.email ? <div className="drow"><span>Email</span><b className="mono2">{s.email}</b></div> : null}
              <div className="drow"><span>Town / City</span><b>{s.city || 'Not specified'}</b></div>
              <div className="drow"><span>Category</span><b>{s.kind}</b></div>
            </div>

            <div style={{ margin: '18px 0', padding: '14px', background: '#FAF8F7', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--mid)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Submission Detail / Message
              </div>
              <div style={{ fontSize: '14.5px', color: 'var(--ink)', lineHeight: '1.6' }}>
                {s.detail}
              </div>
            </div>

            <div className="row" style={css('gap:9px')}>
              {s.phone ? (
                <>
                  <a className="btn btn-p" style={css('flex:1')} href={`tel:${s.phone.replace(/ /g, '')}`}>
                    Call {s.name.split(' ')[0] || 'Submitter'}
                  </a>
                  <a
                    className="btn btn-o"
                    href={`https://wa.me/92${s.phone.replace(/\D/g, '').replace(/^0/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </a>
                </>
              ) : null}
            </div>

            {s.status === 'NEW' && (
              <button
                type="button"
                className="btn btn-d"
                style={{ width: '100%', marginTop: '12px' }}
                onClick={() => onMarkAnswered(s)}
              >
                Mark as Answered
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}
