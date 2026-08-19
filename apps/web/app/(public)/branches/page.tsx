'use client';

import { useEffect, useState } from 'react';
import { ImageSlot } from '../../../components/ImageSlot';
import { css } from '../../../lib/style';
import { TOWNS } from '../../../lib/nav';
import { IMG } from '../../../lib/images';
import { fetchOffices, type Office } from '../../../lib/offices';

// Our branches - office contact details come from the database (towns table, migration 0006), so
// what each office edits in the admin shows here at once. A static list is used as a fallback while
// loading or if the database cannot be reached, so the page is never empty.
const FALLBACK: Office[] = [
  { id: 'quetta', name: 'Quetta', isHeadOffice: true, address: 'Zainab Chamber, Shara-e-Adalat, near Quetta Press Club', phones: ['081-2836820', '081-2839500'], email: null, bank: null, hasAmbulance: true },
  { id: 'loralai', name: 'Loralai', isHeadOffice: false, address: 'Sayed Abdul Qadir Road', phones: ['0824-662066'], email: null, bank: 'UBL Loralai · A/C 2101-1', hasAmbulance: false },
  { id: 'pishin', name: 'Pishin', isHeadOffice: false, address: 'Band Road', phones: ['0826-421288'], email: null, bank: 'NBP Pishin · A/C 4589-93', hasAmbulance: false },
  { id: 'zhob', name: 'Zhob', isHeadOffice: false, address: 'Sharbat Khan Road', phones: ['0822-413902'], email: null, bank: 'Bank Islami Zhob · A/C 1048-0088676-0001', hasAmbulance: false },
  { id: 'chaman', name: 'Chaman', isHeadOffice: false, address: 'Khushi Muhammad Road, District Chaman', phones: ['0333-3151503', '0826-612281'], email: 'pbb.chaman@gmail.com', bank: null, hasAmbulance: false },
  { id: 'muslimbagh', name: 'Muslim Bagh', isHeadOffice: false, address: 'Aryan Market, Muslim Bagh Bazar', phones: [], email: null, bank: null, hasAmbulance: false },
];

export default function Branches() {
  const [offices, setOffices] = useState<Office[]>(FALLBACK);

  useEffect(() => {
    let alive = true;
    fetchOffices()
      .then((data) => { if (alive && data.length) setOffices(data); })
      .catch(() => { /* keep the fallback list */ });
    return () => { alive = false; };
  }, []);

  const officeNames = new Set(offices.map((o) => o.name));
  const alsoServing = TOWNS.filter((t) => !officeNames.has(t));

  return (
    <>
      <header className="ph-hero">
        <div className="wrap">
          <span className="eyebrow"><b />Our branches</span>
          <h1>Six offices.<br />Fourteen towns.</h1>
          <p className="lead" style={css('margin-top:18px;max-width:62ch')}>From the head office beside the Quetta Press Club out to Zhob, Chaman and Loralai - and to the towns in between that have no blood bank of their own.</p>
        </div>
      </header>
      <section className="blk" style={css('padding-top:0')}>
        <div className="wrap">
          <div className="g2" style={css('gap:34px;align-items:start')}>
            <div style={css('display:grid;gap:12px')}>
              {offices.map((b) => (
                <div key={b.id} className="brc">
                  <div style={css('flex:1')}>
                    <div className="bn">{b.name}{b.isHeadOffice ? <> <span className="hd-tag">HEAD OFFICE</span></> : null}</div>
                    <div className="ba">{b.address ?? 'Address to follow'}</div>
                    {b.phones.length ? (
                      <div className="bt">{b.phones.map((t, i) => (
                        <span key={t}>{i > 0 ? ' · ' : ''}<a href={`tel:${t.replace(/-/g, '')}`}>{t}</a></span>
                      ))}</div>
                    ) : <div className="bt muted">Phone number to follow</div>}
                    {b.email ? <div className="bt"><a href={`mailto:${b.email}`}>{b.email}</a></div> : null}
                    {b.bank ? <div className="bbank">{b.bank}</div> : null}
                    {b.hasAmbulance ? <span className="tag ok" style={css('margin-top:9px')}>Ambulance service · 24 hours</span> : null}
                  </div>
                  <a className="btn btn-o btn-s" href={`https://maps.google.com/?q=${encodeURIComponent(b.name + ' Balochistan')}`} target="_blank" rel="noopener">Directions</a>
                </div>
              ))}
            </div>
            <ImageSlot ratio="3/4" src={IMG.landscape} style="min-height:520px" placeholder="map slot<br>Balochistan - six branch pins, eight more towns served<br>click a pin to jump to its card" />
          </div>
          {alsoServing.length ? (
            <div style={css('margin-top:32px')}>
              <div className="qlab" style={css('margin-bottom:12px')}>Also serving, without a permanent office</div>
              {alsoServing.map((t) => <span key={t} className="chip">{t}</span>)}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
