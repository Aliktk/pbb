'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// Lightweight locale switch for the public site. It persists the choice, sets <html lang>, and
// translates the chrome (navigation + primary buttons). Full page-content translation is a
// separate content pass; this gives a working English/Urdu switch and the correct lang attribute
// (which browser translation and screen readers rely on).

export type Locale = 'en' | 'ur';

interface LocaleCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const LocaleContext = createContext<LocaleCtx>({ locale: 'en', setLocale: () => {} });

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pbb_locale');
      if (saved === 'en' || saved === 'ur') setLocaleState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem('pbb_locale', l);
    } catch {
      /* ignore */
    }
  };

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleCtx {
  return useContext(LocaleContext);
}

// Urdu strings keyed by the English label. Extend this as more of the site is translated.
const UR: Record<string, string> = {
  Home: 'ہوم',
  About: 'ہمارے بارے میں',
  Services: 'خدمات',
  'Get involved': 'شامل ہوں',
  Media: 'میڈیا',
  Contact: 'رابطہ',
  'Get Involved': 'شامل ہوں',
  'Request Blood': 'خون کی درخواست',
};

export function tr(locale: Locale, label: string): string {
  return locale === 'ur' ? UR[label] ?? label : label;
}
