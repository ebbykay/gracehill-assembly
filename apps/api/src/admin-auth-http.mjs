import {clearSessionCookie} from './session-security.mjs';
import {clearLoginCookie} from './login-attempt-store.mjs';
const sessionName='__Host-gracehill_session',loginName='__Host-gracehill_login';
function cookie(req,name){
 const matches=(req.headers.cookie||'').split(';').map(v=>v.trim()).filter(v=>v.startsWith(name+'='));
 if(matches.length!==1)return null;
 const value=matches[0].slice(name.length+1);
 return /^[A-Za-z0-9_-]{43}$/.test(value)?value:null;
}
export function createAdminAuthHttp({login,sessions,origin,limit=20,now=Date.now}){
 const trusted=new URL(origin);
 if(trusted.protocol!=='https:'||trusted.origin!==origin)throw Error('Exact HTTPS origin required');
 let windowStart=now(),count=0;
 return async(req,res,url,send)=>{
 const path=url.pathname;
 if(!['/auth/login','/auth/callback','/auth/session','/auth/logout'].includes(path))return false;
 res.setHeader('Referrer-Policy','no-referrer');
 res.setHeader('X-Frame-Options','DENY');
 res.setHeader('Content-Security-Policy',"default-src 'none'; frame-ancestors 'none'");
 const method=path==='/auth/callback'||path==='/auth/session'?'GET':'POST';
 if(req.method!==method){res.setHeader('Allow',method);send(405,{error:'method_not_allowed'});return true;}
 if(method==='POST'&&req.headers.origin!==origin){send(403,{error:'origin_rejected'});return true;}
 if(path==='/auth/login'||path==='/auth/callback'){
 if(now()-windowStart>=60000){windowStart=now();count=0;}
 if(++count>limit){res.setHeader('Retry-After','60');send(429,{error:'rate_limited'});return true;}
 }
 if(path==='/auth/login'){
 const result=await login.begin();res.setHeader('Set-Cookie',result.cookie);res.setHeader('Location',result.location);send(303,{});return true;
 }
 if(path==='/auth/callback'){
 res.setHeader('Set-Cookie',clearLoginCookie());
 if(url.searchParams.has('error')||url.searchParams.getAll('state').length!==1||url.searchParams.getAll('code').length!==1){send(400,{error:'invalid_callback'});return true;}
 let result;
 try{result=await login.complete({state:url.searchParams.get('state'),code:url.searchParams.get('code'),browser:cookie(req,loginName),previousSession:cookie(req,sessionName)});}catch{send(401,{error:'authentication_failed'});return true;}
 if(!result){send(401,{error:'authentication_failed'});return true;}
 res.setHeader('Set-Cookie',result.cookies);res.setHeader('Location','/admin/');send(303,{});return true;
 }
 const token=cookie(req,sessionName);
 if(path==='/auth/logout'){
 if(token)await sessions.revoke(token);
 res.setHeader('Set-Cookie',clearSessionCookie());send(200,{signedOut:true});return true;
 }
 const identity=await sessions.resolve(token);
 send(identity?200:401,identity?{authenticated:true}:{error:'unauthenticated'});return true;
 };
}
