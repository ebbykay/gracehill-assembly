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
