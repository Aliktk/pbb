import Link from 'next/link';

// Site footer - Server Component with complete original content and high-end aesthetic layout
export function SiteFooter() {
  return (
    <footer className="footer-pro">
      <div className="wrap">
        <div className="footer-grid">
          {/* Brand & Address Column */}
          <div className="footer-brand-col">
            <Link href="/" className="brand margin-bottom-xs">
              <img src="/assets/pbb-logo.png" alt="Pashtoonkhwa Blood Bank" className="footer-logo-img" />
              <span>
                <span className="nm text-white">Pashtoonkhwa Blood Bank</span>
                <span className="ur text-muted-dim">پښتونخوا د وینې زېرمه</span>
              </span>
            </Link>
            
            <span className="org-tagline">Welfare Society Headquarters</span>
            
            <div className="footer-address-box">
              <svg className="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>
                Zainab Chamber, Shara-e-Adalat,<br />
                near Quetta Press Club, Quetta, Balochistan.
              </span>
            </div>

            <div className="footer-phone-pill">
              <svg className="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>081-2836820 · 081-2839500</span>
            </div>
          </div>

          {/* About Column */}
          <div className="footer-nav-col">
            <p className="footer-col-title">About</p>
            <Link href="/problem">The problem we are solving</Link>
            <Link href="/about">Our story</Link>
            <Link href="/people">Our leadership</Link>
            <Link href="/supporters">Who stands with us</Link>
            <Link href="/branches">Our branches</Link>
          </div>

          {/* Support Column */}
          <div className="footer-nav-col">
            <p className="footer-col-title">Support</p>
            <Link href="/partners">Work with us</Link>
            <Link href="/supporters">Who stands with us</Link>
            <Link href="/publications">Publications</Link>
            <Link href="/faq">Questions</Link>
            <Link href="/privacy">Privacy</Link>
          </div>

          {/* Get Involved Column */}
          <div className="footer-nav-col">
            <p className="footer-col-title">Get Involved</p>
            <Link href="/join">Everything in one place</Link>
            <Link href="/join/donor">Register as a donor</Link>
            <Link href="/join/volunteer">Volunteer</Link>
            <Link href="/join/partner">Partner with us</Link>
            <Link href="/donate">Donate</Link>
          </div>

          {/* Emergency Box Column */}
          <div className="footer-emergency-col">
            <div className="emergency-card-pro">
              <h4>Emergency</h4>
              <a href="tel:0812836820" className="emergency-num-link">
                <svg className="animated-phone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>081-2836820</span>
              </a>
              <p className="emergency-note">
                Blood requests are answered twenty-four hours a day at the Quetta head office.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar Pro */}
        <div className="footer-bottom-pro">
          <span className="copyright-tag">© 1996-2026 Pashtoonkhwa Blood Bank</span>

          <div className="footer-bottom-links">
            <Link href="/privacy" className="footer-pill-link">
              Privacy
            </Link>
            <Link href="/terms" className="footer-pill-link">
              Terms
            </Link>
            <Link href="/me/signin" className="footer-pill-link highlight-donor">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Donor Record
            </Link>
            <Link href="/admin/login" className="footer-pill-link highlight-staff">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Staff Portal
            </Link>
          </div>

          <a href="mailto:admin@pashtoonkhwabloodbank.org" className="email-pill">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <span>admin@pashtoonkhwabloodbank.org</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

