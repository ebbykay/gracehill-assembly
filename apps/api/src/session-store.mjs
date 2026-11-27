import {createSessionSecret,digest} from './session-security.mjs';
export function createSessionStore(db){
 return Object.freeze({
 async create(identityId){
 const {token,hash}=createSessionSecret();
 const result=await db.query(`INSERT INTO gracehill.admin_sessions(token_hash,identity_id,expires_at)
 SELECT $1,id,now()+interval '15 minutes' FROM gracehill.identities WHERE id=$2 AND enabled=true RETURNING identity_id`,[hash,identityId]);
 return result.rowCount===1?token:null;
 },
 async resolve(token){
 if(typeof token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(token))return null;
 const {rows}=await db.query(`SELECT s.identity_id FROM gracehill.admin_sessions s JOIN gracehill.identities i ON i.id=s.identity_id
 WHERE s.token_hash=$1 AND s.revoked_at IS NULL AND s.expires_at>now() AND i.enabled=true`,[digest(token)]);
 return rows.length===1?rows[0].identity_id:null;
 },
 async revoke(token){
 if(typeof token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(token))return;
 await db.query('UPDATE gracehill.admin_sessions SET revoked_at=now() WHERE token_hash=$1 AND revoked_at IS NULL',[digest(token)]);
 }
 });
}
