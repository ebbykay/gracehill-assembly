import {jwtVerify,createRemoteJWKSet} from 'jose';
import {authorisationUrl} from './login-authorisation.mjs';
import {loginCookie,clearLoginCookie} from './login-attempt-store.mjs';
import {sessionCookie} from './session-security.mjs';
export function createCodeExchange(config,fetcher=fetch){
 const endpoint=new URL(config.tokenEndpoint);
 if(endpoint.protocol!=='https:'||endpoint.username||endpoint.password||endpoint.hash||endpoint.search)throw Error('Invalid token endpoint');
 return async(code,verifier)=>{
 const response=await fetcher(endpoint,{method:'POST',redirect:'error',signal:AbortSignal.timeout(5000),headers:{'Content-Type':'application/x-www-form-urlencoded','Accept':'application/json'},body:new URLSearchParams({grant_type:'authorization_code',client_id:config.clientId,redirect_uri:config.redirectUri,code,code_verifier:verifier})});
 if(!response.ok)throw Error('Code exchange failed');
 const body=await response.json();
 if(typeof body.id_token!=='string'||body.id_token.length>16384)throw Error('Missing identity token');
 return body.id_token;
 };
}
export function createIdVerifier(config,keys=createRemoteJWKSet(new URL(config.jwks),{timeoutDuration:3000})){
 return async(token,nonce)=>{
 const {payload}=await jwtVerify(token,keys,{issuer:config.issuer,audience:config.clientId,algorithms:['RS256'],requiredClaims:['iss','sub','aud','exp','iat','nonce'],maxTokenAge:'5m',clockTolerance:5});
 if(typeof payload.sub!=='string'||!payload.sub.trim()||payload.nonce!==nonce||payload.iat>Math.floor(Date.now()/1000)+5||(Array.isArray(payload.aud)&&payload.aud.length>1&&payload.azp!==config.clientId)||(payload.azp!==undefined&&payload.azp!==config.clientId))throw Error('Invalid identity claims');
 return {issuer:payload.iss,subject:payload.sub};
 };
}
export function createLoginService({config,attempts,identities,sessions,exchange,verifyId}){
 return Object.freeze({
 async begin(){
 const attempt=await attempts.begin();
 return {location:authorisationUrl(config,attempt),cookie:loginCookie(attempt.browser)};
 },
 async complete({state,browser,code,previousSession}){
 if(typeof code!=='string'||!code||code.length>4096)return null;
 const attempt=await attempts.consume(state,browser);
 if(!attempt)return null;
 const token=await exchange(code,attempt.verifier);
 const claims=await verifyId(token,attempt.nonce);
 const identity=await identities.resolve(claims.issuer,claims.subject);
 if(!identity)return null;
 if(previousSession)await sessions.revoke(previousSession);
 const session=await sessions.create(identity.subject);
 if(!session)return null;
 return {cookies:[clearLoginCookie(),sessionCookie(session)]};
 }
 });
}
