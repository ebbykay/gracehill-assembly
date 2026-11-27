(() => {
const list=document.getElementById('media-library'),status=document.getElementById('media-status'),search=document.getElementById('media-search');
if(!list||!status||!search)return;
const buttons=[...document.querySelectorAll('[data-format]')];
let records=[],format='all',failed=false,loaded=false;
const valid=e=>{try{return e&&e.published===true&&['video','audio','photo','podcast'].includes(e.format)&&typeof e.title==='string'&&typeof e.description==='string'&&typeof e.url==='string'&&new URL(e.url).protocol==='https:';}catch{return false;}};
function render(){
 const query=search.value.trim().toLowerCase();
 const visible=records.filter(e=>(format==='all'||e.format===format)&&(e.title+' '+e.description).toLowerCase().includes(query));
 list.replaceChildren();
 status.textContent=failed?'Resources could not be loaded. Please contact the church.':!loaded?'Loading resources…':visible.length?visible.length+' published resource(s).':'No published resources match your selection.';
 for(const e of visible){
  const card=document.createElement('article');card.className='resource-card';
  const title=document.createElement('h3');title.textContent=e.title;
  const details=document.createElement('p');details.textContent=e.description;
  const link=document.createElement('a');link.href=e.url;link.className='btn';link.textContent='Open '+e.format;link.target='_blank';link.rel='noopener noreferrer';
  card.append(title,details,link);list.append(card);
 }
}
buttons.forEach(b=>b.addEventListener('click',()=>{format=b.dataset.format;buttons.forEach(x=>{x.setAttribute('aria-pressed',String(x===b));x.classList.toggle('active',x===b)});render()}));
search.addEventListener('input',render);
render();
fetch('data/media-resources.json').then(r=>{if(!r.ok)throw Error('load');return r.json()}).then(data=>{if(!Array.isArray(data))throw Error('format');records=data.filter(valid);loaded=true;render()}).catch(()=>{failed=true;render()});
})();
