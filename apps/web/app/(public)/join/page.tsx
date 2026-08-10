import Link from 'next/link';
import { css } from '../../../lib/style';
import { JOIN_TYPES } from '../../../lib/join';

// Get involved hub - ported from PAGES.join.
export default function JoinHub() {
  return (
    <>
      <header className="ph-hero">
        <div className="wrap">
          <span className="eyebrow"><b />Get involved</span>
          <h1>Everything in one place</h1>
          <p className="lead" style={css('margin-top:18px;max-width:62ch')}>
            Five ways to be part of it - asking for blood, giving it, giving time, or bringing the
            blood bank to your town.
          </p>
        </div>
      </header>
      <section className="blk" style={css('padding-top:0')}>
        <div className="wrap">
          <div className="joingrid">
            {JOIN_TYPES.map((t, i) => (
              <Link key={t.key} href={`/join/${t.key}`} className={`joincard${i ? '' : ' urgent'}`}>
                <div className="jn">{t.kicker}</div>
                <h3>{t.title}</h3>
                <p>{t.description}</p>
                <span className={`btn ${i ? 'btn-o' : 'btn-w'} btn-s`}>{i ? 'Continue' : 'Request blood'}</span>
              </Link>
            ))}
            <div className="joincard" style={css('background:var(--ink);border-color:var(--ink)')}>
              <div className="jn" style={css('color:#FF6B60')}>Give money</div>
              <h3 style={css('color:#fff')}>Donate</h3>
              <p style={css('color:#A7ABB3')}>
                Bank transfer, Zakat, or cattle hides at Eid ul Adha. PBB has never purchased blood -
                this is what keeps it running.
              </p>
              <Link href="/donate" className="btn btn-w btn-s">How to donate</Link>
            </div>
          </div>
          <div className="notice" style={css('margin-top:26px')}>
            <b>Not sure which one?</b> If someone is in hospital right now, use{' '}
            <Link href="/join/requester">request blood</Link> - or call{' '}
            <a href="tel:0812836820">081-2836820</a>, where somebody answers at any hour.
          </div>
        </div>
      </section>
    </>
  );
}
