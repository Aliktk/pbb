'use client';

import { useState, type FormEvent } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { api, ApiError } from '../../../lib/api';
import { splitGroup } from '../../../lib/bloodGroup';
import { BLOOD_GROUPS, TOWNS } from '../../../lib/nav';
import { TOWN_COORDS, haversineKm, resolveTownOrigin, type LatLng } from '../../../lib/geo';
import type { Paged, DonorRow } from '../../../lib/apiTypes';
import { DonorSheet } from '../../../components/admin/DonorSheet';
import { CustomSelect } from '../../../components/CustomSelect';
import { Icon } from '../../../components/Icon';

// Find donors - the emergency search, wired to GET /donors/search. Eligibility comes from the
// database view (the API only returns callable, consenting donors). Distance and the radius are
// worked out here from each donor's town, ordered nearest-first, or by longest-since-donation
// when there is no origin so the same people are not exhausted.

const RADII = [5, 10, 25, 50, 100] as const;
const RADIUS_OPTIONS = RADII.map((r) => ({ value: String(r), label: `${r} km` }));
const TOWN_OPTIONS = [{ value: '', label: 'All towns / Any location' }, ...TOWNS.map((t) => ({ value: t, label: t }))];

interface ResultRow {
  donor: DonorRow;
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

function daysSince(iso: string | null): number | null {
  return iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000) : null;
}

export default function AdminFind() {
  const [group, setGroup] = useState('O+');
  const [city, setCity] = useState('');
  const [radius, setRadius] = useState<number>(25);
  const [includeCooldown, setIncludeCooldown] = useState(false);
  const [geo, setGeo] = useState<LatLng | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [called, setCalled] = useState<Set<string>>(new Set());
  const [selectedDonor, setSelectedDonor] = useState<{ donor: DonorRow; km: number | null } | null>(null);

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

  async function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const typed = resolveTownOrigin(city);
    const origin = typed ? { label: typed.town, at: typed.at } : geo ? { label: 'your location', at: geo } : null;
    const { bloodGroup, rhFactor } = splitGroup(group);

    try {
      const params = new URLSearchParams({ group: bloodGroup, rh: rhFactor, includeCooldown: String(includeCooldown) });
      const res = await api.get<Paged<DonorRow>>(`/donors/search?${params.toString()}`);

      const withDist: ResultRow[] = res.data.map((donor) => {
        const coord = donor.town ? TOWN_COORDS[donor.town] ?? null : null;
        return { donor, km: origin && coord ? haversineKm(origin.at, coord) : null };
      });

      const rows = (origin ? withDist.filter((r) => r.km !== null && r.km <= radius) : withDist).sort((a, b) =>
        origin
          ? (a.km ?? Infinity) - (b.km ?? Infinity)
          : (daysSince(b.donor.lastDonatedAt) ?? 9999) - (daysSince(a.donor.lastDonatedAt) ?? 9999),
      );

      setResult({ rows, group, originLabel: origin?.label ?? null, radius });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not run the search. Is the API running?');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  const toggleCalled = (id: string) =>
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
          {BLOOD_GROUPS.map((g) => (
            <button type="button" key={g} className={`bgp${g === group ? ' on' : ''}`} onClick={() => setGroup(g)}>{g}</button>
          ))}
        </div>

        <div className="g2" style={css('gap:14px;align-items:end')}>
          <div>
            <label className="lb">City / area</label>
            <div className="row" style={{ gap: '8px', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '170px' }}>
                <CustomSelect
                  name="city"
                  options={TOWN_OPTIONS}
                  value={city}
                  onChange={(val) => setCity(val)}
                  placeholder="Select or type city..."
                />
              </div>
              <button
                type="button"
                className="btn btn-o btn-s"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', height: '42px', padding: '0 14px' }}
                onClick={useMyLocation}
              >
                <Icon name="location" size={15} />
                Use my location
              </button>
            </div>
          </div>
          <div style={{ minWidth: '130px' }}>
            <label className="lb">Radius</label>
            <CustomSelect
              name="radius"
              options={RADIUS_OPTIONS}
              value={String(radius)}
              onChange={(val) => setRadius(Number(val))}
            />
          </div>
        </div>

        <label className="chk" style={css('margin-top:14px')}>
          <input type="checkbox" checked={includeCooldown} onChange={(e) => setIncludeCooldown(e.target.checked)} />
          <span>Include those in cooldown</span>
        </label>

        <button className="btn btn-p" disabled={loading} style={css('width:100%;margin-top:18px')}>{loading ? 'Searching...' : 'Search Eligible Donors'}</button>
        {geo && !city && <p className="sm" style={css('margin-top:10px')}>Centred on your current location.</p>}
      </form>

      {error && <div className="acard aempty" style={css('margin-top:20px')}><h3>Could not search</h3><p style={css('margin-top:8px')}>{error}</p></div>}

      {result && !error && (
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
                  <tr><th>Donor</th><th>Group</th><th>Town</th><th>Distance</th><th>Last donated</th><th>Contact</th></tr>
                </thead>
                <tbody>
                  {result.rows.map(({ donor, km }) => {
                    const n = daysSince(donor.lastDonatedAt);
                    const isCalled = called.has(donor.id);
                    return (
                      <tr key={donor.id} onClick={() => setSelectedDonor({ donor, km })}>
                        <td className="m2"><div className="nm">{donor.name}</div><div className="sm">{donor.mrNo || 'No MR'} · {donor.timesDonated ? `${donor.timesDonated} donations` : 'never donated'}</div></td>
                        <td>{bgTag(donor.group)}</td>
                        <td className="m1">{donor.town ?? '-'}</td>
                        <td>{km !== null ? `${Math.round(km)} km` : <span className="sm">-</span>}</td>
                        <td>{n !== null ? `${n} days ago` : <span className="sm">Never</span>}</td>
                        <td>
                          <div className="row" style={css('gap:6px')} onClick={(e) => e.stopPropagation()}>
                            {donor.phone ? <a className="btn btn-p btn-s" href={`tel:${donor.phone.replace(/ /g, '')}`}>Call</a> : <span className="sm">no phone</span>}
                            <button type="button" className={`btn btn-s ${isCalled ? 'btn-d' : 'btn-o'}`} onClick={() => toggleCalled(donor.id)}>{isCalled ? 'Called' : 'Mark called'}</button>
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
              <p style={css('margin-top:8px')}>Widen the radius, tick <b>include those in cooldown</b>, or phone the head office in Quetta on <b>081-2836820</b>.</p>
            </div>
          )}

          <p className="ahint">
            {result.originLabel
              ? <>Ordered <b>nearest first</b>, measured to each donor&apos;s town.</>
              : <>No place matched, so this is ordered by <b>longest since last donation</b>. Type a town or use your location to sort by distance and apply the radius.</>}
          </p>
        </>
      )}

      <DonorSheet
        donor={selectedDonor?.donor ?? null}
        distanceKm={selectedDonor?.km}
        isCalled={selectedDonor ? called.has(selectedDonor.donor.id) : false}
        onToggleCalled={toggleCalled}
        onClose={() => setSelectedDonor(null)}
      />
    </AdminShell>
  );
}
