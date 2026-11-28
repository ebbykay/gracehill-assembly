import {can} from './access.mjs';
import {escapeHtml as esc} from './programme-workspace.mjs';
const resources=[
 ['households','Households','membership:read','membership:write'],
 ['members','Membership','membership:read','membership:write'],
 ['attendance-services','Attendance','attendance:read','attendance:write'],
 ['ministries','Ministries','ministry:read','ministry:write'],
 ['ministry-assignments','Ministry assignments','ministry:read','ministry:write'],
 ['finance-entries','Financial register','finance:read','finance:write'],
 ['finance-budgets','Monthly budgets','finance:read','finance:write'],
 ['media-resources','Media resources','media:draft','media:draft'],
 ['care-followups','Pastoral follow-ups','pastoral:read','pastoral:write'],
 ['announcements','Communications','communications:read','communications:write']
];
export function renderOperationsWorkspace(p){
 const visible=resources.filter(([key,,read])=>can(p,read)||(key==='media-resources'&&can(p,'media:publish')));
 const permissions=['finance:approve','media:publish','communications:approve'].filter(x=>can(p,x));
 const nav=visible.map(([key,label,,write])=>'<button type="button" data-resource="'+key+'" data-write="'+can(p,write)+'">'+esc(label)+'</button>').join('');
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Operations | Gracehill</title><link rel="stylesheet" href="/admin/operations.css"><script defer src="/admin/operations.js"></script></head><body><header><a href="/admin/">Gracehill Assembly</a><span>Authenticated operations</span><form method="post" action="/auth/logout"><button>Sign out</button></form></header><main data-permissions="'+esc(permissions.join(' '))+'"><aside><h2>Workspaces</h2>'+nav+'</aside><section><h1 id="workspace-title">Operations workspace</h1><p>Development environment. Use authorised synthetic fixtures only.</p><p id="notice" role="status" aria-live="polite"></p><div id="workspace"></div></section></main></body></html>';
}
export function createOperationsWorkspace({resolvePrincipal,assets}){
 return async(req,res,url,send)=>{
 if(!['/admin/operations','/admin/operations.js','/admin/operations.css'].includes(url.pathname))return false;
 if(req.method!=='GET'){res.setHeader('Allow','GET');send(405,{error:'method_not_allowed'});return true;}
 const p=await resolvePrincipal(req);
 if(!p){res.setHeader('Location','/admin/login');send(303,{});return true;}
 if(!resources.some(([k,,read])=>can(p,read)||(k==='media-resources'&&can(p,'media:publish')))){send(403,{error:'forbidden'});return true;}
 res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
 res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');
 const asset=assets[url.pathname];res.setHeader('Content-Type',asset?asset.type:'text/html; charset=utf-8');res.end(asset?asset.body:renderOperationsWorkspace(p));return true;
 };
}
