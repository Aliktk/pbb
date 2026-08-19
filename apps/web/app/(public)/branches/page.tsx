'use client';

import { useState, useEffect } from 'react';
import { ImageSlot } from '../../../components/ImageSlot';
import { IMG } from '../../../lib/images';
import { getNetworkTowns, type TownNetworkItem } from '../../../lib/towns';

export default function Branches() {
  const [networkTowns, setNetworkTowns] = useState<TownNetworkItem[]>([]);

  useEffect(() => {
    setNetworkTowns(getNetworkTowns());

    function handleUpdate() {
      setNetworkTowns(getNetworkTowns());
    }
    window.addEventListener('pbb_towns_updated', handleUpdate);
    return () => window.removeEventListener('pbb_towns_updated', handleUpdate);
  }, []);

  const branchOffices = networkTowns.filter(
    (t) => t.standing.includes('Branch') || t.standing.includes('Head office')
  );

  const extendedTowns = networkTowns.filter(
    (t) => !t.standing.includes('Branch') && !t.standing.includes('Head office')
  );

  return (
    <>
      {/* Hero Pro Banner */}
      <header className="people-hero-pro">
        <div className="wrap">
          <div className="people-hero-grid">
            {/* Left Column */}
            <div className="people-hero-left">
              <div className="problem-pill-tag">
                <span className="animated-filled-circle" />
                <span>Balochistan Regional Network</span>
              </div>

              <h1 className="people-hero-title">
                {branchOffices.length || 6} offices.<br />
                <span className="highlight-text-red">{networkTowns.length || 14} towns served.</span>
              </h1>

              <p className="people-hero-desc">
                From our headquarters beside the Quetta Press Club out to Zhob, Chaman and Loralai — and to the regional towns in between that have no blood bank of their own.
              </p>

              {/* Badges Grid */}
              <div className="story-meta-grid">
                <div className="story-meta-card">
                  <div className="s-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <span className="s-lbl">Headquarters</span>
                    <span className="s-val">Quetta Press Club</span>
                  </div>
                </div>

                <div className="story-meta-card">
                  <div className="s-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6h6v6"/>
                    </svg>
                  </div>
                  <div>
                    <span className="s-lbl">Branch Network</span>
                    <span className="s-val">{branchOffices.length} Permanent Offices</span>
                  </div>
                </div>

                <div className="story-meta-card">
                  <div className="s-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="m16 12-4-4-4 4M12 16V8"/>
                    </svg>
                  </div>
                  <div>
                    <span className="s-lbl">Regional Scope</span>
                    <span className="s-val">{networkTowns.length} Towns Covered</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Image Frame */}
            <div className="people-hero-right">
              <div className="story-image-frame">
                <ImageSlot ratio="4/3.4" src={IMG.building} placeholder="Quetta Headquarters &amp; Regional Branches Photograph" />
                <div className="story-image-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.05 10.9 2 11.2 2 11.5V16c0 .6.4 1 1 1h2"/>
                    <circle cx="7" cy="17" r="2"/>
                    <path d="M9 17h6"/>
                    <circle cx="17" cy="17" r="2"/>
                  </svg>
                  <span>24/7 Ambulance &amp; Transfusion Operations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <section className="section-block-pro">
        <div className="wrap">
          <div className="section-header-pill">
            <span className="dot-pulse-red" />
            <span>REGIONAL BRANCH OFFICES ({branchOffices.length})</span>
          </div>

          <div className="branches-hero-layout">
            {/* Left: Branch Cards Column */}
            <div className="branches-list-col">
              {branchOffices.map((b) => {
                const isHead = b.standing === 'Head office';
                return (
                  <div key={b.id} className={`branch-card-pro ${isHead ? 'branch-head-highlight' : ''}`}>
                    <div className="branch-card-header">
                      <div className="branch-title-row">
                        <div className="branch-icon-ring">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="branch-name">
                            {b.name}
                            {isHead ? <span className="head-office-badge">HEAD OFFICE</span> : null}
                          </h3>
                          <p className="branch-addr">{b.officeAddress || 'Branch Desk & Operating Office'}</p>
                        </div>
                      </div>

                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(b.name + ' Balochistan')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-directions-pill"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                        </svg>
                        Directions
                      </a>
                    </div>

                    <div className="branch-card-footer">
                      <span className="branch-phone-pill">
                        👤 Manager: {b.managerName || 'Duty Officer'}
                      </span>
                      <span className="branch-ambulance-tag">
                        24-Hour Operations
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Map Showcase Card */}
            <div className="branch-map-card">
              <div className="b-map-header">
                <h3 className="b-map-title">Regional Network Map</h3>
                <span className="b-map-sub">Balochistan Province Coverage</span>
              </div>
              <div className="b-map-frame">
                <ImageSlot ratio="3/4" src={IMG.landscape} placeholder="Map of Balochistan Branch Network &amp; Extended Towns" />
                <div className="b-map-overlay-badge">
                  <div className="map-badge-dot" />
                  <span>{branchOffices.length} Permanent Offices · {extendedTowns.length} Extended Regions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Extended Towns Section */}
          <div className="extended-towns-card">
            <div className="section-header-pill" style={{ marginBottom: '20px' }}>
              <span className="dot-pulse-red" />
              <span>EXTENDED TOWNS SERVED ({extendedTowns.length})</span>
            </div>

            <div className="town-chips-grid">
              {extendedTowns.map((t) => (
                <div key={t.id} className="town-chip-pro">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{t.name} ({t.standing})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
