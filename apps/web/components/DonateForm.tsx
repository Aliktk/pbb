'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { css } from '../lib/style';

const PURPOSES = ['Where most needed', 'Sponsor a thalassemia child', 'Screening kits', 'Ambulance fuel and upkeep', 'Zakat'];
const ACCOUNTS = ['National Bank, Quetta', 'United Bank, Loralai', 'National Bank, Pishin', 'Bank Islami, Zhob'];

/** Donation-details form - matches the prototype; submit shows an acknowledgement. */
export function DonateForm() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (submitted) {
    return (
      <div className="card">
        <div className="done">
          <div className="tick">✓</div>
          <h2>Thank you</h2>
          <p className="lead" style={css('margin-top:12px')}>
            Your details have been sent to the accounts desk. A receipt follows once the transfer is matched.
          </p>
          <div className="row" style={css('justify-content:center;margin-top:22px')}>
            <Link href="/" className="btn btn-p">Back to home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <h3 style={css('margin-bottom:6px')}>Tell us about your donation</h3>
      <p className="muted" style={css('font-size:13.5px;margin-bottom:22px')}>So we can match it and send a receipt.</p>
      <div className="fgrp"><label className="lb">Your name *</label><input className="fld" name="name" required /></div>
      <div className="fgrp"><label className="lb">Phone *</label><input className="fld" name="phone" type="tel" required placeholder="0300 0000000" /></div>
      <div className="g2" style={css('gap:14px')}>
        <div className="fgrp"><label className="lb">Amount (PKR) *</label><input className="fld" name="amount" required inputMode="numeric" /></div>
        <div className="fgrp">
          <label className="lb">Purpose</label>
          <select className="fld" name="purpose">{PURPOSES.map((p) => <option key={p}>{p}</option>)}</select>
        </div>
      </div>
      <div className="fgrp">
        <label className="lb">Which account did you send to?</label>
        <select className="fld" name="acct">{ACCOUNTS.map((a) => <option key={a}>{a}</option>)}</select>
      </div>
      <div className="fgrp">
        <label className="lb">Receipt <span className="muted" style={css('font-weight:500')}>- photograph or screenshot</span></label>
        <div className="drop">Tap to attach the transfer receipt</div>
      </div>
      <button className="btn btn-p" style={css('width:100%;padding:15px')}>Send details</button>
    </form>
  );
}
