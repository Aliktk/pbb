'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ADMIN_GROUPS, ADMIN_MOBNAV, isViewAllowedForRole } from '../../lib/admin';
import { useAuth } from '../../lib/auth';
import { countOpenRequests } from '../../lib/requests';
import { Icon } from '../Icon';

import { LogoutConfirmModal } from './LogoutConfirmModal';

interface AdminShellProps {
  view: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AdminShell({ view, title, subtitle, actions, children }: AdminShellProps) {
  const { user, logout } = useAuth();
  const userRole = user?.role?.name || 'Executive Committee';
  const isAllowed = isViewAllowedForRole(userRole, view, undefined, user?.permissions);
  const router = useRouter();
  const asideRef = useRef<HTMLElement>(null);
  const [openRequests, setOpenRequests] = useState<number | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('pbb_admin_collapsed') === 'true';
      } catch {
        // Fallback
      }
    }
    return false;
  });

  // Apply body.adminmode class on mount
  useEffect(() => {
    document.body.classList.add('adminmode');
    return () => document.body.classList.remove('adminmode');
  }, []);

  // Save and restore sidebar scroll position across page transitions
  useEffect(() => {
    const el = asideRef.current;
    if (!el) return;

    const saved = sessionStorage.getItem('pbb_admin_sidebar_scroll');
    if (saved !== null) {
      el.scrollTop = parseInt(saved, 10) || 0;
    }

    const onScroll = () => {
      try {
        sessionStorage.setItem('pbb_admin_sidebar_scroll', String(el.scrollTop));
      } catch {
        // Session storage fallback
      }
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Live "open requests" badge from the API
  useEffect(() => {
    let alive = true;
    countOpenRequests()
      .then((n) => alive && setOpenRequests(n))
      .catch(() => alive && setOpenRequests(null));
    return () => {
      alive = false;
    };
  }, []);

  const scopeLabel = user?.townId ? 'Your branch' : 'All branches';

  function toggleSidebar() {
    setCollapsed((cur) => {
      const next = !cur;
      try {
        localStorage.setItem('pbb_admin_collapsed', String(next));
      } catch {
        // LocalStorage fallback
      }
      return next;
    });
  }

  async function signOut() {
    await logout();
    router.replace('/admin/login');
  }

  return (
    <>
      <div className={`adm${collapsed ? ' collapsed' : ''}`}>
        <aside className="aside" ref={asideRef}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'space-between',
              paddingBottom: '14px',
              borderBottom: '1px solid #2B2D33',
              marginBottom: '12px',
              minHeight: '44px',
            }}
          >
            {!collapsed && (
              <Link href="/admin/overview" className="abrand" title="Blood Register Admin" style={{ borderBottom: 0, paddingBottom: 0, marginBottom: 0 }}>
                <img src="/assets/pbb-logo.png" alt="PBB Logo" />
                <span>Blood Register<small>{scopeLabel}</small></span>
              </Link>
            )}
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={toggleSidebar}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label="Toggle sidebar collapse"
              style={collapsed ? { width: '38px', height: '38px', margin: '0 auto' } : undefined}
            >
              <Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} size={collapsed ? 18 : 15} />
            </button>
          </div>

          {ADMIN_GROUPS.map(([group, items]) => {
            const visibleItems = items.filter(([v]) => isViewAllowedForRole(userRole, v, undefined, user?.permissions));
            if (visibleItems.length === 0) return null;
            return (
              <div key={group}>
                <div className="agp">{group}</div>
                {visibleItems.map(([v, label]) => (
                  <Link
                    key={v}
                    href={`/admin/${v}`}
                    className={`anav${v === view ? ' on' : ''}`}
                    title={label}
                  >
                    <Icon name={v} size={collapsed ? 21 : 18} />
                    <span className="nav-label">{label}</span>
                    {v === 'requests' && openRequests !== null ? <span className="ct">{openRequests}</span> : null}
                  </Link>
                ))}
              </div>
            );
          })}
          <div className="awho">
            <div className="awho-info">
              Signed in as<b>{user?.name ?? 'Loading'}</b>{user?.role?.name ?? ''}
            </div>
            <button
              type="button"
              className="alogout-btn"
              onClick={() => setShowLogoutModal(true)}
              title="Sign out"
            >
              <Icon name="logout" size={15} />
              {!collapsed && <span>Sign out</span>}
            </button>
          </div>
        </aside>

        <div className="amain">
          <div className="abar">
            <div className="abar-title-group">
              <h1>{title}</h1>
              {subtitle && <span className="asub">{subtitle}</span>}
            </div>
            <div className="abar-actions">
              {actions}
              <Link href="/" className="btn btn-o btn-s">Back to website</Link>
            </div>
          </div>
          <div className="acont">
            {!isAllowed ? (
              <div className="acard" style={{ padding: '60px 30px', textAlign: 'center', borderRadius: '24px' }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '14px' }}>⛔</span>
                <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--txt1)', margin: '0 0 8px 0' }}>
                  Unauthorized Role Access
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--txt2)', maxWidth: '520px', margin: '0 auto 20px auto', lineHeight: 1.6 }}>
                  Your current assigned role <b>"{userRole}"</b> does not have permission to view or manage the <b>"{title}"</b> module. Contact your system administrator to update role access.
                </p>
                <Link href="/admin/overview" className="btn btn-p" style={{ borderRadius: '12px', padding: '10px 20px', display: 'inline-block' }}>
                  Return to Overview Dashboard
                </Link>
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </div>

      <div className="mobbar">
        {ADMIN_MOBNAV.map(([v, label]) => (
          <Link key={v} href={`/admin/${v}`} className={v === view ? 'on' : undefined}>
            <b><Icon name={v} size={20} /></b>{label.split(' ')[0]}
          </Link>
        ))}
      </div>

      {/* Confirmation Modal for Admin Sign Out */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={signOut}
      />
    </>
  );
}
