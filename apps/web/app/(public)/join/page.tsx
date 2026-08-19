import Link from 'next/link';

const CARDS_DATA = [
  {
    key: 'requester',
    kicker: 'NEED BLOOD',
    title: 'Request blood for a patient',
    description: 'Tell us the group, the hospital and your phone number. A coordinator calls you back immediately. In an emergency, phone 081-2836820.',
    href: '/join/requester',
    cta: 'Request Blood Now →',
    style: 'urgent',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    key: 'donor',
    kicker: 'GIVE BLOOD',
    title: 'Register as a donor',
    description: 'Join the donor register for your town. When someone nearby needs your blood group, we call. You are free to say yes or no every time.',
    href: '/join/donor',
    cta: 'Register as a Donor →',
    style: 'donor',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      </svg>
    ),
  },
  {
    key: 'volunteer',
    kicker: 'GIVE TIME',
    title: 'Volunteer with us',
    description: 'Camps, outreach, driving, or office work. Volunteers also collect cattle hides at Eid ul Adha that fund a large share of our transfusions.',
    href: '/join/volunteer',
    cta: 'Apply to Volunteer →',
    style: 'volunteer',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    key: 'partner',
    kicker: 'WORK WITH US',
    title: 'Partner organisation',
    description: 'Hospitals, laboratories and clinics that refer patients or share screening capacity and laboratory resources with our regional network.',
    href: '/join/partner',
    cta: 'Partner With Us →',
    style: 'partner',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6h6v6"/>
      </svg>
    ),
  },
  {
    key: 'organisation',
    kicker: 'BRING US TO YOUR TOWN',
    title: 'Register an organisation',
    description: 'Welfare societies and community groups who want a permanent PBB branch in their town, or want to host a blood drive under our name.',
    href: '/join/organisation',
    cta: 'Register Organisation →',
    style: 'organisation',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    key: 'donate',
    kicker: 'GIVE FINANCIAL SUPPORT',
    title: 'Donate Zakat & Funds',
    description: 'Bank transfer, Zakat, or cattle hides at Eid ul Adha. PBB has never purchased blood — your financial donations keep the lights & lab running.',
    href: '/donate',
    cta: 'How to Donate →',
    style: 'dark',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
];

export default function JoinHub() {
  return (
    <>
      {/* Hero Pro Banner (Centered Breathtaking Luxury Header with Floating Side Badges & Grid) */}
      <header className="join-hero-centered">
        {/* Background Grid Lines Overlay */}
        <div className="hero-grid-pattern" />

        {/* Left Floating Side Badge */}
        <div className="hero-side-badge left">
          <div className="side-badge-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className="side-badge-text">
            <span className="side-badge-val">24/7 Dispatch</span>
            <span className="side-badge-lbl">Emergency Response</span>
          </div>
        </div>

        {/* Right Floating Side Badge */}
        <div className="hero-side-badge right">
          <div className="side-badge-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            </svg>
          </div>
          <div className="side-badge-text">
            <span className="side-badge-val">100% Voluntary</span>
            <span className="side-badge-lbl">Community Network</span>
          </div>
        </div>

        <div className="wrap">
          <div className="join-hero-content">
            <div className="problem-pill-tag" style={{ margin: '0 auto 16px' }}>
              <span className="animated-filled-circle" />
              <span>Get Involved Hub</span>
            </div>

            <h1 className="join-hero-title">
              Everything in one place.<br />
              <span className="highlight-text-red">Five ways to save lives.</span>
            </h1>

            <p className="join-hero-desc">
              Whether you need urgent blood for a patient, want to join our voluntary donor register, offer your time as a volunteer, or bring Pashtoonkhwa Blood Bank to your town.
            </p>

            {/* Quick Micro-Pills Nav Bar */}
            <div className="hero-quick-pills">
              <a href="#join-grid" className="quick-pill-item urgent">
                <span className="q-dot red" /> Request Blood
              </a>
              <a href="#join-grid" className="quick-pill-item">
                <span className="q-dot" /> Donor Register
              </a>
              <a href="#join-grid" className="quick-pill-item">
                <span className="q-dot" /> Volunteer
              </a>
              <a href="#join-grid" className="quick-pill-item">
                <span className="q-dot" /> Hospital Partner
              </a>
              <a href="#join-grid" className="quick-pill-item">
                <span className="q-dot" /> New Branch
              </a>
              <a href="#join-grid" className="quick-pill-item">
                <span className="q-dot" /> Donate Funds
              </a>
            </div>

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

      {/* Main Section */}
      <section id="join-grid" className="section-block-pro">
        <div className="wrap">
          <div className="section-header-pill">
            <span className="dot-pulse-red" />
            <span>CHOOSE HOW YOU WANT TO GET INVOLVED</span>
          </div>

          <div className="join-hub-grid-pro">
            {CARDS_DATA.map((c) => (
              <div key={c.key} className={`join-card-luxury ${c.style}`}>
                <div className="j-card-header">
                  <div className="j-icon-ring">{c.icon}</div>
                  <span className="j-kicker-pill">{c.kicker}</span>
                </div>
                <h3 className="j-card-title">{c.title}</h3>
                <p className="j-card-desc">{c.description}</p>
                <div className="j-card-footer">
                  <Link href={c.href} className={`j-btn-pill ${c.style === 'urgent' ? 'btn-white' : 'btn-crimson'}`}>
                    {c.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Emergency Support Guidance Banner */}
          <div className="extended-towns-card" style={{ marginTop: '48px', marginBottom: '0px' }}>
            <div className="section-header-pill" style={{ marginBottom: '12px' }}>
              <span className="dot-pulse-red" />
              <span>IMMEDIATE EMERGENCY ASSISTANCE</span>
            </div>
            <h2 className="criteria-heading">Not sure which path to take?</h2>
            <p className="criteria-subheading">
              If someone is in a hospital right now, click <Link href="/join/requester" style={{ color: 'var(--red)', fontWeight: 800, textDecoration: 'underline' }}>Request Blood</Link> or call our 24/7 hotline at <a href="tel:0812836820" style={{ color: 'var(--red)', fontWeight: 800 }}>081-2836820</a>, where a coordinator answers at any hour.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}


