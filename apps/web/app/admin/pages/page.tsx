'use client';

import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';

interface SitePage {
  name: string;
  url: string;
  blocks: string;
  menu: string;
  langs: string;
  status: 'live' | 'draft';
}

// Site pages, ported from SITEPAGES in pbb-admin2.js.
const SITEPAGES: SitePage[] = [
  { name: 'Home', url: '/', blocks: '10', menu: 'Home', langs: 'EN اردو', status: 'live' },
  { name: 'Our story', url: '/about', blocks: '7', menu: 'About', langs: 'EN اردو', status: 'live' },
  { name: 'Services', url: '/services', blocks: '6', menu: 'Services', langs: 'EN', status: 'live' },
  { name: 'Our branches', url: '/branches', blocks: '3', menu: 'About', langs: 'EN اردو', status: 'live' },
  { name: 'Thalassemia children', url: '/thalassemia', blocks: '5', menu: 'Services', langs: 'EN اردو', status: 'live' },
  { name: 'Committee & staff', url: '/people', blocks: '3', menu: 'About', langs: 'EN', status: 'live' },
  { name: 'Photos & videos', url: '/gallery', blocks: '1', menu: 'Media', langs: 'EN', status: 'live' },
  { name: 'Announcements', url: '/news', blocks: '1', menu: 'Media', langs: 'EN', status: 'live' },
  { name: 'Donate', url: '/donate', blocks: '6', menu: 'Get involved', langs: 'EN اردو', status: 'live' },
  { name: 'Contact', url: '/contact', blocks: '4', menu: 'Contact', langs: 'EN', status: 'live' },
  { name: 'Annual report 2026', url: '/report-2026', blocks: '9', menu: '—', langs: 'EN', status: 'draft' },
];

const BLOCKS = ['heading', 'rich text', 'text + image', 'cards', 'stat row', 'timeline', 'people grid', 'gallery', 'FAQ', 'table', 'quote', 'file download', 'video', 'map', 'form', 'call to action'];

const VERSIONS: [string, string][] = [
  ['Today, 11:04', 'Olus Yar'],
  ['7 August', 'Web administrator'],
  ['2 August', 'Web administrator'],
];

export default function AdminPages() {
  const actions = (
    <>
      <span style={css('margin-left:auto')} />
      <button type="button" className="btn btn-p btn-s" onClick={() => showToast('Adding a page wires to the API')}>+ New page</button>
    </>
  );

  return (
    <AdminShell view="pages" title="Pages" subtitle={`${SITEPAGES.length} pages`} actions={actions}>
      <div className="atbl">
        <table>
          <thead><tr><th>Page</th><th>Address</th><th>Blocks</th><th>In the menu</th><th>Languages</th><th>Status</th></tr></thead>
          <tbody>
            {SITEPAGES.map((p) => (
              <tr key={p.url}>
                <td className="m2"><div className="nm">{p.name}</div><div className="sm mono2">{p.url}</div></td>
                <td className="mono2">{p.url}</td>
                <td>{p.blocks}</td>
                <td>{p.menu}</td>
                <td className="m1">{p.langs}</td>
                <td className="m3">{p.status === 'live' ? <span className="tag ok">Live</span> : <span className="tag gy">Draft</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="g2" style={css('gap:18px;margin-top:18px;align-items:start')}>
        <div className="acard">
          <h3 style={css('margin-bottom:6px')}>Blocks you can build a page from</h3>
          <p className="sm" style={css('margin-bottom:14px')}>Add, drag, remove. No developer needed.</p>
          <div className="row" style={css('gap:7px')}>
            {BLOCKS.map((x) => <span key={x} className="chip">{x}</span>)}
          </div>
        </div>
        <div className="acard">
          <h3 style={css('margin-bottom:6px')}>Every publish is saved</h3>
          <p className="sm">You can look at any earlier version of a page and put it back. Nothing is lost by a wrong edit.</p>
          <div style={css('margin-top:14px')}>
            {VERSIONS.map(([d, who]) => (
              <div key={d} className="drow"><span>{d}</span><b>{who}</b></div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
