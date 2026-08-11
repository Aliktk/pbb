'use client';

import { useEffect, useState } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { fetchDonors } from '../../../lib/donors';
import { fetchTowns, type Town } from '../../../lib/towns';
import { splitGroup } from '../../../lib/bloodGroup';
import { BLOOD_GROUPS } from '../../../lib/nav';
import type { DonorRow } from '../../../lib/apiTypes';

const ELIGIBILITY: Record<string, { lab: string; tag: string }> = {
  ELIGIBLE: { lab: 'Can give', tag: 'ok' },
  COOLDOWN: { lab: 'Cooldown', tag: 'wt' },
  SCREENING_STALE: { lab: 'Screen again', tag: 'wt' },
  REACTIVE: { lab: 'Reactive', tag: 'no' },
  NEVER_SCREENED: { lab: 'Not screened', tag: 'gy' },
  DEFERRED: { lab: 'Deferred', tag: 'no' },
  REMOVED: { lab: 'Removed', tag: 'gy' },
};

function bgTag(g: string) {
  return <span className={`abg${g.includes('−') ? ' r' : ''}`}>{g}</span>;
}

function daysSince(iso: string | null): number | null {
  return iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000) : null;
}

export default function AdminDonors() {
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('');
  const [town, setTown] = useState('');
  const [towns, setTowns] = useState<Town[]>([]);
  const [rows, setRows] = useState<DonorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTowns().then(setTowns).catch(() => setTowns([]));
  }, []);

  // Refetch when filters change (debounced so typing does not hammer the database).
  useEffect(() => {
    const handle = setTimeout(() => {
      const { bloodGroup, rhFactor } = group ? splitGroup(group) : { bloodGroup: undefined, rhFactor: undefined };
      setLoading(true);
      setError(null);
      fetchDonors({ q, bloodGroup, rhFactor, townId: town || undefined })
        .then(setRows)
        .catch((err) => setError(err instanceof Error ? err.message : 'Could not load donors.'))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [q, group, town]);

  const actions = (
    <>
      <span style={css('margin-left:auto')} />
      <button type="button" className="btn btn-p btn-s" onClick={() => showToast('Add donor wires to POST /donors')}>+ Add donor</button>
    </>
  );

  return (
    <AdminShell view="donors" title="Donor register" subtitle={`${rows.length} shown`} actions={actions}>
      <div className="afilters">
        <input className="fld" style={css('flex:1;min-width:190px')} placeholder="Search name, phone or MR number…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="fld" style={css('width:auto')} value={group} onChange={(e) => setGroup(e.target.value)}>
          <option value="">All groups</option>
          {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select className="fld" style={css('width:auto')} value={town} onChange={(e) => setTown(e.target.value)}>
          <option value="">All towns</option>
          {towns.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {error ? (
        <div className="acard aempty">
          <h3>Could not load donors</h3>
          <p style={css('margin-top:8px')}>{error}</p>
        </div>
      ) : (
        <div className="atbl">
          <table>
            <thead>
              <tr><th>MR No</th><th>Name</th><th>Group</th><th>Phone</th><th>Town</th><th>Last donated</th><th>Status</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="aempty">Loading donors…</td></tr>
              ) : rows.length ? (
                rows.map((d) => {
                  const n = daysSince(d.lastDonatedAt);
                  const e = ELIGIBILITY[d.eligibility] ?? { lab: d.eligibility, tag: 'gy' };
                  return (
                    <tr key={d.id}>
                      <td className="mono2 m1">{d.mrNo || '-'}</td>
                      <td className="m2"><div className="nm">{d.name}</div><div className="sm">{d.mrNo || d.town} · {d.phone ?? 'no phone'}</div></td>
                      <td>{bgTag(d.group)}</td>
                      <td className="mono2 m1">{d.phone ?? '-'}</td>
                      <td className="m1">{d.town ?? '-'}</td>
                      <td>{n !== null ? `${n} days ago` : <span className="sm">Never</span>}</td>
                      <td className="m3"><span className={`tag ${e.tag}`}>{e.lab}</span></td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={7} className="aempty">No donors match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="ahint">
        Whether somebody can give <b>today</b> is worked out by the database eligibility view, not by hand,
        so this register, the record sheet and the search can never disagree.
      </p>
    </AdminShell>
  );
}
