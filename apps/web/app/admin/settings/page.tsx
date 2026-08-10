'use client';

import { useState } from 'react';
import Link from 'next/link';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { Icon } from '../../../components/Icon';
import { showToast } from '../../../lib/toast';
import { ROLES } from '../../../lib/admin';

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

// Feature flags — each can be switched on or off. Grouped so the effect is obvious. `locked`
// features are built but wait on something external (kept off, and not switchable). Wires to
// the API (a settings/feature-flags table) later; toggling now updates local state only.
interface Feature {
  key: string;
  label: string;
  desc: string;
  on: boolean;
  locked?: string; // reason it cannot be turned on yet
}

const FEATURE_GROUPS: [string, Feature[]][] = [
  ['Public website', [
    { key: 'shortage', label: 'Shortage strip on the home page', desc: 'The live “what we are short of today” banner.', on: true },
    { key: 'request', label: 'Online blood request', desc: 'Lets the public submit a request from the website.', on: true },
    { key: 'donorReg', label: 'Donor registration form', desc: 'The three-minute “register as a donor” form.', on: true },
    { key: 'volunteerReg', label: 'Volunteer & organisation forms', desc: 'Sign-ups for volunteers, partners and new town branches.', on: true },
    { key: 'needs', label: 'Who-needs-blood board', desc: 'The public list of open requests, shown without names.', on: true },
    { key: 'gallery', label: 'Photos & videos', desc: 'The public media gallery.', on: true },
    { key: 'events', label: 'Event registration', desc: 'Let people register to attend camps and events.', on: false },
  ]],
  ['Operations', [
    { key: 'inbox', label: 'Public form inbox', desc: 'Route every website form into the admin Inbox.', on: true },
    { key: 'crosscity', label: 'Cross-town donor calls', desc: 'Allow a branch to call a willing donor in another town during an emergency.', on: true },
    { key: 'twoStep', label: 'Two-step sign in', desc: 'Require an SMS code for anyone who can see phone numbers.', on: true },
    { key: 'sms', label: 'SMS notifications', desc: 'Send donors and requesters SMS updates.', on: false, locked: 'Waiting on the SMS gateway account' },
  ]],
];

const TABS = ['Settings', 'Features', 'Manage admins'] as const;

// Pick the right input type so the browser offers the correct keyboard and validation.
function fieldType(label: string): 'email' | 'tel' | 'text' {
  if (label === 'Email') return 'email';
  if (label.toLowerCase().includes('phone')) return 'tel';
  return 'text';
}

export default function AdminSettings() {
  const [tab, setTab] = useState(0);
  const [features, setFeatures] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(FEATURE_GROUPS.flatMap(([, fs]) => fs.map((f) => [f.key, f.on]))),
  );

  const toggle = (key: string, locked?: string) => {
    if (locked) {
      showToast(locked);
      return;
    }
    setFeatures((cur) => ({ ...cur, [key]: !cur[key] }));
  };

  const onCount = Object.values(features).filter(Boolean).length;

  return (
    <AdminShell view="settings" title="Site settings" subtitle="Organisation, features and administrators">
      <div className="row" style={css('gap:8px;margin-bottom:20px')}>
        {TABS.map((t, i) => (
          <button key={t} className={`pill${i === tab ? ' on' : ''}`} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      {tab === 0 && (
        <div className="g2" style={css('gap:18px;align-items:start')}>
          <div className="acard">
            <h3 className="row" style={css('gap:8px;margin-bottom:16px')}><Icon name="building" /> The organisation</h3>
            {ORG_FIELDS.map(([k, v]) => (
              <div key={k} className="fgrp"><label className="lb">{k}</label><input className="fld" type={fieldType(k)} defaultValue={v} /></div>
            ))}
            <button type="button" className="btn btn-p" style={css('width:100%')} onClick={() => showToast('Saving settings wires to the API')}>Save</button>
            <p className="ahint">Changed here, changed everywhere — the header, the footer, every contact block and every printed form.</p>
          </div>
          <div>
            <div className="acard">
              <h3 className="row" style={css('gap:8px;margin-bottom:6px')}><Icon name="drop" /> Who can donate</h3>
              <p className="sm" style={css('margin-bottom:16px')}>The same numbers the public Services page shows, so the two can never disagree.</p>
              {DONATE_RULES.map(([k, v]) => (
                <div key={k} className="row" style={css('padding:10px 0;border-bottom:1px solid var(--line)')}>
                  <span style={css('flex:1;font-weight:600')}>{k}</span>
                  <input className="fld" inputMode="numeric" style={css('width:88px;text-align:center')} defaultValue={v} />
                </div>
              ))}
            </div>
            <div className="acard" style={css('margin-top:18px')}>
              <h3 className="row" style={css('gap:8px;margin-bottom:16px')}><Icon name="pages" /> Languages</h3>
              {LANGUAGES.map(([l, s, c]) => (
                <div key={l} className="row" style={css('padding:11px 0;border-bottom:1px solid var(--line)')}>
                  <span style={css('flex:1;font-weight:600')}>{l}</span>
                  <span className={`tag ${c}`}>{s}</span>
                </div>
              ))}
              <p className="ahint">A language stays off until it is complete. Anything untranslated falls back to English rather than showing blank.</p>
            </div>
          </div>
        </div>
      )}

      {tab === 1 && (
        <>
          <div className="row" style={css('margin-bottom:14px')}>
            <h3 className="row" style={css('gap:8px')}><Icon name="gear" /> Features</h3>
            <span className="sm" style={css('margin-left:auto')}>{onCount} on</span>
          </div>
          {FEATURE_GROUPS.map(([group, fs]) => (
            <div className="acard" key={group} style={css('margin-bottom:16px')}>
              <h3 style={css('margin-bottom:4px')}>{group}</h3>
              {fs.map((f) => {
                const on = features[f.key];
                return (
                  <div key={f.key} className="listrow">
                    <div style={css('flex:1;padding-right:14px')}>
                      <b>{f.label}</b>
                      <div className="sm">{f.locked ?? f.desc}</div>
                    </div>
                    <button
                      type="button"
                      className={`btn btn-s ${f.locked ? 'btn-o' : on ? 'btn-p' : 'btn-o'}`}
                      style={f.locked ? css('opacity:.6') : undefined}
                      onClick={() => toggle(f.key, f.locked)}
                    >
                      {f.locked ? 'Locked' : on ? 'On' : 'Off'}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
          <button type="button" className="btn btn-p" onClick={() => showToast('Saving feature switches wires to the API')}>Save features</button>
          <p className="ahint">Turning a feature off hides it everywhere at once — the public page, the menu and the admin screen that feeds it. A locked feature is built and waiting on something external.</p>
        </>
      )}

      {tab === 2 && (
        <>
          <div className="row" style={css('margin-bottom:14px')}>
            <h3 className="row" style={css('gap:8px')}><Icon name="users" /> Administrators</h3>
            <button type="button" className="btn btn-p btn-s" style={css('margin-left:auto')} onClick={() => showToast('Add administrator wires to POST /admin/accounts')}>+ Add admin</button>
          </div>
          <div className="acard" style={css('padding:0;overflow:hidden')}>
            {ROLES.map((r) => (
              <div key={r.key} className="listrow" style={css('padding:14px 18px')}>
                <div style={css('flex:1')}>
                  <b>{r.who}</b>
                  <div className="sm">{r.sub} · {r.scope ? `${r.scope} only` : 'All fourteen towns'}</div>
                </div>
                <button type="button" className="btn btn-o btn-s" onClick={() => showToast('Editing an administrator wires to the API')}>Manage</button>
              </div>
            ))}
          </div>
          <div className="g2" style={css('gap:16px;margin-top:18px;align-items:start')}>
            <Link href="/admin/accounts" className="acard" style={css('text-decoration:none')}>
              <h3 className="row" style={css('gap:8px;margin-bottom:6px')}><Icon name="accounts" /> Accounts &amp; hierarchy</h3>
              <p className="sm">Who created whom, which office each person belongs to, and how to move or suspend an account.</p>
            </Link>
            <Link href="/admin/roles" className="acard" style={css('text-decoration:none')}>
              <h3 className="row" style={css('gap:8px;margin-bottom:6px')}><Icon name="roles" /> Roles &amp; access</h3>
              <p className="sm">What each role can see and do, and which screens it may open. Change a role once and everyone in it moves together.</p>
            </Link>
          </div>
          <p className="ahint">An administrator can only create accounts weaker than their own, and only within the towns they are responsible for. A password is set by its owner — a super admin can reset it but never see it.</p>
        </>
      )}
    </AdminShell>
  );
}
