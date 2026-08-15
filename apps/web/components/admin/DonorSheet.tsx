'use client';

import { css } from '../../lib/style';
import { showToast } from '../../lib/toast';
import type { DonorRow } from '../../lib/apiTypes';

interface DonorSheetProps {
  donor: DonorRow | null;
  distanceKm?: number | null;
  isCalled?: boolean;
  onToggleCalled?: (id: string) => void;
  onClose: () => void;
}

const ELIGIBILITY: Record<string, { lab: string; tag: string }> = {
  ELIGIBLE: { lab: 'Eligible (Can give)', tag: 'ok' },
  COOLDOWN: { lab: 'In Cooldown', tag: 'wt' },
  SCREENING_STALE: { lab: 'Screening Stale', tag: 'wt' },
  REACTIVE: { lab: 'Reactive / Deferred', tag: 'no' },
  NEVER_SCREENED: { lab: 'Not Screened', tag: 'gy' },
  DEFERRED: { lab: 'Deferred', tag: 'no' },
  REMOVED: { lab: 'Removed', tag: 'gy' },
};

function bgTag(g: string) {
  return <span className={`abg${g.includes('−') ? ' r' : ''}`}>{g}</span>;
}

function daysSince(iso: string | null): number | null {
  return iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000) : null;
}

export function DonorSheet({
  donor: d,
  distanceKm,
  isCalled = false,
  onToggleCalled,
  onClose,
}: DonorSheetProps) {
  const isOpen = d !== null;
  const days = d ? daysSince(d.lastDonatedAt) : null;
  const e = d ? ELIGIBILITY[d.eligibility] ?? { lab: d.eligibility, tag: 'gy' } : { lab: '', tag: 'gy' };

  return (
    <>
      <div className={`sheetov${isOpen ? ' on' : ''}`} onClick={onClose} />
      <div className={`sheet${isOpen ? ' open' : ''}`}>
        {d && (
          <>
            <div className="sheet-header">
              <div className="sheet-top-row">
                <span className={`tag ${e.tag}`}>{e.lab}</span>
                <button className="cl" onClick={onClose} aria-label="Close detail panel">✕</button>
              </div>
              <div className="sheet-headline">
                <h2>
                  {bgTag(d.group)} <span style={{ marginLeft: '6px', fontSize: '20px', fontWeight: 800, color: 'var(--ink)' }}>{d.name}</span>
                </h2>
              </div>
              <div className="sheet-meta">
                {d.mrNo ? `MR: ${d.mrNo}` : 'No MR Number'} · {d.town ?? 'Unknown town'}
                {distanceKm !== undefined && distanceKm !== null ? ` · ${Math.round(distanceKm)} km away` : ''}
              </div>
            </div>

            <div style={css('margin:18px 0')}>
              <div className="drow"><span>MR Number</span><b className="mono2">{d.mrNo || 'Unassigned'}</b></div>
              <div className="drow"><span>Town / District</span><b>{d.town || 'Not specified'}</b></div>
              <div className="drow"><span>Phone Number</span><b>{d.phone || 'No phone recorded'}</b></div>
              <div className="drow">
                <span>Last Donated</span>
                <b>{days !== null ? `${days} days ago (${new Date(d.lastDonatedAt!).toLocaleDateString('en-GB')})` : 'Never donated'}</b>
              </div>
              <div className="drow"><span>Total Donations</span><b>{d.timesDonated} {d.timesDonated === 1 ? 'time' : 'times'}</b></div>
              <div className="drow"><span>Consent to Call</span><b>{d.consentToCall ? 'Yes (Consented)' : 'No'}</b></div>
              <div className="drow"><span>Eligibility Status</span><b>{e.lab}</b></div>
            </div>

            <div className="row" style={css('gap:9px;margin-top:20px')}>
              {d.phone ? (
                <a className="btn btn-p" style={css('flex:1')} href={`tel:${d.phone.replace(/ /g, '')}`}>
                  Call {d.name.split(' ')[0]}
                </a>
              ) : (
                <button type="button" className="btn btn-o" style={css('flex:1')} disabled>
                  No Phone Number
                </button>
              )}
              {onToggleCalled && (
                <button
                  type="button"
                  className={`btn ${isCalled ? 'btn-d' : 'btn-o'}`}
                  onClick={() => onToggleCalled(d.id)}
                >
                  {isCalled ? 'Called ✓' : 'Mark Called'}
                </button>
              )}
            </div>

            <div style={{ marginTop: '12px' }}>
              <button
                type="button"
                className="btn btn-o"
                style={{ width: '100%' }}
                onClick={() => {
                  showToast(`Viewing history for ${d.name} (${d.mrNo || 'Donor'})`);
                }}
              >
                View Donation History
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
