import Link from 'next/link';

// Site footer, ported from the prototype. Static content — a Server Component.
export function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="fg">
          <div>
            <Link href="/" className="brand" style={{ marginBottom: 16 }}>
              <img src="/assets/pbb-logo.png" alt="" style={{ boxShadow: '0 0 0 1px #2B2D33' }} />
              <span>
                <span className="nm" style={{ color: '#fff' }}>Pashtoonkhwa Blood Bank</span>
                <span className="ur" style={{ color: '#71757D' }}>پښتونخوا د وینې زېرمه</span>
              </span>
            </Link>
            <p style={{ lineHeight: 1.7 }}>
              Pashtoonkhwa Blood Bank &amp; Welfare Society<br />
              Zainab Chamber, Shara-e-Adalat,<br />
              near Quetta Press Club, Quetta, Balochistan.
            </p>
            <p style={{ marginTop: 14, color: '#fff', fontWeight: 700, fontSize: 16 }}>081-2836820 · 081-2839500</p>
          </div>
          <div>
            <h4>About</h4>
            <Link href="/problem">The problem we are solving</Link>
            <Link href="/about">Our story</Link>
            <Link href="/people">Our leadership</Link>
            <Link href="/supporters">Who stands with us</Link>
            <Link href="/branches">Our branches</Link>
          </div>
          <div>
            <h4>Support</h4>
            <Link href="/partners">Work with us</Link>
            <Link href="/supporters">Who stands with us</Link>
            <Link href="/publications">Publications</Link>
            <Link href="/faq">Questions</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
          <div>
            <h4>Get involved</h4>
            <Link href="/join">Everything in one place</Link>
            <Link href="/join/donor">Register as a donor</Link>
            <Link href="/join/volunteer">Volunteer</Link>
            <Link href="/join/partner">Partner with us</Link>
            <Link href="/donate">Donate</Link>
          </div>
          <div>
            <h4>Emergency</h4>
            <p style={{ color: '#fff', fontSize: 25, fontWeight: 800, letterSpacing: '-.02em' }}>081-2836820</p>
            <p style={{ marginTop: 8 }}>Blood requests are answered twenty-four hours a day at the Quetta head office.</p>
          </div>
        </div>
        <div className="fbot">
          <span>© 1999–2026 Pashtoonkhwa Blood Bank &amp; Welfare Society</span>
          <Link href="/privacy" style={{ display: 'inline' }}>Privacy</Link>
          <Link href="/terms" style={{ display: 'inline' }}>Terms</Link>
          <Link href="/me/signin" style={{ display: 'inline' }}>Your donor record</Link>
          <Link href="/admin/login" style={{ display: 'inline' }}>Staff sign in</Link>
          <span style={{ marginLeft: 'auto' }}>admin@pashtoonkhwabloodbank.org</span>
        </div>
      </div>
    </footer>
  );
}
