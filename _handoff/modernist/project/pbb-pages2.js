/* PBB — remaining public pages. */

/* ---------------- PUBLICATIONS ---------------- */
const PUBS=[['Eid ul Adha hide collection','Poster · Urdu','Appeal'],['Who can donate blood','Poster · Urdu, Pashto','Awareness'],['Thalassemia — what parents should know','Booklet · Urdu','Awareness'],['Annual report 2012','Report · English','Report'],['Hepatitis B vaccination drive','Poster · Urdu','Awareness'],['Blood camp — how to organise one','Guide · Urdu','Guide']];
PAGES.publications=()=>`
${hero('Publications','Posters, appeals and reports','Printed material from twenty-seven years of work. Everything here can be downloaded and printed for your own mosque, school or union council.')}
<section class="blk" style="padding-top:0"><div class="wrap">
<div class="row" style="gap:8px;margin-bottom:26px">${['All','Appeals','Awareness','Reports','Guides'].map((f,i)=>`<button class="pill${i?'':' on'}" onclick="galPick(this)">${f}</button>`).join('')}</div>
<div class="g3">${PUBS.map((p,i)=>`<div class="card" style="padding:0;overflow:hidden">
<div class="ph" style="aspect-ratio:16/11"><image-slot id="pub-${i+1}" shape="rect" placeholder="Drop the poster artwork"></image-slot></div>
<div style="padding:20px"><span class="tag gy">${p[2]}</span><h3 style="margin:12px 0 6px">${p[0]}</h3><p class="sm">${p[1]}</p>
<div class="row" style="gap:8px;margin-top:16px"><button class="btn btn-o btn-s">Download</button><button class="btn btn-o btn-s">Print</button></div></div></div>`).join('')}</div>
<div class="notice" style="margin-top:26px">Posters are shown at their real proportions, never cropped square — the Urdu and Pashto lettering <b>is</b> the artwork.</div>
</div></section>`;

/* ---------------- FAQ ---------------- */
const FAQS=[
['Who can give blood?','Anyone between 18 and 60, weighing at least 50 kg, in good health, and at least 90 days since their last donation. If you are unsure, come to a branch — the screening takes a few minutes.'],
['Does it cost anything?','No. Pashtoonkhwa Blood Bank has never sold blood and never purchased it. Blood is given on exchange — a relative or friend of the patient donates in return.'],
['What if nobody can donate in exchange?','In four cases there is no exchange requirement at all: thalassemia, pregnancy, emergencies and natural disasters. That has been the rule since 1999.'],
['Is the blood tested?','Every bag is screened by the ELISA method for Hepatitis B, Hepatitis C, HIV/AIDS and malarial parasite before it reaches a patient.'],
['Does giving blood make me weak?','No. Your body replaces the volume within a day and the cells within weeks. The 90-day gap exists precisely so that it does you no harm.'],
['Can women donate?','Yes, under the same conditions. Women who are pregnant, breastfeeding or menstruating are asked to wait.'],
['How often will you call me?','Rarely, and never more than twice in one day. The register calls whoever has gone longest without giving, so the same few people are not asked over and over.'],
['Can I say no?','Always, and without explanation. You stay on the register.'],
['Where does the money go?','Screening kits, blood bags, ambulance fuel and branch running costs. Funding comes from members, charity, Zakat, and cattle hides collected at Eid ul Adha.'],
['Do you serve my town?','Six towns have a permanent office and eight more are served from them. If yours is not listed, ask — or register your organisation and we will talk about a branch.']];
PAGES.faq=()=>`
${hero('Questions','Things people ask us','If your question is not here, call 081-2836820 or send a message. Somebody answers at any hour.')}
<section class="blk" style="padding-top:0"><div class="wrap" style="max-width:840px">
${FAQS.map((f,i)=>`<div class="faq" onclick="this.classList.toggle('open')"><div class="fq"><span>${f[0]}</span><i>+</i></div><div class="fa"><p>${f[1]}</p></div></div>`).join('')}
<div class="closer" style="margin-top:36px"><div><h2>Still unsure?</h2><p>Come to the head office beside the Quetta Press Club, or phone us. No appointment needed.</p></div><a href="tel:0812836820" class="btn btn-w">081-2836820</a></div>
</div></section>`;

/* ---------------- PARTNER / LAB / FOUNDATION ---------------- */
const PARTNERKINDS=[
['Hospitals','Refer patients, get a named coordinator at the nearest branch, and a direct line for emergencies. Your requests go straight onto the branch board instead of through a switchboard.','M12 4v16m8-8H4'],
['Laboratories','Share screening capacity, or take our overflow. Results are recorded against the bag, so a unit can be traced from donor to patient.','M9 2v7L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3L15 9V2M9 2h6M8 15h8'],
['Foundations and donors','Fund screening kits, an ambulance, or a year of transfusions for a named child. You receive the figures, not a thank-you letter.','M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z'],
['Welfare societies','Run a camp under our name, collect hides at Eid, or open a branch in a town that has none. Eight towns are served today without an office.','M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'],
['Universities and colleges','Two-day drives on campus register more first-time donors than anything else we do. We bring the staff and the equipment.','M22 10 12 5 2 10l10 5 10-5ZM6 12v5c3 3 9 3 12 0v-5'],
['Other blood banks','Nobody can see anyone else\u2019s shelf. If your bank keeps a register too, we would rather share a shortage than discard a bag.','M8 7h8M8 12h8M8 17h5M4 3h16v18H4z']];
PAGES.partners=()=>`
${hero('Work with us','Six ways an organisation<br>can be useful','A blood bank that only talks to individuals stays small. Most of what PBB can do next depends on institutions.')}
<section class="blk" style="padding-top:0"><div class="wrap">
<div class="g3">${PARTNERKINDS.map(k=>`<div class="pil"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${k[2]}"/></svg></div><h3>${k[0]}</h3><p>${k[1]}</p></div>`).join('')}</div>
<div class="g2" style="gap:20px;margin-top:34px">
<div class="card"><div class="qlab" style="margin-bottom:12px">What you get</div>
${['A named coordinator at your nearest branch','A direct line, not a switchboard','Your requests on the branch board within seconds','Quarterly figures on what was supplied and to whom','Your logo on the supporters page'].map(x=>`<div class="tick-row"><span>✓</span>${x}</div>`).join('')}</div>
<div class="card"><div class="qlab" style="margin-bottom:12px">What we ask</div>
${['One person we can reach','Honest numbers on what you need','Notice before a planned requirement, where possible','No selling of blood, ever, under any arrangement'].map(x=>`<div class="tick-row"><span>✓</span>${x}</div>`).join('')}</div>
</div>
<div class="closer" style="margin-top:34px"><div><h2>Start the conversation</h2><p>Tell us what kind of organisation you are and what you are hoping to do. The head office replies within a few days.</p></div><a href="#/join/partner" class="btn btn-w">Register your organisation</a></div>
</div></section>`;

/* ---------------- BRANCH DETAIL ---------------- */
PAGES['branch']=()=>{
 const b=BRANCHES[0];
 return `${hero('Branch','Quetta — head office','Zainab Chamber, Shara-e-Adalat, beside the Quetta Press Club. Open every day; blood requests answered at any hour.')}
 <section class="blk" style="padding-top:0"><div class="wrap"><div class="g2" style="gap:34px;align-items:start">
 <div>
 <div class="card" style="margin-bottom:14px"><h3 style="margin-bottom:12px">Contact</h3>
 <div class="drow"><span>Telephone</span><b><a href="tel:0812836820">081-2836820</a></b></div>
 <div class="drow"><span>Second line</span><b><a href="tel:0812839500">081-2839500</a></b></div>
 <div class="drow"><span>Email</span><b>admin@pashtoonkhwabloodbank.org</b></div>
 <div class="drow"><span>Ambulance</span><b>Three vehicles, 24 hours</b></div></div>
 <div class="card"><h3 style="margin-bottom:12px">What we hold today</h3>
 <div class="groups">${['O−,cr,Critical','AB−,lo,Low','B−,lo,Low','A−,ok,Available','O+,ok,Available','A+,ok,Available','B+,ok,Available','AB+,ok,Available'].map(s=>{const[g,c,l]=s.split(',');return `<div class="grp ${c}"><div class="g">${g}</div><div class="s">${l}</div></div>`}).join('')}</div></div>
 </div>
 <div>${slot('photograph of the branch','4/3')}
 <div class="card" style="margin-top:14px"><h3 style="margin-bottom:10px">Serving</h3>
 ${['Quetta city','Kuchlak','Qila Abdullah','Ziarat'].map(t=>`<span class="chip">${t}</span>`).join('')}</div></div>
 </div></div></section>`;
};

/* ---------------- LEGAL + 404 ---------------- */
const legal=(t,body)=>`${hero('',t)}<section class="blk" style="padding-top:0"><div class="wrap" style="max-width:760px">${body.map(([h2,p])=>`<h3 style="margin:26px 0 10px">${h2}</h3><p class="muted" style="font-size:15.5px;line-height:1.7">${p}</p>`).join('')}</div></section>`;
PAGES.privacy=()=>legal('Privacy',[
['What we hold','Your name, blood group, telephone number and town. If you tell us, your date of birth, weight and the date you last donated. Nothing else.'],
['Why we hold it','So that when a patient near you needs your blood group, somebody can telephone you. That is the only purpose.'],
['Who sees it','Staff at your own branch, and the head office in Quetta. Branch staff cannot see another town\u2019s register. Nobody outside Pashtoonkhwa Blood Bank is given your number.'],
['We never sell it','Your details are not sold, rented, shared with political parties, or used for anything other than blood.'],
['Removing yourself','Telephone any branch and ask. Your record is removed the same day, and we will not ask you to justify it.'],
['Photographs','Photographs of patients and of thalassemia children appear on this website only where a signed consent form is held by the head office.']]);
PAGES.terms=()=>legal('Terms',[
['Blood is not sold','Pashtoonkhwa Blood Bank has never purchased or sold blood and will not. Blood is provided on exchange, and free without exchange in cases of thalassemia, pregnancy, emergency and natural disaster.'],
['This website is not a medical service','A request submitted here is a message to a coordinator, not a guarantee that blood is available. In an emergency, telephone 081-2836820.'],
['Accuracy','We ask donors to answer the health questions honestly. A wrong answer puts a patient at risk.'],
['Registration','Being on the register places no obligation on you. You may decline any request, at any time, without explanation.']]);
PAGES['404']=()=>`<section class="blk" style="padding:90px 0"><div class="wrap" style="max-width:620px;text-align:center">
<div class="bignum" style="font-size:76px;color:var(--red)">404</div>
<h1 style="margin:18px 0 14px">That page is not here</h1>
<p class="lead" style="margin-bottom:28px">It may have moved. If you were looking for something on the old website, it is probably one of these.</p>
<div class="row" style="justify-content:center;gap:10px"><a href="#/" class="btn btn-p">Home</a><a href="#/branches" class="btn btn-o">Our branches</a><a href="#/join/requester" class="btn btn-o">Request blood</a><a href="#/contact" class="btn btn-o">Contact</a></div>
</div></section>`;
