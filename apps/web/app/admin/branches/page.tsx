'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { fetchOffices, updateOffice, type Office } from '../../../lib/offices';
import { fetchTowns, type Town } from '../../../lib/towns';

// Offices - read from the database (towns table). Each office edits its own contact details here;
// RLS lets head office edit any office and an office manager edit only their own. What is saved
// here is exactly what the public "Our branches" page shows.

export default function AdminBranches() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [towns, setTowns] = useState<Town[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [edit, setEdit] = useState<Office | null>(null);

  async function reload() {
    setError(null);
    try {
      const [o, t] = await Promise.all([fetchOffices(), fetchTowns()]);
      setOffices(o);
      setTowns(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load offices.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  const officeNames = new Set(offices.map((o) => o.name));
  const alsoServing = towns.filter((t) => !officeNames.has(t.name));

  return (
    <AdminShell view="branches" title="Offices" subtitle={`${offices.length} offices · ${towns.length} towns`}>
      {loading ? (
        <div className="acard aempty"><h3>Loading offices…</h3></div>
      ) : error ? (
        <div className="tag no" style={css('display:block;padding:14px 16px;border-radius:12px')}>{error}</div>
      ) : (
        <>
          <div className="atbl">
            <table>
              <thead>
                <tr><th>Office</th><th>Address</th><th>Phone</th><th>Email</th></tr>
              </thead>
              <tbody>
                {offices.map((b) => (
                  <tr key={b.id} onClick={() => setEdit(b)} style={css('cursor:pointer')}>
                    <td className="m2">
                      <div className="nm">{b.name}{b.isHeadOffice ? <> <span className="hd-tag">HEAD OFFICE</span></> : null}</div>
                      <div className="sm">{b.address ?? 'Address to follow'}</div>
                    </td>
                    <td className="sm">{b.address ?? '-'}</td>
                    <td className="mono2 m1">{b.phones.length ? b.phones.join(' · ') : '-'}</td>
                    <td className="sm">{b.email ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="acard" style={css('margin-top:18px')}>
            <h3 style={css('margin-bottom:6px')}>Towns served without an office</h3>
            <p className="sm" style={css('margin-bottom:14px')}>These feed the town list on every form across the website.</p>
            {alsoServing.map((t) => <span key={t.id} className="chip">{t.name}</span>)}
          </div>

          <p className="ahint">
            Tap an office to edit its address, telephone numbers and email. Whatever you save here appears on
            the public &quot;Our branches&quot; page straight away.
          </p>
        </>
      )}

      <OfficeSheet office={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); reload(); }} />
    </AdminShell>
  );
}

function OfficeSheet({ office, onClose, onSaved }: { office: Office | null; onClose: () => void; onSaved: () => void }) {
  const isOpen = office !== null;
  const [address, setAddress] = useState('');
  const [phones, setPhones] = useState('');
  const [email, setEmail] = useState('');
  const [bank, setBank] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (office) {
      setAddress(office.address ?? '');
      setPhones(office.phones.join(', '));
      setEmail(office.email ?? '');
      setBank(office.bank ?? '');
    }
  }, [office]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!office) return;
    setBusy(true);
    try {
      await updateOffice(office.id, {
        address: address.trim() || null,
        phones: phones.split(',').map((p) => p.trim()).filter(Boolean),
        email: email.trim() || null,
        bank: bank.trim() || null,
      });
      showToast('Office details saved');
      onSaved();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save (you may only edit your own office).');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className={`sheetov${isOpen ? ' on' : ''}`} onClick={onClose} />
      <div className={`sheet${isOpen ? ' open' : ''}`}>
        {office && (
          <>
            <button className="cl" onClick={onClose}>✕</button>
            <h2 style={css('margin:6px 0 4px')}>{office.name}{office.isHeadOffice ? <> <span className="hd-tag">HEAD OFFICE</span></> : null}</h2>
            <p className="sm" style={css('margin-bottom:20px')}>Edit this office&apos;s contact details.</p>
            <form onSubmit={onSubmit}>
              <div className="fgrp"><label className="lb">Address</label><input className="fld" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, area, district" /></div>
              <div className="fgrp"><label className="lb">Telephone numbers</label><input className="fld" value={phones} onChange={(e) => setPhones(e.target.value)} placeholder="Comma-separated, e.g. 0333-3151503, 0826-612281" /></div>
              <div className="fgrp"><label className="lb">Email</label><input className="fld" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="office@example.com" /></div>
              <div className="fgrp"><label className="lb">Bank account (optional)</label><input className="fld" value={bank} onChange={(e) => setBank(e.target.value)} placeholder="Bank · A/C number" /></div>
              <button className="btn btn-p" style={css('width:100%;padding:14px')} disabled={busy}>{busy ? 'Saving…' : 'Save office details'}</button>
              <button type="button" className="btn btn-o" style={css('width:100%;margin-top:10px')} onClick={onClose}>Cancel</button>
            </form>
            <p className="ahint" style={css('margin-top:16px')}>Head office may edit any office; an office manager may edit only their own.</p>
          </>
        )}
      </div>
    </>
  );
}
