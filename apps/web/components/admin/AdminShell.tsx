'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ADMIN_GROUPS, ADMIN_MOBNAV, ALLOW, ROLES, type RoleKey } from '../../lib/admin';
import { REQUESTS } from '../../lib/adminData';
import { Icon } from '../Icon';

interface AdminShellProps {
  view: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * The admin chrome (aside sidebar + topbar + mobile bar), ported from the prototype's
 * adminShell(). The role switcher is a demonstration control - it changes which sidebar
 * items are visible and the branch scope label. Real RBAC is enforced server-side (T1);
 * hiding a control here is presentation only.
 */
export function AdminShell({ view, title, subtitle, actions, children }: AdminShellProps) {
  const [role, setRole] = useState<RoleKey>('head');

  // Apply the prototype's body.adminmode styles while an admin screen is mounted.
  useEffect(() => {
    document.body.classList.add('adminmode');
    return () => document.body.classList.remove('adminmode');
  }, []);

  const current = ROLES.find((r) => r.key === role)!;
  const scope = current.scope;
  const allowed = ALLOW[role];
  const can = (v: string) => !allowed || allowed.includes(v);
  const openRequests = (scope ? REQUESTS.filter((r) => r.c === scope) : REQUESTS).filter((r) => r.st === 'open').length;

  return (
    <>
      <div className="adm">
        <aside className="aside">
          <Link href="/admin/overview" className="abrand">
            <img src="/assets/pbb-logo.png" alt="" />
            <span>Blood Register<small>{scope ?? 'All branches'}</small></span>
          </Link>
          {ADMIN_GROUPS.map(([group, items]) => {
            const vis = items.filter(([v]) => can(v));
            if (!vis.length) return null;
            return (
              <div key={group}>
                <div className="agp">{group}</div>
                {vis.map(([v, label]) => (
                  <Link key={v} href={`/admin/${v}`} className={`anav${v === view ? ' on' : ''}`}>
                    <Icon name={v} />
                    {label}
                    {v === 'requests' ? <span className="ct">{openRequests}</span> : v === 'inventory' ? <span className="ct">1</span> : null}
                  </Link>
                ))}
              </div>
            );
          })}
          <div className="awho">
            Signed in as<b>{current.who}</b>{current.sub}
            <Link href="/" className="alogout">Back to website</Link>
          </div>
        </aside>

        <div className="amain">
          <div className="abar">
            <h1>{title}</h1>
            {subtitle && <span className="asub">{subtitle}</span>}
            {actions}
            <div className="roleswitch">
              {ROLES.map((r) => (
                <button key={r.key} className={r.key === role ? 'on' : undefined} onClick={() => setRole(r.key)} title={`View as ${r.who}`}>
                  {r.short}
                </button>
              ))}
            </div>
          </div>
          <div className="acont">{children}</div>
        </div>
      </div>

      <div className="mobbar">
        {ADMIN_MOBNAV.filter(([v]) => can(v)).map(([v, label]) => (
          <Link key={v} href={`/admin/${v}`} className={v === view ? 'on' : undefined}>
            <b><Icon name={v} size={20} /></b>{label.split(' ')[0]}
          </Link>
        ))}
      </div>
    </>
  );
}
