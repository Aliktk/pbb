import { ReactNode } from 'react';
import { ImageSlot } from '../../../components/ImageSlot';
import { IMG } from '../../../lib/images';

// Rotate portraits by call order; real, consented staff photos replace these later (constraint #5).
const PORTRAITS = [IMG.portraitA, IMG.portraitB, IMG.portraitC] as const;

interface PersonProps {
  i: number;
  n: string;
  r: string;
  d: string;
  phone?: string;
  extraTag?: string;
}

function PersonCard({ i, n, r, d, phone, extraTag }: PersonProps) {
  return (
    <div className="leader-card-pro">
      <div className="leader-img-box">
        <ImageSlot
          ratio="1/1"
          src={PORTRAITS[i % PORTRAITS.length]}
          placeholder="Portrait Photograph"
        />
        {extraTag ? <span className="leader-img-badge">{extraTag}</span> : null}
      </div>

      <div className="leader-card-body">
        <span className="leader-role-tag">{r}</span>
        <h3 className="leader-name">{n}</h3>
        {d ? <p className="leader-bio">{d}</p> : null}

        {phone ? (
          <a href={`tel:${phone.replace(/-/g, '')}`} className="leader-phone-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <span>{phone}</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default function People() {
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
                <span>Organisational Leadership</span>
              </div>

              <h1 className="people-hero-title">
                The people who<br />
                <span className="highlight-text-red">guide the mission.</span>
              </h1>

              <p className="people-hero-desc">
                Pashtoonkhwa Blood Bank and Welfare Society has been continuously supervised by the same three-member organising committee since the day it opened on 24th March 1999.
              </p>

              {/* Luxury Badges Grid */}
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
                    <span className="s-val">24 March 1999</span>
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
              </div>
            </div>

            {/* Right Column: Hero Image Card */}
            <div className="people-hero-right">
              <div className="story-image-frame">
                <ImageSlot ratio="4/3.4" src={IMG.medicalTeam} placeholder="Archive photograph: founding committee & headquarters" />
                <div className="story-image-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span>Supervised by Committee Since 1999</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Leadership Committee Section */}
      <section className="section-block-pro">
        <div className="wrap">
          <div className="section-header-pill">
            <span className="dot-pulse-red" />
            <span>ORGANISING COMMITTEE</span>
          </div>

          <div className="leaders-grid-pro">
            <PersonCard
              i={0}
              n="Olus Yar"
              r="Heads the Organisation · PBB"
              d="Heads the organisation. Every branch, every account and every register answers upward to this office."
              phone="0300-3815590"
              extraTag="Executive Head"
            />

            <PersonCard
              i={1}
              n="Mr. Faqir Khushal Khan Kasi"
              r="Organiser · PBB Committee"
              d="Member of the organising committee since inauguration in 1999, overseeing operational logistics and community relations."
              extraTag="Founding Member"
            />

            <PersonCard
              i={2}
              n="Dr. Hamid Khan Achakzai"
              r="Organising Committee Member"
              d="Provincial Secretary and Member of the Central Committee, Pashtoonkhwa Milli Awami Party."
              extraTag="Founding Member"
            />
          </div>

          <div className="section-header-pill" style={{ marginTop: '56px' }}>
            <span className="dot-pulse-red" />
            <span>MEDICAL &amp; PATHOLOGY STAFF</span>
          </div>

          <div className="leaders-grid-pro">
            <PersonCard
              i={3}
              n="Dr. Naseer Muhammad"
              r="Senior Pathologist · MD, DCP (PGMI Quetta)"
              d="Senior Pathologist at Pashtoonkhwa Blood Bank. Previously Senior Medical Officer with the Health Department for ten years, and Pathologist at Health Department Zhob for two."
              extraTag="Pathology Lead"
            />

            <div className="future-staff-card">
              <div className="f-staff-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="16" y1="11" x2="22" y2="11"/>
                </svg>
              </div>
              <h4 className="f-staff-title">Expanding Medical Roster</h4>
              <p className="f-staff-desc">Further consented medical and laboratory staff records are updated periodically by the head office.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

