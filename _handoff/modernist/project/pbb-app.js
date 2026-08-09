/* PBB website — home page, router, form behaviour */

const NAV=[
 ['Home','#/'],
 ['About',null,[['The problem we are solving','#/problem','Twelve gaps, and our answer'],['Our story','#/about','Since 24 March 1999'],['Our leadership','#/people','Committee and medical staff'],['Who stands with us','#/supporters','Supporting organisations'],['Our branches','#/branches','6 offices, 14 towns']]],
 ['Services',null,[['What we provide','#/services','Screened blood, on exchange'],['Thalassemia children','#/thalassemia','Free, without exchange']]],
 ['Get involved',null,[['Everything in one place','#/join','Five ways to take part'],['Who needs blood now','#/needs','Every open request, no names'],['Request blood','#/join/requester','For a patient in hospital'],['Register as a donor','#/join/donor','Takes three minutes'],['Volunteer with us','#/join/volunteer','Camps and outreach'],['Partner organisation','#/join/partner','Hospitals and laboratories'],['Register an organisation','#/join/organisation','Bring a branch to your town'],['Work with us','#/partners','Hospitals, labs, foundations'],['Donate','#/donate','Bank transfer, Zakat, Eid hides']]],
 ['Media',null,[['Photos & videos','#/gallery','Camps, ambulances, the new building'],['Announcements & events','#/news','What is happening now'],['Publications','#/publications','Posters, appeals and reports'],['Questions','#/faq','Things people ask us']]],
 ['Contact','#/contact']];

function buildMob(){document.getElementById('mob').innerHTML=`
<div class="mh"><img src="assets/pbb-logo.png" alt=""><div><div style="font-weight:800;font-size:15px">Pashtoonkhwa Blood Bank</div><div style="font-family:'Noto Nastaliq Urdu',serif;font-size:11px;color:var(--mid)">پښتونخوا د وینې زېرمه</div></div><button class="cl" onclick="mobClose()">✕</button></div>
${NAV.map(([l,h,sub])=>h?`<a href="${h}" onclick="mobClose()" data-t="${l}">${l}</a>`:`<div class="gp" data-t="${l}">${l}</div>`+sub.map(([t,u])=>`<a href="${u}" onclick="mobClose()" data-t="${t}">${t}</a>`).join('')).join('')}
<div class="ft"><a href="#/join/requester" class="btn btn-p" style="color:#fff" onclick="mobClose()" data-t="Request Blood">Request Blood</a>
<div class="row" style="gap:8px"><button class="btn btn-o" style="flex:1">English</button><button class="btn btn-o" style="flex:1">اردو</button><button class="btn btn-o" style="flex:1">پښتو</button></div>
<div style="font-size:13px;color:var(--mid);padding-top:4px">Emergency · <b style="color:var(--ink)">081-2836820</b></div></div>`;}
buildMob();
function mobOpen(){document.getElementById('mob').classList.add('open');document.body.style.overflow='hidden'}
function mobClose(){document.getElementById('mob').classList.remove('open');document.body.style.overflow=''}

/* ---------------- HOME ---------------- */
const STOCK=[['O−','cr','Critical'],['AB−','lo','Low'],['B−','lo','Low'],['A−','ok','Available'],['O+','ok','Available'],['A+','ok','Available'],['B+','ok','Available'],['AB+','ok','Available']];
const PILLARS=[
['Screened blood','Tested by ELISA for Hepatitis B, Hepatitis C, HIV/AIDS and MP before it reaches a patient.','M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z'],
['Thalassemia care','200 registered children transfused regularly, free of cost and without exchange.','M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8Z'],
['Ambulance service','Three vehicles in Quetta, running twenty-four hours a day for anyone who needs them.','M3 17V7a1 1 0 0 1 1-1h9v11M13 10h4l4 4v3h-3M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z'],
['Disaster response','Abbottabad 2005, Ziarat 2008, and every bomb blast and emergency since.','M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z']];
const CHART=[[1999,360,12],[2000,720,18],[2001,1080,24],[2002,1440,30],[2003,2160,40],[2004,2747,48],[2005,3118,54],[2006,3968,64],[2007,4582,72],[2008,5905,88],[2009,5920,89],[2010,6937,96],[2011,9484,100],[2012,5120,55]];

PAGES['']=()=>`
<header class="hero"><div class="wrap"><div class="hero-g">
<div>
<span class="eyebrow"><b></b>Serving Balochistan since 24 March 1999</span>
<h1>Blood is life.<br>We keep the <em>record</em>.</h1>
<p class="lead">Screened, tested blood for anyone who needs it — irrespective of language, colour, religion, race or ethnicity. Free and without exchange for thalassemia children, mothers, emergencies and disasters.</p>
<div class="row" style="margin-top:28px"><a href="#/join/requester" class="btn btn-p">Request Blood</a><a href="#/join/donor" class="btn btn-d">Register as a Donor</a></div>
<div class="stats">
<div><div class="n r">64,000+</div><div class="c">bags donated since 1999</div></div>
<div><div class="n">200</div><div class="c">thalassemia children</div></div>
<div><div class="n">14</div><div class="c">towns served</div></div>
<div><div class="n">3</div><div class="c">ambulances, 24 hours</div></div>
</div></div>
<div class="ph" style="aspect-ratio:4/4.4;border-radius:var(--rl)"><image-slot id="home-hero" shape="rect" placeholder="Drop the hero photograph — a donor at the bench, or a PBB ambulance"></image-slot></div>
</div></div></header>

<div class="wrap" style="margin-top:22px"><div class="stock">
<div class="stock-h"><h3 style="margin-right:auto">What we are short of today</h3><span class="live"><b></b>Live · Quetta · updated 2 hours ago</span></div>
<div class="groups">${STOCK.map(([g,c,s])=>`<div class="grp ${c}"><div class="g">${g}</div><div class="s">${s}</div></div>`).join('')}</div>
<p style="font-size:14.5px;color:var(--ink-2);margin-top:16px">If your group shows red, a single donation today goes straight to a patient waiting. <a href="#/join/donor" style="font-weight:700">Register as a donor →</a></p>
</div></div>

<section class="blk"><div class="wrap">
<div style="max-width:660px;margin-bottom:40px"><div class="qlab" style="margin-bottom:12px">What we do</div><h2>Four things, done since 1999</h2><p class="lead" style="margin-top:13px">Blood is never purchased. The only source is exchange from relatives of the patient and registered members.</p></div>
<div class="g4">${PILLARS.map(([t,b,d])=>`<div class="pil"><div class="ic"><svg viewBox="0 0 24 24"><path d="${d}"/></svg></div><h3>${t}</h3><p>${b}</p></div>`).join('')}</div>
</div></section>

<section class="blk" style="background:var(--surf);border-block:1px solid var(--line)"><div class="wrap">
<div style="max-width:660px;margin-bottom:36px"><div class="qlab" style="margin-bottom:12px">The record</div><h2>Twenty-seven years, counted</h2><p class="lead" style="margin-top:13px">Every bag transfused since the first year of operation. Figures published to June 2012; later years are being entered.</p></div>
<div class="chart">${CHART.map(([y,b,h])=>`<div class="bar${y===2011?' pk':''}" style="height:${h}%"><span>${y} · ${b.toLocaleString()} bags</span></div>`).join('')}</div>
<div class="axis"><span>1999</span><span>2011 — peak year</span><span>June 2012</span></div>
</div></section>

<section class="blk"><div class="wrap"><div class="g2" style="gap:34px;align-items:center">
<div><div class="qlab" style="margin-bottom:12px">Where we are</div><h2 style="margin-bottom:16px">Six offices.<br>Fourteen towns.</h2>
<p class="lead" style="margin-bottom:24px">From the head office beside the Quetta Press Club out to Zhob, Chaman and Loralai — and to the towns in between that have no blood bank of their own.</p>
<a href="#/branches" class="btn btn-o">See every branch</a></div>
<div class="ph" style="aspect-ratio:4/3;border-radius:var(--rl)"><image-slot id="home-map" shape="rect" placeholder="Drop a map of Balochistan showing the six branches"></image-slot></div>
</div></div></section>

<section class="blk" style="padding-top:0"><div class="wrap">
<div class="row" style="margin-bottom:32px"><div><div class="qlab" style="margin-bottom:10px">Announcements &amp; events</div><h2>What is happening now</h2></div><a href="#/news" class="btn btn-o btn-s" style="margin-left:auto">All announcements</a></div>
<div class="g3">${[['Blood camp','12 September','Free donation camp, Pishin','Band Road branch, 9am to 4pm. Walk in or register to attend.','no'],['Notice','3 September','New building — final stage','Construction of the new Quetta premises has entered its last phase.','gy'],['Appeal','Runs to 20 June','Eid ul Adha hide collection','Volunteers collect cattle hides across all branches.','ok']].map(([k,d,t,b,c],i)=>`<div class="card" style="padding:0;overflow:hidden"><div class="ph" style="aspect-ratio:16/9;border-radius:0"><image-slot id="home-news-${i+1}" shape="rect" placeholder="Drop a cover photo"></image-slot></div><div style="padding:22px"><div class="row" style="gap:9px"><span class="tag ${c}">${k}</span><span style="font-size:13px;color:var(--mid);font-weight:600">${d}</span></div><h3 style="margin:12px 0 8px">${t}</h3><p class="muted" style="font-size:14px">${b}</p></div></div>`).join('')}</div>
</div></section>

<section class="blk" style="padding-top:0"><div class="wrap"><div class="probteaser">
<div><div class="qlab" style="margin-bottom:12px">The problem</div><h2 style="margin-bottom:14px">Blood exists. It just<br>does not reach people in time.</h2>
<p class="lead" style="max-width:54ch">No national register, almost no voluntary donors, bags expiring in one town while a patient waits in the next. Twelve gaps — and what we do about them.</p>
<a href="#/problem" class="btn btn-d" style="margin-top:22px">Read the twelve gaps</a></div>
<div class="probnums">${[['0','national blood group databases'],['200','children depending on us alone'],['1999','the year we started counting']].map(([n,l])=>`<div><div class="pn">${n}</div><div class="pl">${l}</div></div>`).join('')}</div>
</div></div></section>

<div class="wrap"><div class="closer">
<div><h2>Donate blood. Save a life.</h2><p>It takes fifteen minutes, and for two hundred children in Balochistan it is the difference between a normal month and a hospital one.</p></div>
<a href="#/join" class="btn btn-w">Get involved</a>
</div></div>`;

/* ---------------- ROUTER ---------------- */
let step=0;
const TITLES={'':'Pashtoonkhwa Blood Bank — Quetta, Balochistan',about:'Our story',services:'Services',branches:'Our branches',thalassemia:'Thalassemia children',people:'Committee & staff',gallery:'Photos & videos',news:'Announcements & events',donate:'Donate','request-blood':'Request blood','register-donor':'Register as a donor',contact:'Contact',problem:'The problem we are solving',supporters:'Who stands with us',publications:'Publications',faq:'Questions',partners:'Work with us',privacy:'Privacy',terms:'Terms',branch:'Branch','404':'Page not found',join:'Get involved','join/requester':'Request blood','join/donor':'Register as a donor','join/volunteer':'Volunteer','join/partner':'Partner with us','join/organisation':'Register an organisation'};
const NAVMAP={about:'About',people:'About',branches:'About',problem:'About',supporters:'About',services:'Services',thalassemia:'Services','register-donor':'Get involved',needs:'Get involved',donate:'Get involved',join:'Get involved','join/requester':'Get involved','join/donor':'Get involved','join/volunteer':'Get involved','join/partner':'Get involved','join/organisation':'Get involved',gallery:'Media',news:'Media',publications:'Media',faq:'Media',partners:'Get involved',contact:'Contact','':'Home'};

function route(){
 const r=(location.hash.replace(/^#\/?/,'')||'').split('?')[0];
 const admin=r.indexOf('admin')===0;
 document.body.classList.toggle('adminmode',admin);
 document.querySelectorAll('#sheet,#sheetOv').forEach(x=>x.classList.remove('open','on'));
 if(admin&&!/^admin\/(login|forgot|sent)$/.test(r)&&!sessionStorage.getItem('pbb-auth')){location.hash='#/admin/login';return}
 if(admin&&!/^admin\/(login|forgot|sent)$/.test(r)&&window.PBBCAN&&!window.PBBCAN(r.replace('admin/',''))){location.hash='#/admin/'+window.PBBLANDING();return}
 const page=PAGES[r]||(r?PAGES['404']:PAGES['']);
 window._sid=0;
 /* If a page throws, say so. Leaving the previous page on screen under a new title makes a
    broken button look like a dead one, and nobody can tell us what went wrong. */
 try{document.getElementById('page').innerHTML=page()}
 catch(err){
  console.error('Page failed to render:',r,err);
  document.getElementById('page').innerHTML=`<section class="blk"><div class="wrap narrow" style="text-align:center;padding:60px 0">
  <h1 class="h1" style="margin-bottom:12px">This page did not load</h1>
  <p class="lede" style="margin-bottom:26px">Something went wrong at our end, not yours. Please tell us what you were trying to do — or telephone 081-2836820, which is answered at any hour.</p>
  <div class="row" style="justify-content:center;gap:10px"><a href="#/" class="btn btn-p">Home</a><a href="tel:0812836820" class="btn btn-o">Call the head office</a></div></div></section>`;
 }
 const at={needs:'Who needs blood now','me/signin':'Your record','me/code':'Type the code',me:'Your record','me/remove':'Take yourself off the register','admin/login':'Sign in','admin/forgot':'Forgotten password','admin/sent':'Check your email','admin/overview':'Overview','admin/requests':'Blood requests','admin/find':'Find donors','admin/inventory':'Inventory','admin/inbox':'Inbox','admin/donors':'Donors','admin/volunteers':'Volunteers','admin/thalassemia':'Thalassemia','admin/ledger':'Donations ledger','admin/record':'Record a donation','admin/homepage':'Homepage','admin/pages':'Pages','admin/announcements':'Announcements','admin/events':'Events','admin/media':'Media','admin/network':'All towns','admin/partners':'Partners & organisations','admin/reports':'Reports','admin/branches':'Branches','admin/settings':'Site settings','admin/roles':'Roles & access','admin/accounts':'Accounts & hierarchy','admin/whatsapp':'WhatsApp','admin/profile':'Your account','admin/data':'Data','admin/audit':'Log'}[r];
 const t=TITLES[r]||at||(PAGES[r]?'Pashtoonkhwa Blood Bank':null);
 document.title=!r?TITLES['']:(t?(t==='Pashtoonkhwa Blood Bank'?t:t+' — Pashtoonkhwa Blood Bank'):'Page not found — Pashtoonkhwa Blood Bank');
 document.querySelectorAll('.menu>li').forEach(li=>li.classList.toggle('on',li.dataset.nav===NAVMAP[r]));
 window.scrollTo(0,0);
 step=0;
}
window.addEventListener('hashchange',route);
route();

function submitJoin(e,kind){
 e.preventDefault();const f=e.target,d=new FormData(f);
 if(kind==='requester'){
  const g=d.get('group');if(!g){alert('Please choose the blood group needed.');return false}
  const full={};d.forEach((v,k)=>{if(v)full[k]=v});
  const id=window.PBBSTORE.addRequest(Object.assign(full,{pt:d.get('patient'),hosp:d.get('hospital'),g:g,u:+d.get('units')||1,c:d.get('city'),urg:d.get('urgency'),by:d.get('att')||'Attendant',ph:d.get('phone'),src:'web'}));
  done(f,`<div class="tick">✓</div><h2>Request received</h2>
  <p class="lead" style="margin-top:12px">A coordinator will call you shortly. Keep your phone nearby.</p>
  <div class="code">${id}</div>
  <p class="muted" style="font-size:14px">Save this number. Quote it when you call the branch.</p>
  <p class="muted" style="font-size:13px;margin-top:10px">It is already on the coordinator's screen. <a href="#/admin/requests"><b>See it in the admin →</b></a></p>
  <div class="row" style="justify-content:center;margin-top:22px"><a href="tel:0812836820" class="btn btn-p">Call the head office</a><a href="#/" class="btn btn-o">Home</a></div>`);
  return false}
 if(kind==='donor'){
  const g=d.get('group');if(!g){alert('Please choose your blood group.');return false}
  window.PBBSTORE.addDonor({n:d.get('name'),g:g==='unknown'?'O+':g,p:d.get('phone'),c:d.get('city'),last:d.get('last')||null});
  done(f,`<div class="tick">✓</div><h2>You are on the register</h2>
  <p class="lead" style="margin-top:12px">Your branch will confirm your details by phone. When someone near you needs your group, we call.</p>
  <div class="code">D-${Math.floor(1000+Math.random()*9000)}</div>
  <p class="muted" style="font-size:13px">Your name is now on the ${d.get('city')} register. <a href="#/admin/donors"><b>See it in the admin →</b></a></p>
  <div class="row" style="justify-content:center;margin-top:22px"><a href="#/services" class="btn btn-o">How donation works</a><a href="#/" class="btn btn-p">Done</a></div>`);
  return false}
 const rec={kind:{volunteer:'Volunteer',partner:'Partner',organisation:'Organisation'}[kind],at:Date.now()};
 d.forEach((v,k)=>{if(v&&k!=='group')rec[k]=v});
 if(window.PBBSTORE&&window.PBBSTORE.addSubmission)window.PBBSTORE.addSubmission(rec);
 const label={volunteer:'Thank you for offering',partner:'Thank you',organisation:'Thank you'}[kind];
 const body={volunteer:'A volunteer lead from your town will call you. Camps are usually arranged a fortnight ahead.',
  partner:'The head office will be in touch to arrange a meeting.',
  organisation:'The organising committee reviews every request for a new branch. Somebody will call you to talk it through.'}[kind];
 done(f,`<div class="tick">✓</div><h2>${label}</h2><p class="lead" style="margin-top:12px">${body}</p>
 <p class="muted" style="font-size:13px;margin-top:10px">It is in the office inbox now. <a href="#/admin/inbox"><b>See it in the admin →</b></a></p>
 <div class="row" style="justify-content:center;margin-top:22px"><a href="#/" class="btn btn-p">Back to home</a></div>`);
 return false}

/* ---------------- SIGN IN ---------------- */
/* The account knows the town and the role. Sign in asks who you are, never what you are. */
const STAFF={
 'admin@pashtoonkhwabloodbank.org':{role:'head',name:'Abdul Samad Kakar'},
 'zhob@pashtoonkhwabloodbank.org':{role:'mgr',name:'Sabir Khan'},
 'pishin@pashtoonkhwabloodbank.org':{role:'emp',name:'Naveed Ahmed'}};

function loginShell(inner){return `<div class="login">
<div class="brandside">
<a href="#/" class="brand"><img src="assets/pbb-logo.png" alt="" style="box-shadow:0 0 0 1px #2B2D33"><span><span class="nm" style="color:#fff">Pashtoonkhwa Blood Bank</span><span class="ur" style="color:#71757D">پښتونخوا د وینې زېرمه</span></span></a>
<div><h1 style="color:#fff;font-size:clamp(30px,4vw,46px)">The register,<br>since <em style="color:#FF6B60">1999</em>.</h1>
<p style="color:#A7ABB3;font-size:17px;margin-top:16px;max-width:44ch">Fourteen towns, one book. Sign in to add donors, answer requests and record what has been given.</p></div>
<p style="color:#5E626A;font-size:13px">Zainab Chamber, Shara-e-Adalat, Quetta · 081-2836820</p>
</div>
<div class="formside"><div class="box">${inner}</div></div></div>`}

PAGES['admin/login']=()=>loginShell(`
<h2 style="margin-bottom:6px">Sign in</h2>
<p class="muted" style="margin-bottom:24px;font-size:14.5px">Use the email address your office was given. Your town and what you can do are already set on your account.</p>
<div id="loginErr" class="loginerr" hidden>That email and password do not match an account.</div>
<div class="fgrp"><label class="lb">Email address</label><input class="fld" id="liEmail" type="email" placeholder="name@pashtoonkhwabloodbank.org" autocomplete="username" onkeydown="if(event.key==='Enter')doLogin()"></div>
<div class="fgrp"><div class="row" style="justify-content:space-between;align-items:baseline"><label class="lb">Password</label><a href="#/admin/forgot" class="minilink">Forgotten it?</a></div>
<div class="pwwrap"><input class="fld" id="liPass" type="password" autocomplete="current-password" onkeydown="if(event.key==='Enter')doLogin()"><button type="button" class="pweye" onclick="togglePw(this)" aria-label="Show password">Show</button></div></div>
<label class="chk" style="margin:2px 0 18px"><input type="checkbox" checked><span>Keep me signed in on this device</span></label>
<button class="btn btn-p" style="width:100%;padding:15px" onclick="doLogin()">Sign in</button>
<a href="#/" class="btn btn-o" style="width:100%;margin-top:10px">Back to the website</a>
<div class="demobox"><div class="qlab" style="margin-bottom:8px">For this demonstration</div>
<p class="sm" style="margin-bottom:12px">Real accounts are created by the head office. Tap one to fill the form — each lands in a different part of the panel, because the account decides that, not the person signing in.</p>
${Object.entries(STAFF).map(([e,s])=>`<button type="button" class="demorow" onclick="fillLogin('${e}')"><b>${e}</b><span>${ROLES[s.role].who} · ${ROLES[s.role].sub}</span></button>`).join('')}
</div>`);

PAGES['admin/forgot']=()=>loginShell(`
<h2 style="margin-bottom:6px">Forgotten password</h2>
<p class="muted" style="margin-bottom:24px;font-size:14.5px">Type your email address. If it belongs to an account, a link to set a new password is sent to it. For safety we do not say whether it did.</p>
<div class="fgrp"><label class="lb">Email address</label><input class="fld" type="email" placeholder="name@pashtoonkhwabloodbank.org"></div>
<button class="btn btn-p" style="width:100%;padding:15px" onclick="location.hash='#/admin/sent'">Send the link</button>
<a href="#/admin/login" class="btn btn-o" style="width:100%;margin-top:10px">Back to sign in</a>
<div class="ahint" style="margin-top:22px">No email? Telephone the head office on 081-2836820. They can reset it, but they cannot see your old one.</div>`);

PAGES['admin/sent']=()=>loginShell(`
<div class="tick">✓</div>
<h2 style="margin-bottom:6px">Check your email</h2>
<p class="muted" style="margin-bottom:24px;font-size:14.5px">If that address belongs to an account, a link is on its way. It stops working after one hour, or as soon as you have used it.</p>
<a href="#/admin/login" class="btn btn-p" style="width:100%;padding:15px">Back to sign in</a>
<p class="sm" style="margin-top:18px">Nothing after a few minutes? Look in the spam folder, then telephone 081-2836820.</p>`);

function togglePw(b){const i=b.previousElementSibling;const s=i.type==='password';i.type=s?'text':'password';b.textContent=s?'Hide':'Show'}
function fillLogin(e){document.getElementById('liEmail').value=e;document.getElementById('liPass').value='demo1234';document.getElementById('loginErr').hidden=true}
function doLogin(){
 const e=(document.getElementById('liEmail').value||'').trim().toLowerCase();
 const p=document.getElementById('liPass').value||'';
 const acct=STAFF[e];
 if(!acct||p.length<4){const x=document.getElementById('loginErr');x.hidden=false;x.textContent=acct?'That password is not right.':'We have no account with that email address.';return}
 sessionStorage.setItem('pbb-auth',acct.role);setRole(acct.role);
 location.hash='#/admin/'+(window.PBBLANDING?window.PBBLANDING():'overview');
}

/* ---------------- FORM BEHAVIOUR ---------------- */
function pickG(b,name){
 const box=b.closest('[data-bg]');
 box.querySelectorAll('.bgp').forEach(x=>x.classList.remove('on'));
 b.classList.add('on');
 const hidden=box.parentElement.querySelector('input[type=hidden]');
 if(hidden)hidden.value=b.dataset.g;
}
function tog(b){
 const sibs=[...b.parentElement.querySelectorAll('.pill')];
 if(sibs.length===2){sibs.forEach(x=>x.classList.remove('on'));b.classList.add('on')}
 else b.classList.toggle('on');
}
function ctPick(b){
 [...b.parentElement.children].forEach(x=>x.classList.remove('on'));b.classList.add('on');
 const v=document.getElementById('volFields');
 if(v)v.style.display=b.textContent==='Volunteer'?'block':'none';
}
function galPick(b){[...b.parentElement.children].forEach(x=>x.classList.remove('on'));b.classList.add('on')}
function copyAcct(b,a){navigator.clipboard&&navigator.clipboard.writeText(a);const t=b.textContent;b.textContent='Copied';b.classList.add('btn-d');setTimeout(()=>{b.textContent=t;b.classList.remove('btn-d')},1400)}

/* live eligibility on the donor form */
function checkAge(i){
 const dob=new Date(i.value);if(isNaN(dob))return;
 const age=Math.floor((Date.now()-dob)/31557600000);
 const m=document.getElementById('eligMsg');
 if(age<18)m.innerHTML='<div class="msg no">You must be at least 18 to donate. You can register when you turn 18.</div>';
 else if(age>60)m.innerHTML='<div class="msg no">Donors over 60 are asked to speak to the branch before registering.</div>';
 else m.innerHTML='<div class="msg ok">✓ Age '+age+' — within the donating range.</div>';
}
function checkWeight(i){
 const w=parseFloat(i.value);if(isNaN(w))return;
 const m=document.getElementById('eligMsg');
 if(w<50)m.innerHTML='<div class="msg no">Donors must weigh at least 50 kg. Please speak to your branch.</div>';
}

/* multi-step */
function stepGo(d){
 const boxes=document.querySelectorAll('.stepbox'),stps=document.querySelectorAll('.stp');
 if(d>0){
  const cur=boxes[step];
  for(const f of cur.querySelectorAll('[required]')){if(!f.value){f.focus();f.style.borderColor='var(--red)';return}}
 }
 step=Math.max(0,Math.min(boxes.length-1,step+d));
 boxes.forEach((b,i)=>b.classList.toggle('on',i===step));
 stps.forEach((s,i)=>{s.classList.toggle('on',i===step);s.classList.toggle('done',i<step)});
 document.getElementById('backBtn').style.display=step?'':'none';
 document.getElementById('nextBtn').style.display=step<boxes.length-1?'':'none';
 document.getElementById('doneBtn').style.display=step===boxes.length-1?'':'none';
 window.scrollTo({top:0,behavior:'smooth'});
}

/* submissions */
function ref(p){return p+'-'+Math.floor(1000+Math.random()*9000)}
function done(form,html){form.innerHTML='<div class="done">'+html+'</div>';window.scrollTo({top:form.offsetTop-120,behavior:'smooth'})}
function submitRequest(e){e.preventDefault();const f=e.target;const g=f.querySelector('input[name=group]').value;
 if(!g){alert('Please choose the blood group needed.');return false}
 const d=new FormData(f);
 const id=window.PBBSTORE?window.PBBSTORE.addRequest({pt:d.get('patient'),hosp:d.get('hospital'),g:g,u:+d.get('units')||1,c:d.get('city'),urg:d.get('urgency'),by:d.get('relation')||'Requester',ph:d.get('phone'),src:'web'}):ref('PBB');
 done(f,`<div class="tick">✓</div><h2>Request received</h2>
 <p class="lead" style="margin-top:12px">A coordinator will call you shortly. Keep your phone nearby.</p>
 <div class="code">${id}</div>
 <p class="muted" style="font-size:14px">Save this number. Quote it when you call the branch.</p>
 <p class="muted" style="font-size:13px;margin-top:10px">This request is now on the branch coordinator's screen. <a href="#/admin/requests"><b>See it in the admin →</b></a></p>
 <div class="row" style="justify-content:center;margin-top:22px"><a href="tel:0812836820" class="btn btn-p">Call the head office</a><a href="#/" class="btn btn-o">Back to home</a></div>`);
 return false}
function submitDonor(e){e.preventDefault();const f=e.target;const d=new FormData(f);
 if(window.PBBSTORE)window.PBBSTORE.addDonor({n:d.get('name'),g:d.get('group')==='unknown'?'O+':d.get('group'),p:d.get('phone'),c:d.get('city'),last:d.get('last')||null});
 done(f,`<div class="tick">✓</div><h2>You are on the register</h2>
 <p class="lead" style="margin-top:12px">Your branch will confirm your details by phone. When someone near you needs your blood group, we will call.</p>
 <div class="code">${ref('D')}</div>
 <p class="muted" style="font-size:14px">Your donor number. Bring it, or just your name, when you come in.</p>
 <div class="row" style="justify-content:center;margin-top:22px"><a href="#/services" class="btn btn-o">How donation works</a><a href="#/" class="btn btn-p">Done</a></div>`);
 return false}
function submitDonation(e){e.preventDefault();const dd=new FormData(e.target);const dr={kind:'Donation',at:Date.now()};dd.forEach((v,k)=>{if(v)dr[k]=v});if(window.PBBSTORE&&window.PBBSTORE.addSubmission)window.PBBSTORE.addSubmission(dr);done(e.target,`<div class="tick">✓</div><h2>Thank you</h2>
 <p class="lead" style="margin-top:12px">Your details have been sent to the accounts desk. A receipt follows once the transfer is matched.</p>
 <div class="row" style="justify-content:center;margin-top:22px"><a href="#/" class="btn btn-p">Back to home</a></div>`);return false}
function submitContact(e){e.preventDefault();const cd=new FormData(e.target);const cr={kind:'Message',at:Date.now()};cd.forEach((v,k)=>{if(v)cr[k]=v});if(window.PBBSTORE&&window.PBBSTORE.addSubmission)window.PBBSTORE.addSubmission(cr);done(e.target,`<div class="tick">✓</div><h2>Message sent</h2>
 <p class="lead" style="margin-top:12px">Someone from the office will reply. For anything urgent, please call 081-2836820.</p>
 <div class="row" style="justify-content:center;margin-top:22px"><a href="#/" class="btn btn-p">Back to home</a></div>`);return false}


/* ---------------- LANGUAGE ---------------- */
const UR={
 'Home':'ہوم','About':'تعارف','Services':'خدمات','Get involved':'شامل ہوں','Media':'میڈیا','Contact':'رابطہ',
 'Request Blood':'خون کی درخواست','Register as a Donor':'عطیہ دہندہ رجسٹریشن','Get involved ':'شامل ہوں',
 'The problem we are solving':'ہم کون سا مسئلہ حل کر رہے ہیں','Our story':'ہماری کہانی','Our leadership':'ہماری قیادت',
 'Who stands with us':'ہمارے ساتھی ادارے','Our branches':'ہماری شاخیں','Committee & staff':'کمیٹی اور عملہ',
 'Everything in one place':'سب کچھ ایک جگہ','Request blood':'خون کی درخواست','Register as a donor':'عطیہ دہندہ بنیں',
 'Volunteer with us':'رضاکار بنیں','Partner organisation':'شراکت دار ادارہ','Register an organisation':'ادارہ رجسٹر کریں',
 'Donate':'عطیہ کریں','What we provide':'ہماری خدمات','Thalassemia children':'تھیلیسیمیا کے بچے',
 'Photos & videos':'تصاویر و ویڈیوز','Announcements & events':'اعلانات اور تقریبات','Staff sign in':'عملہ لاگ ان'};
let LANG=localStorage.getItem('pbb-lang')||'en';
function applyLang(){
 const ur=LANG==='ur';
 document.documentElement.lang=ur?'ur':'en';
 document.body.classList.toggle('urdu',ur);
 document.querySelectorAll('[data-t]').forEach(el=>{
  const k=el.dataset.t;el.textContent=ur&&UR[k]?UR[k]:k;
 });
 document.querySelectorAll('.lang').forEach(b=>b.textContent=ur?'اردو ▾':'EN ▾');
}
function toggleLang(){LANG=LANG==='en'?'ur':'en';localStorage.setItem('pbb-lang',LANG);buildNav();applyLang()}

/* re-label nav through data-t so the toggle can swap it */
const DICON={'#/problem':'M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z','#/about':'M12 8v8m-4-4h8M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z','#/people':'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z','#/supporters':'M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z','#/branches':'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Zm0-9h.01','#/services':'M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z','#/thalassemia':'M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8Z','#/join':'M4 5h16M4 12h16M4 19h10','#/join/requester':'M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z','#/join/donor':'M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6M12 3v12m0 0 4-4m-4 4-4-4','#/join/volunteer':'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z','#/join/partner':'M8 7h8M8 12h8M8 17h5M4 3h16v18H4z','#/join/organisation':'M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6','#/partners':'M8 7h8M8 12h8M8 17h5M4 3h16v18H4z','#/donate':'M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z','#/gallery':'M3 5h18v14H3zM8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm13 8-6-7-5 6-3-3-3 4','#/news':'M4 4h12v16H4zM16 8h4v10a2 2 0 0 1-4 0V8ZM7 8h6M7 12h6M7 16h4','#/publications':'M4 4h9a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-4v14h2a2 2 0 0 1 2 2z','#/faq':'M9.1 9a3 3 0 1 1 4.5 2.6c-.9.5-1.6 1.3-1.6 2.4m0 4h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z'};
function buildNav(){
 document.getElementById('menu').innerHTML=NAV.map(([l,h,sub])=>
  `<li data-nav="${l}">${h?`<a href="${h}" data-t="${l}">${l}</a>`:`<a href="${sub[0][1]}"><span data-t="${l}">${l}</span> <i class="chev"></i></a>`}
  ${sub?`<div class="dd">${sub.map(([t,u,d])=>`<a href="${u}"><span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="${DICON[u]||DICON['#/join']}"/></svg></span><span><b data-t="${t}">${t}</b><span>${d}</span></b></span></a>`).join('')}</div>`:''}</li>`).join('');
 buildMob();
 document.querySelectorAll('.lang').forEach(b=>b.onclick=toggleLang);
}
buildNav();applyLang();

/* ---------------- WHATSAPP ---------------- */
document.body.insertAdjacentHTML('beforeend',
 '<a class="wa" href="https://wa.me/923003815590" target="_blank" rel="noopener" aria-label="Message us on WhatsApp">'+
 '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-1.7-.9-2.9-1.6-4-3.5-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5s-.7-1.6-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.5.7.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.5-.3z"/><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Z"/></svg>'+
 '<span>WhatsApp</span></a>');

/* ---------------- COUNTERS + REVEAL ---------------- */
function enhance(){
 /* The reveal is decoration. It must never be the reason something cannot be read:
    anything already on screen shows at once, and everything shows regardless after a moment. */
 const reveal=el=>{el.classList.add('in')};
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){reveal(e.target);io.unobserve(e.target)}}),{threshold:.12});
 const items=document.querySelectorAll('.pil,.gapcard,.suppcard,.card,.era,.brc,.joincard');
 items.forEach(el=>{
  el.classList.add('rev');
  if(el.getBoundingClientRect().top<innerHeight*1.1){reveal(el);return}
  io.observe(el);
 });
 setTimeout(()=>document.querySelectorAll('.rev:not(.in)').forEach(reveal),1400);
 document.querySelectorAll('.stats .n,.pn').forEach(el=>{
  if(el.dataset.counted)return;
  const raw=(el.dataset.target||el.textContent).trim(),m=raw.match(/^([\d,]+)(\+?)$/);if(!m)return;
  const end=+m[1].replace(/,/g,''),suf=m[2];if(end<10)return;
  el.dataset.counted='1';el.dataset.target=raw;
  let t0=null;el.textContent='0'+suf;
  const fallback=setTimeout(()=>{el.textContent=raw},1600);
  const io2=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;io2.unobserve(e.target);clearTimeout(fallback);
   const step=ts=>{t0=t0||ts;const k=Math.min(1,(ts-t0)/900);
    el.textContent=Math.round(end*(1-Math.pow(1-k,3))).toLocaleString()+suf;
    if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)}),{threshold:.5});
  io2.observe(el);
 });
}
const _route=route;
route=function(){_route();applyLang();enhance()};
window.removeEventListener('hashchange',_route);
window.addEventListener('hashchange',route);
enhance();
