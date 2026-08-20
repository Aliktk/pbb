import Link from 'next/link';
import { ImageSlot } from '../../../components/ImageSlot';
import { IMG } from '../../../lib/images';

const SCREEN_CHIPS: string[] = ['Hepatitis B', 'Hepatitis C', 'HIV / AIDS', 'MP (Malaria)', 'ELISA Method'];

const SPECIAL_SERVICES = [
  {
    title: '24/7 Ambulance Fleet',
    desc: 'Three emergency vehicles running out of Quetta twenty-four hours a day for anyone in critical need. Branch fleets expanding.',
    tag: '24/7 Fleet',
    type: 'ambulance',
    feature: 'Available 24 Hours a Day',
  },
  {
    title: 'Hepatitis B Child Vaccination',
    desc: 'Garbage-picking and scavenger children are vaccinated against Hepatitis B at zero cost to safeguard vulnerable youth.',
    tag: 'Free Care',
    type: 'vaccine',
    feature: 'Zero Cost Pediatric Vaccination',
  },
  {
    title: 'Disaster & Emergency Response',
    desc: 'Immediate emergency blood supply for earthquake victims (Abbottabad 2005, Ziarat 2008), bomb blast victims and trauma crises.',
    tag: 'Rapid Relief',
    type: 'disaster',
    feature: 'Rapid Emergency Relief Unit',
  },
];

const DONOR_CRITERIA = [
  { num: '18–60', unit: 'Years Old', desc: 'Legal donor age bracket' },
  { num: '50 kg', unit: 'Min Weight', desc: 'Required minimum body weight' },
  { num: '90 Days', unit: 'Interval', desc: 'Since your previous donation' },
  { num: 'Good Health', unit: 'Medical Fit', desc: 'No fever, infection or surgery' },
];

export default function Services() {
  return (
    <>
      {/* Hero Pro Banner (Split Layout with Live Medical Verification Widget) */}
      <header className="services-hero-clean">
        <div className="wrap">
          <div className="services-hero-grid">
            {/* Left Column */}
            <div className="services-hero-left">
              <div className="problem-pill-tag">
                <span className="animated-filled-circle" />
                <span>Services &amp; Medical Care</span>
              </div>

              <h1 className="services-hero-title">
                What We <span className="highlight-text-red">Offer</span>
              </h1>

              <p className="services-hero-desc">
                Blood is never purchased or sold. The only source is exchange from patient relatives and registered members — screened using state-of-the-art ELISA testing before every single transfusion.
              </p>

              {/* Luxury Service Guarantee Stack / Tiles */}
              <div className="services-guarantee-stack">
                <div className="guarantee-card-item">
                  <div className="g-icon-ring">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div className="g-card-text">
                    <span className="g-card-label">5-Point Pathogen Screening</span>
                    <span className="g-card-val">ELISA Method for Every Unit</span>
                  </div>
                </div>

                <div className="guarantee-card-item">
                  <div className="g-icon-ring">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    </svg>
                  </div>
                  <div className="g-card-text">
                    <span className="g-card-label">100% Voluntary Exchange</span>
                    <span className="g-card-val">Donated by Members &amp; Relatives</span>
                  </div>
                </div>

                <div className="guarantee-card-item">
                  <div className="g-icon-ring">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                    </svg>
                  </div>
                  <div className="g-card-text">
                    <span className="g-card-label">Zero Cost Transfusion</span>
                    <span className="g-card-val">Free Blood for 200+ Thalassemia Kids</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Medical Dashboard Card Widget */}
            <div className="services-hero-right">
              <div className="services-hero-widget">
                <div className="s-widget-header">
                  <div className="s-widget-status">
                    <span className="dot-pulse-red" />
                    <span>5-POINT ELISA VERIFIED</span>
                  </div>
                  <span className="s-widget-badge">ACTIVE 24/7</span>
                </div>

                <div className="s-widget-metrics">
                  <div className="s-metric-box">
                    <span className="s-metric-val">100%</span>
                    <span className="s-metric-lbl">Safety Screened</span>
                    <span className="s-metric-sub">Hep B, Hep C, HIV, MP &amp; ELISA</span>
                  </div>

                  <div className="s-metric-divider" />

                  <div className="s-metric-box">
                    <span className="s-metric-val highlight">0 PKR</span>
                    <span className="s-metric-lbl">Commercial Fee</span>
                    <span className="s-metric-sub">Strictly non-profit since 1996</span>
                  </div>
                </div>

                <div className="s-widget-footer">
                  <div className="s-widget-check-pill">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>Emergency Blood Exchange &amp; 24-Hour Fleet</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <section className="section-block-pro">
        <div className="wrap">
          {/* Asymmetric Core Models Grid */}
          <div className="section-header-pill">
            <span className="dot-pulse-red" />
            <span>PRIMARY TRANSFUSION MODELS</span>
          </div>

          <div className="core-models-grid">
            {/* Model 1: On Exchange */}
            <div className="model-card-exchange">
              <div className="model-card-top">
                <span className="model-pill-badge red">ON EXCHANGE</span>
                <div className="model-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 3h5v5"/>
                    <path d="M4 20L21 3"/>
                    <path d="M21 16v5h-5"/>
                    <path d="M15 15l6 6"/>
                    <path d="M4 4l5 5"/>
                  </svg>
                </div>
              </div>
              <h3 className="model-title">Screened Blood for Any Patient</h3>
              <p className="model-desc">
                Every unit of blood undergoes 5-point pathogen screening before it reaches a patient. A relative of the patient or a registered member provides matching blood in exchange.
              </p>
              <div className="screening-chips-title">Mandatory 5-Point Screening Tests:</div>
              <div className="screening-chips-row">
                {SCREEN_CHIPS.map((chip) => (
                  <span key={chip} className="screening-chip-item">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            {/* Model 2: 100% Free & No Exchange */}
            <div className="model-card-free">
              <div className="model-card-top">
                <span className="model-pill-badge emerald">FREE · NO EXCHANGE REQUIRED</span>
                <div className="model-icon-box emerald">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                </div>
              </div>
              <h3 className="model-title text-emerald">Thalassemia, Pregnancy, Emergency &amp; Disasters</h3>
              <p className="model-desc">
                In these four vital humanitarian cases, blood is provided 100% free of cost and without any exchange requirement. This strict policy has been honored without exception since 1996.
              </p>
              <div className="free-highlights-row">
                <span className="free-highlight-pill">200 Registered Thalassemia Kids</span>
                <span className="free-highlight-pill">Maternal Care</span>
                <span className="free-highlight-pill">Disaster Response</span>
              </div>
            </div>
          </div>

          {/* Specialized Services Grid */}
          <div className="section-header-pill" style={{ marginTop: '56px' }}>
            <span className="dot-pulse-red" />
            <span>SPECIALIZED WELFARE &amp; EMERGENCY SERVICES</span>
          </div>

          <div className="special-services-grid">
            {SPECIAL_SERVICES.map((s) => (
              <div key={s.title} className="special-service-card">
                <div className="s-card-header">
                  <div className="s-card-icon-ring">
                    {s.type === 'ambulance' ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.05 10.9 2 11.2 2 11.5V16c0 .6.4 1 1 1h2"/>
                        <circle cx="7" cy="17" r="2"/>
                        <circle cx="17" cy="17" r="2"/>
                      </svg>
                    ) : s.type === 'vaccine' ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="m18 2 4 4"/>
                        <path d="m17 7 3-3"/>
                        <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/>
                        <path d="m9 11 4 4"/>
                        <path d="m5 19-3 3"/>
                        <path d="m14 4 6 6"/>
                      </svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                    )}
                  </div>
                  <span className="s-card-tag">{s.tag}</span>
                </div>
                <h3 className="s-card-title">{s.title}</h3>
                <p className="s-card-desc">{s.desc}</p>
                <div className="s-card-footer">
                  <span className="s-card-feature-pill">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    {s.feature}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Donor Criteria Showcase Container */}
          <div className="extended-towns-card" style={{ marginTop: '56px' }}>
            <div className="section-header-pill" style={{ marginBottom: '14px' }}>
              <span className="dot-pulse-red" />
              <span>DONOR ELIGIBILITY REQUIREMENTS</span>
            </div>

            <h2 className="criteria-heading">Who Can Donate Blood</h2>
            <p className="criteria-subheading">If all four conditions are met, you are eligible to give blood and save a life today.</p>

            <div className="criteria-grid-pro">
              {DONOR_CRITERIA.map((c) => (
                <div key={c.unit} className="criteria-card-pro">
                  <div className="c-card-num">{c.num}</div>
                  <div className="c-card-unit">{c.unit}</div>
                  <div className="c-card-desc">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Closer CTA Banner */}
          <div className="closer-card-pro" style={{ marginTop: '40px', marginBottom: '0px' }}>
            <div className="closer-content">
              <span className="closer-tag-white">Donor Eligibility Checker</span>
              <h2 className="closer-title">Not sure if you can give?</h2>
              <p className="closer-desc">
                Register anyway. Our automated eligibility engine checks your details step-by-step and notifies you when you become eligible to donate.
              </p>
            </div>
            <Link href="/join/donor" className="btn-white-pill">
              Register as a Donor
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

