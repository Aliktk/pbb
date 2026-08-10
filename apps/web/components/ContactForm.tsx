'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { css } from '../lib/style';
import { TOWNS } from '../lib/nav';

const MODES = ['General', 'Volunteer', 'Hospital or partner', 'Press'];
const SKILLS = ['Camps', 'Outreach', 'Driving', 'Office work', 'Design'];

/** Contact form — mode pills reveal volunteer fields; submit shows a success panel. */
export function ContactForm() {
  const [mode, setMode] = useState('General');
  const [skills, setSkills] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleSkill = (s: string) =>
    setSkills((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

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
          <h2>Message sent</h2>
          <p className="lead" style={css('margin-top:12px')}>
            Someone from the office will reply. For anything urgent, please call 081-2836820.
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
      <h3 style={css('margin-bottom:18px')}>Send a message</h3>
      <div className="fgrp">
        <label className="lb">What is this about?</label>
        <div className="row" style={css('gap:8px')}>
          {MODES.map((m) => (
            <button key={m} type="button" className={`pill${mode === m ? ' on' : ''}`} onClick={() => setMode(m)}>
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="fgrp"><label className="lb">Name *</label><input className="fld" name="name" required /></div>
      <div className="fgrp"><label className="lb">Phone *</label><input className="fld" name="phone" required /></div>
      <div className="fgrp">
        <label className="lb">Email <span className="muted" style={css('font-weight:500')}>— optional</span></label>
        <input className="fld" name="email" type="email" />
      </div>
      {mode === 'Volunteer' && (
        <div>
          <div className="fgrp">
            <label className="lb">Town</label>
            <select className="fld" name="city">{TOWNS.map((t) => <option key={t}>{t}</option>)}</select>
          </div>
          <div className="fgrp">
            <label className="lb">What can you help with?</label>
            <div className="row" style={css('gap:7px')}>
              {SKILLS.map((s) => (
                <button key={s} type="button" className={`pill${skills.includes(s) ? ' on' : ''}`} onClick={() => toggleSkill(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="fgrp"><label className="lb">Message *</label><textarea className="fld" name="msg" rows={4} required /></div>
      <button className="btn btn-p" style={css('width:100%;padding:15px')}>Send</button>
    </form>
  );
}
