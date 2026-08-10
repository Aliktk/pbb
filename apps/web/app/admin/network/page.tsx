import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { TOWNS } from '../../../lib/nav';
import { DONORS } from '../../../lib/adminData';

// Standing, open requests and last stock update per town. The donor count is counted from the
// register by townCount() - no screen keeps its own copy of that number. The list of towns
// itself is TOWNS (the one shared source). Ported from the prototype's CITYINFO/CITIES.
const CITYINFO: Record<string, [string, number, string]> = {
  Quetta: ['Head office', 4, 'today'],
  Pishin: ['Branch', 1, 'today'],
  Loralai: ['Branch', 0, '2 days'],
  Zhob: ['Branch', 1, '9 days'],
  Chaman: ['Branch', 0, 'never'],
  'Muslim Bagh': ['Branch', 0, '4 days'],
  'Killa Saifullah': ['Served from Muslim Bagh', 0, '-'],
  Dukki: ['Served from Loralai', 0, '-'],
  Musakhel: ['Served from Loralai', 0, '-'],
  Sherani: ['Served from Zhob', 0, '-'],
  Harnai: ['Served from Quetta', 0, '-'],
  Ziarat: ['Served from Quetta', 0, '-'],
  'Qila Abdullah': ['Served from Chaman', 0, '-'],
  Sibi: ['Served from Quetta', 0, '-'],
};

const townCount = (t: string): number => DONORS.filter((d) => d.c === t).length;

const CITIES: [string, string, number, string][] = TOWNS.map((t) => {
  const info = CITYINFO[t] ?? (['Served from Quetta', 0, '-'] as [string, number, string]);
  return [t, ...info];
});

export default function AdminNetwork() {
  const openTotal = CITIES.reduce((a, c) => a + c[2], 0);

  const actions = (
    <>
      <span style={css('margin-left:auto')} />
      {/* head-office-only in production */}
      <a className="btn btn-p btn-s" href="#">+ Add a town</a>
    </>
  );

  return (
    <AdminShell view="network" title="The network" subtitle="14 towns" actions={actions}>
      <div className="akpi">
        <div className="c"><div className="l">Towns covered</div><div className="n">{TOWNS.length}</div></div>
        <div className="c"><div className="l">With a permanent office</div><div className="n">6</div></div>
        <div className="c"><div className="l">Donors across the network</div><div className="n">{DONORS.length.toLocaleString()}</div></div>
        <div className="c"><div className="l">Open requests, all towns</div><div className="n r">{openTotal}</div></div>
      </div>

      <div className="atbl">
        <table>
          <thead><tr><th>Town</th><th>Standing</th><th>Donors</th><th>Open requests</th><th>Stock updated</th></tr></thead>
          <tbody>
            {CITIES.map(([n, k, r, u]) => (
              <tr key={n}>
                <td className="m2"><div className="nm">{n}</div><div className="sm">{k}</div></td>
                <td className="m1 sm">{k}</td>
                <td>{townCount(n).toLocaleString()}</td>
                <td>{r ? <span className="tag no">{r}</span> : <span className="sm">-</span>}</td>
                <td className={`m3 ${/never|9 days/.test(u) ? 'red' : 'sm'}`} style={css('font-weight:600')}>{u}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="g2" style={css('gap:18px;margin-top:18px')}>
        <div className="acard">
          <h3 style={css('margin-bottom:6px')}>Adding a town</h3>
          <p className="sm">A town joins when the organising committee approves it and appoints a manager. It starts with its own empty register and its own staff accounts - nothing is shared until somebody chooses to share it.</p>
          {/* head-office-only in production */}
          <a className="btn btn-o" style={css('margin-top:16px')} href="#">Add a town</a>
        </div>
        <div className="acard">
          <h3 style={css('margin-bottom:6px')}>When one town cannot help</h3>
          <p className="sm">Any branch can see what every other branch holds - stock and open requests, never personal details. Donors are only called by their own town unless they have agreed to be contacted from elsewhere, which is on by default.</p>
        </div>
      </div>

      <p className="ahint">Built for fourteen towns today and for whatever comes after. Nothing in the design assumes there is only one organisation.</p>
    </AdminShell>
  );
}
