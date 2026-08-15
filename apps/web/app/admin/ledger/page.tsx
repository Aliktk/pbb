'use client';

import { useState } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { DONATIONS_TODAY } from '../../../lib/adminData';
import { CustomSelect } from '../../../components/CustomSelect';

function bgTag(g: string) {
  return <span className={`abg${g.includes('−') ? ' r' : ''}`}>{g}</span>;
}

export interface YearRecord {
  year: number;
  bags: number | null;
  ccs?: number;
  platelets?: number;
}

const INITIAL_YEARLY: YearRecord[] = [
  { year: 2008, bags: 5905, ccs: 2100, platelets: 850 },
  { year: 2009, bags: 5920, ccs: 2250, platelets: 910 },
  { year: 2010, bags: 6937, ccs: 2800, platelets: 1100 },
  { year: 2011, bags: 9484, ccs: 4100, platelets: 1650 },
  { year: 2012, bags: 5120, ccs: 1950, platelets: 780 },
  { year: 2013, bags: null },
  { year: 2014, bags: null },
  { year: 2015, bags: null },
  { year: 2024, bags: 7420, ccs: 3100, platelets: 1240 },
  { year: 2025, bags: 8150, ccs: 3500, platelets: 1390 },
];

const PEAK_BAGS = 9484;

export default function AdminLedger() {
  const [yearlyData, setYearlyData] = useState<YearRecord[]>(INITIAL_YEARLY);
  const [inputYear, setInputYear] = useState('2013');
  const [bagsInput, setBagsInput] = useState('');
  const [ccsInput, setCcsInput] = useState('');
  const [plateletsInput, setPlateletsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const recordedYears = yearlyData.filter((y) => y.bags !== null);
  const totalHistoricalBags = recordedYears.reduce((sum, y) => sum + (y.bags || 0), 0);
  const missingYearsCount = yearlyData.filter((y) => y.bags === null).length;

  const yearOptions = [
    { value: '2013', label: '2013 (Missing)' },
    { value: '2014', label: '2014 (Missing)' },
    { value: '2015', label: '2015 (Missing)' },
    { value: '2026', label: '2026 (Current)' },
  ];

  function handleSaveYear(e: React.FormEvent) {
    e.preventDefault();
    const bagsNum = parseInt(bagsInput, 10);
    if (!bagsNum || isNaN(bagsNum) || bagsNum <= 0) {
      showToast('Please enter a valid number of blood bags.');
      return;
    }

    setSubmitting(true);
    const yr = parseInt(inputYear, 10);
    const ccsNum = parseInt(ccsInput, 10) || 0;
    const plateletsNum = parseInt(plateletsInput, 10) || 0;

    setYearlyData((cur) =>
      cur.map((y) => (y.year === yr ? { ...y, bags: bagsNum, ccs: ccsNum, platelets: plateletsNum } : y)),
    );

    showToast(`Saved ${bagsNum.toLocaleString()} bags for year ${yr}. Chart updated!`);
    setBagsInput('');
    setCcsInput('');
    setPlateletsInput('');
    setSubmitting(false);
  }

  return (
    <AdminShell view="ledger" title="Donations Ledger" subtitle="Annual intake figures and public chart source">
      {/* Top Metric KPI Cards */}
      <div className="akpi">
        <div className="c">
          <div className="l">Total Recorded Intake</div>
          <div className="n">{totalHistoricalBags.toLocaleString()}</div>
        </div>
        <div className="c">
          <div className="l">Peak Intake (2011)</div>
          <div className="n" style={{ color: '#16A34A' }}>9,484</div>
        </div>
        <div className="c">
          <div className="l">Years Audited</div>
          <div className="n">{recordedYears.length} <span style={{ fontSize: '15px', color: 'var(--mid)', fontWeight: 500 }}>/ {yearlyData.length}</span></div>
        </div>
        <div className="c">
          <div className="l">Missing Gap Years</div>
          <div className="n r">{missingYearsCount}</div>
        </div>
      </div>

      {/* 2-Column Dashboard Cards */}
      <div className="g2" style={css('gap:18px;align-items:start')}>
        {/* Left: Yearly Intake Chart */}
        <div className="acard" style={{ padding: '22px' }}>
          <h3 style={css('margin-bottom:4px;font-size:18px')}>Yearly Intake History</h3>
          <p className="sm" style={css('margin-bottom:18px')}>
            Solid bars represent verified records. Dashed gaps indicate years awaiting historical entry.
          </p>

          <div className="chart" style={css('height:170px;margin-top:16px')}>
            {yearlyData.map(({ year: y, bags: b }) => {
              const heightPct = b ? Math.round((b / PEAK_BAGS) * 100) : 22;
              const isPeak = y === 2011;
              return (
                <div
                  key={y}
                  className={`bar${b ? (isPeak ? ' pk' : '') : ' gap'}`}
                  style={{ height: `${heightPct}%`, flex: 1 }}
                >
                  <span>
                    {y}{b ? ` · ${b.toLocaleString()} bags` : ' · no figures yet'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="axis" style={css('margin-top:14px')}>
            <span>2008</span>
            <span>2012</span>
            <span>2015</span>
            <span>2025</span>
          </div>

          <p className="sm" style={css('margin-top:16px;color:var(--mid);line-height:1.5')}>
            Intake figures are audited annually. Missing historical years (2013–2015) can be entered on the right to complete the public transparency timeline.
          </p>
        </div>

        {/* Right: Enter a Year Form */}
        <div className="acard" style={{ padding: '22px' }}>
          <h3 style={css('margin-bottom:4px;font-size:18px')}>Record / Audit Year Figures</h3>
          <p className="sm" style={css('margin-bottom:16px')}>
            Fill in historical yearly intake totals to update the public transparency chart.
          </p>

          <form onSubmit={handleSaveYear} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="g2" style={{ gap: '12px' }}>
              <div className="fgrp">
                <label className="lb">Target Year</label>
                <CustomSelect
                  name="year"
                  options={yearOptions}
                  value={inputYear}
                  onChange={(val) => setInputYear(val)}
                  direction="down"
                />
              </div>
              <div className="fgrp">
                <label className="lb">Whole Blood Bags *</label>
                <input
                  type="number"
                  className="fld"
                  placeholder="e.g. 6450"
                  value={bagsInput}
                  onChange={(e) => setBagsInput(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="g2" style={{ gap: '12px' }}>
              <div className="fgrp">
                <label className="lb">Packed Red Cells (CCs)</label>
                <input
                  type="number"
                  className="fld"
                  placeholder="e.g. 2600"
                  value={ccsInput}
                  onChange={(e) => setCcsInput(e.target.value)}
                />
              </div>
              <div className="fgrp">
                <label className="lb">Platelets + FFP</label>
                <input
                  type="number"
                  className="fld"
                  placeholder="e.g. 1150"
                  value={plateletsInput}
                  onChange={(e) => setPlateletsInput(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-p"
              style={{ width: '100%', marginTop: '6px' }}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Year Figures'}
            </button>
          </form>
        </div>
      </div>

      {/* Non-Scrolling Intake Table */}
      <div className="atbl" style={css('margin-top:20px;overflow-x:hidden')}>
        <table style={{ width: '100%', minWidth: 0, tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '18%' }}>Date</th>
              <th style={{ width: '32%' }}>Donor Name</th>
              <th style={{ width: '16%' }}>Blood Group</th>
              <th style={{ width: '16%' }}>Intake Quantity</th>
              <th style={{ width: '18%', textAlign: 'right' }}>Town / Branch</th>
            </tr>
          </thead>
          <tbody>
            {DONATIONS_TODAY.length ? (
              DONATIONS_TODAY.map(([date, name, g, bags, town]) => (
                <tr key={`${date}-${name}`}>
                  <td className="m1 sm">{date}</td>
                  <td className="m2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <div className="nm">{name}</div>
                    <div className="sm">{town}</div>
                  </td>
                  <td>{bgTag(g)}</td>
                  <td className="m3" style={{ fontWeight: 600 }}>{bags} {bags === 1 ? 'bag' : 'bags'}</td>
                  <td style={{ textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{town}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="aempty">No donations recorded today.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
