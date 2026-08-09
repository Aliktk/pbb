/* PBB website — page templates. Rendered into #page by the router in the shell. */
const TOWNS=window.PBBTOWNS;
const GROUPS=['O+','O−','A+','A−','B+','B−','AB+','AB−'];
const BRANCHES=[
{n:'Quetta',head:1,a:'Zainab Chamber, Shara-e-Adalat, near Quetta Press Club',t:['081-2836820','081-2839500'],amb:1},
{n:'Loralai',a:'Sayed Abdul Qadir Road',t:['0824-662066'],bank:'UBL Loralai · A/C 2101-1'},
{n:'Pishin',a:'Band Road',t:['0826-421288'],bank:'NBP Pishin · A/C 4589-93'},
{n:'Zhob',a:'Sharbat Khan Road',t:['0822-413902'],bank:'Bank Islami Zhob · A/C 1048-0088676-0001'},
{n:'Chaman',a:'Taj Road',t:[]},
{n:'Muslim Bagh',a:'Aryan Market, Muslim Bagh Bazar',t:[]}];
const YEARS=[[1999,360],[2000,720],[2001,1080],[2002,1440],[2003,2160],[2004,2747],[2005,3118],[2006,3968],[2007,4582],[2008,5905],[2009,5920],[2010,6937],[2011,9484],[2012,5120]];

const hero=(eyebrow,title,lead)=>`<header class="ph-hero"><div class="wrap">
<span class="eyebrow"><b></b>${eyebrow}</span><h1>${title}</h1>${lead?`<p class="lead" style="margin-top:18px;max-width:62ch">${lead}</p>`:''}
</div></header>`;
window._sid=0;
const slot=(txt,ar='16/9',st='')=>`<div class="ph" style="aspect-ratio:${ar};${st}"><image-slot id="s${++window._sid}-${location.hash.replace(/\W/g,'')||'home'}" shape="rect" placeholder="${txt.replace(/<[^>]+>/g,' ').replace(/"/g,'')}"></image-slot></div>`;
const bgBtns=(name)=>GROUPS.map(g=>`<button type="button" class="bgp" data-g="${g}" onclick="pickG(this,'${name}')">${g}</button>`).join('');

/* ---------------- ABOUT / STORY ---------------- */
const era=(y,kick,title,body,figs,cls='')=>`<div class="era ${cls}"><div class="wrap"><div class="era-in">
<div class="yr">${kick?`<small>${kick}</small>`:''}${y}</div>
<div><h3>${title}</h3><p>${body}</p></div><div class="fig">${figs}</div></div></div></div>`;
const quiet=(lab,rows)=>`<div class="quiet"><div class="wrap"><div class="quiet-in"><div class="qlab">${lab}</div><div class="yrs">${rows.map(([y,b])=>`<div><div class="y">${y}</div><div class="b">${b}</div></div>`).join('')}</div></div></div></div>`;

PAGES.about=()=>`
<header class="ph-hero"><div class="wrap" style="display:grid;grid-template-columns:1.15fr .85fr;gap:56px;align-items:end" id="storyHero">
<div><span class="eyebrow"><b></b>Our story</span>
<h1 style="margin:20px 0 18px">Twenty-seven years,<br>kept on the <em>record</em>.</h1>
<p class="lead">Pashtoonkhwa Blood Bank and Welfare Society was inaugurated by the Chairman of Pashtoonkhwa Milli Awami Party, Mr. Mehmood Khan Achakzai, on 24th March 1999. It has served the people, irrespective of language, colour, religion, race and ethnicity, since its first day.</p>
<div class="tl-meta"><div>Inaugurated<b>24 March 1999</b></div><div>Head office<b>Quetta</b></div><div>Branches<b>Six offices</b></div><div>Supervised by<b>Three members</b></div></div></div>
${slot('archive photograph<br>the inauguration, or the original premises','4/3.4')}
</div></header>
${era('1999','The beginning','Inaugurated beside the Quetta Press Club','Three members of an organising committee — Olus Yar, Mr. Faqir Khushal Khan Kasi and Dr. Hamid Khan Achakzai — began collecting and screening blood on an exchange basis. They have supervised it ever since.','<div class="v">360</div><div class="k">bags in the first year</div><div class="v2">180,000 CCs</div>')}
${quiet('Steady growth',[['2000','720 bags'],['2001','1,080'],['2002','1,440'],['2003','2,160'],['2004','2,747']])}
${era('2005','Disaster response','Abbottabad earthquake','When the deadliest earthquake in the country\u2019s history struck, PBB was among the most active blood banks supplying pure, tested blood to the victims through local organisations.','<div class="v">3,118</div><div class="k">bags that year</div>')}
${quiet('Expansion',[['2006','3,968 bags'],['2007','4,582']])}
${era('2008','Disaster response','Ziarat earthquake — ambulances, doctors, volunteers','PBB\u2019s ambulance service, doctors and volunteers provided emergency services to the people of Ziarat. The same teams have since responded to terror attacks, bomb blasts and target killings across Balochistan.','<div class="v">5,905</div><div class="k">bags that year</div>')}
${quiet('Consolidation',[['2009','5,920 bags'],['2010','6,937']])}
${era('2011','Peak year','The busiest twelve months on record','Nearly ten thousand bags transfused in a single year, and the first year platelets and fresh frozen plasma were counted separately.','<div class="v" style="color:var(--red)">9,484</div><div class="k">bags · 4,742,000 CCs</div><div class="v2">1,670 platelet + FFP</div>')}
${era('2012','The network','Six towns, three ambulances','The network reached Loralai, Muslim Bagh, Pishin, Zhob and Chaman. Three ambulances began running twenty-four hours a day out of Quetta, with the rest of the branches to follow.','<div class="v">5,120</div><div class="k">bags to June 2012</div><div class="v2">Published figures end here</div>')}
${era('Today','Now','Two hundred children, fourteen towns, a new building','PBB transfuses 200 registered thalassemia children free of cost and without exchange, and vaccinates scavenger and garbage-picking children against Hepatitis B. The new Quetta premises are in their final stage of construction.','<div class="v">200</div><div class="k">thalassemia children</div><div class="v2">14 towns served</div>','now')}
<section class="blk"><div class="wrap"><div class="closer">
<div><h2>The record continues.</h2><p>Funded entirely by members\u2019 contributions, charity, Zakat, and cattle hides collected by volunteers each Eid ul Adha.</p></div>
<a href="#/register-donor" class="btn btn-w">Register as a Donor</a></div></div></section>`;

/* ---------------- SERVICES ---------------- */
PAGES.services=()=>`
${hero('Services','What we provide','Blood is never purchased. The only source is exchange from relatives of the patient and from registered members.')}
<section class="blk" style="padding-top:0"><div class="wrap">
<div class="g2" style="gap:20px">
<div class="card"><span class="tag gy">On exchange</span><h3 style="margin:14px 0 10px">Screened blood for any patient</h3><p class="muted">Every bag is tested before it reaches a patient. A relative or a registered member gives in exchange.</p>
<div class="row" style="margin-top:16px;gap:7px">${['Hepatitis B','Hepatitis C','HIV/AIDS','MP','ELISA method'].map(x=>`<span class="chip">${x}</span>`).join('')}</div></div>
<div class="card" style="border-color:#CBE6D5;background:var(--grn-t)"><span class="tag ok">Free · no exchange</span><h3 style="margin:14px 0 10px">Thalassemia, pregnancy, emergency, disaster</h3><p class="muted">In these four cases blood is provided free of cost and without any exchange requirement. This has been the rule since 1999.</p></div>
</div>
<div class="g3" style="margin-top:20px">
${[['Ambulance service','Three vehicles running out of Quetta, twenty-four hours a day, for anyone who needs them. The remaining branches follow.'],
['Hepatitis B vaccination','Scavenger and garbage-picking children are vaccinated against Hepatitis B at no cost.'],
['Disaster response','Abbottabad 2005, Ziarat 2008, and every bomb blast, target killing and emergency since.']].map(([t,b])=>`<div class="card"><h3>${t}</h3><p class="muted" style="margin-top:9px">${b}</p></div>`).join('')}
</div>
<h2 style="margin:56px 0 8px">Who can donate</h2><p class="lead" style="margin-bottom:24px">If all four are true, you can give today.</p>
<div class="g4">${[['18–60','years of age'],['50 kg','minimum weight'],['90 days','since your last donation'],['Good health','no fever, no recent surgery']].map(([n,l])=>`<div class="card" style="text-align:center"><div class="bignum">${n}</div><div class="muted" style="margin-top:6px;font-size:14px">${l}</div></div>`).join('')}</div>
<div class="closer" style="margin-top:44px"><div><h2>Not sure if you can give?</h2><p>Register anyway. The form checks as you go and tells you the date you next become eligible.</p></div><a href="#/register-donor" class="btn btn-w">Register as a Donor</a></div>
</div></section>`;

/* ---------------- BRANCHES ---------------- */
PAGES.branches=()=>`
${hero('Our branches','Six offices.<br>Fourteen towns.','From the head office beside the Quetta Press Club out to Zhob, Chaman and Loralai — and to the towns in between that have no blood bank of their own.')}
<section class="blk" style="padding-top:0"><div class="wrap"><div class="g2" style="gap:34px;align-items:start">
<div style="display:grid;gap:12px">${BRANCHES.map(b=>`<div class="brc">
<div style="flex:1"><div class="bn">${b.n}${b.head?' <span class="hd-tag">HEAD OFFICE</span>':''}</div>
<div class="ba">${b.a}</div>
${b.t.length?`<div class="bt">${b.t.map(t=>`<a href="tel:${t.replace(/-/g,'')}">${t}</a>`).join(' · ')}</div>`:'<div class="bt muted">Phone number to follow</div>'}
${b.bank?`<div class="bbank">${b.bank}</div>`:''}
${b.amb?'<span class="tag ok" style="margin-top:9px">Ambulance service · 24 hours</span>':''}</div>
<a class="btn btn-o btn-s" href="https://maps.google.com/?q=${encodeURIComponent(b.n+' Balochistan')}" target="_blank" rel="noopener">Directions</a></div>`).join('')}</div>
${slot('map slot<br>Balochistan — six branch pins, eight more towns served<br>click a pin to jump to its card','3/4','min-height:520px')}
</div>
<div style="margin-top:32px"><div class="qlab" style="margin-bottom:12px">Also serving, without a permanent office</div>
${TOWNS.slice(6).map(t=>`<span class="chip">${t}</span>`).join('')}</div>
</div></section>`;

/* ---------------- THALASSEMIA ---------------- */
PAGES.thalassemia=()=>`
${hero('Thalassemia','Two hundred children,<br>every month.','Registered children are transfused free of cost and without exchange. For a child with thalassemia a monthly transfusion is not optional — it is the difference between a normal month and a hospital one.')}
<section class="blk" style="padding-top:0"><div class="wrap">
<div class="g2" style="gap:34px;align-items:center">
<div><h2 style="margin-bottom:16px">What it costs to keep one child alive for a year</h2>
<p class="muted" style="margin-bottom:22px">Sponsorship covers screening, bags and handling for one child\u2019s full year of transfusions.</p>
<div class="g3" style="gap:12px">${[['12','transfusions a year'],['—','cost per screened bag'],['—','a year, per child']].map(([n,l])=>`<div class="card" style="padding:18px"><div class="bignum" style="font-size:28px">${n}</div><div class="muted" style="font-size:13px;margin-top:4px">${l}</div></div>`).join('')}</div>
<p class="muted" style="font-size:13.5px;margin-top:14px">Figures to be supplied by the head office.</p>
<a href="#/donate" class="btn btn-p" style="margin-top:22px">Sponsor a child</a></div>
${slot('photograph slot<br><b>consented portraits only</b><br>no names unless the family has agreed','4/3.6')}
</div>
<div class="notice" style="margin-top:44px"><b>On photographs.</b> Children appear on this page only where a signed consent form is held by the head office. A child without consent is still counted among the two hundred, and still transfused, but never shown.</div>
</div></section>`;

/* ---------------- PEOPLE ---------------- */
const person=(n,r,d,extra='')=>`<div class="card" style="padding:0;overflow:hidden">${slot('portrait','1/1','border-radius:0;border:0;border-bottom:1px solid var(--line)')}
<div style="padding:20px"><h3>${n}</h3><div class="muted" style="font-size:13.5px;margin-top:5px">${r}</div>${d?`<p class="muted" style="font-size:13.5px;margin-top:10px">${d}</p>`:''}${extra}</div></div>`;
PAGES.people=()=>`
${hero('Committee &amp; staff','The people who run it','Pashtoonkhwa Blood Bank has been supervised by the same three-member organising committee since the day it opened.')}
<section class="blk" style="padding-top:0"><div class="wrap">
<div class="qlab" style="margin-bottom:16px">Organising committee</div>
<div class="g3">
${person('Olus Yar','Olus Yar, PBB','Heads the organisation. Every branch, every account and every register answers upward to this office.','<div class="bt" style="margin-top:10px"><a href="tel:03003815590">0300-3815590</a></div>')}
${person('Mr. Faqir Khushal Khan Kasi','Organizer, PBB','Member of the organising committee since 1999.')}
${person('Dr. Hamid Khan Achakzai','Member, organising committee','Provincial Secretary and Member of the Central Committee, Pashtoonkhwa Milli Awami Party.')}
</div>
<div class="qlab" style="margin:48px 0 16px">Medical staff</div>
<div class="g3">
${person('Dr. Naseer Muhammad','Pathologist, PBB · MD, DCP (PGMI Quetta)','Senior Pathologist at Pashtoonkhwa Blood Bank. Previously Senior Medical Officer with the Health Department for ten years, and Pathologist at Health Department Zhob for two.')}
<div class="card" style="border-style:dashed;display:flex;align-items:center;justify-content:center;text-align:center;color:var(--mid);min-height:200px">Further staff to be added<br>by the head office</div>
</div>
</div></section>`;

/* ---------------- GALLERY ---------------- */
PAGES.gallery=()=>`
${hero('Photos &amp; videos','The work, as it happens')}
<section class="blk" style="padding-top:0"><div class="wrap">
<div class="row" style="gap:8px;margin-bottom:26px" id="galFilter">
${['All','Blood camps','Awareness','Ambulance','New building','Eid ul Adha','Videos'].map((f,i)=>`<button class="pill${i?'':' on'}" onclick="galPick(this)">${f}</button>`).join('')}
</div>
<div class="gal">${Array.from({length:11},(_,i)=>slot(i%5===3?'▶ video':'photograph',[1,1,1.4,1,.8,1,1,1.3,1,1,1][i]||1,'border-radius:18px'))}</div>
<div style="text-align:center;margin-top:30px"><button class="btn btn-o">Load more</button></div>
</div></section>`;

/* ---------------- NEWS ---------------- */
const NEWS=[
{t:'Free donation camp, Pishin',k:'Blood camp',d:'12 September',b:'Band Road branch, 9am to 4pm. Walk in, or register to attend so we know how many to expect.',f:1},
{t:'New building — final stage',k:'Notice',d:'3 September',b:'Construction of the new Quetta premises has entered its last phase.'},
{t:'Eid ul Adha hide collection',k:'Appeal',d:'Runs to 20 June',b:'Volunteers collect cattle hides across all branches. Request a collection from your area.'},
{t:'Thalassemia transfusion schedule, September',k:'Notice',d:'28 August',b:'Guardians of registered children can collect the month\u2019s schedule from their branch.'},
{t:'Awareness drive, Quetta university',k:'Awareness',d:'14 August',b:'Students registered as first-time donors over two days on campus.'},
{t:'Ambulance service extended',k:'Notice',d:'2 August',b:'A third vehicle joined the Quetta fleet, taking the service to twenty-four hours.'}];
PAGES.news=()=>`
${hero('Announcements &amp; events','What is happening now')}
<section class="blk" style="padding-top:0"><div class="wrap">
<div class="card" style="padding:0;overflow:hidden;margin-bottom:26px"><div class="feat">
${slot('event cover photograph','16/10','border-radius:0;border:0;height:100%')}
<div style="padding:38px">
<div class="row" style="gap:10px"><span class="tag no">${NEWS[0].k}</span><span class="muted" style="font-size:13.5px;font-weight:600">${NEWS[0].d}</span></div>
<h2 style="margin:16px 0 12px">${NEWS[0].t}</h2><p class="lead">${NEWS[0].b}</p>
<div class="row" style="margin-top:24px"><a href="#/contact" class="btn btn-p">Register to attend</a><a href="#/branches" class="btn btn-o">Find the branch</a></div>
</div></div></div>
<div class="g3">${NEWS.slice(1).map(n=>`<div class="card" style="padding:0;overflow:hidden">${slot('cover','16/9','border-radius:0;border:0;border-bottom:1px solid var(--line)')}
<div style="padding:22px"><div class="row" style="gap:9px"><span class="tag gy">${n.k}</span><span class="muted" style="font-size:13px;font-weight:600">${n.d}</span></div>
<h3 style="margin:12px 0 8px">${n.t}</h3><p class="muted" style="font-size:14px">${n.b}</p></div></div>`).join('')}</div>
</div></section>`;

/* ---------------- DONATE ---------------- */
PAGES.donate=()=>`
${hero('Donate','Keep the register running','Pashtoonkhwa Blood Bank has never purchased blood. It runs on members\u2019 contributions, charity, Zakat, and cattle hides collected by volunteers each Eid ul Adha.')}
<section class="blk" style="padding-top:0"><div class="wrap"><div class="g2" style="gap:34px;align-items:start">
<div>
<h3 style="margin-bottom:14px">Bank transfer</h3>
<div style="display:grid;gap:10px">${[['National Bank, City Branch, Jinnah Road, Quetta','6359-6'],['United Bank, Loralai','2101-1'],['National Bank, Pishin','4589-93'],['Bank Islami, Zhob','1048-0088676-0001']].map(([b,a])=>`<div class="acct"><div><div style="font-weight:700;font-size:14.5px">${b}</div><div class="mono">${a}</div></div><button class="btn btn-o btn-s" onclick="copyAcct(this,'${a}')">Copy</button></div>`).join('')}</div>
<div class="notice" style="margin-top:20px"><b>After transferring,</b> send us the receipt using the form so it can be matched and receipted. Zakat-eligible donations are recorded separately.</div>
<h3 style="margin:38px 0 14px">Eid ul Adha — cattle hides</h3>
<p class="muted">Volunteers collect hides across every branch during the three days of Eid. A large share of the year\u2019s running cost comes from this collection alone.</p>
<a href="#/contact" class="btn btn-o" style="margin-top:16px">Request a collection</a>
</div>
<form class="card" onsubmit="return submitDonation(event)">
<h3 style="margin-bottom:6px">Tell us about your donation</h3><p class="muted" style="font-size:13.5px;margin-bottom:22px">So we can match it and send a receipt.</p>
<div class="fgrp"><label class="lb">Your name *</label><input class="fld" name="name" required></div>
<div class="fgrp"><label class="lb">Phone *</label><input class="fld" name="phone" required placeholder="0300 0000000"></div>
<div class="g2" style="gap:14px"><div class="fgrp"><label class="lb">Amount (PKR) *</label><input class="fld" name="amount" required inputmode="numeric"></div>
<div class="fgrp"><label class="lb">Purpose</label><select class="fld" name="purpose"><option>Where most needed</option><option>Sponsor a thalassemia child</option><option>Screening kits</option><option>Ambulance fuel and upkeep</option><option>Zakat</option></select></div></div>
<div class="fgrp"><label class="lb">Which account did you send to?</label><select class="fld" name="acct"><option>National Bank, Quetta</option><option>United Bank, Loralai</option><option>National Bank, Pishin</option><option>Bank Islami, Zhob</option></select></div>
<div class="fgrp"><label class="lb">Receipt <span class="muted" style="font-weight:500">— photograph or screenshot</span></label><div class="drop">Tap to attach the transfer receipt</div></div>
<button class="btn btn-p" style="width:100%;padding:15px">Send details</button>
</form>
</div></div></section>`;

/* ---------------- REQUEST BLOOD ---------------- */
/* old website addresses people may still have bookmarked */
PAGES['request-blood']=()=>{location.hash='#/join/requester';return ''};
PAGES['register-donor']=()=>{location.hash='#/join/donor';return ''};

/* ---------------- CONTACT ---------------- */
PAGES.contact=()=>`
${hero('Contact','Talk to us')}
<section class="blk" style="padding-top:0"><div class="wrap"><div class="g2" style="gap:34px;align-items:start">
<div>
<div class="card" style="margin-bottom:14px"><h3>Head office</h3><div class="ba" style="margin-top:8px">Zainab Chamber, Shara-e-Adalat,<br>near Quetta Press Club, Quetta, Balochistan</div>
<div class="bt" style="margin-top:12px;font-size:17px"><a href="tel:0812836820">081-2836820</a><br><a href="tel:0812839500">081-2839500</a></div>
<div class="mono" style="margin-top:10px">admin@pashtoonkhwabloodbank.org</div></div>
<div class="g2" style="gap:14px"><div class="card"><div class="qlab">Organizer</div><div style="font-weight:700;margin-top:6px">Olus Yar</div><div class="bt"><a href="tel:03003815590">0300-3815590</a></div></div>
<div class="card"><div class="qlab">Web administrator</div><div class="bt" style="margin-top:6px"><a href="tel:03327828121">0332-7828121</a></div><div class="mono" style="font-size:12px;margin-top:4px">wakeeltareen@pashtoonkhwabloodbank.org</div></div></div>
${slot('map — head office','16/10','margin-top:14px')}
</div>
<form class="card" onsubmit="return submitContact(event)">
<h3 style="margin-bottom:18px">Send a message</h3>
<div class="fgrp"><label class="lb">What is this about?</label><div class="row" style="gap:8px" id="ctMode">${['General','Volunteer','Hospital or partner','Press'].map((m,i)=>`<button type="button" class="pill${i?'':' on'}" onclick="ctPick(this)">${m}</button>`).join('')}</div></div>
<div class="fgrp"><label class="lb">Name *</label><input class="fld" name="name" required></div>
<div class="fgrp"><label class="lb">Phone *</label><input class="fld" name="phone" required></div>
<div class="fgrp"><label class="lb">Email <span class="muted" style="font-weight:500">— optional</span></label><input class="fld" name="email" type="email"></div>
<div id="volFields" style="display:none">
<div class="fgrp"><label class="lb">Town</label><select class="fld" name="city">${TOWNS.map(t=>`<option>${t}</option>`).join('')}</select></div>
<div class="fgrp"><label class="lb">What can you help with?</label><div class="row" style="gap:7px">${['Camps','Outreach','Driving','Office work','Design'].map(s=>`<button type="button" class="pill" onclick="tog(this)">${s}</button>`).join('')}</div></div>
</div>
<div class="fgrp"><label class="lb">Message *</label><textarea class="fld" name="msg" rows="4" required></textarea></div>
<button class="btn btn-p" style="width:100%;padding:15px">Send</button>
</form>
</div></div></section>`;


/* ---------------- JOIN HUB ---------------- */
const JOINTYPES=[
 ['requester','Need blood','Request blood for a patient','Tell us the group, the hospital and your number. A coordinator calls you back. In an emergency, phone 081-2836820 first.'],
 ['donor','Give blood','Register as a donor','Join the register for your town. When someone nearby needs your group, we call. You are free to say no, every time.'],
 ['volunteer','Give time','Volunteer with us','Camps, outreach, driving, office work. Volunteers collect the Eid hides that fund a large share of the year.'],
 ['partner','Work with us','Partner organisation','Hospitals, laboratories and clinics that refer patients or share screening capacity.'],
 ['organisation','Bring us to your town','Register an organisation','Welfare societies and community groups who want a PBB branch, or to run a camp under our name.']];

PAGES.join=()=>`
${hero('Get involved','Everything in one place','Five ways to be part of it — asking for blood, giving it, giving time, or bringing the blood bank to your town.')}
<section class="blk" style="padding-top:0"><div class="wrap">
<div class="joingrid">
${JOINTYPES.map((t,i)=>`<a href="#/join/${t[0]}" class="joincard${i?'':' urgent'}"><div class="jn">${t[1]}</div><h3>${t[2]}</h3><p>${t[3]}</p><span class="btn ${i?'btn-o':'btn-w'} btn-s">${i?'Continue':'Request blood'}</span></a>`).join('')}
<div class="joincard" style="background:var(--ink);border-color:var(--ink)"><div class="jn" style="color:#FF6B60">Give money</div><h3 style="color:#fff">Donate</h3><p style="color:#A7ABB3">Bank transfer, Zakat, or cattle hides at Eid ul Adha. PBB has never purchased blood — this is what keeps it running.</p><a href="#/donate" class="btn btn-w btn-s">How to donate</a></div>
</div>
<div class="notice" style="margin-top:26px"><b>Not sure which one?</b> If someone is in hospital right now, use <a href="#/join/requester">request blood</a> — or call <a href="tel:0812836820">081-2836820</a>, where somebody answers at any hour.</div>
</div></section>`;

/* one form, five kinds */
const FORMFIELDS={
 requester:[
 ['__section','Who the blood is for'],
 ['Patient name','patient','text',1],
 ['Gender','gender','select',1,['Male','Female']],
 ['Age','age','number',1],
 ['Case or disease','disease','text',1],
 ['Do you have the medical report?','report','select',1,['Yes, I have it','No, not yet']],
 ['__section','What is needed'],
 ['Type of blood','btype','select',1,['Whole blood','RCC — red cell concentrate','Platelets','FFP — fresh frozen plasma','Not sure, the doctor will say']],
 ['Number of bags','units','number',1],
 ['Date needed','date','date',1],
 ['Time','time','time',0],
 ['How urgent','urgency','select',1,['Critical — today','Urgent — within 2 days','Planned — a date is set']],
 ['__section','Where'],
 ['Hospital','hospital','text',1],
 ['__section','The attendant'],
 ['Attendant name','att','text',1],
 ['Attendant phone','phone','tel',1],
 ['Attendant blood group','attgroup','select',0,['Do not know yet','O+','O−','A+','A−','B+','B−','AB+','AB−']],
 ['Can the attendant donate?','attdonate','select',1,['Yes, available to donate','No','Somebody else in the family can']],
 ['Can you arrange an exchange donor?','exchange','select',1,['Yes','No','Not sure']],
 ['Can the donor be brought to the branch?','transport','select',1,['Yes, we have transport','No, we need help with transport']],
 ['Full address','address','textarea',0]],
 donor:[['Full name','name','text',1],['Date of birth','dob','date',1],['Weight (kg)','weight','number',1],['Phone','phone','tel',1],['Area or mohalla','address','text',0],['When did you last give?','last','date',0]],
 volunteer:[['Full name','name','text',1],['Phone','phone','tel',1],['Email','email','email',0],['Hours you can give a week','hours','select',0,['A few hours','Half a day','One day','More']],['Anything you are good at','skills','text',0]],
 partner:[['Organisation name','org','text',1],['Kind','kind','select',1,['Hospital','Laboratory','Clinic','Welfare society','Other']],['Contact person','name','text',1],['Phone','phone','tel',1],['Email','email','email',0],['What are you hoping to do together?','notes','textarea',0]],
 organisation:[['Organisation name','org','text',1],['Registration number','reg','text',0],['Contact person','name','text',1],['Role in the organisation','role','text',0],['Phone','phone','tel',1],['Email','email','email',0],['Why does your town need a branch?','notes','textarea',1]]};
const NEEDGROUP={requester:'Blood group needed',donor:'Your blood group'};
const NEEDTOWN={requester:'Town',donor:'Town',volunteer:'Town',partner:'Town',organisation:'Town'};

function joinPage(kind){
 const t=JOINTYPES.find(x=>x[0]===kind)||JOINTYPES[0];
 const f=FORMFIELDS[kind];
 return `<section class="blk" style="padding-top:40px"><div class="wrap" style="max-width:820px">
 ${kind==='requester'?'<div class="callfirst" style="margin-bottom:24px"><div><h3 style="color:#fff">In an emergency, call first.</h3><p style="color:#FFD9D5;margin-top:6px;font-size:14.5px">A form is the wrong instrument for an emergency. Someone answers at any hour.</p></div><a href="tel:0812836820" class="btn btn-w">081-2836820</a></div>':''}
 <div class="typetabs">${JOINTYPES.map(x=>`<a href="#/join/${x[0]}" class="pill${x[0]===kind?' on':''}">${x[2].replace('Register as a ','').replace('Register an ','').replace('Request blood','Need blood')}</a>`).join('')}</div>
 <h1 style="margin-bottom:12px">${t[2]}</h1><p class="lead" style="margin-bottom:28px">${t[3]}</p>
 <form class="card" onsubmit="return submitJoin(event,'${kind}')">
 ${NEEDGROUP[kind]?`<div class="fgrp"><label class="lb">${NEEDGROUP[kind]} *</label><div class="row" style="gap:8px" data-bg="group">${bgBtns('group')}${kind==='donor'?'<button type="button" class="bgp wide" data-g="unknown" onclick="pickG(this,\'group\')">I don\'t know</button>':''}</div><input type="hidden" name="group" required></div>`:''}
 ${f.map(([lab,n,ty,req,opts])=>lab==='__section'
  ?`<div class="fsec"><span>${n}</span></div>`
  :ty==='select'
  ?`<div class="fgrp"><label class="lb">${lab}${req?' *':''}</label><select class="fld" name="${n}">${opts.map(o=>`<option>${o}</option>`).join('')}</select></div>`
  :ty==='textarea'
  ?`<div class="fgrp"><label class="lb">${lab}${req?' *':''}</label><textarea class="fld" name="${n}" rows="3" ${req?'required':''}></textarea></div>`
  :`<div class="fgrp"><label class="lb">${lab}${req?' *':''}</label><input class="fld" name="${n}" type="${ty}" ${req?'required':''}></div>`).join('')}
 <div class="fgrp"><label class="lb">${NEEDTOWN[kind]} *</label><select class="fld" name="city">${TOWNS.map(t=>`<option>${t}</option>`).join('')}</select></div>
 ${kind==='donor'?'<label class="chk"><input type="checkbox" checked name="crosscity"><span>I am willing to be called if another town urgently needs my blood group.</span></label>':''}
 <label class="chk"><input type="checkbox" required checked><span>What I have entered is accurate, and I agree to be contacted about it.</span></label>
 <button class="btn btn-p" style="width:100%;padding:16px;font-size:16px;margin-top:14px">${kind==='requester'?'Submit the request':'Send'}</button>
 </form>
 </div></section>`;
}
JOINTYPES.forEach(t=>{PAGES['join/'+t[0]]=()=>joinPage(t[0])});


/* ---------------- THE PROBLEM ---------------- */
const GAPS=[
['Poor research and data','Almost nothing is measured. Without records of who gives, who needs and where the shortages fall, every decision is a guess.','M3 3v18h18M7 15l4-4 3 3 5-6'],
['No national blood group database','There is no register a hospital can search. Finding an O− donor at two in the morning still means phoning down a list somebody wrote by hand.','M4 7h16M4 12h16M4 17h10'],
['Very little voluntary donation','Most blood is given by a relative under pressure on the day. Regular, voluntary donors — the people a blood bank can rely on — are rare.','M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z'],
['Blood-consumptive disorders','Thalassemia, haemophilia and the rest need transfusion every few weeks for life. Two hundred children depend on PBB alone.','M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8Z'],
['Prescribing habits','Whole blood is often ordered where a single component would do, and transfusion is sometimes prescribed where it is not needed at all.','M9 2h6v4h4v6h-4v10H9V12H5V6h4V2Z'],
['Blood bank capacity','Screening equipment, cold storage and trained staff are concentrated in a few cities. Smaller towns work with far less.','M6 3h12v6l-3 3 3 3v6H6v-6l3-3-3-3V3Z'],
['Blood discarded','Bags expire on a shelf in one town while a patient waits in the next. Nobody can see both at once.','M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13'],
['Everything routed through the cities','A family in Sherani or Musakhel travels to Quetta for something that ought to be available in their own district hospital.','M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z M12 10h.01'],
['No respect for the donor','Somebody gives blood, hears nothing again, and does not come back. The single cheapest fix in the entire system.','M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6M12 3v12m0 0 4-4m-4 4-4-4'],
['Little government attention','Blood services are largely left to charities and welfare societies to fund and run.','M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6'],
['Everyone works alone','Blood banks, hospitals and welfare societies each keep their own list. None of them can see the others.','M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm14 10v-2a4 4 0 0 0-3-3.9'],
['Getting the donor there','A willing donor forty minutes away with no transport is, in practice, no donor at all.','M3 17V7a1 1 0 0 1 1-1h9v11M13 10h4l4 4v3h-3M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z']];

PAGES.problem=()=>`
${hero('The problem','What keeps blood from<br>reaching people in time','Twelve gaps between a patient who needs blood and a person willing to give it. Pashtoonkhwa Blood Bank was built to close them in Balochistan, one town at a time.')}
<section class="blk" style="padding-top:0"><div class="wrap">
<div class="gapgrid">${GAPS.map((g,i)=>`<div class="gapcard" style="--i:${i}">
<div class="gapnum">${String(i+1).padStart(2,'0')}</div>
<div class="gapic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${g[2]}"/></svg></div>
<h3>${g[0]}</h3><p>${g[1]}</p></div>`).join('')}</div>
<div class="answer">
<div><div class="qlab" style="color:#FFD9D5">Our answer</div><h2 style="color:#fff;margin:12px 0 14px">A register anyone can search,<br>kept in fourteen towns.</h2>
<p style="color:#FFD9D5;font-size:17px;line-height:1.65;max-width:60ch">Not a national programme — a working one. Every donor recorded, every request logged, every branch able to see who in their own town can give today. It has run since 1999 on exchange, charity and Zakat, and has never purchased a single bag.</p>
<div class="row" style="margin-top:26px;gap:12px"><a href="#/join/donor" class="btn btn-w">Join the register</a><a href="#/about" class="btn" style="border-color:rgba(255,255,255,.4);color:#fff">How it started</a></div></div>
</div>
</div></section>`;

/* ---------------- SUPPORTERS ---------------- */
const SUPPORTERS=[
['Pashtoonkhwa Milli Awami Party','Founding support since 1999'],
['Quetta Press Club','Neighbour and long-standing partner'],
['Civil Hospital, Quetta','Referring hospital'],
['Bolan Medical Complex','Referring hospital'],
['Sandeman Provincial Hospital','Referring hospital'],
['DHQ Hospital, Zhob','Branch partner'],
['Local welfare societies','Camps and hide collection'],
['Individual members','The largest source of all']];

PAGES.supporters=()=>`
${hero('Who stands with us','The organisations who<br>keep this running','Pashtoonkhwa Blood Bank has no government funding. It runs on members\u2019 contributions, charity, Zakat, and cattle hides collected by volunteers each Eid ul Adha — and on the institutions below.')}
<section class="blk" style="padding-top:0"><div class="wrap">
<div class="qlab" style="margin-bottom:16px">Supporting organisations</div>
<div class="suppgrid">${SUPPORTERS.map((s,i)=>`<div class="suppcard"><div class="supplogo"><image-slot id="supp-${i+1}" shape="rect" placeholder="Drop the logo"></image-slot></div><div><b>${s[0]}</b><span>${s[1]}</span></div></div>`).join('')}</div>
<div class="g2" style="gap:20px;margin-top:44px">
<div class="card"><div class="qlab" style="margin-bottom:12px">Become a partner</div><h3 style="margin-bottom:10px">Hospitals, laboratories and clinics</h3><p class="muted">Refer patients, share screening capacity, or host a camp. Partner hospitals get a named coordinator and a direct line to the branch.</p><a href="#/join/partner" class="btn btn-o" style="margin-top:18px">Partner with us</a></div>
<div class="card"><div class="qlab" style="margin-bottom:12px">Bring us to your town</div><h3 style="margin-bottom:10px">Welfare societies and community groups</h3><p class="muted">Eight towns are served without a permanent office. If your community wants a branch, the organising committee will talk it through with you.</p><a href="#/join/organisation" class="btn btn-o" style="margin-top:18px">Register an organisation</a></div>
</div>
<div class="closer" style="margin-top:44px"><div><h2>Support the register</h2><p>Bank transfer, Zakat, or hides at Eid ul Adha. Every rupee goes to screening kits, bags and fuel.</p></div><a href="#/donate" class="btn btn-w">How to donate</a></div>
</div></section>`;

/* ---------------- LEADERSHIP (extends people) ---------------- */
PAGES.leadership=()=>{location.hash='#/people';return ''};
