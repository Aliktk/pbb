'use client';

import { useState, useEffect } from 'react';
import { ActionButton } from '../../../components/ActionButton';
import { IMG } from '../../../lib/images';

const FILTERS: string[] = ['All', 'Blood camps', 'Awareness', 'Ambulance', 'New building', 'Eid ul Adha', 'Videos'];

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  src: string;
  isVideo?: boolean;
}

// Illustrative placeholder images (see lib/images.ts). Titles describe the kind of activity shown;
// they are not tied to a verified date or location. Real field photographs with confirmed captions
// will replace these.
const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    title: 'Mobile Donation Drive',
    category: 'Blood camps',
    src: IMG.heroDonation, // Landscape
  },
  {
    id: 2,
    title: 'Voluntary Donor Registration & Screening',
    category: 'Awareness',
    src: IMG.portraitA, // Tall Portrait
  },
  {
    id: 3,
    title: 'Emergency Medical Dispatch Unit',
    category: 'Ambulance',
    src: IMG.ambulance, // Wide Landscape
  },
  {
    id: 4,
    title: 'Blood Awareness Seminar',
    category: 'Awareness',
    src: IMG.portraitB, // Tall Portrait
  },
  {
    id: 5,
    title: 'Clinical Lab Testing & Storage',
    category: 'Blood camps',
    src: IMG.clinician, // Tall Vertical
  },
  {
    id: 6,
    title: 'Ground Operational Walkthrough',
    category: 'Videos',
    src: IMG.bloodBags, // Landscape
    isVideo: true,
  },
  {
    id: 7,
    title: 'Youth Volunteer Leadership Group',
    category: 'Awareness',
    src: IMG.portraitC, // Tall Portrait
  },
  {
    id: 8,
    title: 'Eid-ul-Adha Hide Collection Drive',
    category: 'Eid ul Adha',
    src: IMG.community, // Landscape
  },
  {
    id: 9,
    title: 'Donor Health Check & Vitals',
    category: 'Blood camps',
    src: IMG.gloves, // Medium Portrait
  },
  {
    id: 10,
    title: 'New Regional Branch Foundation',
    category: 'New building',
    src: IMG.building, // Landscape
  },
  {
    id: 11,
    title: '24/7 Dispatch Control Room Operations',
    category: 'Videos',
    src: IMG.screeningLab, // Landscape
    isVideo: true,
  },
  {
    id: 12,
    title: 'Institutional Healthcare Partnership Drive',
    category: 'Blood camps',
    src: IMG.partnership, // Landscape
  },
];

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const filteredItems =
    activeFilter === 'All'
      ? GALLERY_ITEMS
      : activeFilter === 'Videos'
      ? GALLERY_ITEMS.filter((item) => item.isVideo)
      : GALLERY_ITEMS.filter((item) => item.category.toLowerCase() === activeFilter.toLowerCase());

  // Keyboard escape handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelectedImage(null);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Breathtaking Centered Hero Header */}
      <header className="join-hero-centered">
        <div className="hero-grid-pattern" />

        <div className="hero-side-badge left">
          <div className="side-badge-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <div className="side-badge-text">
            <span className="side-badge-val">Ground Media</span>
            <span className="side-badge-lbl">Illustrative Gallery</span>
          </div>
        </div>

        <div className="hero-side-badge right">
          <div className="side-badge-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <div className="side-badge-text">
            <span className="side-badge-val">Across Balochistan</span>
            <span className="side-badge-lbl">Illustrative Placeholders</span>
          </div>
        </div>

        <div className="wrap">
          <div className="join-hero-content">
            <div className="problem-pill-tag" style={{ margin: '0 auto 16px' }}>
              <span className="animated-filled-circle" />
              <span>Media & Field Archive</span>
            </div>

            <h1 className="join-hero-title">
              A picture of the work.<br />
              <span className="highlight-text-red">Illustrative gallery.</span>
            </h1>

            <p className="join-hero-desc">
              Illustrative images showing the kind of work we do — mobile blood drives, emergency dispatch, and community camps. Real field photographs from our branches will replace these placeholders.
            </p>

            <div className="hero-emergency-bar">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
              <span>Media Inquiries &amp; Press Relations: <a href="mailto:media@pashtoonkhwabloodbank.org">media@pashtoonkhwabloodbank.org</a> — Communications Desk</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Gallery Section */}
      <section className="section-block-pro">
        <div className="wrap">
          {/* Filter Bar matching explore-gpgc */}
          <div className="gpgc-filter-bar">
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              const count =
                filter === 'All'
                  ? GALLERY_ITEMS.length
                  : filter === 'Videos'
                  ? GALLERY_ITEMS.filter((i) => i.isVideo).length
                  : GALLERY_ITEMS.filter((i) => i.category.toLowerCase() === filter.toLowerCase()).length;

              return (
                <button
                  key={filter}
                  type="button"
                  className={`gpgc-filter-pill ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setActiveFilter(filter);
                    setSelectedImage(null);
                  }}
                >
                  <span>{filter}</span>
                  <span className="gpgc-filter-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Masonry Columns Layout (Matching explore-gpgc-frontend GalleryCard.jsx) */}
          <div className="gpgc-masonry-grid">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="gpgc-gallery-card group"
                onClick={() => setSelectedImage(item)}
              >
                <img
                  src={item.src}
                  alt={item.title}
                  loading="lazy"
                  className="gpgc-card-img"
                />

                {/* Hover Gradient Overlay with Staggered Elements */}
                <div className="gpgc-card-overlay">
                  <div className="gpgc-card-content">
                    {/* Floating Expand Icon */}
                    <div className="gpgc-expand-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                      </svg>
                    </div>

                    {/* Title */}
                    <h3 className="gpgc-card-title">{item.title}</h3>

                    {/* Category Tag */}
                    <span className="gpgc-card-tag">{item.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Action Button */}
          <div style={{ textAlign: 'center', marginTop: '44px' }}>
            <ActionButton className="btn-crimson-pill" message="More media loaded from central library">
              Load More Archives ↓
            </ActionButton>
          </div>
        </div>
      </section>

      {/* Lightbox Modal (Matching explore-gpgc-frontend Gallery.jsx) */}
      {selectedImage && (
        <div className="gpgc-lightbox-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="gpgc-lightbox-container" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              className="gpgc-lightbox-close"
              onClick={() => setSelectedImage(null)}
              aria-label="Close Lightbox"
            >
              ✕
            </button>

            {/* Image Box */}
            <div className="gpgc-lightbox-img-box">
              <img src={selectedImage.src} alt={selectedImage.title} className="gpgc-lightbox-img" />
            </div>

            {/* Caption */}
            <div className="gpgc-lightbox-caption">
              <h3 className="gpgc-caption-title">{selectedImage.title}</h3>
              {selectedImage.category && (
                <span className="gpgc-caption-tag">{selectedImage.category}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}



