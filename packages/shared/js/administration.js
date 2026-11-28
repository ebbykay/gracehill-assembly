(() => {
'use strict';
const title=document.getElementById('adminPageTitle'),description=document.getElementById('module-description'),content=document.getElementById('module-content');
const modules={
 membership:{fields:['Member','Household','Status'],rows:[['Demo Member A','Household A','Active'],['Demo Member B','Household B','New']],action:'Add fictional member'},
 attendance:{fields:['Service','Date','Attendance'],rows:[['Sunday service','2026-11-22','84'],['Midweek service','2026-11-25','32']],action:'Record sample attendance'},
 finance:{fields:['Transaction','Category','Amount (GHS)'],rows:[['Demo offering','Income','450'],['Demo supplies','Expense','120']],action:'Add sample transaction'},
 events:{fields:['Programme','Date','Status'],rows:[['Demo Sunday service','2026-12-06','draft'],['Demo worship evening','2026-12-13','review']],action:'Create sample programme'},
 ministry:{fields:['Ministry','Coordinator','Status'],rows:[['Music','Demo Leader A','Active'],['Media','Demo Leader B','Active']],action:'Add sample ministry'},
 media:{fields:['Resource','Format','Status'],rows:[['Demo sermon','Video','Draft'],['Demo service photos','Photo','Review']],action:'Register sample media'},
 care:{fields:['Case reference','Follow-up date','Status'],rows:[['DEMO-001','2026-12-04','Open'],['DEMO-002','2026-12-08','Scheduled']],action:'Add fictional case'},
 communications:{fields:['Announcement','Audience','Status'],rows:[['Demo service reminder','Members','Draft'],['Demo volunteer meeting','Volunteers','Scheduled']],action:'Compose sample announcement'},
 reports:{fields:['Metric','Period','Value'],rows:[['Attendance','November demo','116'],['Programmes','December demo','2']],action:'Add sample metric'},
 settings:{fields:['Configuration','Value','Status'],rows:[['Organisation','Gracehill demonstration','Example'],['Editor role','Programme drafts','Example'],['Publisher role','Review and publish','Example']],action:'Add sample setting'}
};
const buttons=[...document.querySelectorAll('[data-department]')];
const el=(tag,value,cls)=>{const node=document.createElement(tag);if(value!==undefined)node.textContent=value;if(cls)node.className=cls;return node;};
const button=(label,fn)=>{const b=el('button',label,'demo-button');b.type='button';b.addEventListener('click',fn);return b;};
const currency=n=>new Intl.NumberFormat('en-GH',{style:'currency',currency:'GHS',maximumFractionDigits:2}).format(n);
const icons={dashboard:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',membership:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M16 3a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-4-4',attendance:'M3 20h18 M5 16v-5 M12 16V4 M19 16V8',finance:'M3 6h18v14H3z M3 10h18 M16 15h2 M3 6l15-3v3',events:'M3 5h18v16H3z M7 3v4 M17 3v4 M3 10h18 M8 14h2 M14 14h2 M8 18h2',ministry:'M12 3v18 M4 8h16 M5 21h14',media:'M3 5h18v14H3z M10 9l5 3-5 3z',care:'M12 21S3 15 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 7-9 13-9 13z',communications:'M3 4h18v14H8l-5 4z M7 9h10 M7 13h7',reports:'M4 3h12l4 4v14H4z M16 3v5h4 M8 12h8 M8 16h8',settings:'M4 7h16 M4 17h16 M8 4v6 M16 14v6'};
function icon(key){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.65');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');const p=document.createElementNS(svg.namespaceURI,'path');p.setAttribute('d',icons[key]||icons.dashboard);svg.append(p);return svg;}
for(const b of buttons){const label=el('span',b.textContent.trim());b.replaceChildren(icon(b.dataset.department),label);}
const menu=document.getElementById('adminMenuToggle'),nav=document.getElementById('adminNavigation');
function closeMenu(){nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');menu.setAttribute('aria-expanded',String(open));});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('is-open')){closeMenu();menu.focus();}});
function dashboard(){
 const members=modules.membership.rows,attendance=modules.attendance.rows,events=modules.events.rows,finance=modules.finance.rows;
 const sum=kind=>finance.filter(r=>r[1]===kind).reduce((n,r)=>n+Math.round(Number(r[2])*100),0)/100;
 const total=attendance.reduce((n,r)=>n+Number(r[2]),0);
 const hero=el('section',undefined,'command-hero');const welcome=el('div');welcome.append(el('p','GRACEHILL  /  OPERATIONS','hero-kicker'),el('h2','Serve with purpose. Lead with clarity.'),el('p','One workspace for church administration, service coordination and stewardship.'));const action=button('Plan a service',()=>navigate('events'));action.classList.add('hero-action');welcome.append(action);const mark=el('div','G','hero-watermark');mark.setAttribute('aria-hidden','true');hero.append(welcome,mark);content.append(hero);
 const metrics=el('section',undefined,'command-metrics');metrics.setAttribute('aria-label','Sample operational indicators');
 for(const [key,label,value,caption] of [['membership','Members',members.length,members.filter(r=>r[2]==='Active').length+' active sample members'],['attendance','Recorded attendance',total,attendance.length+' recorded services'],['events','Programmes',events.length,events.filter(r=>r[2]==='review').length+' awaiting review'],['finance','Net cash movement',currency(sum('Income')-sum('Expense')),'All sample transactions']]){
 const a=el('article',undefined,'command-metric');const symbol=el('span',undefined,'metric-icon');symbol.append(icon(key));const link=button('View '+label.toLowerCase(),()=>navigate(key));link.classList.add('metric-link');a.append(symbol,el('h2',label),el('p',String(value),'metric-number'),el('p',caption,'metric-caption'),link);metrics.append(a);}
 content.append(metrics);
 const chart=el('article',undefined,'command-chart');chart.append(el('h2','Attendance overview'),el('p','Recorded sample services','metric-caption'));const bars=el('div',undefined,'command-bars');const recent=attendance.slice(-6),max=Math.max(1,...recent.map(r=>Number(r[2])));for(const row of recent){const col=el('div',undefined,'command-bar-column');const track=el('div',undefined,'command-bar-track');const bar=el('div',undefined,'command-bar-fill');bar.style.height=Math.max(2,Number(row[2])/max*100)+'%';track.append(bar);col.append(el('strong',row[2]),track,el('span',row[0]),el('small',row[1]));bars.append(col);}chart.append(bars,button('Open attendance',()=>navigate('attendance')));
 const upcoming=el('article',undefined,'command-agenda');upcoming.append(el('h2','Programme agenda'),el('p','Scheduled sample programmes','metric-caption'));for(const r of [...events].filter(r=>r[2]!=='archived').sort((a,b)=>a[1].localeCompare(b[1])).slice(0,4)){const item=el('div',undefined,'agenda-row'),date=el('div',undefined,'agenda-date');const d=new Date(r[1]+'T00:00:00Z');date.append(el('strong',String(d.getUTCDate()).padStart(2,'0')),el('small',new Intl.DateTimeFormat('en',{month:'short',timeZone:'UTC'}).format(d)));const text=el('div');text.append(el('strong',r[0]),el('p',r[2],'agenda-status'));item.append(date,text);upcoming.append(item);}upcoming.append(button('Open calendar',()=>navigate('events')));
 const actions=el('article',undefined,'command-actions');actions.append(el('h2','Quick access'),el('p','Frequently used administrative workspaces','metric-caption'));const grid=el('div',undefined,'command-action-grid');for(const [key,label,caption] of [['membership','Member directory','Profiles and households'],['attendance','Service registers','Record attendance'],['finance','Stewardship','Cash and budgets'],['events','Service planning','Calendar and outlines'],['media','Media desk','Review resources'],['reports','Reports','Operational insights']]){const b=button('',()=>navigate(key));b.classList.add('command-shortcut');const t=el('span');t.append(el('strong',label),el('small',caption));b.append(icon(key),t);grid.append(b);}actions.append(grid);
 const review=el('article',undefined,'command-review');review.append(el('h2','Review queue'),el('p','Sample work requiring attention','metric-caption'));for(const [key,label,count] of [['events','Programmes in review',events.filter(r=>r[2]==='review').length],['media','Media in review',modules.media.rows.filter(r=>r[2]==='Review').length],['care','Open care follow-ups',modules.care.rows.filter(r=>r[2]!=='Closed').length],['communications','Draft announcements',modules.communications.rows.filter(r=>r[2]==='Draft').length]]){const b=button('',()=>navigate(key));b.classList.add('review-row');b.append(el('span',label),el('strong',String(count)));review.append(b);}content.append(chart,upcoming,actions,review);
}
const departmentCopy={
 membership:['People & community','Manage member profiles, households and ministry connections.'],
 attendance:['Participation','Track service attendance and maintain sample registers.'],
 finance:['Stewardship','Monitor cash movement, transactions and expense ceilings.'],
 events:['Worship & programmes','Coordinate the church calendar and prepare service outlines.'],
 ministry:['Teams & service','Coordinate ministries and their responsibilities.'],
 media:['Content & publication','Organise media resources and editorial review.'],
 care:['Care & follow-up','Review fictional follow-up schedules and case statuses.'],
 communications:['Church communications','Prepare announcements and review their readiness.'],
 reports:['Operational intelligence','Explore sample indicators across the church.'],
 settings:['Workspace preferences','Review demonstration configuration and access boundaries.']
};
function departmentMetrics(key){
 const rows=modules[key].rows,count=(status)=>rows.filter(r=>r[2].toLowerCase()===status.toLowerCase()).length;
 const sum=kind=>rows.filter(r=>r[1]===kind).reduce((s,r)=>s+Math.round(Number(r[2])*100),0)/100;
 const total=rows.reduce((s,r)=>s+(Number(r[2])||0),0);
 const values={
 membership:[['Members',rows.length],['Active',count('active')],['Households',new Set(rows.map(r=>r[1])).size]],
 attendance:[['Total attendance',total],['Services',rows.length],['Average per service',rows.length?(total/rows.length).toFixed(1):'0']],
 finance:[['Income',currency(sum('Income'))],['Expenses',currency(sum('Expense'))],['Net movement',currency(sum('Income')-sum('Expense'))]],
 events:[['Programmes',rows.length],['In review',count('review')],['Published',count('published')]],
 ministry:[['Ministries',rows.length],['Active',count('active')],['Inactive',count('inactive')]],
 media:[['Resources',rows.length],['In review',count('review')],['Published',count('published')]],
 care:[['Follow-ups',rows.length],['Open',count('open')],['Scheduled',count('scheduled')]],
 communications:[['Announcements',rows.length],['Drafts',count('draft')],['Scheduled',count('scheduled')]],
 reports:[['Members',modules.membership.rows.length],['Attendance',modules.attendance.rows.reduce((s,r)=>s+Number(r[2]),0)],['Programmes',modules.events.rows.length]],
 settings:[['Environment','Demo'],['Authentication','Offline'],['Storage','Session only']]
 }[key];
 const section=el('section',undefined,'department-metrics');section.setAttribute('aria-label','Department sample indicators');
 for(const [label,value] of values){const a=el('article',undefined,'department-metric');const symbol=el('span',undefined,'metric-icon');symbol.append(icon(key));const text=el('div');text.append(el('h2',label),el('p',String(value),'department-number'));a.append(symbol,text);section.append(a);}
 return section;
}
function insights(key){
 const rows=modules[key].rows, a=el('article',undefined,'demo-insights');a.append(el('h2',({events:'Programme schedule',attendance:'Attendance by service',finance:'Financial overview',membership:'Membership overview',ministry:'Ministry coordination',media:'Publication pipeline',care:'Follow-up schedule',communications:'Announcement pipeline',reports:'Operational indicators',settings:'Access and configuration'})[key]));
 const list=el('ul',undefined,'demo-insight-list');
 const item=(label,value)=>{const li=el('li');li.append(el('strong',label),el('span',String(value)));list.append(li);};
 const groups=(index)=>{const counts=new Map();for(const row of rows)counts.set(row[index],(counts.get(row[index])||0)+1);for(const [label,count] of counts)item(label,count);};
 const bars=(entries)=>{const max=Math.max(1,...entries.map(x=>x[1]));for(const [label,value] of entries){const line=el('div',undefined,'demo-bar');const meter=el('meter');meter.min=0;meter.max=max;meter.value=value;meter.setAttribute('aria-label',label);line.append(el('span',label),meter,el('strong',String(value)));a.append(line);}};
 if(key==='finance'){const sum=kind=>rows.filter(r=>r[1]===kind).reduce((s,r)=>s+(Number(r[2])||0),0);const fmt=n=>new Intl.NumberFormat('en-GH',{style:'currency',currency:'GHS'}).format(n);item('Income',fmt(sum('Income')));item('Expenses',fmt(sum('Expense')));item('Net balance',fmt(sum('Income')-sum('Expense')));bars([['Income',sum('Income')],['Expenses',sum('Expense')]]);}
 else if(key==='attendance'){item('Total recorded',rows.reduce((s,r)=>s+(Number(r[2])||0),0));item('Services recorded',rows.length);bars(rows.map(r=>[r[0],Number(r[2])||0]));}
 else if(key==='events'||key==='care'){for(const row of [...rows].sort((a,b)=>a[1].localeCompare(b[1])))item(row[1],row[0]+' · '+row[2]);}
 else if(key==='reports'){for(const row of rows)item(row[0]+' · '+row[1],row[2]);}
 else if(key==='settings'){item('Environment','Public demonstration');item('Authentication','Not connected');item('Permission changes','Simulated only');}
 else {item('Total sample records',rows.length);groups(2);}
 a.append(list);return a;
}
function workspace(key){
 let metrics=departmentMetrics(key);content.append(metrics);
 let overview=insights(key);content.append(overview);
 const studio=key==='events'?window.createServicePlanningDemo(modules.events.rows):null;
 if(studio)content.append(studio.section);
 const directory=key==='membership'?window.createMembershipDemo(modules.membership.rows):null;
 if(directory)content.append(directory.section);
 const operations=['attendance','finance','reports','ministry','media','care','communications'].includes(key)?window.createOperationsDemo(key,modules):null;
 if(operations)content.append(operations.section);
 if(operations)operations.section.addEventListener('demo-records-changed',()=>draw());
 const m=modules[key],panel=el('article',undefined,'demo-panel'),controls=el('div',undefined,'demo-controls'),notice=el('p','Changes are temporary and remain in this browser tab.','demo-notice');notice.setAttribute('role','status');
 const search=el('input');search.type='search';search.placeholder='Search fictional records';search.setAttribute('aria-label','Search fictional records');
 const wrap=el('div',undefined,'demo-table-wrap'),table=el('table'),thead=el('thead'),head=el('tr'),tbody=el('tbody');for(const field of [...m.fields,'Actions']){const h=el('th',field);h.scope='col';head.append(h);}thead.append(head);table.append(thead,tbody);wrap.append(table);
 const form=el('form',undefined,'demo-form');form.hidden=true;let editing=-1;const inputs=m.fields.map((field,i)=>{const label=el('label',field),choices=field==='Category'?['Income','Expense']:field==='Format'?['Video','Audio','Photo','Podcast']:field==='Status'&&key!=='events'?({membership:['Active','New','Inactive'],ministry:['Active','Inactive'],media:['Draft','Review','Published'],care:['Open','Scheduled','Closed'],communications:['Draft','Scheduled','Sent'],settings:['Example']}[key]||[]):[];const input=el(choices.length?'select':'input');for(const choice of choices){const option=el('option',choice);option.value=choice;input.append(option);}input.setAttribute('aria-label',field);input.required=true;input.maxLength=100;input.name='field'+i;if(field==='Date'||field==='Follow-up date')input.type='date';if(field==='Attendance'||field==='Amount (GHS)'){input.type='number';input.min='0';input.step=field==='Attendance'?'1':'.01';input.max=field==='Attendance'?'1000000':'100000000';}label.append(input);form.append(label);return input;});
 const save=el('button','Save sample','demo-button');save.type='submit';form.append(save,button('Cancel',()=>{form.hidden=true;}));
 function open(index){editing=index;inputs.forEach((input,i)=>input.value=index<0?(input.tagName==='SELECT'?input.options[0].value:''):m.rows[index][i]);if(key==='events'&&index<0)inputs[2].value='draft';if(key==='events')inputs[2].readOnly=true;form.hidden=false;inputs[0].focus();}
 function draw(){const newMetrics=departmentMetrics(key);metrics.replaceWith(newMetrics);metrics=newMetrics;if(operations)operations.refresh();if(directory)directory.refresh();if(studio)studio.refresh();const updated=insights(key);overview.replaceWith(updated);overview=updated;tbody.replaceChildren();const q=search.value.toLowerCase();m.rows.forEach((row,i)=>{if(!row.join(' ').toLowerCase().includes(q))return;const tr=el('tr');row.forEach((v,i)=>{const td=el('td');if(m.fields[i]==='Status'||m.fields[i]==='Category'){const badge=el('span',v,'record-status');badge.dataset.status=v.toLowerCase();td.append(badge);}else td.textContent=v;tr.append(td);});const actions=el('td');if(key!=='events'||row[2]==='draft')actions.append(button('Edit',()=>open(i)));if(key==='events'){const next={draft:[['review','Submit for review']],review:[['draft','Return to draft'],['published','Publish sample']],published:[['archived','Archive']]}[row[2]]||[];for(const [status,label] of next)actions.append(button(label,()=>{form.hidden=true;editing=-1;row[2]=status;notice.textContent='Sample status changed to '+status;draw();}));}tr.append(actions);tbody.append(tr);});if(!tbody.children.length){const tr=el('tr'),td=el('td','No matching sample records.');td.colSpan=m.fields.length+1;tr.append(td);tbody.append(tr);}}
 form.addEventListener('submit',e=>{e.preventDefault();const values=inputs.map(i=>i.value.trim());if(values.some(v=>!v))return;if(editing<0)m.rows.push(values);else m.rows[editing].splice(0,m.rows[editing].length,...values);form.hidden=true;notice.textContent='Sample record saved in memory only.';draw();});
 controls.append(search,button(m.action,()=>open(-1)));search.addEventListener('input',draw);panel.append(el('h2','Record management'),el('p','Search, review or update fictional records.','metric-caption'),controls,notice,form,wrap);content.append(panel);draw();
}
function navigate(key,update=true){if(key!=='dashboard'&&!Object.hasOwn(modules,key))key='dashboard';const active=buttons.find(b=>b.dataset.department===key);buttons.forEach(b=>{b.classList.toggle('active',b===active);b.setAttribute('aria-pressed',String(b===active));});title.textContent=active.textContent;document.getElementById('adminCrumb').textContent=active.textContent;content.classList.toggle('command-grid',key==='dashboard');content.classList.toggle('department-grid',key!=='dashboard');document.getElementById('departmentEyebrow').textContent=key==='dashboard'?'CHURCH OPERATIONS':departmentCopy[key][0].toUpperCase();closeMenu();description.textContent=key==='dashboard'?'Your church operations at a glance.':departmentCopy[key][1];content.replaceChildren();if(key==='dashboard')dashboard();else workspace(key);if(update&&location.hash!=='#'+key)history.pushState(null,'','#'+key);title.focus();}
buttons.forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.department)));window.addEventListener('hashchange',()=>navigate(location.hash.slice(1),false));navigate(location.hash.slice(1)||'dashboard',false);
})();
