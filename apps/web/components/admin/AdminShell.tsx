'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ADMIN_GROUPS, ADMIN_MOBNAV } from '../../lib/admin';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import type { Paged, AdminRequestRow } from '../../lib/apiTypes';
import { Icon } from '../Icon';

interface AdminShellProps {
  view: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * The admin chrome (sidebar + topbar + mobile bar). It reads the signed-in user from the auth
 * context: the account decides the town scope and what the server will allow. Hiding a nav item
 * is presentation only; the API enforces access on every call.
 */
export function AdminShell({ view, title, subtitle, actions, children }: AdminShellProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [openRequests, setOpenRequests] = useState<number | null>(null);

  // Apply the prototype's body.adminmode styles while an admin screen is mounted.
  useEffect(() => {
    document.body.classList.add('adminmode');
    return () => document.body.classList.remove('adminmode');
  }, []);

  // Live "open requests" badge from the API (best effort).
  useEffect(() => {
    let alive = true;
    api
      .get<Paged<AdminRequestRow>>('/requests?status=OPEN&pageSize=1')
      .then((res) => alive && setOpenRequests(res.meta.total))
      .catch(() => alive && setOpenRequests(null));
    return () => {
      alive = false;
    };
  }, []);

  const scopeLabel = user?.townId ? 'Your branch' : 'All branches';

  async function signOut() {
    await logout();
    router.replace('/admin/login');
  }

  return (
    <>
      <div className="adm">
        <aside className="aside">
          <Link href="/admin/overview" className="abrand">
            <img src="/assets/pbb-logo.png" alt="" />
            <span>Blood Register<small>{scopeLabel}</small></span>
          </Link>
          {ADMIN_GROUPS.map(([group, items]) => (
            <div key={group}>
              <div className="agp">{group}</div>
              {items.map(([v, label]) => (
                <Link key={v} href={`/admin/${v}`} className={`anav${v === view ? ' on' : ''}`}>
                  <Icon name={v} />
                  {label}
                  {v === 'requests' && openRequests !== null ? <span className="ct">{openRequests}</span> : null}
                </Link>
              ))}
            </div>
          ))}
          <div className="awho">
            Signed in as<b>{user?.name ?? 'Loading'}</b>{user?.role.name ?? ''}
            <button type="button" className="alogout" onClick={signOut} style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0, textAlign: 'left' }}>
              Sign out
            </button>
          </div>
        </aside>

        <div className="amain">
          <div className="abar">
            <h1>{title}</h1>
            {subtitle && <span className="asub">{subtitle}</span>}
            {actions}
            <Link href="/" className="btn btn-o btn-s" style={{ marginLeft: 'auto' }}>Back to website</Link>
          </div>
          <div className="acont">{children}</div>
        </div>
      </div>

      <div className="mobbar">
        {ADMIN_MOBNAV.map(([v, label]) => (
          <Link key={v} href={`/admin/${v}`} className={v === view ? 'on' : undefined}>
            <b><Icon name={v} size={20} /></b>{label.split(' ')[0]}
          </Link>
        ))}
      </div>
    </>
  );
}
