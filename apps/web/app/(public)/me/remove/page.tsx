import Link from 'next/link';
import { ActionButton } from '../../../../components/ActionButton';
import { css } from '../../../../lib/style';

// Same-day removal confirmation — ported from PAGES['me/remove']. Constraint #4: removed the
// same day, no reason required. Wires to DELETE /me/record later.
const CONSEQUENCES: [string, string][] = [
  ['Your name, telephone number and address are deleted today.', 'Not hidden or archived — deleted.'],
  ['We stop calling you.', 'Nobody at any branch can look you up again.'],
  ['Your fourteen donations stay as a number.', 'They count towards the yearly total. Your name is not attached to them.'],
  ['You can come back whenever you like.', 'Walk into any branch. You will be starting a new record.'],
];

export default function MeRemove() {
  return (
    <section className="blk">
      <div className="wrap" style={css('max-width:760px')}>
        <Link href="/me" className="backlink">← Back to my record</Link>
        <h1 style={css('margin:14px 0 10px')}>Take yourself off the register</h1>
        <p className="lead" style={css('margin-bottom:30px')}>You do not owe us a reason. Read what happens, then confirm.</p>
        <div className="card" style={css('max-width:560px')}>
          {CONSEQUENCES.map(([a, b]) => (
            <div className="listrow" key={a}>
              <div><b>{a}</b><span className="sm">{b}</span></div>
            </div>
          ))}
          <div className="fgrp" style={css('margin-top:20px')}>
            <label className="lb">If you would like to tell us why (you need not)</label>
            <textarea className="fld" rows={3} placeholder="Optional" />
          </div>
          <ActionButton className="btn btn-d" style={css('width:100%')} message="Removal wires to the API — your record is deleted the same day">Remove my record</ActionButton>
          <Link href="/me" className="btn btn-o" style={css('width:100%;margin-top:10px')}>Keep my record</Link>
        </div>
      </div>
    </section>
  );
}
