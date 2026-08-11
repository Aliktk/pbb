'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { css } from '../lib/style';
import { TOWNS } from '../lib/nav';
import { showToast } from '../lib/toast';
import { submitContactMessage, type MessageKind } from '../lib/messages';

const MODES = ['General', 'Volunteer', 'Hospital or partner', 'Press'];
const SKILLS = ['Camps', 'Outreach', 'Driving', 'Office work', 'Design'];

function modeToKind(mode: string): MessageKind {
  if (mode === 'Volunteer') return 'volunteer';
  if (mode === 'Hospital or partner') return 'partner';
  return 'message';
}

/** Contact form - mode pills reveal volunteer fields; submit lands the message in the office inbox. */
export function ContactForm() {
  const [mode, setMode] = useState('General');
  const [skills, setSkills] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggleSkill = (s: string) =>
    setSkills((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const town = String(fd.get('city') ?? '').trim();
    const detail = [
      String(fd.get('msg') ?? '').trim(),
      skills.length ? `Can help with: ${skills.join(', ')}` : '',
      town ? `Town: ${town}` : '',
      `About: ${mode}`,
    ].filter(Boolean).join(' · ');
    setBusy(true);
    try {
      await submitContactMessage({
        kind: modeToKind(mode),
        name: String(fd.get('name') ?? ''),
        phone: String(fd.get('phone') ?? ''),
        email: String(fd.get('email') ?? ''),
        detail,
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not send. Please try again.');
    } finally {
      setBusy(false);
    }
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
      <div className="fgrp"><label className="lb">Phone *</label><input className="fld" name="phone" type="tel" required /></div>
      <div className="fgrp">
        <label className="lb">Email <span className="muted" style={css('font-weight:500')}>- optional</span></label>
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
      <button className="btn btn-p" style={css('width:100%;padding:15px')} disabled={busy}>{busy ? 'Sending…' : 'Send'}</button>
    </form>
  );
}
