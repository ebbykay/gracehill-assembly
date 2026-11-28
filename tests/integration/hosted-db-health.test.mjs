import test from 'node:test';
import assert from 'node:assert/strict';
import {readHostedDatabaseConfig,checkHostedDatabase} from '../../apps/api/src/hosted-db-health.mjs';
test('staging connection accepts only internal host pattern and rejects URL overrides',()=>{
 assert.equal(readHostedDatabaseConfig({}),null);
 const url='postgresql://fixture:fixture@dpg-abc123-a/gracehill';
 assert.equal(readHostedDatabaseConfig({STAGING_DATABASE_URL:url}).max,1);
 for(const value of ['postgresql://u:p@external.example/db','postgresql://u:p@dpg-abc-a/db?sslmode=disable','postgresql://u@dpg-abc-a/db','https://u:p@dpg-abc-a/db'])assert.throws(()=>readHostedDatabaseConfig({STAGING_DATABASE_URL:value}));
});
test('connectivity probe exposes only a fixed status and runs no writes',async()=>{
 assert.equal(await checkHostedDatabase(null),'not_configured');
 assert.equal(await checkHostedDatabase({query:async sql=>assert.equal(sql,'SELECT 1')}),'available');
 assert.equal(await checkHostedDatabase({query:async()=>{throw Error('secret fixture')}}),'unavailable');
});
