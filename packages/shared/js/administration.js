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
function card(label,value){const a=el('article');a.append(el('h2',label),el('p',String(value),'demo-stat'));return a;}
function dashboard(){content.append(card('Fictional members',modules.membership.rows.length),card('Sample attendance',modules.attendance.rows.reduce((s,r)=>s+(Number(r[2])||0),0)),card('Sample programmes',modules.events.rows.length),card('Demo net income (GHS)',modules.finance.rows.reduce((s,r)=>s+(r[1]==='Expense'?-1:1)*(Number(r[2])||0),0)));const a=el('article');a.append(el('h2','Quick actions'),button('Manage programmes',()=>navigate('events')),button('View attendance',()=>navigate('attendance')),button('View members',()=>navigate('membership')));content.append(a);}
function workspace(key){
 const m=modules[key],panel=el('article',undefined,'demo-panel'),controls=el('div',undefined,'demo-controls'),notice=el('p','Changes are temporary and remain in this browser tab.','demo-notice');notice.setAttribute('role','status');
 const search=el('input');search.type='search';search.placeholder='Search fictional records';search.setAttribute('aria-label','Search fictional records');
 const wrap=el('div',undefined,'demo-table-wrap'),table=el('table'),thead=el('thead'),head=el('tr'),tbody=el('tbody');for(const field of [...m.fields,'Actions']){const h=el('th',field);h.scope='col';head.append(h);}thead.append(head);table.append(thead,tbody);wrap.append(table);
 const form=el('form',undefined,'demo-form');form.hidden=true;let editing=-1;const inputs=m.fields.map((field,i)=>{const label=el('label',field),input=el('input');input.required=true;input.maxLength=100;input.name='field'+i;if(field==='Date'||field==='Follow-up date')input.type='date';if(field==='Attendance'||field==='Amount (GHS)'){input.type='number';input.min='0';input.step='any';}label.append(input);form.append(label);return input;});
 const save=el('button','Save sample','demo-button');save.type='submit';form.append(save,button('Cancel',()=>{form.hidden=true;}));
 function open(index){editing=index;inputs.forEach((input,i)=>input.value=index<0?'':m.rows[index][i]);if(key==='events'&&index<0)inputs[2].value='draft';if(key==='events')inputs[2].readOnly=true;form.hidden=false;inputs[0].focus();}
 function draw(){tbody.replaceChildren();const q=search.value.toLowerCase();m.rows.forEach((row,i)=>{if(!row.join(' ').toLowerCase().includes(q))return;const tr=el('tr');row.forEach(v=>tr.append(el('td',v)));const actions=el('td');if(key!=='events'||row[2]==='draft')actions.append(button('Edit',()=>open(i)));if(key==='events'){const next={draft:[['review','Submit for review']],review:[['draft','Return to draft'],['published','Publish sample']],published:[['archived','Archive']]}[row[2]]||[];for(const [status,label] of next)actions.append(button(label,()=>{row[2]=status;notice.textContent='Sample status changed to '+status;draw();}));}tr.append(actions);tbody.append(tr);});if(!tbody.children.length){const tr=el('tr'),td=el('td','No matching sample records.');td.colSpan=m.fields.length+1;tr.append(td);tbody.append(tr);}}
 form.addEventListener('submit',e=>{e.preventDefault();const values=inputs.map(i=>i.value.trim());if(values.some(v=>!v))return;if(editing<0)m.rows.push(values);else m.rows[editing]=values;form.hidden=true;notice.textContent='Sample record saved in memory only.';draw();});
 controls.append(search,button(m.action,()=>open(-1)));search.addEventListener('input',draw);panel.append(controls,notice,form,wrap);content.append(panel);draw();
}
function navigate(key,update=true){if(key!=='dashboard'&&!Object.hasOwn(modules,key))key='dashboard';const active=buttons.find(b=>b.dataset.department===key);buttons.forEach(b=>{b.classList.toggle('active',b===active);b.setAttribute('aria-pressed',String(b===active));});title.textContent=active.textContent;description.textContent=key==='events'?'Interactive editorial workflow simulation; the real API is not connected here.':'Interactive design demonstration with fictional records only.';content.replaceChildren();if(key==='dashboard')dashboard();else workspace(key);if(update)history.replaceState(null,'','#'+key);title.focus();}
buttons.forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.department)));window.addEventListener('hashchange',()=>navigate(location.hash.slice(1),false));navigate(location.hash.slice(1)||'dashboard',false);
})();
