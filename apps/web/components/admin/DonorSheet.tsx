'use client';

import { css } from '../../lib/style';
import { TESTS, ISSUE, elig, daysSince, type Donor } from '../../lib/admin';
import { showToast } from '../../lib/toast';

interface DonorSheetProps {
  donor: Donor | null;
  onClose: () => void;
}

function bgTag(g: string) {
  return <span className={`abg${g.includes('−') ? ' r' : ''}`}>{g}</span>;
}
function Row({ k, v }: { k: string; v: string | number }) {
  return <div className="drow"><span>{k}</span><b>{v}</b></div>;
}

/** Donor detail slide-over — ported from openDonor(). Shows the diary fields, the donation
 * summary, and the five screening results, with the single eligibility verdict. */
export function DonorSheet({ donor: d, onClose }: DonorSheetProps) {
  const open = d !== null;
  return (
    <>
      <div className={`sheetov${open ? ' on' : ''}`} onClick={onClose} />
      <div className={`sheet${open ? ' open' : ''}`}>
        {d && <DonorSheetBody d={d} onClose={onClose} />}
      </div>
    </>
  );
}

function DonorSheetBody({ d, onClose }: { d: Donor; onClose: () => void }) {
  const n = daysSince(d.last);
  const sd = daysSince(d.tested);
  const stale = sd !== null && sd > 180;
  const age = d.dob ? Math.floor((Date.now() - new Date(d.dob).getTime()) / 31_557_600_000) : null;
  const waNumber = '92' + d.p.replace(/[^0-9]/g, '').replace(/^0/, '');

  return (
    <>
      <button className="cl" onClick={onClose}>✕</button>
      <div className="row" style={css('gap:10px;align-items:center')}>{bgTag(d.g)}<span className="mono2 sm">{d.mr || 'no MR number'}</span></div>
      <h2 style={css('margin:12px 0 4px')}>{d.n}</h2>
      <div className="sm">{d.c}{age ? ` · ${age} years` : ''}</div>

      {d.defer && (
        <div className="alert" style={css('margin:18px 0')}><div><b>Deferred — do not call.</b> {d.defer}</div></div>
      )}

      <div className="qlab" style={css('margin:22px 0 10px')}>Donor</div>
      <Row k="Blood group and RH" v={d.g.includes('−') ? `${d.g} (negative)` : `${d.g} (positive)`} />
      <Row k="Age" v={age ? `${age} years` : '—'} />
      <Row k="Date of birth" v={d.dob || '—'} />
      <Row k="Contact" v={d.p} />
      <Row k="Emergency contact" v={d.emg || '—'} />
      <Row k="Relationship" v={d.emgr || '—'} />
      <Row k="Address" v={d.addr || '—'} />

      <div className="qlab" style={css('margin:22px 0 10px')}>Donation</div>
      <Row k="Quantity given" v={`${d.ml} ml`} />
      <Row k="Willing to give" v={d.freq} />
      <Row k="Mode of issue" v={`${d.issue} — ${ISSUE[d.issue] ?? ''}`} />
      <Row k="Times donated" v={d.times} />
      <Row k="Last donated" v={d.last ? `${n} days ago` : 'Never'} />
      <Row k="Can give again" v={elig(d).why} />

      <div className="qlab" style={css('margin:22px 0 10px')}>Screening</div>
      {d.tests ? (
        <>
          <div className="testgrid">
            {TESTS.map(([k, l]) => {
              const val = d.tests![k as keyof typeof d.tests];
              return <div key={k} className={`testbox ${val === '-ve' ? 'ok' : 'no'}`}><b>{l}</b><span>{val}</span></div>;
            })}
          </div>
          <div className="drow" style={css('margin-top:12px')}><span>Tested</span><b>{d.tested || '—'}{sd !== null ? ` · ${sd} days ago` : ''}</b></div>
          {stale && <div className="ahint" style={css('margin-top:10px;border-color:#F0DFB4;background:var(--amb-t)')}>These results are more than six months old. Screen again before issuing.</div>}
        </>
      ) : (
        <div className="ahint">Never screened. This person cannot be called for a donation until HCV, HIV, HBs/IG, VDRL and MP have been done.</div>
      )}

      <div className="row" style={css('gap:9px;margin-top:22px')}>
        <a className="btn btn-p" style={css('flex:1')} href={`tel:${d.p.replace(/ /g, '')}`}>Call</a>
        <a className="btn btn-o" href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener">WhatsApp</a>
      </div>
      <div className="row" style={css('gap:9px;margin-top:9px')}>
        <button type="button" className="btn btn-o" style={css('flex:1')} onClick={() => showToast('Editing wires to the API')}>Edit details</button>
        <button type="button" className="btn btn-o" style={css('flex:1')} onClick={() => showToast('Recording a screening wires to the API')}>Record a screening</button>
      </div>
      <button type="button" className="btn btn-d" style={css('width:100%;margin-top:9px')} onClick={() => showToast(d.defer ? 'Lifting the deferral wires to the API' : 'Deferring this donor wires to the API')}>{d.defer ? 'Lift the deferral' : 'Defer this donor'}</button>
    </>
  );
}
