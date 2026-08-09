/* PBB admin — partners, submissions inbox, network, reports, audit. */

/* ---------------- PARTNERS & ORGANISATIONS ---------------- */
const PARTNERS=[
{n:'Civil Hospital, Quetta',k:'Hospital',c:'Quetta',st:'active',since:'2004',note:'Highest referrer. Named coordinator assigned.'},
{n:'Bolan Medical Complex',k:'Hospital',c:'Quetta',st:'active',since:'2007',note:''},
{n:'DHQ Hospital, Zhob',k:'Hospital',c:'Zhob',st:'active',since:'2011',note:''},
{n:'Quetta Diagnostic Laboratory',k:'Laboratory',c:'Quetta',st:'pending',since:'—',note:'Offering overflow screening capacity. Awaiting committee.'},
{n:'Al-Khidmat Welfare Society',k:'Welfare society',c:'Loralai',st:'active',since:'2015',note:'Runs the Eid hide collection in Loralai.'},
{n:'Balochistan University',k:'University',c:'Quetta',st:'active',since:'2019',note:'Two campus drives a year.'},
{n:'Sherani Welfare Trust',k:'Welfare society',c:'Sherani',st:'pending',since:'—',note:'Asking for a branch in a town we serve without an office.'},
{n:'Rahmat Foundation',k:'Foundation',c:'—',st:'pending',since:'—',note:'Offering to fund screening kits for one year.'}];
PAGES['admin/partners']=()=>{
 const l=SCOPE?PARTNERS.filter(p=>p.c===SCOPE):PARTNERS,pend=l.filter(p=>p.st==='pending');
 return adminShell('partners',`
 ${pend.length?`<div class="alert"><div><b>${pend.length} ${pend.length===1?'organisation is':'organisations are'} waiting for a decision.</b> Each one has to be approved by the organising committee.</div></div>`:''}
 <div class="akpi">
 <div class="c"><div class="l">Active partners</div><div class="n">${l.filter(p=>p.st==='active').length}</div></div>
 <div class="c"><div class="l">Awaiting approval</div><div class="n r">${pend.length}</div></div>
 <div class="c"><div class="l">Hospitals</div><div class="n">${l.filter(p=>p.k==='Hospital').length}</div></div>
 <div class="c"><div class="l">Laboratories</div><div class="n">${l.filter(p=>p.k==='Laboratory').length}</div></div></div>
 <div class="atbl"><table><thead><tr><th>Organisation</th><th>Kind</th><th>Town</th><th>Partner since</th><th>Status</th></tr></thead><tbody>
 ${l.map(p=>`<tr onclick="openPartner('${p.n.replace(/'/g,"\\'")}')"><td class="m2"><div class="nm">${p.n}</div><div class="sm">${p.k} · ${p.c}${p.note?' · '+p.note:''}</div></td>
 <td class="m1">${p.k}</td><td>${p.c}</td><td class="sm">${p.since}</td>
 <td class="m3">${p.st==='active'?'<span class="tag ok">Active</span>':'<span class="tag no">Waiting</span>'}</td></tr>`).join('')}
 </tbody></table></div>
 <p class="ahint">Hospitals, laboratories, foundations, welfare societies, universities and other blood banks all live here. An approved partner gets a named coordinator, a direct line, and their logo on the public supporters page.</p>`,
 `<h1>Partners &amp; organisations</h1><span class="asub">${l.length} on the books</span><span style="margin-left:auto"></span>${hd('<button class="btn btn-p btn-s" onclick="openForm(&quot;addPartner&quot;)">+ Add organisation</button>')}${SCOPE?'<span class="sm">Head office approves partners</span>':''}`);
};
function openPartner(n){
 const p=PARTNERS.find(x=>x.n===n);if(!p)return;
 sheet(`<span class="tag ${p.st==='active'?'ok':'no'}">${p.st==='active'?'Active partner':'Waiting for a decision'}</span>
 <h2 style="margin:12px 0 4px">${p.n}</h2><div class="sm">${p.k} · ${p.c}</div>
 <div style="margin:22px 0">${[['Kind',p.k],['Town',p.c],['Partner since',p.since],['Coordinator',p.st==='active'?'Assigned':'Not yet'],['Logo on the website',p.st==='active'?'Yes':'No']].map(([k,v])=>`<div class="drow"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
 ${p.note?`<div class="ahint" style="margin:0 0 18px">${p.note}</div>`:''}
 ${p.st==='pending'?'<div class="row" style="gap:9px"><button class="btn btn-p" style="flex:1">Approve</button><button class="btn btn-o">Decline</button></div>':'<div class="row" style="gap:9px"><button class="btn btn-o" style="flex:1">Edit details</button><button class="btn btn-o">End partnership</button></div>'}`);
}

/* ---------------- SUBMISSIONS INBOX ---------------- */
PAGES['admin/inbox']=()=>{
 const subs=(S.submissions||[]);
 return adminShell('inbox',`
 <div class="row" style="gap:8px;margin-bottom:18px">${['Everything','Volunteers','Partners','Organisations','Messages','Donations'].map((f,i)=>`<button class="pill${i?'':' on'}" onclick="galPick(this)">${f}</button>`).join('')}</div>
 ${subs.length?`<div class="atbl"><table><thead><tr><th>From</th><th>Kind</th><th>Town</th><th>When</th><th>Status</th></tr></thead><tbody>
 ${subs.map((s,i)=>`<tr onclick="openSub(${i})"><td class="m2"><div class="nm">${s.name||s.org||'No name given'}</div><div class="sm">${s.kind} · ${s.phone||''}</div></td>
 <td class="m1">${s.kind}</td><td>${s.city||'—'}</td><td class="sm">${ago(s.at)}</td>
 <td class="m3"><span class="tag no">New</span></td></tr>`).join('')}</tbody></table></div>`
 :`<div class="acard aempty"><h3>Nothing waiting</h3><p style="margin-top:8px;max-width:46ch;margin-inline:auto">Every form on the public website lands here — volunteers, partner organisations, foundations, messages and donation receipts.</p>
 <p style="margin-top:14px"><a href="#/join/volunteer"><b>Try it: fill in the volunteer form →</b></a></p></div>`}
 <p class="ahint">The old website had a public comment box that displayed "sorry, no comments". Everything now arrives here instead, where somebody can be held responsible for answering it.</p>`,
 `<h1>Inbox</h1><span class="asub">${subs.length} waiting</span>`);
};
function openSub(i){
 const s=S.submissions[i];if(!s)return;
 sheet(`<span class="tag no">${s.kind}</span><h2 style="margin:12px 0 4px">${s.name||s.org||'No name given'}</h2><div class="sm">Received ${ago(s.at)}</div>
 <div style="margin:22px 0">${Object.entries(s).filter(([k])=>!['at','kind'].includes(k)&&s[k]).map(([k,v])=>`<div class="drow"><span>${k.replace(/^\w/,c=>c.toUpperCase())}</span><b>${v}</b></div>`).join('')}</div>
 <div class="row" style="gap:9px">${s.phone?`<a class="btn btn-p" style="flex:1" href="tel:${String(s.phone).replace(/ /g,'')}">Call</a><a class="btn btn-o" href="https://wa.me/92${String(s.phone).replace(/\D/g,'').replace(/^0/,'')}" target="_blank" rel="noopener">WhatsApp</a>`:''}</div>
 <button class="btn btn-d" style="width:100%;margin-top:12px">Mark as answered</button>`);
}

/* ---------------- NETWORK / CITIES ---------------- */
/* Standing, open requests and last stock update per town. The donor count is counted from the
   register by townCount() — no screen keeps its own copy of that number. */
/* Standing, open requests and last stock update, keyed by town. The list of towns itself is PBBTOWNS. */
const CITYINFO={Quetta:['Head office',4,'today'],Pishin:['Branch',1,'today'],Loralai:['Branch',0,'2 days'],Zhob:['Branch',1,'9 days'],Chaman:['Branch',0,'never'],'Muslim Bagh':['Branch',0,'4 days'],'Killa Saifullah':['Served from Muslim Bagh',0,'—'],Dukki:['Served from Loralai',0,'—'],Musakhel:['Served from Loralai',0,'—'],Sherani:['Served from Zhob',0,'—'],Harnai:['Served from Quetta',0,'—'],Ziarat:['Served from Quetta',0,'—'],'Qila Abdullah':['Served from Chaman',0,'—'],Sibi:['Served from Quetta',0,'—']};
const CITIES=()=>window.PBBTOWNS.map(t=>[t,...(CITYINFO[t]||['Served from Quetta',0,'—'])]);
PAGES['admin/network']=()=>adminShell('network',`
 <div class="akpi">
 <div class="c"><div class="l">Towns covered</div><div class="n">${window.PBBTOWNS.length}</div></div>
 <div class="c"><div class="l">With a permanent office</div><div class="n">6</div></div>
 <div class="c"><div class="l">Donors across the network</div><div class="n">${S.donors.length.toLocaleString()}</div></div>
 <div class="c"><div class="l">Open requests, all towns</div><div class="n r">${CITIES().reduce((a,c)=>a+c[2],0)}</div></div></div>
 <div class="atbl"><table><thead><tr><th>Town</th><th>Standing</th><th>Donors</th><th>Open requests</th><th>Stock updated</th></tr></thead><tbody>
 ${CITIES().map(([n,k,r,u])=>`<tr><td class="m2"><div class="nm">${n}</div><div class="sm">${k}</div></td><td class="m1 sm">${k}</td><td>${townCount(n).toLocaleString()}</td>
 <td>${r?`<span class="tag no">${r}</span>`:'<span class="sm">—</span>'}</td>
 <td class="m3 ${/never|9 days/.test(u)?'red':'sm'}" style="font-weight:600">${u}</td></tr>`).join('')}
 </tbody></table></div>
 <div class="g2" style="gap:18px;margin-top:18px">
 <div class="acard"><h3 style="margin-bottom:6px">Adding a town</h3><p class="sm">A town joins when the organising committee approves it and appoints a manager. It starts with its own empty register and its own staff accounts — nothing is shared until somebody chooses to share it.</p>
 <button class="btn btn-o" style="margin-top:16px" onclick="openForm('addTown')">Add a town</button></div>
 <div class="acard"><h3 style="margin-bottom:6px">When one town cannot help</h3><p class="sm">Any branch can see what every other branch holds — stock and open requests, never personal details. Donors are only called by their own town unless they have agreed to be contacted from elsewhere, which is on by default.</p></div></div>
 <p class="ahint">Built for fourteen towns today and for whatever comes after. Nothing in the design assumes there is only one organisation.</p>`,
 `<h1>The network</h1><span class="asub">14 towns</span><span style="margin-left:auto"></span>${hd('<button class="btn btn-p btn-s" onclick="openForm(&quot;addTown&quot;)">+ Add a town</button>')}`);

/* ---------------- REPORTS ---------------- */
/* Requests, answer rate and response time per town. The donor count is counted, never stored. */
const TOWNROWS=[['Quetta',312,'91%','1h 52m',2984],['Pishin',108,'88%','2h 30m',612],['Loralai',74,'84%','3h 05m',418],['Zhob',96,'79%','4h 12m',502],['Chaman',63,'76%','4h 40m',186],['Muslim Bagh',41,'82%','3h 20m',110]];
PAGES['admin/reports']=()=>{
 const rows=SCOPE?TOWNROWS.filter(r=>r[0]===SCOPE):TOWNROWS;
 const t=rows[0]||['—',0,'—','—',0];
 const K=SCOPE?[['Bags this year',t[4].toLocaleString()],['Requests answered',t[2]],['Typical time to a donor',t[3]],['Donors who came back','31%']]
              :[['Bags this year',TOWNROWS.reduce((a,r)=>a+r[4],0).toLocaleString()],['Requests answered','86%'],['Typical time to a donor',hhmm(resp()[0])],['Donors who came back','38%']];
 return adminShell('reports',`
 <div class="akpi">
 ${K.map(([l,v],i)=>`<div class="c"><div class="l">${l}</div><div class="n${i===2?' r':''}">${v}</div></div>`).join('')}</div>
 <div class="g2" style="gap:18px;align-items:start">
 <div class="acard"><h3 style="margin-bottom:4px">Bags each month</h3><p class="sm" style="margin-bottom:16px">Twelve months to September</p>
 <div class="chart" style="height:170px">${[46,58,52,71,64,80,74,90,66,85,78,100].map((v,i)=>`<div class="bar${i===11?' pk':''}" style="height:${v}%"><span>${['Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'][i]} · ${Math.round(v*5.4)} bags</span></div>`).join('')}</div>
 <div class="axis"><span>Oct</span><span>Sep</span></div></div>
 <div class="acard"><h3 style="margin-bottom:4px">Where the register is thin</h3><p class="sm" style="margin-bottom:16px">Donors held against how often that group is asked for</p>
 ${[['O−',163,'thin'],['AB−',45,'thin'],['B−',124,'thin'],['A−',97,'thin'],['AB+',188,''],['A+',498,''],['B+',561,''],['O+',742,'']].map(([g,v,c])=>`<div class="hbar"><span class="hn">${g}</span><span class="ht"><i class="${c?'r':''}" style="width:${Math.round(v/742*100)}%"></i></span><span class="hv">${v}</span></div>`).join('')}
 <p class="ahint" style="margin-top:16px">The four negative groups are where every shortage comes from. A campaign aimed only at them would be worth more than a general one.</p></div>
 </div>
 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:16px">By town</h3>
 <div class="atbl" style="border:0"><table><thead><tr><th>Town</th><th>Donors</th><th>Requests</th><th>Answered</th><th>Typical time</th></tr></thead><tbody>
 ${rows.map(r=>`<tr><td class="m2"><div class="nm">${r[0]}</div><div class="sm">${townCount(r[0]).toLocaleString()} ${townCount(r[0])===1?'donor':'donors'} · ${r[2]} answered</div></td><td>${townCount(r[0]).toLocaleString()}</td><td class="m1">${r[1]}</td><td>${r[2]}</td><td class="m3">${r[3]}</td></tr>`).join('')}
 </tbody></table></div>${SCOPE?'<p class="ahint" style="margin-top:14px">These are the '+SCOPE+' figures. The head office holds the organisation-wide totals.</p>':''}</div>`,
 `<h1>Reports</h1><span class="asub">${SCOPE?SCOPE+' · twelve months':'Twelve months'}</span><span style="margin-left:auto"></span>${hd('<button class="btn btn-o btn-s">Export</button>')}<button class="btn btn-p btn-s">Print for the committee</button>`)};

/* ---------------- AUDIT ---------------- */
const LOG=[['2 minutes ago','Pishin desk','Added a donor','Pishin'],['18 minutes ago','Website','A blood request came in','Quetta'],['1 hour ago','Zhob coordinator','Marked a request arranged','Zhob'],['2 hours ago','Dr. Naseer Muhammad','Verified 4 donor records','All'],['Yesterday','Olus Yar','Granted photo consent for T-027','Pishin'],['Yesterday','Head office','Exported the donor list — reason: annual audit','All'],['Yesterday','Zhob coordinator','Added 2 donors','Zhob'],['2 days ago','Zhob coordinator','Updated stock','Zhob']];
PAGES['admin/audit']=()=>{
 /* A branch sees its own town and nothing else — including no sight of an export it was not party to. */
 const rows=SCOPE?LOG.filter(r=>r[3]===SCOPE):LOG;
 return adminShell('audit',`
 <div class="atbl"><table><thead><tr><th>When</th><th>Who</th><th>What</th><th>Town</th></tr></thead><tbody>
 ${rows.map(([w,who,what,t])=>`<tr><td class="m1 sm">${w}</td><td class="m2"><div class="nm">${who}</div><div class="sm">${what}</div></td><td>${what}</td><td class="m3 sm">${t}</td></tr>`).join('')}
 </tbody></table></div>
 <div class="g2" style="gap:18px;margin-top:18px">
 <div class="acard"><h3 style="margin-bottom:6px">The log cannot be edited</h3><p class="sm">Not by branch staff, and not by the head office. An organisation that holds other people\u2019s telephone numbers should be able to show exactly who looked at them.</p></div>
 <div class="acard" style="border-color:#F0BDB6"><h3 style="margin-bottom:6px;color:var(--red-d)">Three things that always ask why</h3><p class="sm">Deleting a record, exporting the donor list, and granting a child\u2019s photo consent. Each writes a line here with the reason typed by the person who did it.</p></div></div>
 ${SCOPE?'<p class="ahint">This is the '+SCOPE+' log. Anything done in another town, and anything done across the whole organisation, is visible only to the head office.</p>':''}`,
 `<h1>Log</h1><span class="asub">${SCOPE?'Everything changed in '+SCOPE:'Everything that has been changed'}</span>`)};
