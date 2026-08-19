import type { ReactNode } from 'react';
import Link from 'next/link';

export function LoginShell({ children }: { children: ReactNode }) {
  return (
    <div className="login">
      {/* Left Brand Command Side */}
      <div className="brandside">
        <div className="brandside-bg-pattern" />
        <div className="brandside-glow-orb" />

        <div className="brandside-content">
          <Link href="/" className="brand">
            <img src="/assets/pbb-logo.png" alt="PBB Logo" className="brand-logo-img" />
            <div className="brand-text-col">
              <span className="nm">Pashtoonkhwa Blood Bank</span>
              <span className="ur">پښتونخوا د وینې زېرمه</span>
            </div>
          </Link>

          <div className="brandside-hero">
            <div className="brandside-pill">
              <span className="dot-pulse-red" />
              <span>Central Command Portal</span>
            </div>
            <h1 className="brandside-title">
              The register,<br />
              since <em className="text-red-highlight">1999</em>.
            </h1>
            <p className="brandside-desc">
              Fourteen towns, one book. Sign in to add donors, answer requests and record what has been given.
            </p>

            {/* 3 Live System Metrics */}
            <div className="brandside-metrics">
              <div className="bs-metric">
                <span className="bs-val text-red">64,000+</span>
                <span className="bs-lbl">Transfusions</span>
              </div>
              <div className="bs-metric">
                <span className="bs-val">100%</span>
                <span className="bs-lbl">Free Care</span>
              </div>
              <div className="bs-metric">
                <span className="bs-val">24/7</span>
                <span className="bs-lbl">Dispatch Desk</span>
              </div>
            </div>
          </div>

          <div className="brandside-footer">
            <div className="brandside-address-line">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Zainab Chamber, Shara-e-Adalat, Quetta · 081-2836820</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="formside">
        <div className="box">{children}</div>
      </div>
    </div>
  );
}

