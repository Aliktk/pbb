'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '../../lib/auth';

// Pages under /admin that do not require a session.
const OPEN_ADMIN_PATHS = ['/admin/login', '/admin/forgot'];

function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isOpen = OPEN_ADMIN_PATHS.includes(pathname);

  useEffect(() => {
    if (!loading && !user && !isOpen) router.replace('/admin/login');
  }, [loading, user, isOpen, router]);

  if (isOpen) return <>{children}</>;
  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--mid)', fontWeight: 600 }}>
        Loading your workspace
      </div>
    );
  }
  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AdminGuard>{children}</AdminGuard>
    </AuthProvider>
  );
}
