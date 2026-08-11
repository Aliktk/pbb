'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { css } from '../../../lib/style';
import { fetchPublicNeeds } from '../../../lib/requests';
import type { PublicRequestRow } from '../../../lib/apiTypes';

// Who needs blood now, from GET /requests/public. Privacy is CRITICAL: the public projection
// carries NO patient names and NO phone numbers (INV-11) - a blood group, a town and an hour is
// all a donor needs.

const FILTERS: string[] = ['All', 'O−', 'O+', 'A−', 'A+', 'B−', 'B+', 'AB−', 'AB+'];

const URGENCY_LABEL: Record<string, string> = { CRITICAL: 'Critical', URGENT: 'Urgent', ROUTINE: 'Planned' };
const URGENCY_TAG: Record<string, string> = { CRITICAL: 'no', URGENT: 'wt', ROUTINE: 'gy' };

function agoLabel(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  if (mins < 1440) { const h = Math.floor(mins / 60); return `${h} hour${h === 1 ? '' : 's'} ago`; }
  const d = Math.floor(mins / 1440);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}

export default function Needs() {
  const [rows, setRows] = useState<PublicRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [group, setGroup] = useState('All');

  useEffect(() => {
    let alive = true;
    fetchPublicNeeds()
      .then((rows) => alive && setRows(rows))
      .catch(() => alive && setError('Could not load the board just now. Please try again shortly.'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const shown = group === 'All' ? rows : rows.filter((n) => n.group === group);

  return (
    <>
      <header className="ph-hero">
        <div className="wrap">
          <span className="eyebrow"><b />Right now</span>
          <h1>Who needs blood today</h1>
          <p className="lead" style={css('margin-top:18px;max-width:62ch')}>
            Every open request across the fourteen towns. No names - a blood group, a town and an
            hour is all a donor needs to decide.
          </p>
        </div>
      </header>
      <section className="blk" style={css('padding-top:0')}>
        <div className="wrap">
          <div className="row" style={css('gap:8px;margin-bottom:24px;flex-wrap:wrap')}>
            {FILTERS.map((g) => {
              const count = g === 'All' ? rows.length : rows.filter((n) => n.group === g).length;
              return (
                <button key={g} className={`pill${g === group ? ' on' : ''}`} onClick={() => setGroup(g)}>
                  {g === 'All' ? 'All groups' : g}{count ? <> <b style={css('font-variant-numeric:tabular-nums')}>{count}</b></> : null}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="card" style={css('text-align:center;padding:52px 26px')}><h3>Loading the board</h3></div>
          ) : error ? (
            <div className="card" style={css('text-align:center;padding:52px 26px')}>
              <h3>{error}</h3>
              <p className="sm" style={css('margin-top:8px')}>In an emergency, phone the head office in Quetta on <b>081-2836820</b>.</p>
            </div>
          ) : shown.length ? (
            <div className="g2" style={css('gap:16px')}>
              {shown.map((n) => (
                <div key={n.reference} className={`card needcard ${n.urgency === 'CRITICAL' ? 'crit' : ''}`}>
                  <div className="row" style={css('justify-content:space-between;align-items:flex-start;gap:14px')}>
                    <div>
                      <div className="needg">{n.group}</div>
                      <div className="sm" style={css('margin-top:4px')}>{n.unitsNeeded} {n.unitsNeeded === 1 ? 'bag' : 'bags'} needed</div>
                    </div>
                    <span className={`tag ${URGENCY_TAG[n.urgency] ?? 'gy'}`}>{URGENCY_LABEL[n.urgency] ?? n.urgency}</span>
                  </div>
                  <h3 style={css('margin:16px 0 4px')}>{n.town}</h3>
                  <p className="sm">Asked {agoLabel(n.createdAt)} · ref {n.reference}</p>
                  <a href="tel:0812836820" className="btn btn-p btn-s" style={css('margin-top:16px;width:100%')}>Call the branch to give</a>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={css('text-align:center;padding:52px 26px')}>
              <div className="needg" style={css('color:var(--grn)')}>{group}</div>
              <h3 style={css('margin:14px 0 6px')}>{rows.length ? `No open requests for ${group} right now` : 'No open requests right now'}</h3>
              <p className="sm" style={css('max-width:44ch;margin:0 auto')}>
                {rows.length
                  ? <>Other groups are still being asked for - check <b>All groups</b> above.</>
                  : <>When every group is clear, this board is empty, and that is good news.</>}
              </p>
              {rows.length ? <button className="btn btn-o btn-s" style={css('margin-top:18px')} onClick={() => setGroup('All')}>Show every group</button> : null}
            </div>
          )}

          <div className="notice" style={css('margin-top:26px')}>
            A request leaves this board the moment a branch marks it arranged, so nobody travels to a
            hospital that no longer needs them.
          </div>
          <div className="closer" style={css('margin-top:34px')}>
            <div>
              <h2>Not on the register yet?</h2>
              <p>Three minutes now means a telephone call can reach you the next time your group is the one being asked for.</p>
            </div>
            <Link href="/join/donor" className="btn btn-w">Register as a donor</Link>
          </div>
        </div>
      </section>
    </>
  );
}
