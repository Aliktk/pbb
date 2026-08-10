import Link from 'next/link';
import { ImageSlot } from '../../../components/ImageSlot';
import { css } from '../../../lib/style';
import { IMG, IMG_ROTATION } from '../../../lib/images';

// News - ported from the prototype (pbb-pages.js PAGES.news). Data mirrors the source NEWS array.

interface NewsItem {
  t: string;
  k: string;
  d: string;
  b: string;
}

const NEWS: NewsItem[] = [
  { t: 'Free donation camp, Pishin', k: 'Blood camp', d: '12 September', b: 'Band Road branch, 9am to 4pm. Walk in, or register to attend so we know how many to expect.' },
  { t: 'New building - final stage', k: 'Notice', d: '3 September', b: 'Construction of the new Quetta premises has entered its last phase.' },
  { t: 'Eid ul Adha hide collection', k: 'Appeal', d: 'Runs to 20 June', b: 'Volunteers collect cattle hides across all branches. Request a collection from your area.' },
  { t: 'Thalassemia transfusion schedule, September', k: 'Notice', d: '28 August', b: 'Guardians of registered children can collect the month’s schedule from their branch.' },
  { t: 'Awareness drive, Quetta university', k: 'Awareness', d: '14 August', b: 'Students registered as first-time donors over two days on campus.' },
  { t: 'Ambulance service extended', k: 'Notice', d: '2 August', b: 'A third vehicle joined the Quetta fleet, taking the service to twenty-four hours.' },
];

export default function News() {
  const feature = NEWS[0];
  return (
    <>
      <header className="ph-hero">
        <div className="wrap">
          <span className="eyebrow"><b />Announcements &amp; events</span>
          <h1>What is happening now</h1>
        </div>
      </header>

      <section className="blk" style={css('padding-top:0')}>
        <div className="wrap">
          <div className="card" style={css('padding:0;overflow:hidden;margin-bottom:26px')}>
            <div className="feat">
              <ImageSlot ratio="16/10" src={IMG.community} style="border-radius:0;border:0;height:100%" placeholder="event cover photograph" />
              <div style={css('padding:38px')}>
                <div className="row" style={css('gap:10px')}>
                  <span className="tag no">{feature.k}</span>
                  <span className="muted" style={css('font-size:13.5px;font-weight:600')}>{feature.d}</span>
                </div>
                <h2 style={css('margin:16px 0 12px')}>{feature.t}</h2>
                <p className="lead">{feature.b}</p>
                <div className="row" style={css('margin-top:24px')}>
                  <Link href="/contact" className="btn btn-p">Register to attend</Link>
                  <Link href="/branches" className="btn btn-o">Find the branch</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="g3">
            {NEWS.slice(1).map((n, i) => (
              <div key={n.t} className="card" style={css('padding:0;overflow:hidden')}>
                <ImageSlot ratio="16/9" src={IMG_ROTATION[i % IMG_ROTATION.length]} style="border-radius:0;border:0;border-bottom:1px solid var(--line)" placeholder="cover" />
                <div style={css('padding:22px')}>
                  <div className="row" style={css('gap:9px')}>
                    <span className="tag gy">{n.k}</span>
                    <span className="muted" style={css('font-size:13px;font-weight:600')}>{n.d}</span>
                  </div>
                  <h3 style={css('margin:12px 0 8px')}>{n.t}</h3>
                  <p className="muted" style={css('font-size:14px')}>{n.b}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
