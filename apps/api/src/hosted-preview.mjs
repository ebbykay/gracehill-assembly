import {serveLeadersLogin} from './leaders-login.mjs';
import {createServer} from 'node:http';
import {randomUUID} from 'node:crypto';
export function createHostedPreview({dbHealth=async()=> 'not_configured'}={}){
 return createServer(async(req,res)=>{
 res.setHeader('Content-Type','application/json; charset=utf-8');
 res.setHeader('Cache-Control','no-store');
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('X-Request-Id',randomUUID());
 const send=(status,body)=>{res.statusCode=status;res.end(JSON.stringify(body));};
 const path=new URL(req.url,'http://localhost').pathname;
 if(serveLeadersLogin(req,res,path))return;
 if(path==='/'||path==='/health/live'||path==='/health/ready'){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return send(405,{error:'method_not_allowed'});}
 if(path==='/health/ready'){let database='unavailable';try{database=await dbHealth();}catch{}return send(503,{status:'not_ready',reason:'hosted_preview_only',database});}
 return send(200,{service:'gracehill-hosted-preview',status:'ok',operational:false});
 }
 return send(404,{error:'not_found'});
 });
}
