'use client';

import { useEffect, useState } from 'react';
import { ImageSlot } from '../../../components/ImageSlot';
import { css } from '../../../lib/style';
import { TOWNS } from '../../../lib/nav';
import { IMG } from '../../../lib/images';
import { fetchOffices, FALLBACK_OFFICES, type Office } from '../../../lib/offices';

// Our branches - office contact details come from the database (towns table, migration 0006), so
// what each office edits in the admin shows here at once. The static FALLBACK_OFFICES list (shared
// with the /branch/[id] detail page) is used while loading or if the database cannot be reached, so
// the page is never empty.

export default function Branches() {
  const [offices, setOffices] = useState<Office[]>(FALLBACK_OFFICES);

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
