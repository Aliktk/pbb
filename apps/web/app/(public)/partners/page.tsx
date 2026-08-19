import Link from 'next/link';

const PARTNERKINDS: [string, string, string, string][] = [
  [
    'Hospitals',
    'Refer patients, get a named coordinator at the nearest branch, and a direct line for emergencies. Your requests go straight onto the branch board instead of through a switchboard.',
    'M12 4v16m8-8H4',
    'hospital',
  ],
  [
    'Laboratories',
    'Share screening capacity, or take our overflow. Results are recorded against the bag, so a unit can be traced from donor to patient.',
    'M9 2v7L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3L15 9V2M9 2h6M8 15h8',
    'lab',
  ],
  [
    'Foundations & Donors',
    'Fund screening kits, an ambulance, or a year of transfusions for a named child. You receive exact figures and audit logs, not a generic thank-you letter.',
    'M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z',
    'donor',
  ],
  [
    'Welfare Societies',
    'Run a camp under our name, collect hides at Eid, or open a branch in a town that has none. Eight towns are served today without a permanent office.',
    'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
    'welfare',
  ],
  [
    'Universities & Colleges',
    'Two-day drives on campus register more first-time voluntary donors than anything else we do. We bring the medical staff and screening equipment.',
    'M22 10 12 5 2 10l10 5 10-5ZM6 12v5c3 3 9 3 12 0v-5',
    'edu',
  ],
  [
    'Other Blood Banks',
    'Nobody can see anyone else’s shelf. If your bank keeps a register too, we would rather share a shortage than discard a screened bag.',
    'M8 7h8M8 12h8M8 17h5M4 3h16v18H4z',
    'bank',
  ],
];

const WHAT_YOU_GET: string[] = [
  'A named coordinator at your nearest branch',
  'A direct helpline, avoiding administrative switchboards',
  'Your requests published on the branch board within seconds',
  'Quarterly figures on what was supplied and to whom',
  'Your logo and institution profile on the supporters page',
];

const WHAT_WE_ASK: string[] = [
  'One designated coordinator we can reach at any hour',
  'Honest, verified figures on your patient requirements',
  'Prior notice before planned surgeries, where possible',
  'Zero commercial sale of blood, ever, under any arrangement',
];

export default function Partners() {
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
              <path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6h6v6"/>
            </svg>
          </div>
          <div className="side-badge-text">
            <span className="side-badge-val">Institutional Network</span>
            <span className="side-badge-lbl">Direct Branch Line</span>
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
            <span className="side-badge-val">0 PKR Commercial Sale</span>
            <span className="side-badge-lbl">100% Non-Profit</span>
          </div>
        </div>

        <div className="wrap">
          <div className="join-hero-content">
            <div className="problem-pill-tag" style={{ margin: '0 auto 16px' }}>
              <span className="animated-filled-circle" />
              <span>Work With Us</span>
            </div>

            <h1 className="join-hero-title">
              Six ways an organisation<br />
              <span className="highlight-text-red">can drive real impact.</span>
            </h1>

            <p className="join-hero-desc">
              A blood bank that only talks to individuals stays small. Most of what Pashtoonkhwa Blood Bank can achieve next depends on institutions.
            </p>

            {/* Emergency Hotline Floating Glass Bar */}
            <div className="hero-emergency-bar">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>Want to partner? Call our coordination desk at <a href="tel:0812836820">081-2836820</a> — Head Office</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <section className="section-block-pro">
        <div className="wrap">
          <div className="section-header-pill">
            <span className="dot-pulse-red" />
            <span>INSTITUTIONAL PARTNERSHIP CATEGORIES</span>
          </div>

          {/* 6-Card Pillars Grid */}
          <div className="partner-pillars-grid-pro">
            {PARTNERKINDS.map((k) => (
              <div key={k[0]} className={`partner-pillar-card ${k[3]}`}>
                <div className="p-pillar-header">
                  <div className="p-pillar-icon-ring">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={k[2]} />
                    </svg>
                  </div>
                  <span className="p-pillar-badge">PARTNER</span>
                </div>
                <h3 className="p-pillar-title">{k[0]}</h3>
                <p className="p-pillar-desc">{k[1]}</p>
              </div>
            ))}
          </div>

          {/* Expectations Split Section */}
          <div className="partner-expectations-grid">
            {/* Card 1: What You Get */}
            <div className="expectation-card-pro get">
              <div className="exp-card-header">
                <div className="exp-icon-box green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div>
                  <h3 className="exp-card-title">What Your Institution Gets</h3>
                  <span className="exp-card-sub">PBB GUARANTEES</span>
                </div>
              </div>

              <div className="exp-list">
                {WHAT_YOU_GET.map((x) => (
                  <div key={x} className="exp-item green">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>{x}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: What We Ask */}
            <div className="expectation-card-pro ask">
              <div className="exp-card-header">
                <div className="exp-icon-box red">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="exp-card-title">What We Ask From You</h3>
                  <span className="exp-card-sub">ETHICAL COMMITMENT</span>
                </div>
              </div>

              <div className="exp-list">
                {WHAT_WE_ASK.map((x) => (
                  <div key={x} className="exp-item red">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>{x}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Partnership CTA Banner */}
          <div className="sponsor-impact-card" style={{ marginTop: '40px' }}>
            <span className="sponsor-badge-pill">REGISTER YOUR ORGANISATION</span>
            <h2 className="sponsor-title">Start the conversation today</h2>
            <p className="sponsor-desc">
              Tell us what kind of organisation you are and what you are hoping to achieve together. Our central coordination team replies within a few business days.
            </p>
            <div className="sponsor-action-row">
              <Link href="/join/partner" className="btn-crimson-pill">
                Register Your Organisation →
              </Link>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

