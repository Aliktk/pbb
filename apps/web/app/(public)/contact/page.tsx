import Link from 'next/link';
import { ImageSlot } from '../../../components/ImageSlot';
import { ContactForm } from '../../../components/ContactForm';
import { IMG } from '../../../lib/images';

export default function Contact() {
  return (
    <>
      {/* Breathtaking Centered Hero Header */}
      <header className="join-hero-centered">
        <div className="hero-grid-pattern" />

        {/* Left Floating Side Badge */}
        <div className="hero-side-badge left">
          <div className="side-badge-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div className="side-badge-text">
            <span className="side-badge-val">Quetta Central HQ</span>
            <span className="side-badge-lbl">Open 24 Hours</span>
          </div>
        </div>

        {/* Right Floating Side Badge */}
        <div className="hero-side-badge right">
          <div className="side-badge-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <div className="side-badge-text">
            <span className="side-badge-val">Direct Helplines</span>
            <span className="side-badge-lbl">Instant Response</span>
          </div>
        </div>

        <div className="wrap">
          <div className="join-hero-content">
            <div className="problem-pill-tag" style={{ margin: '0 auto 16px' }}>
              <span className="animated-filled-circle" />
              <span>Talk to Our Central Dispatch</span>
            </div>

            <h1 className="join-hero-title">
              We are here to help 24/7.<br />
              <span className="highlight-text-red">Get in touch with PBB.</span>
            </h1>

            <p className="join-hero-desc">
              Have a question about emergency blood supply, voluntary donation drives, or hospital partnerships? Reach out directly or send us a message below.
            </p>

            {/* Emergency Hotline Floating Glass Bar */}
            <div className="hero-emergency-bar">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>Emergency 24-Hour Dispatch Lines: <a href="tel:0812836820">081-2836820</a> &amp; <a href="tel:0812839500">081-2839500</a></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <section className="section-block-pro">
        <div className="wrap">
          {/* 3 Equal-Height Quick Action Cards with Distinct Luxury Themes */}
          <div className="contact-cards-grid">
            {/* Card 1: Red Crimson Theme */}
            <div className="contact-action-card theme-red">
              <div>
                <div className="contact-card-top-row">
                  <div className="contact-card-icon red">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <span className="contact-card-badge red">INSTANT DISPATCH</span>
                </div>
                <h3 className="contact-card-title">Emergency Helplines</h3>
                <div className="contact-card-phones">
                  <a href="tel:0812836820" className="contact-phone-link">081-2836820</a>
                  <a href="tel:0812839500" className="contact-phone-link">081-2839500</a>
                </div>
              </div>
              <p className="contact-card-sub">Available 24 hours a day, 7 days a week.</p>
            </div>

            {/* Card 2: Dark Navy Slate Theme */}
            <div className="contact-action-card theme-dark">
              <div>
                <div className="contact-card-top-row">
                  <div className="contact-card-icon slate">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <span className="contact-card-badge slate">CENTRAL CONTROL</span>
                </div>
                <h3 className="contact-card-title">Quetta Head Office</h3>
                <p className="contact-card-address">
                  Zainab Chamber, Shara-e-Adalat,<br />
                  near Quetta Press Club, Quetta, Balochistan
                </p>
              </div>
              <a href="mailto:admin@pashtoonkhwabloodbank.org" className="contact-email-link">
                admin@pashtoonkhwabloodbank.org
              </a>
            </div>

            {/* Card 3: Royal Blue Theme */}
            <div className="contact-action-card theme-blue">
              <div>
                <div className="contact-card-top-row">
                  <div className="contact-card-icon blue">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <span className="contact-card-badge blue">EXECUTIVE DIRECTORY</span>
                </div>
                <h3 className="contact-card-title">Key Staff Desks</h3>
                <div className="contact-staff-list">
                  <div className="staff-item">
                    <span className="staff-role">Central Organizer</span>
                    <div className="staff-detail">
                      <span className="staff-name">Olus Yar</span>
                      <a href="tel:03003815590" className="staff-phone">0300-3815590</a>
                    </div>
                  </div>
                  <div className="staff-item">
                    <span className="staff-role">Web &amp; IT Administrator</span>
                    <div className="staff-detail">
                      <a href="tel:03327828121" className="staff-phone">0332-7828121</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Perfectly Aligned 2-Column Portal */}
          <div className="contact-main-split">
            {/* Left Column: Map & Location Card */}
            <div className="contact-info-column">
              <div className="contact-directory-card">
                <div className="contact-form-header">
                  <div className="directory-header">
                    <span className="dot-pulse-red" />
                    <h3 className="contact-form-title">Head Office Location</h3>
                  </div>
                  <p className="contact-form-sub">
                    Walk-ins are welcomed 24 hours a day beside Quetta Press Club.
                  </p>
                </div>

                {/* Map Image Frame Aligned directly beside form input grid */}
                <div className="contact-map-frame">
                  <ImageSlot ratio="16/10" src={IMG.landscape} style="border-radius:20px;height:100%" />
                  <div className="map-glass-overlay">
                    <span className="map-badge">📍 Shara-e-Adalat, Quetta</span>
                    <a
                      href="https://maps.google.com/?q=Quetta+Press+Club"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-map-link"
                    >
                      Open in Google Maps ↗
                    </a>
                  </div>
                </div>

                <div className="contact-commitment-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <p>
                    <strong>Response Guarantee:</strong> Emergency blood dispatches are coordinated within 90 seconds of receiving a verified request.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="contact-form-column">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

