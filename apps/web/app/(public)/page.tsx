'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ImageSlot } from '../../components/ImageSlot';
import { css } from '../../lib/style';
import { IMG } from '../../lib/images';
import { EXACT_HOMEPAGE_SECTIONS, type HomepageSection } from '../../lib/homepageCms';

const NEWS_COVERS = [IMG.community, IMG.building, IMG.bloodBags];

const STOCK: [string, string, string][] = [
  ['O−', 'cr', 'Critical'],
  ['AB−', 'lo', 'Low'],
  ['B−', 'lo', 'Low'],
  ['A−', 'ok', 'Available'],
  ['O+', 'ok', 'Available'],
  ['A+', 'ok', 'Available'],
  ['B+', 'ok', 'Available'],
  ['AB+', 'ok', 'Available'],
];

const CHART: [number, number, number][] = [
  [1999, 360, 12],
  [2000, 720, 18],
  [2001, 1080, 24],
  [2002, 1440, 30],
  [2003, 2160, 40],
  [2004, 2747, 48],
  [2005, 3118, 54],
  [2006, 3968, 64],
  [2007, 4582, 72],
  [2008, 5905, 88],
  [2009, 5920, 89],
  [2010, 6937, 96],
  [2011, 9484, 100],
  [2012, 5120, 55],
];

export default function Home() {
  const [sections, setSections] = useState<HomepageSection[]>(EXACT_HOMEPAGE_SECTIONS);
  const [isHomeDraft, setIsHomeDraft] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pbb_admin_homepage_sections');
      if (saved) {
        setSections(JSON.parse(saved));
      }

      // Check if Home page is marked as draft in site pages
      const savedPages = localStorage.getItem('pbb_admin_site_pages');
      if (savedPages) {
        const pages = JSON.parse(savedPages);
        const homePage = pages.find((p: any) => p.url === '/' || p.name.toLowerCase() === 'home');
        if (homePage && homePage.status === 'draft') {
          setIsHomeDraft(true);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  // Enforce draft status: if Home page is in draft status, do not show public content
  if (isHomeDraft) {
    return (
      <div style={{ minHeight: '75vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ background: 'var(--surf)', padding: '36px', borderRadius: '24px', border: '1px solid var(--line)', maxWidth: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: '40px', display: 'block', marginBottom: '14px' }}>🚧</span>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--txt1)' }}>Home Page in Draft Mode</h2>
          <p style={{ fontSize: '14px', color: 'var(--txt2)', margin: '0 0 24px 0', lineHeight: 1.5 }}>
            The public home page is currently set to <b>Draft (Unpublished)</b> status by the site administrator.
          </p>
          <Link href="/admin/pages" className="btn btn-p btn-s" style={{ borderRadius: '10px' }}>
            Go to Admin Pages Manager →
          </Link>
        </div>
      </div>
    );
  }

  const getSection = (key: string) => sections.find((s) => s.key === key);

  const heroSec = getSection('hero');
  const shortageSec = getSection('shortage_strip');
  const whatWeDoSec = getSection('what_we_do');
  const chartSec = getSection('yearly_chart');
  const whereWeAreSec = getSection('where_we_are');
  const newsSec = getSection('announcements');
  const problemSec = getSection('systemic_challenge');
  const closingSec = getSection('closing_band');

  return (
    <div className="home-container">
      {/* Render sections in the sequence specified by admin sections array */}
      {sections
        .filter((s) => s.live)
        .map((sec) => {
          if (sec.key === 'hero') {
            const cfg = heroSec?.config || EXACT_HOMEPAGE_SECTIONS[0].config;
            return (
              <header key={sec.id} className="hero-pro">
                <div className="wrap">
                  <div className="hero-grid">
                    <div className="hero-content">
                      <div className="eyebrow-badge">
                        <span className="dot-pulse" />
                        <span>{cfg.eyebrowBadge}</span>
                      </div>

                      <h1 className="hero-title">
                        {cfg.headlinePart1}<br />
                        We keep the <span className="highlight-text">{cfg.headlineHighlight}</span>.
                      </h1>

                      <p className="hero-desc">{cfg.subheadline}</p>

                      <div className="hero-actions">
                        <Link href={cfg.primaryBtnLink || '/join/requester'} className="btn btn-primary-glow">
                          <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/></svg>
                          {cfg.primaryBtnText}
                        </Link>
                        <Link href={cfg.secondaryBtnLink || '/join/donor'} className="btn btn-hero-secondary">
                          <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>
                          {cfg.secondaryBtnText}
                        </Link>
                      </div>

                      <div className="hero-metrics-grid">
                        <div className="metric-card">
                          <span className="m-val text-red">{cfg.metric1Val}</span>
                          <span className="m-lbl">{cfg.metric1Lbl}</span>
                        </div>
                        <div className="metric-card">
                          <span className="m-val">{cfg.metric2Val}</span>
                          <span className="m-lbl">{cfg.metric2Lbl}</span>
                        </div>
                        <div className="metric-card">
                          <span className="m-val">{cfg.metric3Val}</span>
                          <span className="m-lbl">{cfg.metric3Lbl}</span>
                        </div>
                        <div className="metric-card">
                          <span className="m-val">{cfg.metric4Val}</span>
                          <span className="m-lbl">{cfg.metric4Lbl}</span>
                        </div>
                      </div>
                    </div>

                    <div className="hero-visual">
                      <div className="visual-card-frame">
                        <ImageSlot
                          ratio="4/3.6"
                          style="border-radius:20px; width:100%; height:100%; object-fit:cover;"
                          src={cfg.heroImage || IMG.heroDonation}
                          placeholder="Hero image - blood donation in Quetta"
                        />
                        <div className="floating-live-tag">
                          <span className="pulse-green" />
                          <div>
                            <strong>{cfg.branchTagTitle}</strong>
                            <small>{cfg.branchTagSubtitle}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </header>
            );
          }

          if (sec.key === 'shortage_strip') {
            const cfg = shortageSec?.config || EXACT_HOMEPAGE_SECTIONS[1].config;
            return (
              <div key={sec.id} className="wrap margin-top-subtle">
                <div className="stock-panel-pro">
                  <div className="stock-header">
                    <div>
                      <span className="section-label">{cfg.label}</span>
                      <div className="stock-title">{cfg.title}</div>
                    </div>
                    <span className="live-status-pill">
                      <span className="dot-green" /> {cfg.updatedText}
                    </span>
                  </div>

                  <div className="stock-groups-grid">
                    {STOCK.map(([g, c, s]) => (
                      <div key={g} className={`stock-card stock-${c}`}>
                        <span className="group-name">{g}</span>
                        <span className="group-status">{s}</span>
                      </div>
                    ))}
                  </div>

                  <div className="stock-footer-note">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>{cfg.footerNote}</span>
                    <Link href={cfg.linkUrl || '/join/donor'} className="link-arrow">{cfg.linkText}</Link>
                  </div>
                </div>
              </div>
            );
          }

          if (sec.key === 'what_we_do') {
            const cfg = whatWeDoSec?.config || EXACT_HOMEPAGE_SECTIONS[2].config;
            return (
              <section key={sec.id} className="section-block">
                <div className="wrap">
                  <div className="section-header-center">
                    <span className="section-label">{cfg.label}</span>
                    <h2 className="section-heading">{cfg.heading}</h2>
                    <p className="section-lead">{cfg.lead}</p>
                  </div>

                  <div className="pillars-grid">
                    <div className="pillar-card pillar-rose">
                      <div className="pillar-icon-wrapper">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" /><path d="M12 9v4M12 17h.01" strokeWidth="2.5" /></svg>
                      </div>
                      <h3 className="pillar-title">{cfg.p1Title}</h3>
                      <p className="pillar-desc">{cfg.p1Desc}</p>
                    </div>

                    <div className="pillar-card pillar-amber">
                      <div className="pillar-icon-wrapper">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                      </div>
                      <h3 className="pillar-title">{cfg.p2Title}</h3>
                      <p className="pillar-desc">{cfg.p2Desc}</p>
                    </div>

                    <div className="pillar-card pillar-emerald">
                      <div className="pillar-icon-wrapper">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="15" height="11" rx="2" /><polygon points="16 8 20 11 20 17 16 17 16 8" /><circle cx="5.5" cy="17.5" r="2.5" /><circle cx="16.5" cy="17.5" r="2.5" /><line x1="8" y1="9" x2="8" y2="13" /><line x1="6" y1="11" x2="10" y2="11" /></svg>
                      </div>
                      <h3 className="pillar-title">{cfg.p3Title}</h3>
                      <p className="pillar-desc">{cfg.p3Desc}</p>
                    </div>

                    <div className="pillar-card pillar-indigo">
                      <div className="pillar-icon-wrapper">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="M12 8v4M12 16h.01" /></svg>
                      </div>
                      <h3 className="pillar-title">{cfg.p4Title}</h3>
                      <p className="pillar-desc">{cfg.p4Desc}</p>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          if (sec.key === 'yearly_chart') {
            const cfg = chartSec?.config || EXACT_HOMEPAGE_SECTIONS[3].config;
            return (
              <section key={sec.id} className="section-block dark-record-section">
                <div className="wrap">
                  <div className="section-header">
                    <span className="section-label text-red-glow">{cfg.label}</span>
                    <h2 className="section-heading text-white">{cfg.heading}</h2>
                    <p className="section-lead text-muted-light">{cfg.lead}</p>
                  </div>

                  <div className="chart-wrapper-pro">
                    <div className="chart">
                      {CHART.map(([y, b, h]) => (
                        <div key={y} className={`bar ${y === 2011 ? 'pk' : ''}`} style={{ height: `${h}%` }}>
                          <span className="chart-tooltip">{y} · {b.toLocaleString()} bags</span>
                        </div>
                      ))}
                    </div>
                    <div className="axis">
                      <span>1999 (Earliest digitized year)</span>
                      <span className="peak-indicator">{cfg.peakText}</span>
                      <span>June 2012</span>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          if (sec.key === 'where_we_are') {
            const cfg = whereWeAreSec?.config || EXACT_HOMEPAGE_SECTIONS[4].config;
            return (
              <section key={sec.id} className="section-block">
                <div className="wrap">
                  <div className="where-we-are-card">
                    <div className="where-content">
                      <span className="section-label">{cfg.label}</span>
                      <h2 className="section-heading">{cfg.heading}</h2>
                      <p className="section-lead">{cfg.lead}</p>

                      <div className="branch-features">
                        <div className="feat-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#E02B20" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          <span>{cfg.feat1}</span>
                        </div>
                        <div className="feat-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#E02B20" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          <span>{cfg.feat2}</span>
                        </div>
                      </div>

                      <Link href={cfg.btnLink || '/branches'} className="btn btn-outline-dark">
                        {cfg.btnText}
                      </Link>
                    </div>

                    <div className="where-map-wrapper">
                      <ImageSlot ratio="4/3" style="border-radius:18px; width:100%; height:100%; object-fit:cover;" src={IMG.landscape} placeholder="Map of Balochistan coverage area" />
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          if (sec.key === 'announcements') {
            const cfg = newsSec?.config || EXACT_HOMEPAGE_SECTIONS[5].config;
            const items = [
              { tag: cfg.item1Tag, date: cfg.item1Date, title: cfg.item1Title, desc: cfg.item1Desc, color: 'no' },
              { tag: cfg.item2Tag, date: cfg.item2Date, title: cfg.item2Title, desc: cfg.item2Desc, color: 'gy' },
              { tag: cfg.item3Tag, date: cfg.item3Date, title: cfg.item3Title, desc: cfg.item3Desc, color: 'ok' },
            ];

            return (
              <section key={sec.id} className="section-block padding-top-zero">
                <div className="wrap">
                  <div className="section-header-flex">
                    <div>
                      <span className="section-label">{cfg.label}</span>
                      <h2 className="section-heading">{cfg.heading}</h2>
                    </div>
                    <Link href="/news" className="btn btn-outline-dark btn-sm">All Announcements →</Link>
                  </div>

                  <div className="news-grid">
                    {items.map((item, i) => (
                      <div key={item.title} className="news-card">
                        <div className="news-img-container">
                          <ImageSlot ratio="16/9.5" style="border-radius:14px; width:100%; height:100%; object-fit:cover;" src={NEWS_COVERS[i % NEWS_COVERS.length]} placeholder="Announcement cover image" />
                        </div>
                        <div className="news-body">
                          <div className="news-meta">
                            <span className={`tag tag-${item.color}`}>{item.tag}</span>
                            <span className="news-date">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                              </svg>
                              {item.date}
                            </span>
                          </div>
                          <h3 className="news-title">{item.title}</h3>
                          <p className="news-excerpt">{item.desc}</p>

                          <div className="news-footer">
                            <Link href="/news" className="read-more-link">
                              View Announcement
                              <svg className="link-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                              </svg>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          if (sec.key === 'systemic_challenge') {
            const cfg = problemSec?.config || EXACT_HOMEPAGE_SECTIONS[6].config;
            return (
              <section key={sec.id} className="section-block padding-top-zero">
                <div className="wrap">
                  <div className="problem-container-pro">
                    <div className="problem-left">
                      <span className="section-label text-red-glow">{cfg.label}</span>
                      <h2 className="section-heading text-white">{cfg.heading}</h2>
                      <p className="section-lead text-muted-light">{cfg.lead}</p>
                      <Link href={cfg.btnLink || '/problem'} className="btn btn-primary-glow margin-top-sm">
                        {cfg.btnText}
                      </Link>
                    </div>

                    <div className="problem-right-stats">
                      <div className="prob-stat-box">
                        <span className="stat-num text-red">{cfg.stat1Val}</span>
                        <span className="stat-desc">{cfg.stat1Lbl}</span>
                      </div>
                      <div className="prob-stat-box">
                        <span className="stat-num">{cfg.stat2Val}</span>
                        <span className="stat-desc">{cfg.stat2Lbl}</span>
                      </div>
                      <div className="prob-stat-box">
                        <span className="stat-num">{cfg.stat3Val}</span>
                        <span className="stat-desc">{cfg.stat3Lbl}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          if (sec.key === 'closing_band') {
            const cfg = closingSec?.config || EXACT_HOMEPAGE_SECTIONS[7].config;
            return (
              <div key={sec.id} className="wrap margin-bottom-lg">
                <div className="cta-banner-pro">
                  <div className="cta-content">
                    <div className="cta-icon-bg">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="cta-title">{cfg.title}</h2>
                      <p className="cta-desc">{cfg.desc}</p>
                    </div>
                  </div>
                  <Link href={cfg.btnLink || '/join'} className="btn btn-white-pill">
                    {cfg.btnText}
                  </Link>
                </div>
              </div>
            );
          }

          return null;
        })}
    </div>
  );
}
