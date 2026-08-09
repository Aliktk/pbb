/* Donor self-service — the donor's own record, without telephoning a branch. */

/* ---- sign in with a phone number and a code ---- */
PAGES['me/signin']=()=>`<section class="blk"><div class="wrap narrow">
<a href="#/" class="backlink">← Back to the website</a>
<h1 class="h1" style="margin:14px 0 10px">Your record</h1>
<p class="lede" style="margin-bottom:34px">See what we hold about you, change your telephone number, tell us you have donated somewhere else, or take yourself off the register. No password to remember.</p>
<div class="card" style="max-width:520px">
<div class="fgrp"><label class="lb">The telephone number we have for you</label><input class="fld" type="tel" placeholder="03XX XXXXXXX" value="0300 3815590"></div>
<button class="btn btn-p" style="width:100%;padding:15px" onclick="location.hash='#/me/code'">Send me a code</button>
<p class="sm" style="margin-top:14px">A six-figure code arrives by SMS. It is the only way in, so nobody can open your record from a number that is not yours.</p>
</div>
<div class="ahint" style="max-width:520px;margin-top:18px">Number changed, or never given one? Telephone any branch — the list is on <a href="#/branches">Our branches</a>.</div>
</div></section>`;

PAGES['me/code']=()=>`<section class="blk"><div class="wrap narrow">
<a href="#/me/signin" class="backlink">← Back</a>
<h1 class="h1" style="margin:14px 0 10px">Type the code</h1>
<p class="lede" style="margin-bottom:34px">Sent to 0300 3815590 a moment ago.</p>
<div class="card" style="max-width:520px">
<div class="otp">${Array.from({length:6},(_,i)=>`<input class="otpbox" maxlength="1" inputmode="numeric" value="${'482913'[i]}">`).join('')}</div>
<button class="btn btn-p" style="width:100%;padding:15px;margin-top:20px" onclick="location.hash='#/me'">Open my record</button>
<div class="row" style="justify-content:space-between;margin-top:16px"><span class="sm">Nothing after a minute?</span><a href="#/me/code" class="minilink">Send it again</a></div>
</div>
</div></section>`;

/* ---- the record itself ---- */
PAGES['me']=()=>`<section class="blk"><div class="wrap">
<div class="row" style="justify-content:space-between;align-items:flex-start;gap:18px;flex-wrap:wrap;margin-bottom:30px">
<div><h1 class="h1" style="margin-bottom:6px">Abdul Samad Kakar</h1><p class="lede">On the Quetta register since March 2019 · <b>O negative</b></p></div>
<a href="#/" class="btn btn-o">Sign out</a></div>

<div class="mecards">
<div class="card mestat ok"><div class="l">You can donate</div><div class="n">Now</div><div class="sm">Your last donation was 118 days ago. Ninety days is the minimum.</div>
<a href="#/needs" class="btn btn-p btn-s" style="margin-top:14px">See who needs O− now</a></div>
<div class="card mestat"><div class="l">You have given</div><div class="n">14 times</div><div class="sm">Roughly forty-two people have had some part of your blood since 2019.</div></div>
<div class="card mestat"><div class="l">Called on</div><div class="n">6 times</div><div class="sm">You answered five. O negative is asked for more often than any other group.</div></div>
</div>

<div class="g2" style="gap:20px;align-items:start;margin-top:22px">
<div>
<div class="card"><h3 style="margin-bottom:6px">What we hold</h3><p class="sm" style="margin-bottom:20px">Change anything here yourself. It takes effect at once.</p>
<div class="fgrp"><label class="lb">Name</label><input class="fld" value="Abdul Samad Kakar"></div>
<div class="g2" style="gap:14px"><div class="fgrp"><label class="lb">Telephone</label><input class="fld" type="tel" value="0300 3815590"></div>
<div class="fgrp"><label class="lb">Town</label><select class="fld"><option>Quetta</option><option>Pishin</option><option>Loralai</option><option>Zhob</option><option>Chaman</option></select></div></div>
<div class="fgrp"><label class="lb">Blood group</label><input class="fld" value="O negative (O−)" disabled style="opacity:.6"><div class="sm" style="margin-top:6px">Only a branch can change this, and only after a fresh test. Telephone 081-2836820 if it is wrong.</div></div>
<button class="btn btn-p" style="width:100%">Save</button></div>

<div class="card" style="margin-top:20px"><h3 style="margin-bottom:6px">Donated somewhere else?</h3><p class="sm" style="margin-bottom:16px">Tell us and we will stop calling you until you are eligible again. It costs you nothing and it stops a wasted telephone call at three in the morning.</p>
<div class="g2" style="gap:14px"><div class="fgrp"><label class="lb">When</label><input class="fld" type="date"></div>
<div class="fgrp"><label class="lb">Where</label><input class="fld" placeholder="Hospital or blood bank"></div></div>
<button class="btn btn-o" style="width:100%">Record it</button></div>
</div>

<div>
<div class="card"><h3 style="margin-bottom:16px">When we may call you</h3>
${[['Any hour, for an emergency','on'],['Only between 8am and 9pm','off'],['By SMS as well as a telephone call','on'],['About camps and events near me','on'],['Never — take me off the calling list','off']].map(([t,s])=>`<label class="togrow"><span>${t}</span><input type="checkbox" ${s==='on'?'checked':''}><i></i></label>`).join('')}
<p class="sm" style="margin-top:14px">O negative can be given to anybody, so you are called more than most. Turning the first one off is understood — say so rather than letting the phone ring.</p></div>

<div class="card" style="margin-top:20px"><h3 style="margin-bottom:16px">Your donations</h3>
${[['12 Apr 2026','Quetta','Whole blood'],['21 Nov 2025','Quetta','Whole blood'],['03 Jun 2025','Pishin camp','Whole blood'],['14 Jan 2025','Quetta','Platelets']].map(([d,w,k])=>`<div class="listrow"><div><b>${d}</b><span class="sm">${w} · ${k}</span></div><span class="tag ok">Recorded</span></div>`).join('')}
<button class="btn btn-o btn-s" style="width:100%;margin-top:16px">All fourteen</button></div>

<div class="card" style="margin-top:20px;border-color:#F0BDB6"><h3 style="margin-bottom:6px;color:var(--red-d)">Take me off the register</h3><p class="sm">Your record is removed the same day and we will not ask you to justify it. Your past donations stay in the yearly totals as a number, without your name.</p>
<button class="btn btn-o" style="width:100%;margin-top:14px" onclick="location.hash='#/me/remove'">Remove my record</button></div>
</div></div>
</div></section>`;

PAGES['me/remove']=()=>`<section class="blk"><div class="wrap narrow">
<a href="#/me" class="backlink">← Back to my record</a>
<h1 class="h1" style="margin:14px 0 10px">Take yourself off the register</h1>
<p class="lede" style="margin-bottom:30px">You do not owe us a reason. Read what happens, then confirm.</p>
<div class="card" style="max-width:560px">
${[['Your name, telephone number and address are deleted today.','Not hidden or archived — deleted.'],['We stop calling you.','Nobody at any branch can look you up again.'],['Your fourteen donations stay as a number.','They count towards the yearly total. Your name is not attached to them.'],['You can come back whenever you like.','Walk into any branch. You will be starting a new record.']].map(([a,b])=>`<div class="listrow"><div><b>${a}</b><span class="sm">${b}</span></div></div>`).join('')}
<div class="fgrp" style="margin-top:20px"><label class="lb">If you would like to tell us why (you need not)</label><textarea class="fld" rows="3" placeholder="Optional"></textarea></div>
<button class="btn btn-d" style="width:100%">Remove my record</button>
<a href="#/me" class="btn btn-o" style="width:100%;margin-top:10px">Keep my record</a>
</div></div></section>`;


/* ---- the public board: what is being asked for right now ----
   Names are never shown. A patient's identity is not the public's business;
   the blood group, the hospital and the hour are what a donor needs to decide. */
const NEEDS=[
 {g:'O−',u:3,h:'Civil Hospital, Quetta',c:'Quetta',urg:'Critical — today',ago:'22 minutes ago'},
 {g:'B−',u:2,h:'Bolan Medical Complex, Quetta',c:'Quetta',urg:'Urgent — within 2 days',ago:'1 hour ago'},
 {g:'A+',u:1,h:'DHQ Hospital, Zhob',c:'Zhob',urg:'Planned — a date is set',ago:'3 hours ago'},
 {g:'O+',u:2,h:'Sandeman Hospital, Quetta',c:'Quetta',urg:'Urgent — within 2 days',ago:'4 hours ago'}];
let needG='All';
function pickNeed(b,g){needG=g;route()}
PAGES.needs=()=>{
 const rows=needG==='All'?NEEDS:NEEDS.filter(n=>n.g===needG);
 return `
${hero('Right now','Who needs blood today','Every open request across the fourteen towns. No names — a blood group, a hospital and an hour is all a donor needs to decide.')}
<section class="blk" style="padding-top:0"><div class="wrap">
<div class="row" style="gap:8px;margin-bottom:24px;flex-wrap:wrap">${[['All','All groups'],['O−','O−'],['O+','O+'],['A−','A−'],['A+','A+'],['B−','B−'],['B+','B+'],['AB−','AB−'],['AB+','AB+']].map(([g,l])=>{const c=g==='All'?NEEDS.length:NEEDS.filter(n=>n.g===g).length;return `<button class="pill${g===needG?' on':''}" onclick="pickNeed(this,'${g}')">${l}${c?` <b style="font-variant-numeric:tabular-nums">${c}</b>`:''}</button>`}).join('')}</div>
${rows.length?`<div class="g2" style="gap:16px">`:''}${rows.map(n=>`<div class="card needcard ${n.urg.startsWith('Critical')?'crit':''}">
<div class="row" style="justify-content:space-between;align-items:flex-start;gap:14px">
<div><div class="needg">${n.g}</div><div class="sm" style="margin-top:4px">${n.u} ${n.u===1?'bag':'bags'} needed</div></div>
<span class="tag ${n.urg.startsWith('Critical')?'no':n.urg.startsWith('Urgent')?'wt':'gy'}">${n.urg}</span></div>
<h3 style="margin:16px 0 4px">${n.h}</h3><p class="sm">${n.c} · asked ${n.ago}</p>
<a href="tel:0812836820" class="btn btn-p btn-s" style="margin-top:16px;width:100%">Call the branch to give</a></div>`).join('')}${rows.length?'</div>':''}
${rows.length?'':`<div class="card" style="text-align:center;padding:52px 26px">
<div class="needg" style="color:var(--grn)">${needG}</div>
<h3 style="margin:14px 0 6px">No open requests for ${needG} right now</h3>
<p class="sm" style="max-width:44ch;margin:0 auto">Other groups are still being asked for — check <b>All groups</b> above. This board changes through the day, so it is worth looking again.</p>
<button class="btn btn-o btn-s" style="margin-top:18px" onclick="pickNeed(this,'All')">Show every group</button></div>`}
<div class="notice" style="margin-top:26px">A request leaves this board the moment a branch marks it arranged, so nobody travels to a hospital that no longer needs them. When every group is clear, this board is empty — and that is good news.</div>
<div class="closer" style="margin-top:34px"><div><h2>Not on the register yet?</h2><p>Three minutes now means a telephone call can reach you the next time your group is the one being asked for.</p></div><a href="#/join/donor" class="btn btn-w">Register as a donor</a></div>
</div></section>`};
