import test from 'node:test';
import assert from 'node:assert/strict';
import {openDatabase,databaseAvailable} from '../../apps/api/src/database.mjs';
import {createIdentityStore} from '../../apps/api/src/identity-store.mjs';
import {mappedVerifier} from '../../apps/api/src/identity-runtime.mjs';
test('runtime adapter ignores externally supplied roles',async()=>{
 const verify=mappedVerifier(async()=>({issuer:'issuer',subject:'subject',roles:['publisher']}),{resolve:async()=>({subject:'mapped',roles:['editor']})});
 assert.deepEqual(await verify('fixture'),{subject:'mapped',roles:['editor']});
 assert.equal(mappedVerifier(undefined,{}),undefined);
});
test('database health fails closed',async()=>{
 assert.equal(await databaseAvailable(null),false);
 assert.equal(await databaseAvailable({query:async()=>{throw Error('offline')}}),false);
 await assert.rejects(openDatabase('postgres://remote.example/db'));
});
test('real PostgreSQL runtime privileges and persistence',{skip:!process.env.DATABASE_URL},async t=>{
 const pool=await openDatabase(process.env.DATABASE_URL);
 t.after(()=>pool.end());
 assert.equal(await databaseAvailable(pool),true);
 const client=await pool.connect();
 try{
 await client.query('BEGIN');
 const {rows:[identity]}=await client.query("INSERT INTO gracehill.identities(issuer,subject,enabled) VALUES ('https://fixture.example','runtime-test',true) RETURNING id");
 await client.query("INSERT INTO gracehill.identity_roles(identity_id,role) VALUES ($1,'editor')",[identity.id]);
 await client.query('SET LOCAL ROLE gracehill_runtime');
 const store=createIdentityStore(client);
 assert.deepEqual(await store.resolve('https://fixture.example','runtime-test'),{subject:identity.id,roles:['editor']});
 await store.recordAudit({actorId:identity.id,requestId:identity.id,action:'programme:draft',outcome:'allowed'});
 await client.query('SAVEPOINT restricted');
 await assert.rejects(client.query('SELECT * FROM gracehill.audit_events'),{code:'42501'});
 await client.query('ROLLBACK TO SAVEPOINT restricted');
 await client.query('RESET ROLE');
 const result=await client.query('SELECT outcome FROM gracehill.audit_events WHERE request_id=$1',[identity.id]);
 assert.equal(result.rows[0].outcome,'allowed');
 }finally{await client.query('ROLLBACK');client.release();}
});

test('login attempt consumption is atomic and browser bound',{skip:!process.env.DATABASE_URL},async t=>{
 const {createLoginAttemptStore}=await import('../../apps/api/src/login-attempt-store.mjs');
 const pool=await openDatabase(process.env.DATABASE_URL);
 t.after(()=>pool.end());
 const client=await pool.connect();
 try{
 await client.query('BEGIN');
 await client.query('SET LOCAL ROLE gracehill_runtime');
 const store=createLoginAttemptStore(client);
 const a=await store.begin();
 const b=await store.begin();
 assert.equal(await store.consume(a.state,b.browser),null);
 const consumed=await store.consume(a.state,a.browser);
 assert.equal(consumed.nonce,a.nonce);
 assert.equal(await store.consume(a.state,a.browser),null);
 await client.query('ROLLBACK');
 }finally{await client.query('ROLLBACK');client.release();}
});

test('programme runtime role can write revisions but cannot delete',{skip:!process.env.DATABASE_URL},async t=>{
 const pool=await openDatabase(process.env.DATABASE_URL);t.after(()=>pool.end());
 const client=await pool.connect();
 try{
 await client.query('BEGIN');
 await client.query('SET LOCAL ROLE gracehill_runtime');
 const {rows:[row]}=await client.query("INSERT INTO gracehill.programmes(title,description,starts_at,ends_at) VALUES ('Synthetic programme','Fixture','2099-01-01T09:00:00Z','2099-01-01T10:00:00Z') RETURNING id,revision,status");
 assert.equal(row.revision,1);assert.equal(row.status,'draft');
 const updated=await client.query("UPDATE gracehill.programmes SET status='review',revision=revision+1 WHERE id=$1 AND revision=1 RETURNING revision",[row.id]);
 assert.equal(updated.rows[0].revision,2);
 await client.query('SAVEPOINT restricted_delete');
 await assert.rejects(client.query('DELETE FROM gracehill.programmes WHERE id=$1',[row.id]),{code:'42501'});
 await client.query('ROLLBACK TO SAVEPOINT restricted_delete');
 }finally{await client.query('ROLLBACK');client.release();}
});

test('membership and attendance preserve foreign keys, uniqueness and restricted runtime access',{skip:!process.env.DATABASE_URL},async t=>{
 const pool=await openDatabase(process.env.DATABASE_URL);t.after(()=>pool.end());const c=await pool.connect();
 try{
 await c.query('BEGIN');await c.query('SET LOCAL ROLE gracehill_runtime');
 const {rows:[household]}=await c.query("INSERT INTO gracehill.households(label) VALUES ('Synthetic household') RETURNING id");
 const {rows:[member]}=await c.query("INSERT INTO gracehill.members(display_name,household_id,joined_on,status) VALUES ('Synthetic member',$1,'2026-11-28','active') RETURNING id,revision",[household.id]);
 assert.equal(member.revision,1);
 const {rows:[service]}=await c.query("INSERT INTO gracehill.attendance_services(title,service_date) VALUES ('Synthetic service','2026-11-28') RETURNING id");
 await c.query('INSERT INTO gracehill.attendance_entries(service_id,member_id,present) VALUES ($1,$2,true)',[service.id,member.id]);
 for(const [sql,args,code] of [
 ['INSERT INTO gracehill.attendance_entries(service_id,member_id,present) VALUES ($1,$2,true)',[service.id,member.id],'23505'],
 ["INSERT INTO gracehill.members(display_name,household_id,joined_on) VALUES ('Invalid','00000000-0000-4000-8000-000000000001','2026-11-28')",[],'23503'],
 ['DELETE FROM gracehill.members WHERE id=$1',[member.id],'42501']
 ]){await c.query('SAVEPOINT rejected');await assert.rejects(c.query(sql,args),{code});await c.query('ROLLBACK TO SAVEPOINT rejected');}
 }finally{await c.query('ROLLBACK');c.release();}
});

test('financial approval rejects self review and preserves integer currency amounts',{skip:!process.env.DATABASE_URL},async t=>{
 const {createOperationsStore}=await import('../../apps/api/src/operations-store.mjs');
 const pool=await openDatabase(process.env.DATABASE_URL);t.after(()=>pool.end());
 const c=await pool.connect();let actors=[];
 try{
 for(const name of ['finance-fixture-a','finance-fixture-b']){const {rows:[row]}=await c.query("INSERT INTO gracehill.identities(issuer,subject,enabled) VALUES ('https://fixture.example',$1,true) RETURNING id",[name]);actors.push(row.id);}
 await c.query('SET ROLE gracehill_runtime');
 // Reuse the real restricted connection for the store transactions.
 const store=createOperationsStore({connect:async()=>({query:c.query.bind(c),release(){}}),query:c.query.bind(c)});
 const [a,b]=actors;
 const entry=await store.create('finance-entries',{label:'Fixture',direction:'income',amountMinor:12345,entryDate:'2099-01-01'},a,a);
 assert.equal(entry.amount_minor,'12345');
 const submitted=await store.transition('finance-entries',entry.id,{from:'draft',to:'submitted',revision:1},a,a,'finance:write');
 assert.equal(submitted.revision,2);
 assert.equal(await store.transition('finance-entries',entry.id,{from:'submitted',to:'approved',revision:2},a,a,'finance:approve'),null);
 const approved=await store.transition('finance-entries',entry.id,{from:'submitted',to:'approved',revision:2},b,b,'finance:approve');
 assert.equal(approved.status,'approved');
 assert.equal((await store.financeSummary('2099-01-01')).income_minor,'12345');
 assert.equal(await store.transition('finance-entries',entry.id,{from:'submitted',to:'rejected',revision:2},b,b,'finance:approve'),null);
 }finally{await c.query('RESET ROLE');if(actors.length){await c.query('DELETE FROM gracehill.audit_events WHERE actor_id=ANY($1::uuid[])',[actors]);await c.query('DELETE FROM gracehill.finance_entries WHERE created_by=ANY($1::uuid[])',[actors]);await c.query('DELETE FROM gracehill.identities WHERE id=ANY($1::uuid[])',[actors]);}c.release();}
});
