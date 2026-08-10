'use client';

import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';

// Volunteer stage in the sign-up-to-active pipeline.
type VolStage = 'new' | 'contacted' | 'active';

interface Volunteer {
  n: string;
  c: string;
  sk: string;
  st: VolStage;
}

// Screen-specific sample data, ported from VOLS in pbb-admin2.js. Design phase only.
const VOLS: Volunteer[] = [
  { n: 'Hafeez Ullah', c: 'Quetta', sk: 'Camps', st: 'new' },
  { n: 'Sabir Khan', c: 'Zhob', sk: 'Outreach', st: 'active' },
  { n: 'Naveed Ahmed', c: 'Pishin', sk: 'Driving', st: 'contacted' },
  { n: 'Asma Bibi', c: 'Quetta', sk: 'Office', st: 'active' },
  { n: 'Rahim Dad', c: 'Loralai', sk: 'Camps', st: 'new' },
];

function stageTag(st: VolStage) {
  if (st === 'new') return <span className="tag no">Not contacted</span>;
  if (st === 'active') return <span className="tag ok">Active</span>;
  return <span className="tag wt">Contacted</span>;
}

export default function AdminVolunteers() {
  const list = VOLS; // head-office scope: all towns
  const actions = (
    <>
      <span style={css('margin-left:auto')} />
      <button type="button" className="btn btn-p btn-s" onClick={() => showToast('Adding a volunteer wires to the API')}>+ Add volunteer</button>
    </>
  );

  return (
    <AdminShell view="volunteers" title="Volunteers" subtitle={`${list.length} ${list.length === 1 ? 'person' : 'people'}`} actions={actions}>
      <div className="akpi">
        <div className="c"><div className="l">Not yet contacted</div><div className="n r">{list.filter((v) => v.st === 'new').length}</div></div>
        <div className="c"><div className="l">Contacted</div><div className="n">{list.filter((v) => v.st === 'contacted').length}</div></div>
        <div className="c"><div className="l">Active</div><div className="n">{list.filter((v) => v.st === 'active').length}</div></div>
        <div className="c"><div className="l">Total</div><div className="n">{list.length}</div></div>
      </div>

      <div className="atbl">
        <table>
          <thead><tr><th>Name</th><th>Town</th><th>Can help with</th><th>Stage</th></tr></thead>
          <tbody>
            {list.map((v) => (
              <tr key={v.n}>
                <td className="m2"><div className="nm">{v.n}</div><div className="sm">{v.c} · {v.sk}</div></td>
                <td>{v.c}</td>
                <td>{v.sk}</td>
                <td className="m3">{stageTag(v.st)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="ahint">
        Volunteers who signed up and were never called are the most common failure of any volunteer
        programme. That count sits first, in red, for a reason.
      </p>
    </AdminShell>
  );
}
