'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { updateDonor } from '../../lib/donors';
import { showToast } from '../../lib/toast';
import { splitGroup } from '../../lib/bloodGroup';
import { BLOOD_GROUPS } from '../../lib/nav';
import { CustomSelect } from '../CustomSelect';
import type { Town } from '../../lib/towns';
import type { DonorRow } from '../../lib/apiTypes';

interface EditDonorModalProps {
  donor: DonorRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedDonor: DonorRow) => void;
  towns: Town[];
}

export function EditDonorModal({ donor, isOpen, onClose, onSuccess, towns }: EditDonorModalProps) {
  const [name, setName] = useState('');
  const [mrNo, setMrNo] = useState('');
  const [group, setGroup] = useState('O+');
  const [townId, setTownId] = useState('');
  const [phone, setPhone] = useState('');
  const [consentToCall, setConsentToCall] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (donor) {
      setName(donor.name || '');
      setMrNo(donor.mrNo || '');
      setGroup(donor.group || 'O+');
      const matchedTown = towns.find((t) => t.name === donor.town || t.id === donor.townId);
      setTownId(matchedTown?.id || towns[0]?.id || '');
      setPhone(donor.phone || '');
      setConsentToCall(donor.consentToCall ?? true);
    }
  }, [donor, towns]);

  if (!isOpen || !donor) return null;

  const townOptions = towns.map((t) => ({ value: t.id, label: t.name }));

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter full name.');
      return;
    }

    setSubmitting(true);
    const { bloodGroup, rhFactor } = splitGroup(group);

    try {
      const updated = await updateDonor(donor!.id, {
        name: name.trim(),
        mrNo: mrNo.trim() || undefined,
        bloodGroup,
        rhFactor,
        phone: phone.trim() || null,
        townId,
        consentToCall,
      });
      showToast(`Donor ${updated.name || name} updated successfully.`);
      onSuccess(updated);
      onClose();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not update the donor.');
    } finally {
      setSubmitting(false);
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
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 1001,
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.3)',
          background: 'var(--surf)',
          borderRadius: '24px',
          padding: '28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Edit Donor Details</h2>
            <p className="sm" style={{ margin: '4px 0 0' }}>Update donor register profile</p>
          </div>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="fgrp">
            <label className="lb">Full Name *</label>
            <input
              type="text"
              className="fld"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="g2" style={{ gap: '14px' }}>
            <div className="fgrp">
              <label className="lb">MR Number</label>
              <input
                type="text"
                className="fld mono2"
                value={mrNo}
                onChange={(e) => setMrNo(e.target.value)}
              />
            </div>
            <div className="fgrp">
              <label className="lb">Phone Number</label>
              <input
                type="tel"
                className="fld"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                  style={{ minWidth: '46px', height: '38px' }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="fgrp">
            <label className="lb">Town / District *</label>
            <CustomSelect
              name="townId"
              options={townOptions}
              value={townId}
              onChange={(val) => setTownId(val)}
              placeholder="Select town..."
              direction="up"
            />
          </div>

          <label className="chk" style={{ marginTop: '4px' }}>
            <input
              type="checkbox"
              checked={consentToCall}
              onChange={(e) => setConsentToCall(e.target.checked)}
            />
            <span>Consents to emergency phone calls for blood intake</span>
          </label>

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              className="btn btn-o"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-p"
              style={{ flex: 2 }}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Update Donor'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
