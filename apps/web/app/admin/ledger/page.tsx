import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { ActionButton } from '../../../components/ActionButton';
import { DONATIONS_TODAY } from '../../../lib/adminData';

function bgTag(g: string) {
  return <span className={`abg${g.includes('−') ? ' r' : ''}`}>{g}</span>;
}

// Yearly totals on record. A null bag figure is a year still to be entered.
const YEARLY: [number, number | null][] = [
  [2008, 5905], [2009, 5920], [2010, 6937], [2011, 9484],
  [2012, 5120], [2013, null], [2014, null], [2015, null],
];

const PEAK_BAGS = 9484;

// Static display screen - the "Enter a year" form is a design placeholder (wires to API later),
// so no client interactivity is needed here.
export default function AdminLedger() {
  return (
    <AdminShell view="ledger" title="Donations ledger" subtitle="Where the public chart comes from">
      <div className="g2" style={css('gap:18px;align-items:start')}>
        <div className="acard">
          <h3 style={css('margin-bottom:4px')}>Yearly totals</h3>
          <p className="sm" style={css('margin-bottom:18px')}>Solid bars are figures on record. Hatched years still need entering.</p>
          <div className="chart" style={css('height:150px')}>
            {YEARLY.map(([y, b]) => (
              <div key={y} className={`bar${b ? (y === 2011 ? ' pk' : '') : ' gap'}`} style={css(`height:${b ? Math.round((b / PEAK_BAGS) * 100) : 28}%`)}>
                <span>{y}{b ? ` · ${b.toLocaleString()} bags` : ' · no figures yet'}</span>
              </div>
            ))}
          </div>
          <div className="axis"><span>2008</span><span>2015</span></div>
        </div>

        <div className="acard">
          <h3 style={css('margin-bottom:4px')}>Enter a year</h3>
          <p className="sm" style={css('margin-bottom:16px')}>The gap between 2013 and today closes with four numbers a year - no migration needed.</p>
          <div className="g2" style={css('gap:12px')}>
            <div className="fgrp"><label className="lb">Year</label><input className="fld" inputMode="numeric" placeholder="2013" /></div>
            <div className="fgrp"><label className="lb">Bags</label><input className="fld" inputMode="numeric" /></div>
            <div className="fgrp"><label className="lb">CCs</label><input className="fld" inputMode="numeric" /></div>
            <div className="fgrp"><label className="lb">Platelets + FFP</label><input className="fld" inputMode="numeric" /></div>
          </div>
          <ActionButton className="btn btn-p" style={css('width:100%')} message="Saving the year wires to the API">Save the year</ActionButton>
        </div>
      </div>

      <div className="atbl" style={css('margin-top:18px')}>
        <table>
          <thead><tr><th>Date</th><th>Donor</th><th>Group</th><th>Bags</th><th>Town</th></tr></thead>
          <tbody>
            {DONATIONS_TODAY.length ? (
              DONATIONS_TODAY.map(([date, name, g, bags, town]) => (
                <tr key={`${date}-${name}`}>
                  <td className="m1 sm">{date}</td>
                  <td className="m2"><div className="nm">{name}</div><div className="sm">{town}</div></td>
                  <td>{bgTag(g)}</td>
                  <td className="m3">{bags}</td>
                  <td>{town}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="aempty">Nothing recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
