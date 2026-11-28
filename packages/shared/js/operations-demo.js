// Shared synthetic operations workspace; no network, storage or real records.
window.createOperationsDemo=(()=>{
 const registers=new Map(),budgets=new Map();
 const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const btn=(text,fn)=>{const b=el('button',text);b.type='button';b.className='demo-button';b.addEventListener('click',fn);return b;};
 const field=(parent,label,type,options=[])=>{const l=el('label',label),i=el(options.length?'select':'input');i.setAttribute('aria-label',label);if(options.length)for(const value of options){const o=el('option',value);o.value=value;i.append(o);}else i.type=type;l.append(i);parent.append(l);return i;};
 const cents=v=>Math.round(Number(v)*100);
 const money=v=>new Intl.NumberFormat('en-GH',{style:'currency',currency:'GHS'}).format(v/100);
 const sum=(rows,kind)=>rows.filter(r=>r[1]===kind).reduce((s,r)=>s+cents(r[2]),0);
 const line=(parent,label,value)=>{const p=el('p');p.append(el('strong',label+': '),el('span',String(value)));parent.append(p);};
 return function(key,modules){
 const section=el('article');section.className='demo-operations';const body=el('div');section.append(el('h2',({attendance:'Service attendance register',finance:'Budget control and cash summary',reports:'Integrated operational report',ministry:'Volunteer scheduling',media:'Editorial review desk',care:'Follow-up worklist',communications:'Announcement review desk'})[key]),el('p','Synthetic demonstration. No operational records or external actions.'),body);
 let selection=0,filter='';
 function refresh(){
 body.replaceChildren();
 if(key==='attendance'){
 const rows=modules.attendance.rows,select=field(body,'Select sample service','',rows.map((r,i)=>String(i+1)+' · '+r[0]+' · '+r[1]));select.selectedIndex=Math.min(selection,rows.length-1);
 select.addEventListener('change',()=>{selection=select.selectedIndex;refresh();});const service=rows[select.selectedIndex];if(!service)return;
 if(!registers.has(service))registers.set(service,new Set());const roster=registers.get(service);
 const form=el('form');form.className='demo-form';for(const row of modules.membership.rows.filter(r=>r[2]!=='Inactive')){const label=el('label',row[0]),check=el('input');check.type='checkbox';check.checked=roster.has(row);check.addEventListener('change',()=>{if(check.checked)roster.add(row);else roster.delete(row);});label.append(check);form.append(label);}
 const note=el('p');note.setAttribute('role','status');line(body,'Existing aggregate count',service[2]);body.append(form,btn('Save sample register',()=>{service[2]=String([...roster].filter(r=>r[2]!=='Inactive').length);note.textContent='Sample register saved; aggregate count updated. Reopen Attendance to refresh the general table.';}),note);
 }else if(key==='finance'){
 const rows=modules.finance.rows;const income=sum(rows,'Income'),expense=sum(rows,'Expense');line(body,'Recorded income',money(income));line(body,'Recorded expenses',money(expense));line(body,'Net cash movement',money(income-expense));
 const form=el('form');form.className='demo-form';const period=field(form,'Budget month','month');period.value=filter||'2026-11';period.required=true;const amount=field(form,'Sample expense ceiling (GHS)','number');amount.min='0';amount.max='100000000';amount.step='.01';amount.required=true;amount.value=budgets.has(period.value)?String(budgets.get(period.value)/100):'500';
 const update=el('button','Save sample budget');update.type='submit';update.className='demo-button';form.append(update);body.append(form);
 line(body,'Sample expense ceiling',money(budgets.get(period.value)??50000));line(body,'Illustrative remaining allowance',money((budgets.get(period.value)??50000)-expense));body.append(el('p','Transactions have no dates in this prototype: the comparison uses all sample expenses, not a month-specific ledger.'));
 period.addEventListener('change',()=>{filter=period.value;refresh();});form.addEventListener('submit',e=>{e.preventDefault();if(!period.value||!Number.isFinite(Number(amount.value))||Number(amount.value)<0)return;budgets.set(period.value,cents(amount.value));filter=period.value;refresh();});
 }else if(key==='reports'){
 const rows=modules.finance.rows,attendance=modules.attendance.rows;
 const metrics=[['Members',modules.membership.rows.length],['Active members',modules.membership.rows.filter(r=>r[2]==='Active').length],['Recorded attendance',attendance.reduce((s,r)=>s+Number(r[2]),0)],['Services recorded',attendance.length],['Programmes',modules.events.rows.length],['Published programmes',modules.events.rows.filter(r=>r[2]==='published').length],['Cash movement',money(sum(rows,'Income')-sum(rows,'Expense'))],['Open care cases',modules.care.rows.filter(r=>r[2]!=='Closed').length]];
 for(const [label,value] of metrics)line(body,label,value);
 body.append(btn('Print sample operational report',()=>{document.body.classList.add('printing-operations');try{window.print();}finally{document.body.classList.remove('printing-operations');}}));
 }else{
 const config={ministry:['Active','Inactive'],media:['Draft','Review','Published'],care:['Open','Scheduled','Closed'],communications:['Draft','Scheduled','Sent']}[key];
 const status=field(body,'Filter worklist status','',['All statuses',...config]);status.value=filter||'All statuses';status.addEventListener('change',()=>{filter=status.value;refresh();});
 const list=el('ul');list.className='demo-insight-list';for(const row of modules[key].rows){if(status.value!=='All statuses'&&row[2]!==status.value)continue;const li=el('li');li.append(el('strong',row[0]),el('span',row[1]+' · '+row[2]));list.append(li);}if(!list.children.length)list.append(el('li','No matching sample records.'));body.append(list);
 if(key==='ministry')body.append(el('p','Roster assignment and participant availability remain separate future workflows.'));
 if(key==='communications')body.append(el('p','Sent is a fictional status only; no message is transmitted.'));
 }
 }
 refresh();return {section,refresh};
 };
})();
