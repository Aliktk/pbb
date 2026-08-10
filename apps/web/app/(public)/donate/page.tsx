import Link from 'next/link';
import { css } from '../../../lib/style';
import { CopyButton } from '../../../components/CopyButton';
import { DonateForm } from '../../../components/DonateForm';

const BANK_ACCOUNTS: [string, string][] = [
  ['National Bank, City Branch, Jinnah Road, Quetta', '6359-6'],
  ['United Bank, Loralai', '2101-1'],
  ['National Bank, Pishin', '4589-93'],
  ['Bank Islami, Zhob', '1048-0088676-0001'],
];

// Donate - ported from PAGES.donate. Bank list + Eid hides are static; copy buttons and the
// form are client components.
export default function Donate() {
  return (
    <>
      <header className="ph-hero">
        <div className="wrap">
          <span className="eyebrow"><b />Donate</span>
          <h1>Keep the register running</h1>
          <p className="lead" style={css('margin-top:18px;max-width:62ch')}>
            Pashtoonkhwa Blood Bank has never purchased blood. It runs on members&apos; contributions,
            charity, Zakat, and cattle hides collected by volunteers each Eid ul Adha.
          </p>
        </div>
      </header>
      <section className="blk" style={css('padding-top:0')}>
        <div className="wrap">
          <div className="g2" style={css('gap:34px;align-items:start')}>
            <div>
              <h3 style={css('margin-bottom:14px')}>Bank transfer</h3>
              <div style={css('display:grid;gap:10px')}>
                {BANK_ACCOUNTS.map(([bank, acct]) => (
                  <div className="acct" key={acct}>
                    <div>
                      <div style={css('font-weight:700;font-size:14.5px')}>{bank}</div>
                      <div className="mono">{acct}</div>
                    </div>
                    <CopyButton value={acct} />
                  </div>
                ))}
              </div>
              <div className="notice" style={css('margin-top:20px')}>
                <b>After transferring,</b> send us the receipt using the form so it can be matched and
                receipted. Zakat-eligible donations are recorded separately.
              </div>
              <h3 style={css('margin:38px 0 14px')}>Eid ul Adha - cattle hides</h3>
              <p className="muted">
                Volunteers collect hides across every branch during the three days of Eid. A large
                share of the year&apos;s running cost comes from this collection alone.
              </p>
              <Link href="/contact" className="btn btn-o" style={css('margin-top:16px')}>Request a collection</Link>
            </div>
            <DonateForm />
          </div>
        </div>
      </section>
    </>
  );
}
