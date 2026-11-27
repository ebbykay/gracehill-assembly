import {createRemoteJWKSet,jwtVerify} from 'jose';
export function readIdentityConfig(env=process.env){
 const issuer=env.OIDC_ISSUER, audience=env.OIDC_AUDIENCE, jwks=env.OIDC_JWKS_URL;
 if(!issuer&&!audience&&!jwks)return null;
 if(!issuer||!audience||!jwks)throw new Error('Incomplete identity configuration');
 for(const value of [issuer,jwks]){
 const url=new URL(value);
 if(url.protocol!=='https:'||url.username||url.password||url.hash)throw new Error('Identity endpoints require HTTPS');
 }
 return {issuer,audience,jwks};
}
export function createTokenVerifier(config,keyResolver){
 if(!config)return undefined;
 const keys=keyResolver??createRemoteJWKSet(new URL(config.jwks),{timeoutDuration:3000,cooldownDuration:30000});
 return async token=>{
 const {payload}=await jwtVerify(token,keys,{issuer:config.issuer,audience:config.audience,algorithms:['RS256'],typ:'at+jwt',requiredClaims:['iss','aud','sub','exp','iat'],maxTokenAge:'15m',clockTolerance:5});
 if(typeof payload.sub!=='string'||!payload.sub.trim()||payload.iat>Math.floor(Date.now()/1000)+5)throw new Error('Invalid subject or issue time');
 return {issuer:payload.iss,subject:payload.sub};
 };
}
