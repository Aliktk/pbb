import Link from 'next/link';
import { ImageSlot } from '../../../components/ImageSlot';
import { IMG } from '../../../lib/images';

const COST_CARDS = [
  { num: '12', label: 'Transfusions per Year', desc: 'Monthly life-saving transfusions' },
  { num: '100%', label: 'Free Screened Blood', desc: 'Zero cost to the family' },
  { num: '365 Days', label: 'Continuous Care', desc: 'Full annual medical coverage' },
];

export default function Thalassemia() {
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
                <span>Humanitarian Lifeline</span>
              </div>

              <h1 className="people-hero-title">
                Two hundred children,<br />
                <span className="highlight-text-red">every single month.</span>
              </h1>

              <p className="people-hero-desc">
                Registered children with Thalassemia Major receive blood transfusions 100% free of cost and without any exchange blood requirement. For a child with thalassemia, a monthly transfusion is not optional — it is the difference between a normal month and a hospital emergency.
              </p>

              {/* Badges Grid */}
              <div className="story-meta-grid">
                <div className="story-meta-card">
                  <div className="s-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                    </svg>
                  </div>
                  <div>
                    <span className="s-lbl">Monthly Patients</span>
                    <span className="s-val">200+ Children</span>
                  </div>
                </div>

                <div className="story-meta-card">
                  <div className="s-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <span className="s-lbl">Transfusion Fee</span>
                    <span className="s-val">0 PKR (100% Free)</span>
                  </div>
                </div>

                <div className="story-meta-card">
                  <div className="s-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div>
                    <span className="s-lbl">Exchange Blood</span>
                    <span className="s-val">Zero Exchange Needed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Image Frame */}
            <div className="people-hero-right">
              <div className="story-image-frame">
                <ImageSlot ratio="4/3.4" src={IMG.clinician} placeholder="Thalassemia Care &amp; Clinician Photograph" />
                <div className="story-image-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span>Consented Photographs Only · 100% Dignified Care</span>
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
            <span>ANNUAL CARE &amp; SPONSORSHIP IMPACT</span>
          </div>

          <div className="thalassemia-impact-grid">
            {/* Left: Sponsorship Impact Card */}
            <div className="sponsor-impact-card">
              <span className="sponsor-badge-pill">Annual Sponsorship</span>
              <h2 className="sponsor-title">What it costs to keep one child alive for a year</h2>
              <p className="sponsor-desc">
                Sponsorship covers 5-point ELISA screening, sterile blood bags, laboratory processing, and medical handling for a child’s full year of life-saving transfusions.
              </p>

              <div className="cost-cards-grid">
                {COST_CARDS.map((c) => (
                  <div key={c.label} className="cost-metric-card">
                    <div className="cost-num">{c.num}</div>
                    <div className="cost-label">{c.label}</div>
                    <div className="cost-desc">{c.desc}</div>
                  </div>
                ))}
              </div>

              <div className="sponsor-action-row">
                <Link href="/donate" className="btn-crimson-pill">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                  Sponsor a Child Today
                </Link>
                <span className="sponsor-subnote">Exact annual cost figures supplied by the head office.</span>
              </div>
            </div>

            {/* Right: Child Dignity & Consent Notice Card */}
            <div className="child-dignity-card">
              <div className="dignity-header">
                <div className="dignity-icon-ring">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="dignity-title">Child Privacy &amp; Consent Policy</h3>
                  <span className="dignity-sub">100% Dignified Humanitarian Standards</span>
                </div>
              </div>

              <p className="dignity-body">
                Children appear on this platform only when a signed consent form is held by the head office. A child without a signed consent form is still counted among the two hundred registered children, and receives identical free transfusions, but is never photographed or named publicly.
              </p>

              <div className="dignity-badges-list">
                <div className="dignity-badge-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Signed Consent Form Required</span>
                </div>
                <div className="dignity-badge-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Identical Medical Priority for All Children</span>
                </div>
                <div className="dignity-badge-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Zero Public Names Without Approval</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

