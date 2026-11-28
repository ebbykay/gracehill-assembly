import {can} from './access.mjs';
const uid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const text=(v,n)=>typeof v==='string'&&v.trim().length>0&&v.trim().length<=n;
const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v&&v.slice(0,4)!=='0000';
const month=v=>date(v)&&v.endsWith('-01');
const amount=(v,min=1)=>Number.isSafeInteger(v)&&v>=min&&v<=100000000000;
const revision=v=>Number.isSafeInteger(v)&&v>0&&v<2147483647;
const https=v=>{if(!text(v,2048))return false;try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}};
const timestamp=v=>v===null||typeof v==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(v)&&Number.isFinite(Date.parse(v));
const models={
 ministries:{read:['ministry:read'],write:'ministry:write',validate:d=>text(d.name,120)},
 'ministry-assignments':{read:['ministry:read'],write:'ministry:write',validate:d=>uid(d.ministryId)&&uid(d.memberId)&&text(d.responsibility,120)},
 'finance-entries':{read:['finance:read'],write:'finance:write',validate:d=>text(d.label,200)&&['income','expense'].includes(d.direction)&&amount(d.amountMinor)&&date(d.entryDate),transitions:{'draft:submitted':'finance:write','submitted:approved':'finance:approve','submitted:rejected':'finance:approve'}},
 'finance-budgets':{read:['finance:read'],write:'finance:write',validate:d=>month(d.month)&&amount(d.ceilingMinor,0)},
 'media-resources':{read:['media:draft','media:publish'],write:'media:draft',validate:d=>text(d.title,200)&&typeof d.description==='string'&&d.description.length<=4000&&['video','audio','photo','podcast'].includes(d.format)&&https(d.resourceUrl),transitions:{'draft:review':'media:draft','review:draft':'media:publish','review:published':'media:publish','published:archived':'media:publish'}},
 'care-followups':{read:['pastoral:read'],write:'pastoral:write',validate:d=>text(d.caseRef,100)&&date(d.dueDate),transitions:{'open:scheduled':'pastoral:write','scheduled:closed':'pastoral:write','open:closed':'pastoral:write'}},
 announcements:{read:['communications:read'],write:'communications:write',validate:d=>text(d.title,200)&&text(d.body,4000)&&['all','members','volunteers'].includes(d.audience)&&timestamp(d.scheduledAt),transitions:{'draft:review':'communications:write','review:draft':'communications:approve','review:approved':'communications:approve','approved:archived':'communications:approve'}}
};
async function readBody(req){if(req.headers['content-type']?.split(';')[0].trim()!=='application/json')return null;let n=0;const chunks=[];for await(const c of req){n+=c.length;if(n>16384)throw Error('size');chunks.push(c);}try{const d=JSON.parse(Buffer.concat(chunks));return d&&typeof d==='object'&&!Array.isArray(d)?d:null;}catch{return null;}}
export function createOperationsHttp({store,origin,resolvePrincipal}){
 return async(req,res,url,send)=>{
 const m=/^\/api\/admin\/([^/]+)(?:\/([^/]+)(?:\/(transition))?)?$/.exec(url.pathname);if(!m)return false;
 const [,kind,id,transition]=m,summary=kind==='finance-summary';if(!summary&&!Object.hasOwn(models,kind))return false;
 const model=summary?{read:['finance:read']}:models[kind];
 const allowed=summary&&!id?'GET':summary?null:transition&&model.transitions?'POST':!transition&&id&&kind==='finance-budgets'?'PATCH':!id?'GET, POST':null;
 if(!allowed||!allowed.split(', ').includes(req.method)){res.setHeader('Allow',allowed||'GET');send(405,{error:'method_not_allowed'});return true;}
 if(req.method!=='GET'&&req.headers.origin!==origin){send(403,{error:'origin_rejected'});return true;}
 const principal=await resolvePrincipal(req);if(!principal){send(401,{error:'unauthenticated'});return true;}
 if(req.method==='GET'){if(!model.read.some(p=>can(principal,p))){send(403,{error:'forbidden'});return true;}
 if(summary){const period=url.searchParams.get('month');if(!month(period)){send(400,{error:'invalid_month'});return true;}send(200,{summary:await store.financeSummary(period)});}
 else send(200,{records:await store.list(kind)});return true;}
 let d;try{d=await readBody(req);}catch{send(413,{error:'body_too_large'});return true;}
 if(!d){send(400,{error:'invalid_body'});return true;}
 const actor=principal.subject,rid=res.getHeader('X-Request-Id');let result;
 if(transition){const key=typeof d.from==='string'&&typeof d.to==='string'?d.from+':'+d.to:'';if(!uid(id)||!revision(d.revision)||!Object.hasOwn(model.transitions,key)){send(400,{error:'invalid_transition'});return true;}
 const permission=model.transitions[key];if(!can(principal,permission)){send(403,{error:'forbidden'});return true;}result=await store.transition(kind,id,d,actor,rid,permission);
 }else{if(!can(principal,model.write)){send(403,{error:'forbidden'});return true;}
 if(id){if(!month(id)||!revision(d.revision)||!amount(d.ceilingMinor,0)){send(400,{error:'invalid_budget'});return true;}result=await store.budget(id,d,actor,rid);}
 else{if(!model.validate(d)){send(400,{error:'invalid_record'});return true;}result=await store.create(kind,d,actor,rid);}}
 send(result?(!id?201:200):409,result?{record:result}:{error:'revision_reference_or_policy_conflict'});return true;
 };
}
