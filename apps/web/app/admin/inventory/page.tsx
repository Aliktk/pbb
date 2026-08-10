'use client';

import { useState } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';

function bgTag(g: string) {
  return <span className={`abg${g.includes('−') ? ' r' : ''}`}>{g}</span>;
}

type CoverClass = 'cr' | 'lo' | 'ok';

// Bags on the shelf and units of that group asked for over the last year, head-office scope
// (HELDBY[null] / DEMAND default in pbb-admin2.js). Months of cover is derived from these two.
const HELD: Record<string, number> = { 'O−': 2, 'AB−': 3, 'B−': 6, 'A−': 11, 'O+': 41, 'A+': 34, 'B+': 28, 'AB+': 9 };
const DEMAND: Record<string, number> = { 'O−': 38, 'AB−': 14, 'B−': 44, 'A−': 36, 'O+': 210, 'A+': 150, 'B+': 165, 'AB+': 22 };

// Preserve the prototype's HELDBY[null] key order so boxes render in the same sequence.
const STOCK_ORDER = ['O−', 'AB−', 'B−', 'A−', 'O+', 'A+', 'B+', 'AB+'] as const;

function coverClass(g: string): CoverClass {
  const d = DEMAND[g];
  const c = d ? HELD[g] / (d / 12) : 99;
  return c < 1 ? 'cr' : c < 2 ? 'lo' : 'ok';
}

function coverTag(s: CoverClass) {
  if (s === 'cr') return <span className="tag no">Critical</span>;
  if (s === 'lo') return <span className="tag wt">Low</span>;
  return <span className="tag ok">Enough</span>;
}

// Units expiring soon (inline sample data in the prototype).
const EXPIRING: [string, string, string, boolean][] = [
  ['O−', '#4821', '3 days', true],
  ['B+', '#4776', '9 days', false],
  ['A+', '#4802', '12 days', false],
];

interface StockBox {
  g: string;
  n: number;
  s: CoverClass;
}

export default function AdminInventory() {
  const [stock, setStock] = useState<StockBox[]>(
    STOCK_ORDER.map((g) => ({ g, n: HELD[g], s: coverClass(g) })),
  );

  function adjust(g: string, delta: number) {
    setStock((prev) => prev.map((box) => (box.g === g ? { ...box, n: Math.max(0, box.n + delta) } : box)));
  }

  const actions = (
    <>
      <span style={css('margin-left:auto')} />
      <button className="btn btn-p btn-s" onClick={() => alert('Save stock — wires to API later.')}>Save stock</button>
    </>
  );

  return (
    <AdminShell view="inventory" title="Inventory" subtitle="Quetta · updated 2 hours ago" actions={actions}>
      <div className="stockgrid big">
        {stock.map(({ g, n, s }) => (
          <div key={g} className={`sbox ${s}`}>
            <div className="row" style={css('justify-content:space-between')}>
              <div className="sg">{g}</div>
              {coverTag(s)}
            </div>
            <div className="sn big">{n}</div>
            <div className="ss">{n === 1 ? 'bag' : 'bags'} in the fridge</div>
            <div className="row" style={css('gap:6px;margin-top:12px')}>
              <button className="btn btn-o btn-s" onClick={() => adjust(g, -1)}>−</button>
              <button className="btn btn-o btn-s" onClick={() => adjust(g, 1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      <div className="g2" style={css('gap:18px;margin-top:18px;align-items:start')}>
        <div className="acard">
          <h3 style={css('margin-bottom:14px')}>Expiring soon</h3>
          {EXPIRING.map(([g, u, d, crit]) => (
            <div key={u} className="row" style={css('padding:11px 0;border-bottom:1px solid var(--line)')}>
              {bgTag(g)}
              <span className="mono2" style={css('flex:1')}>{u}</span>
              <span className={crit ? 'red' : 'sm'} style={css('font-weight:700')}>{d}</span>
            </div>
          ))}
        </div>
        <div className="acard">
          <h3 style={css('margin-bottom:6px')}>Show on the public website</h3>
          <p className="sm" style={css('margin-bottom:14px')}>The shortage strip on the home page reads these numbers.</p>
          <label className="chk"><input type="checkbox" defaultChecked /><span>Show what we are short of</span></label>
          <p className="ahint" style={css('margin-top:14px')}>
            If no branch updates for <b>48 hours</b> the strip hides itself automatically, so the public
            page can never show stale stock.
          </p>
        </div>
      </div>
    </AdminShell>
  );
}
