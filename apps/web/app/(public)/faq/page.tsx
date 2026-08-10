'use client';

import { useState } from 'react';
import { css } from '../../../lib/style';

// FAQ — ported from PAGES.faq. Client component so the accordion actually opens (a static
// version would leave every answer permanently hidden — a dead control).
const FAQS: [string, string][] = [
  ['Who can give blood?', 'Anyone between 18 and 60, weighing at least 50 kg, in good health, and at least 90 days since their last donation. If you are unsure, come to a branch — the screening takes a few minutes.'],
  ['Does it cost anything?', 'No. Pashtoonkhwa Blood Bank has never sold blood and never purchased it. Blood is given on exchange — a relative or friend of the patient donates in return.'],
  ['What if nobody can donate in exchange?', 'In four cases there is no exchange requirement at all: thalassemia, pregnancy, emergencies and natural disasters. That has been the rule since 1999.'],
  ['Is the blood tested?', 'Every bag is screened by the ELISA method for Hepatitis B, Hepatitis C, HIV/AIDS and malarial parasite before it reaches a patient.'],
  ['Does giving blood make me weak?', 'No. Your body replaces the volume within a day and the cells within weeks. The 90-day gap exists precisely so that it does you no harm.'],
  ['Can women donate?', 'Yes, under the same conditions. Women who are pregnant, breastfeeding or menstruating are asked to wait.'],
  ['How often will you call me?', 'Rarely, and never more than twice in one day. The register calls whoever has gone longest without giving, so the same few people are not asked over and over.'],
  ['Can I say no?', 'Always, and without explanation. You stay on the register.'],
  ['Where does the money go?', 'Screening kits, blood bags, ambulance fuel and branch running costs. Funding comes from members, charity, Zakat, and cattle hides collected at Eid ul Adha.'],
  ['Do you serve my town?', 'Six towns have a permanent office and eight more are served from them. If yours is not listed, ask — or register your organisation and we will talk about a branch.'],
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <header className="ph-hero">
        <div className="wrap">
          <span className="eyebrow"><b />Questions</span>
          <h1>Things people ask us</h1>
          <p className="lead" style={css('margin-top:18px;max-width:62ch')}>
            If your question is not here, call 081-2836820 or send a message. Somebody answers at any hour.
          </p>
        </div>
      </header>
      <section className="blk" style={css('padding-top:0')}>
        <div className="wrap" style={css('max-width:840px')}>
          {FAQS.map(([q, a], i) => (
            <div
              key={q}
              className={`faq${open === i ? ' open' : ''}`}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <div className="fq"><span>{q}</span><i>+</i></div>
              <div className="fa"><p>{a}</p></div>
            </div>
          ))}
          <div className="closer" style={css('margin-top:36px')}>
            <div>
              <h2>Still unsure?</h2>
              <p>Come to the head office beside the Quetta Press Club, or phone us. No appointment needed.</p>
            </div>
            <a href="tel:0812836820" className="btn btn-w">081-2836820</a>
          </div>
        </div>
      </section>
    </>
  );
}
