import Link from 'next/link';
import { css } from '../../../lib/style';

// Services - ported from the prototype (pbb-pages.js PAGES.services). Data arrays mirror the source.
const SCREEN_CHIPS: string[] = ['Hepatitis B', 'Hepatitis C', 'HIV/AIDS', 'MP', 'ELISA method'];

const CARDS: [string, string][] = [
  ['Ambulance service', 'Three vehicles running out of Quetta, twenty-four hours a day, for anyone who needs them. The remaining branches follow.'],
  ['Hepatitis B vaccination', 'Scavenger and garbage-picking children are vaccinated against Hepatitis B at no cost.'],
  ['Disaster response', 'Abbottabad 2005, Ziarat 2008, and every bomb blast, target killing and emergency since.'],
];

const DONOR_CRITERIA: [string, string][] = [
  ['18-60', 'years of age'],
  ['50 kg', 'minimum weight'],
  ['90 days', 'since your last donation'],
  ['Good health', 'no fever, no recent surgery'],
];

export default function Services() {
  return (
    <>
      <header className="ph-hero">
        <div className="wrap">
          <span className="eyebrow"><b />Services</span>
          <h1>What we provide</h1>
          <p className="lead" style={css('margin-top:18px;max-width:62ch')}>Blood is never purchased. The only source is exchange from relatives of the patient and from registered members.</p>
        </div>
      </header>
      <section className="blk" style={css('padding-top:0')}>
        <div className="wrap">
          <div className="g2" style={css('gap:20px')}>
            <div className="card"><span className="tag gy">On exchange</span><h3 style={css('margin:14px 0 10px')}>Screened blood for any patient</h3><p className="muted">Every bag is tested before it reaches a patient. A relative or a registered member gives in exchange.</p>
              <div className="row" style={css('margin-top:16px;gap:7px')}>{SCREEN_CHIPS.map((x) => <span key={x} className="chip">{x}</span>)}</div>
            </div>
            <div className="card" style={css('border-color:#CBE6D5;background:var(--grn-t)')}><span className="tag ok">Free · no exchange</span><h3 style={css('margin:14px 0 10px')}>Thalassemia, pregnancy, emergency, disaster</h3><p className="muted">In these four cases blood is provided free of cost and without any exchange requirement. This has been the rule since 1999.</p></div>
          </div>
          <div className="g3" style={css('margin-top:20px')}>
            {CARDS.map(([t, b]) => (
              <div key={t} className="card"><h3>{t}</h3><p className="muted" style={css('margin-top:9px')}>{b}</p></div>
            ))}
          </div>
          <h2 style={css('margin:56px 0 8px')}>Who can donate</h2><p className="lead" style={css('margin-bottom:24px')}>If all four are true, you can give today.</p>
          <div className="g4">{DONOR_CRITERIA.map(([n, l]) => (
            <div key={l} className="card" style={css('text-align:center')}><div className="bignum">{n}</div><div className="muted" style={css('margin-top:6px;font-size:14px')}>{l}</div></div>
          ))}</div>
          <div className="closer" style={css('margin-top:44px')}><div><h2>Not sure if you can give?</h2><p>Register anyway. The form checks as you go and tells you the date you next become eligible.</p></div><Link href="/join/donor" className="btn btn-w">Register as a Donor</Link></div>
        </div>
      </section>
    </>
  );
}
