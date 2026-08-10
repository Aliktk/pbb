'use client';

import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { ActionButton } from '../../../components/ActionButton';
import { DONORS } from '../../../lib/adminData';

// Requests, answer rate and response time per town. The donor count is counted, never stored.
// Ported from the prototype's TOWNROWS. The admin panel renders the head-office (all-branches)
// view; role switching changes only sidebar visibility, not data scope.
const TOWNROWS: [string, number, string, string, number][] = [
  ['Quetta', 312, '91%', '1h 52m', 2984],
  ['Pishin', 108, '88%', '2h 30m', 612],
  ['Loralai', 74, '84%', '3h 05m', 418],
  ['Zhob', 96, '79%', '4h 12m', 502],
  ['Chaman', 63, '76%', '4h 40m', 186],
  ['Muslim Bagh', 41, '82%', '3h 20m', 110],
];

// Head-office typical time to a donor: resp()[0] = 168 minutes → hhmm(168).
const hhmm = (m: number): string => `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
const townCount = (t: string): number => DONORS.filter((d) => d.c === t).length;

const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'] as const;
const BARS = [46, 58, 52, 71, 64, 80, 74, 90, 66, 85, 78, 100];
const HBARS: [string, number, string][] = [
  ['O−', 163, 'thin'], ['AB−', 45, 'thin'], ['B−', 124, 'thin'], ['A−', 97, 'thin'],
  ['AB+', 188, ''], ['A+', 498, ''], ['B+', 561, ''], ['O+', 742, ''],
];

export default function AdminReports() {
  const rows = TOWNROWS;
  const K: [string, string][] = [
    ['Bags this year', TOWNROWS.reduce((a, r) => a + r[4], 0).toLocaleString()],
    ['Requests answered', '86%'],
    ['Typical time to a donor', hhmm(168)],
    ['Donors who came back', '38%'],
  ];

  const actions = (
    <>
      <span style={css('margin-left:auto')} />
      {/* head-office-only in production */}
      <ActionButton className="btn btn-o btn-s" message="Export wires to the API">Export</ActionButton>
      <ActionButton className="btn btn-p btn-s" message="Print wires to the API">Print for the committee</ActionButton>
    </>
  );

  return (
    <AdminShell view="reports" title="Reports" subtitle="Twelve months" actions={actions}>
      <div className="akpi">
        {K.map(([l, v], i) => (
          <div className="c" key={l}><div className="l">{l}</div><div className={`n${i === 2 ? ' r' : ''}`}>{v}</div></div>
        ))}
      </div>

      <div className="g2" style={css('gap:18px;align-items:start')}>
        <div className="acard">
          <h3 style={css('margin-bottom:4px')}>Bags each month</h3>
          <p className="sm" style={css('margin-bottom:16px')}>Twelve months to September</p>
          <div className="chart" style={css('height:170px')}>
            {BARS.map((v, i) => (
              <div key={MONTHS[i]} className={`bar${i === 11 ? ' pk' : ''}`} style={css(`height:${v}%`)}>
                <span>{MONTHS[i]} · {Math.round(v * 5.4)} bags</span>
              </div>
            ))}
          </div>
          <div className="axis"><span>Oct</span><span>Sep</span></div>
        </div>
        <div className="acard">
          <h3 style={css('margin-bottom:4px')}>Where the register is thin</h3>
          <p className="sm" style={css('margin-bottom:16px')}>Donors held against how often that group is asked for</p>
          {HBARS.map(([g, v, c]) => (
            <div className="hbar" key={g}>
              <span className="hn">{g}</span>
              <span className="ht"><i className={c ? 'r' : undefined} style={css(`width:${Math.round((v / 742) * 100)}%`)} /></span>
              <span className="hv">{v}</span>
            </div>
          ))}
          <p className="ahint" style={css('margin-top:16px')}>
            The four negative groups are where every shortage comes from. A campaign aimed only at them would be worth more than a general one.
          </p>
        </div>
      </div>

      <div className="acard" style={css('margin-top:18px')}>
        <h3 style={css('margin-bottom:16px')}>By town</h3>
        <div className="atbl" style={css('border:0')}>
          <table>
            <thead><tr><th>Town</th><th>Donors</th><th>Requests</th><th>Answered</th><th>Typical time</th></tr></thead>
            <tbody>
              {rows.map((r) => {
                const n = townCount(r[0]);
                return (
                  <tr key={r[0]}>
                    <td className="m2"><div className="nm">{r[0]}</div><div className="sm">{n.toLocaleString()} {n === 1 ? 'donor' : 'donors'} · {r[2]} answered</div></td>
                    <td>{n.toLocaleString()}</td>
                    <td className="m1">{r[1]}</td>
                    <td>{r[2]}</td>
                    <td className="m3">{r[3]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
