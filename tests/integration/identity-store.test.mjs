import test from 'node:test';
import assert from 'node:assert/strict';
import {createIdentityStore} from '../../apps/api/src/identity-store.mjs';
test('identity lookup uses parameterised issuer and subject and returns only mapped roles',async()=>{
 const calls=[];
 const store=createIdentityStore({query:async(sql,args)=>{calls.push({sql,args});return {rows:[{id:'fixture-id',roles:['editor']}]};}});
 assert.deepEqual(await store.resolve('https://issuer.example',"subject' OR true"),{subject:'fixture-id',roles:['editor']});
 assert.deepEqual(calls[0].args,['https://issuer.example',"subject' OR true"]);
 assert.match(calls[0].sql,/enabled=true/);
 assert.equal(await store.resolve('', 'subject'),null);
});
test('missing identity denies and audit write uses parameters',async()=>{
 const calls=[];const store=createIdentityStore({query:async(sql,args)=>{calls.push({sql,args});return {rows:[]};}});
 assert.equal(await store.resolve('issuer','unknown'),null);
 await store.recordAudit({requestId:'fixture-request',action:'programme:publish',outcome:'denied'});
 assert.deepEqual(calls[1].args,[null,'fixture-request','programme:publish','denied']);
});
