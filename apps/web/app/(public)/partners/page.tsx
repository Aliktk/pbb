import Link from 'next/link';
import { css } from '../../../lib/style';

// Partners - ported from the prototype (pbb-pages2.js PAGES.partners). Data mirrors PARTNERKINDS.
const PARTNERKINDS: [string, string, string][] = [
  ['Hospitals', 'Refer patients, get a named coordinator at the nearest branch, and a direct line for emergencies. Your requests go straight onto the branch board instead of through a switchboard.', 'M12 4v16m8-8H4'],
  ['Laboratories', 'Share screening capacity, or take our overflow. Results are recorded against the bag, so a unit can be traced from donor to patient.', 'M9 2v7L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3L15 9V2M9 2h6M8 15h8'],
  ['Foundations and donors', 'Fund screening kits, an ambulance, or a year of transfusions for a named child. You receive the figures, not a thank-you letter.', 'M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z'],
  ['Welfare societies', 'Run a camp under our name, collect hides at Eid, or open a branch in a town that has none. Eight towns are served today without an office.', 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'],
  ['Universities and colleges', 'Two-day drives on campus register more first-time donors than anything else we do. We bring the staff and the equipment.', 'M22 10 12 5 2 10l10 5 10-5ZM6 12v5c3 3 9 3 12 0v-5'],
  ['Other blood banks', 'Nobody can see anyone else’s shelf. If your bank keeps a register too, we would rather share a shortage than discard a bag.', 'M8 7h8M8 12h8M8 17h5M4 3h16v18H4z'],
];

const WHAT_YOU_GET: string[] = [
  'A named coordinator at your nearest branch',
  'A direct line, not a switchboard',
  'Your requests on the branch board within seconds',
  'Quarterly figures on what was supplied and to whom',
  'Your logo on the supporters page',
];

const WHAT_WE_ASK: string[] = [
  'One person we can reach',
  'Honest numbers on what you need',
  'Notice before a planned requirement, where possible',
  'No selling of blood, ever, under any arrangement',
];

export default function Partners() {
  return (
    <>
      <header className="ph-hero">
        <div className="wrap">
          <span className="eyebrow"><b />Work with us</span>
          <h1>Six ways an organisation<br />can be useful</h1>
          <p className="lead" style={css('margin-top:18px;max-width:62ch')}>A blood bank that only talks to individuals stays small. Most of what PBB can do next depends on institutions.</p>
        </div>
      </header>

      <section className="blk" style={css('padding-top:0')}>
        <div className="wrap">
          <div className="g3">
            {PARTNERKINDS.map((k) => (
              <div key={k[0]} className="pil">
                <div className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={k[2]} /></svg>
                </div>
                <h3>{k[0]}</h3>
                <p>{k[1]}</p>
              </div>
            ))}
          </div>
          <div className="g2" style={css('gap:20px;margin-top:34px')}>
            <div className="card">
              <div className="qlab" style={css('margin-bottom:12px')}>What you get</div>
              {WHAT_YOU_GET.map((x) => (
                <div key={x} className="tick-row"><span>✓</span>{x}</div>
              ))}
            </div>
            <div className="card">
              <div className="qlab" style={css('margin-bottom:12px')}>What we ask</div>
              {WHAT_WE_ASK.map((x) => (
                <div key={x} className="tick-row"><span>✓</span>{x}</div>
              ))}
            </div>
          </div>
          <div className="closer" style={css('margin-top:34px')}>
            <div>
              <h2>Start the conversation</h2>
              <p>Tell us what kind of organisation you are and what you are hoping to do. The head office replies within a few days.</p>
            </div>
            <Link href="/join/partner" className="btn btn-w">Register your organisation</Link>
          </div>
        </div>
      </section>
    </>
  );
}
