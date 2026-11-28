import {can} from './access.mjs';
const uuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const text=(v,max)=>typeof v==='string'&&v.trim().length>0&&v.trim().length<=max;
const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
const revision=v=>Number.isSafeInteger(v)&&v>=0&&v<2147483647;
async function body(req){if(req.headers['content-type']?.split(';')[0].trim()!=='application/json')return null;const parts=[];let n=0;for await(const chunk of req){n+=chunk.length;if(n>16384)throw Error('size');parts.push(chunk);}try{const v=JSON.parse(Buffer.concat(parts));return v&&typeof v==='object'&&!Array.isArray(v)?v:null;}catch{return null;}}
export function createMembershipHttp({store,origin,resolvePrincipal}){
 return async(req,res,url,send)=>{
 const match=/^\/api\/admin\/(households|members|attendance-services)(?:\/([^/]+)(?:\/register(?:\/([^/]+))?)?)?$/.exec(url.pathname);if(!match)return false;
 const [,kind,id,member]=match;const register=url.pathname.includes('/register');
 const allowed=register&&kind==='attendance-services'&&id?(member?'PUT':'GET'):!register&&id&&kind==='members'?'PATCH':!register&&!id?'GET, POST':null;
 if(!allowed||!allowed.split(', ').includes(req.method)){res.setHeader('Allow',allowed||'GET');send(405,{error:'method_not_allowed'});return true;}
 if(req.method!=='GET'&&req.headers.origin!==origin){send(403,{error:'origin_rejected'});return true;}
 const principal=await resolvePrincipal(req);if(!principal){send(401,{error:'unauthenticated'});return true;}
 const permission=(kind==='attendance-services'?'attendance':'membership')+':'+(req.method==='GET'?'read':'write');
 if(!can(principal,permission)){send(403,{error:'forbidden'});return true;}
 if(id&&!uuid(id)||member&&!uuid(member)){send(400,{error:'invalid_id'});return true;}
 if(req.method==='GET'){const rows=register?await store.register(id):await store[{households:'households',members:'members','attendance-services':'services'}[kind]]();send(200,{records:rows});return true;}
 let d;try{d=await body(req);}catch{send(413,{error:'body_too_large'});return true;}
 if(!d){send(400,{error:'invalid_body'});return true;}
 const actor=principal.subject,rid=res.getHeader('X-Request-Id');let result;
 if(register){if(typeof d.present!=='boolean'||!revision(d.revision)){send(400,{error:'invalid_entry'});return true;}result=await store.record(id,member,d,actor,rid);}
 else if(kind==='households'){if(!text(d.label,120)){send(400,{error:'invalid_household'});return true;}result=await store.createHousehold(d.label.trim(),actor,rid);}
 else if(kind==='members'){if(!text(d.displayName,160)||!(d.householdId===null||uuid(d.householdId))||!['new','active','inactive'].includes(d.status)||!date(d.joinedOn)||(id&&(!revision(d.revision)||d.revision===0))){send(400,{error:'invalid_member'});return true;}d.displayName=d.displayName.trim();result=id?await store.editMember(id,d,actor,rid):await store.createMember(d,actor,rid);}
 else {if(!text(d.title,200)||!date(d.serviceDate)){send(400,{error:'invalid_service'});return true;}d.title=d.title.trim();result=await store.createService(d,actor,rid);}
 send(result?(req.method==='POST'?201:200):409,result?{record:result}:{error:'revision_or_reference_conflict'});return true;
 };
}
