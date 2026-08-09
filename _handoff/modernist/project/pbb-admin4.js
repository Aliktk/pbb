/* PBB admin — accounts, hierarchy, sign-up approvals, WhatsApp board. */

/* ---------------- ACCOUNTS & HIERARCHY ---------------- */
const ACCOUNTS=[
{n:'Olus Yar',r:'Olus Yar',t:'All towns',e:'organizer@pbb.org',ph:'0300-3815590',st:'active',by:'—',last:'now',tfa:1},
{n:'Dr. Hamid Khan Achakzai',r:'Executive',t:'All towns',e:'committee@pbb.org',ph:'—',st:'active',by:'Olus Yar',last:'2 hours ago',tfa:1},
{n:'Mr. Faqir Khushal Khan Kasi',r:'Executive',t:'All towns',e:'faqir@pbb.org',ph:'—',st:'active',by:'Olus Yar',last:'yesterday',tfa:0},
{n:'Dr. Naseer Muhammad',r:'Verifier',t:'All towns',e:'lab@pbb.org',ph:'—',st:'active',by:'Olus Yar',last:'3 hours ago',tfa:1},
{n:'Zhob coordinator',r:'Branch manager',t:'Zhob',e:'zhob@pbb.org',ph:'0822-413902',st:'active',by:'Dr. Hamid Khan Achakzai',last:'yesterday',tfa:0},
{n:'Pishin desk',r:'Data entry',t:'Pishin',e:'pishin@pbb.org',ph:'0826-421288',st:'active',by:'Zhob coordinator',last:'3 days ago',tfa:0},
{n:'Loralai desk',r:'Data entry',t:'Loralai',e:'loralai@pbb.org',ph:'0824-662066',st:'suspended',by:'Dr. Hamid Khan Achakzai',last:'41 days ago',tfa:0},
{n:'Chaman volunteer lead',r:'Volunteer lead',t:'Chaman',e:'chaman@pbb.org',ph:'—',st:'invited',by:'Dr. Hamid Khan Achakzai',last:'—',tfa:0}];

/* Who each role may create. Nobody can create at or above their own level. */
const CANMAKE={head:['Executive','Verifier','Accounts','Branch manager','Coordinator','Data entry','Volunteer lead'],mgr:['Coordinator','Data entry','Volunteer lead'],emp:[]};

PAGES['admin/accounts']=()=>{
 const l=SCOPE?ACCOUNTS.filter(a=>a.t===SCOPE):ACCOUNTS;
 const pend=l.filter(a=>a.st==='invited');
 return adminShell('accounts',`
 ${pend.length?`<div class="alert"><div><b>${pend.length} ${pend.length===1?'invitation has':'invitations have'} not been accepted yet.</b> The link expires after seven days, then the account is deleted on its own.</div><button class="btn btn-w btn-s">Send it again</button></div>`:''}
 <div class="akpi">
 <div class="c"><div class="l">Active accounts</div><div class="n">${l.filter(a=>a.st==='active').length}</div></div>
 <div class="c"><div class="l">Invited, not yet accepted</div><div class="n r">${pend.length}</div></div>
 <div class="c"><div class="l">Suspended</div><div class="n">${l.filter(a=>a.st==='suspended').length}</div></div>
 <div class="c"><div class="l">With two-step sign in</div><div class="n">${l.filter(a=>a.tfa).length} of ${l.length}</div></div></div>

 ${SCOPE?`<div class="ahint" style="margin-bottom:18px">You are seeing the ${SCOPE} accounts only. The rest of the hierarchy is shown so you know who is above you, but you cannot open those records.</div>`:''}
 <div class="acard" style="margin-bottom:18px"><h3 style="margin-bottom:6px">Who answers to whom</h3><p class="sm" style="margin-bottom:20px">An account can only be created by somebody above it, and can only be given a role at or below their own. That is what stops the register quietly growing accounts nobody remembers making.</p>
 <div class="tree">
 <div class="tnode t1"><div class="tbox"><b>Olus Yar</b><span>Head of the organisation · all fourteen towns</span><i>Creates and removes anybody. The only role that can delete a record or export the register.</i></div></div>
 <div class="tkids">
  <div class="tnode t2"><div class="tbox"><b>Executive</b><span>2 members of the organising committee</span><i>All towns. Publishes the website. Creates branch managers.</i></div>
   <div class="tkids">
    <div class="tnode t3"><div class="tbox"><b>Branch manager</b><span>6 towns</span><i>One town. Creates data entry and coordinator accounts for that town only.</i></div>
     <div class="tkids">
      <div class="tnode t4"><div class="tbox"><b>Coordinator</b><span>Answers requests, calls donors</span></div></div>
      <div class="tnode t4"><div class="tbox"><b>Data entry</b><span>Adds donors and donations</span></div></div>
      <div class="tnode t4"><div class="tbox"><b>Volunteer lead</b><span>Volunteers and camps</span></div></div>
     </div></div>
   </div></div>
  <div class="tnode t2"><div class="tbox"><b>Verifier</b><span>Laboratory · Dr. Naseer Muhammad</span><i>Approves donor records across every town. Sees no telephone numbers.</i></div></div>
  <div class="tnode t2"><div class="tbox"><b>Accounts</b><span>Money and receipts only</span></div></div>
 </div></div>
 </div>

 <div class="atbl"><table><thead><tr><th>Person</th><th>Role</th><th>Town</th><th>Created by</th><th>Two-step</th><th>Status</th></tr></thead><tbody>
 ${l.map(a=>`<tr onclick="openAcct('${a.e}')"><td class="m2"><div class="nm">${a.n}</div><div class="sm">${a.r} · ${a.t} · ${a.e}</div></td>
 <td class="m1">${a.r}</td><td>${a.t}</td><td class="sm">${a.by}</td>
 <td>${a.tfa?'<span class="tag ok">On</span>':'<span class="tag gy">Off</span>'}</td>
 <td class="m3">${a.st==='active'?'<span class="tag ok">Active</span>':a.st==='invited'?'<span class="tag no">Invited</span>':'<span class="tag wt">Suspended</span>'}</td></tr>`).join('')}
 </tbody></table></div>
 <p class="ahint">There is no way to sign up for an account. Every one on this list was created by a named person above it, and that name cannot be edited afterwards. If somebody asks for access, the person above them creates it — or nobody does.</p>`,
 `<h1>Accounts</h1><span class="asub">${l.length} ${l.length===1?'person':'people'}</span><span style="margin-left:auto"></span>${(CANMAKE[ROLE]||[]).length?'<button class="btn btn-p btn-s" onclick="newAccount()">+ Create an account</button>':'<span class="sm">Your role cannot create accounts</span>'}`);
};
function openAcct(e){
 const a=ACCOUNTS.find(x=>x.e===e);if(!a)return;
 sheet(`<span class="tag ${a.st==='active'?'ok':a.st==='invited'?'no':'wt'}">${a.st==='active'?'Active':a.st==='invited'?'Invited — has not signed in yet':'Suspended'}</span>
 <h2 style="margin:12px 0 4px">${a.n}</h2><div class="sm">${a.r} · ${a.t}</div>
 <div style="margin:22px 0">${[['Email',a.e],['Telephone',a.ph],['Role',a.r],['Sees',a.t],['Account created by',a.by],['Last signed in',a.last],['Two-step sign in',a.tfa?'On':'Off']].map(([k,v])=>`<div class="drow"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
 ${a.st==='invited'?`<div class="row" style="gap:9px"><button class="btn btn-p" style="flex:1">Send the invitation again</button><button class="btn btn-o">Cancel it</button></div>`
 :`<div class="row" style="gap:9px"><button class="btn btn-o" style="flex:1">Change role or town</button><button class="btn btn-o">Reset password</button></div>
 <button class="btn btn-o" style="width:100%;margin-top:10px">Require two-step sign in</button>
 <button class="btn btn-d" style="width:100%;margin-top:10px">${a.st==='suspended'?'Restore this account':'Suspend this account'}</button>`}
 <p class="ahint" style="margin-top:18px">Every change here is written to the log with the name of whoever made it.</p>`);
}

/* ---------------- WHATSAPP (coming) ---------------- */
PAGES['admin/whatsapp']=()=>adminShell('whatsapp',`
 <div class="soonbar"><div><b>Not connected yet.</b> Everything below is built and waiting for the WhatsApp business number to be approved. Nothing else has to change when it arrives.</div><span class="tag gy">Ready when you are</span></div>
 <div class="g2" style="gap:18px;align-items:start">
 <div class="acard"><h3 style="margin-bottom:6px">What the assistant will do</h3><p class="sm" style="margin-bottom:18px">The same four things the desk does, in the language the person writes in.</p>
 ${[['Take a blood request','Somebody messages the number. The assistant asks the same questions as the form and the request appears on the board — marked as coming from WhatsApp.'],
 ['Register a donor','Name, group, town, phone. Straight onto the register, marked unverified until a coordinator confirms it.'],
 ['Alert donors','When a request opens, the assistant messages eligible donors in that town — the least recently contacted first, never twice in a day.'],
 ['Answer the usual questions','Who can donate, where the branches are, what exchange means. Passed to a person the moment it becomes a real conversation.']]
 .map(([t,d])=>`<div class="waitem"><b>${t}</b><p>${d}</p></div>`).join('')}</div>
 <div>
 <div class="acard"><h3 style="margin-bottom:6px">The board it will fill</h3><p class="sm" style="margin-bottom:16px">Conversations arrive here beside everything else, not in somebody's personal phone.</p>
 <div class="wacols">${[['Waiting on us',3],['Being handled',2],['Passed to a person',1],['Closed',0]].map(([t,n])=>`<div class="wacol"><div class="wch">${t}<span>${n}</span></div>${n?Array.from({length:n},(_,i)=>`<div class="wcard"><div class="sm">+92 3•• ••• ••••</div><div style="font-weight:600;margin-top:4px">${['Needs O− at BMC','Wants to register','Asking about exchange','Camp timings','Thalassemia schedule','Where is Pishin branch'][i%6]}</div></div>`).join(''):'<div class="sm" style="padding:8px 2px">—</div>'}</div>`).join('')}</div></div>
 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:6px">Why it is drawn now</h3><p class="sm">Because the columns for it exist already. Every request and every donor in this system carries a <b>source</b> — desk, website, or WhatsApp — so when the number is approved nothing needs rebuilding. It simply starts filling.</p></div>
 </div></div>`,
 `<h1>WhatsApp</h1><span class="asub">Waiting on the business number</span><span style="margin-left:auto"></span><button class="btn btn-o btn-s">Connect a number</button>`);



/* ---------------- CREATE AN ACCOUNT ----------------
   No password is ever typed here. The person receives a one-time link and sets
   their own — so the creator never knows it, and never needs to. */
let naRole='', naTown=(SCOPE||'');
function newAccount(){
 const allowed=CANMAKE[ROLE]||[];
 if(!allowed.length){sheet('<h2>Your role cannot create accounts</h2><p class="sm" style="margin-top:8px">Ask the person above you.</p>');return}
 naRole=allowed[allowed.length-1];naTown=SCOPE||'Quetta';
 sheet(`<h2 style="margin-bottom:4px">Create an account</h2>
 <p class="sm" style="margin-bottom:22px">You are creating this as <b>${ROLES[ROLE].who}</b>. Your name is attached to it permanently.</p>
 <form onsubmit="return saveAccount(event)">
 <div class="fgrp"><label class="lb">Their full name</label><input class="fld" required placeholder="As it should appear in the log"></div>
 <div class="g2" style="gap:14px">
 <div class="fgrp"><label class="lb">Email address</label><input class="fld" type="email" required placeholder="name@pashtoonkhwabloodbank.org"></div>
 <div class="fgrp"><label class="lb">Telephone</label><input class="fld" type="tel" placeholder="03XX XXXXXXX"></div></div>

 <div class="fgrp"><label class="lb">What they will be</label>
 <div class="pickgrid" id="naRoles">${allowed.map((r,i)=>`<button type="button" class="pickopt${i===allowed.length-1?' on':''}" onclick="pickNa(this,'${r}')"><b>${r}</b><span>${ROLEDESC[r]||''}</span></button>`).join('')}</div>
 <div class="sm" style="margin-top:8px">${ROLE==='head'?'You may grant any role.':'You may only create roles below your own, and only in your own town.'}</div></div>

 <div class="fgrp"><label class="lb">Which town they may see</label>
 <select class="fld" ${SCOPE?'disabled style="opacity:.6"':''}>${(SCOPE?[SCOPE]:['All fourteen towns',...TOWNS]).map(t=>`<option>${t}</option>`).join('')}</select>
 ${SCOPE?`<div class="sm" style="margin-top:6px">Fixed to ${SCOPE}. Only the head office can place somebody in another town.</div>`:''}</div>

 <div class="acard" style="padding:14px 16px;background:var(--bg);margin-bottom:18px">
 <label class="togrow" style="border:0;padding:6px 0"><span>Require two-step sign in</span><input type="checkbox" checked><i></i></label>
 <label class="togrow" style="padding:6px 0"><span>May see donors' telephone numbers</span><input type="checkbox" checked><i></i></label>
 <label class="togrow" style="border:0;padding:6px 0"><span>May export lists</span><input type="checkbox"><i></i></label>
 <p class="sm" style="margin-top:8px">These sit on top of the role. Anything not switched on here is refused even if the role would normally allow it.</p></div>

 <div class="ahint" style="margin-bottom:16px">They receive a single link that works once and expires in seven days. They choose their own password — you will never see it, and if they forget it you can only reset it, never read it.</div>
 <button class="btn btn-p" style="width:100%;padding:15px">Create and send the invitation</button>
 <button type="button" class="btn btn-o" style="width:100%;margin-top:10px" onclick="closeSheet()">Cancel</button>
 </form>`);
}
const ROLEDESC={'Executive':'All towns. Publishes the website.','Verifier':'Approves records. Sees no telephone numbers.','Accounts':'Money and receipts only.','Branch manager':'One town, and the people in it.','Coordinator':'Answers requests, calls donors.','Data entry':'Adds donors and donations.','Volunteer lead':'Volunteers and camps.'};
function pickNa(el,r){el.parentElement.querySelectorAll('.pickopt').forEach(x=>x.classList.remove('on'));el.classList.add('on');naRole=r}
function saveAccount(e){
 e.preventDefault();
 const f=e.target,name=f.querySelector('input').value.trim()||'The new account';
 sheet(`<div class="tick">✓</div><h2 style="margin-bottom:6px">Invitation sent</h2>
 <p class="sm" style="margin-bottom:20px">${name} has been created as <b>${naRole}</b> and can do nothing until they open the link and set a password.</p>
 <div style="margin-bottom:20px">${[['Created by',ROLES[ROLE].who],['Role',naRole],['Sees',SCOPE||'All fourteen towns'],['Link expires','in 7 days'],['Written to the log','yes, permanently']].map(([k,v])=>`<div class="drow"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
 <button class="btn btn-p" style="width:100%" onclick="closeSheet()">Done</button>
 <button class="btn btn-o" style="width:100%;margin-top:10px" onclick="newAccount()">Create another</button>`);
 return false;
}
