'use client';

import { useState } from 'react';
import Link from 'next/link';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { elig, daysSince } from '../../../lib/admin';
import { DONORS, REQUESTS, agoLabel } from '../../../lib/adminData';
import { showToast } from '../../../lib/toast';

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
  return <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"><polyline points={pts} fill="none" stroke={col} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

// Sleek Ring component with interactive scale & glow hover effects
function Ring({ pct, col, label }: { pct: number; col: string; label: string }) {
  const r = 38, c = 2 * Math.PI * r;
  return (
    <div
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        const svg = e.currentTarget.querySelector('svg');
        if (svg) svg.style.filter = `drop-shadow(0 8px 18px ${col}66)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        const svg = e.currentTarget.querySelector('svg');
        if (svg) svg.style.filter = 'none';
      }}
      style={{
        position: 'relative',
        width: '104px',
        height: '104px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    >
      <svg viewBox="0 0 90 90" style={{ width: '104px', height: '104px', transform: 'rotate(-90deg)', transition: 'all 0.3s ease' }}>
        <circle cx="45" cy="45" r={r} fill="none" stroke="var(--line)" strokeWidth="8" />
        <circle
          cx="45"
          cy="45"
          r={r}
          fill="none"
          stroke={col}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(c * pct / 100).toFixed(1)} ${c.toFixed(1)}`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <b style={{ color: 'var(--txt1)', fontSize: '16px', fontWeight: 900, lineHeight: 1.1 }}>{pct}%</b>
        <span style={{ color: 'var(--txt2)', fontSize: '10.5px', fontWeight: 700, lineHeight: 1.1, marginTop: '2px', maxWidth: '75px' }}>
          {label}
        </span>
      </div>
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

  // Card hover style helper
  const cardHoverProps = {
    onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.08)';
      e.currentTarget.style.borderColor = 'rgba(217, 35, 35, 0.3)';
    },
    onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.04)';
      e.currentTarget.style.borderColor = 'var(--line)';
    },
  };

  const actions = (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Link href="/admin/requests" className="btn btn-p btn-s" style={{ borderRadius: '10px', fontWeight: 800, padding: '8px 14px' }}>
        + Emergency Request
      </Link>
    </div>
  );

  return (
    <AdminShell view="overview" title="Executive Overview" subtitle="All Fourteen Town Branches · Pashtoonkhwa Blood Register" actions={actions}>
      {/* ALERT OR ALL-CLEAR BANNER */}
      {crit.length ? (
        <div
          className="alert"
          style={{
            borderRadius: '18px',
            padding: '16px 20px',
            marginBottom: '20px',
            background: 'rgba(217, 35, 35, 0.12)',
            border: '1px solid rgba(217, 35, 35, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🚨</span>
            <div>
              <b style={{ color: 'var(--txt1)', fontSize: '14px' }}>
                {crit.length} Critical {crit.length === 1 ? 'Request' : 'Requests'} Open
              </b>
              <div style={{ fontSize: '12.5px', color: 'var(--txt2)' }}>
                {crit[0].g} · {crit[0].hosp} · Submitted {agoLabel(crit[0].minsAgo)}
              </div>
            </div>
          </div>
          <Link href="/admin/requests" className="btn btn-p btn-s" style={{ borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>
            Open Dispatch Desk →
          </Link>
        </div>
      ) : (
        <div
          className="okbar"
          style={{
            borderRadius: '18px',
            padding: '14px 20px',
            marginBottom: '20px',
            background: 'rgba(34, 197, 94, 0.12)',
            border: '1px solid rgba(34, 197, 94, 0.35)',
            color: 'var(--txt1)',
            fontWeight: 700,
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span>🟢</span> All 14 Town Hubs Operational · No Critical Emergency Requests Right Now
        </div>
      )}

      {/* KPI METRICS MATRIX WITH HOVER EFFECTS */}
      <div className="kpirow" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '22px' }}>
        <div
          className="kpi"
          {...cardHoverProps}
          style={{ background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: '20px', padding: '18px', transition: 'all 0.25s ease' }}
        >
          <div className="l" style={{ color: 'var(--txt2)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Registered Donors</div>
          <div className="row" style={css('justify-content:space-between;align-items:flex-end;margin:4px 0 6px 0')}>
            <div className="n" style={{ color: 'var(--txt1)', fontSize: '26px', fontWeight: 900 }}>{DONORS.length.toLocaleString()}</div>
            <div className="dl" style={{ fontSize: '11.5px', color: 'var(--txt2)' }}>{never} never donated</div>
          </div>
          <Spark vals={REG} col="#22C55E" />
        </div>

        <div
          className="kpi"
          {...cardHoverProps}
          style={{ background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: '20px', padding: '18px', transition: 'all 0.25s ease' }}
        >
          <div className="l" style={{ color: 'var(--txt2)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Can Give Today</div>
          <div className="row" style={css('justify-content:space-between;align-items:flex-end;margin:4px 0 6px 0')}>
            <div className="n" style={{ color: '#22C55E', fontSize: '26px', fontWeight: 900 }}>{ready}</div>
            <div className="dl" style={{ fontSize: '11.5px', color: 'var(--txt2)' }}>{pct(ready)}% eligible</div>
          </div>
          <div className="mini" style={{ background: 'var(--line)', height: '6px', borderRadius: '99px', overflow: 'hidden' }}>
            <i style={{ width: `${pct(ready)}%`, background: '#22C55E', height: '100%', display: 'block' }} />
          </div>
        </div>

        <div
          className={`kpi${open.length ? ' warn' : ''}`}
          {...cardHoverProps}
          style={{ background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: '20px', padding: '18px', transition: 'all 0.25s ease' }}
        >
          <div className="l" style={{ color: 'var(--txt2)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Open Requests</div>
          <div className="row" style={css('justify-content:space-between;align-items:flex-end;margin:4px 0 6px 0')}>
            <div className="n r" style={{ color: 'var(--p)', fontSize: '26px', fontWeight: 900 }}>{open.length}</div>
            <div className={`dl${crit.length ? ' dn' : ''}`} style={{ fontSize: '11.5px', color: crit.length ? 'var(--p)' : 'var(--txt2)' }}>{crit.length} critical</div>
          </div>
          <Spark vals={OPENREQ} col="var(--p)" />
        </div>

        <div
          className="kpi"
          {...cardHoverProps}
          style={{ background: 'var(--surf)', border: '1px solid var(--line)', borderRadius: '20px', padding: '18px', transition: 'all 0.25s ease' }}
        >
          <div className="l" style={{ color: 'var(--txt2)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Response Dispatch Time</div>
          <div className="row" style={css('justify-content:space-between;align-items:flex-end;margin:4px 0 6px 0')}>
            <div className="n" style={{ color: '#3B82F6', fontSize: '26px', fontWeight: 900 }}>{hhmm(resp[0])}</div>
            <div className="dl up" style={{ fontSize: '11.5px', color: '#22C55E', fontWeight: 700 }}>{hhmm(resp[1] - resp[0])} faster</div>
          </div>
          <Spark vals={ANSWERED} col="#3B82F6" />
        </div>
      </div>

      {/* DASHBOARD ROW 1: DEPLETION RATIOS & HEALTH RINGS */}
      <div className="dash2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px', marginBottom: '22px', alignItems: 'stretch' }}>
        {/* WHICH GROUP RUNS OUT FIRST */}
        <div
          className="acard"
          {...cardHoverProps}
          style={{ borderRadius: '22px', padding: '24px', background: 'var(--surf)', border: '1px solid var(--line)', transition: 'all 0.25s ease' }}
        >
          <div className="row" style={css('justify-content:space-between;align-items:baseline;margin-bottom:6px')}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: 'var(--txt1)' }}>Which Blood Group Runs Out First</h3>
            <span className="sm" style={{ fontSize: '12px', color: 'var(--txt2)' }}>Months of Cover</span>
          </div>
          <p className="sm" style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: 'var(--txt2)', lineHeight: 1.5 }}>
            Single analytical metric derived from historical demand vs live stock holding across 14 towns.
          </p>
          <div className="ratiorows" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ratio.map(([g, n, d, r]) => (
              <div key={g} className={`rrow ${r < 1 ? 'bad' : r < 2 ? 'mid' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <span className="rg" style={{ fontWeight: 900, color: 'var(--txt1)', width: '32px' }}>{g}</span>
                <span className="rbar" style={{ flex: 1, height: '8px', background: 'var(--line)', borderRadius: '99px', overflow: 'hidden' }}>
                  <i style={{ width: `${Math.min(100, (r / 4) * 100)}%`, background: r < 1 ? 'var(--p)' : r < 2 ? '#EAB308' : '#22C55E', height: '100%', display: 'block' }} />
                </span>
                <span className="rn" style={{ fontWeight: 800, color: 'var(--txt1)', width: '70px', textAlign: 'right' }}>{r} mos</span>
                <span className={`tag ${r < 1 ? 'no' : r < 2 ? 'wt' : 'ok'}`} style={{ fontSize: '11px', fontWeight: 800 }}>
                  {r < 1 ? 'Will run out' : r < 2 ? 'Tight' : 'Comfortable'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* REGISTER HEALTH RINGS CARD WITH HOVER EFFECTS */}
        <div
          className="acard"
          {...cardHoverProps}
          style={{ borderRadius: '22px', padding: '24px', background: 'var(--surf)', border: '1px solid var(--line)', transition: 'all 0.25s ease' }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 900, color: 'var(--txt1)' }}>Register Health &amp; Verification</h3>
          
          {/* HOVER-ACTIVE CIRCULAR RINGS CONTAINER */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '22px', padding: '8px 0' }}>
            <Ring pct={pct(DONORS.length - unscreened)} col="#22C55E" label="screened" />
            <Ring pct={pct(DONORS.length - never)} col="#3B82F6" label="have given" />
            <Ring pct={38} col="var(--p)" label="came back" />
          </div>

          {/* HOVER-ACTIVE ITEM CARDS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {([[`${unscreened} never screened`, 'Cannot be called until the five lab tests are done', '/admin/donors', unscreened ? 'no' : 'ok'],
              [`${stale} screened over six months ago`, 'Screening results should be repeated before issuing', '/admin/donors', stale ? 'wt' : 'ok'],
              [`${never} have never given`, 'Registered donors who have not yet donated blood', '/admin/donors', 'gy']] as [string, string, string, string][]).map(([t, s, u, c]) => (
              <Link
                key={t}
                href={u}
                className="todo2"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.borderColor = 'var(--p)';
                  e.currentTarget.style.background = 'rgba(217, 35, 35, 0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'var(--line)';
                  e.currentTarget.style.background = 'var(--surf)';
                }}
                style={{
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: 'var(--surf)',
                  border: '1px solid var(--line)',
                  textDecoration: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <b style={{ color: 'var(--txt1)', fontSize: '13.5px', display: 'block' }}>{t}</b>
                  <span style={{ color: 'var(--txt2)', fontSize: '12px' }}>{s}</span>
                </div>
                <span className={`tag ${c}`} style={{ fontSize: '11px', fontWeight: 800 }}>{c === 'no' ? 'Blocked' : c === 'wt' ? 'Stale' : '-'}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* DASHBOARD ROW 2: BAGS COLLECTED & HOURLY CALLS */}
      <div className="dash2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px', marginBottom: '22px', alignItems: 'stretch' }}>
        <div
          className="acard"
          {...cardHoverProps}
          style={{ borderRadius: '22px', padding: '24px', background: 'var(--surf)', border: '1px solid var(--line)', transition: 'all 0.25s ease' }}
        >
          <div className="row" style={css('justify-content:space-between;align-items:baseline;margin-bottom:16px')}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: 'var(--txt1)' }}>Bags Collected Monthly</h3>
            <span className="sm" style={{ fontSize: '12px', color: 'var(--txt2)' }}>12 Months · {BAGS.reduce((a, b) => a + b, 0).toLocaleString()} Total</span>
          </div>
          <div className="chart" style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '6px', paddingBottom: '10px' }}>
            {BAGS.map((v, i) => (
              <div key={i} className={`bar${i === 11 ? ' pk' : ''}`} style={{ flex: 1, background: i === 11 ? 'var(--p)' : '#3B82F6', height: `${Math.round((v / Math.max(...BAGS)) * 100)}%`, borderRadius: '6px' }} title={`${MONTHS[i]} · ${v} bags`} />
            ))}
          </div>
          <div className="axis" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--txt2)', fontWeight: 700 }}>
            {MONTHS.map((m) => <span key={m}>{m}</span>)}
          </div>
        </div>

        <div
          className="acard"
          {...cardHoverProps}
          style={{ borderRadius: '22px', padding: '24px', background: 'var(--surf)', border: '1px solid var(--line)', transition: 'all 0.25s ease' }}
        >
          <div className="row" style={css('justify-content:space-between;align-items:baseline;margin-bottom:6px')}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: 'var(--txt1)' }}>Hourly Request Frequency</h3>
            <span className="sm" style={{ fontSize: '12px', color: 'var(--txt2)' }}>Peak {String(peak).padStart(2, '0')}:00</span>
          </div>
          <p className="sm" style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: 'var(--txt2)', lineHeight: 1.5 }}>
            Emergency requests distribution by hour across all 14 town branches over the past year.
          </p>
          <div className="hourly" style={{ height: '70px', display: 'flex', alignItems: 'flex-end', gap: '4px', marginBottom: '8px' }}>
            {HOURS.map((v, i) => (
              <i key={i} className={v >= 15 ? 'pk' : ''} style={{ flex: 1, background: v >= 15 ? 'var(--p)' : 'var(--line)', height: `${Math.round((v / Math.max(...HOURS)) * 100)}%`, borderRadius: '3px', display: 'block' }} title={`${i}:00 · ${v} calls`} />
            ))}
          </div>
          <div className="axis" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--txt2)', fontWeight: 700 }}>
            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
          </div>
        </div>
      </div>

      {/* DASHBOARD ROW 3: STOCK BY GROUP & TOWNS STATUS */}
      <div className="dash2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px', marginBottom: '22px', alignItems: 'stretch' }}>
        {/* STOCK HOLDING CARD WITH BOX HOVER EFFECTS */}
        <div
          className="acard"
          {...cardHoverProps}
          style={{ borderRadius: '22px', padding: '24px', background: 'var(--surf)', border: '1px solid var(--line)', transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div>
            <div className="row" style={css('justify-content:space-between;align-items:baseline;margin-bottom:16px')}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: 'var(--txt1)' }}>Stock Holding by Blood Group</h3>
              <Link href="/admin/inventory" className="minilink" style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--p)', textDecoration: 'none' }}>
                Update Stock →
              </Link>
            </div>
            
            <div className="stockgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '14px' }}>
              {Object.keys(HELD).map((g) => {
                const n = HELD[g];
                return (
                  <div
                    key={g}
                    className={`sbox ${coverClass(g)}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px) scale(1.04)';
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(217, 35, 35, 0.18)';
                      e.currentTarget.style.borderColor = 'var(--p)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = 'var(--line)';
                    }}
                    style={{
                      padding: '14px 10px',
                      borderRadius: '16px',
                      background: 'var(--surf)',
                      border: '1px solid var(--line)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div className="sg" style={{ fontWeight: 900, color: 'var(--txt1)', fontSize: '16px' }}>{g}</div>
                    <div className="sn" style={{ fontSize: '22px', fontWeight: 900, color: n <= 3 ? 'var(--p)' : '#22C55E', margin: '2px 0' }}>{n}</div>
                    <div className="ss" style={{ fontSize: '11.5px', color: 'var(--txt2)', fontWeight: 600 }}>{n === 1 ? 'bag' : 'bags'}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="sm" style={{ margin: 0, fontSize: '12px', color: 'var(--txt2)', fontStyle: 'italic' }}>
            📍 Quetta Hub · Updated 2 hours ago
          </p>
        </div>

        {/* TOWN BRANCH OPERATIONAL ACTIVITY CARD */}
        <div
          className="acard"
          {...cardHoverProps}
          style={{ borderRadius: '22px', padding: '24px', background: 'var(--surf)', border: '1px solid var(--line)', transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: 900, color: 'var(--txt1)' }}>Town Branch Operational Activity</h3>
            <p className="sm" style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: 'var(--txt2)' }}>
              Live status of regional branch offices updating stock and donor records.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {towns.map(([t, u, act]) => (
                <div key={t} className="townrow" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <span className="tn" style={{ fontWeight: 800, color: 'var(--txt1)', width: '100px' }}>{t}</span>
                  <span className="tbar" style={{ flex: 1, height: '6px', background: 'var(--line)', borderRadius: '99px', overflow: 'hidden' }}>
                    <i className={act < 40 ? 'bad' : act < 75 ? 'mid' : ''} style={{ width: `${act}%`, background: act < 40 ? 'var(--p)' : act < 75 ? '#EAB308' : '#22C55E', height: '100%', display: 'block' }} />
                  </span>
                  <span className="td" style={{ fontSize: '12px', color: 'var(--txt2)', width: '40px' }}>{townCount(t).toLocaleString()}</span>
                  <span className={`tag ${u === 'never' ? 'no' : u.includes('day') && parseInt(u) > 7 ? 'wt' : 'ok'}`} style={{ fontSize: '11px', fontWeight: 800 }}>
                    {u === 'today' ? 'Today' : u === 'never' ? 'Never' : u}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LATEST EMERGENCY REQUESTS RECENT TABLE CARD */}
      <div
        className="acard"
        {...cardHoverProps}
        style={{ borderRadius: '22px', padding: '24px', background: 'var(--surf)', border: '1px solid var(--line)', transition: 'all 0.25s ease' }}
      >
        <div className="row" style={css('justify-content:space-between;align-items:baseline;margin-bottom:16px')}>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: 'var(--txt1)' }}>Latest Emergency Requests</h3>
          <Link href="/admin/requests" className="minilink" style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--p)', textDecoration: 'none' }}>
            View All Requests →
          </Link>
        </div>
        <div className="atbl" style={{ border: 0, borderRadius: '14px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Hospital / Location</th>
                <th>Blood Needed</th>
                <th>Submitted</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {REQUESTS.slice(0, 5).map((r) => (
                <tr key={r.id}>
                  <td className="m2">
                    <div className="nm" style={{ fontWeight: 800, color: 'var(--txt1)', fontSize: '14px' }}>{r.hosp}</div>
                    <div className="sm" style={{ fontSize: '12px', color: 'var(--txt2)' }}>{r.id} · {r.src === 'web' ? 'from the website' : 'entered by staff'}</div>
                  </td>
                  <td className="m1">{bgTag(r.g)}</td>
                  <td className="sm" style={{ fontSize: '12.5px', color: 'var(--txt2)', fontWeight: 600 }}>{agoLabel(r.minsAgo)}</td>
                  <td className="m3">
                    {r.st === 'open' ? <span className="tag no">Open</span> : <span className="tag ok">Arranged</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
