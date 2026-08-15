import type { ReactNode } from 'react';
import { AnnouncementBar } from '../../components/AnnouncementBar';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';
import { ScrollToTop } from '../../components/ScrollToTop';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main id="page">{children}</main>
      <SiteFooter />
      <ScrollToTop />
    </>
  );
}
