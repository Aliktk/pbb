'use client';

import { useEffect, useState, useRef, type FormEvent } from 'react';
import Link from 'next/link';
import { css } from '../lib/style';
import { TOWNS, BLOOD_GROUPS } from '../lib/nav';
import { getTownNamesList } from '../lib/towns';
import { FORM_FIELDS, NEED_GROUP, SUCCESS, type JoinKind } from '../lib/join';
import { showToast } from '../lib/toast';
import { api, ApiError } from '../lib/api';
import { splitGroup } from '../lib/bloodGroup';
import { CustomSelect } from './CustomSelect';

interface JoinFormProps {
  kind: JoinKind;
}

interface Town {
  id: string;
  name: string;
}

function urgencyEnum(value: string): 'CRITICAL' | 'URGENT' | 'ROUTINE' {
  if (value.startsWith('Critical')) return 'CRITICAL';
  if (value.startsWith('Urgent')) return 'URGENT';
  return 'ROUTINE';
}

/**
 * The one-form-five-kinds join form. The requester kind is wired to POST /requests (it appears
 * in the admin the moment it is submitted). When submitted, the page smooth-scrolls directly
 * to the confirmation card so the user sees it immediately.
 */
export function JoinForm({ kind }: JoinFormProps) {
  const [group, setGroup] = useState<string>('');
  const [towns, setTowns] = useState<Town[] | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [ref, setRef] = useState('');
  const [busy, setBusy] = useState(false);
  const doneRef = useRef<HTMLDivElement>(null);

  const rows = FORM_FIELDS[kind];
  const groupLabel = NEED_GROUP[kind];
  const success = SUCCESS[kind];

  useEffect(() => {
    api
      .get<{ data: Town[] }>('/towns', { auth: false })
      .then((res) => setTowns(res.data))
      .catch(() => setTowns([]));
  }, []);

  // Smooth scroll directly to confirmation message on submission
  useEffect(() => {
    if (submitted && doneRef.current) {
      setTimeout(() => {
        doneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [submitted]);

  async function submitRequester(form: HTMLFormElement) {
    const fd = new FormData(form);
    const { bloodGroup, rhFactor } = splitGroup(group);
    const disease = String(fd.get('disease') ?? '').trim();
    const age = String(fd.get('age') ?? '').trim();
    const genderText = String(fd.get('gender') ?? '').trim();
    const notes = [disease && `Case: ${disease}`, age && `Age ${age}`, genderText]
      .filter(Boolean)
      .join(' · ');

    const payload = {
      patientName: String(fd.get('patient') ?? '').trim() || undefined,
      hospital: String(fd.get('hospital') ?? '').trim(),
      townId: String(fd.get('city') ?? ''),
      bloodGroup,
      rhFactor,
      unitsNeeded: Number(fd.get('units')) || 1,
      urgency: urgencyEnum(String(fd.get('urgency') ?? '')),
      requesterName: String(fd.get('att') ?? '').trim(),
      requesterPhone: String(fd.get('phone') ?? '').trim(),
      transportAvailable: String(fd.get('transport') ?? '').startsWith('Yes'),
      exchangePossible: String(fd.get('exchange') ?? '') === 'Yes',
      caseNotes: notes || undefined,
    };

    const res = await api.post<{ reference: string; status: string }>('/requests', payload, { auth: false });
    setRef(res.reference);
    setSubmitted(true);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (groupLabel && !group) {
      showToast(`Please choose ${groupLabel.toLowerCase()}.`);
      return;
    }

    if (kind === 'requester') {
      setBusy(true);
      try {
        await submitRequester(e.currentTarget);
      } catch (err) {
        showToast(err instanceof ApiError ? err.message : 'Could not submit. Is the API running?');
      } finally {
        setBusy(false);
      }
      return;
    }

    // Other kinds are acknowledged locally until their API lands.
    const n = Math.floor(1000 + Math.random() * 9000);
    setRef(kind === 'donor' ? `D-${n}` : `PBB-${n}`);
    setSubmitted(true);
  }

  function handleCopyReference() {
    if (ref && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(ref);
      showToast(`Copied reference number "${ref}" to clipboard!`);
    }
  }

  if (submitted) {
    const showCode = kind === 'requester' || kind === 'donor';
    return (
      <div
        ref={doneRef}
        className="card"
        style={{
          borderRadius: '24px',
          padding: '36px 28px',
          background: 'var(--surf)',
          border: '2px solid #22C55E',
          boxShadow: '0 15px 45px rgba(34, 197, 94, 0.12)',
          scrollMarginTop: '100px',
        }}
      >
        <div className="done" style={{ textAlign: 'center' }}>
          {/* GREEN TICK BADGE */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#22C55E',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              fontWeight: 900,
              marginBottom: '18px',
              boxShadow: '0 6px 20px rgba(34, 197, 94, 0.2)',
            }}
          >
            ✓
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: 900, margin: '0 0 10px 0', color: 'var(--txt1)' }}>
            {success.title}
          </h2>

          <p className="lead" style={{ fontSize: '15px', color: 'var(--txt2)', margin: '0 0 20px 0', lineHeight: 1.6, maxWidth: '580px', marginLeft: 'auto', marginRight: 'auto' }}>
            {success.body}
          </p>

          {/* REFERENCE TRACKING BOX */}
          {showCode && (
            <div
              style={{
                background: 'var(--surf)',
                border: '2px dashed var(--line)',
                borderRadius: '18px',
                padding: '20px',
                margin: '20px auto',
                maxWidth: '420px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--txt2)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Tracking Reference Number
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '28px', fontWeight: 900, color: 'var(--p)', letterSpacing: '0.06em' }}>
                {ref}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--txt2)', marginTop: '6px' }}>
                Quote this code when calling the hotline or checking status at the branch.
              </div>

              <button
                type="button"
                className="btn btn-o btn-s"
                onClick={handleCopyReference}
                style={{ marginTop: '12px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700 }}
              >
                📋 Copy Reference Code
              </button>
            </div>
          )}

          <p style={{ fontSize: '13.5px', color: 'var(--txt2)', margin: '16px 0' }}>
            Submitted to Quetta HQ Central Dispatch Coordinator.{' '}
            <Link href={success.adminHref} style={{ color: 'var(--p)', fontWeight: 800, textDecoration: 'underline' }}>
              {success.adminLabel}
            </Link>
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
            <a
              href="tel:0812836820"
              className="btn btn-p"
              style={{ borderRadius: '12px', padding: '12px 24px', fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              📞 Call Hotline 081-2836820
            </a>

            <button
              type="button"
              className="btn btn-o"
              onClick={() => {
                setSubmitted(false);
                setGroup('');
              }}
              style={{ borderRadius: '12px', padding: '12px 20px', fontWeight: 700 }}
            >
              Submit Another Entry
            </button>

            <Link
              href="/"
              className="btn btn-o"
              style={{ borderRadius: '12px', padding: '12px 20px', fontWeight: 700, textDecoration: 'none' }}
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="card join-form-card-pro" onSubmit={onSubmit}>
      {groupLabel && (
        <div className="fgrp">
          <label className="lb">{groupLabel} *</label>
          <div className="row" style={css('gap:8px')} data-bg="group">
            {BLOOD_GROUPS.map((g) => (
              <button
                key={g}
                type="button"
                className={`bgp${group === g ? ' on' : ''}`}
                onClick={() => setGroup(g)}
              >
                {g}
              </button>
            ))}
            {kind === 'donor' && (
              <button
                type="button"
                className={`bgp wide${group === 'unknown' ? ' on' : ''}`}
                onClick={() => setGroup('unknown')}
              >
                I don&apos;t know
              </button>
            )}
          </div>
        </div>
      )}

      {rows.map((row, i) =>
        row.kind === 'section' ? (
          <div className="fsec" key={`s${i}`}><span>{row.title}</span></div>
        ) : row.type === 'select' ? (
          <div className="fgrp" key={row.name}>
            <label className="lb">{row.label}{row.required ? ' *' : ''}</label>
            <CustomSelect
              name={row.name}
              options={row.options ?? []}
              required={row.required}
            />
          </div>
        ) : row.type === 'textarea' ? (
          <div className="fgrp" key={row.name}>
            <label className="lb">{row.label}{row.required ? ' *' : ''}</label>
            <textarea className="fld" name={row.name} rows={3} required={row.required} />
          </div>
        ) : (
          <div className="fgrp" key={row.name}>
            <label className="lb">{row.label}{row.required ? ' *' : ''}</label>
            <input
              className="fld"
              name={row.name}
              type={row.type}
              required={row.required}
              inputMode={row.type === 'number' ? 'numeric' : undefined}
            />
          </div>
        ),
      )}

      <div className="fgrp">
        <label className="lb">Town *</label>
        <CustomSelect
          name="city"
          options={
            towns && towns.length
              ? towns.map((t) => ({ value: t.id, label: t.name }))
              : getTownNamesList().map((t) => ({ value: t, label: t }))
          }
          required
        />
      </div>

      {kind === 'donor' && (
        <label className="chk">
          <input type="checkbox" defaultChecked name="crosscity" />
          <span>I am willing to be called if another town urgently needs my blood group.</span>
        </label>
      )}
      <label className="chk">
        <input type="checkbox" required defaultChecked />
        <span>What I have entered is accurate, and I agree to be contacted about it.</span>
      </label>

      <button className="btn btn-p" disabled={busy} style={css('width:100%;padding:16px;font-size:16px;margin-top:14px')}>
        {busy ? 'Submitting...' : kind === 'requester' ? 'Submit the request' : 'Send Registration'}
      </button>
    </form>
  );
}
