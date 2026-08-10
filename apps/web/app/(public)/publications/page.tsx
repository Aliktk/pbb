import { ImageSlot } from '../../../components/ImageSlot';
import { ActionButton } from '../../../components/ActionButton';
import { css } from '../../../lib/style';

// Publications — ported from the prototype (pbb-pages2.js PAGES.publications). Data mirrors PUBS.
const PUBS: [string, string, string][] = [
  ['Eid ul Adha hide collection', 'Poster · Urdu', 'Appeal'],
  ['Who can donate blood', 'Poster · Urdu, Pashto', 'Awareness'],
  ['Thalassemia — what parents should know', 'Booklet · Urdu', 'Awareness'],
  ['Annual report 2012', 'Report · English', 'Report'],
  ['Hepatitis B vaccination drive', 'Poster · Urdu', 'Awareness'],
  ['Blood camp — how to organise one', 'Guide · Urdu', 'Guide'],
];

const FILTERS: string[] = ['All', 'Appeals', 'Awareness', 'Reports', 'Guides'];

export default function Publications() {
  return (
    <>
      <header className="ph-hero">
        <div className="wrap">
          <span className="eyebrow"><b />Publications</span>
          <h1>Posters, appeals and reports</h1>
          <p className="lead" style={css('margin-top:18px;max-width:62ch')}>Printed material from twenty-seven years of work. Everything here can be downloaded and printed for your own mosque, school or union council.</p>
        </div>
      </header>

      <section className="blk" style={css('padding-top:0')}>
        <div className="wrap">
          <div className="row" style={css('gap:8px;margin-bottom:26px')}>
            {FILTERS.map((f, i) => (
              <ActionButton key={f} className={`pill${i ? '' : ' on'}`} message="Filtering arrives with the media library">{f}</ActionButton>
            ))}
          </div>
          <div className="g3">
            {PUBS.map((p) => (
              <div key={p[0]} className="card" style={css('padding:0;overflow:hidden')}>
                <ImageSlot ratio="16/11" placeholder="Drop the poster artwork" />
                <div style={css('padding:20px')}>
                  <span className="tag gy">{p[2]}</span>
                  <h3 style={css('margin:12px 0 6px')}>{p[0]}</h3>
                  <p className="sm">{p[1]}</p>
                  <div className="row" style={css('gap:8px;margin-top:16px')}>
                    <ActionButton className="btn btn-o btn-s" message="Download arrives with the media library">Download</ActionButton>
                    <ActionButton className="btn btn-o btn-s" message="Print arrives with the media library">Print</ActionButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="notice" style={css('margin-top:26px')}>Posters are shown at their real proportions, never cropped square — the Urdu and Pashto lettering <b>is</b> the artwork.</div>
        </div>
      </section>
    </>
  );
}
