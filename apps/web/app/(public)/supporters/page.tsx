import Link from 'next/link';
import { ImageSlot } from '../../../components/ImageSlot';
import { IMG } from '../../../lib/images';

interface SupporterItem {
  name: string;
  note: string;
  category: string;
  type: 'hospital' | 'civic' | 'press' | 'community' | 'public';
}

const SUPPORTERS: SupporterItem[] = [
  {
    name: 'Pashtoonkhwa Milli Awami Party',
    note: 'Founding support and ongoing supervision since inauguration in 1996.',
    category: 'Political & Civic Ally',
    type: 'civic',
  },
  {
    name: 'Quetta Press Club',
    note: 'Neighbouring institution and long-standing civic partner.',
    category: 'Media & Civic Partner',
    type: 'press',
  },
  {
    name: 'Civil Hospital, Quetta',
    note: 'Primary referring hospital and blood exchange partner.',
    category: 'Medical Partner',
    type: 'hospital',
  },
  {
    name: 'Bolan Medical Complex',
    note: 'Major referring medical center and emergency partner.',
    category: 'Medical Partner',
    type: 'hospital',
  },
  {
    name: 'Sandeman Provincial Hospital',
    note: 'Regional referring hospital for critical transfusions.',
    category: 'Medical Partner',
    type: 'hospital',
  },
  {
    name: 'DHQ Hospital, Zhob',
    note: 'District branch hospital partner in Northern Balochistan.',
    category: 'Regional Network',
    type: 'hospital',
  },
  {
    name: 'Local Welfare Societies',
    note: 'Organises blood donation camps and hide collection on Eid ul Adha.',
    category: 'Community Network',
    type: 'community',
  },
  {
    name: 'Individual Members',
    note: 'The largest source of all direct blood donors & Zakat contributions.',
    category: 'General Public',
    type: 'public',
  },
];

function SupporterIcon({ type }: { type: string }) {
  if (type === 'hospital') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    );
  }
  if (type === 'press') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
        <path d="M18 14h-8M18 18h-8M18 10h-8"/>
      </svg>
    );
  }
  if (type === 'civic') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    </svg>
  );
}

export default function Supporters() {
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
                <span>Who Stands With Us</span>
              </div>

              <h1 className="people-hero-title">
                The institutions that<br />
                <span className="highlight-text-red">keep this mission running.</span>
              </h1>

              <p className="people-hero-desc">
                Pashtoonkhwa Blood Bank has no government funding. It runs entirely on members’ contributions, charity, Zakat, and cattle hides collected by volunteers each Eid ul Adha — and on the trusted partners below.
              </p>

              {/* Badges Grid */}
              <div className="story-meta-grid">
                <div className="story-meta-card">
                  <div className="s-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div>
                    <span className="s-lbl">Founding Support</span>
                    <span className="s-val">Pashtoonkhwa MAP</span>
                  </div>
                </div>

                <div className="story-meta-card">
                  <div className="s-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                  </div>
                  <div>
                    <span className="s-lbl">Hospital Network</span>
                    <span className="s-val">4 Major Hospitals</span>
                  </div>
                </div>

                <div className="story-meta-card">
                  <div className="s-icon-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    </svg>
                  </div>
                  <div>
                    <span className="s-lbl">Funding Source</span>
                    <span className="s-val">100% Community</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Image Frame */}
            <div className="people-hero-right">
              <div className="story-image-frame">
                <ImageSlot ratio="4/3.4" src={IMG.partnership} placeholder="Partnership & Community Photograph" />
                <div className="story-image-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                  <span>Zero Govt Funding · 100% Community-Backed</span>
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
            <span>SUPPORTING ORGANISATIONS &amp; HOSPITALS</span>
          </div>

          <div className="supp-grid-pro">
            {SUPPORTERS.map((s) => (
              <div key={s.name} className="supp-card-pro">
                <div className="supp-icon-ring">
                  <SupporterIcon type={s.type} />
                </div>
                <div className="supp-card-content">
                  <div className="supp-card-header">
                    <h3 className="supp-name">{s.name}</h3>
                    <span className="supp-cat-pill">{s.category}</span>
                  </div>
                  <p className="supp-note">{s.note}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Callout Cards */}
          <div className="partner-actions-grid">
            <div className="partner-action-card">
              <div className="p-act-badge">BECOME A PARTNER</div>
              <h3 className="p-act-title">Hospitals, Laboratories &amp; Clinics</h3>
              <p className="p-act-desc">
                Refer patients, share screening capacity, or host a camp. Partner hospitals get a named coordinator and a direct line to the branch.
              </p>
              <Link href="/join/partner" className="btn-crimson-pill">
                Partner with us →
              </Link>
            </div>

            <div className="partner-action-card">
              <div className="p-act-badge">COMMUNITY BRANCHES</div>
              <h3 className="p-act-title">Bring Us to Your Town</h3>
              <p className="p-act-desc">
                Eight towns are served without a permanent office. If your community wants a branch, the organising committee will talk it through with you.
              </p>
              <Link href="/join/organisation" className="btn-crimson-pill">
                Register an Organisation →
              </Link>
            </div>
          </div>

          {/* Closer Banner */}
          <div className="closer-card-pro">
            <div className="closer-content">
              <span className="closer-tag-white">Support the Register</span>
              <h2 className="closer-title">Fund pure blood, screening &amp; fuel.</h2>
              <p className="closer-desc">
                Bank transfer, Zakat, or hides at Eid ul Adha. Every rupee goes directly to screening kits, blood bags, and emergency ambulance fuel.
              </p>
            </div>
            <Link href="/donate" className="btn-white-pill">
              How to Donate
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

