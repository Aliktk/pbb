import Link from 'next/link';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { elig, daysSince } from '../../../lib/admin';
import { DONORS, REQUESTS, agoLabel } from '../../../lib/adminData';

// Overview dashboard — ported from PAGES['admin/overview']. Every figure is derived here in
// ONE place (INV-1). Charts use the prototype's twelve-month series.
const HELD: Record<string, number> = { 'O−': 2, 'AB−': 3, 'B−': 6, 'A−': 11, 'O+': 41, 'A+': 34, 'B+': 28, 'AB+': 9 };
const DEMAND: Record<string, number> = { 'O−': 38, 'AB−': 14, 'B−': 44, 'A−': 36, 'O+': 210, 'A+': 150, 'B+': 165, 'AB+': 22 };
const MONTHS = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
const BAGS = [318, 352, 340, 376, 361, 404, 392, 431, 377, 448, 412, 467];
const HOURS = [1, 1, 1, 1, 2, 3, 5, 9, 14, 17, 15, 12, 10, 13, 16, 19, 22, 18, 13, 9, 6, 4, 3, 2];
const REG = [1142, 1158, 1171, 1189, 1204, 1223, 1241, 1258, 1272, 1289, 1301, 1318];
const OPENREQ = [9, 7, 11, 8, 12, 10, 14, 9, 13, 7, 11, 8];
const ANSWERED = [74, 78, 76, 81, 79, 84, 82, 86, 83, 88, 85, 89];
const ACT: Record<string, [string, number]> = { Quetta: ['today', 96], Pishin: ['today', 88], Loralai: ['2 days', 71], Zhob: ['9 days', 34], Chaman: ['never', 12], 'Muslim Bagh': ['today', 80] };

const hhmm = (m: number) => `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
const cover = (g: string) => (DEMAND[g] ? HELD[g] / (DEMAND[g] / 12) : 99);
const coverClass = (g: string) => { const c = cover(g); return c < 1 ? 'cr' : c < 2 ? 'lo' : 'ok'; };
const townCount = (t: string) => DONORS.filter((d) => d.c === t).length;
function bgTag(g: string) { return <span className={`abg${g.includes('−') ? ' r' : ''}`}>{g}</span>; }

function Spark({ vals, col }: { vals: number[]; col: string }) {
  const mx = Math.max(...vals), mn = Math.min(...vals), w = 100, h = 28;
  const pts = vals.map((v, i) => `${((i / (vals.length - 1)) * w).toFixed(1)},${(h - ((v - mn) / ((mx - mn) || 1)) * h).toFixed(1)}`).join(' ');
  return <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"><polyline points={pts} fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Ring({ pct, col, label }: { pct: number; col: string; label: string }) {
  const r = 34, c = 2 * Math.PI * r;
  return (
    <div className="ringwrap">
      <svg viewBox="0 0 80 80" className="ring">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--line)" strokeWidth="9" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={col} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${(c * pct / 100).toFixed(1)} ${c.toFixed(1)}`} transform="rotate(-90 40 40)" />
      </svg>
      <div className="ringv"><b>{pct}%</b><span>{label}</span></div>
    </div>
  );
}

export default function AdminOverview() {
  const open = REQUESTS.filter((r) => r.st === 'open');
  const crit = open.filter((r) => /Critical/.test(r.urg));
  const ready = DONORS.filter((d) => elig(d).ok).length;
  const unscreened = DONORS.filter((d) => !d.tests).length;
  const stale = DONORS.filter((d) => { const t = daysSince(d.tested); return t !== null && t > 180; }).length;
  const never = DONORS.filter((d) => !d.times).length;
  const ratio = Object.keys(HELD).map((g) => [g, HELD[g], DEMAND[g], +cover(g).toFixed(1)] as [string, number, number, number]).sort((a, b) => a[3] - b[3]);
  const peak = HOURS.indexOf(Math.max(...HOURS));
  const resp: [number, number] = [168, 260];
  const towns = Object.keys(ACT).map((t) => [t, ...ACT[t]] as [string, string, number]);
  const pct = (num: number) => (DONORS.length ? Math.round((num / DONORS.length) * 100) : 0);

  return (
    <AdminShell view="overview" title="Overview" subtitle="All fourteen towns">
      {crit.length ? (
        <div className="alert">
          <div><b>{crit.length} critical {crit.length === 1 ? 'request' : 'requests'} open.</b> {crit[0].g} · {crit[0].hosp} · asked {agoLabel(crit[0].minsAgo)}</div>
          <Link href="/admin/requests" className="btn btn-w btn-s">Open the list</Link>
        </div>
      ) : (
        <div className="okbar">No critical requests open right now.</div>
      )}

      <div className="kpirow">
        <div className="kpi">
          <div className="l">Donors on the register</div>
          <div className="row" style={css('justify-content:space-between;align-items:flex-end')}><div className="n">{DONORS.length.toLocaleString()}</div><div className="dl">{never} {never === 1 ? 'has' : 'have'} never given</div></div>
          <Spark vals={REG} col="var(--grn)" />
        </div>
        <div className="kpi">
          <div className="l">Can give today</div>
          <div className="row" style={css('justify-content:space-between;align-items:flex-end')}><div className="n">{ready}</div><div className="dl">{pct(ready)}% of the register</div></div>
          <div className="mini"><i style={{ width: `${pct(ready)}%` }} /></div>
        </div>
        <div className={`kpi${open.length ? ' warn' : ''}`}>
          <div className="l">Open requests</div>
          <div className="row" style={css('justify-content:space-between;align-items:flex-end')}><div className="n r">{open.length}</div><div className={`dl${crit.length ? ' dn' : ''}`}>{crit.length} critical</div></div>
          <Spark vals={OPENREQ} col="var(--red)" />
        </div>
        <div className="kpi">
          <div className="l">Typical time to a donor</div>
          <div className="row" style={css('justify-content:space-between;align-items:flex-end')}><div className="n">{hhmm(resp[0])}</div><div className="dl up">{hhmm(resp[1] - resp[0])} faster</div></div>
          <div className="dl" style={css('margin-top:8px')}>Against {hhmm(resp[1])} a year ago</div>
          <Spark vals={ANSWERED} col="var(--ink)" />
        </div>
      </div>

      <div className="dash2">
        <div className="acard">
          <div className="row" style={css('justify-content:space-between;align-items:baseline;margin-bottom:4px')}><h3>Which group runs out first</h3><span className="sm">months of cover</span></div>
          <p className="sm" style={css('margin-bottom:18px')}>The single figure worth watching, and the one a shelf count cannot give you. The stock boxes below are coloured by this same calculation.</p>
          <div className="ratiorows">
            {ratio.map(([g, n, d, r]) => (
              <div key={g} className={`rrow ${r < 1 ? 'bad' : r < 2 ? 'mid' : ''}`}>
                <span className="rg">{g}</span>
                <span className="rbar"><i style={{ width: `${Math.min(100, (r / 4) * 100)}%` }} /></span>
                <span className="rn">{r} months</span><span className="rd">{n} held · {d} asked a year</span>
                <span className={`tag ${r < 1 ? 'no' : r < 2 ? 'wt' : 'ok'}`}>{r < 1 ? 'Will run out' : r < 2 ? 'Tight' : 'Comfortable'}</span>
              </div>
            ))}
          </div>
          <div className="ahint" style={css('margin-top:16px')}>O− is the group every shortage starts with: it can be given to anybody, so it is spent on emergencies before the right group is known.</div>
        </div>

        <div className="acard">
          <h3 style={css('margin-bottom:16px')}>The register&apos;s health</h3>
          <div className="ringrow">
            <Ring pct={pct(DONORS.length - unscreened)} col="var(--grn)" label="screened" />
            <Ring pct={pct(DONORS.length - never)} col="var(--ink)" label="have given" />
            <Ring pct={38} col="var(--red)" label="came back" />
          </div>
          <div style={css('margin-top:20px')}>
            {([[`${unscreened} never screened`, 'Cannot be called until the five tests are done', '/admin/donors', unscreened ? 'no' : 'ok'],
              [`${stale} screened over six months ago`, 'Results should be repeated before issuing', '/admin/donors', stale ? 'wt' : 'ok'],
              [`${never} have never given`, 'Registered, but never once called in', '/admin/find', 'gy']] as [string, string, string, string][]).map(([t, s, u, c]) => (
              <Link key={t} href={u} className="todo2"><div><b>{t}</b><span>{s}</span></div><span className={`tag ${c}`}>{c === 'no' ? 'Blocked' : c === 'wt' ? 'Stale' : '—'}</span></Link>
            ))}
          </div>
        </div>
      </div>

      <div className="dash2" style={css('margin-top:18px')}>
        <div className="acard">
          <div className="row" style={css('justify-content:space-between;align-items:baseline;margin-bottom:16px')}><h3>Bags collected</h3><span className="sm">twelve months · all fourteen towns · {BAGS.reduce((a, b) => a + b, 0).toLocaleString()} total</span></div>
          <div className="chart" style={css('height:150px')}>
            {BAGS.map((v, i) => <div key={i} className={`bar${i === 11 ? ' pk' : ''}`} style={{ height: `${Math.round((v / Math.max(...BAGS)) * 100)}%` }}><span>{MONTHS[i]} · {v} bags</span></div>)}
          </div>
          <div className="axis">{MONTHS.map((m) => <span key={m}>{m}</span>)}</div>
        </div>

        <div className="acard">
          <div className="row" style={css('justify-content:space-between;align-items:baseline;margin-bottom:6px')}><h3>When the calls come</h3><span className="sm">peak {String(peak).padStart(2, '0')}:00</span></div>
          <p className="sm" style={css('margin-bottom:16px')}>Requests by hour across all fourteen towns, over a year. It says plainly when the desk needs somebody on it.</p>
          <div className="hourly">{HOURS.map((v, i) => <i key={i} className={v >= 15 ? 'pk' : ''} style={{ height: `${Math.round((v / Math.max(...HOURS)) * 100)}%` }} title={`${i}:00 · ${v}`} />)}</div>
          <div className="axis"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>
        </div>
      </div>

      <div className="dash2" style={css('margin-top:18px')}>
        <div className="acard">
          <div className="row" style={css('justify-content:space-between;align-items:baseline;margin-bottom:16px')}><h3>Stock by group</h3><Link href="/admin/inventory" className="minilink">Update</Link></div>
          <div className="stockgrid">
            {Object.keys(HELD).map((g) => { const n = HELD[g]; return <div key={g} className={`sbox ${coverClass(g)}`}><div className="sg">{g}</div><div className="sn">{n}</div><div className="ss">{n === 1 ? 'bag' : 'bags'}</div></div>; })}
          </div>
          <p className="sm" style={css('margin-top:14px')}>Quetta · updated 2 hours ago</p>
        </div>

        <div className="acard">
          <h3 style={css('margin-bottom:6px')}>Towns, and who has gone quiet</h3>
          <p className="sm" style={css('margin-bottom:16px')}>The six branch offices, and any other town with somebody on the register. A branch that stops updating is the reason the public shortage strip goes stale.</p>
          {towns.map(([t, u, act]) => (
            <div key={t} className="townrow">
              <span className="tn">{t}</span>
              <span className="tbar"><i className={act < 40 ? 'bad' : act < 75 ? 'mid' : ''} style={{ width: `${act}%` }} /></span>
              <span className="td">{townCount(t).toLocaleString()}</span>
              <span className={`tag ${u === 'never' ? 'no' : u.includes('day') && parseInt(u) > 7 ? 'wt' : 'ok'}`}>{u === 'today' ? 'Today' : u === 'never' ? 'Never' : u}</span>
            </div>
          ))}
          <Link href="/admin/network" className="btn btn-o btn-s" style={css('margin-top:16px;width:100%')}>All fourteen towns</Link>
        </div>
      </div>

      <div className="acard" style={css('margin-top:18px')}>
        <div className="row" style={css('justify-content:space-between;align-items:baseline;margin-bottom:16px')}><h3>Latest activity</h3><Link href="/admin/requests" className="minilink">All requests</Link></div>
        <div className="atbl" style={css('border:0')}>
          <table><tbody>
            {REQUESTS.slice(0, 5).map((r) => (
              <tr key={r.id}>
                <td className="m2"><div className="nm">{r.hosp}</div><div className="sm">{r.id} · {r.src === 'web' ? 'from the website' : 'entered by staff'}</div></td>
                <td className="m1">{bgTag(r.g)}</td>
                <td className="sm">{agoLabel(r.minsAgo)}</td>
                <td className="m3">{r.st === 'open' ? <span className="tag no">Open</span> : <span className="tag ok">Arranged</span>}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
      </div>
    </AdminShell>
  );
}
