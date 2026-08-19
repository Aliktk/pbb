'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import type { Paged, PublicRequestRow } from '../../../lib/apiTypes';

const FILTERS: string[] = ['All', 'O−', 'O+', 'A−', 'A+', 'B−', 'B+', 'AB−', 'AB+'];

const URGENCY_LABEL: Record<string, string> = { CRITICAL: 'Critical', URGENT: 'Urgent', ROUTINE: 'Planned' };
const URGENCY_STYLE: Record<string, string> = { CRITICAL: 'urgent-crit', URGENT: 'urgent-warn', ROUTINE: 'urgent-plan' };

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
    api
      .get<Paged<PublicRequestRow>>('/requests/public', { auth: false })
      .then((res) => alive && setRows(res.data))
      .catch(() => alive && setError('Could not load the dispatch board just now. Please try again shortly.'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const shown = group === 'All' ? rows : rows.filter((n) => n.group === group);

  return (
    <>
      {/* Breathtaking Centered Hero Header */}
      <header className="join-hero-centered">
        {/* Background Grid Lines Overlay */}
        <div className="hero-grid-pattern" />

        {/* Left Floating Side Badge */}
        <div className="hero-side-badge left">
          <div className="side-badge-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div className="side-badge-text">
            <span className="side-badge-val">Live Dispatch</span>
            <span className="side-badge-lbl">Real-Time Board</span>
          </div>
        </div>

        {/* Right Floating Side Badge */}
        <div className="hero-side-badge right">
          <div className="side-badge-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className="side-badge-text">
            <span className="side-badge-val">100% Privacy</span>
            <span className="side-badge-lbl">Zero Patient Names</span>
          </div>
        </div>

        <div className="wrap">
          <div className="join-hero-content">
            <div className="problem-pill-tag" style={{ margin: '0 auto 16px' }}>
              <span className="animated-filled-circle" />
              <span>Right Now</span>
            </div>

            <h1 className="join-hero-title">
              Who needs blood today.<br />
              <span className="highlight-text-red">Real-time open requests.</span>
            </h1>

            <p className="join-hero-desc">
              Every open request across our regional branches. Privacy protected: no patient names or phone numbers — a blood group, town, and urgency level is all a voluntary donor needs.
            </p>

            {/* Emergency Hotline Floating Glass Bar */}
            <div className="hero-emergency-bar">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>In a hospital emergency right now? Call <a href="tel:0812836820">081-2836820</a> — 24/7 Coordinator On Duty</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Board Section */}
      <section className="section-block-pro">
        <div className="wrap">
          {/* Blood Group Filter Bar */}
          <div className="needs-filter-bar-pro">
            {FILTERS.map((g) => {
              const count = g === 'All' ? rows.length : rows.filter((n) => n.group === g).length;
              return (
                <button
                  key={g}
                  className={`needs-filter-btn ${g === group ? 'active' : ''}`}
                  onClick={() => setGroup(g)}
                >
                  <span>{g === 'All' ? 'All Groups' : g}</span>
                  {count > 0 && <span className="n-filter-count">{count}</span>}
                </button>
              );
            })}
          </div>

          {/* Grid Content */}
          {loading ? (
            <div className="child-dignity-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div className="dot-pulse-red" style={{ margin: '0 auto 16px' }} />
              <h3 className="sponsor-title" style={{ fontSize: '20px' }}>Loading real-time requests...</h3>
              <p className="sponsor-desc" style={{ fontSize: '14px', marginBottom: 0 }}>Connecting to regional blood bank dispatch servers.</p>
            </div>
          ) : error ? (
            <div className="child-dignity-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <h3 className="sponsor-title" style={{ color: 'var(--red)', fontSize: '20px' }}>{error}</h3>
              <p className="sponsor-desc" style={{ fontSize: '14px', marginTop: '8px' }}>
                In an emergency, phone our main hotline directly on <a href="tel:0812836820" style={{ color: 'var(--red)', fontWeight: 800 }}>081-2836820</a>.
              </p>
            </div>
          ) : shown.length ? (
            <div className="needs-request-grid-pro">
              {shown.map((n) => (
                <div key={n.reference} className={`need-card-luxury ${n.urgency === 'CRITICAL' ? 'crit' : ''}`}>
                  <div className="n-card-top">
                    <div className="need-bg-pill">{n.group}</div>
                    <span className={`need-urgency-pill ${URGENCY_STYLE[n.urgency] ?? 'urgent-plan'}`}>
                      {URGENCY_LABEL[n.urgency] ?? n.urgency}
                    </span>
                  </div>

                  <div className="n-card-body">
                    <h3 className="n-town-title">{n.town}</h3>
                    <div className="n-bags-info">{n.unitsNeeded} {n.unitsNeeded === 1 ? 'bag' : 'bags'} required</div>
                    <div className="n-time-meta">Asked {agoLabel(n.createdAt)} · Ref #{n.reference}</div>
                  </div>

                  <div className="n-card-footer">
                    <a href="tel:0812836820" className="j-btn-pill btn-crimson">
                      Call Branch to Give →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="child-dignity-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div className="need-bg-pill" style={{ margin: '0 auto 16px', display: 'inline-flex' }}>{group}</div>
              <h3 className="sponsor-title" style={{ fontSize: '22px' }}>
                {rows.length ? `No open requests for ${group} right now` : 'No open requests right now'}
              </h3>
              <p className="sponsor-desc" style={{ maxWidth: '48ch', margin: '0 auto 20px' }}>
                {rows.length
                  ? 'Other blood groups still have active requests — check "All Groups" above.'
                  : 'When every group is clear, this board remains empty, and that is wonderful news for patients.'}
              </p>
              {rows.length ? (
                <button className="btn-crimson-pill" onClick={() => setGroup('All')}>
                  Show All Groups →
                </button>
              ) : null}
            </div>
          )}

          {/* Auto-Clear Notice */}
          <div className="extended-towns-card" style={{ marginTop: '40px' }}>
            <div className="section-header-pill" style={{ marginBottom: '12px' }}>
              <span className="dot-pulse-red" />
              <span>AUTOMATIC DISPATCH CLEARANCE</span>
            </div>
            <h2 className="criteria-heading">Real-Time Board Accuracy</h2>
            <p className="criteria-subheading">
              A request leaves this board the moment a branch marks it fulfilled, so voluntary donors never travel to a hospital that has already received the blood bags needed.
            </p>
          </div>

          {/* Donor CTA Banner */}
          <div className="sponsor-impact-card" style={{ marginTop: '32px' }}>
            <span className="sponsor-badge-pill">JOIN THE REGISTER</span>
            <h2 className="sponsor-title">Not on the donor register yet?</h2>
            <p className="sponsor-desc">
              Three minutes now means a telephone call can reach you the next time someone with your blood group urgently needs help in your town.
            </p>
            <div className="sponsor-action-row">
              <Link href="/join/donor" className="btn-crimson-pill">
                Register as a Donor Today →
              </Link>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

