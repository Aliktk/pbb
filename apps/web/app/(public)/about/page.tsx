import Link from 'next/link';
import { ImageSlot } from '../../../components/ImageSlot';
import { css } from '../../../lib/style';

// About / story — ported from the prototype (pbb-pages.js PAGES.about).
// The prototype's era() and quiet() helpers are ported as local components below.

interface EraProps {
  y: string;
  kick?: string;
  title: string;
  body: React.ReactNode;
  figs: React.ReactNode;
  cls?: string;
}

function Era({ y, kick, title, body, figs, cls = '' }: EraProps) {
  return (
    <div className={`era ${cls}`}>
      <div className="wrap">
        <div className="era-in">
          <div className="yr">{kick ? <small>{kick}</small> : null}{y}</div>
          <div><h3>{title}</h3><p>{body}</p></div>
          <div className="fig">{figs}</div>
        </div>
      </div>
    </div>
  );
}

interface QuietProps {
  lab: string;
  rows: [string, string][];
}

function Quiet({ lab, rows }: QuietProps) {
  return (
    <div className="quiet">
      <div className="wrap">
        <div className="quiet-in">
          <div className="qlab">{lab}</div>
          <div className="yrs">
            {rows.map(([y, b]) => (
              <div key={y}><div className="y">{y}</div><div className="b">{b}</div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function About() {
  return (
    <>
      <header className="ph-hero">
        <div className="wrap" style={css('display:grid;grid-template-columns:1.15fr .85fr;gap:56px;align-items:end')} id="storyHero">
          <div>
            <span className="eyebrow"><b />Our story</span>
            <h1 style={css('margin:20px 0 18px')}>Twenty-seven years,<br />kept on the <em>record</em>.</h1>
            <p className="lead">Pashtoonkhwa Blood Bank and Welfare Society was inaugurated by the Chairman of Pashtoonkhwa Milli Awami Party, Mr. Mehmood Khan Achakzai, on 24th March 1999. It has served the people, irrespective of language, colour, religion, race and ethnicity, since its first day.</p>
            <div className="tl-meta"><div>Inaugurated<b>24 March 1999</b></div><div>Head office<b>Quetta</b></div><div>Branches<b>Six offices</b></div><div>Supervised by<b>Three members</b></div></div>
          </div>
          <ImageSlot ratio="4/3.4" placeholder="archive photograph<br>the inauguration, or the original premises" />
        </div>
      </header>

      <Era
        y="1999"
        kick="The beginning"
        title="Inaugurated beside the Quetta Press Club"
        body="Three members of an organising committee — Olus Yar, Mr. Faqir Khushal Khan Kasi and Dr. Hamid Khan Achakzai — began collecting and screening blood on an exchange basis. They have supervised it ever since."
        figs={<><div className="v">360</div><div className="k">bags in the first year</div><div className="v2">180,000 CCs</div></>}
      />
      <Quiet lab="Steady growth" rows={[['2000', '720 bags'], ['2001', '1,080'], ['2002', '1,440'], ['2003', '2,160'], ['2004', '2,747']]} />
      <Era
        y="2005"
        kick="Disaster response"
        title="Abbottabad earthquake"
        body="When the deadliest earthquake in the country’s history struck, PBB was among the most active blood banks supplying pure, tested blood to the victims through local organisations."
        figs={<><div className="v">3,118</div><div className="k">bags that year</div></>}
      />
      <Quiet lab="Expansion" rows={[['2006', '3,968 bags'], ['2007', '4,582']]} />
      <Era
        y="2008"
        kick="Disaster response"
        title="Ziarat earthquake — ambulances, doctors, volunteers"
        body="PBB’s ambulance service, doctors and volunteers provided emergency services to the people of Ziarat. The same teams have since responded to terror attacks, bomb blasts and target killings across Balochistan."
        figs={<><div className="v">5,905</div><div className="k">bags that year</div></>}
      />
      <Quiet lab="Consolidation" rows={[['2009', '5,920 bags'], ['2010', '6,937']]} />
      <Era
        y="2011"
        kick="Peak year"
        title="The busiest twelve months on record"
        body="Nearly ten thousand bags transfused in a single year, and the first year platelets and fresh frozen plasma were counted separately."
        figs={<><div className="v" style={css('color:var(--red)')}>9,484</div><div className="k">bags · 4,742,000 CCs</div><div className="v2">1,670 platelet + FFP</div></>}
      />
      <Era
        y="2012"
        kick="The network"
        title="Six towns, three ambulances"
        body="The network reached Loralai, Muslim Bagh, Pishin, Zhob and Chaman. Three ambulances began running twenty-four hours a day out of Quetta, with the rest of the branches to follow."
        figs={<><div className="v">5,120</div><div className="k">bags to June 2012</div><div className="v2">Published figures end here</div></>}
      />
      <Era
        y="Today"
        kick="Now"
        title="Two hundred children, fourteen towns, a new building"
        body="PBB transfuses 200 registered thalassemia children free of cost and without exchange, and vaccinates scavenger and garbage-picking children against Hepatitis B. The new Quetta premises are in their final stage of construction."
        figs={<><div className="v">200</div><div className="k">thalassemia children</div><div className="v2">14 towns served</div></>}
        cls="now"
      />
      <section className="blk">
        <div className="wrap">
          <div className="closer">
            <div><h2>The record continues.</h2><p>Funded entirely by members’ contributions, charity, Zakat, and cattle hides collected by volunteers each Eid ul Adha.</p></div>
            <Link href="/join/donor" className="btn btn-w">Register as a Donor</Link>
          </div>
        </div>
      </section>
    </>
  );
}
