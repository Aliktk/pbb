import type { ReactNode } from 'react';
import './globals.css';
import { Preloader } from '../components/Preloader';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pashtoonkhwabloodbank.org';
const TITLE = 'Pashtoonkhwa Blood Bank, Quetta, Balochistan';
const DESCRIPTION =
  'Pashtoonkhwa Blood Bank and Welfare Society. Screened blood on exchange, free for thalassemia children. Since 24 March 1996.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  icons: {
    icon: '/assets/pbb-logo.png',
    shortcut: '/assets/pbb-logo.png',
    apple: '/assets/pbb-logo.png',
  },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Pashtoonkhwa Blood Bank',
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: 'en',
    images: [{ url: '/assets/pbb-logo.png', width: 1200, height: 630, alt: 'Pashtoonkhwa Blood Bank' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/assets/pbb-logo.png'],
  },
};

// Root layout. Fonts match the prototype exactly (Plus Jakarta Sans + Noto Nastaliq Urdu).
// Locale + RTL for Urdu/Pashto is layered on by T4 (next-intl); the `en` default keeps the
// site fully rendered now.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Nastaliq+Urdu:wght@500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Preloader />
        {children}
      </body>
    </html>
  );
}
