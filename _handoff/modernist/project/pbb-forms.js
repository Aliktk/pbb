/* PBB admin — the forms behind every "+ Add" button.
   One builder, so a new form is a description rather than a new sheet of markup. */

const F={
 t:(n,l,ph,req)=>`<div class="fgrp"><label class="lb">${l}${req?' *':''}</label><input class="fld" name="${n}"${req?' required':''}${ph?` placeholder="${ph}"`:''}></div>`,
 tel:(n,l)=>`<div class="fgrp"><label class="lb">${l}</label><input class="fld" type="tel" name="${n}" placeholder="0300 0000000"></div>`,
 date:(n,l,req)=>`<div class="fgrp"><label class="lb">${l}${req?' *':''}</label><input class="fld" type="date" name="${n}"${req?' required':''}></div>`,
 num:(n,l,v)=>`<div class="fgrp"><label class="lb">${l}</label><input class="fld" type="number" name="${n}" value="${v||''}"></div>`,
 area:(n,l,ph)=>`<div class="fgrp"><label class="lb">${l}</label><textarea class="fld" name="${n}" rows="3"${ph?` placeholder="${ph}"`:''}></textarea></div>`,
 sel:(n,l,opts)=>`<div class="fgrp"><label class="lb">${l}</label><select class="fld" name="${n}">${opts.map(o=>`<option>${o}</option>`).join('')}</select></div>`,
 town:(n='c')=>`<div class="fgrp"><label class="lb">Town *</label><select class="fld" name="${n}">${(SCOPE?[SCOPE]:TOWNS14).map(t=>`<option>${t}</option>`).join('')}</select></div>`,
 group:()=>`<div class="fgrp"><label class="lb">Blood group *</label><div class="row" style="gap:7px" id="adG">${GROUPS_A.map(g=>`<button type="button" class="bgp sm2" onclick="pickAdd(this)">${g}</button>`).join('')}</div></div>`,
 two:(a,b)=>`<div class="g2" style="gap:12px">${a}${b}</div>`,
 tog:(n,l,on)=>`<label class="togrow"><span>${l}</span><input type="checkbox" name="${n}"${on?' checked':''}><i></i></label>`,
 hint:h=>`<div class="ahint" style="margin:16px 0">${h}</div>`,
 lab:l=>`<div class="qlab" style="margin:22px 0 10px">${l}</div>`
};

const FORMS={
 addVolunteer:{title:'Add a volunteer',sub:'Somebody who has offered to help. The first thing that matters is that they get called.',
  body:()=>F.t('n','Full name','',1)+F.two(F.tel('p','Telephone'),F.town())
   +F.sel('sk','What they can do',['Camps','Outreach','Driving','Translation','Fundraising','Office work','Anything needed'])
   +F.sel('av','When they are free',['Weekends','Evenings','Any time','By arrangement'])
   +F.area('note','Anything else','Skills, a vehicle, languages spoken')
   +F.hint('A volunteer is recorded as <b>not yet contacted</b> until somebody marks otherwise. That count sits first on the volunteers screen, in red.'),
  save:d=>{VOLS.unshift({n:d.n||'Unnamed',c:d.c||SCOPE||'Quetta',sk:d.sk||'Anything needed',st:'new'});return d.n+' added, and marked not yet contacted.'}},

 addChild:{title:'Register a child',sub:'Thalassemia care is free and needs no exchange donor. Nothing on this form changes that.',
  body:()=>F.two(F.t('n','Child\u2019s name','',1),F.num('a','Age in years'))+F.two(F.group(),F.town())
   +F.t('guard','Parent or guardian')+F.tel('p','Telephone')
   +F.two(F.sel('sp','Transfusion needed every',['2 weeks','3 weeks','4 weeks','6 weeks']),F.date('due','Next transfusion due'))
   +F.t('hosp','Hospital where transfused')
   +F.lab('Consent')
   +F.tog('ph','Photograph may be used publicly',0)
   +F.hint('Photo consent is <b>off</b> unless a signed form is held from the family. A child without it is still counted and still transfused — they simply never appear on the website.'),
  save:d=>{THAL.unshift({id:'T-'+String(THAL.length+40).padStart(3,'0'),n:d.n||'Unnamed',a:+d.a||0,g:pickedG()||'O+',c:d.c||SCOPE||'Quetta',due:+7,sp:0,ph:d.ph?1:0});return d.n+' registered. Transfusion schedule set.'}},

 addPartner:{title:'Add an organisation',sub:'A hospital, laboratory, foundation, welfare society, university or another blood bank.',
  body:()=>F.t('n','Name of the organisation','',1)
   +F.two(F.sel('k','Kind',['Hospital','Laboratory','Foundation','Welfare society','University or college','Another blood bank','Government body']),F.town())
   +F.lab('Who we speak to')
   +F.two(F.t('cn','Named person'),F.tel('cp','Direct line'))
   +F.t('em','Email')
   +F.area('note','What they are asking for, or offering')
   +F.hint('An organisation stays <b>pending</b> until the head office approves it. Approval gives them a named coordinator and a direct line — never a login to the register.'),
  save:d=>{PARTNERS.unshift({n:d.n||'Unnamed',k:d.k||'Hospital',c:d.c||SCOPE||'Quetta',st:'pending',since:'\u2014',note:d.note||'Added by '+ROLES[ROLE].who});return d.n+' added, and waiting for the head office.'}},

 addTown:{title:'Add a town',sub:'A town PBB will serve, with or without an office of its own.',
  body:()=>F.t('n','Town','',1)
   +F.sel('k','Standing',['Branch with its own office','Served from another office'])
   +F.sel('from','Served from',OFFICES)
   +F.hint('A town added here appears in every town list across the site at once — the request form, the donor form, the branch list and every filter in the admin.'),
  save:d=>{if(d.n&&!window.PBBTOWNS.includes(d.n))window.PBBTOWNS.push(d.n);return d.n+' added. It now appears in every town list on the site — the public request and donor forms, the branch list, the network table and every filter in the admin.'}},

 addBranch:{title:'Add a branch',sub:'An office with its own staff, its own shelf and its own register.',
  body:()=>F.t('n','Town','',1)+F.area('a','Address','Street, landmark')
   +F.two(F.tel('p','Telephone'),F.t('bank','Bank account','For donations'))
   +F.tog('amb','Has an ambulance',0)
   +F.hint('A new branch starts with an empty shelf and no stock update recorded. It will show as <b>never updated</b> until somebody enters figures — which is the point.'),
  save:d=>d.n+' added. Create its branch manager account next.'},

 newPage:{title:'New page',sub:'A page on the public website. It stays unpublished until you say otherwise.',
  body:()=>F.two(F.t('n','Page title','',1),F.t('u','Address','/about-us'))
   +F.sel('m','Where it sits in the menu',['About','Services','Get involved','Media','Not in the menu'])
   +F.area('d','What this page is for','One line, for whoever edits it next')
   +F.lab('Languages')
   +F.tog('en','English',1)+F.tog('ur','\u0627\u0631\u062f\u0648 Urdu',1)+F.tog('ps','\u067e\u069a\u062a\u0648 Pashto',0)
   +F.hint('A page missing a language shows the English text rather than an empty page, and is listed as incomplete until it is translated.'),
  save:d=>{SITEPAGES.push([d.n||'Untitled',d.u||'/new',0,d.m||'Not in the menu','EN','draft']);return d.n+' created as a draft. Nobody can see it yet.'}},

 newAnnouncement:{title:'New announcement',sub:'A notice, a camp, or something urgent. It can appear in several places at once.',
  body:()=>F.area('msg','The message','Kept short — this runs across the top of every page',1)
   +F.two(F.sel('k','Kind',['Camp','Notice','Urgent appeal','Holiday hours']),F.date('from','Starts'))
   +F.date('to','Ends')
   +F.lab('Where it appears')
   +F.tog('strip','Strip across the top of every page',1)
   +F.tog('home','Card on the home page',1)
   +F.tog('news','The announcements page',1)
   +F.hint('An end date is <b>required</b> on anything urgent. The commonest failing of a small organisation\u2019s website is a banner from two years ago that nobody remembered to remove.'),
  save:d=>(d.msg||'The announcement')+' scheduled.'},

 newEvent:{title:'New event',sub:'A camp, a drive or a gathering. People can register to attend from the website.',
  body:()=>F.t('n','What it is called','',1)
   +F.two(F.sel('k','Kind',['Blood camp','Awareness drive','Training','Meeting','Eid hide collection']),F.town())
   +F.two(F.date('d','Date',1),F.t('time','Time','9am to 4pm'))
   +F.t('place','Where','School, hall, university')
   +F.area('d2','Description','What people should expect')
   +F.tog('reg','Take registrations on the website',1)
   +F.hint('A camp should grow the register. Anybody who registers here can be added to the donor list in one press, which is the whole reason to take registrations on the site instead of on paper.'),
  save:d=>d.n+' created. It appears on the events page immediately.'},

 upload:{title:'Upload',sub:'Photographs, posters and documents. Everything on the site picks from this one library.',
  body:()=>`<div class="dropzone" style="margin-bottom:18px">Drop files here<br><span class="sm">or press to choose them</span></div>`
   +F.t('cap','Caption','What this shows, and where')
   +F.two(F.sel('k','Kind',['Photograph','Poster','Report','Form','Video']),F.town())
   +F.lab('Consent')
   +F.tog('consent','A signed consent form is held for anybody identifiable',0)
   +F.hint('A photograph of a patient or a child <b>cannot be published</b> without this. The flag travels with the file, so it cannot be lost when somebody else uses the picture later.'),
  save:d=>'Uploaded. It is now available to every page and gallery.'},

 newRole:{title:'New role',sub:'A set of permissions somebody can be given. Roles are easier to reason about than individual switches.',
  body:()=>F.t('n','What the role is called','',1)
   +F.area('d','What this role is for','One line — the person granting it should not have to guess')
   +F.sel('scope','What it can see',['One town only','All fourteen towns','Only what it created'])
   +F.lab('It may')
   +F.tog('p1','See donors',1)+F.tog('p2','Add and edit donors',0)+F.tog('p3','See telephone numbers',0)
   +F.tog('p4','Answer blood requests',0)+F.tog('p5','Edit the website',0)+F.tog('p6','Create accounts',0)
   +F.hint('A new role starts with <b>everything switched off</b>. Nobody is given more than somebody deliberately turned on.'),
  save:d=>d.n+' created, with everything switched off until you grant it.'}
};

function pickedG(){const g=document.querySelector('#adG .bgp.on');return g?g.textContent:''}

function openForm(key){
 const f=FORMS[key];if(!f)return;
 sheet(`<h2 style="margin-bottom:4px">${f.title}</h2><p class="sm" style="margin-bottom:22px">${f.sub}</p>
 <form onsubmit="return saveForm(event,'${key}')">${f.body()}
 <button class="btn btn-p" style="width:100%;padding:14px;margin-top:6px">Save</button>
 <button type="button" class="btn btn-o" style="width:100%;margin-top:9px" onclick="closeSheet()">Cancel</button></form>`);
}
function saveForm(e,key){
 e.preventDefault();
 const f=FORMS[key],fd=new FormData(e.target),d={};
 fd.forEach((v,k)=>d[k]=v);
 e.target.querySelectorAll('input[type=checkbox]').forEach(c=>d[c.name]=c.checked);
 const msg=f.save?f.save(d):'Saved.';
 sheet(`<div class="tick">\u2713</div><h2 style="margin-bottom:6px">Saved</h2>
 <p class="sm" style="margin-bottom:22px">${msg}</p>
 <button class="btn btn-p" style="width:100%" onclick="closeSheet();route()">Done</button>
 <button class="btn btn-o" style="width:100%;margin-top:9px" onclick="openForm('${key}')">Add another</button>`);
 return false;
}
