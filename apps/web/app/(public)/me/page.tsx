import Link from 'next/link';
import { ActionButton } from '../../../components/ActionButton';
import { css } from '../../../lib/style';

// The donor's own record - ported from PAGES['me']. Design phase: fields/toggles are present
// and editable; Save/Record wire to PATCH /me/record + POST /me/donations later.
const CALL_PREFS: [string, boolean][] = [
  ['Any hour, for an emergency', true],
  ['Only between 8am and 9pm', false],
  ['By SMS as well as a telephone call', true],
  ['About camps and events near me', true],
  ['Never - take me off the calling list', false],
];

const MY_DONATIONS: [string, string, string][] = [
  ['12 Apr 2026', 'Quetta', 'Whole blood'],
  ['21 Nov 2025', 'Quetta', 'Whole blood'],
  ['03 Jun 2025', 'Pishin camp', 'Whole blood'],
  ['14 Jan 2025', 'Quetta', 'Platelets'],
];

export default function MeRecord() {
  return (
    <section className="blk">
      <div className="wrap">
        <div className="row" style={css('justify-content:space-between;align-items:flex-start;gap:18px;flex-wrap:wrap;margin-bottom:30px')}>
          <div>
            <h1 style={css('margin-bottom:6px')}>Abdul Samad Kakar</h1>
            <p className="lead">On the Quetta register since March 2019 · <b>O negative</b></p>
          </div>
          <Link href="/" className="btn btn-o">Sign out</Link>
        </div>

        <div className="mecards">
          <div className="card mestat ok">
            <div className="l">You can donate</div>
            <div className="n">Now</div>
            <div className="sm">Your last donation was 118 days ago. Ninety days is the minimum.</div>
            <Link href="/needs" className="btn btn-p btn-s" style={css('margin-top:14px')}>See who needs O− now</Link>
          </div>
          <div className="card mestat">
            <div className="l">You have given</div>
            <div className="n">14 times</div>
            <div className="sm">Roughly forty-two people have had some part of your blood since 2019.</div>
          </div>
          <div className="card mestat">
            <div className="l">Called on</div>
            <div className="n">6 times</div>
            <div className="sm">You answered five. O negative is asked for more often than any other group.</div>
          </div>
        </div>

        <div className="g2" style={css('gap:20px;align-items:start;margin-top:22px')}>
          <div>
            <div className="card">
              <h3 style={css('margin-bottom:6px')}>What we hold</h3>
              <p className="sm" style={css('margin-bottom:20px')}>Change anything here yourself. It takes effect at once.</p>
              <div className="fgrp"><label className="lb">Name</label><input className="fld" defaultValue="Abdul Samad Kakar" /></div>
              <div className="g2" style={css('gap:14px')}>
                <div className="fgrp"><label className="lb">Telephone</label><input className="fld" type="tel" defaultValue="0300 3815590" /></div>
                <div className="fgrp">
                  <label className="lb">Town</label>
                  <select className="fld" defaultValue="Quetta">
                    <option>Quetta</option><option>Pishin</option><option>Loralai</option><option>Zhob</option><option>Chaman</option>
                  </select>
                </div>
              </div>
              <div className="fgrp">
                <label className="lb">Blood group</label>
                <input className="fld" defaultValue="O negative (O−)" disabled style={css('opacity:.6')} />
                <div className="sm" style={css('margin-top:6px')}>
                  Only a branch can change this, and only after a fresh test. Telephone 081-2836820 if it is wrong.
                </div>
              </div>
              <ActionButton className="btn btn-p" style={css('width:100%')} message="Saved - writes to the register when the backend is wired">Save</ActionButton>
            </div>

            <div className="card" style={css('margin-top:20px')}>
              <h3 style={css('margin-bottom:6px')}>Donated somewhere else?</h3>
              <p className="sm" style={css('margin-bottom:16px')}>
                Tell us and we will stop calling you until you are eligible again. It costs you nothing and
                it stops a wasted telephone call at three in the morning.
              </p>
              <div className="g2" style={css('gap:14px')}>
                <div className="fgrp"><label className="lb">When</label><input className="fld" type="date" /></div>
                <div className="fgrp"><label className="lb">Where</label><input className="fld" placeholder="Hospital or blood bank" /></div>
              </div>
              <ActionButton className="btn btn-o" style={css('width:100%')} message="Recording a donation wires to the API">Record it</ActionButton>
            </div>
          </div>

          <div>
            <div className="card">
              <h3 style={css('margin-bottom:16px')}>When we may call you</h3>
              {CALL_PREFS.map(([label, on]) => (
                <label className="togrow" key={label}>
                  <span>{label}</span>
                  <input type="checkbox" defaultChecked={on} />
                  <i />
                </label>
              ))}
              <p className="sm" style={css('margin-top:14px')}>
                O negative can be given to anybody, so you are called more than most. Turning the first one
                off is understood - say so rather than letting the phone ring.
              </p>
            </div>

            <div className="card" style={css('margin-top:20px')}>
              <h3 style={css('margin-bottom:16px')}>Your donations</h3>
              {MY_DONATIONS.map(([d, w, k]) => (
                <div className="listrow" key={d}>
                  <div><b>{d}</b><span className="sm">{w} · {k}</span></div>
                  <span className="tag ok">Recorded</span>
                </div>
              ))}
              <ActionButton className="btn btn-o btn-s" style={css('width:100%;margin-top:16px')} message="Your full donation history arrives with the API">All fourteen</ActionButton>
            </div>

            <div className="card" style={css('margin-top:20px;border-color:#F0BDB6')}>
              <h3 style={css('margin-bottom:6px;color:var(--red-d)')}>Take me off the register</h3>
              <p className="sm">
                Your record is removed the same day and we will not ask you to justify it. Your past
                donations stay in the yearly totals as a number, without your name.
              </p>
              <Link href="/me/remove" className="btn btn-o" style={css('width:100%;margin-top:14px')}>Remove my record</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
