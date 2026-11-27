import {randomBytes,createHash,timingSafeEqual} from 'node:crypto';
const random=()=>randomBytes(32).toString('base64url');
export const digest=value=>createHash('sha256').update(value).digest('hex');
export function createLoginAttempt(now=Date.now()){
 const verifier=random();
 return {state:random(),nonce:random(),verifier,challenge:createHash('sha256').update(verifier).digest('base64url'),expiresAt:now+300000};
}
export function validLoginState(attempt,state,now=Date.now()){
 if(!attempt||!Number.isFinite(attempt.expiresAt)||now>=attempt.expiresAt||typeof state!=='string'||typeof attempt.state!=='string'||state.length!==attempt.state.length)return false;
 const a=Buffer.from(state),b=Buffer.from(attempt.state);
 return a.length===b.length&&timingSafeEqual(a,b);
}
export function createSessionSecret(){const token=random();return {token,hash:digest(token)};}
export function sessionCookie(token){
 if(typeof token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(token))throw new Error('Invalid session token');
 return '__Host-gracehill_session='+token+'; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=900';
}
export function clearSessionCookie(){return '__Host-gracehill_session=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0';}
