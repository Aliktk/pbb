import { css } from '../../../lib/style';

// Terms — ported from the prototype (pbb-pages2.js PAGES.terms → legal()).
// legal() calls hero('', title) with an EMPTY eyebrow, so the eyebrow renders <b /> with no text.
const ROWS: [string, string][] = [
  ['Blood is not sold', 'Pashtoonkhwa Blood Bank has never purchased or sold blood and will not. Blood is provided on exchange, and free without exchange in cases of thalassemia, pregnancy, emergency and natural disaster.'],
  ['This website is not a medical service', 'A request submitted here is a message to a coordinator, not a guarantee that blood is available. In an emergency, telephone 081-2836820.'],
  ['Accuracy', 'We ask donors to answer the health questions honestly. A wrong answer puts a patient at risk.'],
  ['Registration', 'Being on the register places no obligation on you. You may decline any request, at any time, without explanation.'],
];

export default function Terms() {
  return (
    <>
      <header className="ph-hero">
        <div className="wrap">
          <span className="eyebrow"><b /></span>
          <h1>Terms</h1>
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
