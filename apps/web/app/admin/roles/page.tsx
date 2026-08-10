'use client';

import Link from 'next/link';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';

interface RoleCard {
  n: string; // role name
  d: string; // description
  c: number; // people count
}

const RLIST: RoleCard[] = [
  { n: 'Olus Yar', d: 'Everything, all fourteen towns, including deleting and managing staff', c: 2 },
  { n: 'Executive', d: 'All data and all towns; publishes the website. Cannot delete or manage staff', c: 3 },
  { n: 'Branch manager', d: 'One town. Runs requests, donors and stock for that town', c: 6 },
  { n: 'Coordinator', d: 'Answers requests and calls donors. No editing of records', c: 4 },
  { n: 'Data entry', d: 'Adds and edits donors and donations. No status changes', c: 14 },
  { n: 'Accounts', d: 'Donations and receipts only', c: 2 },
  { n: 'Verifier', d: 'Approves donor records. Sees no phone numbers', c: 2 },
  { n: 'Volunteer lead', d: 'Volunteers and events only', c: 3 },
];

interface PermRow {
  area: string;
  action: string;
  cells: string[]; // one per role in RLIST order
}

const PERMS: PermRow[] = [
  { area: 'Donors', action: 'View', cells: ['All', 'All', 'Own town', 'Own town', 'Own town', '—', 'All', '—'] },
  { area: 'Donors', action: 'Add and edit', cells: ['✓', '✓', '✓', '✓', '✓', '—', '—', '—'] },
  { area: 'Donors', action: 'Delete or merge', cells: ['✓', '—', '—', '—', '—', '—', '—', '—'] },
  { area: 'Requests', action: 'Answer and close', cells: ['✓', '✓', '✓', '✓', '—', '—', '—', '—'] },
  { area: 'Inventory', action: 'Update stock', cells: ['✓', '—', '✓', '—', '✓', '—', '—', '—'] },
  { area: 'Ledger', action: 'Record donations', cells: ['✓', '✓', '✓', '✓', '✓', '✓', '—', '—'] },
  { area: 'Money', action: 'Verify receipts', cells: ['✓', '✓', '—', '—', '—', '✓', '✓', '—'] },
  { area: 'Website', action: 'Edit and publish', cells: ['✓', '✓', '—', '—', '—', '—', '—', '✓'] },
  { area: 'Settings', action: 'Change the rules', cells: ['✓', '—', '—', '—', '—', '—', '—', '—'] },
  { area: 'Staff', action: 'Manage accounts', cells: ['✓', '—', '—', '—', '—', '—', '—', '—'] },
];

const STAFF: [string, string, string, string][] = [
  ['Olus Yar', 'Head office', 'All', 'now'],
  ['Dr. Naseer Muhammad', 'Verifier', 'All', '2 hours ago'],
  ['Zhob coordinator', 'Branch manager', 'Zhob', 'yesterday'],
  ['Pishin desk', 'Data entry', 'Pishin', '3 days ago'],
];

function permCell(c: string) {
  if (c === '✓') return <span className="yes">✓</span>;
  if (c === '—') return <span className="no2">—</span>;
  return <span className="scopetag">{c}</span>;
}

export default function AdminRoles() {
  const actions = (
    <>
      <span style={css('margin-left:auto')} />
      <button className="btn btn-p btn-s" onClick={() => alert('New role — wires to POST /roles (T1).')}>+ New role</button>
    </>
  );

  return (
    <AdminShell view="roles" title="Roles & access" subtitle="8 roles · 36 people" actions={actions}>
      <div className="rolegrid">
        {RLIST.map((r) => (
          <div key={r.n} className="acard" style={css('padding:16px')}>
            <b style={css('font-size:15px')}>{r.n}</b>
            <p className="sm" style={css('margin-top:6px;line-height:1.5')}>{r.d}</p>
            <span className="tag gy" style={css('margin-top:10px')}>{r.c} {r.c === 1 ? 'person' : 'people'}</span>
          </div>
        ))}
      </div>

      <div className="acard" style={css('margin-top:18px;padding:0;overflow:auto')}>
        <div style={css('padding:20px 22px 10px')}>
          <h3>What each role can do</h3>
          <p className="sm" style={css('margin-top:4px')}>Every cell is a switch. A new role starts as a copy of the nearest one.</p>
        </div>
        <table className="permtbl">
          <thead>
            <tr>
              <th>Area</th><th>Action</th>
              {RLIST.map((r) => <th key={r.n}>{r.n}</th>)}
            </tr>
          </thead>
          <tbody>
            {PERMS.map((p) => (
              <tr key={`${p.area}-${p.action}`}>
                <td className="pa">{p.area}</td>
                <td className="pact">{p.action}</td>
                {p.cells.map((c, i) => <td key={i} className="pc">{permCell(c)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="g2" style={css('gap:18px;margin-top:18px')}>
        <div className="acard">
          <h3 style={css('margin-bottom:6px')}>&quot;Own town&quot; is a rule in the database</h3>
          <p className="sm">Not a hidden menu. A Zhob employee asking for donors gets Zhob rows — there is no address they can type that returns Quetta&apos;s. Try it with the role switcher.</p>
        </div>
        <div className="acard" style={css('border-color:#F0BDB6')}>
          <h3 style={css('margin-bottom:6px;color:var(--red-d)')}>Three things nobody has by default</h3>
          <p className="sm">Deleting a record, exporting the donor list, and granting a child&apos;s photo consent. Head office only, and each one is written to the log with a reason.</p>
        </div>
      </div>

      <div className="acard" style={css('margin-top:18px')}>
        <h3 style={css('margin-bottom:14px')}>Staff accounts</h3>
        <div className="atbl" style={css('border:0')}>
          <table>
            <tbody>
              {STAFF.map(([n, r, t, l]) => (
                <tr key={n}>
                  <td className="m2"><div className="nm">{n}</div><div className="sm">{r} · {t}</div></td>
                  <td className="m1">{r}</td>
                  <td>{t}</td>
                  <td className="m3 sm">{l}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link href="/admin/accounts" className="btn btn-o" style={css('margin-top:14px')}>Create an account instead</Link>
      </div>
    </AdminShell>
  );
}
