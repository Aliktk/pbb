'use client';

import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';

interface Announcement {
  m: string; // message
  k: string; // kind
  s: string; // starts
  e: string; // ends
  w: string; // shown on
  st: 'live' | 'expired';
}

const ANNOUNCEMENTS: Announcement[] = [
  { m: 'Free blood donation camp, Pishin branch, 12 September', k: 'Camp', s: 'now', e: '20 Sep', w: 'strip · home · news', st: 'live' },
  { m: 'New building — final stage', k: 'Notice', s: '3 Sep', e: '—', w: 'news', st: 'live' },
  { m: 'Eid ul Adha hide collection', k: 'Appeal', s: '1 Jun', e: '20 Jun', w: 'strip · home', st: 'expired' },
];

const WHERE: [string, number][] = [
  ['Strip across the top of every page', 1],
  ['Card on the home page', 1],
  ['The announcements page', 1],
  ['WhatsApp broadcast — when the bot is ready', 0],
];

export default function AdminAnnouncements() {
  const actions = (
    <>
      <span style={css('margin-left:auto')} />
      <button type="button" className="btn btn-p btn-s" onClick={() => showToast('New announcement wires to the API')}>+ New</button>
    </>
  );

  return (
    <AdminShell view="announcements" title="Announcements" subtitle="1 live" actions={actions}>
      <div className="atbl">
        <table>
          <thead>
            <tr><th>Message</th><th>Kind</th><th>Starts</th><th>Ends</th><th>Shown on</th><th>Status</th></tr>
          </thead>
          <tbody>
            {ANNOUNCEMENTS.map((a) => (
              <tr key={a.m}>
                <td className="m2"><div className="nm">{a.m}</div><div className="sm">{a.w}</div></td>
                <td className="m1">{a.k}</td>
                <td className="sm">{a.s}</td>
                <td className="sm">{a.e}</td>
                <td className="sm">{a.w}</td>
                <td className="m3">{a.st === 'live' ? <span className="tag ok">Live</span> : <span className="tag gy">Expired</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="acard" style={css('margin-top:18px')}>
        <h3 style={css('margin-bottom:16px')}>New announcement</h3>
        <div className="g2" style={css('gap:18px;align-items:start')}>
          <div>
            <div className="fgrp"><label className="lb">Message</label><textarea className="fld" rows={3} placeholder="Keep it to one sentence." /></div>
            <div className="g2" style={css('gap:12px')}>
              <div className="fgrp"><label className="lb">Starts</label><input className="fld" type="date" /></div>
              <div className="fgrp"><label className="lb">Ends</label><input className="fld" type="date" /></div>
            </div>
          </div>
          <div>
            <label className="lb">Where it appears</label>
            {WHERE.map(([t, on]) => (
              <label key={t} className="chk"><input type="checkbox" defaultChecked={!!on} disabled={!on} /><span>{t}</span></label>
            ))}
            <button type="button" className="btn btn-p" style={css('width:100%;margin-top:16px')} onClick={() => showToast('Publishing wires to the API')}>Publish</button>
          </div>
        </div>
        <p className="ahint">
          An end date is required on urgent notices. The most common failing of a small organisation&apos;s website is a
          banner from two years ago that nobody remembered to remove.
        </p>
      </div>
    </AdminShell>
  );
}
