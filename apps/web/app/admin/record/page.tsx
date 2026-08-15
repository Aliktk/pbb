'use client';

import { useState, type FormEvent } from 'react';
import { AdminShell } from '../../../components/admin/AdminShell';
import { CustomSelect } from '../../../components/CustomSelect';
import { DONORS, DONATIONS_TODAY, REQUESTS } from '../../../lib/adminData';

function bgTag(g: string) {
  const isNeg = g.includes('−') || g.includes('-');
  return (
    <span
      className={`abg${isNeg ? ' r' : ''}`}
      style={{ display: 'inline-block', minWidth: '38px', textAlign: 'center', fontWeight: 700 }}
    >
      {g}
    </span>
  );
}

export default function AdminRecord() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDonor, setSelectedDonor] = useState<string>('1');
  const [dateInput, setDateInput] = useState<string>(todayStr);
  const [bagsInput, setBagsInput] = useState<string>('1');
  const [requestId, setRequestId] = useState<string>('');
  const [saved, setSaved] = useState<boolean>(false);

  const [todayDonations, setTodayDonations] = useState<[string, string, string, number, string][]>(DONATIONS_TODAY);

  const donorOptions = DONORS.map((d) => ({
    value: String(d.id),
    label: `${d.n} (${d.g} · ${d.mr})`,
  }));

  const requestOptions = [
    { value: '', label: 'Not linked (General intake)' },
    ...REQUESTS.filter((r) => r.st === 'open').map((r) => ({
      value: r.id,
      label: `${r.id} · ${r.g} · ${r.hosp}`,
    })),
  ];

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const donor = DONORS.find((d) => String(d.id) === selectedDonor) || DONORS[0];
    setTodayDonations((prev) => [[dateInput, donor.n, donor.g, parseInt(bagsInput, 10) || 1, donor.c], ...prev]);
    setSaved(true);
    setTimeout(() => setSaved(false), 5000);
  }

  return (
    <AdminShell view="record" title="Record a donation" subtitle="One form, three fields">
      <div
        style={{
          position: 'relative',
          padding: '24px 16px 40px',
          borderRadius: '28px',
          background: 'linear-gradient(180deg, rgba(224, 43, 32, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Floating Glowing Backdrop Orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '380px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(224, 43, 32, 0.16) 0%, rgba(224, 43, 32, 0.02) 60%, transparent 80%)',
            filter: 'blur(36px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <form
            className="acard"
            onSubmit={onSubmit}
            style={{
              padding: '30px',
              borderRadius: '24px',
              background: 'linear-gradient(145deg, #ffffff 0%, #FFFDFD 100%)',
              border: '1px solid rgba(224, 43, 32, 0.18)',
              boxShadow: '0 20px 48px rgba(224, 43, 32, 0.08), 0 4px 16px rgba(0, 0, 0, 0.03)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top Red Accent Stripe */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, var(--red) 0%, #FF6B6B 100%)',
              }}
            />
          <div className="fgrp" style={{ marginBottom: '16px' }}>
            <label className="lb">Who donated?</label>
            <CustomSelect
              name="who"
              options={donorOptions}
              value={selectedDonor}
              onChange={(val) => setSelectedDonor(val)}
              direction="down"
            />
            <div className="sm" style={{ marginTop: '7px', color: 'var(--mid)' }}>
              Not on the register? <b style={{ color: 'var(--red)', cursor: 'pointer' }}>Add them first →</b>
            </div>
          </div>

          <div className="g2" style={{ gap: '14px', marginBottom: '16px' }}>
            <div className="fgrp">
              <label className="lb">Date</label>
              <input
                className="fld"
                type="date"
                name="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                required
              />
            </div>
            <div className="fgrp">
              <label className="lb">Bags</label>
              <input
                className="fld"
                name="bags"
                type="number"
                value={bagsInput}
                onChange={(e) => setBagsInput(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="fgrp" style={{ marginBottom: '20px' }}>
            <label className="lb">
              Against a request? <span className="sm" style={{ color: 'var(--mid)', fontWeight: 400 }}>- optional</span>
            </label>
            <CustomSelect
              name="req"
              options={requestOptions}
              value={requestId}
              onChange={(val) => setRequestId(val)}
              direction="down"
            />
          </div>

          <button className="btn btn-p" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
            Save to the register
          </button>

          {saved && (
            <div
              className="msg ok"
              style={{
                marginTop: '14px',
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'var(--grn-t)',
                color: 'var(--grn)',
                fontWeight: 600,
                fontSize: '13.5px',
              }}
            >
              ✓ Saved. The donor’s next eligible date moves ninety days out.
            </div>
          )}
        </form>

        <p className="ahint" style={{ marginTop: '16px', lineHeight: 1.5, color: 'var(--mid)', fontSize: '13.5px' }}>
          Saving does three things at once: writes the donation, sets that donor’s next eligible date
          <b style={{ color: 'var(--ink)' }}> ninety days out</b>, and adds to the year’s total. Nothing is entered twice.
        </p>

        <div className="acard" style={{ marginTop: '20px', padding: '22px' }}>
          <h3 style={{ marginBottom: '14px', fontSize: '17px', fontWeight: 800 }}>Recorded today</h3>
          {todayDonations.length ? (
            todayDonations.map(([, name, g, bags], idx) => (
              <div
                className="row"
                key={`${name}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 0',
                  borderBottom: idx === todayDonations.length - 1 ? 'none' : '1px solid var(--line)',
                }}
              >
                {bgTag(g)}
                <span style={{ flex: 1, fontWeight: 600, color: 'var(--ink)' }}>{name}</span>
                <span className="sm" style={{ color: 'var(--mid)', fontWeight: 600 }}>
                  {bags} bag
                </span>
              </div>
            ))
          ) : (
            <p className="sm" style={{ color: 'var(--mid)' }}>Nothing recorded yet today.</p>
          )}
        </div>
      </div>
    </div>
  </AdminShell>
  );
}
