'use client';

import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';

interface EventRow {
  n: string; // event
  k: string; // kind
  d: string; // date
  c: string; // town
  a: string; // attending
  s: 'live' | 'draft';
}

const EVENTS: EventRow[] = [
  { n: 'Free donation camp', k: 'Camp', d: '12 Sep', c: 'Pishin', a: '48', s: 'live' },
  { n: 'University awareness drive', k: 'Awareness', d: '28 Sep', c: 'Quetta', a: '—', s: 'draft' },
  { n: 'Eid ul Adha hide collection', k: 'Campaign', d: 'seasonal', c: 'All', a: '—', s: 'live' },
];

const ATTENDEES: [string, string, string][] = [
  ['Hameed Ullah', 'O+', 'Pishin'],
  ['Sana Gul', 'B−', 'Pishin'],
  ['Abdul Manan', 'A+', 'Huramzai'],
];

function bgTag(g: string) {
  return <span className={`abg${g.includes('−') ? ' r' : ''}`}>{g}</span>;
}

export default function AdminEvents() {
  const actions = (
    <>
      <span style={css('margin-left:auto')} />
      <button className="btn btn-p btn-s" onClick={() => alert('New event — wires to POST /events (T7).')}>+ New event</button>
    </>
  );

  return (
    <AdminShell view="events" title="Events & campaigns" subtitle="3 upcoming" actions={actions}>
      <div className="akpi">
        <div className="c"><div className="l">Upcoming</div><div className="n r">3</div></div>
        <div className="c"><div className="l">Registered to attend</div><div className="n">48</div></div>
        <div className="c"><div className="l">Past events</div><div className="n">61</div></div>
        <div className="c"><div className="l">Campaigns running</div><div className="n">1</div></div>
      </div>

      <div className="atbl">
        <table>
          <thead>
            <tr><th>Event</th><th>Kind</th><th>Date</th><th>Town</th><th>Attending</th><th>Status</th></tr>
          </thead>
          <tbody>
            {EVENTS.map((e) => (
              <tr key={e.n}>
                <td className="m2"><div className="nm">{e.n}</div><div className="sm">{e.k} · {e.c}</div></td>
                <td className="m1">{e.k}</td>
                <td className="sm">{e.d}</td>
                <td>{e.c}</td>
                <td>{e.a}</td>
                <td className="m3">{e.s === 'live' ? <span className="tag ok">Published</span> : <span className="tag gy">Draft</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="acard" style={css('margin-top:18px')}>
        <h3 style={css('margin-bottom:6px')}>Who is coming — Pishin camp</h3>
        <p className="sm" style={css('margin-bottom:14px')}>People who registered on the website.</p>
        {ATTENDEES.map(([n, g, c]) => (
          <div key={n} className="row" style={css('padding:11px 0;border-bottom:1px solid var(--line)')}>
            {bgTag(g)}
            <span style={css('flex:1;font-weight:600')}>{n}</span>
            <span className="sm">{c}</span>
            <button className="btn btn-o btn-s" onClick={() => alert('Add to the register — wires to POST /donors (T2).')}>Add to the register</button>
          </div>
        ))}
        <p className="ahint">
          A camp should grow the register. Adding an attendee straight to the donor list is the whole reason to take
          registrations here instead of on paper.
        </p>
      </div>
    </AdminShell>
  );
}
