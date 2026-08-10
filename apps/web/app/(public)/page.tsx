import Link from 'next/link';
import { ImageSlot } from '../../components/ImageSlot';
import { css } from '../../lib/style';

// Home — ported from the prototype (pbb-app.js PAGES['']). Data arrays mirror the source.
const STOCK: [string, string, string][] = [
  ['O−', 'cr', 'Critical'], ['AB−', 'lo', 'Low'], ['B−', 'lo', 'Low'], ['A−', 'ok', 'Available'],
  ['O+', 'ok', 'Available'], ['A+', 'ok', 'Available'], ['B+', 'ok', 'Available'], ['AB+', 'ok', 'Available'],
];

const PILLARS: [string, string, string][] = [
  ['Screened blood', 'Tested by ELISA for Hepatitis B, Hepatitis C, HIV/AIDS and MP before it reaches a patient.', 'M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z'],
  ['Thalassemia care', '200 registered children transfused regularly, free of cost and without exchange.', 'M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8Z'],
  ['Ambulance service', 'Three vehicles in Quetta, running twenty-four hours a day for anyone who needs them.', 'M3 17V7a1 1 0 0 1 1-1h9v11M13 10h4l4 4v3h-3M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z'],
  ['Disaster response', 'Abbottabad 2005, Ziarat 2008, and every bomb blast and emergency since.', 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z'],
];

const CHART: [number, number, number][] = [
  [1999, 360, 12], [2000, 720, 18], [2001, 1080, 24], [2002, 1440, 30], [2003, 2160, 40],
  [2004, 2747, 48], [2005, 3118, 54], [2006, 3968, 64], [2007, 4582, 72], [2008, 5905, 88],
  [2009, 5920, 89], [2010, 6937, 96], [2011, 9484, 100], [2012, 5120, 55],
];

const HOME_NEWS: [string, string, string, string, string][] = [
  ['Blood camp', '12 September', 'Free donation camp, Pishin', 'Band Road branch, 9am to 4pm. Walk in or register to attend.', 'no'],
  ['Notice', '3 September', 'New building — final stage', 'Construction of the new Quetta premises has entered its last phase.', 'gy'],
  ['Appeal', 'Runs to 20 June', 'Eid ul Adha hide collection', 'Volunteers collect cattle hides across all branches.', 'ok'],
];

export default function Home() {
  return (
    <>
      <header className="hero">
        <div className="wrap">
          <div className="hero-g">
            <div>
              <span className="eyebrow"><b />Serving Balochistan since 24 March 1999</span>
              <h1>Blood is life.<br />We keep the <em>record</em>.</h1>
              <p className="lead">
                Screened, tested blood for anyone who needs it — irrespective of language, colour,
                religion, race or ethnicity. Free and without exchange for thalassemia children,
                mothers, emergencies and disasters.
              </p>
              <div className="row" style={css('margin-top:28px')}>
                <Link href="/join/requester" className="btn btn-p">Request Blood</Link>
                <Link href="/join/donor" className="btn btn-d">Register as a Donor</Link>
              </div>
              <div className="stats">
                <div><div className="n r">64,000+</div><div className="c">bags donated since 1999</div></div>
                <div><div className="n">200</div><div className="c">thalassemia children</div></div>
                <div><div className="n">14</div><div className="c">towns served</div></div>
                <div><div className="n">3</div><div className="c">ambulances, 24 hours</div></div>
              </div>
            </div>
            <ImageSlot ratio="4/4.4" style="border-radius:var(--rl)" placeholder="Drop the hero photograph — a donor at the bench, or a PBB ambulance" />
          </div>
        </div>
      </header>

      <div className="wrap" style={css('margin-top:22px')}>
        <div className="stock">
          <div className="stock-h">
            <h3 style={css('margin-right:auto')}>What we are short of today</h3>
            <span className="live"><b />Live · Quetta · updated 2 hours ago</span>
          </div>
          <div className="groups">
            {STOCK.map(([g, c, s]) => (
              <div key={g} className={`grp ${c}`}><div className="g">{g}</div><div className="s">{s}</div></div>
            ))}
          </div>
          <p style={css('font-size:14.5px;color:var(--ink-2);margin-top:16px')}>
            If your group shows red, a single donation today goes straight to a patient waiting.{' '}
            <Link href="/join/donor" style={css('font-weight:700')}>Register as a donor →</Link>
          </p>
        </div>
      </div>

      <section className="blk">
        <div className="wrap">
          <div style={css('max-width:660px;margin-bottom:40px')}>
            <div className="qlab" style={css('margin-bottom:12px')}>What we do</div>
            <h2>Four things, done since 1999</h2>
            <p className="lead" style={css('margin-top:13px')}>
              Blood is never purchased. The only source is exchange from relatives of the patient and registered members.
            </p>
          </div>
          <div className="g4">
            {PILLARS.map(([t, b, d]) => (
              <div key={t} className="pil">
                <div className="ic"><svg viewBox="0 0 24 24"><path d={d} /></svg></div>
                <h3>{t}</h3>
                <p>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="blk" style={css('background:var(--surf);border-block:1px solid var(--line)')}>
        <div className="wrap">
          <div style={css('max-width:660px;margin-bottom:36px')}>
            <div className="qlab" style={css('margin-bottom:12px')}>The record</div>
            <h2>Twenty-seven years, counted</h2>
            <p className="lead" style={css('margin-top:13px')}>
              Every bag transfused since the first year of operation. Figures published to June 2012; later years are being entered.
            </p>
          </div>
          <div className="chart">
            {CHART.map(([y, b, h]) => (
              <div key={y} className={`bar${y === 2011 ? ' pk' : ''}`} style={{ height: `${h}%` }}>
                <span>{y} · {b.toLocaleString()} bags</span>
              </div>
            ))}
          </div>
          <div className="axis"><span>1999</span><span>2011 — peak year</span><span>June 2012</span></div>
        </div>
      </section>

      <section className="blk">
        <div className="wrap">
          <div className="g2" style={css('gap:34px;align-items:center')}>
            <div>
              <div className="qlab" style={css('margin-bottom:12px')}>Where we are</div>
              <h2 style={css('margin-bottom:16px')}>Six offices.<br />Fourteen towns.</h2>
              <p className="lead" style={css('margin-bottom:24px')}>
                From the head office beside the Quetta Press Club out to Zhob, Chaman and Loralai —
                and to the towns in between that have no blood bank of their own.
              </p>
              <Link href="/branches" className="btn btn-o">See every branch</Link>
            </div>
            <ImageSlot ratio="4/3" style="border-radius:var(--rl)" placeholder="Drop a map of Balochistan showing the six branches" />
          </div>
        </div>
      </section>

      <section className="blk" style={css('padding-top:0')}>
        <div className="wrap">
          <div className="row" style={css('margin-bottom:32px')}>
            <div>
              <div className="qlab" style={css('margin-bottom:10px')}>Announcements &amp; events</div>
              <h2>What is happening now</h2>
            </div>
            <Link href="/news" className="btn btn-o btn-s" style={css('margin-left:auto')}>All announcements</Link>
          </div>
          <div className="g3">
            {HOME_NEWS.map(([k, d, t, b, c]) => (
              <div key={t} className="card" style={css('padding:0;overflow:hidden')}>
                <ImageSlot ratio="16/9" style="border-radius:0" placeholder="Drop a cover photo" />
                <div style={css('padding:22px')}>
                  <div className="row" style={css('gap:9px')}>
                    <span className={`tag ${c}`}>{k}</span>
                    <span style={css('font-size:13px;color:var(--mid);font-weight:600')}>{d}</span>
                  </div>
                  <h3 style={css('margin:12px 0 8px')}>{t}</h3>
                  <p className="muted" style={css('font-size:14px')}>{b}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="blk" style={css('padding-top:0')}>
        <div className="wrap">
          <div className="probteaser">
            <div>
              <div className="qlab" style={css('margin-bottom:12px')}>The problem</div>
              <h2 style={css('margin-bottom:14px')}>Blood exists. It just<br />does not reach people in time.</h2>
              <p className="lead" style={css('max-width:54ch')}>
                No national register, almost no voluntary donors, bags expiring in one town while a
                patient waits in the next. Twelve gaps — and what we do about them.
              </p>
              <Link href="/problem" className="btn btn-d" style={css('margin-top:22px')}>Read the twelve gaps</Link>
            </div>
            <div className="probnums">
              {([['0', 'national blood group databases'], ['200', 'children depending on us alone'], ['1999', 'the year we started counting']] as [string, string][]).map(([n, l]) => (
                <div key={l}><div className="pn">{n}</div><div className="pl">{l}</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="closer">
          <div>
            <h2>Donate blood. Save a life.</h2>
            <p>It takes fifteen minutes, and for two hundred children in Balochistan it is the difference between a normal month and a hospital one.</p>
          </div>
          <Link href="/join" className="btn btn-w">Get involved</Link>
        </div>
      </div>
    </>
  );
}
