'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV, type NavGroup } from '../lib/nav';
import { useLocale, tr } from '../lib/i18n';

/** Is this nav group the active section for the current path? */
function isActive(group: NavGroup, pathname: string): boolean {
  if (group.href) return group.href === '/' ? pathname === '/' : pathname.startsWith(group.href);
  return (group.items ?? []).some(
    (i) => pathname === i.href || (i.href !== '/' && pathname.startsWith(i.href)),
  );
}

const Chevron = () => <i className="chev" />;

const BrandMark = ({ dark = false }: { dark?: boolean }) => (
  <Link href="/" className="brand">
    <img src="/assets/pbb-logo.png" alt="Pashtoonkhwa Blood Bank" style={dark ? { boxShadow: '0 0 0 1px #2B2D33' } : undefined} />
    <span>
      <span className="nm" style={dark ? { color: '#fff' } : undefined}>Pashtoonkhwa Blood Bank</span>
      <span className="ur" style={dark ? { color: '#71757D' } : undefined}>پښتونخوا د وینې زېرمه</span>
    </span>
  </Link>
);

export function SiteHeader() {
  const pathname = usePathname();
  const [mobOpen, setMobOpen] = useState(false);
  const { locale, setLocale } = useLocale();
  const [langOpen, setLangOpen] = useState(false);

  return (
    <>
      <nav className="top">
        <div className="wrap">
          <BrandMark />
          <ul className="menu" id="menu">
            {NAV.map((group) => (
              <li key={group.label} data-nav={group.label} className={isActive(group, pathname) ? 'on' : undefined}>
                {group.href ? (
                  <Link href={group.href}>{tr(locale, group.label)}</Link>
                ) : (
                  <Link href={group.items![0].href}>
                    <span>{tr(locale, group.label)}</span> <Chevron />
                  </Link>
                )}
                {group.items && (
                  <div className="dd">
                    {group.items.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <span className="di">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <path d={item.icon} />
                          </svg>
                        </span>
                        <span>
                          <b>{item.label}</b>
                          <span>{item.description}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="navcta">
            <div style={{ position: 'relative' }}>
              <button className="lang" type="button" onClick={() => setLangOpen((o) => !o)} aria-haspopup="true" aria-expanded={langOpen}>
                {locale === 'ur' ? 'اردو ▾' : 'EN ▾'}
              </button>
              {langOpen && (
                <div role="menu" style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#fff', border: '1px solid var(--line)', borderRadius: 10, boxShadow: 'var(--sh)', zIndex: 60, minWidth: 130, overflow: 'hidden' }}>
                  <button type="button" role="menuitem" onClick={() => { setLocale('en'); setLangOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: locale === 'en' ? 'var(--bg)' : '#fff', border: 0, cursor: 'pointer', font: 'inherit', fontWeight: 600 }}>English</button>
                  <button type="button" role="menuitem" onClick={() => { setLocale('ur'); setLangOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'right', padding: '10px 14px', background: locale === 'ur' ? 'var(--bg)' : '#fff', border: 0, cursor: 'pointer', font: 'inherit', fontWeight: 600 }}>اردو</button>
                </div>
              )}
            </div>
            <Link href="/join" className="btn-nav-primary">{tr(locale, 'Get Involved')}</Link>
            <button className="btn btn-o btn-s burger" onClick={() => setMobOpen(true)} aria-label="Menu" type="button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay menu */}
      <div id="mob" className={mobOpen ? 'open' : undefined}>
        <div className="mh">
          <img src="/assets/pbb-logo.png" alt="" />
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Pashtoonkhwa Blood Bank</div>
            <div style={{ fontFamily: "'Noto Nastaliq Urdu',serif", fontSize: 11, color: 'var(--mid)' }}>پښتونخوا د وینې زېرمه</div>
          </div>
          <button className="cl" onClick={() => setMobOpen(false)} aria-label="Close" type="button">✕</button>
        </div>
        {NAV.map((group) =>
          group.href ? (
            <Link key={group.label} href={group.href} onClick={() => setMobOpen(false)}>{group.label}</Link>
          ) : (
            <div key={group.label}>
              <div className="gp">{group.label}</div>
              {group.items!.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobOpen(false)}>{item.label}</Link>
              ))}
            </div>
          ),
        )}
        <div className="ft">
          <Link href="/join/requester" className="btn btn-p" style={{ color: '#fff' }} onClick={() => setMobOpen(false)}>{tr(locale, 'Request Blood')}</Link>
          <div className="row" style={{ gap: 8 }}>
            <button className={`btn ${locale === 'en' ? 'btn-p' : 'btn-o'}`} style={{ flex: 1 }} type="button" onClick={() => { setLocale('en'); setMobOpen(false); }}>English</button>
            <button className={`btn ${locale === 'ur' ? 'btn-p' : 'btn-o'}`} style={{ flex: 1 }} type="button" onClick={() => { setLocale('ur'); setMobOpen(false); }}>اردو</button>
          </div>
          <div style={{ fontSize: 13, color: 'var(--mid)', paddingTop: 4 }}>
            Emergency · <b style={{ color: 'var(--ink)' }}>081-2836820</b>
          </div>
        </div>
      </div>
    </>
  );
}
