'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { Icon } from '../../../components/Icon';
import { CustomSelect } from '../../../components/CustomSelect';
import { DONORS } from '../../../lib/adminData';
import { getNetworkTowns } from '../../../lib/towns';

interface MonthlyStat {
  month: string;
  bags: number;
  percentage: number;
  isPeak?: boolean;
}

const MONTHLY_STATS: MonthlyStat[] = [
  { month: 'Oct', bags: 248, percentage: 46 },
  { month: 'Nov', bags: 313, percentage: 58 },
  { month: 'Dec', bags: 281, percentage: 52 },
  { month: 'Jan', bags: 383, percentage: 71 },
  { month: 'Feb', bags: 345, percentage: 64 },
  { month: 'Mar', bags: 432, percentage: 80 },
  { month: 'Apr', bags: 399, percentage: 74 },
  { month: 'May', bags: 486, percentage: 90 },
  { month: 'Jun', bags: 356, percentage: 66 },
  { month: 'Jul', bags: 459, percentage: 85 },
  { month: 'Aug', bags: 421, percentage: 78 },
  { month: 'Sep', bags: 540, percentage: 100, isPeak: true },
];

interface GroupGauge {
  group: string;
  count: number;
  demandRate: string;
  isRare: boolean;
  status: 'Critical Shortage' | 'Low Inventory' | 'Adequate';
}

const GROUP_GAUGES: GroupGauge[] = [
  { group: 'O−', count: 163, demandRate: 'Very High', isRare: true, status: 'Critical Shortage' },
  { group: 'AB−', count: 45, demandRate: 'High', isRare: true, status: 'Critical Shortage' },
  { group: 'B−', count: 124, demandRate: 'High', isRare: true, status: 'Low Inventory' },
  { group: 'A−', count: 97, demandRate: 'Moderate', isRare: true, status: 'Low Inventory' },
  { group: 'AB+', count: 188, demandRate: 'Moderate', isRare: false, status: 'Adequate' },
  { group: 'A+', count: 498, demandRate: 'High', isRare: false, status: 'Adequate' },
  { group: 'B+', count: 561, demandRate: 'High', isRare: false, status: 'Adequate' },
  { group: 'O+', count: 742, demandRate: 'Very High', isRare: false, status: 'Adequate' },
];

interface TownReportRow {
  town: string;
  donorsCount: number;
  requestsCount: number;
  answeredRate: string;
  avgResponseTime: string;
  performance: 'Optimal' | 'Good' | 'Needs Attention';
}

const INITIAL_TOWN_REPORTS: TownReportRow[] = [
  { town: 'Quetta', donorsCount: 2984, requestsCount: 312, answeredRate: '91%', avgResponseTime: '1h 52m', performance: 'Optimal' },
  { town: 'Pishin', donorsCount: 612, requestsCount: 108, answeredRate: '88%', avgResponseTime: '2h 30m', performance: 'Optimal' },
  { town: 'Loralai', donorsCount: 418, requestsCount: 74, answeredRate: '84%', avgResponseTime: '3h 05m', performance: 'Good' },
  { town: 'Zhob', donorsCount: 502, requestsCount: 96, answeredRate: '79%', avgResponseTime: '4h 12m', performance: 'Needs Attention' },
  { town: 'Chaman', donorsCount: 186, requestsCount: 63, answeredRate: '76%', avgResponseTime: '4h 40m', performance: 'Needs Attention' },
  { town: 'Muslim Bagh', donorsCount: 110, requestsCount: 41, answeredRate: '82%', avgResponseTime: '3h 20m', performance: 'Good' },
];

export default function AdminReports() {
  const [period, setPeriod] = useState('Twelve Months (Annual)');
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyStat | null>(null);
  const [townRows, setTownRows] = useState<TownReportRow[]>(INITIAL_TOWN_REPORTS);

  useEffect(() => {
    // Dynamic calculation from towns module if available
    const networkTowns = getNetworkTowns();
    if (networkTowns && networkTowns.length > 0) {
      const dynamicRows: TownReportRow[] = networkTowns.map((t) => {
        const donorsCount = DONORS.filter((d) => d.c.toLowerCase() === t.name.toLowerCase()).length || Math.floor(Math.random() * 200 + 80);
        const requestsCount = Math.floor(donorsCount * 0.18) + 10;
        const rateNum = Math.min(96, Math.max(72, 92 - Math.floor(requestsCount / 20)));
        const isOptimal = rateNum >= 88;
        const isGood = rateNum >= 82;
        return {
          town: t.name,
          donorsCount,
          requestsCount,
          answeredRate: `${rateNum}%`,
          avgResponseTime: rateNum > 88 ? '1h 50m' : rateNum > 80 ? '2h 40m' : '4h 15m',
          performance: isOptimal ? 'Optimal' : isGood ? 'Good' : 'Needs Attention',
        };
      });
      setTownRows(dynamicRows);
    }
  }, []);

  const totalBags = MONTHLY_STATS.reduce((sum, m) => sum + m.bags, 0);

  function exportCSVReport() {
    const headers = 'Town,Donors,Annual Requests,Answered Rate,Avg Response Time,Performance\n';
    const rows = townRows
      .map((r) => `"${r.town}",${r.donorsCount},${r.requestsCount},"${r.answeredRate}","${r.avgResponseTime}","${r.performance}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PBB_Annual_Transfusion_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('Exported annual executive report to CSV!');
  }

  function handlePrintReport() {
    showToast('Preparing report for printing...');
    setTimeout(() => {
      window.print();
    }, 300);
  }

  const periodOptions = [
    { value: 'Twelve Months (Annual)', label: 'Twelve Months (Annual)' },
    { value: 'Last 6 Months', label: 'Last 6 Months' },
    { value: 'Q3 2026 (Quarterly)', label: 'Q3 2026 (Quarterly)' },
    { value: 'This Month (September)', label: 'This Month (September)' },
  ];

  const topActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button type="button" className="btn btn-o btn-s" onClick={exportCSVReport} style={{ borderRadius: '8px' }}>
        📥 Export CSV
      </button>
      <button type="button" className="btn btn-p btn-s" onClick={handlePrintReport} style={{ borderRadius: '8px' }}>
        🖨️ Print Executive Report
      </button>
    </div>
  );

  return (
    <AdminShell
      view="reports"
      title="Analytics &amp; Executive Reports"
      subtitle={`${totalBags.toLocaleString()} total blood bags collected · 86.4% response rate`}
      actions={topActions}
    >
      {/* High-End Glassmorphic KPI Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* CARD 1: BAGS COLLECTED */}
        <div
          className="acard sec-tile"
          style={{
            borderRadius: '20px',
            padding: '20px',
            background: 'var(--surf)',
            border: '1px solid var(--line)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--txt2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Bags Collected (Annual)
            </span>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'rgba(217, 35, 35, 0.12)',
                color: 'var(--p)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0,
              }}
            >
              🩸
            </div>
          </div>

          <div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--txt1)', lineHeight: 1.1 }}>
              {totalBags.toLocaleString()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11.5px', fontWeight: 700, color: '#22C55E' }}>
              <span>↑ +14.2%</span>
              <span style={{ color: 'var(--txt3)', fontWeight: 500 }}>vs previous year</span>
            </div>
          </div>
        </div>

        {/* CARD 2: FULFILLMENT RATE */}
        <div
          className="acard sec-tile"
          style={{
            borderRadius: '20px',
            padding: '20px',
            background: 'var(--surf)',
            border: '1px solid var(--line)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--txt2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Request Fulfillment Rate
            </span>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'rgba(34, 197, 94, 0.12)',
                color: '#22C55E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0,
              }}
            >
              🎯
            </div>
          </div>

          <div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#22C55E', lineHeight: 1.1 }}>
              86.4%
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11.5px', fontWeight: 700, color: '#22C55E' }}>
              <span>✓ Optimal</span>
              <span style={{ color: 'var(--txt3)', fontWeight: 500 }}>Target: 85.0%</span>
            </div>
          </div>
        </div>

        {/* CARD 3: RESPONSE TIME */}
        <div
          className="acard sec-tile"
          style={{
            borderRadius: '20px',
            padding: '20px',
            background: 'var(--surf)',
            border: '1px solid var(--line)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--txt2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Avg Donor Response Time
            </span>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'rgba(59, 130, 246, 0.12)',
                color: '#3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0,
              }}
            >
              ⏱️
            </div>
          </div>

          <div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#3B82F6', lineHeight: 1.1 }}>
              2h 48m
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11.5px', fontWeight: 700, color: '#3B82F6' }}>
              <span>⚡ 18 min faster</span>
              <span style={{ color: 'var(--txt3)', fontWeight: 500 }}>regional avg</span>
            </div>
          </div>
        </div>

        {/* CARD 4: DONOR RETENTION */}
        <div
          className="acard sec-tile"
          style={{
            borderRadius: '20px',
            padding: '20px',
            background: 'var(--surf)',
            border: '1px solid var(--line)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--txt2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Donor Retention Rate
            </span>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'rgba(168, 85, 247, 0.12)',
                color: '#A855F7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0,
              }}
            >
              🔄
            </div>
          </div>

          <div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--txt1)', lineHeight: 1.1 }}>
              38.2% <span style={{ fontSize: '15px', fontWeight: 700, color: '#A855F7' }}>Repeat</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11.5px', fontWeight: 700, color: '#A855F7' }}>
              <span>★ High Loyalty</span>
              <span style={{ color: 'var(--txt3)', fontWeight: 500 }}>voluntary pool</span>
            </div>
          </div>
        </div>
      </div>

      {/* Period Filter Selector */}
      <div className="afilters" style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--txt2)' }}>Report Period:</span>
          <div style={{ width: '220px' }}>
            <CustomSelect
              name="reportPeriod"
              options={periodOptions}
              value={period}
              onChange={(val) => setPeriod(val)}
            />
          </div>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--txt3)', fontWeight: 600 }}>
          📊 Data updated live from regional donor registers
        </div>
      </div>

      {/* 2-COLUMN CHARTS GRID */}
      <div className="g2" style={{ gap: '20px', alignItems: 'stretch', marginBottom: '24px' }}>
        {/* CHART 1: MONTHLY COLLECTION VOLUME BAR CHART */}
        <div
          className="acard"
          style={{
            borderRadius: '20px',
            padding: '24px',
            background: 'var(--surf)',
            border: '1px solid var(--line)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: '0 0 2px 0', fontSize: '17px', fontWeight: 800, color: 'var(--txt1)' }}>
                  Monthly Collection &amp; Transfusion Bags
                </h3>
                <p className="sm" style={{ margin: 0, fontSize: '12.5px', color: 'var(--txt2)' }}>
                  Twelve-month distribution to September 2026
                </p>
              </div>
              <span className="tag ok" style={{ fontSize: '11px' }}>
                Peak: Sep (540 Bags)
              </span>
            </div>

            {/* Hover Tooltip Box */}
            <div style={{ height: '24px', marginBottom: '10px' }}>
              {hoveredMonth ? (
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--p)' }}>
                  📅 {hoveredMonth.month}: <b>{hoveredMonth.bags} bags collected</b> ({hoveredMonth.percentage}% of peak capacity)
                </div>
              ) : (
                <div style={{ fontSize: '11.5px', color: 'var(--txt3)' }}>
                  Hover over bars to view monthly bag volume
                </div>
              )}
            </div>

            {/* Visual Bar Chart */}
            <div
              className="chart"
              style={{
                height: '180px',
                display: 'flex',
                alignItems: 'flex-end',
                gap: '8px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--line)',
              }}
            >
              {MONTHLY_STATS.map((m) => (
                <div
                  key={m.month}
                  onMouseEnter={() => setHoveredMonth(m)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  style={{
                    flex: 1,
                    height: `${m.percentage}%`,
                    background: m.isPeak
                      ? 'linear-gradient(180deg, #EF4444 0%, #B91C1C 100%)'
                      : 'linear-gradient(180deg, rgba(217, 35, 35, 0.6) 0%, rgba(217, 35, 35, 0.2) 100%)',
                    borderRadius: '6px 6px 0 0',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    position: 'relative',
                    boxShadow: m.isPeak ? '0 0 12px rgba(239, 68, 68, 0.5)' : undefined,
                  }}
                  className="sec-tile"
                />
              ))}
            </div>

            {/* X-Axis Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--txt3)', fontWeight: 600 }}>
              {MONTHLY_STATS.map((m) => (
                <span key={m.month} style={{ color: m.isPeak ? 'var(--p)' : undefined, fontWeight: m.isPeak ? 800 : undefined }}>
                  {m.month}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* CHART 2: RARE BLOOD SUPPLY GAUGES */}
        <div
          className="acard"
          style={{
            borderRadius: '20px',
            padding: '24px',
            background: 'var(--surf)',
            border: '1px solid var(--line)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: '0 0 2px 0', fontSize: '17px', fontWeight: 800, color: 'var(--txt1)' }}>
                  Rare Blood Supply &amp; Shortage Gauges
                </h3>
                <p className="sm" style={{ margin: 0, fontSize: '12.5px', color: 'var(--txt2)' }}>
                  Registered donors vs request frequency by group
                </p>
              </div>
              <span className="tag r" style={{ fontSize: '11px', background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>
                4 Rare Groups Deficit
              </span>
            </div>

            {/* Horizontal Gauges List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {GROUP_GAUGES.map((g) => {
                const percent = Math.round((g.count / 742) * 100);
                return (
                  <div key={g.group} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        width: '32px',
                        fontSize: '12px',
                        fontWeight: 800,
                        color: g.isRare ? '#EF4444' : 'var(--txt1)',
                      }}
                    >
                      {g.group}
                    </span>

                    <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          background: g.isRare ? '#EF4444' : 'var(--p)',
                          borderRadius: '99px',
                        }}
                      />
                    </div>

                    <span style={{ width: '42px', fontSize: '11.5px', fontWeight: 700, color: 'var(--txt2)', textAlign: 'right' }}>
                      {g.count}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="ahint" style={{ marginTop: '14px', fontSize: '12px' }}>
              💡 <b>Executive Insight:</b> The four Rh-negative groups (O−, AB−, B−, A−) account for 92% of emergency shortages. Targeted campaigns yield 3x higher impact.
            </p>
          </div>
        </div>
      </div>

      {/* TOWN PERFORMANCE TABLE */}
      <div className="acard" style={{ borderRadius: '20px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: '0 0 2px 0', fontSize: '17px', fontWeight: 800, color: 'var(--txt1)' }}>
              Regional Performance Breakdown by Town
            </h3>
            <p className="sm" style={{ margin: 0, fontSize: '12.5px', color: 'var(--txt2)' }}>
              Standing donor counts, annual requests, and fulfillment efficiency
            </p>
          </div>
          <button type="button" className="btn btn-o btn-s" onClick={exportCSVReport} style={{ borderRadius: '8px' }}>
            Export Table CSV
          </button>
        </div>

        <div className="atbl" style={{ border: 'none', overflowX: 'hidden' }}>
          <table style={{ width: '100%', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Town District</th>
                <th style={{ width: '16%' }}>Registered Donors</th>
                <th style={{ width: '16%' }}>Annual Requests</th>
                <th style={{ width: '16%' }}>Fulfillment Rate</th>
                <th style={{ width: '14%' }}>Avg Response</th>
                <th style={{ width: '10%', textAlign: 'right', paddingRight: '14px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {townRows.map((r) => (
                <tr key={r.town}>
                  <td className="m2" style={{ paddingRight: '10px' }}>
                    <div className="nm" style={{ fontWeight: 700, fontSize: '14px', color: 'var(--txt1)' }}>
                      {r.town}
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', fontWeight: 600, color: 'var(--txt1)' }}>
                    {r.donorsCount.toLocaleString()} Donors
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--txt2)' }}>
                    {r.requestsCount} Requests
                  </td>
                  <td style={{ fontSize: '13px', fontWeight: 700, color: '#22C55E' }}>
                    {r.answeredRate}
                  </td>
                  <td style={{ fontSize: '12.5px', color: 'var(--txt2)' }}>
                    {r.avgResponseTime}
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '14px' }}>
                    <span
                      className="tag"
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        background:
                          r.performance === 'Optimal'
                            ? 'rgba(34, 197, 94, 0.12)'
                            : r.performance === 'Good'
                            ? 'rgba(59, 130, 246, 0.12)'
                            : 'rgba(239, 68, 68, 0.12)',
                        color:
                          r.performance === 'Optimal'
                            ? '#22C55E'
                            : r.performance === 'Good'
                            ? '#3B82F6'
                            : '#EF4444',
                      }}
                    >
                      {r.performance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
