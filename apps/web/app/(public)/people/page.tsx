import { ReactNode } from 'react';
import { ImageSlot } from '../../../components/ImageSlot';
import { css } from '../../../lib/style';
import { IMG } from '../../../lib/images';

// Rotate portraits by call order; real, consented staff photos replace these later (constraint #5).
const PORTRAITS = [IMG.portraitA, IMG.portraitB, IMG.portraitC] as const;

// People - ported from the prototype (pbb-pages.js PAGES.people). Data mirrors the source.

// person(n,r,d,extra) helper - ports the .card portrait markup exactly.
function person(i: number, n: string, r: string, d: string, extra?: ReactNode) {
  return (
    <div className="card" style={css('padding:0;overflow:hidden')}>
      <ImageSlot ratio="1/1" src={PORTRAITS[i % PORTRAITS.length]} style="border-radius:0;border:0;border-bottom:1px solid var(--line)" placeholder="portrait" />
      <div style={css('padding:20px')}>
        <h3>{n}</h3>
        <div className="muted" style={css('font-size:13.5px;margin-top:5px')}>{r}</div>
        {d ? <p className="muted" style={css('font-size:13.5px;margin-top:10px')}>{d}</p> : null}
        {extra}
      </div>
    </div>
  );
}

export default function People() {
  return (
    <>
      <header className="ph-hero">
        <div className="wrap">
          <span className="eyebrow"><b />Committee &amp; staff</span>
          <h1>The people who run it</h1>
          <p className="lead" style={css('margin-top:18px;max-width:62ch')}>Pashtoonkhwa Blood Bank has been supervised by the same three-member organising committee since the day it opened.</p>
        </div>
      </header>

      <section className="blk" style={css('padding-top:0')}>
        <div className="wrap">
          <div className="qlab" style={css('margin-bottom:16px')}>Organising committee</div>
          <div className="g3">
            {person(0, 'Olus Yar', 'Olus Yar, PBB', 'Heads the organisation. Every branch, every account and every register answers upward to this office.', (
              <div className="bt" style={css('margin-top:10px')}><a href="tel:03003815590">0300-3815590</a></div>
            ))}
            {person(1, 'Mr. Faqir Khushal Khan Kasi', 'Organizer, PBB', 'Member of the organising committee since 1999.')}
            {person(2, 'Dr. Hamid Khan Achakzai', 'Member, organising committee', 'Provincial Secretary and Member of the Central Committee, Pashtoonkhwa Milli Awami Party.')}
          </div>
          <div className="qlab" style={css('margin:48px 0 16px')}>Medical staff</div>
          <div className="g3">
            {person(3, 'Dr. Naseer Muhammad', 'Pathologist, PBB · MD, DCP (PGMI Quetta)', 'Senior Pathologist at Pashtoonkhwa Blood Bank. Previously Senior Medical Officer with the Health Department for ten years, and Pathologist at Health Department Zhob for two.')}
            <div className="card" style={css('border-style:dashed;display:flex;align-items:center;justify-content:center;text-align:center;color:var(--mid);min-height:200px')}>Further staff to be added<br />by the head office</div>
          </div>
        </div>
      </section>
    </>
  );
}
