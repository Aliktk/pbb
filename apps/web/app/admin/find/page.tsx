'use client';

import { useState, type FormEvent } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { GROUPS, elig, daysSince, type Donor } from '../../../lib/admin';
import { showToast } from '../../../lib/toast';
import { DONORS } from '../../../lib/adminData';
import { TOWN_COORDS, haversineKm, resolveTownOrigin, type LatLng } from '../../../lib/geo';

// Find donors - the Blood Chain-style emergency search: pick a group, a place and a radius,
// and get the nearest eligible donors to call. Eligibility comes from the ONE shared rule
// (elig → INV-5). Distance uses each town's coordinates now; real per-donor coordinates
// arrive with the API. Ordered nearest-first, or by longest-since-donation when there is no
// origin, so the same three willing people are not exhausted.

const RADII = [5, 10, 25, 50, 100] as const;
const GENDERS = ['Any', 'Male', 'Female'] as const;

interface ResultRow {
  d: Donor;
  km: number | null;
}

interface SearchResult {
  rows: ResultRow[];
  group: string;
  originLabel: string | null;
  radius: number;
}

function bgTag(g: string) {
  return <span className={`abg${g.includes('−') ? ' r' : ''}`}>{g}</span>;
}

export default function AdminFind() {
  const [group, setGroup] = useState('O+');
  const [city, setCity] = useState('');
  const [radius, setRadius] = useState<number>(25);
  const [gender, setGender] = useState<(typeof GENDERS)[number]>('Any');
  const [includeCooldown, setIncludeCooldown] = useState(false);
  const [geo, setGeo] = useState<LatLng | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [called, setCalled] = useState<Set<number>>(new Set());

  function useMyLocation() {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      showToast('This browser cannot share a location. Type a town instead.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setCity('');
        showToast('Using your current location as the centre of the search.');
      },
      () => showToast('Could not read your location. Type a town instead.'),
    );
  }

  function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const typed = resolveTownOrigin(city);
    const origin = typed ? { label: typed.town, at: typed.at } : geo ? { label: 'your location', at: geo } : null;

    let list = DONORS.filter((d) => d.g === group);
    if (gender !== 'Any') list = list.filter((d) => d.gx === gender);
    if (!includeCooldown) list = list.filter((d) => elig(d).ok);

    const withDist: ResultRow[] = list.map((d) => {
      const coord = TOWN_COORDS[d.c] ?? null;
      return { d, km: origin && coord ? haversineKm(origin.at, coord) : null };
    });

    const rows = (origin ? withDist.filter((r) => r.km !== null && r.km <= radius) : withDist).sort((a, b) =>
      origin
        ? (a.km ?? Infinity) - (b.km ?? Infinity)
        : (daysSince(b.d.last) ?? 9999) - (daysSince(a.d.last) ?? 9999),
    );

    setResult({ rows, group, originLabel: origin?.label ?? null, radius });
  }

  const toggleCalled = (id: number) =>
    setCalled((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <AdminShell view="find" title="Find donors" subtitle="Search nearest eligible donors by blood group and location">
      <form className="acard" onSubmit={search}>
        <label className="lb">Blood group</label>
        <div className="row" style={css('gap:8px;margin-bottom:18px')}>
          {GROUPS.map((g) => (
            <button type="button" key={g} className={`bgp${g === group ? ' on' : ''}`} onClick={() => setGroup(g)}>
              {g}
            </button>
          ))}
        </div>

        <div className="g2" style={css('gap:14px;align-items:end')}>
          <div>
            <label className="lb">City / area</label>
            <div className="row" style={css('gap:8px')}>
              <input
                className="fld"
                style={css('flex:1;min-width:150px')}
                placeholder="e.g. Quetta"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <button type="button" className="btn btn-o btn-s" onClick={useMyLocation}>
                Use my location
              </button>
            </div>
          </div>
          <div>
            <label className="lb">Radius</label>
            <select className="fld" value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
              {RADII.map((r) => (
                <option key={r} value={r}>{r} km</option>
              ))}
            </select>
          </div>
        </div>

        <div className="g2" style={css('gap:14px;margin-top:14px;align-items:end')}>
          <div>
            <label className="lb">Gender</label>
            <select className="fld" value={gender} onChange={(e) => setGender(e.target.value as (typeof GENDERS)[number])}>
              {GENDERS.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
          <label className="chk" style={css('align-self:center;margin-top:20px')}>
            <input type="checkbox" checked={includeCooldown} onChange={(e) => setIncludeCooldown(e.target.checked)} />
            <span>Include those in cooldown</span>
          </label>
        </div>

        <button className="btn btn-p" style={css('width:100%;margin-top:18px')}>Search Eligible Donors</button>
        {geo && !city && <p className="sm" style={css('margin-top:10px')}>Centred on your current location.</p>}
      </form>

      {result && (
        <>
          <div className="row" style={css('margin:20px 0 12px')}>
            <h3>
              {result.rows.length
                ? `${result.rows.length} ${result.rows.length === 1 ? 'donor' : 'donors'} - ${result.group}${result.originLabel ? ` within ${result.radius} km of ${result.originLabel}` : ''}`
                : `No ${result.group} donor found${result.originLabel ? ` within ${result.radius} km of ${result.originLabel}` : ''}`}
            </h3>
          </div>

          {result.rows.length ? (
            <div className="atbl">
              <table>
                <thead>
                  <tr>
                    <th>Donor</th><th>Group</th><th>City</th><th>Gender</th><th>Distance</th><th>Last donated</th><th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map(({ d, km }) => {
                    const n = daysSince(d.last);
                    const isCalled = called.has(d.id);
                    return (
                      <tr key={d.id}>
                        <td className="m2"><div className="nm">{d.n}</div><div className="sm">{d.mr} · {d.times ? `${d.times} donations` : 'never donated'}</div></td>
                        <td>{bgTag(d.g)}</td>
                        <td className="m1">{d.c}</td>
                        <td className="m1">{d.gx}</td>
                        <td>{km !== null ? `${Math.round(km)} km` : <span className="sm">-</span>}</td>
                        <td>{n !== null ? `${n} days ago` : <span className="sm">Never</span>}</td>
                        <td>
                          <div className="row" style={css('gap:6px')}>
                            <a className="btn btn-p btn-s" href={`tel:${d.p.replace(/ /g, '')}`}>Call</a>
                            <button type="button" className={`btn btn-s ${isCalled ? 'btn-d' : 'btn-o'}`} onClick={() => toggleCalled(d.id)}>
                              {isCalled ? 'Called' : 'Mark called'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="acard aempty">
              <h3>Nobody available</h3>
              <p style={css('margin-top:8px')}>
                Widen the radius, tick <b>include those in cooldown</b>, or phone the head office in Quetta on{' '}
                <b>081-2836820</b> and ask them to look on their register.
              </p>
            </div>
          )}

          <p className="ahint">
            {result.originLabel
              ? <>Ordered <b>nearest first</b>. Distance is measured to each donor&apos;s town for now; precise per-donor coordinates arrive with the register API.</>
              : <>No place matched, so this is ordered by <b>longest since last donation</b> - the calls spread around instead of exhausting the same three people. Type a town or use your location to sort by distance and apply the radius.</>}
          </p>
        </>
      )}

      {!result && (
        <p className="ahint" style={css('margin-top:18px')}>
          Pick a group and a place, then <b>Search Eligible Donors</b>. Only those who can give today are shown
          unless you include cooldown - the eligibility rule is the same one the register and the record sheet use.
        </p>
      )}
    </AdminShell>
  );
}
