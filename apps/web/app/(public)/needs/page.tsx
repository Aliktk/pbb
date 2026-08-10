import Link from 'next/link';
import { css } from '../../../lib/style';
import { BLOOD_GROUPS } from '../../../lib/nav';

// Who needs blood now — a public board of OPEN blood requests. New page, built to the same
// design system as the ported pages. Privacy is CRITICAL: NO patient names, NO phone numbers.
type Urgency = 'critical' | 'urgent' | 'routine';

interface BloodRequest {
  group: string;
  town: string;
  units: number;
  urgency: Urgency;
  hospital: string;
  when: string;
}

// Sample board — no names, no numbers. Hospital name and town are public.
const REQUESTS: BloodRequest[] = [
  { group: 'O−', town: 'Quetta', units: 3, urgency: 'critical', hospital: 'Bolan Medical Complex', when: '20 minutes ago' },
  { group: 'B−', town: 'Pishin', units: 2, urgency: 'urgent', hospital: 'District Headquarters Hospital', when: '1 hour ago' },
  { group: 'A+', town: 'Loralai', units: 4, urgency: 'routine', hospital: 'Civil Hospital Loralai', when: '3 hours ago' },
  { group: 'AB−', town: 'Zhob', units: 1, urgency: 'critical', hospital: 'DHQ Teaching Hospital Zhob', when: '5 hours ago' },
  { group: 'O+', town: 'Chaman', units: 2, urgency: 'urgent', hospital: 'THQ Hospital Chaman', when: 'Today, 8am' },
];

// Urgency → tag class + label, matching the admin board conventions (no/wt/gy).
const URGENCY_TAG: Record<Urgency, [string, string]> = {
  critical: ['no', 'Critical'],
  urgent: ['wt', 'Urgent'],
  routine: ['gy', 'Routine'],
};

export default function Needs() {
  return (
    <>
      <header className="ph-hero">
        <div className="wrap">
          <span className="eyebrow"><b />Who needs blood now</span>
          <h1>Every open request,<br />no names</h1>
          <p className="lead" style={css('margin-top:18px;max-width:62ch')}>These are live requests from across the network. We never publish a patient&apos;s name or number. If you can give one of these groups, register or call 081-2836820.</p>
        </div>
      </header>

      <section className="blk" style={css('padding-top:0')}>
        <div className="wrap">
          <div className="row" style={css('gap:8px;margin-bottom:26px')}>
            <button className="pill on">All</button>
            {BLOOD_GROUPS.map((g) => (
              <button key={g} className="pill">{g}</button>
            ))}
          </div>

          {REQUESTS.length ? (
            <div className="g3">
              {REQUESTS.map((r, i) => {
                const [tagClass, tagLabel] = URGENCY_TAG[r.urgency];
                return (
                  <div key={`${r.group}-${r.town}-${i}`} className={`card needcard${r.urgency === 'critical' ? ' crit' : ''}`}>
                    <div className="row" style={css('justify-content:space-between;align-items:center;margin-bottom:14px')}>
                      <div className="needg">{r.group}</div>
                      <span className={`tag ${tagClass}`}>{tagLabel}</span>
                    </div>
                    <h3 style={css('margin:0 0 4px')}>{r.hospital}</h3>
                    <p className="muted" style={css('font-size:14px;margin-bottom:14px')}>{r.town}</p>
                    <div className="row" style={css('gap:16px;margin-bottom:16px')}>
                      <span style={css('font-size:14px;font-weight:700')}>{r.units} {r.units === 1 ? 'unit' : 'units'} needed</span>
                      <span className="sm" style={css('margin-left:auto')}>{r.when}</span>
                    </div>
                    <Link href="/join/donor" className="btn btn-p btn-s">Register as a donor</Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card" style={css('text-align:center')}>
              <p className="muted" style={css('font-size:15.5px')}>No open requests right now — thank you.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
