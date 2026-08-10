import { css } from '../../../lib/style';
import { ImageSlot } from '../../../components/ImageSlot';
import { ContactForm } from '../../../components/ContactForm';
import { IMG } from '../../../lib/images';

// Contact — ported from PAGES.contact. Left column static; the form is a client component.
export default function Contact() {
  return (
    <>
      <header className="ph-hero">
        <div className="wrap">
          <span className="eyebrow"><b />Contact</span>
          <h1>Talk to us</h1>
        </div>
      </header>
      <section className="blk" style={css('padding-top:0')}>
        <div className="wrap">
          <div className="g2" style={css('gap:34px;align-items:start')}>
            <div>
              <div className="card" style={css('margin-bottom:14px')}>
                <h3>Head office</h3>
                <div className="ba" style={css('margin-top:8px')}>
                  Zainab Chamber, Shara-e-Adalat,<br />near Quetta Press Club, Quetta, Balochistan
                </div>
                <div className="bt" style={css('margin-top:12px;font-size:17px')}>
                  <a href="tel:0812836820">081-2836820</a><br /><a href="tel:0812839500">081-2839500</a>
                </div>
                <div className="mono" style={css('margin-top:10px')}>admin@pashtoonkhwabloodbank.org</div>
              </div>
              <div className="g2" style={css('gap:14px')}>
                <div className="card">
                  <div className="qlab">Organizer</div>
                  <div style={css('font-weight:700;margin-top:6px')}>Olus Yar</div>
                  <div className="bt"><a href="tel:03003815590">0300-3815590</a></div>
                </div>
                <div className="card">
                  <div className="qlab">Web administrator</div>
                  <div className="bt" style={css('margin-top:6px')}><a href="tel:03327828121">0332-7828121</a></div>
                  <div className="mono" style={css('font-size:12px;margin-top:4px')}>wakeeltareen@pashtoonkhwabloodbank.org</div>
                </div>
              </div>
              <ImageSlot ratio="16/10" src={IMG.landscape} style="margin-top:14px" placeholder="map — head office" />
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
