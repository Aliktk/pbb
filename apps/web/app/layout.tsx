import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Pashtoonkhwa Blood Bank — Quetta, Balochistan',
  description:
    'Pashtoonkhwa Blood Bank & Welfare Society — screened blood, on exchange; free for thalassemia children. Since 24 March 1999.',
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
      <body>{children}</body>
    </html>
  );
}
