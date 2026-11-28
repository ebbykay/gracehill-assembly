// Synthetic service planner. No persistence, network calls or operational data.
window.createServicePlanningDemo=(()=>{
 const plans=new Map();
 const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const btn=(text,fn)=>{const b=node('button',text);b.type='button';b.className='demo-button';b.addEventListener('click',fn);return b;};
 const field=(form,label,type='text')=>{const l=node('label',label),i=node('input');i.type=type;i.setAttribute('aria-label',label);i.required=true;l.append(i);form.append(l);return i;};
 const template=()=>[['Opening prayer','Demo Prayer Team',10],['Praise and worship','Demo Music Team',25],['Scripture reading','Demo Reader',5],['Sermon','Demo Speaker',40],['Offering','Demo Finance Team',10],['Announcements and closing prayer','Demo Host',10]];
 return function createServicePlanningDemo(rows){
 const section=node('article');section.className='demo-planning';section.append(node('h2','Service planning studio'),node('p','Fictional outlines only. All times are Accra time (UTC).'));
 const calendar=node('section'),planner=node('section'),month=node('input');month.type='month';month.setAttribute('aria-label','Calendar month');month.value=(rows[0]?.[1]||new Date().toISOString()).slice(0,7);
 const calendarGrid=node('div');calendarGrid.className='demo-calendar';calendarGrid.setAttribute('aria-label','Monthly programme calendar');
 const select=node('select');select.setAttribute('aria-label','Select programme for outline');const label=node('label','Select programme for outline');label.append(select);
 const status=node('p');status.setAttribute('role','status');
 const start=node('input');start.type='time';start.setAttribute('aria-label','Service start time');const startLabel=node('label','Service start time');startLabel.append(start);
 const outline=node('div');outline.className='demo-outline';const controls=node('div');controls.className='demo-controls';
 const form=node('form');form.className='demo-form';const activity=field(form,'Activity'),participant=field(form,'Assigned participant'),duration=field(form,'Duration (minutes)','number');duration.min=1;duration.max=240;duration.step=1;activity.maxLength=100;participant.maxLength=100;
 const add=node('button','Add activity');add.className='demo-button';add.type='submit';form.append(add);let editing=null;
 const cancel=btn('Cancel activity edit',()=>resetEdit());cancel.hidden=true;form.append(cancel);
 function resetEdit(){editing=null;form.reset();add.textContent='Add activity';cancel.hidden=true;}
 function beginEdit(item){editing=item;activity.value=item[0];participant.value=item[1];duration.value=item[2];add.textContent='Save activity changes';cancel.hidden=false;activity.focus();}
 function selected(){return rows[Number(select.value)];}
 function plan(){const row=selected();if(!row)return null;if(!plans.has(row))plans.set(row,{start:'08:00',items:[]});return plans.get(row);}
 function drawCalendar(){
 calendarGrid.replaceChildren();const [y,m]=month.value.split('-').map(Number);if(!y||!m)return;
 for(const day of ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']){const h=node('strong',day);h.className='demo-weekday';calendarGrid.append(h);}
 const offset=new Date(Date.UTC(y,m-1,1)).getUTCDay(),days=new Date(Date.UTC(y,m,0)).getUTCDate();
 for(let i=0;i<offset;i++)calendarGrid.append(node('div'));
 for(let d=1;d<=days;d++){const cell=node('div');cell.className='demo-day';cell.append(node('strong',String(d)));const date=month.value+'-'+String(d).padStart(2,'0');rows.forEach((r,i)=>{if(r[1]===date&&r[2]!=='archived'){const b=btn(r[0],()=>{select.value=String(i);resetEdit();drawOutline();});b.className='demo-calendar-event';cell.append(b);}});calendarGrid.append(cell);}
 }
 function drawOutline(){
 const p=plan();outline.replaceChildren();form.hidden=!p;start.disabled=!p;controls.hidden=!p;if(!p)return;
 start.value=p.start;const [h,m]=p.start.split(':').map(Number);let cursor=h*60+m;
 const format=n=>String(Math.floor(n%1440/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')+(n>=1440?' (+1 day)':'');
 const list=node('ol');list.className='demo-service-list';p.items.forEach((item,index)=>{const li=node('li');li.append(node('strong',format(cursor)+' – '+format(cursor+item[2])+' · '+item[0]),node('p',item[1]+' · '+item[2]+' min'));cursor+=item[2];const actions=node('div');actions.className='demo-outline-actions';const up=btn('Move up',()=>{[p.items[index-1],p.items[index]]=[p.items[index],p.items[index-1]];drawOutline();});up.disabled=index===0;const down=btn('Move down',()=>{[p.items[index+1],p.items[index]]=[p.items[index],p.items[index+1]];drawOutline();});down.disabled=index===p.items.length-1;actions.append(up,down,btn('Edit activity',()=>beginEdit(item)),btn('Remove activity',()=>{if(editing===item)resetEdit();p.items.splice(index,1);drawOutline();}));li.append(actions);list.append(li);});
 outline.append(node('h3',selected()[0]+' · '+selected()[1]),node('p','DEMONSTRATION — '+p.items.reduce((s,i)=>s+i[2],0)+' minutes total'),list);
 const warning=node('div');warning.className='demo-conflicts';warning.setAttribute('aria-live','polite');
 const interval=(row,record)=>{if(!record?.items.length||row[2]==='archived')return null;const day=Date.parse(row[1]+'T00:00:00Z');const [hh,mm]=record.start.split(':').map(Number);const from=day/60000+hh*60+mm;return [from,from+record.items.reduce((s,i)=>s+i[2],0)];};
 const current=interval(selected(),p);
 const clashes=current?rows.filter(row=>{if(row===selected())return false;const other=interval(row,plans.get(row));return other&&current[0]<other[1]&&other[0]<current[1];}):[];
 if(clashes.length){warning.append(node('strong','Schedule overlap detected'),node('p','Overlaps with: '+clashes.map(row=>row[0]).join(', ')+'. Verify venue and participant availability.'));}
 else warning.append(node('p','No overlap detected among sample programmes with outlines.'));
 outline.append(warning);
 }
 function refresh(){const previous=selected();select.replaceChildren();rows.forEach((r,i)=>{const option=node('option',r[0]+' · '+r[1]);option.value=String(i);select.append(option);});if(previous&&rows.includes(previous))select.value=String(rows.indexOf(previous));drawCalendar();drawOutline();}
 month.addEventListener('change',drawCalendar);select.addEventListener('change',()=>{resetEdit();drawOutline();});start.addEventListener('change',()=>{const p=plan();if(p&&start.value){p.start=start.value;drawOutline();}});
 form.addEventListener('submit',e=>{e.preventDefault();const p=plan(),n=Number(duration.value);if(!p||!activity.value.trim()||!participant.value.trim()||!Number.isInteger(n)||n<1||n>240)return;if(p.items.reduce((s,i)=>s+i[2],0)-(editing&&p.items.includes(editing)?editing[2]:0)+n>1440){status.textContent='Maximum outline duration is 24 hours.';return;}const values=[activity.value.trim(),participant.value.trim(),n];if(editing&&p.items.includes(editing)){editing.splice(0,3,...values);status.textContent='Sample activity updated.';}else{p.items.push(values);status.textContent='Sample activity added.';}resetEdit();drawOutline();});
 controls.append(btn('Load sample Sunday template',()=>{const p=plan();if(p&&(!p.items.length||confirm('Replace this sample outline?'))){resetEdit();p.items=template();drawOutline();}}),btn('Print sample outline',()=>{if(!plan())return;document.body.classList.add('printing-service-outline');try{window.print();}finally{document.body.classList.remove('printing-service-outline');}}));
 calendar.append(node('h3','Monthly calendar'),month,calendarGrid);planner.append(node('h3','Order of service'),label,startLabel,controls,status,form,outline);section.append(calendar,planner);refresh();return {section,refresh};
 };
})();
