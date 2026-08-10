import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';

// Data import / export / backups, ported from pbb-admin5.js (PAGES['admin/data']). Twenty-seven
// years of paper does not have to be typed twice: upload a spreadsheet and match the columns once.
// Anything the importer cannot read with confidence is left blank rather than guessed — a wrong
// last-donation date puts a donor at risk. Export is head-office only (rendered as head office).

type MapState = 'ok' | 'warn' | 'off';

const MAPPING: [string, string, MapState][] = [
  ['Name', 'Column A — Name', 'ok'],
  ['Blood group', 'Column C — Grp', 'ok'],
  ['Phone', 'Column D — Contact', 'ok'],
  ['Town', 'Column F — Area', 'ok'],
  ['Last donated', 'Column H — Date', 'warn'],
  ['Address', 'not matched', 'off'],
];

const DUPES: [string, string, string][] = [
  ['Abdul Samad Kakar', '0300 3815590', 'already on the Quetta register'],
  ['Muhammad Ayaz', '0333 7828121', 'already on the Pishin register'],
];

const EXPORTS: [string, string][] = [
  ['Donor register', 'CSV or Excel'],
  ['Blood requests', 'CSV'],
  ['Donations ledger', 'CSV'],
  ['Thalassemia register', 'CSV'],
  ['Everything', 'a full backup file'],
];

const BACKUPS: [string, string][] = [
  ['Last night', '02:00'],
  ['Two nights ago', '02:00'],
  ['Three nights ago', '02:00'],
];

function mapTag(s: MapState) {
  if (s === 'ok') return <span className="tag ok">Matched</span>;
  if (s === 'warn') return <span className="tag wt">Check the date format</span>;
  return <span className="tag gy">Skipped</span>;
}

export default function AdminData() {
  return (
    <AdminShell view="data" title="Data" subtitle="Import, export and backups">
      <div className="g2" style={css('gap:18px;align-items:start')}>
        <div>
          <div className="acard">
            <h3 style={css('margin-bottom:6px')}>Bring the old book in</h3>
            <p className="sm" style={css('margin-bottom:18px')}>Twenty-seven years of paper does not have to be typed twice. Upload a spreadsheet and match the columns once.</p>
            <div className="dropzone" style={css('margin-bottom:16px')}>Drop a CSV or Excel file here<br /><span className="sm">or photograph a page and somebody will type it</span></div>
            <div className="qlab" style={css('margin-bottom:10px')}>Match the columns</div>
            {MAPPING.map(([f, c, s]) => (
              <div className="maprow" key={f}><span className="mf">{f}</span><span className="mc">{c}</span>{mapTag(s)}</div>
            ))}
            <div className="ahint" style={css('margin-top:16px')}>Dates in the old registers are written several ways. Anything the importer cannot read with confidence is left blank rather than guessed — a wrong last-donation date puts a donor at risk.</div>
            <button className="btn btn-p" style={css('width:100%;margin-top:16px')}>Check the file</button>
          </div>

          <div className="acard" style={css('margin-top:18px')}>
            <h3 style={css('margin-bottom:6px')}>What the check found</h3>
            <p className="sm" style={css('margin-bottom:16px')}>Nothing is saved until you say so.</p>
            <div className="g2" style={css('gap:12px')}>
              <div className="statbox ok"><b>1,842</b><span>rows ready</span></div>
              <div className="statbox wt"><b>61</b><span>possible duplicates</span></div>
              <div className="statbox no"><b>14</b><span>missing a phone number</span></div>
              <div className="statbox gy"><b>7</b><span>no blood group</span></div>
            </div>
            <div className="qlab" style={css('margin:20px 0 10px')}>Possible duplicates</div>
            {DUPES.map(([n, p, w]) => (
              <div className="duprow" key={n}>
                <div><b>{n}</b><div className="sm">{p} · {w}</div></div>
                <div className="row" style={css('gap:6px')}><button className="btn btn-o btn-s">Merge</button><button className="btn btn-o btn-s">Keep both</button></div>
              </div>
            ))}
            <button className="btn btn-p" style={css('width:100%;margin-top:18px')}>Import 1,842 donors</button>
            <button className="btn btn-o" style={css('width:100%;margin-top:9px')}>Cancel and start again</button>
          </div>
        </div>

        <div>
          <div className="acard">
            <h3 style={css('margin-bottom:6px')}>Take a copy out</h3>
            <p className="sm" style={css('margin-bottom:16px')}>Exporting the register is recorded in the log with the reason you type. Head office only.</p>
            {/* head-office-only in production: Export enabled only for head office (ROLE==='head') */}
            {EXPORTS.map(([n, f]) => (
              <div className="listrow" key={n}>
                <div><b>{n}</b><span className="sm" style={css('display:block')}>{f}</span></div>
                <button className="btn btn-o btn-s">Export</button>
              </div>
            ))}
          </div>

          <div className="acard" style={css('margin-top:18px')}>
            <h3 style={css('margin-bottom:6px')}>Backups</h3>
            <p className="sm" style={css('margin-bottom:14px')}>Taken every night and kept for ninety days.</p>
            {BACKUPS.map(([d, t]) => (
              <div className="listrow" key={d}>
                <div><b>{d}</b><div className="sm">{t}</div></div>
                <span className="tag ok">Complete</span>
              </div>
            ))}
            <button className="btn btn-o" style={css('width:100%;margin-top:14px')}>Restore from a backup</button>
          </div>

          <div className="acard" style={css('margin-top:18px;border-color:#F0BDB6')}>
            <h3 style={css('margin-bottom:6px;color:var(--red-d)')}>Removing somebody</h3>
            <p className="sm">A donor who asks to be taken off is removed the same day, and we do not ask them why. Their donations stay in the yearly totals as a number, without their name.</p>
            <button className="btn btn-o" style={css('width:100%;margin-top:14px')}>Remove a person</button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
