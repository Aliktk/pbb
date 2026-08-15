'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { CustomSelect } from './CustomSelect';
import { TOWNS } from '../lib/nav';

const MODES = ['General', 'Volunteer', 'Hospital or partner', 'Press'];
const SKILLS = ['Camps', 'Outreach', 'Driving', 'Office work', 'Design'];

/** Contact form - mode pills reveal volunteer fields; submit shows a success panel. */
export function ContactForm() {
  const [mode, setMode] = useState('General');
  const [town, setTown] = useState<string>(TOWNS[0]);
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
      <div className="contact-form-card">
        <div className="contact-success-box">
          <div className="contact-success-icon">✓</div>
          <h2 className="contact-success-title">Message Received</h2>
          <p className="contact-success-desc">
            Thank you for reaching out. Someone from our central office will review and respond to your inquiry shortly. For immediate emergency blood dispatches, please call <a href="tel:0812836820">081-2836820</a>.
          </p>
          <div style={{ marginTop: '28px', textAlign: 'center' }}>
            <Link href="/" className="btn-crimson-pill">
              Back to Home Page →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="contact-form-card" onSubmit={onSubmit}>
      <div className="contact-form-header">
        <h3 className="contact-form-title">Send a Direct Inquiry</h3>
        <p className="contact-form-sub">Select a category below to direct your message to the appropriate desk.</p>
      </div>

      {/* Topic Mode Selector Pills */}
      <div className="fgrp" style={{ marginBottom: '22px' }}>
        <label className="lb">What is this regarding?</label>
        <div className="contact-mode-pills">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              className={`contact-mode-pill ${mode === m ? 'active' : ''}`}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="fgrp">
        <label className="lb">Your Full Name *</label>
        <input className="fld" name="name" placeholder="e.g. Tariq Khan" required />
      </div>

      <div className="fgrp">
        <label className="lb">Phone Number *</label>
        <input className="fld" name="phone" type="tel" placeholder="e.g. 0300-1234567" required />
      </div>

      <div className="fgrp">
        <label className="lb">Email Address <span className="muted" style={{ fontWeight: 500 }}>(optional)</span></label>
        <input className="fld" name="email" type="email" placeholder="e.g. tariq@example.com" />
      </div>

      {mode === 'Volunteer' && (
        <div className="contact-volunteer-section">
          <div className="fgrp">
            <label className="lb">Your Town / District</label>
            <CustomSelect
              options={TOWNS}
              value={town}
              onChange={setTown}
              placeholder="Select your town"
              name="city"
            />
          </div>

          <div className="fgrp">
            <label className="lb">How would you like to contribute?</label>
            <div className="contact-skills-grid">
              {SKILLS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`contact-skill-pill ${skills.includes(s) ? 'active' : ''}`}
                  onClick={() => toggleSkill(s)}
                >
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="fgrp">
        <label className="lb">Your Message *</label>
        <textarea className="fld" name="msg" rows={4} placeholder="Type your inquiry, request, or feedback here..." required />
      </div>

      <button className="btn-crimson-pill" style={{ width: '100%', justifyContent: 'center', padding: '16px 28px', fontSize: '15px' }}>
        Send Message →
      </button>
    </form>
  );
}

