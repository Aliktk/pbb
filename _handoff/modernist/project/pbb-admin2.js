/* PBB admin — remaining screens. Depends on pbb-admin.js (S, adminShell, helpers). */

/* ---------------- OVERVIEW ----------------
   Every panel here answers a question somebody actually asks out loud:
   are we keeping up, which group will run out, who has gone quiet, when do the calls come. */
/* Bags on the shelf, and how many units of that group were asked for over the last year.
   Everything else on this screen is derived from these two numbers. */
const HELDBY={
 null:{'O−':2,'AB−':3,'B−':6,'A−':11,'O+':41,'A+':34,'B+':28,'AB+':9},
 Zhob:{'O−':0,'AB−':1,'B−':1,'A−':2,'O+':7,'A+':5,'B+':4,'AB+':2},
 Pishin:{'O−':1,'AB−':0,'B−':2,'A−':3,'O+':9,'A+':6,'B+':5,'AB+':1}};
const DEMANDBY={
 Zhob:{'O−':7,'AB−':3,'B−':8,'A−':6,'O+':34,'A+':24,'B+':27,'AB+':4},
 Pishin:{'O−':9,'AB−':4,'B−':11,'A−':8,'O+':41,'A+':29,'B+':32,'AB+':5}};
const HELD=HELDBY[SCOPE]||HELDBY[null];
const DEMAND=DEMANDBY[SCOPE]||{'O−':38,'AB−':14,'B−':44,'A−':36,'O+':210,'A+':150,'B+':165,'AB+':22};
/* Months of cover: what is held, against the rate it is asked for. Under one month is a shortage. */
const held=g=>(HELDBY[SCOPE]||HELDBY[null])[g];
const demand=g=>(DEMANDBY[SCOPE]||DEMAND)[g];
const cover=g=>{const d=demand(g);return d?held(g)/(d/12):99};
const coverClass=g=>{const c=cover(g);return c<1?'cr':c<2?'lo':'ok'};
const STOCKA=()=>Object.keys(HELDBY[null]).map(g=>[g,held(g),coverClass(g)]);
const REG=[1142,1158,1171,1189,1204,1223,1241,1258,1272,1289,1301,1318];
const OPENREQ=[9,7,11,8,12,10,14,9,13,7,11,8];
const MONTHS=['Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'];
const BAGS=[318,352,340,376,361,404,392,431,377,448,412,467];
const ANSWERED=[74,78,76,81,79,84,82,86,83,88,85,89];/* % of requests answered, used on the time-to-donor card */
const HOURS=[1,1,1,1,2,3,5,9,14,17,15,12,10,13,16,19,22,18,13,9,6,4,3,2];
/* Response time in minutes, this year against last, per town — a branch's own figure, not the org's. */
const RESPBY={null:[168,260],Zhob:[252,405],Pishin:[150,222]};
const RESP=RESPBY[SCOPE]?RESPBY[SCOPE][0]:RESPBY[null][0],RESPWAS=RESPBY[SCOPE]?RESPBY[SCOPE][1]:RESPBY[null][1];
const resp=()=>RESPBY[SCOPE]||RESPBY[null];
const hhmm=m=>Math.floor(m/60)+'h '+String(m%60).padStart(2,'0')+'m';
/* The peak window, and its real share of the year's requests. */
const HTOT=HOURS.reduce((a,b)=>a+b,0);
const PEAKFROM=15,PEAKTO=18;
const PEAKSHARE=Math.round(HOURS.slice(PEAKFROM,PEAKTO+1).reduce((a,b)=>a+b,0)/HTOT*100);
const QUIETEST=Math.min(...HOURS);
/* Activity and last-update per town. The donor count is NOT held here — it is counted from the
   register itself, so this panel and the headline card can never state two different numbers. */
const ACT={Quetta:['today',96],Pishin:['today',88],Loralai:['2 days',71],Zhob:['9 days',34],Chaman:['never',12],'Muslim Bagh':['today',80]};
/* Every town, so a donor can never sit in one the panel does not show. Towns without an office
   are listed only once somebody there is on the register. */
const TOWNACT=()=>window.PBBTOWNS.filter(t=>ACT[t]||townCount(t)).map(t=>[t,...(ACT[t]||['—',0])]);
const spark=(vals,col)=>{const mx=Math.max(...vals),mn=Math.min(...vals),w=100,h=28;
 const pts=vals.map((v,i)=>[i/(vals.length-1)*w,h-((v-mn)/((mx-mn)||1))*h].map(x=>x.toFixed(1)).join(',')).join(' ');
 return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`};
const ring=(pct,col,label)=>{const r=34,c=2*Math.PI*r;
 return `<div class="ringwrap"><svg viewBox="0 0 80 80" class="ring"><circle cx="40" cy="40" r="${r}" fill="none" stroke="var(--line)" stroke-width="9"/><circle cx="40" cy="40" r="${r}" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(c*pct/100).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 40 40)"/></svg><div class="ringv"><b>${pct}%</b><span>${label}</span></div></div>`};

PAGES['admin/overview']=()=>{
 const rq=scoped(S.requests),open=rq.filter(r=>r.st==='open'),dn=scoped(S.donors);
 const ready=dn.filter(d=>elig(d).ok).length;
 const crit=open.filter(r=>/Critical/.test(r.urg));
 const unscreened=dn.filter(d=>!D(d,'tests')).length;
 const stale=dn.filter(d=>{const t=D(d,'tested');return t&&days(t)>180}).length;
 const never=dn.filter(d=>!d.times).length;
 const notCallable=dn.length-ready;
 const ratio=Object.keys(HELDBY[null]).map(g=>[g,held(g),demand(g),+cover(g).toFixed(1)]).sort((a,b)=>a[3]-b[3]);
 const peak=HOURS.indexOf(Math.max(...HOURS));
 return adminShell('overview',`
 ${crit.length?`<div class="alert"><div><b>${crit.length} critical ${crit.length===1?'request':'requests'} open.</b> ${crit[0].g} · ${crit[0].hosp} · asked ${ago(crit[0].at)}</div><a href="#/admin/requests" class="btn btn-w btn-s">Open the list</a></div>`:'<div class="okbar">No critical requests open right now.</div>'}

 <div class="kpirow">
 <div class="kpi"><div class="l">Donors on the register</div><div class="row" style="justify-content:space-between;align-items:flex-end"><div class="n">${dn.length.toLocaleString()}</div><div class="dl">${never} ${never===1?'has':'have'} never given</div></div>${spark(REG,'var(--grn)')}</div>
 <div class="kpi"><div class="l">Can give today</div><div class="row" style="justify-content:space-between;align-items:flex-end"><div class="n">${ready}</div><div class="dl">${dn.length?Math.round(ready/dn.length*100):0}% of the register</div></div><div class="mini"><i style="width:${dn.length?Math.round(ready/dn.length*100):0}%"></i></div></div>
 <div class="kpi ${open.length?'warn':''}"><div class="l">Open requests</div><div class="row" style="justify-content:space-between;align-items:flex-end"><div class="n r">${open.length}</div><div class="dl ${crit.length?'dn':''}">${crit.length} critical</div></div>${spark(OPENREQ,'var(--red)')}</div>
 <div class="kpi"><div class="l">Typical time to a donor</div><div class="row" style="justify-content:space-between;align-items:flex-end"><div class="n">${hhmm(resp()[0])}</div><div class="dl up">${hhmm(resp()[1]-resp()[0])} faster</div></div><div class="dl" style="margin-top:8px">Against ${hhmm(resp()[1])} a year ago</div>${spark(ANSWERED,'var(--ink)')}</div>
 </div>

 <div class="dash2">
 <div class="acard"><div class="row" style="justify-content:space-between;align-items:baseline;margin-bottom:4px"><h3>Which group runs out first</h3><span class="sm">months of cover</span></div>
 <p class="sm" style="margin-bottom:18px">The single figure worth watching, and the one a shelf count cannot give you. ${ratio.length?`${ratio[ratio.length-1][1]} ${ratio[ratio.length-1][1]===1?'bag':'bags'} of ${ratio[ratio.length-1][0]} is ${ratio[ratio.length-1][3]} months of cover, while ${ratio[0][1]} ${ratio[0][1]===1?'bag':'bags'} of ${ratio[0][0]} is ${ratio[0][3]} months`:''}. The stock boxes below are coloured by this same calculation.</p>
 <div class="ratiorows">${ratio.map(([g,n,d,r])=>`<div class="rrow ${r<1?'bad':r<2?'mid':''}">
 <span class="rg">${g}</span>
 <span class="rbar"><i style="width:${Math.min(100,r/4*100)}%"></i></span>
 <span class="rn">${r} months</span><span class="rd">${n} held · ${d} asked a year</span>
 <span class="tag ${r<1?'no':r<2?'wt':'ok'}">${r<1?'Will run out':r<2?'Tight':'Comfortable'}</span></div>`).join('')}</div>
 <div class="ahint" style="margin-top:16px">O− is the group every shortage starts with: it can be given to anybody, so it is spent on emergencies before the right group is known.</div></div>

 <div class="acard"><h3 style="margin-bottom:16px">The register's health</h3>
 <div class="ringrow">${ring(dn.length?Math.round((dn.length-unscreened)/dn.length*100):0,'var(--grn)','screened')}${ring(dn.length?Math.round((dn.length-never)/dn.length*100):0,'var(--ink)','have given')}${ring(38,'var(--red)','came back')}</div>
 <div style="margin-top:20px">
 ${[[unscreened+' never screened','Cannot be called until the five tests are done','#/admin/donors',unscreened?'no':'ok'],
    [stale+' screened over six months ago','Results should be repeated before issuing','#/admin/donors',stale?'wt':'ok'],
    [never+' have never given','Registered, but never once called in','#/admin/find','gy']].map(([t,s,u,c])=>`<a href="${u}" class="todo2"><div><b>${t}</b><span>${s}</span></div><span class="tag ${c}">${c==='no'?'Blocked':c==='wt'?'Stale':'—'}</span></a>`).join('')}</div></div>
 </div>

 <div class="dash2" style="margin-top:18px">
 <div class="acard"><div class="row" style="justify-content:space-between;align-items:baseline;margin-bottom:16px"><h3>Bags collected</h3><span class="sm">twelve months · all fourteen towns · ${BAGS.reduce((a,b)=>a+b,0).toLocaleString()} total</span></div>
 <div class="chart" style="height:150px">${BAGS.map((v,i)=>`<div class="bar${i===11?' pk':''}" style="height:${Math.round(v/Math.max(...BAGS)*100)}%"><span>${MONTHS[i]} · ${v} bags</span></div>`).join('')}</div>
 <div class="axis">${MONTHS.map(m=>`<span>${m}</span>`).join('')}</div></div>

 <div class="acard"><div class="row" style="justify-content:space-between;align-items:baseline;margin-bottom:6px"><h3>When the calls come</h3><span class="sm">peak ${String(peak).padStart(2,'0')}:00</span></div>
 <p class="sm" style="margin-bottom:16px">Requests by hour across all fourteen towns, over a year. It says plainly when the desk needs somebody on it.</p>
 <div class="hourly">${HOURS.map((v,i)=>`<i class="${v>=15?'pk':''}" style="height:${Math.round(v/Math.max(...HOURS)*100)}%" title="${i}:00 · ${v}"></i>`).join('')}</div>
 <div class="axis"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>
 <div class="ahint" style="margin-top:14px">${PEAKSHARE}% of all requests arrive between ${PEAKFROM}:00 and ${PEAKTO}:00, and they do not stop at night — the quietest hour of the year still carries ${QUIETEST}.</div></div>
 </div>

 <div class="dash2" style="margin-top:18px">
 <div class="acard"><div class="row" style="justify-content:space-between;align-items:baseline;margin-bottom:16px"><h3>Stock by group</h3><a href="#/admin/inventory" class="minilink">Update</a></div>
 <div class="stockgrid">${STOCKA().map(([g,n,s])=>`<div class="sbox ${s}"><div class="sg">${g}</div><div class="sn">${n}</div><div class="ss">${n===1?'bag':'bags'}</div></div>`).join('')}</div>
 <p class="sm" style="margin-top:14px">${SCOPE||'Quetta'} · updated 2 hours ago</p></div>

 <div class="acard"><h3 style="margin-bottom:6px">${SCOPE?SCOPE:'Towns, and who has gone quiet'}</h3><p class="sm" style="margin-bottom:16px">${SCOPE?'Your own town. The head office holds the picture across all fourteen.':'The six branch offices, and any other town with somebody on the register. A branch that stops updating is the reason the public shortage strip goes stale.'}</p>
 ${(SCOPE?TOWNACT().filter(t=>t[0]===SCOPE):TOWNACT()).map(([t,u,act])=>`<div class="townrow"><span class="tn">${t}</span><span class="tbar"><i class="${act<40?'bad':act<75?'mid':''}" style="width:${act}%"></i></span><span class="td">${townCount(t).toLocaleString()}</span><span class="tag ${u==='never'?'no':u.includes('day')&&parseInt(u)>7?'wt':'ok'}">${u==='today'?'Today':u==='never'?'Never':u}</span></div>`).join('')}
 ${SCOPE?'':'<a href="#/admin/network" class="btn btn-o btn-s" style="margin-top:16px;width:100%">All fourteen towns</a>'}</div>
 </div>

 <div class="acard" style="margin-top:18px"><div class="row" style="justify-content:space-between;align-items:baseline;margin-bottom:16px"><h3>Latest activity</h3><a href="#/admin/requests" class="minilink">All requests</a></div>
 <div class="atbl" style="border:0"><table><tbody>
 ${rq.slice(0,5).map(r=>`<tr onclick="openReq('${r.id}')"><td class="m2"><div class="nm">${r.hosp}</div><div class="sm">${r.id} · ${r.src==='web'?'from the website':'entered by staff'}</div></td><td class="m1">${bgTag(r.g)}</td><td class="sm">${ago(r.at)}</td><td class="m3">${r.st==='open'?'<span class="tag no">Open</span>':'<span class="tag ok">Arranged</span>'}</td></tr>`).join('')}
 </tbody></table></div></div>`,
 `<h1>Overview</h1><span class="asub">${SCOPE||'All fourteen towns'}</span>`);
};

/* ---------------- INVENTORY ---------------- */
PAGES['admin/inventory']=()=>adminShell('inventory',`
 <div class="stockgrid big">${STOCKA().map(([g,n,s])=>`<div class="sbox ${s}"><div class="row" style="justify-content:space-between"><div class="sg">${g}</div><span class="tag ${s==='cr'?'no':s==='lo'?'wt':'ok'}">${s==='cr'?'Critical':s==='lo'?'Low':'Enough'}</span></div>
 <div class="sn big">${n}</div><div class="ss">${n===1?'bag':'bags'} in the fridge</div>
 <div class="row" style="gap:6px;margin-top:12px"><button class="btn btn-o btn-s" onclick="adj(this,-1)">−</button><button class="btn btn-o btn-s" onclick="adj(this,1)">+</button></div></div>`).join('')}</div>
 <div class="g2" style="gap:18px;margin-top:18px;align-items:start">
 <div class="acard"><h3 style="margin-bottom:14px">Expiring soon</h3>
 ${[['O−','#4821','3 days','cr'],['B+','#4776','9 days',''],['A+','#4802','12 days','']].map(([g,u,d,c])=>`<div class="row" style="padding:11px 0;border-bottom:1px solid var(--line)">${bgTag(g)}<span class="mono2" style="flex:1">${u}</span><span class="${c==='cr'?'red':'sm'}" style="font-weight:700">${d}</span></div>`).join('')}</div>
 <div class="acard"><h3 style="margin-bottom:6px">Show on the public website</h3><p class="sm" style="margin-bottom:14px">The shortage strip on the home page reads these numbers.</p>
 <label class="chk"><input type="checkbox" checked><span>Show what we are short of</span></label>
 <p class="ahint" style="margin-top:14px">If no branch updates for <b>48 hours</b> the strip hides itself automatically, so the public page can never show stale stock.</p></div>
 </div>`,`<h1>Inventory</h1><span class="asub">${SCOPE||'Quetta'} · updated 2 hours ago</span><span style="margin-left:auto"></span><button class="btn btn-p btn-s">Save stock</button>`);
function adj(b,d){const box=b.closest('.sbox').querySelector('.sn');box.textContent=Math.max(0,+box.textContent+d)}

/* ---------------- VOLUNTEERS ---------------- */
const VOLS=[{n:'Hafeez Ullah',c:'Quetta',sk:'Camps',st:'new'},{n:'Sabir Khan',c:'Zhob',sk:'Outreach',st:'active'},{n:'Naveed Ahmed',c:'Pishin',sk:'Driving',st:'contacted'},{n:'Asma Bibi',c:'Quetta',sk:'Office',st:'active'},{n:'Rahim Dad',c:'Loralai',sk:'Camps',st:'new'}];
PAGES['admin/volunteers']=()=>{const l=scoped(VOLS);return adminShell('volunteers',`
 <div class="akpi"><div class="c"><div class="l">Not yet contacted</div><div class="n r">${l.filter(v=>v.st==='new').length}</div></div>
 <div class="c"><div class="l">Contacted</div><div class="n">${l.filter(v=>v.st==='contacted').length}</div></div>
 <div class="c"><div class="l">Active</div><div class="n">${l.filter(v=>v.st==='active').length}</div></div>
 <div class="c"><div class="l">Total</div><div class="n">${l.length}</div></div></div>
 <div class="atbl"><table><thead><tr><th>Name</th><th>Town</th><th>Can help with</th><th>Stage</th></tr></thead><tbody>
 ${l.map(v=>`<tr><td class="m2"><div class="nm">${v.n}</div><div class="sm">${v.c} · ${v.sk}</div></td><td>${v.c}</td><td>${v.sk}</td><td class="m3">${v.st==='new'?'<span class="tag no">Not contacted</span>':v.st==='active'?'<span class="tag ok">Active</span>':'<span class="tag wt">Contacted</span>'}</td></tr>`).join('')}
 </tbody></table></div>
 <p class="ahint">Volunteers who signed up and were never called are the most common failure of any volunteer programme. That count sits first, in red, for a reason.</p>`,
 `<h1>Volunteers</h1><span class="asub">${l.length} ${l.length===1?'person':'people'}</span><span style="margin-left:auto"></span><button class="btn btn-p btn-s" onclick="openForm('addVolunteer')">+ Add volunteer</button>`)};

/* ---------------- THALASSEMIA ---------------- */
const THAL=[{id:'T-014',n:'Habiba',a:6,g:'B+',c:'Quetta',due:-4,sp:0,ph:0},{id:'T-027',n:'Zarghoona',a:11,g:'O+',c:'Pishin',due:3,sp:1,ph:1},{id:'T-031',n:'Naveed',a:4,g:'A−',c:'Zhob',due:9,sp:0,ph:0},{id:'T-044',n:'Bilal',a:8,g:'O−',c:'Quetta',due:1,sp:1,ph:0}];
PAGES['admin/thalassemia']=()=>{const l=scoped(THAL);return adminShell('thalassemia',`
 <div class="akpi"><div class="c"><div class="l">Transfusion overdue</div><div class="n r">${l.filter(t=>t.due<0).length}</div></div>
 <div class="c"><div class="l">Due this week</div><div class="n">${l.filter(t=>t.due>=0&&t.due<=7).length}</div></div>
 <div class="c"><div class="l">Registered children</div><div class="n">${SCOPE?l.length:200}</div></div>
 <div class="c"><div class="l">Photo consent on file</div><div class="n">${l.filter(t=>t.ph).length}</div></div></div>
 <div class="atbl"><table><thead><tr><th>ID</th><th>Name</th><th>Age</th><th>Group</th><th>Next transfusion</th><th>Photo consent</th></tr></thead><tbody>
 ${l.map(t=>`<tr><td class="mono2 m1">${t.id}</td><td class="m2"><div class="nm">${t.n}</div><div class="sm">${t.a} years · ${t.c}${t.sp?' · sponsored':''}</div></td><td>${t.a}</td><td>${bgTag(t.g)}</td>
 <td class="${t.due<0?'red':''}" style="font-weight:600">${t.due<0?'Overdue '+(-t.due)+' days':'In '+t.due+' days'}</td>
 <td class="m3">${t.ph?'<span class="tag ok">On file</span>':'<span class="tag gy">Not given</span>'}</td></tr>`).join('')}
 </tbody></table></div>
 <p class="ahint">Photo consent is <b>off by default</b> and needs a signed form from the family. A child without consent is still counted and still transfused — but never appears on the public website.</p>`,
 `<h1>Thalassemia register</h1><span class="asub">${SCOPE?l.length+(l.length===1?' child':' children'):'200 children'}</span><span style="margin-left:auto"></span><button class="btn btn-p btn-s" onclick="openForm('addChild')">+ Register a child</button>`)};

/* ---------------- LEDGER ---------------- */
const YEARLY=[[2008,5905],[2009,5920],[2010,6937],[2011,9484],[2012,5120],[2013,null],[2014,null],[2015,null]];
PAGES['admin/ledger']=()=>adminShell('ledger',`
 <div class="g2" style="gap:18px;align-items:start">
 <div class="acard"><h3 style="margin-bottom:4px">Yearly totals</h3><p class="sm" style="margin-bottom:18px">Solid bars are figures on record. Hatched years still need entering.</p>
 <div class="chart" style="height:150px">${YEARLY.map(([y,b])=>`<div class="bar${b?(y===2011?' pk':''):' gap'}" style="height:${b?Math.round(b/9484*100):28}%"><span>${y}${b?' · '+b.toLocaleString()+' bags':' · no figures yet'}</span></div>`).join('')}</div>
 <div class="axis"><span>2008</span><span>2015</span></div></div>
 <div class="acard"><h3 style="margin-bottom:4px">Enter a year</h3><p class="sm" style="margin-bottom:16px">The gap between 2013 and today closes with four numbers a year — no migration needed.</p>
 <div class="g2" style="gap:12px"><div class="fgrp"><label class="lb">Year</label><input class="fld" placeholder="2013"></div><div class="fgrp"><label class="lb">Bags</label><input class="fld"></div>
 <div class="fgrp"><label class="lb">CCs</label><input class="fld"></div><div class="fgrp"><label class="lb">Platelets + FFP</label><input class="fld"></div></div>
 <button class="btn btn-p" style="width:100%">Save the year</button></div></div>
 <div class="atbl" style="margin-top:18px"><table><thead><tr><th>Date</th><th>Donor</th><th>Group</th><th>Bags</th><th>Town</th></tr></thead><tbody>
 ${S.donations.length?S.donations.map(d=>`<tr><td class="m1 sm">${d.d}</td><td class="m2"><div class="nm">${d.n}</div><div class="sm">${d.c}</div></td><td>${bgTag(d.g)}</td><td class="m3">${d.bags}</td><td>${d.c}</td></tr>`).join(''):'<tr><td colspan="5" class="aempty">Nothing recorded yet.</td></tr>'}
 </tbody></table></div>`,`<h1>Donations ledger</h1><span class="asub">Where the public chart comes from</span>`);

/* ---------------- CONTENT: HOMEPAGE ---------------- */
const SECTIONS=[['Announcement strip','live','scheduled to 20 Sep'],['Hero','live','headline, buttons, photograph'],['Key numbers','live','four figures'],['Shortage strip','live','reads from Inventory'],['What we do','live','four cards'],['Yearly chart','live','reads from the ledger'],['Where we are','live','map + branches'],['Announcements','live','latest three'],['Gallery preview','hidden','latest four photos'],['Closing band','live','red band + button']];
PAGES['admin/homepage']=()=>adminShell('homepage',`
 <div class="g2" style="gap:18px;align-items:start">
 <div><p class="sm" style="margin-bottom:12px">Drag to reorder. Hide anything you are not ready to show.</p>
 ${SECTIONS.map(([n,s,d])=>`<div class="secrow"><span class="grip">⠿</span><div style="flex:1"><b>${n}</b><span class="sm" style="display:block">${d}</span></div>
 <button class="tag ${s==='live'?'ok':'gy'}" onclick="this.classList.toggle('ok');this.classList.toggle('gy');this.textContent=this.textContent==='Live'?'Hidden':'Live'">${s==='live'?'Live':'Hidden'}</button>
 <button class="btn btn-o btn-s">Edit</button></div>`).join('')}
 <div class="addrow">+ Add a section</div></div>
 <div class="acard"><h3 style="margin-bottom:16px">Editing: Hero</h3>
 <div class="fgrp"><label class="lb">Headline</label><input class="fld" value="Blood is life. We keep the record."></div>
 <div class="fgrp"><label class="lb">Sub-headline</label><textarea class="fld" rows="3">Screened, tested blood for anyone who needs it — irrespective of language, colour, religion, race or ethnicity.</textarea></div>
 <div class="fgrp"><label class="lb">Buttons</label><div class="row" style="gap:8px"><span class="chip">Request Blood</span><span class="chip">Register as a Donor</span><span class="chip" style="border-style:dashed">+ add</span></div></div>
 <div class="row" style="gap:8px;margin-top:6px"><span class="tag ok">English ✓</span><span class="tag ok">اردو ✓</span><span class="tag no">پښتو missing</span></div>
 <button class="btn btn-p" style="width:100%;margin-top:18px">Save and publish</button></div></div>`,
 `<h1>Homepage</h1><span class="asub">Ten sections</span><span style="margin-left:auto"></span><a href="#/" class="btn btn-o btn-s">View the site</a><button class="btn btn-p btn-s">Publish</button>`);

/* ---------------- CONTENT: PAGES ---------------- */
const SITEPAGES=[['Home','/','10','Home','EN اردو','live'],['Our story','/about','7','About','EN اردو','live'],['Services','/services','6','Services','EN','live'],['Our branches','/branches','3','About','EN اردو','live'],['Thalassemia children','/thalassemia','5','Services','EN اردو','live'],['Committee & staff','/people','3','About','EN','live'],['Photos & videos','/gallery','1','Media','EN','live'],['Announcements','/news','1','Media','EN','live'],['Donate','/donate','6','Get involved','EN اردو','live'],['Contact','/contact','4','Contact','EN','live'],['Annual report 2026','/report-2026','9','—','EN','draft']];
PAGES['admin/pages']=()=>adminShell('pages',`
 <div class="atbl"><table><thead><tr><th>Page</th><th>Address</th><th>Blocks</th><th>In the menu</th><th>Languages</th><th>Status</th></tr></thead><tbody>
 ${SITEPAGES.map(([n,u,b,m,l,s])=>`<tr><td class="m2"><div class="nm">${n}</div><div class="sm mono2">${u}</div></td><td class="mono2">${u}</td><td>${b}</td><td>${m}</td><td class="m1">${l}</td><td class="m3">${s==='live'?'<span class="tag ok">Live</span>':'<span class="tag gy">Draft</span>'}</td></tr>`).join('')}
 </tbody></table></div>
 <div class="g2" style="gap:18px;margin-top:18px;align-items:start">
 <div class="acard"><h3 style="margin-bottom:6px">Blocks you can build a page from</h3><p class="sm" style="margin-bottom:14px">Add, drag, remove. No developer needed.</p>
 <div class="row" style="gap:7px">${['heading','rich text','text + image','cards','stat row','timeline','people grid','gallery','FAQ','table','quote','file download','video','map','form','call to action'].map(x=>`<span class="chip">${x}</span>`).join('')}</div></div>
 <div class="acard"><h3 style="margin-bottom:6px">Every publish is saved</h3><p class="sm">You can look at any earlier version of a page and put it back. Nothing is lost by a wrong edit.</p>
 <div style="margin-top:14px">${[['Today, 11:04','Olus Yar'],['7 August','Web administrator'],['2 August','Web administrator']].map(([d,w])=>`<div class="drow"><span>${d}</span><b>${w}</b></div>`).join('')}</div></div></div>`,
 `<h1>Pages</h1><span class="asub">${SITEPAGES.length} pages</span><span style="margin-left:auto"></span><button class="btn btn-p btn-s" onclick="openForm('newPage')">+ New page</button>`);

/* ---------------- CONTENT: ANNOUNCEMENTS ---------------- */
PAGES['admin/announcements']=()=>adminShell('announcements',`
 <div class="atbl"><table><thead><tr><th>Message</th><th>Kind</th><th>Starts</th><th>Ends</th><th>Shown on</th><th>Status</th></tr></thead><tbody>
 ${[['Free blood donation camp, Pishin branch, 12 September','Camp','now','20 Sep','strip · home · news','live'],['New building — final stage','Notice','3 Sep','—','news','live'],['Eid ul Adha hide collection','Appeal','1 Jun','20 Jun','strip · home','expired']].map(([m,k,s,e,w,st])=>`<tr><td class="m2"><div class="nm">${m}</div><div class="sm">${w}</div></td><td class="m1">${k}</td><td class="sm">${s}</td><td class="sm">${e}</td><td class="sm">${w}</td><td class="m3">${st==='live'?'<span class="tag ok">Live</span>':'<span class="tag gy">Expired</span>'}</td></tr>`).join('')}
 </tbody></table></div>
 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:16px">New announcement</h3>
 <div class="g2" style="gap:18px;align-items:start">
 <div><div class="fgrp"><label class="lb">Message</label><textarea class="fld" rows="3" placeholder="Keep it to one sentence."></textarea></div>
 <div class="g2" style="gap:12px"><div class="fgrp"><label class="lb">Starts</label><input class="fld" type="date"></div><div class="fgrp"><label class="lb">Ends</label><input class="fld" type="date"></div></div></div>
 <div><label class="lb">Where it appears</label>
 ${[['Strip across the top of every page',1],['Card on the home page',1],['The announcements page',1],['WhatsApp broadcast — when the bot is ready',0]].map(([t,on])=>`<label class="chk"><input type="checkbox" ${on?'checked':'disabled'}><span>${t}</span></label>`).join('')}
 <button class="btn btn-p" style="width:100%;margin-top:16px">Publish</button></div></div>
 <p class="ahint">An end date is required on urgent notices. The most common failing of a small organisation's website is a banner from two years ago that nobody remembered to remove.</p></div>`,
 `<h1>Announcements</h1><span class="asub">1 live</span><span style="margin-left:auto"></span><button class="btn btn-p btn-s" onclick="openForm('newAnnouncement')">+ New</button>`);

/* ---------------- CONTENT: EVENTS ---------------- */
PAGES['admin/events']=()=>adminShell('events',`
 <div class="akpi"><div class="c"><div class="l">Upcoming</div><div class="n r">3</div></div><div class="c"><div class="l">Registered to attend</div><div class="n">48</div></div><div class="c"><div class="l">Past events</div><div class="n">61</div></div><div class="c"><div class="l">Campaigns running</div><div class="n">1</div></div></div>
 <div class="atbl"><table><thead><tr><th>Event</th><th>Kind</th><th>Date</th><th>Town</th><th>Attending</th><th>Status</th></tr></thead><tbody>
 ${[['Free donation camp','Camp','12 Sep','Pishin','48','live'],['University awareness drive','Awareness','28 Sep','Quetta','—','draft'],['Eid ul Adha hide collection','Campaign','seasonal','All','—','live']].map(([n,k,d,c,a,s])=>`<tr><td class="m2"><div class="nm">${n}</div><div class="sm">${k} · ${c}</div></td><td class="m1">${k}</td><td class="sm">${d}</td><td>${c}</td><td>${a}</td><td class="m3">${s==='live'?'<span class="tag ok">Published</span>':'<span class="tag gy">Draft</span>'}</td></tr>`).join('')}
 </tbody></table></div>
 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:6px">Who is coming — Pishin camp</h3><p class="sm" style="margin-bottom:14px">People who registered on the website.</p>
 ${[['Hameed Ullah','O+','Pishin'],['Sana Gul','B−','Pishin'],['Abdul Manan','A+','Huramzai']].map(([n,g,c])=>`<div class="row" style="padding:11px 0;border-bottom:1px solid var(--line)">${bgTag(g)}<span style="flex:1;font-weight:600">${n}</span><span class="sm">${c}</span><button class="btn btn-o btn-s">Add to the register</button></div>`).join('')}
 <p class="ahint">A camp should grow the register. Adding an attendee straight to the donor list is the whole reason to take registrations here instead of on paper.</p></div>`,
 `<h1>Events &amp; campaigns</h1><span class="asub">3 upcoming</span><span style="margin-left:auto"></span><button class="btn btn-p btn-s" onclick="openForm('newEvent')">+ New event</button>`);

/* ---------------- CONTENT: MEDIA ---------------- */
PAGES['admin/media']=()=>adminShell('media',`
 <div class="dropzone">Drag photographs, posters or PDFs here</div>
 <div class="medgrid">${Array.from({length:10},(_,i)=>`<div class="medcard"><div class="ph" style="aspect-ratio:1"><image-slot id="media-${i+1}" shape="rect" placeholder="Drop a photo"></image-slot></div>
 <div style="padding:10px"><div class="sm">${['Camp','Ambulance','Building','Thalassemia','Eid','Staff','Camp','Awareness','Building','Camp'][i]}</div>
 <span class="tag ${i%3?'gy':'ok'}" style="margin-top:6px">${i%3?'Not used':'Used ×'+(i+1)}</span></div></div>`).join('')}</div>
 <div class="g2" style="gap:18px;margin-top:18px">
 <div class="acard"><h3 style="margin-bottom:6px">Upload once, use anywhere</h3><p class="sm">The gallery, publications, events, people and any page block all pick from this one library. "Used ×3" stops anyone deleting a photo that is live on three pages.</p></div>
 <div class="acard" style="border-color:#F0BDB6"><h3 style="margin-bottom:6px;color:var(--red-d)">Consent flag</h3><p class="sm">Photographs of patients or children carry a consent flag. Without it, the picker refuses to place the image on a public page — it is enforced, not a policy on paper.</p></div></div>`,
 `<h1>Media</h1><span class="asub">10 files</span><span style="margin-left:auto"></span><button class="btn btn-p btn-s" onclick="openForm('upload')">+ Upload</button>`);

/* ---------------- BRANCHES ---------------- */
const BR=[['Quetta','Zainab Chamber, Shara-e-Adalat','081-2836820','today',1],['Loralai','Sayed Abdul Qadir Road','0824-662066','2 days ago',0],['Pishin','Band Road','0826-421288','today',0],['Zhob','Sharbat Khan Road','0822-413902','9 days ago',0],['Chaman','Taj Road','—','never',0],['Muslim Bagh','Aryan Market','—','4 days ago',0]];
PAGES['admin/branches']=()=>adminShell('branches',`
 <div class="atbl"><table><thead><tr><th>Branch</th><th>Address</th><th>Phone</th><th>Donors</th><th>Stock updated</th></tr></thead><tbody>
 ${(SCOPE?BR.filter(b=>b[0]===SCOPE):BR).map(([n,a,p,u,h])=>`<tr><td class="m2"><div class="nm">${n}${h?' <span class="hd-tag">HEAD OFFICE</span>':''}</div><div class="sm">${a}</div></td><td class="sm">${a}</td><td class="mono2 m1">${p}</td><td>${townCount(n).toLocaleString()}</td><td class="m3 ${/never|9 days/.test(u)?'red':''}" style="font-weight:600">${u}</td></tr>`).join('')}
 </tbody></table></div>
 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:6px">Towns served without an office</h3><p class="sm" style="margin-bottom:14px">These feed the town list on every form across the website.</p>
 ${window.PBBTOWNS.filter(t=>!OFFICES.includes(t)).map(t=>`<span class="chip">${t}</span>`).join('')}<span class="chip" style="border-style:dashed;color:var(--red)">+ add a town</span></div>
 <p class="ahint">"Stock updated" is the accountability column. A branch that has not updated in a week is the reason the public shortage strip would go stale.</p>`,
 `<h1>Branches</h1><span class="asub">${SCOPE?SCOPE+' only':'6 offices · 14 towns'}</span><span style="margin-left:auto"></span>${hd('<button class="btn btn-p btn-s" onclick="openForm(&quot;addBranch&quot;)">+ Add branch</button>')}`);

/* ---------------- SITE SETTINGS ---------------- */
PAGES['admin/settings']=()=>adminShell('settings',`
 <div class="g2" style="gap:18px;align-items:start">
 <div class="acard"><h3 style="margin-bottom:16px">The organisation</h3>
 ${[['Name','Pashtoonkhwa Blood Bank & Welfare Society'],['Head office','Zainab Chamber, Shara-e-Adalat, Quetta'],['Phone','081-2836820'],['Second phone','081-2839500'],['Email','admin@pashtoonkhwabloodbank.org'],['Founded','24 March 1999']].map(([k,v])=>`<div class="fgrp"><label class="lb">${k}</label><input class="fld" value="${v}"></div>`).join('')}
 <button class="btn btn-p" style="width:100%">Save</button>
 <p class="ahint">Changed here, changed everywhere — the header, the footer, every contact block and every printed form.</p></div>
 <div>
 <div class="acard"><h3 style="margin-bottom:6px">Who can donate</h3><p class="sm" style="margin-bottom:16px">The same numbers the public Services page shows, so the two can never disagree.</p>
 ${[['Minimum age',18],['Maximum age',60],['Minimum weight (kg)',50],['Days between donations',90],['Most calls to one donor per day',2]].map(([k,v])=>`<div class="row" style="padding:10px 0;border-bottom:1px solid var(--line)"><span style="flex:1;font-weight:600">${k}</span><input class="fld" style="width:88px;text-align:center" value="${v}"></div>`).join('')}</div>
 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:16px">Languages</h3>
 ${[['English','default','ok'],['اردو Urdu','live','ok'],['پښتو Pashto','62% translated','wt']].map(([l,s,c])=>`<div class="row" style="padding:11px 0;border-bottom:1px solid var(--line)"><span style="flex:1;font-weight:600">${l}</span><span class="tag ${c}">${s}</span></div>`).join('')}
 <p class="ahint">A language stays switched off until it is complete. Anything untranslated falls back to English rather than showing blank.</p></div>
 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:16px">Switches</h3>
 ${[['Shortage strip on the home page',1],['Donor registration form',1],['Event registration',1],['WhatsApp button — when the bot is ready',0]].map(([t,on])=>`<label class="chk"><input type="checkbox" ${on?'checked':'disabled'}><span>${t}</span></label>`).join('')}</div>
 </div></div>`,`<h1>Site settings</h1>`);

/* ---------------- ROLES ---------------- */
const RLIST=[['Olus Yar','Everything, all fourteen towns, including deleting and managing staff',2],['Executive','All data and all towns; publishes the website. Cannot delete or manage staff',3],['Branch manager','One town. Runs requests, donors and stock for that town',6],['Coordinator','Answers requests and calls donors. No editing of records',4],['Data entry','Adds and edits donors and donations. No status changes',14],['Accounts','Donations and receipts only',2],['Verifier','Approves donor records. Sees no phone numbers',2],['Volunteer lead','Volunteers and events only',3]];
const PERMS=[['Donors','View',['All','All','Own town','Own town','Own town','—','All','—']],['Donors','Add and edit',['✓','✓','✓','✓','✓','—','—','—']],['Donors','Delete or merge',['✓','—','—','—','—','—','—','—']],['Requests','Answer and close',['✓','✓','✓','✓','—','—','—','—']],['Inventory','Update stock',['✓','—','✓','—','✓','—','—','—']],['Ledger','Record donations',['✓','✓','✓','✓','✓','✓','—','—']],['Money','Verify receipts',['✓','✓','—','—','—','✓','✓','—']],['Website','Edit and publish',['✓','✓','—','—','—','—','—','✓']],['Settings','Change the rules',['✓','—','—','—','—','—','—','—']],['Staff','Manage accounts',['✓','—','—','—','—','—','—','—']]];
PAGES['admin/roles']=()=>adminShell('roles',`
 <div class="rolegrid">${RLIST.map(([n,d,c])=>`<div class="acard" style="padding:16px"><b style="font-size:15px">${n}</b><p class="sm" style="margin-top:6px;line-height:1.5">${d}</p><span class="tag gy" style="margin-top:10px">${c} ${c===1?'person':'people'}</span></div>`).join('')}</div>
 <div class="acard" style="margin-top:18px;padding:0;overflow:auto"><div style="padding:20px 22px 10px"><h3>What each role can do</h3><p class="sm" style="margin-top:4px">Every cell is a switch. A new role starts as a copy of the nearest one.</p></div>
 <table class="permtbl"><thead><tr><th>Area</th><th>Action</th>${RLIST.map(r=>`<th>${r[0]}</th>`).join('')}</tr></thead><tbody>
 ${PERMS.map(([a,act,cells])=>`<tr><td class="pa">${a}</td><td class="pact">${act}</td>${cells.map(c=>`<td class="pc">${c==='✓'?'<span class="yes">✓</span>':c==='—'?'<span class="no2">—</span>':'<span class="scopetag">'+c+'</span>'}</td>`).join('')}</tr>`).join('')}
 </tbody></table></div>
 <div class="g2" style="gap:18px;margin-top:18px">
 <div class="acard"><h3 style="margin-bottom:6px">"Own town" is a rule in the database</h3><p class="sm">Not a hidden menu. A Zhob employee asking for donors gets Zhob rows — there is no address they can type that returns Quetta's. Try it with the role switcher.</p></div>
 <div class="acard" style="border-color:#F0BDB6"><h3 style="margin-bottom:6px;color:var(--red-d)">Three things nobody has by default</h3><p class="sm">Deleting a record, exporting the donor list, and granting a child's photo consent. Head office only, and each one is written to the log with a reason.</p></div></div>
 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:14px">Staff accounts</h3>
 <div class="atbl" style="border:0"><table><tbody>
 ${[['Olus Yar','Head office','All','now'],['Dr. Naseer Muhammad','Verifier','All','2 hours ago'],['Zhob coordinator','Branch manager','Zhob','yesterday'],['Pishin desk','Data entry','Pishin','3 days ago']].map(([n,r,t,l])=>`<tr><td class="m2"><div class="nm">${n}</div><div class="sm">${r} · ${t}</div></td><td class="m1">${r}</td><td>${t}</td><td class="m3 sm">${l}</td></tr>`).join('')}
 </tbody></table></div>
 <a href="#/admin/accounts" class="btn btn-o" style="margin-top:14px">Create an account instead</a></div>`,
 `<h1>Roles &amp; access</h1><span class="asub">8 roles · 36 people</span><span style="margin-left:auto"></span><button class="btn btn-p btn-s" onclick="openForm('newRole')">+ New role</button>`);
