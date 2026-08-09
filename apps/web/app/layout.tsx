import type { ReactNode } from 'react';

export const metadata = {
  title: 'Pashtoonkhwa Blood Bank — Quetta, Balochistan',
  description:
    'Pashtoonkhwa Blood Bank & Welfare Society — screened blood, on exchange; free for thalassemia children. Since 24 March 1999.',
};

// Root layout. Locale + RTL (Urdu/Pashto) are applied per-locale segment by T4 via
// next-intl; this shell keeps the app buildable from Wave 0.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          background: '#FBF9F8',
          color: '#16171B',
          margin: 0,
        }}
      >
        {children}
      </body>
    </html>
  );
}
