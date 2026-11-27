import {createServer} from 'node:http';
import {randomUUID} from 'node:crypto';
import {authenticate,can} from './access.mjs';
export function createApp({logger=()=>{},verifyToken}={}){
 return createServer(async (req,res)=>{
 const id=randomUUID();
 const started=Date.now();
 res.setHeader('Content-Type','application/json; charset=utf-8');
 res.setHeader('Cache-Control','no-store');
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('X-Request-Id',id);
 res.on('finish',()=>logger({requestId:id,method:req.method,status:res.statusCode,durationMs:Date.now()-started}));
 const send=(status,body)=>{res.statusCode=status;res.end(JSON.stringify(body));};
 try{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/health/live'){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return send(405,{error:'method_not_allowed',requestId:id});}
 return send(200,{status:'ok',service:'gracehill-api'});
 }
 if(pathname==='/health/ready'){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return send(405,{error:'method_not_allowed',requestId:id});}
 return send(503,{status:'not_ready',reason:'operational_dependencies_not_configured'});
 }
 if(pathname==='/internal/access/programme-publish'){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return send(405,{error:'method_not_allowed',requestId:id});}
 const principal=await authenticate(req,verifyToken);
 if(!principal){res.setHeader('WWW-Authenticate','Bearer');return send(401,{error:'unauthenticated',requestId:id});}
 if(!can(principal,'programme:publish'))return send(403,{error:'forbidden',requestId:id});
 return send(200,{allowed:true});
 }
 return send(404,{error:'not_found',requestId:id});
 }catch{return send(500,{error:'internal_error',requestId:id});}
 });
}
