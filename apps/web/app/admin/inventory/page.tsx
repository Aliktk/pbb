'use client';

import { useEffect, useState } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { CustomSelect } from '../../../components/CustomSelect';
import { fetchStock, saveStockLevels } from '../../../lib/stock';
import { fetchTowns, type Town } from '../../../lib/towns';
import { splitGroup } from '../../../lib/bloodGroup';

function bgTag(g: string) {
  return <span className={`abg${g.includes('−') ? ' r' : ''}`}>{g}</span>;
}

type CoverClass = 'cr' | 'lo' | 'ok';

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

interface StockBox {
  g: string;
  n: number;
  s: CoverClass;
}

export default function AdminInventory() {
  const [towns, setTowns] = useState<Town[]>([]);
  const [selectedTownId, setSelectedTownId] = useState<string>('all');
  const [stock, setStock] = useState<StockBox[]>(
    STOCK_ORDER.map((g) => ({ g, n: 0, s: 'cr' })),
  );
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load the town list straight from Supabase (RLS-scoped) for the scope selector.
  useEffect(() => {
    fetchTowns()
      .then(setTowns)
      .catch(() => setTowns([]));
  }, []);

  // Fetch stock when the selected town changes. 'all' reads every town RLS allows (aggregated).
  useEffect(() => {
    if (!selectedTownId) return;
    let alive = true;
    setLoading(true);
    fetchStock(selectedTownId === 'all' ? undefined : selectedTownId)
      .then((byGroup) => {
        if (!alive) return;
        setStock(STOCK_ORDER.map((g) => ({ g, n: byGroup[g] || 0, s: coverClass(g, byGroup[g] || 0) })));
      })
      .catch(() => {
        if (alive) setStock(STOCK_ORDER.map((g) => ({ g, n: 0, s: coverClass(g, 0) })));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [selectedTownId]);

  function adjust(g: string, delta: number) {
    if (selectedTownId === 'all') {
      showToast('Select a specific town to modify inventory levels.');
      return;
    }
    setStock((prev) =>
      prev.map((box) => {
        if (box.g !== g) return box;
        const newCount = Math.max(0, box.n + delta);
        return { ...box, n: newCount, s: coverClass(g, newCount) };
      }),
    );
  }

  function setCountDirectly(g: string, value: string) {
    if (selectedTownId === 'all') {
      showToast('Select a specific town to modify inventory levels.');
      return;
    }
    const num = Math.max(0, parseInt(value, 10) || 0);
    setStock((prev) =>
      prev.map((box) => (box.g === g ? { ...box, n: num, s: coverClass(g, num) } : box)),
    );
  }

  async function handleSaveInventory() {
    if (!selectedTownId || selectedTownId === 'all') {
      showToast('Please select a specific town to save inventory changes.');
      return;
    }
    setSaving(true);
    try {
      const items = stock.map((item) => {
        const { bloodGroup, rhFactor } = splitGroup(item.g);
        return { bloodGroup, rhFactor, unitsAvailable: item.n };
      });

      await saveStockLevels(selectedTownId, items);

      const tName = towns.find((t) => t.id === selectedTownId)?.name || 'town';
      showToast(`Inventory saved successfully for ${tName}.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save inventory. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const totalBags = stock.reduce((sum, item) => sum + item.n, 0);
  const criticalCount = stock.filter((item) => item.s === 'cr').length;
  const lowCount = stock.filter((item) => item.s === 'lo').length;

  const townOptions = [
    { value: 'all', label: 'All Towns' },
    ...towns.map((t) => ({ value: t.id, label: t.name })),
  ];
  const selectedTownName = selectedTownId === 'all'
    ? 'All Network Towns'
    : towns.find((t) => t.id === selectedTownId)?.name || 'Selected town';

  const actions = (
    <button
      type="button"
      className="btn btn-p btn-s"
      onClick={handleSaveInventory}
      disabled={saving || selectedTownId === 'all'}
      title={selectedTownId === 'all' ? 'Select a specific town to edit inventory' : 'Save Inventory'}
      style={selectedTownId === 'all' ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
    >
      {saving ? 'Saving...' : 'Save Inventory'}
    </button>
  );

  return (
    <AdminShell
      view="inventory"
      title="Inventory"
      subtitle={`${selectedTownName} · Live levels`}
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
          <div className="l">Monitored Groups</div>
          <div className="n">8 groups</div>
        </div>
      </div>

      {/* Filter / Branch Bar */}
      <div className="afilters" style={{ alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--mid)' }}>Town Scope:</span>
          <div style={{ minWidth: '240px' }}>
            <CustomSelect
              name="town"
              options={townOptions}
              value={selectedTownId}
              onChange={(val) => setSelectedTownId(val)}
            />
          </div>
        </div>
        {selectedTownId === 'all' ? (
          <span className="tag ok" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
            🌐 Overall Network Aggregate View
          </span>
        ) : (
          <span className="sm" style={{ marginLeft: 'auto' }}>
            Real-time cold-chain tracker active
          </span>
        )}
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
