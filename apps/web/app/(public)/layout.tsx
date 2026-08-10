import type { ReactNode } from 'react';
import { AnnouncementBar } from '../../components/AnnouncementBar';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';

// Public-site chrome: announcement strip, sticky header, footer. Admin and /me route groups
// get their own chrome (they set body.adminmode in the prototype). This wraps every
// marketing/self-service page. People reach us through the on-site forms (→ admin Inbox),
// not a WhatsApp channel.
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main id="page">{children}</main>
      <SiteFooter />
    </>
  );
}
