import Link from 'next/link';
import { ImageSlot } from '../../../components/ImageSlot';
import { css } from '../../../lib/style';
import { TOWNS } from '../../../lib/nav';

// Our branches — ported from the prototype (pbb-pages.js PAGES.branches). Data arrays mirror the source.
interface Branch {
  n: string;
  head?: number;
  a: string;
  t: string[];
  bank?: string;
  amb?: number;
}

const BRANCHES: Branch[] = [
  { n: 'Quetta', head: 1, a: 'Zainab Chamber, Shara-e-Adalat, near Quetta Press Club', t: ['081-2836820', '081-2839500'], amb: 1 },
  { n: 'Loralai', a: 'Sayed Abdul Qadir Road', t: ['0824-662066'], bank: 'UBL Loralai · A/C 2101-1' },
  { n: 'Pishin', a: 'Band Road', t: ['0826-421288'], bank: 'NBP Pishin · A/C 4589-93' },
  { n: 'Zhob', a: 'Sharbat Khan Road', t: ['0822-413902'], bank: 'Bank Islami Zhob · A/C 1048-0088676-0001' },
  { n: 'Chaman', a: 'Taj Road', t: [] },
  { n: 'Muslim Bagh', a: 'Aryan Market, Muslim Bagh Bazar', t: [] },
];

export default function Branches() {
  return (
    <>
      <header className="ph-hero">
        <div className="wrap">
          <span className="eyebrow"><b />Our branches</span>
          <h1>Six offices.<br />Fourteen towns.</h1>
          <p className="lead" style={css('margin-top:18px;max-width:62ch')}>From the head office beside the Quetta Press Club out to Zhob, Chaman and Loralai — and to the towns in between that have no blood bank of their own.</p>
        </div>
      </header>
      <section className="blk" style={css('padding-top:0')}>
        <div className="wrap">
          <div className="g2" style={css('gap:34px;align-items:start')}>
            <div style={css('display:grid;gap:12px')}>
              {BRANCHES.map((b) => (
                <div key={b.n} className="brc">
                  <div style={css('flex:1')}>
                    <div className="bn">{b.n}{b.head ? <> <span className="hd-tag">HEAD OFFICE</span></> : null}</div>
                    <div className="ba">{b.a}</div>
                    {b.t.length ? (
                      <div className="bt">{b.t.map((t, i) => (
                        <span key={t}>{i > 0 ? ' · ' : ''}<a href={`tel:${t.replace(/-/g, '')}`}>{t}</a></span>
                      ))}</div>
                    ) : <div className="bt muted">Phone number to follow</div>}
                    {b.bank ? <div className="bbank">{b.bank}</div> : null}
                    {b.amb ? <span className="tag ok" style={css('margin-top:9px')}>Ambulance service · 24 hours</span> : null}
                  </div>
                  <a className="btn btn-o btn-s" href={`https://maps.google.com/?q=${encodeURIComponent(b.n + ' Balochistan')}`} target="_blank" rel="noopener">Directions</a>
                </div>
              ))}
            </div>
            <ImageSlot ratio="3/4" style="min-height:520px" placeholder="map slot<br>Balochistan — six branch pins, eight more towns served<br>click a pin to jump to its card" />
          </div>
          <div style={css('margin-top:32px')}>
            <div className="qlab" style={css('margin-bottom:12px')}>Also serving, without a permanent office</div>
            {TOWNS.slice(6).map((t) => <span key={t} className="chip">{t}</span>)}
          </div>
        </div>
      </section>
    </>
  );
}
