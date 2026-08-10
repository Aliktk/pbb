'use client';

import { useMemo, useState } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { DonorSheet } from '../../../components/admin/DonorSheet';
import { GROUPS, elig, allNegative, daysSince, type Donor } from '../../../lib/admin';
import { TOWNS } from '../../../lib/nav';
import { DONORS } from '../../../lib/adminData';

function bgTag(g: string) {
  return <span className={`abg${g.includes('−') ? ' r' : ''}`}>{g}</span>;
}
function screenTag(d: Donor) {
  const c = allNegative(d.tests);
  if (c === null) return <span className="tag gy">Not screened</span>;
  return c ? <span className="tag ok">Clear</span> : <span className="tag no">Reactive</span>;
}

export default function AdminDonors() {
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('');
  const [town, setTown] = useState('');
  const [open, setOpen] = useState<Donor | null>(null);

  const list = useMemo(() => {
    const s = q.toLowerCase();
    return DONORS.filter(
      (d) =>
        (!s || d.n.toLowerCase().includes(s) || d.p.includes(s) || d.mr.toLowerCase().includes(s)) &&
        (!group || d.g === group) &&
        (!town || d.c === town),
    );
  }, [q, group, town]);

  const actions = (
    <>
      <span style={css('margin-left:auto')} />
      <button className="btn btn-p btn-s" onClick={() => alert('Add donor — form wires to POST /donors (T2).')}>+ Add donor</button>
    </>
  );

  return (
    <AdminShell view="donors" title="Donor register" subtitle={`${list.length} ${list.length === 1 ? 'donor' : 'donors'}`} actions={actions}>
      <div className="afilters">
        <input className="fld" style={css('flex:1;min-width:190px')} placeholder="Search name, phone or MR number…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="fld" style={css('width:auto')} value={group} onChange={(e) => setGroup(e.target.value)}>
          <option value="">All groups</option>
          {GROUPS.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select className="fld" style={css('width:auto')} value={town} onChange={(e) => setTown(e.target.value)}>
          <option value="">All towns</option>
          {TOWNS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="atbl">
        <table>
          <thead>
            <tr><th>MR No</th><th>Name</th><th>Group</th><th>Phone</th><th>Town</th><th>Screened</th><th>Last donated</th><th>Status</th></tr>
          </thead>
          <tbody>
            {list.length ? (
              list.map((d) => {
                const n = daysSince(d.last);
                return (
                  <tr key={d.id} onClick={() => setOpen(d)}>
                    <td className="mono2 m1">{d.mr || '—'}</td>
                    <td className="m2"><div className="nm">{d.n}</div><div className="sm">{d.mr || d.c} · {d.p}</div></td>
                    <td>{bgTag(d.g)}</td>
                    <td className="mono2 m1">{d.p}</td>
                    <td className="m1">{d.c}</td>
                    <td className="m3">{screenTag(d)}</td>
                    <td>{n !== null ? `${n} days ago` : <span className="sm">Never</span>}</td>
                    <td className="m3"><span className={`tag ${elig(d).tag}`}>{elig(d).lab}</span></td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={8} className="aempty">No donors match. <b>Add the first one.</b></td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="ahint">
        Every column of the branch Donor Diary is here — MR number, group and RH, age, contact, emergency
        contact and relationship, address, quantity, frequency, mode of issue, and the five screening
        results. What the book could not do is work out for itself whether somebody can give <b>today</b>,
        or that a screening result has gone stale. That is the whole difference.
      </p>

      <DonorSheet donor={open} onClose={() => setOpen(null)} />
    </AdminShell>
  );
}
