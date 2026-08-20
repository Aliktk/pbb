'use client';

import { useState, useEffect } from 'react';
import { css } from '../../lib/style';
import { fetchDonationsByDonor, type DonationRow } from '../../lib/donations';
import type { DonorRow } from '../../lib/apiTypes';

interface DonorSheetProps {
  donor: DonorRow | null;
  distanceKm?: number | null;
  isCalled?: boolean;
  onToggleCalled?: (id: string) => void;
  onEdit?: (donor: DonorRow) => void;
  onDelete?: (id: string) => void;
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
  onEdit,
  onDelete,
  onClose,
}: DonorSheetProps) {
  const isOpen = d !== null;
  const [viewMode, setViewMode] = useState<'details' | 'history'>('details');
  const [historyList, setHistoryList] = useState<DonationRow[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Reset view mode when donor changes or sheet opens
  useEffect(() => {
    setViewMode('details');
    setHistoryList([]);
    setHistoryError(null);
  }, [d?.id]);

  const effectiveLastDonated = d?.lastDonatedAt ?? null;
  const days = effectiveLastDonated ? daysSince(effectiveLastDonated) : null;
  const e = d ? ELIGIBILITY[d.eligibility] ?? { lab: d.eligibility, tag: 'gy' } : { lab: '', tag: 'gy' };

  // Real donation history from Supabase (RLS-scoped). No records means an honest empty state -
  // history is never fabricated from the donor's timesDonated count.
  async function handleFetchHistory() {
    if (!d) return;
    setViewMode('history');
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const records = await fetchDonationsByDonor(d.id);
      setHistoryList(records);
    } catch (err) {
      setHistoryList([]);
      setHistoryError(err instanceof Error ? err.message : 'Could not load donation history.');
    } finally {
      setLoadingHistory(false);
    }
  }

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

            {viewMode === 'details' ? (
              <>
                <div style={css('margin:18px 0')}>
                  <div className="drow"><span>MR Number</span><b className="mono2">{d.mrNo || 'Unassigned'}</b></div>
                  <div className="drow"><span>Town / District</span><b>{d.town || 'Not specified'}</b></div>
                  <div className="drow"><span>Phone Number</span><b>{d.phone || 'No phone recorded'}</b></div>
                  <div className="drow">
                    <span>Last Donated</span>
                    <b>{days !== null && effectiveLastDonated ? `${days} days ago (${new Date(effectiveLastDonated).toLocaleDateString('en-GB')})` : 'Never donated'}</b>
                  </div>
                  <div className="drow"><span>Total Donations</span><b>{d.timesDonated} {d.timesDonated === 1 ? 'time' : 'times'}</b></div>
                  <div className="drow"><span>Consent to Call</span><b>{d.consentToCall ? 'Yes (Consented)' : 'No'}</b></div>
                  <div className="drow"><span>Eligibility Status</span><b>{e.lab}</b></div>
                </div>

                <div
                  style={{
                    marginTop: '20px',
                    display: 'grid',
                    gridTemplateColumns: d.phone ? (onToggleCalled ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)') : 'repeat(3, 1fr)',
                    gap: '6px',
                  }}
                >
                  {d.phone ? (
                    <a
                      className="btn btn-p"
                      title={`Call ${d.name}`}
                      style={{
                        padding: '8px 4px',
                        fontSize: '12px',
                        fontWeight: 700,
                        justifyContent: 'center',
                        borderRadius: '10px',
                        whiteSpace: 'nowrap',
                      }}
                      href={`tel:${d.phone.replace(/ /g, '')}`}
                    >
                      📞 Call
                    </a>
                  ) : null}

                  {onToggleCalled && (
                    <button
                      type="button"
                      className={`btn ${isCalled ? 'btn-d' : 'btn-o'}`}
                      title={isCalled ? 'Marked Called' : 'Mark as Called'}
                      style={{
                        padding: '8px 4px',
                        fontSize: '12px',
                        fontWeight: 700,
                        borderRadius: '10px',
                        whiteSpace: 'nowrap',
                      }}
                      onClick={() => onToggleCalled(d.id)}
                    >
                      {isCalled ? 'Called ✓' : 'Called'}
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-o"
                    title="View Donation History"
                    style={{
                      padding: '8px 4px',
                      fontSize: '12px',
                      fontWeight: 700,
                      borderRadius: '10px',
                      whiteSpace: 'nowrap',
                    }}
                    onClick={handleFetchHistory}
                  >
                    📜 History ({d.timesDonated})
                  </button>

                  {onEdit && (
                    <button
                      type="button"
                      className="btn btn-o"
                      title="Edit Donor Details"
                      style={{
                        padding: '8px 4px',
                        fontSize: '12px',
                        fontWeight: 700,
                        borderRadius: '10px',
                        whiteSpace: 'nowrap',
                      }}
                      onClick={() => onEdit(d)}
                    >
                      ✏️ Edit
                    </button>
                  )}

                  {onDelete && (
                    <button
                      type="button"
                      className="btn btn-d"
                      title="Delete Donor"
                      style={{
                        padding: '8px 4px',
                        fontSize: '12px',
                        fontWeight: 700,
                        borderRadius: '10px',
                        whiteSpace: 'nowrap',
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        color: '#dc2626',
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                      }}
                      onClick={() => onDelete(d.id)}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Donation History Mode */}
                <div style={{ margin: '16px 0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--ink)' }}>
                    Donation History
                  </h3>
                  <button
                    type="button"
                    className="btn btn-o btn-s"
                    onClick={() => setViewMode('details')}
                    style={{ borderRadius: '8px', fontSize: '12.5px', fontWeight: 700 }}
                  >
                    ← Back to Details
                  </button>
                </div>

                {loadingHistory ? (
                  <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--mid)', fontSize: '13.5px' }}>
                    Loading donation history...
                  </div>
                ) : historyError ? (
                  <div
                    style={{
                      padding: '24px 16px',
                      margin: '14px 0 20px',
                      borderRadius: '12px',
                      background: 'var(--bg, #f8fafc)',
                      border: '1px solid var(--line, #e2e8f0)',
                      textAlign: 'center',
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: 'var(--red, #dc2626)' }}>
                      Could not load donation history
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: 'var(--mid)' }}>
                      {historyError}
                    </p>
                  </div>
                ) : historyList.length > 0 ? (
                  <div style={{ margin: '12px 0 20px', maxHeight: '320px', overflowY: 'auto' }}>
                    {historyList.map((item, idx) => {
                      const itemDays = daysSince(item.donatedAt);
                      const formattedDate = new Date(item.donatedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      });
                      return (
                        <div
                          key={item.id || idx}
                          style={{
                            padding: '12px',
                            borderRadius: '12px',
                            background: 'var(--bg, #f8fafc)',
                            border: '1px solid var(--line, #e2e8f0)',
                            marginBottom: '10px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--ink)' }}>
                              📅 {formattedDate}
                            </span>
                            <span className="tag ok" style={{ fontSize: '11px' }}>
                              {item.quantityMl} ml
                            </span>
                          </div>
                          <div style={{ fontSize: '12.5px', color: 'var(--mid)' }}>
                            {itemDays !== null ? `${itemDays} days ago` : 'Date recorded'}
                            {item.town ? ` · ${item.town}` : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '24px 16px',
                      margin: '14px 0 20px',
                      borderRadius: '12px',
                      background: 'var(--bg, #f8fafc)',
                      border: '1px solid var(--line, #e2e8f0)',
                      textAlign: 'center',
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>
                      No history entries recorded yet
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: 'var(--mid)' }}>
                      Donations recorded via &quot;Record a donation&quot; will appear here.
                    </p>
                  </div>
                )}

                <div style={{ marginTop: '16px' }}>
                  <button
                    type="button"
                    className="btn btn-p"
                    style={{ width: '100%' }}
                    onClick={() => setViewMode('details')}
                  >
                    ← Return to Donor Details
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
