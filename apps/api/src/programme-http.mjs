import {can} from './access.mjs';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const timestamp=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/;
export function validateProgramme(body){
 if(!body||typeof body.title!=='string'||typeof body.description!=='string')return null;
 const title=body.title.trim(),description=body.description.trim();
 if(!title||title.length>200||description.length>4000||![body.startsAt,body.endsAt].every(v=>typeof v==='string'&&timestamp.test(v)&&Number.isFinite(Date.parse(v)))||Date.parse(body.endsAt)<Date.parse(body.startsAt))return null;
 return {title,description,startsAt:body.startsAt,endsAt:body.endsAt};
}
async function json(req){
 if(req.headers['content-type']?.split(';')[0].trim()!=='application/json')return null;
 let size=0;const chunks=[];
 for await(const chunk of req){size+=chunk.length;if(size>16384)throw new Error('body too large');chunks.push(chunk);}
 try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{return null;}
}
export function createProgrammeHttp({store,resolvePrincipal,origin}){
 return async(req,res,url,send)=>{
 const match=/^\/api\/admin\/programmes(?:\/([^/]+)(?:\/(transition))?)?$/.exec(url.pathname);
 if(!match)return false;
 const [,id,transition]=match;
 const method=req.method;
 const expected=id?(transition?'POST':'PATCH'):null;
 if(expected?method!==expected:!['GET','POST'].includes(method)){res.setHeader('Allow',expected||'GET, POST');send(405,{error:'method_not_allowed'});return true;}
 if(method!=='GET'&&req.headers.origin!==origin){send(403,{error:'origin_rejected'});return true;}
 const principal=await resolvePrincipal(req);
 if(!principal){send(401,{error:'unauthenticated'});return true;}
 const editor=can(principal,'programme:draft'),publisher=can(principal,'programme:publish');
 if(!editor&&!publisher){send(403,{error:'forbidden'});return true;}
 if(method==='GET'){send(200,{programmes:await store.list()});return true;}
 if(id&&!uuid.test(id)){send(400,{error:'invalid_id'});return true;}
 let body;try{body=await json(req);}catch{send(413,{error:'body_too_large'});return true;}
 if(!body||typeof body!=='object'||Array.isArray(body)){send(400,{error:'invalid_body'});return true;}
 const requestId=res.getHeader('X-Request-Id');
 if(id&&(!Number.isSafeInteger(body.revision)||body.revision<1)){send(400,{error:'invalid_revision'});return true;}
 let result;
 if(transition){
 const rules={'draft:review':'programme:draft','review:draft':'programme:publish','review:published':'programme:publish','published:archived':'programme:publish'};
 const action=rules[body.from+':'+body.to];
 if(!Object.hasOwn(rules,body.from+':'+body.to)){send(400,{error:'invalid_transition'});return true;}
 if(!can(principal,action)){send(403,{error:'forbidden'});return true;}
 result=await store.transition(id,body.revision,body.from,body.to,principal.subject,requestId,action);
 }else{
 if(!editor){send(403,{error:'forbidden'});return true;}
 const data=validateProgramme(body);
 if(!data){send(400,{error:'invalid_programme'});return true;}
 result=id?await store.edit(id,body.revision,data,principal.subject,requestId):await store.create(data,principal.subject,requestId);
 }
 send(result?(id?200:201):409,result?{programme:result}:{error:'revision_or_state_conflict'});return true;
 };
}
