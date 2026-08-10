'use client';

import { useMemo, useState } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { GROUPS, elig, daysSince } from '../../../lib/admin';
import { TOWNS } from '../../../lib/nav';
import { DONORS } from '../../../lib/adminData';

// Find a donor — the emergency search (§8.1). Ordered by longest since last donation so the
// calls spread around instead of exhausting the same three willing people.
export default function AdminFind() {
  const [group, setGroup] = useState('O−');
  const [town, setTown] = useState('Quetta');
  const [onlyElig, setOnlyElig] = useState(true);
  const [called, setCalled] = useState<Set<number>>(new Set());

  const results = useMemo(() => {
    let l = DONORS.filter((d) => d.g === group && d.c === town);
    if (onlyElig) l = l.filter((d) => elig(d).ok);
    return [...l].sort((a, b) => (daysSince(b.last) ?? 9999) - (daysSince(a.last) ?? 9999));
  }, [group, town, onlyElig]);

  const toggleCalled = (id: number) =>
    setCalled((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  return (
    <AdminShell view="find" title="Find a donor" subtitle="Instead of turning pages">
      <div className="acard">
        <label className="lb">Which blood group is needed?</label>
        <div className="row" style={css('gap:8px;margin-bottom:20px')}>
          {GROUPS.map((g) => (
            <button key={g} className={`bgp${g === group ? ' on' : ''}`} onClick={() => setGroup(g)}>{g}</button>
          ))}
        </div>
        <div className="g2" style={css('gap:14px')}>
          <div>
            <label className="lb">Town</label>
            <select className="fld" value={town} onChange={(e) => setTown(e.target.value)}>
              {TOWNS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="lb">Show</label>
            <select className="fld" value={onlyElig ? '0' : '1'} onChange={(e) => setOnlyElig(e.target.value === '0')}>
              <option value="0">Only those who can give today</option>
              <option value="1">Everyone, including cooldown</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row" style={css('margin:20px 0 14px')}>
        <h3>
          {results.length
            ? `${results.length} ${results.length === 1 ? 'donor' : 'donors'} can give ${group} in ${town}`
            : `Nobody on the ${town} register can give ${group} today`}
        </h3>
      </div>

      {results.length ? (
        results.map((d) => {
          const n = daysSince(d.last);
          const isCalled = called.has(d.id);
          return (
            <div className="frow" key={d.id}>
              <div style={css('flex:1;min-width:170px')}>
                <div className="nm">{d.n}</div>
                <div className="sm">{d.times ? `${d.times} donations` : 'never donated'} · {n !== null ? `${n} days since last` : 'no record of a donation'}</div>
              </div>
              <div className="mono2" style={css('font-weight:700')}>{d.p}</div>
              <a className="btn btn-p btn-s" href={`tel:${d.p.replace(/ /g, '')}`}>Call</a>
              <button className={`btn btn-s ${isCalled ? 'btn-d' : 'btn-o'}`} onClick={() => toggleCalled(d.id)}>{isCalled ? 'Called' : 'Mark called'}</button>
            </div>
          );
        })
      ) : (
        <div className="acard aempty">
          <h3>Nobody available</h3>
          <p style={css('margin-top:8px')}>Widen to “everyone including cooldown”, or phone the head office in Quetta on <b>081-2836820</b> and ask them to look on their register.</p>
        </div>
      )}

      <p className="ahint">
        Ordered by <b>longest since last donation</b>, so the calls spread around instead of exhausting the
        same three willing people. Press <b>Called</b> and the next person on shift sees it.
      </p>
    </AdminShell>
  );
}
