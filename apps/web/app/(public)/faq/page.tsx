'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FaqItem {
  id: number;
  q: string;
  a: string;
  category: string;
}

const FAQS: FaqItem[] = [
  {
    id: 1,
    q: 'Who can give blood?',
    a: 'Anyone between 18 and 60 years old, weighing at least 50 kg, in good health, and with at least 90 days elapsed since their last blood donation. If you are unsure about your eligibility, visit your nearest branch — medical screening takes only a few minutes.',
    category: 'Eligibility & Donation',
  },
  {
    id: 2,
    q: 'Does blood donation cost anything?',
    a: 'No. Pashtoonkhwa Blood Bank has never sold blood and never purchased it. All blood is provided completely free of charge on an exchange basis — a relative or friend of the patient donates in return to keep hospital reserves replenished.',
    category: 'Costs & Exemptions',
  },
  {
    id: 3,
    q: 'What if nobody in our family can donate in exchange?',
    a: 'In four critical cases there is no exchange donor requirement at all: thalassemia pediatric patients, pregnant mothers, acute emergency trauma cases, and natural disaster victims. This policy has been enforced strictly since 1999.',
    category: 'Costs & Exemptions',
  },
  {
    id: 4,
    q: 'Is the blood thoroughly screened before transfusion?',
    a: 'Yes. Every donated blood bag undergoes mandatory 4-panel screening using standardized ELISA testing for Hepatitis B, Hepatitis C, HIV/AIDS, and Malarial Parasite before it is ever cleared for patient transfusion.',
    category: 'Screening & Safety',
  },
  {
    id: 5,
    q: 'Does donating blood cause physical weakness or fatigue?',
    a: 'No. Your body naturally replenishes the lost fluid volume within 24 hours and rebuilds red blood cells within a few weeks. The mandatory 90-day interval between donations ensures complete health recovery.',
    category: 'Eligibility & Donation',
  },
  {
    id: 6,
    q: 'Can women donate blood?',
    a: 'Yes, under the exact same health criteria. Women who are currently pregnant, breastfeeding, or experiencing active menstruation are advised to defer donation until their cycle completes.',
    category: 'Eligibility & Donation',
  },
  {
    id: 7,
    q: 'How often will the central registry contact me?',
    a: 'Rarely, and never more than twice in a single day during emergencies. The automated system prioritizes registered donors who have gone longest without donating to prevent donor fatigue.',
    category: 'Operations & Support',
  },
  {
    id: 8,
    q: 'Can I decline a donation request if called?',
    a: 'Always, and without any explanation required. Declining a call does not remove you from the donor register, nor does it impact your standing.',
    category: 'Operations & Support',
  },
  {
    id: 9,
    q: 'How are operational funds spent and audited?',
    a: '100% of funding goes toward ELISA screening kits, blood bags, emergency ambulance fuel, and branch operational expenses. Funding is raised from members, public charity, Zakat, and cattle hide collection drives during Eid-ul-Adha.',
    category: 'Costs & Exemptions',
  },
  {
    id: 10,
    q: 'Do you serve my specific town or district?',
    a: 'Six major towns house permanent PBB regional offices, and eight additional districts are served directly from them. If your district is not listed, contact us to explore setting up a new local volunteer branch.',
    category: 'Operations & Support',
  },
];

const CATEGORIES: string[] = [
  'All Questions',
  'Eligibility & Donation',
  'Screening & Safety',
  'Costs & Exemptions',
  'Operations & Support',
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First open by default
  const [activeCategory, setActiveCategory] = useState<string>('All Questions');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredFaqs = FAQS.filter((item) => {
    const matchesCategory =
      activeCategory === 'All Questions' || item.category === activeCategory;
    const matchesSearch =
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* Breathtaking Centered Hero Header */}
      <header className="join-hero-centered">
        <div className="hero-grid-pattern" />

        {/* Left Floating Side Badge */}
        <div className="hero-side-badge left">
          <div className="side-badge-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="side-badge-text">
            <span className="side-badge-val">24/7 Helpline</span>
            <span className="side-badge-lbl">081-2836820 Desk</span>
          </div>
        </div>

        {/* Right Floating Side Badge */}
        <div className="hero-side-badge right">
          <div className="side-badge-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="side-badge-text">
            <span className="side-badge-val">Direct Answers</span>
            <span className="side-badge-lbl">100% Transparent</span>
          </div>
        </div>

        <div className="wrap">
          <div className="join-hero-content">
            <div className="problem-pill-tag" style={{ margin: '0 auto 16px' }}>
              <span className="animated-filled-circle" />
              <span>Frequently Asked Questions</span>
            </div>

            <h1 className="join-hero-title">
              Clear answers to your questions.<br />
              <span className="highlight-text-red">100% transparent &amp; open.</span>
            </h1>

            <p className="join-hero-desc">
              Everything you need to know about blood donation eligibility, 100% zero-cost screening, free emergency dispatches, and financial transparency.
            </p>

            {/* Emergency Helpline Floating Bar */}
            <div className="hero-emergency-bar">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>Question not listed? Call 24/7 Helpline: <a href="tel:0812836820">081-2836820</a> — Duty Officer Desk</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main FAQ Content Section */}
      <section className="section-block-pro">
        <div className="wrap" style={{ maxWidth: '940px' }}>
          {/* Interactive Search Input Box */}
          <div className="faq-search-wrapper">
            <svg className="faq-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="faq-search-input"
              placeholder="Search questions (e.g. screening, cost, eligibility, women)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="faq-search-clear"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="gpgc-filter-bar" style={{ marginBottom: '32px' }}>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  className={`gpgc-filter-pill ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          {/* Accordion Items Grid */}
          <div className="faq-accordion-container">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((item, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div
                    key={item.id}
                    className={`faq-accordion-item ${isOpen ? 'open' : ''}`}
                  >
                    <button
                      type="button"
                      className="faq-accordion-header"
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                    >
                      <div className="faq-q-num">Q{idx + 1}</div>
                      <span className="faq-q-title">{item.q}</span>
                      <div className="faq-toggle-btn">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="faq-toggle-icon"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="faq-accordion-body">
                        <p>{item.a}</p>
                        <div className="faq-cat-tag-row">
                          <span className="faq-cat-tag-pill">{item.category}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="faq-no-results">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <h3>No matching questions found</h3>
                <p>Try searching with different terms or select "All Questions".</p>
              </div>
            )}
          </div>

          {/* Helpline Callout Banner */}
          <div className="faq-contact-card">
            <div className="faq-contact-info">
              <span className="faq-badge-glow">24/7 DIRECT HELPLINE</span>
              <h2 className="faq-contact-title">Still have questions? Speak with our Duty Officer.</h2>
              <p className="faq-contact-desc">
                Visit our central office beside the Quetta Press Club or telephone our 24-hour dispatch desk directly. No appointment needed at any hour.
              </p>
            </div>
            <div className="faq-contact-actions">
              <a href="tel:0812836820" className="btn-crimson-pill">
                📞 Call 081-2836820
              </a>
              <Link href="/branches" className="btn-white-glass-pill">
                Find Nearest Branch →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

