import Link from 'next/link';
import { ImageSlot } from '../../../components/ImageSlot';
import { css } from '../../../lib/style';

// Supporters - ported from the prototype (pbb-pages.js PAGES.supporters). Data mirrors the source.

const SUPPORTERS: [string, string][] = [
  ['Pashtoonkhwa Milli Awami Party', 'Founding support since 1999'],
  ['Quetta Press Club', 'Neighbour and long-standing partner'],
  ['Civil Hospital, Quetta', 'Referring hospital'],
  ['Bolan Medical Complex', 'Referring hospital'],
  ['Sandeman Provincial Hospital', 'Referring hospital'],
  ['DHQ Hospital, Zhob', 'Branch partner'],
  ['Local welfare societies', 'Camps and hide collection'],
  ['Individual members', 'The largest source of all'],
];

export default function Supporters() {
  return (
    <>
      <header className="ph-hero">
        <div className="wrap">
          <span className="eyebrow"><b />Who stands with us</span>
          <h1>The organisations who<br />keep this running</h1>
          <p className="lead" style={css('margin-top:18px;max-width:62ch')}>Pashtoonkhwa Blood Bank has no government funding. It runs on members’ contributions, charity, Zakat, and cattle hides collected by volunteers each Eid ul Adha - and on the institutions below.</p>
        </div>
      </header>

      <section className="blk" style={css('padding-top:0')}>
        <div className="wrap">
          <div className="qlab" style={css('margin-bottom:16px')}>Supporting organisations</div>
          <div className="suppgrid">
            {SUPPORTERS.map(([name, note]) => (
              <div key={name} className="suppcard">
                <div className="supplogo"><ImageSlot ratio="1/1" placeholder="Drop the logo" /></div>
                <div><b>{name}</b><span>{note}</span></div>
              </div>
            ))}
          </div>
          <div className="g2" style={css('gap:20px;margin-top:44px')}>
            <div className="card">
              <div className="qlab" style={css('margin-bottom:12px')}>Become a partner</div>
              <h3 style={css('margin-bottom:10px')}>Hospitals, laboratories and clinics</h3>
              <p className="muted">Refer patients, share screening capacity, or host a camp. Partner hospitals get a named coordinator and a direct line to the branch.</p>
              <Link href="/join/partner" className="btn btn-o" style={css('margin-top:18px')}>Partner with us</Link>
            </div>
            <div className="card">
              <div className="qlab" style={css('margin-bottom:12px')}>Bring us to your town</div>
              <h3 style={css('margin-bottom:10px')}>Welfare societies and community groups</h3>
              <p className="muted">Eight towns are served without a permanent office. If your community wants a branch, the organising committee will talk it through with you.</p>
              <Link href="/join/organisation" className="btn btn-o" style={css('margin-top:18px')}>Register an organisation</Link>
            </div>
          </div>
          <div className="closer" style={css('margin-top:44px')}>
            <div>
              <h2>Support the register</h2>
              <p>Bank transfer, Zakat, or hides at Eid ul Adha. Every rupee goes to screening kits, bags and fuel.</p>
            </div>
            <Link href="/donate" className="btn btn-w">How to donate</Link>
          </div>
        </div>
      </section>
    </>
  );
}
