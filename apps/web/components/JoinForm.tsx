'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { css } from '../lib/style';
import { TOWNS, BLOOD_GROUPS } from '../lib/nav';
import { FORM_FIELDS, NEED_GROUP, SUCCESS, type JoinKind } from '../lib/join';
import { showToast } from '../lib/toast';

interface JoinFormProps {
  kind: JoinKind;
}

/**
 * The one-form-five-kinds join form. Client component: manages the blood-group picker and,
 * on submit, shows the prototype's success panel. No backend yet (design phase) — submission
 * is intercepted and acknowledged locally; wiring to POST /requests etc. comes with T3/T2.
 */
export function JoinForm({ kind }: JoinFormProps) {
  const [group, setGroup] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [ref, setRef] = useState('');
  const rows = FORM_FIELDS[kind];
  const groupLabel = NEED_GROUP[kind];
  const success = SUCCESS[kind];

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (groupLabel && !group) {
      showToast(`Please choose ${groupLabel.toLowerCase()}.`);
      return;
    }
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
            <select className="fld" name={row.name}>
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
        <select className="fld" name="city">
          {TOWNS.map((t) => <option key={t}>{t}</option>)}
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

      <button className="btn btn-p" style={css('width:100%;padding:16px;font-size:16px;margin-top:14px')}>
        {kind === 'requester' ? 'Submit the request' : 'Send'}
      </button>
    </form>
  );
}
