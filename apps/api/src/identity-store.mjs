// Adapter accepts a trusted PostgreSQL-compatible query executor; no driver configured yet.
export function createIdentityStore(db){
 if(typeof db?.query!=='function')throw new TypeError('Database query adapter required');
 return Object.freeze({
 async resolve(issuer,subject){
  if(typeof issuer!=='string'||!issuer||typeof subject!=='string'||!subject)return null;
  const {rows}=await db.query(`SELECT i.id, COALESCE(array_agg(r.role) FILTER (WHERE r.role IS NOT NULL), ARRAY[]::text[]) AS roles
    FROM gracehill.identities i LEFT JOIN gracehill.identity_roles r ON r.identity_id=i.id
    WHERE i.issuer=$1 AND i.subject=$2 AND i.enabled=true GROUP BY i.id`,[issuer,subject]);
  if(rows.length!==1)return null;
  return {subject:rows[0].id,roles:rows[0].roles};
 },
 async recordAudit({actorId=null,requestId,action,outcome}){
  await db.query('INSERT INTO gracehill.audit_events(actor_id,request_id,action,outcome) VALUES ($1,$2,$3,$4)',[actorId,requestId,action,outcome]);
 }
 });
}
