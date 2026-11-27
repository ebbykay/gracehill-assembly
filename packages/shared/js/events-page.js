(() => {
 const list=document.getElementById('programme-list');
 const status=document.getElementById('programme-status');
 const buttons=[...document.querySelectorAll('[data-filter]')];
 if(!list||!status)return;
 let records=[], selected='upcoming', failed=false;
 function render(){
  const now=Date.now();
  const visible=records.filter(e=>selected==='all'||(selected==='upcoming'?Date.parse(e.end)>=now:Date.parse(e.end)<now)).sort((a,b)=>Date.parse(a.start)-Date.parse(b.start));
  list.replaceChildren();
  status.textContent=failed?'Programme information could not be loaded. Please contact the church.':visible.length?visible.length+' confirmed programme(s).':'No confirmed '+(selected==='all'?'':selected+' ')+'programmes are currently listed.';
  for(const e of visible){
   const card=document.createElement('article');card.className='event-list-item';
   const title=document.createElement('h3');title.textContent=e.title;
   const time=document.createElement('p');time.textContent=new Intl.DateTimeFormat('en-GH',{dateStyle:'full',timeStyle:'short',timeZone:'Africa/Accra'}).format(new Date(e.start));
   const details=document.createElement('p');details.textContent=e.description;
   const link=document.createElement('a');link.href='contact.html';link.className='btn btn-small';link.textContent='Ask About This Programme';
   card.append(title,time,details,link);list.append(card);
  }
 }
 buttons.forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.filter;buttons.forEach(x=>{x.setAttribute('aria-pressed',String(x===b));x.classList.toggle('active',x===b)});render()}));
 fetch('data/programmes.json').then(r=>{if(!r.ok)throw Error('load');return r.json()}).then(data=>{if(!Array.isArray(data))throw Error('format');records=data.filter(e=>e&&e.published===true&&typeof e.title==='string'&&typeof e.description==='string'&&Number.isFinite(Date.parse(e.start))&&Number.isFinite(Date.parse(e.end))&&Date.parse(e.end)>=Date.parse(e.start));render()}).catch(()=>{failed=true;render()});
})();
