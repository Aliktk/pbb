import Link from 'next/link';
import { ImageSlot } from '../../../../components/ImageSlot';
import { css } from '../../../../lib/style';
import { IMG } from '../../../../lib/images';
import { FALLBACK_OFFICES, type Office } from '../../../../lib/offices';

// Branch detail. Renders strictly from the matched branch in the shared FALLBACK_OFFICES list
// (the same list the /branches page uses), looked up by the [id] route param. Only Quetta and
// Chaman carry confirmed contact details; any field a branch does not have is simply omitted, and
// an unknown branch id shows a "coming soon" state rather than another branch's data.

function findOffice(id: string): Office | undefined {
  const key = id.toLowerCase();
  return FALLBACK_OFFICES.find((o) => o.id.toLowerCase() === key);
}

export default async function BranchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const office = findOffice(id);

  if (!office) {
    return (
      <header className="ph-hero">
        <div className="wrap">
          <span className="eyebrow"><b />Branch</span>
          <h1>Branch not found</h1>
          <p className="lead" style={css('margin-top:18px;max-width:62ch')}>
            We could not find this branch. See the full list of our offices instead.
          </p>
          <p style={css('margin-top:18px')}><Link className="btn btn-o btn-s" href="/branches">All branches</Link></p>
        </div>
      </header>
    );
  }

  const hasContact = Boolean(office.address) || office.phones.length > 0 || Boolean(office.email);

  return (
    <>
      <header className="ph-hero">
        <div className="wrap">
          <span className="eyebrow"><b />Branch</span>
          <h1>{office.name}{office.isHeadOffice ? ' - head office' : ''}</h1>
          {office.address ? (
            <p className="lead" style={css('margin-top:18px;max-width:62ch')}>{office.address}</p>
          ) : null}
        </div>
      </header>
      <section className="blk" style={css('padding-top:0')}>
        <div className="wrap">
          <div className="g2" style={css('gap:34px;align-items:start')}>
            <div>
              {hasContact ? (
                <div className="card" style={css('margin-bottom:14px')}><h3 style={css('margin-bottom:12px')}>Contact</h3>
                  {office.address ? (
                    <div className="drow"><span>Address</span><b>{office.address}</b></div>
                  ) : null}
                  {office.phones.map((t, i) => (
                    <div key={t} className="drow"><span>{i === 0 ? 'Telephone' : 'Second line'}</span><b><a href={`tel:${t.replace(/-/g, '')}`}>{t}</a></b></div>
                  ))}
                  {office.email ? (
                    <div className="drow"><span>Email</span><b><a href={`mailto:${office.email}`}>{office.email}</a></b></div>
                  ) : null}
                  {office.bank ? (
                    <div className="drow"><span>Bank</span><b>{office.bank}</b></div>
                  ) : null}
                  {office.hasAmbulance ? (
                    <div className="drow"><span>Ambulance</span><b>24-hour service</b></div>
                  ) : null}
                </div>
              ) : (
                <div className="card" style={css('margin-bottom:14px')}><h3 style={css('margin-bottom:12px')}>Contact</h3>
                  <p className="muted">Full contact details coming soon. In the meantime, reach the head office on <a href="tel:0812836820">081-2836820</a>.</p>
                </div>
              )}
            </div>
            <div><ImageSlot ratio="4/3" src={IMG.building} placeholder="photograph of the branch" />
              <div className="card" style={css('margin-top:14px')}>
                <p className="muted"><Link href="/branches">← Back to all branches</Link></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
