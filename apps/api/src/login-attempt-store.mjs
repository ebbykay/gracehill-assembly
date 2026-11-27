import {createLoginAttempt,createSessionSecret,digest} from './session-security.mjs';
const valid=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{43}$/.test(value);
export function createLoginAttemptStore(db){
 return Object.freeze({
 async begin(){
 const attempt=createLoginAttempt();
 const {token:browser}=createSessionSecret();
 await db.query(`INSERT INTO gracehill.login_attempts(state_hash,browser_hash,nonce,verifier,expires_at)
 VALUES ($1,$2,$3,$4,now()+interval '5 minutes')`,[digest(attempt.state),digest(browser),attempt.nonce,attempt.verifier]);
 return {state:attempt.state,nonce:attempt.nonce,challenge:attempt.challenge,browser};
 },
 async consume(state,browser){
 if(!valid(state)||!valid(browser))return null;
 const {rows}=await db.query(`DELETE FROM gracehill.login_attempts
 WHERE state_hash=$1 AND browser_hash=$2 AND expires_at>now()
 RETURNING nonce,verifier`,[digest(state),digest(browser)]);
 return rows.length===1?rows[0]:null;
 },
 async purgeExpired(){
 const {rowCount}=await db.query('DELETE FROM gracehill.login_attempts WHERE expires_at<=now()');
 return rowCount;
 }
 });
}
export function loginCookie(browser){
 if(!valid(browser))throw new Error('Invalid browser binding');
 return '__Host-gracehill_login='+browser+'; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=300';
}
export const clearLoginCookie=()=> '__Host-gracehill_login=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0';
