import {can} from './access.mjs';
export const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderProgrammeWorkspace(principal,rows){
 const editor=can(principal,'programme:draft'),publisher=can(principal,'programme:publish');
 const form=(row={})=>'<form data-operation="'+(row.id?'edit':'create')+'" data-id="'+escapeHtml(row.id)+'" data-revision="'+escapeHtml(row.revision)+'"><label>Title <input name="title" required maxlength="200" value="'+escapeHtml(row.title)+'"></label><label>Description <textarea name="description" maxlength="4000">'+escapeHtml(row.description)+'</textarea></label><label>Starts (UTC) <input name="startsAt" type="datetime-local" required value="'+(row.starts_at?escapeHtml(new Date(row.starts_at).toISOString().slice(0,16)):'')+'"></label><label>Ends (UTC) <input name="endsAt" type="datetime-local" required value="'+(row.ends_at?escapeHtml(new Date(row.ends_at).toISOString().slice(0,16)):'')+'"></label><button>Save draft</button></form>';
 const transition=(row,to,label)=>'<button type="button" data-id="'+escapeHtml(row.id)+'" data-revision="'+escapeHtml(row.revision)+'" data-from="'+escapeHtml(row.status)+'" data-to="'+to+'">'+label+'</button>';
 const cards=rows.map(row=>'<article><h2>'+escapeHtml(row.title)+'</h2><p>'+escapeHtml(row.description)+'</p><p>'+escapeHtml(new Date(row.starts_at).toISOString())+' — '+escapeHtml(new Date(row.ends_at).toISOString())+'</p><p>Status: '+escapeHtml(row.status)+'</p>'+(editor&&row.status==='draft'?form(row)+transition(row,'review','Submit for review'):'')+(publisher&&row.status==='review'?transition(row,'draft','Return to draft')+transition(row,'published','Publish'):'')+(publisher&&row.status==='published'?transition(row,'archived','Archive'):'')+'</article>').join('');
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Programme management | Gracehill</title><link rel="stylesheet" href="/admin/programmes.css"><script defer src="/admin/programmes.js"></script></head><body><header><a href="/admin/">Gracehill Administration</a><form method="post" action="/auth/logout"><button>Sign out</button></form></header><main><h1>Programme management</h1><p>All schedule inputs use UTC (Accra time). Published records are not yet synchronised to the public site.</p><p id="notice" role="status" aria-live="polite"></p>'+(editor?'<section><h2>Create programme</h2>'+form()+'</section>':'')+'<section><h2>Programmes ('+rows.length+')</h2><label>Search <input id="search" type="search"></label><div id="records">'+(cards||'<p>No programmes available.</p>')+'</div></section></main></body></html>';
}
export function createProgrammeWorkspace({store,resolvePrincipal,assets}){
 return async(req,res,url,send)=>{
 if(!['/admin/programmes','/admin/programmes.js','/admin/programmes.css'].includes(url.pathname))return false;
 if(req.method!=='GET'){res.setHeader('Allow','GET');send(405,{error:'method_not_allowed'});return true;}
 const p=await resolvePrincipal(req);
 if(!p){res.setHeader('Location','/admin/login');send(303,{});return true;}
 if(!can(p,'programme:draft')&&!can(p,'programme:publish')){send(403,{error:'forbidden'});return true;}
 res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
 res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');
 const asset=assets[url.pathname];
 res.setHeader('Content-Type',asset?asset.type:'text/html; charset=utf-8');
 res.end(asset?asset.body:renderProgrammeWorkspace(p,await store.list()));return true;
 };
}
