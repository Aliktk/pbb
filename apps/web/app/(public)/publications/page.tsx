'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IMG_ROTATION } from '../../../lib/images';

interface PublicationItem {
  id: number;
  title: string;
  meta: string;
  category: string;
  img: string;
}

// Planned publications. These describe the printed materials the head office intends to make
// available; the actual PDF files are not published online yet, so no file sizes or download links
// are shown. Contact the office for printed copies. Real files will be attached when supplied.
const PUBS: PublicationItem[] = [
  {
    id: 1,
    title: 'Eid-ul-Adha Hide Collection Appeal',
    meta: 'Poster · Urdu',
    category: 'Appeals',
    img: IMG_ROTATION[0],
  },
  {
    id: 2,
    title: 'Who Can Donate Blood — Guidelines',
    meta: 'Poster · Urdu, Pashto',
    category: 'Awareness',
    img: IMG_ROTATION[1],
  },
  {
    id: 3,
    title: 'Thalassemia — What Parents Should Know',
    meta: 'Booklet · Urdu',
    category: 'Awareness',
    img: IMG_ROTATION[2],
  },
  {
    id: 4,
    title: 'Hepatitis B & C Vaccination Drive Guide',
    meta: 'Poster · Urdu',
    category: 'Awareness',
    img: IMG_ROTATION[3],
  },
  {
    id: 5,
    title: 'How to Organize a Voluntary Blood Camp',
    meta: 'Guide · Urdu, English',
    category: 'Guides',
    img: IMG_ROTATION[4],
  },
];

const FILTERS: string[] = ['All', 'Appeals', 'Awareness', 'Guides'];

export default function Publications() {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filteredPubs =
    activeFilter === 'All'
      ? PUBS
      : PUBS.filter((p) => p.category.toLowerCase() === activeFilter.toLowerCase());

  return (
    <>
      {/* Breathtaking Centered Hero Header */}
      <header className="join-hero-centered">
        <div className="hero-grid-pattern" />

        {/* Left Floating Side Badge */}
        <div className="hero-side-badge left">
          <div className="side-badge-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="side-badge-text">
            <span className="side-badge-val">Printed Materials</span>
            <span className="side-badge-lbl">Copies on Request</span>
          </div>
        </div>

        {/* Right Floating Side Badge */}
        <div className="hero-side-badge right">
          <div className="side-badge-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div className="side-badge-text">
            <span className="side-badge-val">Urdu &amp; Pashto</span>
            <span className="side-badge-lbl">Community Materials</span>
          </div>
        </div>

        <div className="wrap">
          <div className="join-hero-content">
            <div className="problem-pill-tag" style={{ margin: '0 auto 16px' }}>
              <span className="animated-filled-circle" />
              <span>Printed Media & Archives</span>
            </div>

            <h1 className="join-hero-title">
              Posters, appeals and official reports.<br />
              <span className="highlight-text-red">30 years of educational material.</span>
            </h1>

            <p className="join-hero-desc">
              Printed materials compiled across years of community service. Digital copies are being prepared for download; in the meantime, contact us for print-ready copies for your mosque, school, or union council.
            </p>

            {/* Emergency Hotline Floating Glass Bar */}
            <div className="hero-emergency-bar">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Need custom vector artwork or bulk printing? Contact <a href="mailto:media@pashtoonkhwabloodbank.org">media@pashtoonkhwabloodbank.org</a> — Print Desk</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <section className="section-block-pro">
        <div className="wrap">
          {/* Interactive Filter Bar */}
          <div className="gpgc-filter-bar">
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              const count =
                filter === 'All'
                  ? PUBS.length
                  : PUBS.filter((p) => p.category.toLowerCase() === filter.toLowerCase()).length;

              return (
                <button
                  key={filter}
                  type="button"
                  className={`gpgc-filter-pill ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  <span>{filter}</span>
                  <span className="gpgc-filter-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* 3-Column Publication Grid */}
          <div className="pub-grid-pro">
            {filteredPubs.map((p) => (
              <div key={p.id} className="pub-card-luxury">
                <div className="pub-artwork-box">
                  <img src={p.img} alt={p.title} className="pub-artwork-img" />
                  <div className="pub-artwork-overlay">
                    <span className="pub-cat-pill">{p.category}</span>
                  </div>
                </div>

                <div className="pub-card-body">
                  <div className="pub-meta-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span>{p.meta}</span>
                  </div>

                  <h3 className="pub-card-title">{p.title}</h3>

                  <div className="pub-card-actions">
                    <Link className="btn-glass-sm" href="/contact">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span>Contact us for copies</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Authentic Calligraphy Notice */}
          <div className="pub-guidance-notice">
            <div className="notice-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p>
              Posters are maintained at their authentic proportions without square cropping — the traditional Urdu and Pashto calligraphy <strong>is</strong> the artwork.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

