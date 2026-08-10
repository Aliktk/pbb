'use client';

import { useState } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';

interface Section {
  name: string;
  live: boolean;
  desc: string;
}

// Homepage section list, ported from SECTIONS in pbb-admin2.js.
const SECTIONS: Section[] = [
  { name: 'Announcement strip', live: true, desc: 'scheduled to 20 Sep' },
  { name: 'Hero', live: true, desc: 'headline, buttons, photograph' },
  { name: 'Key numbers', live: true, desc: 'four figures' },
  { name: 'Shortage strip', live: true, desc: 'reads from Inventory' },
  { name: 'What we do', live: true, desc: 'four cards' },
  { name: 'Yearly chart', live: true, desc: 'reads from the ledger' },
  { name: 'Where we are', live: true, desc: 'map + branches' },
  { name: 'Announcements', live: true, desc: 'latest three' },
  { name: 'Gallery preview', live: false, desc: 'latest four photos' },
  { name: 'Closing band', live: true, desc: 'red band + button' },
];

export default function AdminHomepage() {
  const [live, setLive] = useState<boolean[]>(SECTIONS.map((s) => s.live));

  function toggle(i: number) {
    setLive((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  const actions = (
    <>
      <span style={css('margin-left:auto')} />
      <a className="btn btn-o btn-s" href="/">View the site</a>
      <button type="button" className="btn btn-p btn-s" onClick={() => showToast('Publishing the homepage wires to the API')}>Publish</button>
    </>
  );

  return (
    <AdminShell view="homepage" title="Homepage" subtitle="Ten sections" actions={actions}>
      <div className="g2" style={css('gap:18px;align-items:start')}>
        <div>
          <p className="sm" style={css('margin-bottom:12px')}>Drag to reorder. Hide anything you are not ready to show.</p>
          {SECTIONS.map((s, i) => (
            <div key={s.name} className="secrow">
              <span className="grip">⠿</span>
              <div style={css('flex:1')}>
                <b>{s.name}</b>
                <span className="sm" style={css('display:block')}>{s.desc}</span>
              </div>
              <button className={`tag ${live[i] ? 'ok' : 'gy'}`} onClick={() => toggle(i)}>{live[i] ? 'Live' : 'Hidden'}</button>
              <button type="button" className="btn btn-o btn-s" onClick={() => showToast('Editing a section wires to the API')}>Edit</button>
            </div>
          ))}
          <div className="addrow">+ Add a section</div>
        </div>

        <div className="acard">
          <h3 style={css('margin-bottom:16px')}>Editing: Hero</h3>
          <div className="fgrp">
            <label className="lb">Headline</label>
            <input className="fld" defaultValue="Blood is life. We keep the record." />
          </div>
          <div className="fgrp">
            <label className="lb">Sub-headline</label>
            <textarea className="fld" rows={3} defaultValue="Screened, tested blood for anyone who needs it — irrespective of language, colour, religion, race or ethnicity." />
          </div>
          <div className="fgrp">
            <label className="lb">Buttons</label>
            <div className="row" style={css('gap:8px')}>
              <span className="chip">Request Blood</span>
              <span className="chip">Register as a Donor</span>
              <span className="chip" style={css('border-style:dashed')}>+ add</span>
            </div>
          </div>
          <div className="row" style={css('gap:8px;margin-top:6px')}>
            <span className="tag ok">English ✓</span>
            <span className="tag ok">اردو ✓</span>
            <span className="tag no">پښتو missing</span>
          </div>
          <button type="button" className="btn btn-p" style={css('width:100%;margin-top:18px')} onClick={() => showToast('Saving and publishing the homepage wires to the API')}>Save and publish</button>
        </div>
      </div>
    </AdminShell>
  );
}
