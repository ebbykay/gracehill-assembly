'use strict';
const notice=document.querySelector('#notice');
async function request(path,method,body,button){
 button.disabled=true;
 try{
 const response=await fetch('/api/admin/programmes'+path,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 if(response.status===401){location.assign('/admin/login');return;}
 if(response.status===409){notice.textContent='The record changed. Refresh before retrying.';return;}
 if(!response.ok){notice.textContent='Request rejected ('+response.status+'). Check your input and permissions.';return;}
 location.reload();
 }catch{notice.textContent='Network error. Please retry.';}finally{button.disabled=false;}
}
document.addEventListener('submit',event=>{
 const form=event.target;if(!form.dataset.operation)return;
 event.preventDefault();const values=Object.fromEntries(new FormData(form));
 for(const key of ['startsAt','endsAt'])values[key]=values[key]+':00Z';
 const edit=form.dataset.operation==='edit';
 if(edit)values.revision=Number(form.dataset.revision);
 request(edit?'/'+encodeURIComponent(form.dataset.id):'',edit?'PATCH':'POST',values,form.querySelector('button'));
});
document.addEventListener('click',event=>{
 const button=event.target.closest('button[data-to]');if(!button)return;
 if(!confirm('Change programme status to '+button.dataset.to+'?'))return;
 request('/'+encodeURIComponent(button.dataset.id)+'/transition','POST',{revision:Number(button.dataset.revision),from:button.dataset.from,to:button.dataset.to},button);
});
document.querySelector('#search').addEventListener('input',event=>{
 const query=event.target.value.toLowerCase();
 for(const article of document.querySelectorAll('#records article'))article.hidden=!article.textContent.toLowerCase().includes(query);
});
