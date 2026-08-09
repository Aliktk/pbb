/* PBB — admin app. Shares the store with the public site. */
const DB={
 get k(){return 'pbb-store'},
 load(){try{return JSON.parse(localStorage.getItem(this.k))||null}catch(e){return null}},
 save(d){try{localStorage.setItem(this.k,JSON.stringify(d))}catch(e){}},
};
/* The Chaman branch Donor Diary carries these columns. Everything the book held is kept;
   what it could not hold — a screening date, a deferral, an eligibility that changes by itself — is added. */
const ISSUE={'W/O/R':'Without replacement','W/R':'With replacement','P/D':'Patient donation'};
const TESTS=[['hcv','HCV'],['hiv','HIV'],['hbs','HBs/IG'],['vdrl','VDRL'],['mp','MP']];
const FREQ=['Every 3 months','Every 6 months','Every year'];
const dref={mr:'',dob:'',emg:'',emgr:'',addr:'',ml:350,freq:'Every 6 months',issue:'W/O/R',tests:null,tested:null,defer:null};
const D=(d,k)=>d[k]!==undefined&&d[k]!==null?d[k]:dref[k];
const clean=d=>{const t=D(d,'tests');return t?TESTS.every(([k])=>t[k]==='-ve'):null};
const SEED={donors:[
{id:1,n:'Abdul Samad Kakar',g:'O−',p:'0300 3815590',c:'Quetta',last:'2026-05-07',times:4,mr:'CHM-0142',dob:'1991-02-14',emg:'Bilal Kakar',emgr:'Brother',addr:'Mohallah Killi Deba, Quetta',ml:350,freq:'Every 3 months',issue:'W/O/R',tests:{hcv:'-ve',hiv:'-ve',hbs:'-ve',vdrl:'-ve',mp:'-ve'},tested:'2026-05-07',defer:null},
{id:2,n:'Muhammad Ayaz',g:'B+',p:'0333 7828121',c:'Pishin',last:'2026-07-19',times:2,mr:'PSH-0088',dob:'1998-11-02',emg:'Rehmat Ullah',emgr:'Cousin',addr:'Band Road, Pishin',ml:450,freq:'Every 6 months',issue:'W/R',tests:{hcv:'-ve',hiv:'-ve',hbs:'-ve',vdrl:'-ve',mp:'-ve'},tested:'2026-07-19',defer:null},
{id:3,n:'Naseebullah Achakzai',g:'A+',p:'0312 2044810',c:'Quetta',last:null,times:0,mr:'QTA-0311',dob:'1986-06-30',emg:'Sana Gul',emgr:'Wife',addr:'Sariab Road, Quetta',ml:350,freq:'Every year',issue:'W/O/R',tests:null,tested:null,defer:null},
{id:4,n:'Hameedullah Tareen',g:'O−',p:'0301 3390211',c:'Quetta',last:'2026-04-01',times:2,mr:'QTA-0287',dob:'1994-01-09',emg:'Hidayat Khan',emgr:'Father',addr:'Jinnah Road, Quetta',ml:350,freq:'Every 3 months',issue:'W/O/R',tests:{hcv:'-ve',hiv:'-ve',hbs:'-ve',vdrl:'-ve',mp:'-ve'},tested:'2026-04-01',defer:null},
{id:5,n:'Shah Muhammad',g:'AB+',p:'0345 8102299',c:'Zhob',last:'2026-06-06',times:3,mr:'ZHB-0074',dob:'1989-08-21',emg:'Shah Nawaz',emgr:'Brother',addr:'Sharbat Khan Road, Zhob',ml:450,freq:'Every 6 months',issue:'W/O/R',tests:{hcv:'-ve',hiv:'-ve',hbs:'-ve',vdrl:'-ve',mp:'-ve'},tested:'2026-06-06',defer:null},
{id:6,n:'Zahoor Ahmed Kasi',g:'O+',p:'0322 5541780',c:'Loralai',last:'2026-01-09',times:6,mr:'LRL-0119',dob:'1979-04-17',emg:'Zahoor Bibi',emgr:'Wife',addr:'Sayed Abdul Qadir Road, Loralai',ml:350,freq:'Every 6 months',issue:'W/R',tests:{hcv:'-ve',hiv:'-ve',hbs:'-ve',vdrl:'-ve',mp:'-ve'},tested:'2026-01-09',defer:null},
{id:7,n:'Bilal Khan Nasar',g:'B−',p:'0311 7788321',c:'Quetta',last:'2026-07-02',times:1,mr:'QTA-0402',dob:'2001-12-05',emg:'Nasar Khan',emgr:'Father',addr:'Killi Shabo, Quetta',ml:350,freq:'Every 3 months',issue:'W/O/R',tests:{hcv:'-ve',hiv:'-ve',hbs:'-ve',vdrl:'-ve',mp:'-ve'},tested:'2026-07-02',defer:null},
{id:8,n:'Sanaullah Mandokhail',g:'A−',p:'0335 9021144',c:'Muslim Bagh',last:'2026-03-06',times:2,mr:'MSB-0033',dob:'1992-03-28',emg:'Sanaullah Khan',emgr:'Brother',addr:'Bazaar Road, Muslim Bagh',ml:350,freq:'Every year',issue:'W/O/R',tests:{hcv:'-ve',hiv:'-ve',hbs:'-ve',vdrl:'-ve',mp:'-ve'},tested:'2026-03-06',defer:null},
{id:9,n:'Israrullah Khan',g:'O−',p:'0313 5590128',c:'Quetta',last:'2026-02-19',times:6,mr:'QTA-0198',dob:'1984-09-12',emg:'Israr Bibi',emgr:'Wife',addr:'Alamdar Road, Quetta',ml:450,freq:'Every 3 months',issue:'W/O/R',tests:{hcv:'-ve',hiv:'-ve',hbs:'-ve',vdrl:'-ve',mp:'-ve'},tested:'2026-02-19',defer:null},
{id:10,n:'Noor Muhammad Shahwani',g:'O−',p:'0344 2201933',c:'Quetta',last:'2026-01-18',times:1,mr:'QTA-0356',dob:'1996-05-23',emg:'Noor Ahmed',emgr:'Brother',addr:'Brewery Road, Quetta',ml:350,freq:'Every 6 months',issue:'W/O/R',tests:{hcv:'-ve',hiv:'-ve',hbs:'-ve',vdrl:'-ve',mp:'-ve'},tested:'2026-01-18',defer:null},
{id:11,n:'Waheed Achakzai',g:'O−',p:'0300 8811274',c:'Quetta',last:'2025-12-07',times:3,mr:'KCH-0021',dob:'1988-10-08',emg:'Waheed Gul',emgr:'Cousin',addr:'Kuchlak Bazaar',ml:350,freq:'Every year',issue:'W/O/R',tests:{hcv:'-ve',hiv:'-ve',hbs:'-ve',vdrl:'-ve',mp:'-ve'},tested:'2025-12-07',defer:null},
{id:12,n:'Farhan Ali Raisani',g:'O−',p:'0332 4419902',c:'Quetta',last:null,times:0,mr:'QTA-0433',dob:'2000-07-19',emg:'Farhan Raisani',emgr:'Brother',addr:'Samungli Road, Quetta',ml:350,freq:'Every 6 months',issue:'W/O/R',tests:null,tested:null,defer:null},
{id:13,n:'Gul Khan Tareen',g:'A+',p:'0300 4412876',c:'Zhob',last:'2026-06-28',times:5,mr:'ZHB-0090',dob:'1990-02-02',emg:'Gul Bibi',emgr:'Mother',addr:'Sharbat Khan Road, Zhob',ml:450,freq:'Every 3 months',issue:'W/R',tests:{hcv:'-ve',hiv:'-ve',hbs:'-ve',vdrl:'-ve',mp:'-ve'},tested:'2026-06-28',defer:null},
{id:14,n:'Rehmat Ullah',g:'B+',p:'0345 1129983',c:'Pishin',last:null,times:0,mr:'PSH-0102',dob:'1997-06-14',emg:'Rehmat Gul',emgr:'Brother',addr:'Band Road, Pishin',ml:350,freq:'Every year',issue:'W/O/R',tests:null,tested:null,defer:null}],
requests:[
{id:'PBB-1006',pt:'Bibi Zarina',hosp:'Civil Hospital, Quetta',g:'O−',u:3,c:'Quetta',urg:'Critical — today',by:'Brother',ph:'0300 4412201',at:Date.now()-22*60000,st:'open',src:'web',called:[]},
{id:'PBB-1005',pt:'Abdul Wahid',hosp:'BMC, Quetta',g:'B−',u:2,c:'Quetta',urg:'Urgent — within 2 days',by:'Father',ph:'0333 5590128',at:Date.now()-3600000,st:'open',src:'phone',called:[]},
{id:'PBB-1004',pt:'Gul Bibi',hosp:'DHQ Hospital, Zhob',g:'A+',u:1,c:'Zhob',urg:'Planned — a date is set',by:'Son',ph:'0345 2201933',at:Date.now()-10800000,st:'open',src:'phone',called:[]},
{id:'PBB-0998',pt:'Sultan Ahmed',hosp:'Sandeman Hospital',g:'A−',u:1,c:'Quetta',urg:'Urgent — within 2 days',by:'Friend',ph:'0311 8811274',at:Date.now()-86400000,st:'done',src:'web',called:[]}],
submissions:[],
donations:[{d:'2026-08-09',n:'Sultan Ahmed',g:'A−',bags:1,c:'Quetta'},{d:'2026-08-09',n:'Zarak Khan',g:'O+',bags:1,c:'Quetta'}],
seq:1007};
let S=DB.load()||JSON.parse(JSON.stringify(SEED));
function persist(){DB.save(S)}
/* A store written before the diary fields existed must be brought forward, not thrown away —
   the branch's own added donors live in it. Backfill from the seed by id, then fill the rest with defaults. */
const TOWNS14=window.PBBTOWNS,SERVEDFROM=window.PBBSERVEDFROM;
(function migrate(){
 if(!S.schema||S.schema<2){
  const byId={};SEED.donors.forEach(d=>byId[d.id]=d);
  S.donors=(S.donors||[]).map(d=>{
   const seed=byId[d.id]||{};
   const out={...d};
   for(const k of ['mr','dob','emg','emgr','addr','ml','freq','issue','tests','tested','defer'])
    if(out[k]===undefined)out[k]=seed[k]!==undefined?seed[k]:dref[k];
   return out;
  });
  S.schema=2;
 }
 if(S.schema<3){
  /* A donor whose town is not one PBB lists cannot be filtered, searched or counted — they are
     invisible to everybody except whoever happens to scroll past them. Re-home them to the serving office. */
  S.donors.forEach(d=>{if(!TOWNS14.includes(d.c))d.c=SERVEDFROM[d.c]||'Quetta'});
  S.schema=3;
 }
 persist();
})();
window.PBBSTORE={
 addRequest(r){r.id='PBB-'+(S.seq++);r.at=Date.now();r.st='open';r.called=[];S.requests.unshift(r);persist();return r.id},
 addDonor(d){d.id=Date.now();d.times=0;S.donors.unshift(d);persist()},
 addSubmission(x){S.submissions=S.submissions||[];S.submissions.unshift(x);persist()}
};

/* ---- helpers ---- */
const TOWNS_A=window.PBBTOWNS;
/* The six with an office of their own — used where a branch is meant, not a town. */
const OFFICES=['Quetta','Pishin','Zhob','Loralai','Chaman','Muslim Bagh'];
const GROUPS_A=['O+','O−','A+','A−','B+','B−','AB+','AB−'];
let SCOPE=null,ROLE='head';
const ALLOW={
 head:null,
 mgr:['overview','requests','find','inventory','inbox','whatsapp','donors','volunteers','thalassemia','ledger','record','partners','reports','branches','accounts','audit','profile'],
 emp:['overview','requests','find','inventory','donors','record','profile']};
const LANDING={head:'overview',mgr:'overview',emp:'requests'};
function can(v){const a=ALLOW[ROLE];return !a||a.includes(v)}
/* head-office-only markup: an action nobody below may take is not shown at all, never shown greyed */
const hd=h=>ROLE==='head'?h:'';
window.PBBCAN=can;window.PBBLANDING=()=>LANDING[ROLE]||'overview';
const ROLES={
 head:{who:'Head office',sub:'Sees all fourteen towns',scope:null,email:'admin@pashtoonkhwabloodbank.org',phone:'081-2836820',office:'Zainab Chamber, Shara-e-Adalat, Quetta'},
 mgr:{who:'Zhob branch manager',sub:'Sees Zhob only',scope:'Zhob',email:'zhob@pashtoonkhwabloodbank.org',phone:'0822-413902',office:'Sharbat Khan Road, Zhob'},
 emp:{who:'Data entry, Pishin',sub:'Adds and edits donors',scope:'Pishin',email:'pishin@pashtoonkhwabloodbank.org',phone:'0826-421288',office:'Band Road, Pishin'}};
const days=d=>d?Math.floor((Date.now()-new Date(d))/86400000):null;
const scoped=a=>SCOPE?a.filter(x=>x.c===SCOPE):a;
/* The only place a town's donor count comes from. Four screens used to keep their own figure. */
const townCount=t=>S.donors.filter(d=>d.c===t).length;
const ago=t=>{const m=Math.floor((Date.now()-t)/60000);return m<60?m+' min ago':m<1440?Math.floor(m/60)+' hr ago':Math.floor(m/1440)+' d ago'};
const bgTag=g=>`<span class="abg${g.includes('−')?' r':''}">${g}</span>`;
/* A donor is callable only if all four hold: not deferred, screened, clear, and past the ninety days.
   The register, the record sheet and the search all read this — so they cannot disagree. */
function elig(d){
 if(D(d,'defer'))return{ok:0,tag:'no',lab:'Deferred',why:'Deferred — '+D(d,'defer')};
 const t=D(d,'tests');
 if(!t)return{ok:0,tag:'gy',lab:'Not screened',why:'Not screened — the five tests must be done first'};
 if(!clean(d))return{ok:0,tag:'no',lab:'Reactive',why:'A screening result was reactive. Do not call.'};
 const td=D(d,'tested'),sd=td?days(td):null;
 if(sd!==null&&sd>180)return{ok:0,tag:'wt',lab:'Screen again',why:'Screened '+sd+' days ago. Repeat before issuing.'};
 const n=days(d.last);
 if(n!==null&&n<90)return{ok:0,tag:'wt',lab:(90-n)+' days to wait',why:'Can give again in '+(90-n)+' days'};
 return{ok:1,tag:'ok',lab:'Can give',why:'Yes, today'};
}
const eligTag=d=>{const e=elig(d);return `<span class="tag ${e.tag}">${e.lab}</span>`};

/* ---- shell ---- */
const AGROUPS=[['Operations',[['overview','Overview'],['requests','Blood requests'],['find','Find donors'],['inventory','Inventory'],['inbox','Inbox'],['whatsapp','WhatsApp']]],
['Registry',[['donors','Donors'],['volunteers','Volunteers'],['thalassemia','Thalassemia'],['ledger','Donations ledger'],['record','Record a donation']]],
['Content',[['homepage','Homepage'],['pages','Pages'],['announcements','Announcements'],['events','Events'],['media','Media']]],
['Network',[['network','All towns'],['partners','Partners &amp; organisations'],['reports','Reports']]],
['Organisation',[['branches','Branches'],['settings','Site settings'],['accounts','Accounts &amp; hierarchy'],['roles','Roles &amp; access'],['data','Data'],['audit','Log']]],
['You',[['profile','Your account']]]];
const ANAV=[['overview','Overview','◎'],['requests','Requests','✚'],['donors','Donors','≡'],['find','Find','⌕']];
function adminShell(view,body,bar){
 const r=ROLES[ROLE];
 return `<div class="adm"><aside class="aside">
 <a href="#/admin/${LANDING[ROLE]||'overview'}" class="abrand"><img src="assets/pbb-logo.png" alt=""><span>Blood Register<small>${SCOPE||'All branches'}</small></span></a>
 ${AGROUPS.map(([g,items])=>{const vis=items.filter(([v])=>can(v));return vis.length?`<div class="agp">${g}</div>`+vis.map(([v,l])=>`<a href="#/admin/${v}" class="anav${v===view?' on':''}">${l}${v==='requests'?`<span class="ct">${scoped(S.requests).filter(x=>x.st==='open').length}</span>`:v==='inventory'?'<span class="ct">1</span>':''}</a>`).join(''):''}).join('')}
 <div class="awho">Signed in as<b>${r.who}</b>${r.sub}<a href="#/" class="alogout">Back to website</a></div>
 </aside><div class="amain">
 <div class="abar">${bar}<div class="roleswitch">${Object.entries(ROLES).map(([k,v])=>`<button class="${k===ROLE?'on':''}" onclick="setRole('${k}')" title="View as ${v.who}">${v.who.split(',')[0].replace(' branch manager','')}</button>`).join('')}</div></div><div class="acont">${body}</div></div></div>
 <div class="mobbar">${ANAV.filter(([v])=>can(v)).map(([v,l,i])=>`<a href="#/admin/${v}"${v===view?' class="on"':''}><b>${i}</b>${l.split(' ')[0]}</a>`).join('')}</div>
 `;
}
function setRole(k){ROLE=k;SCOPE=ROLES[k].scope;const cur=(location.hash.replace(/^#\/?admin\/?/,'')||'').split('?')[0];if(!can(cur)){location.hash='#/admin/'+(LANDING[k]||'overview');return}route()}

/* ---- donors ---- */
PAGES['admin/donors']=()=>{
 const list=scoped(S.donors);
 return adminShell('donors',`
 <div class="afilters">
 <input class="fld" style="flex:1;min-width:190px" placeholder="Search name, phone or MR number…" oninput="fDonors(this.value)" id="dSearch">
 <select class="fld" style="width:auto" id="dGroup" onchange="fDonors()"><option value="">All groups</option>${GROUPS_A.map(g=>`<option>${g}</option>`).join('')}</select>
 ${SCOPE?'':`<select class="fld" style="width:auto" id="dCity" onchange="fDonors()"><option value="">All towns</option>${TOWNS_A.map(t=>`<option>${t}</option>`).join('')}</select>`}
 </div>
 <div class="atbl"><table><thead><tr><th>MR No</th><th>Name</th><th>Group</th><th>Phone</th><th>Town</th><th>Screened</th><th>Last donated</th><th>Status</th></tr></thead><tbody id="dRows">${donorRows(list)}</tbody></table></div>
 <p class="ahint">Every column of the branch Donor Diary is here — MR number, group and RH, age, contact, emergency contact and relationship, address, quantity, frequency, mode of issue, and the five screening results. What the book could not do is work out for itself whether somebody can give <b>today</b>, or that a screening result has gone stale. That is the whole difference.</p>`,
 `<h1>Donor register</h1><span class="asub" id="dCount">${list.length} ${list.length===1?'donor':'donors'}</span><span style="margin-left:auto"></span><button class="btn btn-p btn-s" onclick="openSheet('addDonor')">+ Add donor</button>`);
};
const screenTag=d=>{const c=clean(d);return c===null?'<span class="tag gy">Not screened</span>':c?'<span class="tag ok">Clear</span>':'<span class="tag no">Reactive</span>'};
const donorRows=l=>l.length?l.map(d=>`<tr onclick="openDonor(${d.id})">
 <td class="mono2 m1">${D(d,'mr')||'—'}</td>
 <td class="m2"><div class="nm">${d.n}</div><div class="sm">${D(d,'mr')||d.c} · ${d.p}</div></td>
 <td>${bgTag(d.g)}</td><td class="mono2 m1">${d.p}</td><td class="m1">${d.c}</td>
 <td class="m3">${screenTag(d)}</td>
 <td>${d.last?days(d.last)+' days ago':'<span class="sm">Never</span>'}</td><td class="m3">${eligTag(d)}</td></tr>`).join('')
 :'<tr><td colspan="8" class="aempty">No donors match. <b>Add the first one.</b></td></tr>';
function fDonors(q){
 const s=(q||document.getElementById('dSearch').value||'').toLowerCase();
 const g=document.getElementById('dGroup').value,cEl=document.getElementById('dCity'),c=SCOPE||(cEl?cEl.value:'');
 const l=scoped(S.donors).filter(d=>(!s||d.n.toLowerCase().includes(s)||d.p.includes(s)||(D(d,'mr')||'').toLowerCase().includes(s))&&(!g||d.g===g)&&(!c||d.c===c));
 document.getElementById('dRows').innerHTML=donorRows(l);
 document.getElementById('dCount').textContent=l.length+(l.length===1?' donor':' donors')+(SCOPE?' in '+SCOPE:'');
}

/* ---- find ---- */
let findG='O−';
PAGES['admin/find']=()=>{setTimeout(runFind,0);return adminShell('find',`
 <div class="acard">
 <label class="lb">Which blood group is needed?</label>
 <div class="row" style="gap:8px;margin-bottom:20px" id="fBg">${GROUPS_A.map(g=>`<button class="bgp${g===findG?' on':''}" onclick="setFindG('${g}')">${g}</button>`).join('')}</div>
 <div class="g2" style="gap:14px">
 <div><label class="lb">Town</label><select class="fld" id="fCity" onchange="runFind()" ${SCOPE?'disabled':''}>${(SCOPE?[SCOPE]:TOWNS_A).map(t=>`<option>${t}</option>`).join('')}</select></div>
 <div><label class="lb">Show</label><select class="fld" id="fElig" onchange="runFind()"><option>Only those who can give today</option><option>Everyone, including cooldown</option></select></div>
 </div></div>
 <div class="row" style="margin:20px 0 14px"><h3 id="fCount">—</h3></div>
 <div id="fRows"></div>
 <p class="ahint">Ordered by <b>longest since last donation</b>, so the calls spread around instead of exhausting the same three willing people. Press <b>Called</b> and the next person on shift sees it.</p>`,
 `<h1>Find a donor</h1><span class="asub">Instead of turning pages</span>`)};
function setFindG(g){findG=g;document.querySelectorAll('#fBg .bgp').forEach(b=>b.classList.toggle('on',b.textContent===g));runFind()}
function runFind(){
 const city=SCOPE||document.getElementById('fCity').value;
 const onlyElig=document.getElementById('fElig').selectedIndex===0;
 let l=S.donors.filter(d=>d.g===findG&&d.c===city);
 if(onlyElig)l=l.filter(d=>elig(d).ok);
 l.sort((a,b)=>(days(b.last)??9999)-(days(a.last)??9999));
 document.getElementById('fCount').textContent=l.length?`${l.length} ${l.length===1?'donor':'donors'} can give ${findG} in ${city}`:`Nobody on the ${city} register can give ${findG} today`;
 document.getElementById('fRows').innerHTML=l.length?l.map(d=>`<div class="frow">
 <div style="flex:1;min-width:170px"><div class="nm">${d.n}</div><div class="sm">${d.times?d.times+' donations':'never donated'} · ${d.last?days(d.last)+' days since last':'no record of a donation'}</div></div>
 <div class="mono2" style="font-weight:700">${d.p}</div>
 <a class="btn btn-p btn-s" href="tel:${d.p.replace(/ /g,'')}">Call</a>
 <button class="btn btn-o btn-s" onclick="markCalled(this)">Mark called</button></div>`).join('')
 :`<div class="acard aempty"><h3>Nobody available</h3><p style="margin-top:8px">Widen to “everyone including cooldown”, or phone the head office in Quetta on <b>081-2836820</b> and ask them to look on their register.</p></div>`;
}
function markCalled(b){b.classList.toggle('btn-d');b.textContent=b.textContent==='Called'?'Mark called':'Called'}

/* ---- requests ---- */
PAGES['admin/requests']=()=>{
 const l=scoped(S.requests),open=l.filter(r=>r.st==='open');
 return adminShell('requests',`
 <div class="akpi">
 <div class="c"><div class="l">Open now</div><div class="n r">${open.length}</div></div>
 <div class="c"><div class="l">Arranged</div><div class="n">${l.filter(r=>r.st==='done').length}</div></div>
 <div class="c"><div class="l">Donors on register</div><div class="n">${scoped(S.donors).length}</div></div>
 <div class="c"><div class="l">Recorded today</div><div class="n">${S.donations.length}</div></div></div>
 <div class="atbl"><table><thead><tr><th>Patient / hospital</th><th>Group</th><th>Units</th><th>Town</th><th>Asked</th><th>Status</th></tr></thead><tbody>
 ${l.length?l.map(r=>`<tr onclick="openReq('${r.id}')">
 <td class="m2"><div class="nm">${r.hosp}</div><div class="sm">${r.pt||'Patient name not given'} · ${r.id}${r.src==='web'?' · from the website':''}</div></td>
 <td class="m1">${bgTag(r.g)}</td><td>${r.u}</td><td>${r.c}</td><td class="sm">${ago(r.at)}</td>
 <td class="m3">${r.st==='open'?'<span class="tag no">Open</span>':'<span class="tag ok">Arranged</span>'}</td></tr>`).join('')
 :'<tr><td colspan="6" class="aempty">No requests yet.</td></tr>'}
 </tbody></table></div>
 <p class="ahint">A list, not a board. Requests sent from the public website land here the moment they are submitted — <b>try it: submit one on the site and come back.</b></p>`,
 `<h1>Blood requests</h1><span class="asub">${open.length} open</span><span style="margin-left:auto"></span><button class="btn btn-p btn-s" onclick="openSheet('newReq')">+ New request</button>`);
};
function openReq(id){
 const r=S.requests.find(x=>x.id===id);if(!r)return;
 sheet(`<span class="tag ${r.st==='open'?'no':'ok'}">${r.st==='open'?'Open':'Arranged'}</span>
 <h2 style="margin:12px 0 4px">${bgTag(r.g)} <span style="margin-left:8px">${r.u} ${r.u===1?'unit':'units'}</span></h2>
 <div class="mono2" style="color:var(--mid)">${r.id} · asked ${ago(r.at)}${r.src==='web'?' · from the website':''}</div>
 <div style="margin:22px 0">
 ${[['Patient',r.pt],['Gender',r.gender],['Age',r.age&&r.age+' years'],['Case or disease',r.disease],['Report available',r.report],
 ['__','What is needed'],['Component',r.btype],['Bags',r.u],['Needed on',[r.date,r.time].filter(Boolean).join(' · ')],['Urgency',r.urg],
 ['__','Where'],['Hospital',r.hosp],['Town',r.c],['Address',r.address],
 ['__','The attendant'],['Name',r.by],['Phone',r.ph],['Blood group',r.attgroup],['Can donate',r.attdonate],['Exchange possible',r.exchange],['Transport',r.transport]]
 .filter(([k,v])=>k==='__'||v).map(([k,v])=>k==='__'?`<div class="fsec" style="margin:20px 0 10px"><span>${v}</span></div>`:`<div class="drow"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
 <div class="row" style="gap:9px"><a class="btn btn-p" style="flex:1" href="tel:${(r.ph||'').replace(/ /g,'')}">Call ${r.by||'requester'}</a>
 <a class="btn btn-o" href="#/admin/find" onclick="findG='${r.g}';closeSheet()">Find a donor</a></div>
 ${r.st==='open'?`<button class="btn btn-d" style="width:100%;margin-top:12px" onclick="fulfil('${r.id}')">Mark arranged</button>`:''}`);
}
function fulfil(id){const r=S.requests.find(x=>x.id===id);r.st='done';persist();closeSheet();route()}

/* ---- record ---- */
PAGES['admin/record']=()=>adminShell('record',`
 <div style="max-width:620px">
 <form class="acard" onsubmit="return saveDonation(event)">
 <div class="fgrp"><label class="lb">Who donated?</label><input class="fld" list="donorList" name="who" required placeholder="Type a name from the register…"><datalist id="donorList">${scoped(S.donors).map(d=>`<option value="${d.n}">`).join('')}</datalist>
 <div class="sm" style="margin-top:7px">Not on the register? <a href="#" onclick="openSheet('addDonor');return false"><b>Add them first →</b></a></div></div>
 <div class="g2" style="gap:14px"><div class="fgrp"><label class="lb">Date</label><input class="fld" type="date" name="date" value="${new Date().toISOString().slice(0,10)}"></div>
 <div class="fgrp"><label class="lb">Bags</label><input class="fld" name="bags" value="1" inputmode="numeric"></div></div>
 <div class="fgrp"><label class="lb">Against a request? <span class="sm">— optional</span></label><select class="fld" name="req"><option value="">Not linked</option>${scoped(S.requests).filter(r=>r.st==='open').map(r=>`<option value="${r.id}">${r.id} · ${r.g} · ${r.hosp}</option>`).join('')}</select></div>
 <button class="btn btn-p" style="width:100%;padding:15px">Save to the register</button>
 </form>
 <p class="ahint">Saving does three things at once: writes the donation, sets that donor\u2019s next eligible date <b>ninety days out</b>, and adds to the year\u2019s total. Nothing is entered twice.</p>
 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:14px">Recorded today</h3>
 ${S.donations.length?S.donations.map(d=>`<div class="row" style="padding:11px 0;border-bottom:1px solid var(--line)">${bgTag(d.g)}<span style="flex:1;font-weight:600">${d.n}</span><span class="sm">${d.bags} bag</span></div>`).join(''):'<p class="sm">Nothing recorded yet today.</p>'}
 </div></div>`,`<h1>Record a donation</h1><span class="asub">One form, three fields</span>`);
function saveDonation(e){
 e.preventDefault();const f=new FormData(e.target);
 const who=f.get('who'),d=S.donors.find(x=>x.n===who);
 if(d){d.last=f.get('date');d.times++}
 S.donations.unshift({d:f.get('date'),n:who,g:d?d.g:'—',bags:+f.get('bags'),c:d?d.c:SCOPE||'Quetta'});
 const rq=f.get('req');if(rq){const r=S.requests.find(x=>x.id===rq);if(r)r.st='done'}
 persist();route();
 return false;
}

/* ---- sheets ---- */
function sheet(html){
 let el=document.getElementById('sheet');
 if(!el){el=document.createElement('div');el.id='sheet';el.className='sheet';document.body.appendChild(el);
  const ov=document.createElement('div');ov.id='sheetOv';ov.className='sheetov';ov.onclick=closeSheet;document.body.appendChild(ov)}
 el.innerHTML='<button class="cl" onclick="closeSheet()">✕</button>'+html;
 el.classList.add('open');document.getElementById('sheetOv').classList.add('on');
}
function closeSheet(){const s=document.getElementById('sheet');if(s){s.classList.remove('open');document.getElementById('sheetOv').classList.remove('on')}}
function openDonor(id){
 const d=S.donors.find(x=>x.id===id);if(!d)return;
 const n=days(d.last),t=D(d,'tests'),td=D(d,'tested'),sd=td?days(td):null,stale=sd!==null&&sd>180;
 const age=D(d,'dob')?Math.floor((Date.now()-new Date(D(d,'dob')))/31557600000):null;
 const def=D(d,'defer');
 sheet(`<div class="row" style="gap:10px;align-items:center">${bgTag(d.g)}<span class="mono2 sm">${D(d,'mr')||'no MR number'}</span></div>
 <h2 style="margin:12px 0 4px">${d.n}</h2><div class="sm">${d.c}${age?' · '+age+' years':''}</div>

 ${def?`<div class="alert" style="margin:18px 0"><div><b>Deferred — do not call.</b> ${def}</div></div>`:''}

 <div class="qlab" style="margin:22px 0 10px">Donor</div>
 <div>${[['Blood group and RH',d.g.includes('−')?d.g+' (negative)':d.g+' (positive)'],['Age',age?age+' years':'—'],['Date of birth',D(d,'dob')||'—'],['Contact',d.p],['Emergency contact',D(d,'emg')||'—'],['Relationship',D(d,'emgr')||'—'],['Address',D(d,'addr')||'—']].map(([k,v])=>`<div class="drow"><span>${k}</span><b>${v}</b></div>`).join('')}</div>

 <div class="qlab" style="margin:22px 0 10px">Donation</div>
 <div>${[['Quantity given',D(d,'ml')+' ml'],['Willing to give',D(d,'freq')],['Mode of issue',D(d,'issue')+' — '+(ISSUE[D(d,'issue')]||'')],['Times donated',d.times],['Last donated',d.last?n+' days ago':'Never'],['Can give again',elig(d).why]].map(([k,v])=>`<div class="drow"><span>${k}</span><b>${v}</b></div>`).join('')}</div>

 <div class="qlab" style="margin:22px 0 10px">Screening</div>
 ${t?`<div class="testgrid">${TESTS.map(([k,l])=>`<div class="testbox ${t[k]==='-ve'?'ok':'no'}"><b>${l}</b><span>${t[k]}</span></div>`).join('')}</div>
 <div class="drow" style="margin-top:12px"><span>Tested</span><b>${td||'—'}${sd!==null?' · '+sd+' days ago':''}</b></div>
 ${stale?'<div class="ahint" style="margin-top:10px;border-color:#F0DFB4;background:var(--amb-t)">These results are more than six months old. Screen again before issuing.</div>':''}`
 :'<div class="ahint">Never screened. This person cannot be called for a donation until HCV, HIV, HBs/IG, VDRL and MP have been done.</div>'}

 <div class="row" style="gap:9px;margin-top:22px"><a class="btn btn-p" style="flex:1" href="tel:${d.p.replace(/ /g,'')}">Call</a><a class="btn btn-o" href="https://wa.me/92${d.p.replace(/[^0-9]/g,'').replace(/^0/,'')}" target="_blank" rel="noopener">WhatsApp</a></div>
 <div class="row" style="gap:9px;margin-top:9px"><button class="btn btn-o" style="flex:1">Edit details</button><button class="btn btn-o" style="flex:1">Record a screening</button></div>
 <button class="btn btn-d" style="width:100%;margin-top:9px">${def?'Lift the deferral':'Defer this donor'}</button>`);
}
function openSheet(kind){
 if(kind==='addDonor')sheet(`<h2 style="margin-bottom:4px">Add a donor</h2><p class="sm" style="margin-bottom:20px">The same page as the branch Donor Diary. Only the starred fields are needed to save — the rest can be filled in when the person next comes in.</p>
 <form onsubmit="return addDonor(event)">
 <div class="qlab" style="margin-bottom:10px">Donor</div>
 <div class="g2" style="gap:12px"><div class="fgrp"><label class="lb">Full name *</label><input class="fld" name="n" required autofocus></div>
 <div class="fgrp"><label class="lb">MR number</label><input class="fld" name="mr" placeholder="CHM-0000"><div class="sm" style="margin-top:5px">Left blank, one is given.</div></div></div>
 <div class="fgrp"><label class="lb">Blood group and RH factor *</label><div class="row" style="gap:7px" id="adG">${GROUPS_A.map(g=>`<button type="button" class="bgp sm2" onclick="pickAdd(this)">${g}</button>`).join('')}</div></div>
 <div class="g2" style="gap:12px"><div class="fgrp"><label class="lb">Date of birth</label><input class="fld" name="dob" type="date"><div class="sm" style="margin-top:5px">Better than an age, which is wrong a year later.</div></div>
 <div class="fgrp"><label class="lb">Contact number *</label><input class="fld" name="p" required placeholder="0300 0000000"></div></div>
 <div class="g2" style="gap:12px"><div class="fgrp"><label class="lb">Emergency contact</label><input class="fld" name="emg"></div>
 <div class="fgrp"><label class="lb">Relationship with donor</label><input class="fld" name="emgr" placeholder="Brother, wife, father…"></div></div>
 <div class="fgrp"><label class="lb">Address</label><textarea class="fld" name="addr" rows="2" placeholder="Mohallah, village, district"></textarea></div>
 <div class="fgrp"><label class="lb">Town *</label><select class="fld" name="c">${(SCOPE?[SCOPE]:TOWNS_A).map(t=>`<option>${t}</option>`).join('')}</select></div>

 <div class="qlab" style="margin:22px 0 10px">Donation</div>
 <div class="g2" style="gap:12px"><div class="fgrp"><label class="lb">Quantity (ml)</label><select class="fld" name="ml"><option>350</option><option>450</option></select></div>
 <div class="fgrp"><label class="lb">How often they will give</label><select class="fld" name="freq">${FREQ.map(f=>`<option${f==='Every 6 months'?' selected':''}>${f}</option>`).join('')}</select></div></div>
 <div class="fgrp"><label class="lb">Mode of issue</label><select class="fld" name="issue">${Object.entries(ISSUE).map(([k,v])=>`<option value="${k}">${k} — ${v}</option>`).join('')}</select></div>
 <div class="fgrp"><label class="lb">Last donated <span class="sm">— if known</span></label><input class="fld" name="last" type="date"></div>

 <div class="qlab" style="margin:22px 0 10px">Screening</div>
 <div class="ahint" style="margin-bottom:16px">Recorded separately, against the laboratory date, so a result can never be quietly changed alongside a name or a telephone number. Use <b>Record a screening</b> on the donor's page.</div>
 <button class="btn btn-p" style="width:100%;padding:14px">Save donor</button>
 <button type="button" class="btn btn-o" style="width:100%;margin-top:9px" onclick="addDonor(event,1)">Save and add another</button></form>`);
 if(kind==='newReq')sheet(`<h2 style="margin-bottom:4px">New blood request</h2><p class="sm" style="margin-bottom:20px">Usually taken over the phone. Write it here instead of a slip.</p>
 <form onsubmit="return addReq(event)">
 <div class="fgrp"><label class="lb">Blood group *</label><div class="row" style="gap:7px" id="adG">${GROUPS_A.map(g=>`<button type="button" class="bgp sm2" onclick="pickAdd(this)">${g}</button>`).join('')}</div></div>
 <div class="g2" style="gap:12px"><div class="fgrp"><label class="lb">Units *</label><input class="fld" name="u" value="2" required></div>
 <div class="fgrp"><label class="lb">Town *</label><select class="fld" name="c">${(SCOPE?[SCOPE]:TOWNS_A).map(t=>`<option>${t}</option>`).join('')}</select></div></div>
 <div class="fgrp"><label class="lb">Hospital *</label><input class="fld" name="hosp" required></div>
 <div class="fgrp"><label class="lb">Patient name</label><input class="fld" name="pt"></div>
 <div class="fgrp"><label class="lb">Who is asking — phone *</label><input class="fld" name="ph" required></div>
 <button class="btn btn-p" style="width:100%;padding:14px">Save request</button></form>`);
}
function pickAdd(b){document.querySelectorAll('#adG .bgp').forEach(x=>x.classList.remove('on'));b.classList.add('on')}
function addDonor(e,again){
 e.preventDefault();const form=e.target.closest('form'),f=new FormData(form);
 const g=document.querySelector('#adG .bgp.on');
 if(!g){alert('Choose a blood group.');return false}
 const pre={Quetta:'QTA',Pishin:'PSH',Zhob:'ZHB',Loralai:'LRL',Chaman:'CHM','Muslim Bagh':'MSB'}[f.get('c')]||'PBB';
 const mr=(f.get('mr')||'').trim()||pre+'-'+String(S.donors.filter(x=>(D(x,'mr')||'').startsWith(pre)).length+1).padStart(4,'0');
 S.donors.unshift({id:Date.now(),n:f.get('n'),g:g.textContent,p:f.get('p'),c:f.get('c'),last:f.get('last')||null,times:0,
  mr,dob:f.get('dob')||'',emg:f.get('emg')||'',emgr:f.get('emgr')||'',addr:f.get('addr')||'',
  ml:+f.get('ml')||350,freq:f.get('freq')||'Every 6 months',issue:f.get('issue')||'W/O/R',tests:null,tested:null,defer:null});
 persist();
 if(again){form.reset();document.querySelectorAll('#adG .bgp').forEach(x=>x.classList.remove('on'));form.querySelector('input').focus()}
 else{closeSheet();route()}
 return false;
}
function addReq(e){
 e.preventDefault();const f=new FormData(e.target);
 const g=document.querySelector('#adG .bgp.on');
 if(!g){alert('Choose a blood group.');return false}
 S.requests.unshift({id:'PBB-'+(S.seq++),pt:f.get('pt'),hosp:f.get('hosp'),g:g.textContent,u:+f.get('u'),c:f.get('c'),urg:'Urgent — within 2 days',by:'',ph:f.get('ph'),at:Date.now(),st:'open',src:'admin',called:[]});
 persist();closeSheet();route();return false;
}
