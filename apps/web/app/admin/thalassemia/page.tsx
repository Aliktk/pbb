'use client';

import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';

function bgTag(g: string) {
  return <span className={`abg${g.includes('−') ? ' r' : ''}`}>{g}</span>;
}

interface ThalChild {
  id: string;
  n: string;
  a: number;
  g: string;
  c: string;
  due: number; // days to next transfusion; negative = overdue
  sp: 0 | 1; // sponsored
  ph: 0 | 1; // photo consent on file
}

// Screen-specific sample data, ported from THAL in pbb-admin2.js. Design phase only.
const THAL: ThalChild[] = [
  { id: 'T-014', n: 'Habiba', a: 6, g: 'B+', c: 'Quetta', due: -4, sp: 0, ph: 0 },
  { id: 'T-027', n: 'Zarghoona', a: 11, g: 'O+', c: 'Pishin', due: 3, sp: 1, ph: 1 },
  { id: 'T-031', n: 'Naveed', a: 4, g: 'A−', c: 'Zhob', due: 9, sp: 0, ph: 0 },
  { id: 'T-044', n: 'Bilal', a: 8, g: 'O−', c: 'Quetta', due: 1, sp: 1, ph: 0 },
];

export default function AdminThalassemia() {
  const list = THAL; // head-office scope: all towns
  const actions = (
    <>
      <span style={css('margin-left:auto')} />
      <button type="button" className="btn btn-p btn-s" onClick={() => showToast('Adding a patient wires to the API')}>+ Register a child</button>
    </>
  );

  return (
    <AdminShell view="thalassemia" title="Thalassemia register" subtitle="200 children" actions={actions}>
      <div className="akpi">
        <div className="c"><div className="l">Transfusion overdue</div><div className="n r">{list.filter((t) => t.due < 0).length}</div></div>
        <div className="c"><div className="l">Due this week</div><div className="n">{list.filter((t) => t.due >= 0 && t.due <= 7).length}</div></div>
        <div className="c"><div className="l">Registered children</div><div className="n">200</div></div>
        <div className="c"><div className="l">Photo consent on file</div><div className="n">{list.filter((t) => t.ph).length}</div></div>
      </div>

      <div className="atbl">
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Age</th><th>Group</th><th>Next transfusion</th><th>Photo consent</th></tr></thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id}>
                <td className="mono2 m1">{t.id}</td>
                <td className="m2"><div className="nm">{t.n}</div><div className="sm">{t.a} years · {t.c}{t.sp ? ' · sponsored' : ''}</div></td>
                <td>{t.a}</td>
                <td>{bgTag(t.g)}</td>
                <td className={t.due < 0 ? 'red' : undefined} style={css('font-weight:600')}>{t.due < 0 ? `Overdue ${-t.due} days` : `In ${t.due} days`}</td>
                <td className="m3">{t.ph ? <span className="tag ok">On file</span> : <span className="tag gy">Not given</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="ahint">
        Photo consent is <b>off by default</b> and needs a signed form from the family. A child without
        consent is still counted and still transfused - but never appears on the public website.
      </p>
    </AdminShell>
  );
}
