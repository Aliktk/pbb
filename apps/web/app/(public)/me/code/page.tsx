'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { css } from '../../../../lib/style';

// OTP entry. Design phase: prefilled demo code; "Open my record" navigates to /me.
export default function MeCode() {
  const router = useRouter();
  const demo = '482913';
  return (
    <section className="blk">
      <div className="wrap" style={css('max-width:760px')}>
        <Link href="/me/signin" className="backlink">← Back</Link>
        <h1 style={css('margin:14px 0 10px')}>Type the code</h1>
        <p className="lead" style={css('margin-bottom:34px')}>Sent to 0300 3815590 a moment ago.</p>
        <div className="card" style={css('max-width:520px')}>
          <div className="otp">
            {Array.from({ length: 6 }, (_, i) => (
              <input key={i} className="otpbox" maxLength={1} inputMode="numeric" defaultValue={demo[i]} />
            ))}
          </div>
          <button className="btn btn-p" style={css('width:100%;padding:15px;margin-top:20px')} onClick={() => router.push('/me')}>
            Open my record
          </button>
          <div className="row" style={css('justify-content:space-between;margin-top:16px')}>
            <span className="sm">Nothing after a minute?</span>
            <Link href="/me/code" className="minilink">Send it again</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
