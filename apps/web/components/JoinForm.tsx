'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { css } from '../lib/style';
import { TOWNS, BLOOD_GROUPS } from '../lib/nav';
import { FORM_FIELDS, NEED_GROUP, SUCCESS, type JoinKind } from '../lib/join';
import { showToast } from '../lib/toast';
import { fetchTowns } from '../lib/towns';
import { submitPublicRequest } from '../lib/requests';
import { splitGroup } from '../lib/bloodGroup';

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
 * in the admin the moment it is submitted). The other kinds acknowledge locally until their
 * endpoints exist.
 */
export function JoinForm({ kind }: JoinFormProps) {
  const [group, setGroup] = useState<string>('');
  const [towns, setTowns] = useState<Town[] | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [ref, setRef] = useState('');
  const [busy, setBusy] = useState(false);
  const rows = FORM_FIELDS[kind];
  const groupLabel = NEED_GROUP[kind];
  const success = SUCCESS[kind];

  useEffect(() => {
    fetchTowns()
      .then((res) => setTowns(res))
      .catch(() => setTowns([]));
  }, []);

  async function submitRequester(form: HTMLFormElement) {
    const fd = new FormData(form);
    const { bloodGroup, rhFactor } = splitGroup(group);
    const disease = String(fd.get('disease') ?? '').trim();
    const age = String(fd.get('age') ?? '').trim();
    const genderText = String(fd.get('gender') ?? '').trim();
    const notes = [disease && `Case: ${disease}`, age && `Age ${age}`, genderText]
      .filter(Boolean)
      .join(' · ');

    const res = await submitPublicRequest({
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
    });
    setRef(res.reference);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        showToast(err instanceof Error ? err.message : 'Could not submit. Please try again.');
      } finally {
        setBusy(false);
      }
      return;
    }

    // Other kinds are acknowledged locally until their API lands.
    const n = Math.floor(1000 + Math.random() * 9000);
    setRef(kind === 'donor' ? `D-${n}` : `PBB-${n}`);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (submitted) {
    const showCode = kind === 'requester' || kind === 'donor';
    return (
      <div className="card">
        <div className="done">
          <div className="tick">✓</div>
          <h2>{success.title}</h2>
          <p className="lead" style={css('margin-top:12px')}>{success.body}</p>
          {showCode && <div className="code">{ref}</div>}
          {showCode && (
            <p className="muted" style={css('font-size:14px')}>
              Save this number. Quote it when you call the branch.
            </p>
          )}
          <p className="muted" style={css('font-size:13px;margin-top:10px')}>
            It is already on the coordinator&apos;s screen.{' '}
            <Link href={success.adminHref}><b>{success.adminLabel}</b></Link>
          </p>
          <div className="row" style={css('justify-content:center;margin-top:22px')}>
            <a href="tel:0812836820" className="btn btn-p">Call the head office</a>
            <Link href="/" className="btn btn-o">Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={onSubmit}>
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
            <select className="fld" name={row.name} required={row.required}>
              {(row.options ?? []).map((o) => <option key={o}>{o}</option>)}
            </select>
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
        <select className="fld" name="city" required>
          {towns && towns.length
            ? towns.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)
            : TOWNS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
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
        {busy ? 'Submitting...' : kind === 'requester' ? 'Submit the request' : 'Send'}
      </button>
    </form>
  );
}
