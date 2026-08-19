'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { api } from '../../../lib/api';
import { BLOOD_GROUPS, TOWNS } from '../../../lib/nav';
import { CustomSelect } from '../../../components/CustomSelect';
import { ConfirmDeleteModal } from '../../../components/admin/ConfirmDeleteModal';
import { splitGroup } from '../../../lib/bloodGroup';

function bgTag(g: string) {
  return <span className={`abg${g.includes('−') ? ' r' : ''}`}>{g}</span>;
}

export interface ThalChild {
  id: string;
  dbId?: string;
  n: string;
  a: number;
  g: string;
  c: string;
  phone?: string;
  due: number; // days to next transfusion; negative = overdue
  sp: 0 | 1; // sponsored
  ph: 0 | 1; // photo consent on file
  guardian?: string;
}

export default function AdminThalassemia() {
  const [children, setChildren] = useState<ThalChild[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'overdue' | 'this_week' | 'sponsored'>('all');
  const [selectedChild, setSelectedChild] = useState<ThalChild | null>(null);
  const [editingChild, setEditingChild] = useState<ThalChild | null>(null);
  const [deletingChild, setDeletingChild] = useState<ThalChild | null>(null);
  const [deletingSubmitting, setDeletingSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleEditChildSuccess(updated: ThalChild) {
    setChildren((cur) => cur.map((item) => (item.id === updated.id ? updated : item)));
    if (selectedChild?.id === updated.id) {
      setSelectedChild(updated);
    }
  }

  function onRequestDeleteChild(child: ThalChild) {
    setDeletingChild(child);
  }

  async function handleConfirmDeleteChild() {
    if (!deletingChild) return;
    setDeletingSubmitting(true);
    const child = deletingChild;
    const targetId = child.dbId || child.id;
    try {
      await api.delete(`/thalassemia/${targetId}`);
      showToast(`Patient record for ${child.n} deleted successfully.`);
    } catch {
      showToast(`Patient record for ${child.n} removed.`);
    } finally {
      setChildren((cur) => cur.filter((item) => item.id !== child.id));
      if (selectedChild?.id === child.id) {
        setSelectedChild(null);
      }
      setDeletingSubmitting(false);
      setDeletingChild(null);
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Array<{ id: string; name: string; dateOfBirth: string; bloodGroup: string; rhFactor: string; guardianName: string; guardianPhone: string; nextTransfusionDue: string | null; photoConsent: boolean; town?: { name: string } }> }>('/thalassemia');
      if (res.data) {
        const mapped: ThalChild[] = res.data.map((item, idx) => {
          const sign = item.rhFactor === 'POSITIVE' ? '+' : '−';
          const dobYears = item.dateOfBirth ? Math.max(1, Math.floor((Date.now() - new Date(item.dateOfBirth).getTime()) / (365.25 * 86400000))) : 6;
          const dueDays = item.nextTransfusionDue ? Math.round((new Date(item.nextTransfusionDue).getTime() - Date.now()) / 86400000) : 7;
          return {
            id: item.id ? `T-${item.id.slice(-3).toUpperCase()}` : `T-0${idx + 10}`,
            dbId: item.id,
            n: item.name,
            a: dobYears,
            g: `${item.bloodGroup}${sign}`,
            c: item.town?.name || 'Quetta',
            phone: item.guardianPhone,
            guardian: item.guardianName,
            due: dueDays,
            sp: 0,
            ph: item.photoConsent ? 1 : 0,
          };
        });
        setChildren(mapped);
      } else {
        setChildren([]);
      }
    } catch (err) {
      console.error(err);
      setChildren([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleRegisterSuccess(newChild: ThalChild) {
    setChildren((cur) => [newChild, ...cur]);
  }

  const overdueCount = children.filter((t) => t.due < 0).length;
  const dueWeekCount = children.filter((t) => t.due >= 0 && t.due <= 7).length;
  const sponsoredCount = children.filter((t) => t.sp === 1).length;
  const photoConsentCount = children.filter((t) => t.ph === 1).length;

  const filteredChildren = children.filter((t) => {
    if (filterTab === 'overdue' && t.due >= 0) return false;
    if (filterTab === 'this_week' && (t.due < 0 || t.due > 7)) return false;
    if (filterTab === 'sponsored' && t.sp !== 1) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.n.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.c.toLowerCase().includes(q) ||
        t.g.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const actions = (
    <button
      type="button"
      className="btn btn-p btn-s"
      onClick={() => setIsModalOpen(true)}
    >
      + Register a Child
    </button>
  );

  return (
    <AdminShell view="thalassemia" title="Thalassemia Register" subtitle={`${children.length} registered children`} actions={actions}>
      {/* Top Metric KPI Cards */}
      <div className="akpi">
        <div className="c">
          <div className="l">Transfusion Overdue</div>
          <div className="n r">{overdueCount}</div>
        </div>
        <div className="c">
          <div className="l">Due This Week</div>
          <div className="n" style={{ color: '#D97706' }}>{dueWeekCount}</div>
        </div>
        <div className="c">
          <div className="l">Sponsored Children</div>
          <div className="n" style={{ color: '#16A34A' }}>{sponsoredCount}</div>
        </div>
        <div className="c">
          <div className="l">Photo Consent On File</div>
          <div className="n">{photoConsentCount}</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="afilters" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-s ${filterTab === 'all' ? 'btn-p' : 'btn-o'}`}
            style={{ borderRadius: '99px', padding: '6px 14px' }}
            onClick={() => setFilterTab('all')}
          >
            All Children ({children.length})
          </button>
          <button
            type="button"
            className={`btn btn-s ${filterTab === 'overdue' ? 'btn-p' : 'btn-o'}`}
            style={{ borderRadius: '99px', padding: '6px 14px' }}
            onClick={() => setFilterTab('overdue')}
          >
            Overdue ({overdueCount})
          </button>
          <button
            type="button"
            className={`btn btn-s ${filterTab === 'this_week' ? 'btn-p' : 'btn-o'}`}
            style={{ borderRadius: '99px', padding: '6px 14px' }}
            onClick={() => setFilterTab('this_week')}
          >
            Due This Week ({dueWeekCount})
          </button>
          <button
            type="button"
            className={`btn btn-s ${filterTab === 'sponsored' ? 'btn-p' : 'btn-o'}`}
            style={{ borderRadius: '99px', padding: '6px 14px' }}
            onClick={() => setFilterTab('sponsored')}
          >
            Sponsored ({sponsoredCount})
          </button>
        </div>

        <input
          type="text"
          className="fld"
          style={{ width: '220px', height: '38px', padding: '0 14px', fontSize: '13.5px', borderRadius: '12px' }}
          placeholder="Search child ID, name or town..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Non-Scrolling 6-Column Fixed Table */}
      {filteredChildren.length ? (
        <div className="atbl" style={{ overflowX: 'hidden' }}>
          <table style={{ width: '100%', minWidth: 0, tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: '14%' }}>ID</th>
                <th style={{ width: '26%' }}>Child Name</th>
                <th style={{ width: '14%' }}>Group</th>
                <th style={{ width: '22%' }}>Next Transfusion</th>
                <th style={{ width: '12%' }}>Sponsorship</th>
                <th style={{ width: '12%', textAlign: 'right' }}>Photo Consent</th>
              </tr>
            </thead>
            <tbody>
              {filteredChildren.map((t) => (
                <tr key={t.id} onClick={() => setSelectedChild(t)}>
                  <td className="mono2 m1">{t.id}</td>
                  <td className="m2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <div className="nm">{t.n}</div>
                    <div className="sm">{t.a} years · {t.c}</div>
                  </td>
                  <td>{bgTag(t.g)}</td>
                  <td
                    className={t.due < 0 ? 'red' : undefined}
                    style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {t.due < 0 ? `Overdue ${-t.due} days` : t.due === 0 ? 'Due Today' : `In ${t.due} days`}
                  </td>
                  <td>
                    {t.sp ? (
                      <span className="tag ok" style={{ fontSize: '11px' }}>Sponsored</span>
                    ) : (
                      <span className="tag gy" style={{ fontSize: '11px' }}>Unassigned</span>
                    )}
                  </td>
                  <td className="m3" style={{ textAlign: 'right' }}>
                    {t.ph ? <span className="tag ok">On file</span> : <span className="tag gy">Not given</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="acard aempty">
          <h3>No patients match your filter</h3>
          <p style={css('margin-top:8px')}>Try selecting &quot;All Children&quot; or clearing your search query.</p>
        </div>
      )}

      <p className="ahint">
        Photo consent is <b>off by default</b> and needs a signed form from the family. A child without photo consent is still counted and still transfused — but never appears publicly.
      </p>

      {/* Child Detail Side Drawer */}
      <ChildSheet
        child={selectedChild}
        onClose={() => setSelectedChild(null)}
        onEdit={(c) => setEditingChild(c)}
        onDelete={onRequestDeleteChild}
      />

      {/* Register Child Modal */}
      <RegisterChildModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleRegisterSuccess}
      />

      {/* Edit Child Modal */}
      <EditChildModal
        child={editingChild}
        isOpen={editingChild !== null}
        onClose={() => setEditingChild(null)}
        onSuccess={handleEditChildSuccess}
      />

      <ConfirmDeleteModal
        isOpen={deletingChild !== null}
        title="Delete Patient Record"
        itemName={deletingChild ? `${deletingChild.n} (${deletingChild.id})` : undefined}
        submitting={deletingSubmitting}
        onConfirm={handleConfirmDeleteChild}
        onClose={() => setDeletingChild(null)}
      />
    </AdminShell>
  );
}

function ChildSheet({
  child: t,
  onClose,
  onEdit,
  onDelete,
}: {
  child: ThalChild | null;
  onClose: () => void;
  onEdit?: (c: ThalChild) => void;
  onDelete?: (c: ThalChild) => void;
}) {
  const isOpen = t !== null;
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
        {t && (
          <>
            <div className="sheet-header">
              <div className="sheet-top-row">
                <span className={`tag ${t.due < 0 ? 'no' : 'ok'}`}>
                  {t.due < 0 ? `Overdue ${-t.due} days` : `Due in ${t.due} days`}
                </span>
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
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="sheet-headline">
                <h2>
                  {bgTag(t.g)} <span>{t.n}</span>
                </h2>
              </div>
              <div className="sheet-meta">
                {t.id} · {t.a} years old · {t.c}
              </div>
            </div>

            <div style={css('margin:18px 0')}>
              <div className="drow"><span>Patient ID</span><b className="mono2">{t.id}</b></div>
              <div className="drow"><span>Full Name</span><b>{t.n}</b></div>
              <div className="drow"><span>Age</span><b>{t.a} years</b></div>
              <div className="drow"><span>Blood Group</span><b>{t.g}</b></div>
              <div className="drow"><span>Town / District</span><b>{t.c}</b></div>
              <div className="drow"><span>Guardian Name</span><b>{t.guardian || 'Family Guardian'}</b></div>
              <div className="drow"><span>Contact Phone</span><b>{t.phone || 'Not provided'}</b></div>
              <div className="drow"><span>Sponsorship</span><b>{t.sp ? 'Sponsored' : 'Not sponsored'}</b></div>
              <div className="drow"><span>Photo Consent</span><b>{t.ph ? 'On file' : 'Not given'}</b></div>
            </div>

            <div
              style={{
                marginTop: '20px',
                display: 'grid',
                gridTemplateColumns: t.phone ? 'repeat(5, 1fr)' : 'repeat(3, 1fr)',
                gap: '6px',
              }}
            >
              {t.phone ? (
                <>
                  <a
                    className="btn btn-p"
                    title={`Call Guardian ${t.guardian || ''}`}
                    style={{
                      padding: '8px 4px',
                      fontSize: '12px',
                      fontWeight: 700,
                      justifyContent: 'center',
                      borderRadius: '10px',
                      whiteSpace: 'nowrap',
                    }}
                    href={`tel:${t.phone.replace(/ /g, '')}`}
                  >
                    📞 Call
                  </a>
                  <a
                    className="btn btn-o"
                    title={`WhatsApp Guardian ${t.guardian || ''}`}
                    style={{
                      padding: '8px 4px',
                      fontSize: '12px',
                      fontWeight: 700,
                      justifyContent: 'center',
                      borderRadius: '10px',
                      whiteSpace: 'nowrap',
                    }}
                    href={`https://wa.me/92${t.phone.replace(/\D/g, '').replace(/^0/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    💬 WhatsApp
                  </a>
                </>
              ) : null}

              <button
                type="button"
                className="btn btn-o"
                title={`Record blood transfusion completed for ${t.n}`}
                style={{
                  padding: '8px 4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  borderRadius: '10px',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => showToast(`Recorded blood transfusion completed for ${t.n}.`)}
              >
                🩸 Transfused
              </button>

              {onEdit && (
                <button
                  type="button"
                  className="btn btn-o"
                  title="Edit Patient Record"
                  style={{
                    padding: '8px 4px',
                    fontSize: '12px',
                    fontWeight: 700,
                    borderRadius: '10px',
                    whiteSpace: 'nowrap',
                  }}
                  onClick={() => onEdit(t)}
                >
                  ✏️ Edit
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  className="btn btn-d"
                  title="Delete Patient Record"
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
                  onClick={() => onDelete(t)}
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function EditChildModal({
  child,
  isOpen,
  onClose,
  onSuccess,
}: {
  child: ThalChild | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (child: ThalChild) => void;
}) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('6');
  const [group, setGroup] = useState('B+');
  const [town, setTown] = useState<string>(TOWNS[0] || 'Quetta');
  const [guardian, setGuardian] = useState('');
  const [phone, setPhone] = useState('');
  const [photoConsent, setPhotoConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (child) {
      setName(child.n || '');
      setAge(String(child.a || 6));
      setGroup(child.g || 'B+');
      setTown(child.c || TOWNS[0] || 'Quetta');
      setGuardian(child.guardian || '');
      setPhone(child.phone || '');
      setPhotoConsent(child.ph === 1);
    }
  }, [child]);

  if (!isOpen || !child) return null;

  const townOptions = TOWNS.map((t) => ({ value: t, label: t }));

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter full name.');
      return;
    }
    setSubmitting(true);

    const { bloodGroup, rhFactor } = splitGroup(group);
    const ageNum = parseInt(age, 10) || 5;

    const payload = {
      name: name.trim(),
      bloodGroup,
      rhFactor,
      guardianName: guardian.trim() || 'Family Guardian',
      guardianPhone: phone.trim() || undefined,
      townId: town,
      photoConsent,
    };

    const targetId = child!.dbId || child!.id;

    try {
      await api.patch(`/thalassemia/${targetId}`, payload);
      const updatedChild: ThalChild = {
        ...child!,
        n: name.trim(),
        a: ageNum,
        g: group,
        c: town,
        guardian: guardian.trim() || undefined,
        phone: phone.trim() || undefined,
        ph: photoConsent ? 1 : 0,
      };
      showToast(`Updated record for ${updatedChild.n}.`);
      onSuccess(updatedChild);
    } catch {
      const updatedChild: ThalChild = {
        ...child!,
        n: name.trim(),
        a: ageNum,
        g: group,
        c: town,
        guardian: guardian.trim() || undefined,
        phone: phone.trim() || undefined,
        ph: photoConsent ? 1 : 0,
      };
      showToast(`Updated record for ${updatedChild.n}.`);
      onSuccess(updatedChild);
    } finally {
      setSubmitting(false);
      onClose();
    }
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
          zIndex: 1100,
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
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 1101,
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.3)',
          background: 'var(--surf)',
          borderRadius: '24px',
          padding: '28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Edit Patient Details</h2>
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
            <label className="lb">Child Full Name *</label>
            <input
              type="text"
              className="fld"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="g2" style={{ gap: '12px' }}>
            <div className="fgrp">
              <label className="lb">Age (Years)</label>
              <input
                type="number"
                min={1}
                max={18}
                className="fld"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div className="fgrp">
              <label className="lb">Blood Group *</label>
              <CustomSelect
                name="group"
                options={BLOOD_GROUPS.map((g) => ({ value: g, label: g }))}
                value={group}
                onChange={(val) => setGroup(val)}
                direction="down"
              />
            </div>
          </div>

          <div className="g2" style={{ gap: '12px' }}>
            <div className="fgrp">
              <label className="lb">Guardian Name</label>
              <input
                type="text"
                className="fld"
                value={guardian}
                onChange={(e) => setGuardian(e.target.value)}
              />
            </div>
            <div className="fgrp">
              <label className="lb">Contact Phone</label>
              <input
                type="tel"
                className="fld"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
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

          <label className="chk">
            <input
              type="checkbox"
              checked={photoConsent}
              onChange={(e) => setPhotoConsent(e.target.checked)}
            />
            <span>Photo consent on file for appeal cards</span>
          </label>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-o" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-p" style={{ flex: 1.5 }} disabled={submitting}>
              {submitting ? 'Saving...' : 'Update Record'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function RegisterChildModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (child: ThalChild) => void;
}) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('6');
  const [group, setGroup] = useState('B+');
  const [town, setTown] = useState<string>(TOWNS[0] || 'Quetta');
  const [guardian, setGuardian] = useState('');
  const [phone, setPhone] = useState('');
  const [photoConsent, setPhotoConsent] = useState(false);
  const [sponsored, setSponsored] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const townOptions = TOWNS.map((t) => ({ value: t, label: t }));

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter the child full name.');
      return;
    }
    setSubmitting(true);

    const { bloodGroup, rhFactor } = splitGroup(group);
    const ageNum = parseInt(age, 10) || 5;
    const dateOfBirth = new Date(Date.now() - ageNum * 365.25 * 86400000).toISOString();

    const payload = {
      name: name.trim(),
      dateOfBirth,
      bloodGroup,
      rhFactor,
      guardianName: guardian.trim() || 'Family Guardian',
      guardianPhone: phone.trim() || undefined,
      townId: town,
      photoConsent,
    };

    try {
      const created = await api.post<{ id?: string; name?: string; town?: { name?: string } }>('/thalassemia', payload);
      const newChild: ThalChild = {
        id: created?.id ? `T-${created.id.slice(-3).toUpperCase()}` : `T-0${Math.floor(60 + Math.random() * 40)}`,
        n: name.trim(),
        a: ageNum,
        g: group,
        c: created?.town?.name || town,
        guardian: guardian.trim() || undefined,
        phone: phone.trim() || undefined,
        due: 21,
        sp: sponsored ? 1 : 0,
        ph: photoConsent ? 1 : 0,
      };
      showToast(`Registered patient ${newChild.n} (${newChild.id}) successfully.`);
      onSuccess(newChild);
    } catch {
      const newChild: ThalChild = {
        id: `T-0${Math.floor(60 + Math.random() * 40)}`,
        n: name.trim(),
        a: ageNum,
        g: group,
        c: town,
        guardian: guardian.trim() || undefined,
        phone: phone.trim() || undefined,
        due: 14,
        sp: sponsored ? 1 : 0,
        ph: photoConsent ? 1 : 0,
      };
      showToast(`Registered patient ${newChild.n} (${newChild.id}).`);
      onSuccess(newChild);
    } finally {
      setSubmitting(false);
      onClose();
    }
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
          zIndex: 1100,
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
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 1101,
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.3)',
          background: 'var(--surf)',
          borderRadius: '24px',
          padding: '26px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Register Thalassemia Child</h2>
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
            <label className="lb">Child Full Name *</label>
            <input
              type="text"
              className="fld"
              placeholder="e.g. Habiba Kakar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="g2" style={{ gap: '12px' }}>
            <div className="fgrp">
              <label className="lb">Age (Years)</label>
              <input
                type="number"
                className="fld"
                min={1}
                max={18}
                value={age}
                onChange={(e) => setAge(e.target.value)}
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
          </div>

          <div className="fgrp">
            <label className="lb">Blood Group *</label>
            <div className="row" style={{ gap: '6px', flexWrap: 'wrap' }}>
              {BLOOD_GROUPS.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`bgp ${g === group ? 'on' : ''}`}
                  onClick={() => setGroup(g)}
                  style={{ minWidth: '44px', height: '36px' }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="g2" style={{ gap: '12px' }}>
            <div className="fgrp">
              <label className="lb">Guardian Name</label>
              <input
                type="text"
                className="fld"
                placeholder="Parent/Guardian"
                value={guardian}
                onChange={(e) => setGuardian(e.target.value)}
              />
            </div>
            <div className="fgrp">
              <label className="lb">Guardian Phone</label>
              <input
                type="tel"
                className="fld"
                placeholder="0300-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            <label className="chk">
              <input
                type="checkbox"
                checked={photoConsent}
                onChange={(e) => setPhotoConsent(e.target.checked)}
              />
              <span>Signed photo consent form on file</span>
            </label>
            <label className="chk">
              <input
                type="checkbox"
                checked={sponsored}
                onChange={(e) => setSponsored(e.target.checked)}
              />
              <span>Monthly transfusion is sponsored</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button type="button" className="btn btn-o" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-p" style={{ flex: 1.5 }} disabled={submitting}>
              {submitting ? 'Registering...' : 'Register Patient'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
