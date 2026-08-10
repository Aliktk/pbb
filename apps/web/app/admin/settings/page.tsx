'use client';

import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';

const ORG_FIELDS: [string, string][] = [
  ['Name', 'Pashtoonkhwa Blood Bank & Welfare Society'],
  ['Head office', 'Zainab Chamber, Shara-e-Adalat, Quetta'],
  ['Phone', '081-2836820'],
  ['Second phone', '081-2839500'],
  ['Email', 'admin@pashtoonkhwabloodbank.org'],
  ['Founded', '24 March 1999'],
];

const DONATE_RULES: [string, number][] = [
  ['Minimum age', 18],
  ['Maximum age', 60],
  ['Minimum weight (kg)', 50],
  ['Days between donations', 90],
  ['Most calls to one donor per day', 2],
];

const LANGUAGES: [string, string, string][] = [
  ['English', 'default', 'ok'],
  ['اردو Urdu', 'live', 'ok'],
  ['پښتو Pashto', '62% translated', 'wt'],
];

const SWITCHES: [string, number][] = [
  ['Shortage strip on the home page', 1],
  ['Donor registration form', 1],
  ['Event registration', 1],
  ['WhatsApp button — when the bot is ready', 0],
];

export default function AdminSettings() {
  return (
    <AdminShell view="settings" title="Site settings">
      <div className="g2" style={css('gap:18px;align-items:start')}>
        <div className="acard">
          <h3 style={css('margin-bottom:16px')}>The organisation</h3>
          {ORG_FIELDS.map(([k, v]) => (
            <div key={k} className="fgrp"><label className="lb">{k}</label><input className="fld" defaultValue={v} /></div>
          ))}
          <button className="btn btn-p" style={css('width:100%')} onClick={() => alert('Save — wires to PATCH /settings (T9).')}>Save</button>
          <p className="ahint">
            Changed here, changed everywhere — the header, the footer, every contact block and every printed form.
          </p>
        </div>
        <div>
          <div className="acard">
            <h3 style={css('margin-bottom:6px')}>Who can donate</h3>
            <p className="sm" style={css('margin-bottom:16px')}>The same numbers the public Services page shows, so the two can never disagree.</p>
            {DONATE_RULES.map(([k, v]) => (
              <div key={k} className="row" style={css('padding:10px 0;border-bottom:1px solid var(--line)')}>
                <span style={css('flex:1;font-weight:600')}>{k}</span>
                <input className="fld" style={css('width:88px;text-align:center')} defaultValue={v} />
              </div>
            ))}
          </div>
          <div className="acard" style={css('margin-top:18px')}>
            <h3 style={css('margin-bottom:16px')}>Languages</h3>
            {LANGUAGES.map(([l, s, c]) => (
              <div key={l} className="row" style={css('padding:11px 0;border-bottom:1px solid var(--line)')}>
                <span style={css('flex:1;font-weight:600')}>{l}</span>
                <span className={`tag ${c}`}>{s}</span>
              </div>
            ))}
            <p className="ahint">
              A language stays switched off until it is complete. Anything untranslated falls back to English rather than
              showing blank.
            </p>
          </div>
          <div className="acard" style={css('margin-top:18px')}>
            <h3 style={css('margin-bottom:16px')}>Switches</h3>
            {SWITCHES.map(([t, on]) => (
              <label key={t} className="chk"><input type="checkbox" defaultChecked={!!on} disabled={!on} /><span>{t}</span></label>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
