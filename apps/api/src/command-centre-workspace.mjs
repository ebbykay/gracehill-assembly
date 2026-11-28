import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../../../'+path,import.meta.url),'utf8');
export function commandCentreAssets(){
 const assets={};
 for(const name of ['style','refinement','administration'])assets['/admin/css/'+name+'.css']={type:'text/css; charset=utf-8',body:read('packages/ui/css/'+name+'.css')};
 for(const name of ['service-planning-demo','membership-demo','operations-demo','administration'])assets['/admin/js/'+name+'.js']={type:'text/javascript; charset=utf-8',body:read('packages/shared/js/'+name+'.js')};
 assets['/admin/']={type:'text/html; charset=utf-8',body:read('apps/administration/admin.html').replace('Demo workspace','Signed-in preview').replace('id="adminMenuToggle"','id="adminMenuToggle"').replace('</header>','<form method="post" action="/auth/logout"><button type="submit">Sign out</button></form></header>').replace('Demonstration only. All sample records are fictional. Changes reset on reload; no data is sent to a server. Do not enter real church information.','Authenticated design preview. All records on these pages are fictional; changes are temporary. Do not enter real church information.')};
 return assets;
}
export function createCommandCentreWorkspace({resolvePrincipal,assets=commandCentreAssets()}){
 return async(req,res,url,send)=>{
 const path=url.pathname;
 if(!Object.hasOwn(assets,path))return false;
 if(req.method!=='GET'){res.setHeader('Allow','GET');send(405,{error:'method_not_allowed'});return true;}
 const principal=await resolvePrincipal(req);
 if(!principal){res.setHeader('Location','/admin/login');send(303,{});return true;}
 if(!principal.roles?.length){send(403,{error:'forbidden'});return true;}
 res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');
 res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
 const asset=assets[path];res.setHeader('Content-Type',asset.type);res.end(asset.body);return true;
 };
}
