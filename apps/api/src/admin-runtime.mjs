import {createProgrammeStore} from './programme-store.mjs';
import {createProgrammeHttp} from './programme-http.mjs';
import {cookie,createAdminAuthHttp} from './admin-auth-http.mjs';
import {createLoginAttemptStore} from './login-attempt-store.mjs';
import {createSessionStore} from './session-store.mjs';
import {createLoginService,createCodeExchange,createIdVerifier} from './login-callback.mjs';
export function readAdminConfig(env,identity){
 const keys=['ADMIN_ORIGIN','OIDC_CLIENT_ID','OIDC_AUTHORISATION_ENDPOINT','OIDC_TOKEN_ENDPOINT'];
 if(!keys.some(k=>env[k]))return null;
 if(!identity||keys.some(k=>!env[k]))throw Error('Incomplete administrative configuration');
 const origin=env.ADMIN_ORIGIN;
 const parsed=new URL(origin);
 if(parsed.protocol!=='https:'||parsed.origin!==origin)throw Error('Exact HTTPS admin origin required');
 for(const k of keys.slice(2)){
 const url=new URL(env[k]);
 if(url.protocol!=='https:'||url.username||url.password||url.hash||url.search)throw Error('Invalid provider endpoint');
 }
 return {...identity,origin,clientId:env.OIDC_CLIENT_ID,authorisationEndpoint:env.OIDC_AUTHORISATION_ENDPOINT,tokenEndpoint:env.OIDC_TOKEN_ENDPOINT,redirectUri:origin+'/auth/callback'};
}
export function createAdminRuntime(config,db,identities){
 if(!config)return undefined;
 if(!db||!identities)throw Error('Administrative runtime requires database');
 const sessions=createSessionStore(db);
 const attempts=createLoginAttemptStore(db);
 const login=createLoginService({config,attempts,identities,sessions,exchange:createCodeExchange(config),verifyId:createIdVerifier(config)});
 const auth=createAdminAuthHttp({login,sessions,origin:config.origin,workspace:true});
 const programmes=createProgrammeHttp({store:createProgrammeStore(db),origin:config.origin,resolvePrincipal:async req=>{
 const id=await sessions.resolve(cookie(req,'__Host-gracehill_session'));
 if(!id)return null;
 const {rows}=await db.query("SELECT i.id, COALESCE(array_agg(r.role) FILTER (WHERE r.role IS NOT NULL), ARRAY[]::text[]) AS roles FROM gracehill.identities i LEFT JOIN gracehill.identity_roles r ON r.identity_id=i.id WHERE i.id=$1 AND i.enabled=true GROUP BY i.id",[id]);
 return rows.length===1?{subject:rows[0].id,roles:rows[0].roles}:null;
 }});
 return async(req,res,url,send)=>await auth(req,res,url,send)||await programmes(req,res,url,send);
}
