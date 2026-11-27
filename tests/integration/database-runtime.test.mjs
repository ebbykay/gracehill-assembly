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
