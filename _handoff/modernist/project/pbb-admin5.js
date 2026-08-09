/* PBB admin — my profile, data import/export, and the interactive role editor. */

/* ---------------- MY PROFILE ---------------- */
PAGES['admin/profile']=()=>{
 const r=ROLES[ROLE];
 return adminShell('profile',`
 <div class="g2" style="gap:18px;align-items:start">
 <div>
 <div class="acard"><h3 style="margin-bottom:18px">Your details</h3>
 <div class="row" style="gap:16px;margin-bottom:20px">
 <div class="avatar"><image-slot id="me-photo" shape="circle" placeholder="Photo"></image-slot></div>
 <div style="flex:1"><b style="font-size:17px">${r.who}</b><div class="sm">${r.sub}</div>
 <div class="row" style="gap:8px;margin-top:10px"><button class="btn btn-o btn-s">Change photo</button><button class="btn btn-o btn-s">Remove</button></div></div></div>
 <div class="fgrp"><label class="lb">Full name</label><input class="fld" value="${r.who}"></div>
 <div class="fgrp"><label class="lb">Office</label><input class="fld" value="${r.office}" disabled style="opacity:.65"><div class="sm" style="margin-top:6px">Set by whoever created your account. Ask them to move you.</div></div>
 <div class="g2" style="gap:14px"><div class="fgrp"><label class="lb">Telephone</label><input class="fld" value="${r.phone}"></div>
 <div class="fgrp"><label class="lb">Email</label><input class="fld" value="${r.email}"></div></div>
 <div class="fgrp"><label class="lb">Language you prefer</label><select class="fld"><option>English</option><option>اردو Urdu</option><option>پښتو Pashto</option></select></div>
 <button class="btn btn-p" style="width:100%">Save</button></div>

 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:6px">Password</h3><p class="sm" style="margin-bottom:16px">Change it here. Nobody else can see it, including the super admin — they can only reset it.</p>
 <div class="fgrp"><label class="lb">Current password</label><input class="fld" type="password"></div>
 <div class="g2" style="gap:14px"><div class="fgrp"><label class="lb">New password</label><input class="fld" type="password"></div>
 <div class="fgrp"><label class="lb">Type it again</label><input class="fld" type="password"></div></div>
 <button class="btn btn-o" style="width:100%">Change password</button></div>
 </div>

 <div>
 <div class="acard"><h3 style="margin-bottom:6px">Two-step sign in</h3><p class="sm" style="margin-bottom:16px">A code sent to your phone each time you sign in from a new device. Required for anyone who can see telephone numbers.</p>
 <div class="listrow">
 <div><b>Currently</b><div class="sm">On, by SMS to ${r.phone}</div></div><span class="tag ok">On</span></div>
 <button class="btn btn-o" style="width:100%;margin-top:14px">Turn off</button></div>

 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:6px">What you can do here</h3><p class="sm" style="margin-bottom:14px">Set by ${ROLE==='head'?'the organising committee':'the person who created your account'}. Ask them if you need more.</p>
 <div class="drow"><span>Role</span><b>${r.who}</b></div>
 <div class="drow"><span>You can see</span><b>${SCOPE||'All fourteen towns'}</b></div>
 <div class="drow"><span>Screens you can open</span><b>${(ALLOW[ROLE]||{length:24}).length||24}</b></div>
 <a href="#/admin/roles" class="btn btn-o" style="width:100%;margin-top:14px">See what each role can do</a></div>

 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:16px">Where you are signed in</h3>
 ${[['This device','Quetta · now','1'],['Office desktop','Quetta · 2 days ago',''],['Phone','Zhob · 8 days ago','']].map(([d,w,cur])=>`<div class="listrow"><div><b>${d}</b><div class="sm">${w}</div></div>${cur?'<span class="tag ok">This one</span>':'<button class="btn btn-o btn-s">Sign out</button>'}</div>`).join('')}
 <button class="btn btn-d" style="width:100%;margin-top:14px">Sign out everywhere else</button></div>
 </div></div>`,
 `<h1>Your account</h1><span class="asub">${r.who}</span>`);
};

/* ---------------- DATA IMPORT / EXPORT ---------------- */
PAGES['admin/data']=()=>adminShell('data',`
 <div class="g2" style="gap:18px;align-items:start">
 <div>
 <div class="acard"><h3 style="margin-bottom:6px">Bring the old book in</h3><p class="sm" style="margin-bottom:18px">Twenty-seven years of paper does not have to be typed twice. Upload a spreadsheet and match the columns once.</p>
 <div class="dropzone" style="margin-bottom:16px">Drop a CSV or Excel file here<br><span class="sm">or photograph a page and somebody will type it</span></div>
 <div class="qlab" style="margin-bottom:10px">Match the columns</div>
 ${[['Name','Column A — Name','ok'],['Blood group','Column C — Grp','ok'],['Phone','Column D — Contact','ok'],['Town','Column F — Area','ok'],['Last donated','Column H — Date','warn'],['Address','not matched','off']].map(([f,c,s])=>`<div class="maprow"><span class="mf">${f}</span><span class="mc">${c}</span><span class="tag ${s==='ok'?'ok':s==='warn'?'wt':'gy'}">${s==='ok'?'Matched':s==='warn'?'Check the date format':'Skipped'}</span></div>`).join('')}
 <div class="ahint" style="margin-top:16px">Dates in the old registers are written several ways. Anything the importer cannot read with confidence is left blank rather than guessed — a wrong last-donation date puts a donor at risk.</div>
 <button class="btn btn-p" style="width:100%;margin-top:16px">Check the file</button></div>

 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:6px">What the check found</h3><p class="sm" style="margin-bottom:16px">Nothing is saved until you say so.</p>
 <div class="g2" style="gap:12px">
 <div class="statbox ok"><b>1,842</b><span>rows ready</span></div>
 <div class="statbox wt"><b>61</b><span>possible duplicates</span></div>
 <div class="statbox no"><b>14</b><span>missing a phone number</span></div>
 <div class="statbox gy"><b>7</b><span>no blood group</span></div></div>
 <div class="qlab" style="margin:20px 0 10px">Possible duplicates</div>
 ${[['Abdul Samad Kakar','0300 3815590','already on the Quetta register'],['Muhammad Ayaz','0333 7828121','already on the Pishin register']].map(([n,p,w])=>`<div class="duprow"><div><b>${n}</b><div class="sm">${p} · ${w}</div></div><div class="row" style="gap:6px"><button class="btn btn-o btn-s">Merge</button><button class="btn btn-o btn-s">Keep both</button></div></div>`).join('')}
 <button class="btn btn-p" style="width:100%;margin-top:18px">Import 1,842 donors</button>
 <button class="btn btn-o" style="width:100%;margin-top:9px">Cancel and start again</button></div>
 </div>

 <div>
 <div class="acard"><h3 style="margin-bottom:6px">Take a copy out</h3><p class="sm" style="margin-bottom:16px">Exporting the register is recorded in the log with the reason you type. Head office only.</p>
 ${[['Donor register','CSV or Excel'],['Blood requests','CSV'],['Donations ledger','CSV'],['Thalassemia register','CSV'],['Everything','a full backup file']].map(([n,f])=>`<div class="listrow"><div><b>${n}</b><span class="sm" style="display:block">${f}</span></div><button class="btn btn-o btn-s" ${ROLE==='head'?'':'disabled style="opacity:.4"'}>Export</button></div>`).join('')}
 ${ROLE==='head'?'':'<div class="ahint" style="margin-top:14px">Only the head office can export. Ask the organising committee.</div>'}</div>

 <div class="acard" style="margin-top:18px"><h3 style="margin-bottom:6px">Backups</h3><p class="sm" style="margin-bottom:14px">Taken every night and kept for ninety days.</p>
 ${[['Last night','02:00','ok'],['Two nights ago','02:00','ok'],['Three nights ago','02:00','ok']].map(([d,t,s])=>`<div class="listrow"><div><b>${d}</b><div class="sm">${t}</div></div><span class="tag ok">Complete</span></div>`).join('')}
 <button class="btn btn-o" style="width:100%;margin-top:14px">Restore from a backup</button></div>

 <div class="acard" style="margin-top:18px;border-color:#F0BDB6"><h3 style="margin-bottom:6px;color:var(--red-d)">Removing somebody</h3><p class="sm">A donor who asks to be taken off is removed the same day, and we do not ask them why. Their donations stay in the yearly totals as a number, without their name.</p>
 <button class="btn btn-o" style="width:100%;margin-top:14px">Remove a person</button></div>
 </div></div>`,
 `<h1>Data</h1><span class="asub">Import, export and backups</span>`);


/* last admin file — every screen is registered, so render the address actually asked for */
route();
