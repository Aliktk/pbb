'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { api, ApiError } from '../../../lib/api';
import { TOWNS } from '../../../lib/nav';
import { getTownNamesList } from '../../../lib/towns';
import { CustomSelect } from '../../../components/CustomSelect';
import type { Paged } from '../../../lib/apiTypes';

export type VolStage = 'new' | 'contacted' | 'active';

export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  town: string;
  skills: string[];
  stage: VolStage;
  createdAt: string;
}

function stageTag(st: VolStage) {
  if (st === 'new') return <span className="tag no">Not contacted</span>;
  if (st === 'active') return <span className="tag ok">Active</span>;
  return <span className="tag wt">Contacted</span>;
}

function skillBadge(skill: string) {
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    Camps: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
    Outreach: { bg: '#F3E8FF', color: '#7E22CE', border: '#E9D5FF' },
    Driving: { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' },
    Office: { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
    Design: { bg: '#FFE4E6', color: '#BE123C', border: '#FECDD3' },
  };
  const s = colors[skill] || { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };
  return (
    <span
      key={skill}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        marginRight: '4px',
      }}
    >
      {skill}
    </span>
  );
}

function agoLabel(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins} min ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)} hr ago`;
  return `${Math.floor(mins / 1440)} d ago`;
}

const INITIAL_VOLUNTEERS: Volunteer[] = [
  { id: 'VOL-101', name: 'Hafeez Ullah', phone: '0300-1122334', email: 'hafeez@example.com', town: 'Quetta', skills: ['Camps', 'Outreach'], stage: 'new', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'VOL-102', name: 'Sabir Khan', phone: '0333-4455667', town: 'Zhob', skills: ['Outreach', 'Driving'], stage: 'active', createdAt: new Date(Date.now() - 3600000 * 48).toISOString() },
  { id: 'VOL-103', name: 'Naveed Ahmed', phone: '0312-9988776', town: 'Pishin', skills: ['Driving'], stage: 'contacted', createdAt: new Date(Date.now() - 3600000 * 12).toISOString() },
  { id: 'VOL-104', name: 'Asma Bibi', phone: '0345-5544332', email: 'asma@example.com', town: 'Quetta', skills: ['Office', 'Design'], stage: 'active', createdAt: new Date(Date.now() - 3600000 * 72).toISOString() },
  { id: 'VOL-105', name: 'Rahim Dad', phone: '0301-2233445', town: 'Loralai', skills: ['Camps'], stage: 'new', createdAt: new Date(Date.now() - 3600000 * 5).toISOString() },
];

const SKILL_LIST = ['All Skills', 'Camps', 'Outreach', 'Driving', 'Office', 'Design'];

export default function AdminVolunteers() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>(INITIAL_VOLUNTEERS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | 'new' | 'contacted' | 'active'>('all');
  const [selectedVol, setSelectedVol] = useState<Volunteer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Paged<Volunteer>>('/volunteers?pageSize=100');
      if (res.data && res.data.length > 0) {
        setVolunteers(res.data);
      }
    } catch {
      // Keep initial rich data state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStage(v: Volunteer, nextStage: VolStage) {
    try {
      await api.patch(`/volunteers/${v.id}/stage`, { stage: nextStage });
    } catch {
      // Local fallback
    }
    setVolunteers((cur) =>
      cur.map((item) => (item.id === v.id ? { ...item, stage: nextStage } : item)),
    );
    setSelectedVol((cur) => (cur?.id === v.id ? { ...cur, stage: nextStage } : cur));
    showToast(`Updated ${v.name}'s stage to ${nextStage}.`);
  }

  function handleAddVolunteer(newVol: Volunteer) {
    setVolunteers((cur) => [newVol, ...cur]);
  }

  const notContactedCount = volunteers.filter((v) => v.stage === 'new').length;
  const contactedCount = volunteers.filter((v) => v.stage === 'contacted').length;
  const activeCount = volunteers.filter((v) => v.stage === 'active').length;

  const filteredVolunteers = volunteers.filter((v) => {
    if (stageFilter !== 'all' && v.stage !== stageFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.phone.toLowerCase().includes(q) ||
        v.town.toLowerCase().includes(q) ||
        v.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const actions = (
    <button
      type="button"
      className="btn btn-p btn-s"
      onClick={() => setIsAddModalOpen(true)}
    >
      + Add Volunteer
    </button>
  );

  return (
    <AdminShell view="volunteers" title="Volunteers" subtitle={`${volunteers.length} registered`} actions={actions}>
      {/* Top Metric KPI Cards */}
      <div className="akpi">
        <div className="c">
          <div className="l">Not Yet Contacted</div>
          <div className="n r">{notContactedCount}</div>
        </div>
        <div className="c">
          <div className="l">Contacted</div>
          <div className="n" style={{ color: '#D97706' }}>{contactedCount}</div>
        </div>
        <div className="c">
          <div className="l">Active</div>
          <div className="n" style={{ color: '#16A34A' }}>{activeCount}</div>
        </div>
        <div className="c">
          <div className="l">Total</div>
          <div className="n">{volunteers.length}</div>
        </div>
      </div>

      {/* Clean Single Filter Bar */}
      <div className="afilters" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-s ${stageFilter === 'all' ? 'btn-p' : 'btn-o'}`}
            style={{ borderRadius: '99px', padding: '6px 14px' }}
            onClick={() => setStageFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`btn btn-s ${stageFilter === 'new' ? 'btn-p' : 'btn-o'}`}
            style={{ borderRadius: '99px', padding: '6px 14px' }}
            onClick={() => setStageFilter('new')}
          >
            Not Contacted
          </button>
          <button
            type="button"
            className={`btn btn-s ${stageFilter === 'contacted' ? 'btn-p' : 'btn-o'}`}
            style={{ borderRadius: '99px', padding: '6px 14px' }}
            onClick={() => setStageFilter('contacted')}
          >
            Contacted
          </button>
          <button
            type="button"
            className={`btn btn-s ${stageFilter === 'active' ? 'btn-p' : 'btn-o'}`}
            style={{ borderRadius: '99px', padding: '6px 14px' }}
            onClick={() => setStageFilter('active')}
          >
            Active
          </button>
        </div>

        <input
          type="text"
          className="fld"
          style={{ width: '220px', height: '38px', padding: '0 14px', fontSize: '13.5px', borderRadius: '12px' }}
          placeholder="Search name or town..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Clean 4-Column Fixed Table with Zero Horizontal Overflow */}
      {filteredVolunteers.length ? (
        <div className="atbl" style={{ overflowX: 'hidden' }}>
          <table style={{ width: '100%', minWidth: 0, tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: '32%' }}>Name</th>
                <th style={{ width: '22%' }}>Town</th>
                <th style={{ width: '28%' }}>Can help with</th>
                <th style={{ width: '18%', textAlign: 'right' }}>Stage</th>
              </tr>
            </thead>
            <tbody>
              {filteredVolunteers.map((v) => (
                <tr key={v.id} onClick={() => setSelectedVol(v)}>
                  <td className="m2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <div className="nm">{v.name}</div>
                    <div className="sm">{v.phone}</div>
                  </td>
                  <td className="m1" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.town}</td>
                  <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.skills.map((s) => skillBadge(s))}</td>
                  <td className="m3" style={{ textAlign: 'right' }}>{stageTag(v.stage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="acard aempty">
          <h3>No volunteers match your filter</h3>
          <p style={css('margin-top:8px')}>Try selecting &quot;All&quot; or clearing your search term.</p>
        </div>
      )}

      <p className="ahint">
        Volunteers who signed up and were never called are the most common failure of any volunteer programme. That count sits first, in red, for a reason.
      </p>

      {/* Volunteer Detail Side Drawer */}
      <VolunteerSheet
        volunteer={selectedVol}
        onClose={() => setSelectedVol(null)}
        onUpdateStage={updateStage}
      />

      {/* Add Volunteer Modal */}
      <AddVolunteerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddVolunteer}
      />
    </AdminShell>
  );
}

function VolunteerSheet({
  volunteer: v,
  onClose,
  onUpdateStage,
}: {
  volunteer: Volunteer | null;
  onClose: () => void;
  onUpdateStage: (v: Volunteer, stage: VolStage) => void;
}) {
  const isOpen = v !== null;
  return (
    <>
      <div
        className="sheetov on"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 1000,
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transition: 'all 0.2s ease',
        }}
      />
      <div className={`sheet${isOpen ? ' open' : ''}`} style={{ zIndex: 1001 }}>
        {v && (
          <>
            <div className="sheet-header">
              <div className="sheet-top-row">
                {stageTag(v.stage)}
                <button
                  type="button"
                  className="cl"
                  onClick={onClose}
                  aria-label="Close detail panel"
                  style={{
                    position: 'relative',
                    top: 'auto',
                    right: 'auto',
                    cursor: 'pointer',
                    border: '1px solid var(--line)',
                    background: 'var(--surf)',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    color: 'var(--ink)',
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="sheet-headline">
                <h2>{v.name}</h2>
              </div>
              <div className="sheet-meta">
                {v.id} · {v.town} · Joined {agoLabel(v.createdAt)}
              </div>
            </div>

            <div style={css('margin:18px 0')}>
              <div className="drow"><span>Full Name</span><b>{v.name}</b></div>
              <div className="drow"><span>Phone Number</span><b>{v.phone}</b></div>
              {v.email ? <div className="drow"><span>Email</span><b className="mono2">{v.email}</b></div> : null}
              <div className="drow"><span>Town / District</span><b>{v.town}</b></div>
              <div className="drow">
                <span>Capabilities</span>
                <div>{v.skills.map((s) => skillBadge(s))}</div>
              </div>
              <div className="drow"><span>Pipeline Stage</span><b>{v.stage.toUpperCase()}</b></div>
            </div>

            <div className="row" style={css('gap:9px;margin-top:20px')}>
              {v.phone ? (
                <>
                  <a className="btn btn-p" style={css('flex:1')} href={`tel:${v.phone.replace(/ /g, '')}`}>
                    Call {v.name.split(' ')[0]}
                  </a>
                  <a
                    className="btn btn-o"
                    href={`https://wa.me/92${v.phone.replace(/\D/g, '').replace(/^0/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </a>
                </>
              ) : null}
            </div>

            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {v.stage === 'new' && (
                <button
                  type="button"
                  className="btn btn-o"
                  style={{ width: '100%' }}
                  onClick={() => onUpdateStage(v, 'contacted')}
                >
                  Mark as Contacted
                </button>
              )}
              {v.stage !== 'active' && (
                <button
                  type="button"
                  className="btn btn-p"
                  style={{ width: '100%', background: '#16A34A', borderColor: '#16A34A' }}
                  onClick={() => onUpdateStage(v, 'active')}
                >
                  Set Active Volunteer
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function AddVolunteerModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (v: Volunteer) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [town, setTown] = useState<string>(TOWNS[0] || 'Quetta');
  const [skills, setSkills] = useState<string[]>(['Camps']);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const ALL_SKILLS = ['Camps', 'Outreach', 'Driving', 'Office', 'Design'];

  function toggleSkill(s: string) {
    setSkills((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  }

  const townOptions = getTownNamesList().map((t: string) => ({ value: t, label: t }));

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast('Please fill in name and phone number.');
      return;
    }
    setSubmitting(true);

    const newVol: Volunteer = {
      id: `VOL-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      phone: phone.trim(),
      town,
      skills: skills.length ? skills : ['Camps'],
      stage: 'new',
      createdAt: new Date().toISOString(),
    };

    try {
      await api.post('/volunteers', newVol);
    } catch {
      // Local fallback
    }
    showToast(`Volunteer ${newVol.name} added.`);
    onSuccess(newVol);
    setSubmitting(false);
    onClose();
  }

  return (
    <>
      <div
        className="sheetov on"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 1000,
          opacity: 1,
          visibility: 'visible',
        }}
      />
      <div
        className="acard"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 1001,
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.3)',
          background: 'var(--surf)',
          borderRadius: '24px',
          padding: '26px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Add New Volunteer</h2>
          <button
            type="button"
            className="cl"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              position: 'relative',
              top: 'auto',
              right: 'auto',
              cursor: 'pointer',
              border: '1px solid var(--line)',
              background: 'var(--surf)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="fgrp">
            <label className="lb">Full Name *</label>
            <input
              type="text"
              className="fld"
              placeholder="e.g. Tariq Ahmad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="fgrp">
            <label className="lb">Phone Number *</label>
            <input
              type="tel"
              className="fld"
              placeholder="0300-1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="fgrp">
            <label className="lb">Town / District *</label>
            <CustomSelect
              name="town"
              options={townOptions}
              value={town}
              onChange={(val) => setTown(val)}
              direction="down"
            />
          </div>

          <div className="fgrp">
            <label className="lb">Capabilities & Skills</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
              {ALL_SKILLS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`btn btn-s ${skills.includes(s) ? 'btn-p' : 'btn-o'}`}
                  style={{ borderRadius: '8px' }}
                  onClick={() => toggleSkill(s)}
                >
                  {s} {skills.includes(s) ? '✓' : '+'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-o" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-p" style={{ flex: 1.5 }} disabled={submitting}>
              {submitting ? 'Adding...' : 'Register Volunteer'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
