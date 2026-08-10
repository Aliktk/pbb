'use client';

import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { TOWNS } from '../../../lib/nav';
import { DONORS } from '../../../lib/adminData';

interface Branch {
  n: string; // branch / town
  a: string; // address
  p: string; // phone
  u: string; // stock updated
  head: 0 | 1; // is head office
}

const BRANCHES: Branch[] = [
  { n: 'Quetta', a: 'Zainab Chamber, Shara-e-Adalat', p: '081-2836820', u: 'today', head: 1 },
  { n: 'Loralai', a: 'Sayed Abdul Qadir Road', p: '0824-662066', u: '2 days ago', head: 0 },
  { n: 'Pishin', a: 'Band Road', p: '0826-421288', u: 'today', head: 0 },
  { n: 'Zhob', a: 'Sharbat Khan Road', p: '0822-413902', u: '9 days ago', head: 0 },
  { n: 'Chaman', a: 'Taj Road', p: '—', u: 'never', head: 0 },
  { n: 'Muslim Bagh', a: 'Aryan Market', p: '—', u: '4 days ago', head: 0 },
];

// The six towns that have a branch office (mirrors OFFICES in the prototype).
const OFFICES = ['Quetta', 'Pishin', 'Zhob', 'Loralai', 'Chaman', 'Muslim Bagh'];

// Donor count for a town, counted from the register (mirrors townCount in the prototype).
const townCount = (t: string): number => DONORS.filter((d) => d.c === t).length;

export default function AdminBranches() {
  const actions = (
    <>
      <span style={css('margin-left:auto')} />
      {/* head-office-only in production */}
      <button className="btn btn-p btn-s" onClick={() => alert('Add branch — wires to POST /branches (T9).')}>+ Add branch</button>
    </>
  );

  return (
    <AdminShell view="branches" title="Branches" subtitle="6 offices · 14 towns" actions={actions}>
      <div className="atbl">
        <table>
          <thead>
            <tr><th>Branch</th><th>Address</th><th>Phone</th><th>Donors</th><th>Stock updated</th></tr>
          </thead>
          <tbody>
            {BRANCHES.map((b) => (
              <tr key={b.n}>
                <td className="m2">
                  <div className="nm">{b.n}{b.head ? <> <span className="hd-tag">HEAD OFFICE</span></> : null}</div>
                  <div className="sm">{b.a}</div>
                </td>
                <td className="sm">{b.a}</td>
                <td className="mono2 m1">{b.p}</td>
                <td>{townCount(b.n).toLocaleString()}</td>
                <td className={`m3 ${/never|9 days/.test(b.u) ? 'red' : ''}`} style={css('font-weight:600')}>{b.u}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="acard" style={css('margin-top:18px')}>
        <h3 style={css('margin-bottom:6px')}>Towns served without an office</h3>
        <p className="sm" style={css('margin-bottom:14px')}>These feed the town list on every form across the website.</p>
        {TOWNS.filter((t) => !OFFICES.includes(t)).map((t) => (
          <span key={t} className="chip">{t}</span>
        ))}
        <span className="chip" style={css('border-style:dashed;color:var(--red)')}>+ add a town</span>
      </div>

      <p className="ahint">
        &quot;Stock updated&quot; is the accountability column. A branch that has not updated in a week is the reason the
        public shortage strip would go stale.
      </p>
    </AdminShell>
  );
}
