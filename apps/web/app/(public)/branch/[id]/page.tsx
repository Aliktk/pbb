import { ImageSlot } from '../../../../components/ImageSlot';
import { css } from '../../../../lib/style';

// Branch detail — ported from the prototype (pbb-pages2.js PAGES['branch']). Renders the
// Quetta head-office detail (BRANCHES[0]). Data arrays mirror the source.
// Each stock group is a "group,class,label" string, split on render.
const STOCK: string[] = ['O−,cr,Critical', 'AB−,lo,Low', 'B−,lo,Low', 'A−,ok,Available', 'O+,ok,Available', 'A+,ok,Available', 'B+,ok,Available', 'AB+,ok,Available'];

const SERVING: string[] = ['Quetta city', 'Kuchlak', 'Qila Abdullah', 'Ziarat'];

export default function BranchPage() {
  return (
    <>
      <header className="ph-hero">
        <div className="wrap">
          <span className="eyebrow"><b />Branch</span>
          <h1>Quetta — head office</h1>
          <p className="lead" style={css('margin-top:18px;max-width:62ch')}>Zainab Chamber, Shara-e-Adalat, beside the Quetta Press Club. Open every day; blood requests answered at any hour.</p>
        </div>
      </header>
      <section className="blk" style={css('padding-top:0')}>
        <div className="wrap">
          <div className="g2" style={css('gap:34px;align-items:start')}>
            <div>
              <div className="card" style={css('margin-bottom:14px')}><h3 style={css('margin-bottom:12px')}>Contact</h3>
                <div className="drow"><span>Telephone</span><b><a href="tel:0812836820">081-2836820</a></b></div>
                <div className="drow"><span>Second line</span><b><a href="tel:0812839500">081-2839500</a></b></div>
                <div className="drow"><span>Email</span><b>admin@pashtoonkhwabloodbank.org</b></div>
                <div className="drow"><span>Ambulance</span><b>Three vehicles, 24 hours</b></div>
              </div>
              <div className="card"><h3 style={css('margin-bottom:12px')}>What we hold today</h3>
                <div className="groups">{STOCK.map((s) => {
                  const [g, c, l] = s.split(',');
                  return <div key={g} className={`grp ${c}`}><div className="g">{g}</div><div className="s">{l}</div></div>;
                })}</div>
              </div>
            </div>
            <div><ImageSlot ratio="4/3" placeholder="photograph of the branch" />
              <div className="card" style={css('margin-top:14px')}><h3 style={css('margin-bottom:10px')}>Serving</h3>
                {SERVING.map((t) => <span key={t} className="chip">{t}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
