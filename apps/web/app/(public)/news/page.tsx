'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ImageSlot } from '../../../components/ImageSlot';
import { IMG } from '../../../lib/images';

export interface AnnouncementItem {
  id: string;
  title: string;
  kind: 'Blood Camp' | 'Notice' | 'Appeal' | 'Awareness';
  date: string;
  body: string;
  image: string;
  status: 'live' | 'expired';
  location: string;
}

const DEFAULT_NEWS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Free Donation Camp & Screening, Pishin',
    kind: 'Blood Camp',
    date: '12 September',
    body: 'Band Road branch desk, 9:00 AM to 4:00 PM. Walk in, or pre-register online so our clinical team knows how many voluntary donors to prepare for.',
    image: IMG.community,
    status: 'live',
    location: 'Strip · Home · News',
  },
  {
    id: 'ann-2',
    title: 'New Quetta Central Premises — Construction Final Phase',
    kind: 'Notice',
    date: '3 September',
    body: 'Construction of the new Quetta central facility has entered its final inspection phase, adding expanded cold storage capacity for screened blood units.',
    image: IMG.building,
    status: 'live',
    location: 'Home · News',
  },
  {
    id: 'ann-3',
    title: 'Eid-ul-Adha Cattle Hide Collection Campaign',
    kind: 'Appeal',
    date: 'Runs to 20 June',
    body: 'Volunteers collect cattle hides across all branch networks. Request a dedicated collection team from your neighborhood or welfare society.',
    image: IMG.partnership,
    status: 'expired',
    location: 'Strip · News',
  },
  {
    id: 'ann-4',
    title: 'Thalassemia Patient Transfusion Schedule — September',
    kind: 'Notice',
    date: '28 August',
    body: 'Guardians of registered children can collect the updated monthly schedule from their local branch or view direct dispatch logs online.',
    image: IMG.clinician,
    status: 'live',
    location: 'News',
  },
  {
    id: 'ann-5',
    title: 'Mass Awareness Drive, Quetta University Campus',
    kind: 'Awareness',
    date: '14 August',
    body: 'Students registered as first-time voluntary donors during a two-day campus awareness campaign organized by PBB volunteers.',
    image: IMG.portraitA,
    status: 'live',
    location: 'News',
  },
  {
    id: 'ann-6',
    title: 'Emergency Ambulance & Mobile Fleet Extension',
    kind: 'Notice',
    date: '2 August',
    body: 'A third emergency transport vehicle has joined the Quetta dispatch fleet, expanding 24-hour rapid blood delivery services to highway corridors.',
    image: IMG.ambulance,
    status: 'live',
    location: 'News',
  },
];

export default function News() {
  const [items, setItems] = useState<AnnouncementItem[]>(DEFAULT_NEWS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pbb_admin_announcements');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        }
      }
    } catch {}
  }, []);

  const liveItems = items.filter((item) => item.status === 'live');
  const displayItems = liveItems.length > 0 ? liveItems : items;

  const feature = displayItems[0] || DEFAULT_NEWS[0];
  const gridItems = displayItems.slice(1);

  return (
    <>
      {/* Centered Hero Header */}
      <header className="join-hero-centered">
        <div className="hero-grid-pattern" />

        <div className="hero-side-badge left">
          <div className="side-badge-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="14 3 14 8 19 8" />
              <line x1="7" y1="13" x2="17" y2="13" />
              <line x1="7" y1="17" x2="13" y2="17" />
            </svg>
          </div>
          <div className="side-badge-text">
            <span className="side-badge-val">Ground Bulletins</span>
            <span className="side-badge-lbl">Branch Updates</span>
          </div>
        </div>

        <div className="hero-side-badge right">
          <div className="side-badge-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="side-badge-text">
            <span className="side-badge-val">24/7 Updates</span>
            <span className="side-badge-lbl">8 Regional Districts</span>
          </div>
        </div>

        <div className="wrap">
          <div className="join-hero-content">
            <div className="problem-pill-tag" style={{ margin: '0 auto 16px' }}>
              <span className="animated-filled-circle" />
              <span>Announcements &amp; Dispatches</span>
            </div>

            <h1 className="join-hero-title">
              What is happening now.<br />
              <span className="highlight-text-red">Ground bulletins &amp; updates.</span>
            </h1>

            <p className="join-hero-desc">
              Latest news, upcoming donation drives, branch announcements, and regional field bulletins across Pashtoonkhwa Blood Bank.
            </p>

            <div className="hero-emergency-bar">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>Press Desk &amp; Media Bulletins: <a href="mailto:news@pashtoonkhwabloodbank.org">news@pashtoonkhwabloodbank.org</a> — Central Office</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <section className="section-block-pro">
        <div className="wrap">
          {/* Featured Hero Article Banner */}
          {feature && (
            <div className="news-featured-card-pro">
              <div className="news-feat-grid">
                <div className="news-feat-img-box">
                  <ImageSlot src={feature.image || IMG.community} alt={feature.title} ratio="16/10" style="border-radius:24px;height:100%" />
                  <span className="news-feat-badge">FEATURED BULLETIN</span>
                </div>
                <div className="news-feat-info">
                  <div className="news-meta-row">
                    <span className="news-cat-pill red">{feature.kind}</span>
                    <span className="news-date-text">{feature.date}</span>
                    <span className="news-dot">•</span>
                    <span className="news-read-text">Announcement</span>
                  </div>

                  <h2 className="news-feat-title">{feature.title}</h2>
                  <p className="news-feat-desc">{feature.body}</p>

                  <div className="news-feat-actions">
                    <Link href="/contact" className="btn-crimson-pill">
                      Register to Attend →
                    </Link>
                    <Link href="/branches" className="btn-glass-pill">
                      Find Nearest Branch
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="section-header-pill" style={{ marginTop: '44px' }}>
            <span className="dot-pulse-red" />
            <span>RECENT DISPATCHES &amp; FIELD NOTICES</span>
          </div>

          {/* 3-Column News Article Grid */}
          <div className="news-grid-pro">
            {gridItems.map((n) => (
              <div key={n.id} className="news-card-luxury">
                <div className="news-card-img-wrapper">
                  <ImageSlot src={n.image || IMG.building} alt={n.title} ratio="16/9" style="border-radius:20px;height:100%" />
                  <span className={`news-cat-pill float ${n.kind.toLowerCase().replace(/\s+/g, '')}`}>{n.kind}</span>
                </div>

                <div className="news-card-body">
                  <div className="news-card-meta">
                    <span>{n.date}</span>
                    <span>•</span>
                    <span>3 min read</span>
                  </div>

                  <h3 className="news-card-title">{n.title}</h3>
                  <p className="news-card-desc">{n.body}</p>

                  <div className="news-card-footer">
                    <Link href="/contact" className="news-read-link">
                      <span>Read Dispatch</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Subscription Callout Banner */}
          <div className="sponsor-impact-card" style={{ marginTop: '44px' }}>
            <span className="sponsor-badge-pill">FIELD DISPATCH BULLETIN</span>
            <h2 className="sponsor-title">Stay informed on local donation camps</h2>
            <p className="sponsor-desc">
              Get official notifications regarding upcoming blood donation camps, emergency transfusion alerts, and regional branch developments delivered to your inbox.
            </p>
            <div className="sponsor-action-row">
              <Link href="/join/volunteer" className="btn-crimson-pill">
                Subscribe to Bulletin Updates →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
