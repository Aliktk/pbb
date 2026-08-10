import type { ReactNode } from 'react';
import Link from 'next/link';
import { css } from '../../lib/style';

// Full-screen two-column auth shell (login / forgot / sent), ported from loginShell().
export function LoginShell({ children }: { children: ReactNode }) {
  return (
    <div className="login">
      <div className="brandside">
        <Link href="/" className="brand">
          <img src="/assets/pbb-logo.png" alt="" style={css('box-shadow:0 0 0 1px #2B2D33')} />
          <span>
            <span className="nm" style={css('color:#fff')}>Pashtoonkhwa Blood Bank</span>
            <span className="ur" style={css('color:#71757D')}>پښتونخوا د وینې زېرمه</span>
          </span>
        </Link>
        <div>
          <h1 style={css('color:#fff;font-size:clamp(30px,4vw,46px)')}>The register,<br />since <em style={css('color:#FF6B60')}>1999</em>.</h1>
          <p style={css('color:#A7ABB3;font-size:17px;margin-top:16px;max-width:44ch')}>
            Fourteen towns, one book. Sign in to add donors, answer requests and record what has been given.
          </p>
        </div>
        <p style={css('color:#5E626A;font-size:13px')}>Zainab Chamber, Shara-e-Adalat, Quetta · 081-2836820</p>
      </div>
      <div className="formside"><div className="box">{children}</div></div>
    </div>
  );
}
