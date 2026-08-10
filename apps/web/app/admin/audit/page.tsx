import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';

// Append-only audit log. Read-only: the entries below are reproduced verbatim with no edit or
// delete controls - the log cannot be changed, by branch staff or head office. The admin panel
// renders the head-office (all-towns) view. Ported from the prototype's LOG.
const LOG: [string, string, string, string][] = [
  ['2 minutes ago', 'Pishin desk', 'Added a donor', 'Pishin'],
  ['18 minutes ago', 'Website', 'A blood request came in', 'Quetta'],
  ['1 hour ago', 'Zhob coordinator', 'Marked a request arranged', 'Zhob'],
  ['2 hours ago', 'Dr. Naseer Muhammad', 'Verified 4 donor records', 'All'],
  ['Yesterday', 'Olus Yar', 'Granted photo consent for T-027', 'Pishin'],
  ['Yesterday', 'Head office', 'Exported the donor list - reason: annual audit', 'All'],
  ['Yesterday', 'Zhob coordinator', 'Added 2 donors', 'Zhob'],
  ['2 days ago', 'Zhob coordinator', 'Updated stock', 'Zhob'],
];

export default function AdminAudit() {
  const rows = LOG;

  return (
    <AdminShell view="audit" title="Log" subtitle="Everything that has been changed">
      <div className="atbl">
        <table>
          <thead><tr><th>When</th><th>Who</th><th>What</th><th>Town</th></tr></thead>
          <tbody>
            {rows.map(([w, who, what, t], i) => (
              <tr key={i}>
                <td className="m1 sm">{w}</td>
                <td className="m2"><div className="nm">{who}</div><div className="sm">{what}</div></td>
                <td>{what}</td>
                <td className="m3 sm">{t}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="g2" style={css('gap:18px;margin-top:18px')}>
        <div className="acard">
          <h3 style={css('margin-bottom:6px')}>The log cannot be edited</h3>
          <p className="sm">Not by branch staff, and not by the head office. An organisation that holds other people&rsquo;s telephone numbers should be able to show exactly who looked at them.</p>
        </div>
        <div className="acard" style={css('border-color:#F0BDB6')}>
          <h3 style={css('margin-bottom:6px;color:var(--red-d)')}>Three things that always ask why</h3>
          <p className="sm">Deleting a record, exporting the donor list, and granting a child&rsquo;s photo consent. Each writes a line here with the reason typed by the person who did it.</p>
        </div>
      </div>
    </AdminShell>
  );
}
