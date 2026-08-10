'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { css } from '../../../../lib/style';

// Donor self-service sign-in (phone → OTP). Design phase: "Send me a code" navigates to the
// code screen; real OTP send/verify wires to POST /me (phone + OTP) later.
export default function MeSignin() {
  const router = useRouter();
  return (
    <section className="blk">
      <div className="wrap" style={css('max-width:760px')}>
        <Link href="/" className="backlink">← Back to the website</Link>
        <h1 style={css('margin:14px 0 10px')}>Your record</h1>
        <p className="lead" style={css('margin-bottom:34px')}>
          See what we hold about you, change your telephone number, tell us you have donated somewhere
          else, or take yourself off the register. No password to remember.
        </p>
        <div className="card" style={css('max-width:520px')}>
          <div className="fgrp">
            <label className="lb">The telephone number we have for you</label>
            <input className="fld" type="tel" placeholder="03XX XXXXXXX" defaultValue="0300 3815590" />
          </div>
          <button className="btn btn-p" style={css('width:100%;padding:15px')} onClick={() => router.push('/me/code')}>
            Send me a code
          </button>
          <p className="sm" style={css('margin-top:14px')}>
            A six-figure code arrives by SMS. It is the only way in, so nobody can open your record from
            a number that is not yours.
          </p>
        </div>
        <div className="ahint" style={css('max-width:520px;margin-top:18px')}>
          Number changed, or never given one? Telephone any branch - the list is on{' '}
          <Link href="/branches">Our branches</Link>.
        </div>
      </div>
    </section>
  );
}
