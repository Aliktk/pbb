import Link from 'next/link';

// The problem - ported from the prototype (pbb-pages.js PAGES.problem). Data arrays mirror the source.
// Each gap is [title, body, svgPath].
const GAPS: [string, string, string][] = [
  ['Poor research and data', 'Almost nothing is measured. Without records of who gives, who needs and where the shortages fall, every decision is a guess.', 'M3 3v18h18M7 15l4-4 3 3 5-6'],
  ['No national blood group database', 'There is no register a hospital can search. Finding an O− donor at two in the morning still means phoning down a list somebody wrote by hand.', 'M4 7h16M4 12h16M4 17h10'],
  ['Very little voluntary donation', 'Most blood is given by a relative under pressure on the day. Regular, voluntary donors - the people a blood bank can rely on - are rare.', 'M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z'],
  ['Blood-consumptive disorders', 'Thalassemia, haemophilia and the rest need transfusion every few weeks for life. Two hundred children depend on PBB alone.', 'M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8Z'],
  ['Prescribing habits', 'Whole blood is often ordered where a single component would do, and transfusion is sometimes prescribed where it is not needed at all.', 'M9 2h6v4h4v6h-4v10H9V12H5V6h4V2Z'],
  ['Blood bank capacity', 'Screening equipment, cold storage and trained staff are concentrated in a few cities. Smaller towns work with far less.', 'M6 3h12v6l-3 3 3 3v6H6v-6l3-3-3-3V3Z'],
  ['Blood discarded', 'Bags expire on a shelf in one town while a patient waits in the next. Nobody can see both at once.', 'M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13'],
  ['Everything routed through the cities', 'A family in Sherani or Musakhel travels to Quetta for something that ought to be available in their own district hospital.', 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z M12 10h.01'],
  ['No respect for the donor', 'Somebody gives blood, hears nothing again, and does not come back. The single cheapest fix in the entire system.', 'M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6M12 3v12m0 0 4-4m-4 4-4-4'],
  ['Little government attention', 'Blood services are largely left to charities and welfare societies to fund and run.', 'M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6'],
  ['Everyone works alone', 'Blood banks, hospitals and welfare societies each keep their own list. None of them can see the others.', 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm14 10v-2a4 4 0 0 0-3-3.9'],
  ['Getting the donor there', 'A willing donor forty minutes away with no transport is, in practice, no donor at all.', 'M3 17V7a1 1 0 0 1 1-1h9v11M13 10h4l4 4v3h-3M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z'],
];

export default function Problem() {
  return (
    <>
      {/* Hero Pro Banner Split Screen */}
      <header className="problem-hero-pro">
        <div className="wrap">
          <div className="problem-hero-grid">
            {/* Left Content */}
            <div className="problem-hero-left">
              <div className="problem-pill-tag">
                <span className="animated-filled-circle" />
                <span>The Problem</span>
              </div>
              
              <h1 className="problem-hero-title">
                What keeps blood from<br />reaching people <span className="highlight-text-red">in time.</span>
              </h1>
              
              <p className="problem-hero-desc">
                Twelve critical gaps stand between a patient in an emergency room and a donor willing to save them. Pashtoonkhwa Blood Bank was built to bridge every single gap across Balochistan.
              </p>

              <div className="problem-hero-actions">
                <a href="#gaps-section" className="btn btn-primary-glow">
                  Explore 12 Gaps ↓
                </a>
                <Link href="/join/donor" className="btn btn-outline-dark">
                  Register as Donor
                </Link>
              </div>
            </div>

            {/* Right Visual Showcase Card */}
            <div className="problem-hero-right">
              <div className="problem-visual-card">
                <div className="visual-card-header">
                  <div className="card-status-tag">
                    <span className="dot-pulse-red" />
                    <span>Balochistan Supply Crisis</span>
                  </div>
                  <span className="live-clock">Real-time Analysis</span>
                </div>

                <div className="visual-metrics-grid">
                  <div className="v-metric-box metric-alert">
                    <span className="v-val">0</span>
                    <span className="v-lbl">National Databases</span>
                    <span className="v-sub">Manual phone lists used</span>
                  </div>

                  <div className="v-metric-box metric-ok">
                    <span className="v-val">14</span>
                    <span className="v-lbl">Districts Connected</span>
                    <span className="v-sub">Networked by PBB</span>
                  </div>

                  <div className="v-metric-box metric-purple">
                    <span className="v-val">200+</span>
                    <span className="v-lbl">Thalassemia Children</span>
                    <span className="v-sub">Lifetime care supported</span>
                  </div>

                  <div className="v-metric-box metric-gold">
                    <span className="v-val">1996</span>
                    <span className="v-lbl">Non-Stop Service</span>
                    <span className="v-sub">0 purchased bags ever</span>
                  </div>
                </div>

                <div className="visual-card-footer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>Every gap identified below is being systematically resolved by PBB branch networks.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 12 Gaps Grid */}
      <section id="gaps-section" className="section-block padding-top-zero">
        <div className="wrap">
          <div className="gap-grid-pro">
            {GAPS.map((g, i) => (
              <div key={g[0]} className="gap-card-pro">
                <div className="gap-card-top">
                  <div className="gap-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={g[2]} />
                    </svg>
                  </div>
                  <div className="gap-num-pill">Gap #{String(i + 1).padStart(2, '0')}</div>
                </div>

                <h3 className="gap-title">{g[0]}</h3>
                <p className="gap-body">{g[1]}</p>
              </div>
            ))}
          </div>

          {/* Solution Answer Banner */}
          <div className="answer-banner-pro">
            <div className="answer-content">
              <div className="answer-label-pill">
                <span className="dot-pulse-red" />
                <span>Our Solution &amp; Answer</span>
              </div>

              <h2 className="answer-heading">
                A register anyone can search,<br />kept in fourteen towns.
              </h2>

              <p className="answer-desc">
                Not a national programme — a working one. Every donor recorded, every request logged, every branch able to see who in their own town can give today. It has run since 1996 on exchange, charity and Zakat, and has never purchased a single bag.
              </p>

              <div className="answer-actions">
                <Link href="/join/donor" className="btn-white-pill">
                  Join the Register
                </Link>
                <Link href="/about" className="btn-outline-glass">
                  How It Started →
                </Link>
              </div>
            </div>

            <div className="answer-stats-side">
              <div className="a-stat-box">
                <span className="a-stat-num">1996</span>
                <span className="a-stat-txt">Founding Year in Quetta</span>
              </div>
              <div className="a-stat-box">
                <span className="a-stat-num">0</span>
                <span className="a-stat-txt">Bags Ever Purchased</span>
              </div>
              <div className="a-stat-box">
                <span className="a-stat-num">24/7</span>
                <span className="a-stat-txt">Active Emergency Hub</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

