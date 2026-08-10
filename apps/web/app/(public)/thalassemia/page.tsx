import Link from 'next/link';
import { ImageSlot } from '../../../components/ImageSlot';
import { css } from '../../../lib/style';
import { IMG } from '../../../lib/images';

// Thalassemia — ported from the prototype (pbb-pages.js PAGES.thalassemia). Data array mirrors the source.
const COST_CARDS: [string, string][] = [
  ['12', 'transfusions a year'],
  ['—', 'cost per screened bag'],
  ['—', 'a year, per child'],
];

export default function Thalassemia() {
  return (
    <>
      <header className="ph-hero">
        <div className="wrap">
          <span className="eyebrow"><b />Thalassemia</span>
          <h1>Two hundred children,<br />every month.</h1>
          <p className="lead" style={css('margin-top:18px;max-width:62ch')}>Registered children are transfused free of cost and without exchange. For a child with thalassemia a monthly transfusion is not optional — it is the difference between a normal month and a hospital one.</p>
        </div>
      </header>
      <section className="blk" style={css('padding-top:0')}>
        <div className="wrap">
          <div className="g2" style={css('gap:34px;align-items:center')}>
            <div><h2 style={css('margin-bottom:16px')}>What it costs to keep one child alive for a year</h2>
              <p className="muted" style={css('margin-bottom:22px')}>Sponsorship covers screening, bags and handling for one child’s full year of transfusions.</p>
              <div className="g3" style={css('gap:12px')}>{COST_CARDS.map(([n, l]) => (
                <div key={l} className="card" style={css('padding:18px')}><div className="bignum" style={css('font-size:28px')}>{n}</div><div className="muted" style={css('font-size:13px;margin-top:4px')}>{l}</div></div>
              ))}</div>
              <p className="muted" style={css('font-size:13.5px;margin-top:14px')}>Figures to be supplied by the head office.</p>
              <Link href="/donate" className="btn btn-p" style={css('margin-top:22px')}>Sponsor a child</Link></div>
            <ImageSlot ratio="4/3.6" src={IMG.clinician} placeholder="photograph slot<br><b>consented portraits only</b><br>no names unless the family has agreed" />
          </div>
          <div className="notice" style={css('margin-top:44px')}><b>On photographs.</b> Children appear on this page only where a signed consent form is held by the head office. A child without consent is still counted among the two hundred, and still transfused, but never shown.</div>
        </div>
      </section>
    </>
  );
}
