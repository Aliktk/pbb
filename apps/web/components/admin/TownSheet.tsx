'use client';

import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { TownNetworkItem } from '../../lib/towns';
import type { DonorRow, AdminRequestRow } from '../../lib/apiTypes';

interface TownSheetProps {
  town: TownNetworkItem | null;
  onEdit?: (town: TownNetworkItem) => void;
  onDelete?: (town: TownNetworkItem) => void;
  onClose: () => void;
}

export function TownSheet({ town: t, onEdit, onDelete, onClose }: TownSheetProps) {
  const isOpen = t !== null;
  const [activeTab, setActiveTab] = useState<'overview' | 'donors' | 'requests'>('overview');
  const [townDonors, setTownDonors] = useState<DonorRow[]>([]);
  const [townRequests, setTownRequests] = useState<AdminRequestRow[]>([]);
  const [loadingDonors, setLoadingDonors] = useState<boolean>(false);
  const [loadingRequests, setLoadingRequests] = useState<boolean>(false);

  useEffect(() => {
    setActiveTab('overview');
    setTownDonors([]);
    setTownRequests([]);
  }, [t?.id]);

  useEffect(() => {
    if (!t || !isOpen) return;

    if (activeTab === 'donors') {
      setLoadingDonors(true);
      api
        .get<{ data: DonorRow[] }>(`/donors?townId=${t.id}&pageSize=50`)
        .then((res) => setTownDonors(res.data || []))
        .catch(() => setTownDonors([]))
        .finally(() => setLoadingDonors(false));
    } else if (activeTab === 'requests') {
      setLoadingRequests(true);
      api
        .get<{ data: AdminRequestRow[] }>(`/requests?townId=${t.id}&pageSize=50`)
        .then((res) => setTownRequests(res.data || []))
        .catch(() => setTownRequests([]))
        .finally(() => setLoadingRequests(false));
    }
  }, [activeTab, t, isOpen]);

  if (!isOpen || !t) return null;

  const isBranch = t.standing.includes('Branch') || t.standing.includes('Head office') || t.isOffice;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={onClose}
      />

      <aside
        className="adrawer open"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '500px',
          maxWidth: '92vw',
          background: 'var(--bg1, #ffffff)',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.18)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--bdr1, #e2e8f0)',
            background: 'linear-gradient(180deg, rgba(224,43,32,0.03) 0%, rgba(255,255,255,0) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--txt1)' }}>{t.name}</h2>
                <span
                  className="tag"
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: t.standing === 'Head office' ? 'rgba(217,35,35,0.15)' : isBranch ? 'rgba(34,197,94,0.12)' : 'rgba(148,163,184,0.12)',
                    color: t.standing === 'Head office' ? 'var(--p)' : isBranch ? '#22C55E' : '#64748B',
                  }}
                >
                  {t.standing}
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--txt3)' }}>
                📍 {t.officeAddress || (isBranch ? 'Branch Office Desk' : 'Regional Outreach Dispatch')}
              </p>
            </div>

            <button
              type="button"
              className="x"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '22px',
                cursor: 'pointer',
                color: 'var(--txt3)',
                padding: '4px',
              }}
            >
              ✕
            </button>
          </div>

          {/* Sleek Action Buttons Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginTop: '12px',
            }}
          >
            {onEdit && (
              <button
                type="button"
                className="btn btn-o btn-s"
                onClick={() => onEdit(t)}
                style={{
                  padding: '8px 4px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                }}
              >
                ✏️ Edit Details
              </button>
            )}

            {onDelete && t.name.toLowerCase() !== 'quetta' && (
              <button
                type="button"
                className="btn btn-o btn-s"
                onClick={() => onDelete(t)}
                style={{
                  padding: '8px 4px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#EF4444',
                  borderColor: 'rgba(239,68,68,0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                }}
              >
                🗑️ Delete Town
              </button>
            )}
          </div>
        </div>

        {/* Real Data KPI Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            padding: '16px 24px',
            background: 'var(--bg2, #f8fafc)',
            borderBottom: '1px solid var(--bdr1, #e2e8f0)',
          }}
        >
          <div style={{ background: '#fff', padding: '10px 8px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Donors</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#3b82f6', marginTop: '2px' }}>{t.donorsCount ?? 0}</div>
          </div>
          <div style={{ background: '#fff', padding: '10px 8px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Volunteers</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#22c55e', marginTop: '2px' }}>{t.volunteersCount ?? 0}</div>
          </div>
          <div style={{ background: '#fff', padding: '10px 8px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Children</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#a855f7', marginTop: '2px' }}>{t.childrenCount ?? 0}</div>
          </div>
          <div style={{ background: '#fff', padding: '10px 8px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Requests</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: t.openRequests > 0 ? '#ef4444' : '#64748b', marginTop: '2px' }}>{t.openRequests}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--bdr1, #e2e8f0)', padding: '0 24px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              color: activeTab === 'overview' ? 'var(--p, #e02b20)' : 'var(--txt3, #64748b)',
              borderBottom: activeTab === 'overview' ? '2px solid var(--p, #e02b20)' : '2px solid transparent',
            }}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('donors')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              color: activeTab === 'donors' ? 'var(--p, #e02b20)' : 'var(--txt3, #64748b)',
              borderBottom: activeTab === 'donors' ? '2px solid var(--p, #e02b20)' : '2px solid transparent',
            }}
          >
            Donors List
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              color: activeTab === 'requests' ? 'var(--p, #e02b20)' : 'var(--txt3, #64748b)',
              borderBottom: activeTab === 'requests' ? '2px solid var(--p, #e02b20)' : '2px solid transparent',
            }}
          >
            Blood Requests ({t.openRequests})
          </button>
        </div>

        {/* Tab Body Contents */}
        <div style={{ padding: '20px 24px', flex: 1, overflowY: 'auto' }}>
          {activeTab === 'overview' && (
            <div className="dtbl">
              <div className="drow"><span>Town Name</span><b>{t.name}</b></div>
              <div className="drow"><span>Network Standing</span><b>{t.standing}</b></div>
              <div className="drow"><span>Office Address</span><b>{t.officeAddress || (isBranch ? 'Permanent Branch Office' : 'Served Location')}</b></div>
              <div className="drow"><span>Area Manager / Desk</span><b>{t.managerName || 'Regional Staff Officer'}</b></div>
              <div className="drow"><span>Stock Audit Update</span><b>{t.lastStockUpdate || 'today'}</b></div>
              <div className="drow"><span>Active Registered Donors</span><b>{t.donorsCount ?? 0} donors</b></div>
              <div className="drow"><span>Volunteers Team</span><b>{t.volunteersCount ?? 0} active</b></div>
              <div className="drow"><span>Thalassemia Patients</span><b>{t.childrenCount ?? 0} registered children</b></div>
              <div className="drow"><span>Current Urgent Requests</span><b>{t.openRequests} open requests</b></div>
            </div>
          )}

          {activeTab === 'donors' && (
            <div>
              {loadingDonors ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Loading donors in {t.name}...</div>
              ) : townDonors.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {townDonors.map((d) => (
                    <div
                      key={d.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--txt1)' }}>{d.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          {d.phone || 'No phone'} · {d.mrNo || d.town}
                        </div>
                      </div>
                      <span className={`abg${d.group.includes('−') ? ' r' : ''}`}>{d.group}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 16px', color: '#64748b', fontSize: '13.5px' }}>
                  No registered donors currently logged for <b>{t.name}</b>.
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              {loadingRequests ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Loading blood requests in {t.name}...</div>
              ) : townRequests.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {townRequests.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        background: '#fff',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--p)' }}>{r.reference}</span>
                        <span className="tag r" style={{ fontSize: '11px', fontWeight: 700 }}>{r.urgency}</span>
                      </div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--txt1)', marginTop: '4px' }}>
                        {r.hospital}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        {r.unitsNeeded} units {r.group} · {r.patientName ? `Patient: ${r.patientName}` : 'Public Request'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 16px', color: '#64748b', fontSize: '13.5px' }}>
                  No active open blood requests currently logged for <b>{t.name}</b>.
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
