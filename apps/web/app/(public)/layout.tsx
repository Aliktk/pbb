import type { ReactNode } from 'react';
import { AnnouncementBar } from '../../components/AnnouncementBar';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';
import { WhatsAppButton } from '../../components/WhatsAppButton';

// Public-site chrome: announcement strip, sticky header, footer, floating WhatsApp.
// Admin and /me route groups get their own chrome (they set body.adminmode in the
// prototype). This wraps every marketing/self-service page.
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main id="page">{children}</main>
      <SiteFooter />
      <WhatsAppButton />
    </>
  );
}
