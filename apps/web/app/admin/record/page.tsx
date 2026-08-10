'use client';

import { useState, type FormEvent } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { DONORS, DONATIONS_TODAY, REQUESTS } from '../../../lib/adminData';

function bgTag(g: string) {
  return <span className={`abg${g.includes('−') ? ' r' : ''}`}>{g}</span>;
}

// Record a donation — one form, three fields. Saving (server-side, T2) writes the donation,
// sets the donor's next eligible date ninety days out, and adds to the year's total.
export default function AdminRecord() {
  const [saved, setSaved] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(true);
  }

  return (
    <AdminShell view="record" title="Record a donation" subtitle="One form, three fields">
      <div style={css('max-width:620px')}>
        <form className="acard" onSubmit={onSubmit}>
          <div className="fgrp">
            <label className="lb">Who donated?</label>
            <input className="fld" list="donorList" name="who" required placeholder="Type a name from the register…" />
            <datalist id="donorList">{DONORS.map((d) => <option key={d.id} value={d.n} />)}</datalist>
            <div className="sm" style={css('margin-top:7px')}>Not on the register? <b>Add them first →</b></div>
          </div>
          <div className="g2" style={css('gap:14px')}>
            <div className="fgrp"><label className="lb">Date</label><input className="fld" type="date" name="date" defaultValue={today} /></div>
            <div className="fgrp"><label className="lb">Bags</label><input className="fld" name="bags" defaultValue="1" inputMode="numeric" /></div>
          </div>
          <div className="fgrp">
            <label className="lb">Against a request? <span className="sm">— optional</span></label>
            <select className="fld" name="req">
              <option value="">Not linked</option>
              {REQUESTS.filter((r) => r.st === 'open').map((r) => <option key={r.id} value={r.id}>{r.id} · {r.g} · {r.hosp}</option>)}
            </select>
          </div>
          <button className="btn btn-p" style={css('width:100%;padding:15px')}>Save to the register</button>
          {saved && <div className="msg ok" style={css('margin-top:14px')}>✓ Saved. The donor’s next eligible date moves ninety days out.</div>}
        </form>

        <p className="ahint">
          Saving does three things at once: writes the donation, sets that donor’s next eligible date
          <b> ninety days out</b>, and adds to the year’s total. Nothing is entered twice.
        </p>

        <div className="acard" style={css('margin-top:18px')}>
          <h3 style={css('margin-bottom:14px')}>Recorded today</h3>
          {DONATIONS_TODAY.length ? (
            DONATIONS_TODAY.map(([, name, g, bags]) => (
              <div className="row" key={name} style={css('padding:11px 0;border-bottom:1px solid var(--line)')}>
                {bgTag(g)}<span style={css('flex:1;font-weight:600')}>{name}</span><span className="sm">{bags} bag</span>
              </div>
            ))
          ) : (
            <p className="sm">Nothing recorded yet today.</p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
