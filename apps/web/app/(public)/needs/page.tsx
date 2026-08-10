'use client';

import { useState } from 'react';
import Link from 'next/link';
import { css } from '../../../lib/style';

// Who needs blood now — ported from the prototype's needs board (pbb-me.js NEEDS). Client
// component so the group filter works. Privacy is CRITICAL: NO patient names, NO phone
// numbers — a blood group, a hospital and an hour is all a donor needs (INV-11).
interface Need {
  g: string;
  u: number;
  h: string;
  c: string;
  urg: string;
  ago: string;
}

const NEEDS: Need[] = [
  { g: 'O−', u: 3, h: 'Civil Hospital, Quetta', c: 'Quetta', urg: 'Critical — today', ago: '22 minutes ago' },
  { g: 'B−', u: 2, h: 'Bolan Medical Complex, Quetta', c: 'Quetta', urg: 'Urgent — within 2 days', ago: '1 hour ago' },
  { g: 'A+', u: 1, h: 'DHQ Hospital, Zhob', c: 'Zhob', urg: 'Planned — a date is set', ago: '3 hours ago' },
  { g: 'O+', u: 2, h: 'Sandeman Hospital, Quetta', c: 'Quetta', urg: 'Urgent — within 2 days', ago: '4 hours ago' },
];

const FILTERS: [string, string][] = [
  ['All', 'All groups'], ['O−', 'O−'], ['O+', 'O+'], ['A−', 'A−'], ['A+', 'A+'],
  ['B−', 'B−'], ['B+', 'B+'], ['AB−', 'AB−'], ['AB+', 'AB+'],
];

function urgencyTag(urg: string): string {
  if (urg.startsWith('Critical')) return 'no';
  if (urg.startsWith('Urgent')) return 'wt';
  return 'gy';
}

export default function Needs() {
  const [group, setGroup] = useState('All');
  const rows = group === 'All' ? NEEDS : NEEDS.filter((n) => n.g === group);

  return (
    <>
      <header className="ph-hero">
        <div className="wrap">
          <span className="eyebrow"><b />Right now</span>
          <h1>Who needs blood today</h1>
          <p className="lead" style={css('margin-top:18px;max-width:62ch')}>
            Every open request across the fourteen towns. No names — a blood group, a hospital and an
            hour is all a donor needs to decide.
          </p>
        </div>
      </header>
      <section className="blk" style={css('padding-top:0')}>
        <div className="wrap">
          <div className="row" style={css('gap:8px;margin-bottom:24px;flex-wrap:wrap')}>
            {FILTERS.map(([g, l]) => {
              const count = g === 'All' ? NEEDS.length : NEEDS.filter((n) => n.g === g).length;
              return (
                <button key={g} className={`pill${g === group ? ' on' : ''}`} onClick={() => setGroup(g)}>
                  {l}{count ? <> <b style={css('font-variant-numeric:tabular-nums')}>{count}</b></> : null}
                </button>
              );
            })}
          </div>

          {rows.length ? (
            <div className="g2" style={css('gap:16px')}>
              {rows.map((n) => (
                <div key={n.h + n.g} className={`card needcard ${n.urg.startsWith('Critical') ? 'crit' : ''}`}>
                  <div className="row" style={css('justify-content:space-between;align-items:flex-start;gap:14px')}>
                    <div>
                      <div className="needg">{n.g}</div>
                      <div className="sm" style={css('margin-top:4px')}>{n.u} {n.u === 1 ? 'bag' : 'bags'} needed</div>
                    </div>
                    <span className={`tag ${urgencyTag(n.urg)}`}>{n.urg}</span>
                  </div>
                  <h3 style={css('margin:16px 0 4px')}>{n.h}</h3>
                  <p className="sm">{n.c} · asked {n.ago}</p>
                  <a href="tel:0812836820" className="btn btn-p btn-s" style={css('margin-top:16px;width:100%')}>Call the branch to give</a>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={css('text-align:center;padding:52px 26px')}>
              <div className="needg" style={css('color:var(--grn)')}>{group}</div>
              <h3 style={css('margin:14px 0 6px')}>No open requests for {group} right now</h3>
              <p className="sm" style={css('max-width:44ch;margin:0 auto')}>
                Other groups are still being asked for — check <b>All groups</b> above. This board changes
                through the day, so it is worth looking again.
              </p>
              <button className="btn btn-o btn-s" style={css('margin-top:18px')} onClick={() => setGroup('All')}>Show every group</button>
            </div>
          )}

          <div className="notice" style={css('margin-top:26px')}>
            A request leaves this board the moment a branch marks it arranged, so nobody travels to a
            hospital that no longer needs them. When every group is clear, this board is empty — and that
            is good news.
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
