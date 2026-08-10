import Link from 'next/link';
import { css } from '../lib/style';

// 404 - ported from the prototype (pbb-pages2.js PAGES['404']). Plain page, no hero.
export default function NotFound() {
  return (
    <section className="blk" style={css('padding:90px 0')}>
      <div className="wrap" style={css('max-width:620px;text-align:center')}>
        <div className="bignum" style={css('font-size:76px;color:var(--red)')}>404</div>
        <h1 style={css('margin:18px 0 14px')}>That page is not here</h1>
        <p className="lead" style={css('margin-bottom:28px')}>It may have moved. If you were looking for something on the old website, it is probably one of these.</p>
        <div className="row" style={css('justify-content:center;gap:10px')}>
          <Link href="/" className="btn btn-p">Home</Link>
          <Link href="/branches" className="btn btn-o">Our branches</Link>
          <Link href="/join/requester" className="btn btn-o">Request blood</Link>
          <Link href="/contact" className="btn btn-o">Contact</Link>
        </div>
      </div>
    </section>
  );
}
