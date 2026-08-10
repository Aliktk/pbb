import { ImageSlot } from '../../../components/ImageSlot';
import { ActionButton } from '../../../components/ActionButton';
import { css } from '../../../lib/style';
import { IMG_ROTATION } from '../../../lib/images';

// Gallery - ported from the prototype (pbb-pages.js PAGES.gallery). Data mirrors the source.

const FILTERS: string[] = ['All', 'Blood camps', 'Awareness', 'Ambulance', 'New building', 'Eid ul Adha', 'Videos'];

// 11 slots with varying aspect ratios, matching the prototype's ratio array.
const GALLERY_RATIOS: number[] = [1, 1, 1.4, 1, 0.8, 1, 1, 1.3, 1, 1, 1];

export default function Gallery() {
  return (
    <>
      <header className="ph-hero">
        <div className="wrap">
          <span className="eyebrow"><b />Photos &amp; videos</span>
          <h1>The work, as it happens</h1>
        </div>
      </header>

      <section className="blk" style={css('padding-top:0')}>
        <div className="wrap">
          <div className="row" style={css('gap:8px;margin-bottom:26px')} id="galFilter">
            {FILTERS.map((f, i) => (
              <ActionButton key={f} className={`pill${i ? '' : ' on'}`} message="Filtering arrives with the media library">{f}</ActionButton>
            ))}
          </div>
          <div className="gal">
            {GALLERY_RATIOS.map((r, i) => (
              <ImageSlot key={i} ratio={String(r)} src={IMG_ROTATION[i % IMG_ROTATION.length]} style="border-radius:18px" placeholder={i % 5 === 3 ? '▶ video' : 'photograph'} />
            ))}
          </div>
          <div style={css('text-align:center;margin-top:30px')}>
            <ActionButton className="btn btn-o" message="Loading more arrives with the media library">Load more</ActionButton>
          </div>
        </div>
      </section>
    </>
  );
}
