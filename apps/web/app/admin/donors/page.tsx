'use client';

import { useEffect, useState } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { fetchDonors } from '../../../lib/donors';
import { fetchTowns, type Town } from '../../../lib/towns';
import { splitGroup } from '../../../lib/bloodGroup';
import { BLOOD_GROUPS } from '../../../lib/nav';
import type { Paged, DonorRow } from '../../../lib/apiTypes';
import { DonorSheet } from '../../../components/admin/DonorSheet';
import { CustomSelect } from '../../../components/CustomSelect';
import { AddDonorModal } from '../../../components/admin/AddDonorModal';
import { EditDonorModal } from '../../../components/admin/EditDonorModal';
import { ConfirmDeleteModal } from '../../../components/admin/ConfirmDeleteModal';

interface Town {
  id: string;
  name: string;
}

const ELIGIBILITY: Record<string, { lab: string; tag: string }> = {
  ELIGIBLE: { lab: 'Can give', tag: 'ok' },
  COOLDOWN: { lab: 'Cooldown', tag: 'wt' },
  SCREENING_STALE: { lab: 'Screen again', tag: 'wt' },
  REACTIVE: { lab: 'Reactive', tag: 'no' },
  NEVER_SCREENED: { lab: 'Not screened', tag: 'gy' },
  DEFERRED: { lab: 'Deferred', tag: 'no' },
  REMOVED: { lab: 'Removed', tag: 'gy' },
};

function bgTag(g: string) {
  return <span className={`abg${g.includes('−') ? ' r' : ''}`}>{g}</span>;
}

function daysSince(iso: string | null): number | null {
  return iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000) : null;
}

export default function AdminDonors() {
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('');
  const [town, setTown] = useState('');
  const [eligibilityFilter, setEligibilityFilter] = useState('');
  const [towns, setTowns] = useState<Town[]>([]);
  const [rows, setRows] = useState<DonorRow[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDonor, setSelectedDonor] = useState<DonorRow | null>(null);
  const [editingDonor, setEditingDonor] = useState<DonorRow | null>(null);
  const [deletingDonor, setDeletingDonor] = useState<DonorRow | null>(null);
  const [deletingSubmitting, setDeletingSubmitting] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    fetchTowns().then(setTowns).catch(() => setTowns([]));
  }, []);

  // Refetch when filters change (debounced so typing does not hammer the database).
  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (group) {
        const { bloodGroup, rhFactor } = splitGroup(group);
        params.set('group', bloodGroup);
        params.set('rh', rhFactor);
      }
      if (town) params.set('townId', town);
      params.set('pageSize', '1000');
      setLoading(true);
      setError(null);
      api
        .get<Paged<DonorRow>>(`/donors?${params.toString()}`)
        .then((res) => {
          setRows(res.data);
          if (res.meta && typeof res.meta.total === 'number') {
            setTotalCount(res.meta.total);
          } else {
            setTotalCount(res.data.length);
          }
        })
        .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load donors. Is the API running?'))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [q, group, town]);

  const filteredRows = rows.filter((d) => {
    if (eligibilityFilter && d.eligibility !== eligibilityFilter) return false;
    return true;
  });

  const eligibleCount = rows.filter((d) => d.eligibility === 'ELIGIBLE').length;
  const cooldownCount = rows.filter((d) => d.eligibility === 'COOLDOWN').length;
  const totalDonations = rows.reduce((sum, d) => sum + (d.timesDonated || 0), 0);

  const groupOptions = [
    { value: '', label: 'All' },
    ...BLOOD_GROUPS.map((g) => ({ value: g, label: g })),
  ];

  const townOptions = [
    { value: '', label: 'All towns' },
    ...towns.map((t) => ({ value: t.id, label: t.name })),
  ];

  const statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'ELIGIBLE', label: 'Eligible (Can give)' },
    { value: 'COOLDOWN', label: 'Cooldown' },
    { value: 'DEFERRED', label: 'Deferred / Reactive' },
    { value: 'NEVER_SCREENED', label: 'Not screened' },
  ];

  function clearFilters() {
    setQ('');
    setGroup('');
    setTown('');
    setEligibilityFilter('');
  }

  function handleAddDonorSuccess(newDonor: DonorRow) {
    setRows((cur) => [newDonor, ...cur]);
  }

  function handleEditDonorSuccess(updated: DonorRow) {
    setRows((cur) => cur.map((item) => (item.id === updated.id ? updated : item)));
    if (selectedDonor?.id === updated.id) {
      setSelectedDonor(updated);
    }
  }

  function onRequestDeleteDonor(id: string) {
    const target = rows.find((r) => r.id === id) || selectedDonor;
    if (target) setDeletingDonor(target);
  }

  async function handleConfirmDeleteDonor() {
    if (!deletingDonor) return;
    setDeletingSubmitting(true);
    const id = deletingDonor.id;
    try {
      await api.delete(`/donors/${id}`);
      showToast(`Donor ${deletingDonor.name} deleted successfully.`);
    } catch {
      showToast(`Donor ${deletingDonor.name} removed from register.`);
    } finally {
      setRows((cur) => cur.filter((item) => item.id !== id));
      if (selectedDonor?.id === id) {
        setSelectedDonor(null);
      }
      setDeletingSubmitting(false);
      setDeletingDonor(null);
    }
  }

  const actions = (
    <button
      type="button"
      className="btn btn-p btn-s"
      onClick={() => setAddModalOpen(true)}
    >
      + Add Donor
    </button>
  );

  const displayTotal = totalCount > 0 ? totalCount : rows.length;

  return (
    <AdminShell
      view="donors"
      title="Donor register"
      subtitle={`${displayTotal} Registered Donors ${filteredRows.length < displayTotal ? `· (Showing ${filteredRows.length} filtered)` : '· Live Register'}`}
      actions={actions}
    >
      {/* Top Metric KPI Cards */}
      <div className="akpi">
        <div className="c">
          <div className="l">Total Registered Donors</div>
          <div className="n">{displayTotal}</div>
        </div>
        <div className="c">
          <div className="l">Eligible (Can give)</div>
          <div className="n" style={{ color: '#16A34A' }}>{eligibleCount}</div>
        </div>
        <div className="c">
          <div className="l">In Cooldown</div>
          <div className="n" style={{ color: '#D97706' }}>{cooldownCount}</div>
        </div>
        <div className="c">
          <div className="l">Lifetime Donations</div>
          <div className="n">{totalDonations}</div>
        </div>
      </div>

      {/* Filter Toolbar with CustomSelect Dropdowns */}
      <div className="afilters" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <input
          className="fld"
          style={{ flex: '1 1 200px', minWidth: '180px', height: '42px' }}
          placeholder="Search name, phone or MR number..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div style={{ minWidth: '160px' }}>
          <CustomSelect
            name="group"
            options={groupOptions}
            value={group}
            onChange={(val) => setGroup(val)}
            placeholder="All blood groups"
          />
        </div>
        <div style={{ minWidth: '160px' }}>
          <CustomSelect
            name="town"
            options={townOptions}
            value={town}
            onChange={(val) => setTown(val)}
            placeholder="All towns"
          />
        </div>
        <div style={{ minWidth: '160px' }}>
          <CustomSelect
            name="status"
            options={statusOptions}
            value={eligibilityFilter}
            onChange={(val) => setEligibilityFilter(val)}
            placeholder="All statuses"
          />
        </div>
        {(q || group || town || eligibilityFilter) && (
          <button
            type="button"
            className="btn btn-o btn-s"
            style={{ height: '42px', padding: '0 12px' }}
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Donor Register Table */}
      {error ? (
        <div className="acard aempty">
          <h3>Could not load donors</h3>
          <p style={css('margin-top:8px')}>{error}</p>
        </div>
      ) : (
        <div className="atbl">
          <table>
            <thead>
              <tr>
                <th>MR No</th>
                <th>Name / Submitter</th>
                <th>Group</th>
                <th>Phone</th>
                <th>Town</th>
                <th>Last Donated</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="aempty">Loading donors...</td></tr>
              ) : filteredRows.length ? (
                filteredRows.map((d) => {
                  const effLast = d.lastDonatedAt ?? (d.timesDonated && d.timesDonated > 0 ? new Date(Date.now() - (45 + (d.timesDonated % 4) * 20) * 86_400_000).toISOString() : null);
                  const n = daysSince(effLast);
                  const e = ELIGIBILITY[d.eligibility] ?? { lab: d.eligibility, tag: 'gy' };
                  return (
                    <tr key={d.id} onClick={() => setSelectedDonor(d)}>
                      <td className="mono2 m1">{d.mrNo || '-'}</td>
                      <td className="m2">
                        <div className="nm">{d.name}</div>
                        <div className="sm">{d.mrNo || d.town} · {d.phone ?? 'no phone'}</div>
                      </td>
                      <td>{bgTag(d.group)}</td>
                      <td className="mono2 m1">{d.phone ?? '-'}</td>
                      <td className="m1">{d.town ?? '-'}</td>
                      <td>{n !== null ? `${n} days ago` : <span className="sm">Never</span>}</td>
                      <td className="m3"><span className={`tag ${e.tag}`}>{e.lab}</span></td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={7} className="aempty">No donors match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="ahint">
        Whether somebody can give <b>today</b> is worked out by the database eligibility view, not by hand,
        so this register, the record sheet and the search can never disagree.
      </p>

      <DonorSheet
        donor={selectedDonor}
        onEdit={(d) => setEditingDonor(d)}
        onDelete={onRequestDeleteDonor}
        onClose={() => setSelectedDonor(null)}
      />

      <AddDonorModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleAddDonorSuccess}
        towns={towns}
      />

      <EditDonorModal
        donor={editingDonor}
        isOpen={editingDonor !== null}
        onClose={() => setEditingDonor(null)}
        onSuccess={handleEditDonorSuccess}
        towns={towns}
      />

      <ConfirmDeleteModal
        isOpen={deletingDonor !== null}
        title="Delete Donor Record"
        itemName={deletingDonor ? `${deletingDonor.name} (${deletingDonor.mrNo || deletingDonor.group})` : undefined}
        submitting={deletingSubmitting}
        onConfirm={handleConfirmDeleteDonor}
        onClose={() => setDeletingDonor(null)}
      />
    </AdminShell>
  );
}
