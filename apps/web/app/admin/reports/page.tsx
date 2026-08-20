'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { Icon } from '../../../components/Icon';
import { CustomSelect } from '../../../components/CustomSelect';
import { fetchNetworkTowns } from '../../../lib/towns';
import { fetchDonors } from '../../../lib/donors';
import { fetchAdminRequests } from '../../../lib/requests';

interface MonthlyStat {
  month: string;
  bags: number;
  percentage: number;
  isPeak?: boolean;
}

interface GroupGauge {
  group: string;
  count: number;
  demandRate: string;
  isRare: boolean;
  status: 'Critical Shortage' | 'Low Inventory' | 'Adequate';
}

interface TownReportRow {
  town: string;
  donorsCount: number;
  requestsCount: number;
  answeredRate: string;
  avgResponseTime: string;
  performance: 'Optimal' | 'Good' | 'Needs Attention';
}

// Group metadata (rarity + demand narrative) is domain knowledge; counts are always the real number
// of registered donors per group, filled in from Supabase. Status is derived from the live count.
const GROUP_META: ReadonlyArray<Pick<GroupGauge, 'group' | 'demandRate' | 'isRare'>> = [
  { group: 'O−', demandRate: 'Very High', isRare: true },
  { group: 'AB−', demandRate: 'High', isRare: true },
  { group: 'B−', demandRate: 'High', isRare: true },
  { group: 'A−', demandRate: 'Moderate', isRare: true },
  { group: 'AB+', demandRate: 'Moderate', isRare: false },
  { group: 'A+', demandRate: 'High', isRare: false },
  { group: 'B+', demandRate: 'High', isRare: false },
  { group: 'O+', demandRate: 'Very High', isRare: false },
];

const DEFAULT_GROUP_GAUGES: GroupGauge[] = GROUP_META.map((m) => ({
  ...m,
  count: 0,
  status: 'Adequate',
}));

// Neutral placeholder shown wherever a metric cannot yet be computed from real data.
const NOT_ENOUGH = '—';

export default function AdminReports() {
  const [period, setPeriod] = useState('Twelve Months (Annual)');
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyStat | null>(null);
  const [townRows, setTownRows] = useState<TownReportRow[]>([]);
  const [groupGauges, setGroupGauges] = useState<GroupGauge[]>(DEFAULT_GROUP_GAUGES);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
  const [totalDonorsCount, setTotalDonorsCount] = useState<number>(0);
  const [fulfillmentRateStr, setFulfillmentRateStr] = useState<string>(NOT_ENOUGH);
  const [avgResponseTimeStr, setAvgResponseTimeStr] = useState<string>(NOT_ENOUGH);
  const [periodSubtitleStr, setPeriodSubtitleStr] = useState<string>('Registered donors per calendar month');
  const [retentionRateStr, setRetentionRateStr] = useState<string>(NOT_ENOUGH);

  const loadReportsData = useCallback(async () => {
    // Read the real registers straight from Supabase (RLS-scoped). Everything below is derived from
    // these rows - no baseline datasets, no invented KPIs. Metrics that cannot be computed from the
    // available data stay as the neutral placeholder rather than showing a fabricated number.
    const [networkTowns, donors, requests] = await Promise.all([
      fetchNetworkTowns().catch(() => []),
      fetchDonors().catch(() => []),
      fetchAdminRequests().catch(() => []),
    ]);

    // 1. Group gauges - real registered-donor counts per blood group.
    const groupCounts: Record<string, number> = {
      'O−': 0, 'AB−': 0, 'B−': 0, 'A−': 0, 'AB+': 0, 'A+': 0, 'B+': 0, 'O+': 0,
    };
    donors.forEach((d) => {
      const label = (d.group || '').replace('-', '−');
      if (groupCounts[label] !== undefined) groupCounts[label] += 1;
    });
    const computedGauges: GroupGauge[] = GROUP_META.map((m) => {
      const count = groupCounts[m.group] ?? 0;
      // Status is a coverage signal relative to the busiest group, so it reacts to the real register.
      const maxCount = Math.max(...Object.values(groupCounts), 1);
      const ratio = count / maxCount;
      const status: GroupGauge['status'] =
        ratio < 0.15 ? 'Critical Shortage' : ratio < 0.4 ? 'Low Inventory' : 'Adequate';
      return { ...m, count, status };
    });
    setGroupGauges(computedGauges);

    // 2. Monthly volume - real blood requests grouped by the calendar month they were raised.
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const windowSize = period === 'Last 6 Months' ? 6 : period.includes('Q3') ? 3 : period.includes('This Month') ? 1 : 12;

    const now = new Date();
    const buckets: { key: string; month: string; year: number; monthIdx: number; count: number }[] = [];
    for (let i = windowSize - 1; i >= 0; i -= 1) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ key: `${dt.getFullYear()}-${dt.getMonth()}`, month: MONTH_NAMES[dt.getMonth()] ?? '', year: dt.getFullYear(), monthIdx: dt.getMonth(), count: 0 });
    }
    const bucketByKey = new Map(buckets.map((b) => [b.key, b]));
    requests.forEach((r) => {
      if (!r.createdAt) return;
      const dt = new Date(r.createdAt);
      const bucket = bucketByKey.get(`${dt.getFullYear()}-${dt.getMonth()}`);
      if (bucket) bucket.count += 1;
    });

    const maxBags = Math.max(...buckets.map((b) => b.count), 1);
    let peakKey = buckets[0]?.key;
    let peakVol = -1;
    buckets.forEach((b) => {
      if (b.count > peakVol) {
        peakVol = b.count;
        peakKey = b.key;
      }
    });
    const computedMonthly: MonthlyStat[] = buckets.map((b) => ({
      month: b.month,
      bags: b.count,
      percentage: Math.round((b.count / maxBags) * 100),
      isPeak: b.key === peakKey && b.count > 0,
    }));
    setMonthlyStats(computedMonthly);

    const first = buckets[0];
    const last = buckets[buckets.length - 1];
    setPeriodSubtitleStr(
      first && last
        ? `Requests raised per month (${first.month} ${first.year} – ${last.month} ${last.year})`
        : 'Requests raised per month',
    );

    // Real registry size (honest total; not a fabricated "bags collected" figure).
    setTotalDonorsCount(donors.length);

    // 3. Fulfillment rate - closed/arranged out of all requests. Only shown when there is data.
    const totalReq = requests.length;
    if (totalReq > 0) {
      const fulfilled = requests.filter((r) => r.status !== 'OPEN').length;
      setFulfillmentRateStr(`${Math.round((fulfilled / totalReq) * 100)}%`);
    } else {
      setFulfillmentRateStr(NOT_ENOUGH);
    }

    // 4. Avg response time - createdAt -> arrangedAt across requests that have been arranged.
    const arranged = requests.filter((r) => r.arrangedAt && r.createdAt);
    if (arranged.length > 0) {
      const totalMs = arranged.reduce((acc, r) => acc + (new Date(r.arrangedAt as string).getTime() - new Date(r.createdAt).getTime()), 0);
      const avgMinutes = Math.round(totalMs / arranged.length / 60000);
      const h = Math.floor(avgMinutes / 60);
      const m = avgMinutes % 60;
      setAvgResponseTimeStr(h > 0 ? `${h}h ${m}m` : `${m}m`);
    } else {
      setAvgResponseTimeStr(NOT_ENOUGH);
    }

    // 5. Retention rate - donors who have given more than once.
    if (donors.length > 0) {
      const repeatDonors = donors.filter((d) => (d.timesDonated || 0) > 1).length;
      setRetentionRateStr(`${Math.round((repeatDonors / donors.length) * 100)}% Repeat`);
    } else {
      setRetentionRateStr(NOT_ENOUGH);
    }

    // 6. Town performance - real donor and request tallies per town. Response-rate / SLA figures are
    // not derivable per town here, so those columns show a neutral placeholder.
    const donorsByTown = new Map<string, number>();
    donors.forEach((d) => {
      const key = d.town ?? d.townId;
      if (key) donorsByTown.set(key, (donorsByTown.get(key) ?? 0) + 1);
    });
    const requestsByTown = new Map<string, number>();
    const fulfilledByTown = new Map<string, number>();
    requests.forEach((r) => {
      const key = r.town ?? r.townId;
      if (!key) return;
      requestsByTown.set(key, (requestsByTown.get(key) ?? 0) + 1);
      if (r.status !== 'OPEN') fulfilledByTown.set(key, (fulfilledByTown.get(key) ?? 0) + 1);
    });

    const computedTowns: TownReportRow[] = networkTowns.map((t) => {
      const donorsCount = donorsByTown.get(t.id) ?? donorsByTown.get(t.name) ?? 0;
      const requestsCount = requestsByTown.get(t.id) ?? requestsByTown.get(t.name) ?? 0;
      const fulfilled = fulfilledByTown.get(t.id) ?? fulfilledByTown.get(t.name) ?? 0;
      const rateNum = requestsCount > 0 ? Math.round((fulfilled / requestsCount) * 100) : null;
      const performance: TownReportRow['performance'] =
        rateNum === null ? 'Good' : rateNum >= 88 ? 'Optimal' : rateNum >= 60 ? 'Good' : 'Needs Attention';
      return {
        town: t.name,
        donorsCount,
        requestsCount,
        answeredRate: rateNum === null ? NOT_ENOUGH : `${rateNum}%`,
        avgResponseTime: NOT_ENOUGH,
        performance,
      };
    });
    setTownRows(computedTowns);
  }, [period]);

  useEffect(() => {
    loadReportsData();
  }, [loadReportsData]);

  function exportCSVReport() {
    if (townRows.length === 0) {
      showToast('No report data available to export.');
      return;
    }
    const headers = 'Town District,Registered Donors,Annual Requests,Fulfillment Rate,Avg Response Time,Performance Standing\n';
    const rows = townRows
      .map((r) => `"${r.town}",${r.donorsCount},${r.requestsCount},"${r.answeredRate}","${r.avgResponseTime}","${r.performance}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PBB_Regional_Transfusion_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('Exported annual executive report to CSV!');
  }

  const periodOptions = [
    { value: 'Twelve Months (Annual)', label: 'Twelve Months (Annual)' },
    { value: 'Last 6 Months', label: 'Last 6 Months' },
    { value: 'Q3 2026 (Quarterly)', label: 'Q3 2026 (Quarterly)' },
    { value: 'This Month (August)', label: 'This Month (August)' },
  ];

  const topActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button type="button" className="btn btn-p btn-s" onClick={exportCSVReport} style={{ borderRadius: '8px', gap: '6px' }}>
        📥 Export CSV
      </button>
    </div>
  );

  const peakItem = monthlyStats.find((m) => m.isPeak);
  const peakLabel = peakItem ? `Peak: ${peakItem.month} (${peakItem.bags} requests)` : 'No requests yet';
  const rareCount = groupGauges.filter((g) => g.isRare && g.status !== 'Adequate').length;

  return (
    <AdminShell
      view="reports"
      title="Analytics &amp; Executive Reports"
      subtitle={`${totalDonorsCount.toLocaleString()} registered donors · ${fulfillmentRateStr} request fulfillment`}
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
              Registered Donors
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
              {totalDonorsCount.toLocaleString()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11.5px', fontWeight: 500, color: 'var(--txt3)' }}>
              <span>across the regional register</span>
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
              {fulfillmentRateStr}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11.5px', fontWeight: 500, color: 'var(--txt3)' }}>
              <span>closed or arranged out of all requests</span>
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
              {avgResponseTimeStr}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11.5px', fontWeight: 500, color: 'var(--txt3)' }}>
              <span>request raised to arranged</span>
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
              {retentionRateStr}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '11.5px', fontWeight: 500, color: 'var(--txt3)' }}>
              <span>donors who have given more than once</span>
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
                  Monthly Blood Requests
                </h3>
                <p className="sm" style={{ margin: 0, fontSize: '12.5px', color: 'var(--txt2)' }}>
                  {periodSubtitleStr}
                </p>
              </div>
              <span className="tag ok" style={{ fontSize: '11px' }}>
                {peakLabel}
              </span>
            </div>

            {/* Hover Tooltip Box */}
            <div style={{ height: '24px', marginBottom: '10px' }}>
              {hoveredMonth ? (
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--p)' }}>
                  📅 {hoveredMonth.month}: <b>{hoveredMonth.bags} {hoveredMonth.bags === 1 ? 'request' : 'requests'}</b> ({hoveredMonth.percentage}% of peak month)
                </div>
              ) : (
                <div style={{ fontSize: '11.5px', color: 'var(--txt3)' }}>
                  Hover over bars to view monthly request volume
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
              {monthlyStats.map((m) => (
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
              {monthlyStats.map((m) => (
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
                {rareCount > 0 ? `${rareCount} Rare Groups Deficit` : 'All Groups Balanced'}
              </span>
            </div>

            {/* Horizontal Gauges List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {groupGauges.map((g) => {
                const maxCount = Math.max(...groupGauges.map((itm) => itm.count), 1);
                const percent = Math.min(100, Math.round((g.count / maxCount) * 100));
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
              💡 <b>Note:</b> The four Rh-negative groups (O−, AB−, B−, A−) are the rarest in the register, so their donor pools are the smallest and hardest to replace in an emergency.
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

        <div className="atbl" style={{ border: 'none', overflowX: 'auto' }}>
          <table style={{ width: '100%', tableLayout: 'fixed', minWidth: '720px' }}>
            <thead>
              <tr>
                <th style={{ width: '22%', paddingRight: '12px' }}>Town District</th>
                <th style={{ width: '20%', paddingRight: '20px', paddingLeft: '8px' }}>Registered Donors</th>
                <th style={{ width: '20%', paddingRight: '20px', paddingLeft: '8px' }}>Annual Requests</th>
                <th style={{ width: '15%', paddingRight: '12px', paddingLeft: '8px' }}>Fulfillment Rate</th>
                <th style={{ width: '12%', paddingRight: '12px' }}>Avg Response</th>
                <th style={{ width: '11%', textAlign: 'right', paddingRight: '14px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {townRows.map((r) => (
                <tr key={r.town}>
                  <td className="m2" style={{ paddingRight: '12px' }}>
                    <div className="nm" style={{ fontWeight: 700, fontSize: '14px', color: 'var(--txt1)' }}>
                      {r.town}
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', fontWeight: 600, color: 'var(--txt1)', paddingRight: '20px', paddingLeft: '8px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '8px', background: 'rgba(217, 35, 35, 0.08)', color: 'var(--p)', fontWeight: 700 }}>
                      <span style={{ fontSize: '11px' }}>🩸</span> {r.donorsCount.toLocaleString()} Donors
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--txt2)', paddingRight: '20px', paddingLeft: '8px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.08)', color: '#3B82F6', fontWeight: 600 }}>
                      <span style={{ fontSize: '11px' }}>📋</span> {r.requestsCount} Requests
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', fontWeight: 700, color: '#22C55E', paddingRight: '12px', paddingLeft: '8px' }}>
                    {r.answeredRate}
                  </td>
                  <td style={{ fontSize: '12.5px', color: 'var(--txt2)', paddingRight: '12px' }}>
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
