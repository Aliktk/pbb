'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { css } from '../../../lib/style';
import { AdminShell } from '../../../components/admin/AdminShell';
import { showToast } from '../../../lib/toast';
import { useAuth } from '../../../lib/auth';
import { fetchTowns, type Town } from '../../../lib/towns';
import {
  fetchLedger, fetchServiceCharges, createInvoice, recordDonation,
  type LedgerEntry, type ServiceCharge,
} from '../../../lib/finance';

const rs = (n: number) => `Rs ${n.toLocaleString()}`;

function agoLabel(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().split('T')[0];
}

export default function AdminFinance() {
  const { user } = useAuth();
  const isHead = user?.role.id === 'head';
  const myTownId = user?.townId ?? null;

  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [charges, setCharges] = useState<ServiceCharge[]>([]);
  const [towns, setTowns] = useState<Town[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);

  async function reload() {
    setError(null);
    try {
      const [l, c, t] = await Promise.all([fetchLedger(), fetchServiceCharges(), fetchTowns()]);
      setLedger(l);
      setCharges(c);
      setTowns(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load finance.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  const townName = (id: string | null) => (id ? towns.find((t) => t.id === id)?.name ?? id : '-');

  const totals = useMemo(() => {
    let invoices = 0, donations = 0;
    for (const e of ledger) {
      if (e.kind === 'INVOICE') invoices += e.amount_pkr;
      else donations += e.amount_pkr;
    }
    return { invoices, donations, all: invoices + donations };
  }, [ledger]);

  const actions = (
    <>
      <span style={css('margin-left:auto')} />
      <button type="button" className="btn btn-o btn-s" onClick={() => setDonationOpen(true)}>Record donation</button>
      <button type="button" className="btn btn-p btn-s" onClick={() => setInvoiceOpen(true)}>+ New invoice</button>
    </>
  );

  const subtitle = isHead ? 'All offices' : `${townName(myTownId)} office`;

  return (
    <AdminShell view="finance" title="Finance &amp; invoices" subtitle={subtitle} actions={actions}>
      {loading ? (
        <div className="acard aempty"><h3>Loading finance…</h3></div>
      ) : error ? (
        <div className="tag no" style={css('display:block;padding:14px 16px;border-radius:12px')}>{error}</div>
      ) : (
        <>
          <div className="akpi">
            <div className="c"><div className="l">Total income</div><div className="n">{rs(totals.all)}</div></div>
            <div className="c"><div className="l">From services (invoices)</div><div className="n">{rs(totals.invoices)}</div></div>
            <div className="c"><div className="l">Charitable donations</div><div className="n" style={{ color: '#16A34A' }}>{rs(totals.donations)}</div></div>
            <div className="c"><div className="l">Entries</div><div className="n">{ledger.length}</div></div>
          </div>

          <div className="atbl">
            <table>
              <thead><tr><th>Date</th><th>Type</th><th>From / patient</th>{isHead ? <th>Office</th> : null}<th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
              <tbody>
                {ledger.length ? ledger.map((e) => (
                  <tr key={`${e.kind}-${e.id}`}>
                    <td className="sm">{agoLabel(e.at)}</td>
                    <td>{e.kind === 'INVOICE' ? <span className="tag gy">Service</span> : <span className="tag ok">Donation</span>}</td>
                    <td className="m2"><div className="nm">{e.party || (e.kind === 'INVOICE' ? 'Walk-in patient' : 'Anonymous')}</div><div className="sm">{e.status}</div></td>
                    {isHead ? <td>{townName(e.town_id)}</td> : null}
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{rs(e.amount_pkr)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={isHead ? 5 : 4} className="aempty">No income recorded yet. Create an invoice or record a donation.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="ahint">
            Each office sees only its own money. Head office sees every office and can tell them apart by the Office column.
            A patient who cannot pay is invoiced as <b>waived</b> - it is recorded (so free services are counted) but adds nothing to income.
          </p>
        </>
      )}

      <InvoiceModal
        open={invoiceOpen} isHead={isHead} myTownId={myTownId} towns={towns} charges={charges}
        onClose={() => setInvoiceOpen(false)} onDone={() => { setInvoiceOpen(false); reload(); }}
      />
      <DonationModal
        open={donationOpen} isHead={isHead} myTownId={myTownId} towns={towns}
        onClose={() => setDonationOpen(false)} onDone={() => { setDonationOpen(false); reload(); }}
      />
    </AdminShell>
  );
}

function TownField({ isHead, townId, setTownId, towns }: { isHead: boolean; townId: string; setTownId: (v: string) => void; towns: Town[]; }) {
  if (!isHead) return null;
  return (
    <div className="fgrp">
      <label className="lb">Office</label>
      <select className="fld" value={townId} onChange={(e) => setTownId(e.target.value)} required>
        <option value="">Select office</option>
        {towns.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
    </div>
  );
}

function InvoiceModal({
  open, isHead, myTownId, towns, charges, onClose, onDone,
}: {
  open: boolean; isHead: boolean; myTownId: string | null; towns: Town[]; charges: ServiceCharge[];
  onClose: () => void; onDone: () => void;
}) {
  const [townId, setTownId] = useState('');
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [waived, setWaived] = useState(false);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) { setTownId(isHead ? '' : (myTownId ?? '')); setCustomer(''); setPhone(''); setWaived(false); setQty({}); }
  }, [open, isHead, myTownId]);

  const subtotal = charges.reduce((s, c) => s + (qty[c.id] || 0) * c.price_pkr, 0);
  const total = waived ? 0 : subtotal;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const town = isHead ? townId : myTownId;
    if (!town) { showToast('Choose an office'); return; }
    const items = charges.filter((c) => (qty[c.id] || 0) > 0).map((c) => ({
      serviceChargeId: c.id, description: c.name, qty: qty[c.id], unitPricePkr: c.price_pkr,
    }));
    if (!items.length) { showToast('Add at least one service'); return; }
    setBusy(true);
    try {
      await createInvoice({ townId: town, customerName: customer, customerPhone: phone, isWaived: waived, items });
      showToast(waived ? 'Waived invoice recorded (free service).' : `Invoice created: ${rs(total)}`);
      onDone();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not create the invoice.');
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;
  return (
    <>
      <div className="sheetov on" onClick={onClose} />
      <div className="sheet open">
        <button className="cl" onClick={onClose}>✕</button>
        <h2 style={css('margin:6px 0 4px')}>New invoice</h2>
        <p className="sm" style={css('margin-bottom:16px')}>Charge a patient for services from the head-office price list.</p>
        <form onSubmit={submit}>
          <TownField isHead={isHead} townId={townId} setTownId={setTownId} towns={towns} />
          <div className="g2" style={css('gap:12px')}>
            <div className="fgrp"><label className="lb">Patient / customer</label><input className="fld" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Name (optional)" /></div>
            <div className="fgrp"><label className="lb">Phone</label><input className="fld" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" /></div>
          </div>
          <label className="lb" style={css('margin-top:6px')}>Services</label>
          <div style={css('display:grid;gap:8px;margin:6px 0 14px')}>
            {charges.map((c) => (
              <div key={c.id} className="drow" style={css('align-items:center')}>
                <span style={css('flex:1')}><b>{c.name}</b><br /><span className="sm">{rs(c.price_pkr)}</span></span>
                <input type="number" min={0} className="fld" style={css('width:80px')} value={qty[c.id] || 0}
                  onChange={(e) => setQty((q) => ({ ...q, [c.id]: Math.max(0, parseInt(e.target.value, 10) || 0) }))} />
              </div>
            ))}
            {!charges.length ? <p className="sm">No services in the price list yet. Head office adds them in Settings.</p> : null}
          </div>
          <label className="chk" style={css('margin-bottom:12px')}><input type="checkbox" checked={waived} onChange={(e) => setWaived(e.target.checked)} /><span>Waive the fee (patient cannot pay) - recorded as free</span></label>
          <div className="drow" style={css('font-size:18px;font-weight:800')}><span>Total</span><b>{rs(total)}</b></div>
          <button className="btn btn-p" style={css('width:100%;margin-top:14px;padding:14px')} disabled={busy}>{busy ? 'Saving…' : (waived ? 'Record waived invoice' : 'Create invoice')}</button>
          <button type="button" className="btn btn-o" style={css('width:100%;margin-top:10px')} onClick={onClose}>Cancel</button>
        </form>
      </div>
    </>
  );
}

function DonationModal({
  open, isHead, myTownId, towns, onClose, onDone,
}: {
  open: boolean; isHead: boolean; myTownId: string | null; towns: Town[];
  onClose: () => void; onDone: () => void;
}) {
  const [townId, setTownId] = useState('');
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) { setTownId(isHead ? '' : (myTownId ?? '')); setSource(''); setAmount(''); setMethod('cash'); setNote(''); }
  }, [open, isHead, myTownId]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const town = isHead ? townId : myTownId;
    if (!town) { showToast('Choose an office'); return; }
    const amt = parseInt(amount, 10);
    if (!amt || amt <= 0) { showToast('Enter an amount'); return; }
    setBusy(true);
    try {
      await recordDonation({ townId: town, source, amountPkr: amt, method, note });
      showToast(`Donation recorded: ${rs(amt)}`);
      onDone();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not record the donation.');
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;
  return (
    <>
      <div className="sheetov on" onClick={onClose} />
      <div className="sheet open">
        <button className="cl" onClick={onClose}>✕</button>
        <h2 style={css('margin:6px 0 4px')}>Record a donation</h2>
        <p className="sm" style={css('margin-bottom:16px')}>Charitable money received for the blood bank.</p>
        <form onSubmit={submit}>
          <TownField isHead={isHead} townId={townId} setTownId={setTownId} towns={towns} />
          <div className="fgrp"><label className="lb">From (source)</label><input className="fld" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Donor / organisation (optional)" /></div>
          <div className="g2" style={css('gap:12px')}>
            <div className="fgrp"><label className="lb">Amount (PKR)</label><input type="number" min={1} className="fld" value={amount} onChange={(e) => setAmount(e.target.value)} required /></div>
            <div className="fgrp"><label className="lb">Method</label>
              <select className="fld" value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="cash">Cash</option><option value="bank">Bank</option><option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="fgrp"><label className="lb">Note</label><input className="fld" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" /></div>
          <button className="btn btn-p" style={css('width:100%;margin-top:8px;padding:14px')} disabled={busy}>{busy ? 'Saving…' : 'Record donation'}</button>
          <button type="button" className="btn btn-o" style={css('width:100%;margin-top:10px')} onClick={onClose}>Cancel</button>
        </form>
      </div>
    </>
  );
}
