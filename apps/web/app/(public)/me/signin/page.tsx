import Link from 'next/link';
import { css } from '../../../../lib/style';

// Donor record - contact-a-branch model. We do not run an SMS/OTP service, so donors do not sign
// in online; instead they reach any branch to see, change, or remove their record. This keeps the
// promise honest and avoids exposing donor details without a real identity check.
export default function MeRecord() {
  return (
    <section className="blk">
      <div className="wrap" style={css('max-width:760px')}>
        <Link href="/" className="backlink">← Back to the website</Link>
        <h1 style={css('margin:14px 0 10px')}>Your record</h1>
        <p className="lead" style={css('margin-bottom:34px')}>
          Want to see what we hold about you, change your telephone number, tell us you donated
          somewhere else, or come off the register? Contact any branch and the staff will do it with
          you - in person or over the phone.
        </p>
        <div className="card" style={css('max-width:560px')}>
          <div className="listrow">
            <div><b>See or change your details</b><span className="sm">Your telephone number, address, or blood group - the branch updates it on the spot.</span></div>
          </div>
          <div className="listrow">
            <div><b>Report a donation elsewhere</b><span className="sm">Tell the branch and they record it so your next-eligible date is right.</span></div>
          </div>
          <div className="listrow">
            <div><b>Come off the register</b><span className="sm">Ask any branch and your details are removed the same day. You do not owe a reason.</span></div>
          </div>
          <Link href="/branches" className="btn btn-p" style={css('width:100%;margin-top:18px')}>Find your nearest branch</Link>
          <a href="tel:0812836820" className="btn btn-o" style={css('width:100%;margin-top:10px')}>Call the head office · 081-2836820</a>
        </div>
        <div className="ahint" style={css('max-width:560px;margin-top:18px')}>
          Staff confirm who you are at the branch, so nobody else can see or change your record. There
          is no online sign-in and no code to wait for.
        </div>
      </div>
    </section>
  );
}
