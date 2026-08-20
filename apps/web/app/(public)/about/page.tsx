import Link from 'next/link';
import { ImageSlot } from '../../../components/ImageSlot';
import { IMG } from '../../../lib/images';

// About / story - ported from the prototype (pbb-pages.js PAGES.about).
// Complete historical copy preserved 100%.

interface EraProps {
  y: string;
  kick?: string;
  title: string;
  body: React.ReactNode;
  figs: React.ReactNode;
  tags?: string[];
  iconType?: 'star' | 'disaster' | 'chart' | 'network' | 'heart';
  cls?: string;
}

function EraCategoryIcon({ type = 'star' }: { type?: EraProps['iconType'] }) {
  if (type === 'disaster') {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    );
  }
  if (type === 'chart') {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    );
  }
  if (type === 'network') {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    );
  }
  if (type === 'heart') {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
      </svg>
    );
  }
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

function Era({ y, kick, title, body, figs, tags, iconType = 'star', cls = '' }: EraProps) {
  return (
    <div className={`era-card-pro ${cls}`}>
      <div className="wrap">
        <div className="era-inner-grid">
          <div className="era-year-box">
            {kick ? (
              <div className="era-kick-badge">
                <EraCategoryIcon type={iconType} />
                <span>{kick}</span>
              </div>
            ) : null}
            <span className="era-year-val">{y}</span>
          </div>

          <div className="era-main-content">
            <h3 className="era-title">{title}</h3>
            <p className="era-body-text">{body}</p>
            {tags && tags.length > 0 ? (
              <div className="era-tags-row">
                {tags.map((t) => (
                  <span key={t} className="era-tag-pill">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>{t}</span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="era-stats-box">
            {figs}
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuietProps {
  lab: string;
  rows: [string, string][];
}

function Quiet({ lab, rows }: QuietProps) {
  return (
    <div className="quiet-strip-pro">
      <div className="wrap">
        <div className="quiet-inner flex-align-center">
          <div className="quiet-label-box">
            <span className="dot-pulse-red" />
            <span className="quiet-label-txt">{lab}</span>
          </div>

          <div className="quiet-years-flex">
            {rows.map(([y, b]) => (
              <div key={y} className="quiet-badge-card">
                <span className="q-year-tag">{y}</span>
                <span className="q-val-txt">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineDivider() {
  return (
    <div className="timeline-pro-divider">
      <span className="divider-line-left" />
      <span className="divider-node-gem">
        <span className="gem-inner-dot" />
      </span>
      <span className="divider-line-right" />
    </div>
  );
}

function PresentDayCard() {
  return (
    <div className="present-day-card-pro">
      <div className="wrap">
        <div className="present-day-grid">
          {/* Left Column */}
          <div className="present-day-left">
            <div className="present-day-badge">
              <span className="dot-pulse-red" />
              <span>LIVE ACTIVE IMPACT</span>
            </div>
            <span className="present-day-year">Today</span>
          </div>

          {/* Middle Content */}
          <div className="present-day-main">
            <div className="present-day-header">
              <div className="present-day-icon-ring">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
              </div>
              <h3 className="present-day-title">Two hundred children, fourteen towns, a new building</h3>
            </div>

            <p className="present-day-desc">
              PBB transfuses 200 registered thalassemia children free of cost and without exchange, and vaccinates scavenger and garbage-picking children against Hepatitis B. The new Quetta premises are in their final stage of construction.
            </p>

            <div className="present-day-tags">
              <span className="p-tag-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                200 Registered Thalassemia Kids
              </span>
              <span className="p-tag-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                Hepatitis B Child Vaccination
              </span>
              <span className="p-tag-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                New Quetta HQ Facility
              </span>
            </div>
          </div>

          {/* Right Stat Showcase */}
          <div className="present-day-stat-card">
            <div className="p-stat-badge">ACTIVE PATIENTS</div>
            <div className="p-stat-number">200</div>
            <div className="p-stat-label">Registered Thalassemia Children</div>
            <div className="p-stat-sub">14 towns served across Balochistan</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function About() {
  return (
    <>
      {/* Hero Pro Banner */}
      <header className="story-hero-pro">
        <div className="wrap">
          <div className="story-hero-grid">
            <div className="story-hero-left">
              <div className="problem-pill-tag">
                <span className="animated-filled-circle" />
                <span>Our Story &amp; History</span>
              </div>

              <h1 className="story-hero-title">
                Thirty years,<br />kept on the <span className="highlight-text-red">record.</span>
              </h1>

              <p className="story-hero-desc">
                Pashtoonkhwa Blood Bank and Welfare Society was inaugurated by the Chairman of Pashtoonkhwa Milli Awami Party, Mr. Mehmood Khan Achakzai, on 24th March 1996. It has served the people, irrespective of language, colour, religion, race and ethnicity, since its first day.
              </p>

              <div className="story-meta-grid">
                <div className="story-meta-card">
                  <div className="s-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <div>
                    <span className="s-lbl">Inaugurated</span>
                    <span className="s-val">24 March 1996</span>
                  </div>
                </div>

                <div className="story-meta-card">
                  <div className="s-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <span className="s-lbl">Headquarters</span>
                    <span className="s-val">Quetta City</span>
                  </div>
                </div>

                <div className="story-meta-card">
                  <div className="s-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6h6v6"/>
                    </svg>
                  </div>
                  <div>
                    <span className="s-lbl">Branch Network</span>
                    <span className="s-val">Six Offices</span>
                  </div>
                </div>

                <div className="story-meta-card">
                  <div className="s-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div>
                    <span className="s-lbl">Supervision</span>
                    <span className="s-val">3 Board Members</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="story-hero-right">
              <div className="story-image-frame">
                <ImageSlot ratio="4/3.4" src={IMG.building} placeholder="Archive photograph: inauguration or original premises" />
                <div className="story-image-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>Historical Quetta Headquarters</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Timeline Section */}
      <section className="timeline-section-pro">
        <Era
          y="1996"
          kick="The Beginning"
          iconType="star"
          title="Inaugurated beside the Quetta Press Club"
          body="Three members of an organising committee — Olus Yar, Mr. Faqir Khushal Khan Kasi and Dr. Hamid Khan Achakzai — began collecting and screening blood on an exchange basis. They have supervised it ever since."
          tags={['Founding Committee', 'Exchange Basis', '100% Free Screening']}
          figs={
            <div className="fig-content">
              <div className="fig-val">360</div>
              <div className="fig-key">bags in the first year</div>
              <div className="fig-sub">180,000 CCs total</div>
            </div>
          }
        />

        <TimelineDivider />

        <Quiet lab="Steady Growth" rows={[['2000', '720 bags'], ['2001', '1,080'], ['2002', '1,440'], ['2003', '2,160'], ['2004', '2,747']]} />

        <TimelineDivider />

        <Era
          y="2005"
          kick="Disaster Response"
          iconType="disaster"
          title="Abbottabad Earthquake Response"
          body="When the deadliest earthquake in the country’s history struck, PBB was among the most active blood banks supplying pure, tested blood to the victims through local organisations."
          tags={['7.6 Richter Response', 'Northern Relief', 'Pure Screened Blood']}
          figs={
            <div className="fig-content">
              <div className="fig-val">3,118</div>
              <div className="fig-key">bags transfused that year</div>
            </div>
          }
        />

        <TimelineDivider />

        <Quiet lab="Expansion" rows={[['2006', '3,968 bags'], ['2007', '4,582']]} />

        <TimelineDivider />

        <Era
          y="2008"
          kick="Disaster Response"
          iconType="disaster"
          title="Ziarat Earthquake — Ambulances, Doctors, Volunteers"
          body="PBB’s ambulance service, doctors and volunteers provided emergency services to the people of Ziarat. The same teams have since responded to terror attacks, bomb blasts and target killings across Balochistan."
          tags={['Emergency Fleet', '24/7 Mobile Medical', 'Balochistan Coverage']}
          figs={
            <div className="fig-content">
              <div className="fig-val">5,905</div>
              <div className="fig-key">bags transfused that year</div>
            </div>
          }
        />

        <TimelineDivider />

        <Quiet lab="Consolidation" rows={[['2009', '5,920 bags'], ['2010', '6,937']]} />

        <TimelineDivider />

        <Era
          y="2011"
          kick="Peak Year"
          iconType="chart"
          title="The Busiest Twelve Months on Record"
          body="Nearly ten thousand bags transfused in a single year, and the first year platelets and fresh frozen plasma were counted separately."
          tags={['Record Volume', 'Platelets & FFP Separation', '4.7M CCs Screened']}
          figs={
            <div className="fig-content">
              <div className="fig-val text-red">9,484</div>
              <div className="fig-key">bags · 4,742,000 CCs</div>
              <div className="fig-sub">1,670 platelet + FFP</div>
            </div>
          }
        />

        <TimelineDivider />

        <Era
          y="2012"
          kick="The Network"
          iconType="network"
          title="Six Towns, Three Ambulances"
          body="The network reached Loralai, Muslim Bagh, Pishin, Zhob and Chaman. Three ambulances began running twenty-four hours a day out of Quetta, with the rest of the branches to follow."
          tags={['6 Regional Offices', '3 Ambulance Fleets', '24-Hour Operations']}
          figs={
            <div className="fig-content">
              <div className="fig-val">5,120</div>
              <div className="fig-key">bags to June 2012</div>
              <div className="fig-sub">Published figures end here</div>
            </div>
          }
        />

        <TimelineDivider />

        <PresentDayCard />

        <TimelineDivider />

        {/* Closer Section */}
        <div className="wrap">
          <div className="closer-card-pro">
            <div className="closer-content">
              <span className="closer-tag-white">Continuity of Mission</span>
              <h2 className="closer-title">The record continues.</h2>
              <p className="closer-desc">
                Funded entirely by members’ contributions, charity, Zakat, and cattle hides collected by volunteers each Eid ul Adha.
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

