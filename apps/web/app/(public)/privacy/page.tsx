import { css } from '../../../lib/style';

// Privacy — ported from the prototype (pbb-pages2.js PAGES.privacy → legal()).
// legal() calls hero('', title) with an EMPTY eyebrow, so the eyebrow renders <b /> with no text.
const ROWS: [string, string][] = [
  ['What we hold', 'Your name, blood group, telephone number and town. If you tell us, your date of birth, weight and the date you last donated. Nothing else.'],
  ['Why we hold it', 'So that when a patient near you needs your blood group, somebody can telephone you. That is the only purpose.'],
  ['Who sees it', 'Staff at your own branch, and the head office in Quetta. Branch staff cannot see another town’s register. Nobody outside Pashtoonkhwa Blood Bank is given your number.'],
  ['We never sell it', 'Your details are not sold, rented, shared with political parties, or used for anything other than blood.'],
  ['Removing yourself', 'Telephone any branch and ask. Your record is removed the same day, and we will not ask you to justify it.'],
  ['Photographs', 'Photographs of patients and of thalassemia children appear on this website only where a signed consent form is held by the head office.'],
];

export default function Privacy() {
  return (
    <>
      <header className="ph-hero">
        <div className="wrap">
          <span className="eyebrow"><b /></span>
          <h1>Privacy</h1>
        </div>
      </header>

      <section className="blk" style={css('padding-top:0')}>
        <div className="wrap" style={css('max-width:760px')}>
          {ROWS.map(([h2, p]) => (
            <div key={h2}>
              <h3 style={css('margin:26px 0 10px')}>{h2}</h3>
              <p className="muted" style={css('font-size:15.5px;line-height:1.7')}>{p}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
