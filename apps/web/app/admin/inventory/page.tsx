'use client';

import { useState } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { TOWNS, BLOOD_GROUPS } from '../../../lib/nav';
import { CustomSelect } from '../../../components/CustomSelect';

function bgTag(g: string) {
  return <span className={`abg${g.includes('−') ? ' r' : ''}`}>{g}</span>;
}

type CoverClass = 'cr' | 'lo' | 'ok';

const HELD: Record<string, number> = { 'O−': 2, 'AB−': 3, 'B−': 6, 'A−': 11, 'O+': 41, 'A+': 34, 'B+': 28, 'AB+': 9 };
const DEMAND: Record<string, number> = { 'O−': 38, 'AB−': 14, 'B−': 44, 'A−': 36, 'O+': 210, 'A+': 150, 'B+': 165, 'AB+': 22 };
const STOCK_ORDER = ['O−', 'AB−', 'B−', 'A−', 'O+', 'A+', 'B+', 'AB+'] as const;

function coverClass(g: string, count: number): CoverClass {
  const d = DEMAND[g];
  const c = d ? count / (d / 12) : 99;
  return c < 1 ? 'cr' : c < 2 ? 'lo' : 'ok';
}

function coverTag(s: CoverClass) {
  if (s === 'cr') return <span className="tag no">Critical</span>;
  if (s === 'lo') return <span className="tag wt">Low</span>;
  return <span className="tag ok">Enough</span>;
}

function coverPercent(g: string, count: number): number {
  const monthlyDemand = (DEMAND[g] || 1) / 12;
  const pct = Math.round((count / (monthlyDemand * 2)) * 100);
  return Math.min(100, Math.max(5, pct));
}

const INITIAL_EXPIRING = [
  { group: 'O−', unitNo: '#4821', daysLeft: '3 days', critical: true },
  { group: 'B+', unitNo: '#4776', daysLeft: '9 days', critical: false },
  { group: 'A+', unitNo: '#4802', daysLeft: '12 days', critical: false },
];

interface StockBox {
  g: string;
  n: number;
  s: CoverClass;
}

export default function AdminInventory() {
  const [selectedBranch, setSelectedBranch] = useState('Quetta Head Office');
  const [stock, setStock] = useState<StockBox[]>(
    STOCK_ORDER.map((g) => ({ g, n: HELD[g], s: coverClass(g, HELD[g]) })),
  );
  const [expiringUnits, setExpiringUnits] = useState(INITIAL_EXPIRING);

  function adjust(g: string, delta: number) {
    setStock((prev) =>
      prev.map((box) => {
        if (box.g !== g) return box;
        const newCount = Math.max(0, box.n + delta);
        return { ...box, n: newCount, s: coverClass(g, newCount) };
      }),
    );
  }

  function setCountDirectly(g: string, value: string) {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setStock((prev) =>
      prev.map((box) => (box.g === g ? { ...box, n: num, s: coverClass(g, num) } : box)),
    );
  }

  function handleDispatch(unitNo: string) {
    setExpiringUnits((cur) => cur.filter((u) => u.unitNo !== unitNo));
    showToast(`Unit ${unitNo} dispatched.`);
  }

  const totalBags = stock.reduce((sum, item) => sum + item.n, 0);
  const criticalCount = stock.filter((item) => item.s === 'cr').length;
  const lowCount = stock.filter((item) => item.s === 'lo').length;

  const branchOptions = [
    { value: 'Quetta Head Office', label: 'Quetta Head Office (Central Fridge)' },
    ...TOWNS.map((t) => ({ value: `${t} Branch`, label: `${t} Branch` })),
  ];

  const actions = (
    <button
      type="button"
      className="btn btn-p btn-s"
      onClick={() => showToast(`Inventory saved for ${selectedBranch}.`)}
    >
      Save Inventory
    </button>
  );

  return (
    <AdminShell
      view="inventory"
      title="Inventory"
      subtitle={`${selectedBranch} · updated 12 mins ago`}
      actions={actions}
    >
      {/* Top KPI Metric Cards */}
      <div className="akpi">
        <div className="c">
          <div className="l">Total Bags in Stock</div>
          <div className="n">{totalBags}</div>
        </div>
        <div className="c">
          <div className="l">Critical Shortages</div>
          <div className="n r">{criticalCount} {criticalCount === 1 ? 'group' : 'groups'}</div>
        </div>
        <div className="c">
          <div className="l">Low Stock Groups</div>
          <div className="n" style={{ color: '#D97706' }}>{lowCount} {lowCount === 1 ? 'group' : 'groups'}</div>
        </div>
        <div className="c">
          <div className="l">Expiring Soon</div>
          <div className="n">{expiringUnits.length} {expiringUnits.length === 1 ? 'bag' : 'bags'}</div>
        </div>
      </div>

      {/* Filter / Branch Bar */}
      <div className="afilters" style={{ alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--mid)' }}>Branch Scope:</span>
          <div style={{ minWidth: '260px' }}>
            <CustomSelect
              name="branch"
              options={branchOptions}
              value={selectedBranch}
              onChange={(val) => setSelectedBranch(val)}
            />
          </div>
        </div>
        <span className="sm" style={{ marginLeft: 'auto' }}>
          Real-time cold-chain tracker active
        </span>
      </div>

      {/* 8 Blood Group Stock Grid */}
      <div className="inv-grid">
        {stock.map(({ g, n, s }) => {
          const pct = coverPercent(g, n);
          return (
            <div key={g} className={`inv-card ${s}`}>
              <div className="inv-card-head">
                {bgTag(g)}
                {coverTag(s)}
              </div>

              <div className="inv-count-row">
                <span className="inv-count-num">{n}</span>
                <span className="inv-count-unit">{n === 1 ? 'bag in fridge' : 'bags in fridge'}</span>
              </div>

              <div className="inv-progress-bg" title={`${pct}% of monthly demand target`}>
                <div className={`inv-progress-bar ${s}`} style={{ width: `${pct}%` }} />
              </div>

              <div className="inv-controls">
                <button
                  type="button"
                  className="inv-btn-ctrl"
                  onClick={() => adjust(g, -1)}
                  aria-label={`Decrease ${g} stock`}
                >
                  −
                </button>
                <input
                  type="number"
                  className="inv-num-input"
                  value={n}
                  onChange={(e) => setCountDirectly(g, e.target.value)}
                  min="0"
                />
                <button
                  type="button"
                  className="inv-btn-ctrl"
                  onClick={() => adjust(g, 1)}
                  aria-label={`Increase ${g} stock`}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Grid Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', alignItems: 'start', width: '100%' }}>
        <div className="acard" style={{ minWidth: 0 }}>
          <h3 style={css('margin-bottom:14px')}>Expiring soon (Prioritise Dispatch)</h3>
          {expiringUnits.length ? (
            expiringUnits.map(({ group, unitNo, daysLeft, critical }) => (
              <div key={unitNo} className="row" style={{ padding: '12px 0', borderBottom: '1px solid var(--line)', gap: '12px', alignItems: 'center' }}>
                {bgTag(group)}
                <span className="mono2" style={{ fontWeight: 700, flex: 1, minWidth: 0 }}>{unitNo}</span>
                <span className={`tag ${critical ? 'no' : 'wt'}`}>{daysLeft}</span>
                <button
                  type="button"
                  className="btn btn-o btn-s"
                  onClick={() => handleDispatch(unitNo)}
                >
                  Dispatch Unit
                </button>
              </div>
            ))
          ) : (
            <p className="sm" style={{ padding: '16px 0', color: 'var(--mid)' }}>No units expiring within 14 days.</p>
          )}
        </div>

        <div className="acard" style={{ minWidth: 0 }}>
          <h3 style={css('margin-bottom:6px')}>Public Website Sync</h3>
          <p className="sm" style={css('margin-bottom:14px')}>The urgent shortage ticker on the home page reads these live levels.</p>
          <label className="chk"><input type="checkbox" defaultChecked /><span>Broadcast critical shortages publicly</span></label>
          <p className="ahint" style={css('margin-top:14px')}>
            If no branch updates for <b>48 hours</b>, the ticker hides itself automatically so the public site never displays stale stock figures.
          </p>
        </div>
      </div>
    </AdminShell>
  );
}
