import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createApp} from '../../apps/api/src/app.mjs';
import {readConfig} from '../../apps/api/src/config.mjs';
test('config rejects unsafe host and invalid port',()=>{assert.throws(()=>readConfig({API_HOST:'0.0.0.0'}));assert.throws(()=>readConfig({API_PORT:'bad'}));assert.equal(readConfig({}).host,'127.0.0.1');});
test('API liveness, readiness, method restrictions and default deny',async t=>{
 const server=createApp();server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>new Promise(resolve=>server.close(resolve)));
 const base='http://127.0.0.1:'+server.address().port;
 const live=await fetch(base+'/health/live');assert.equal(live.status,200);assert.equal((await live.json()).status,'ok');assert.ok(live.headers.get('x-request-id'));assert.equal(live.headers.get('cache-control'),'no-store');
 assert.equal((await fetch(base+'/health/ready')).status,503);
 assert.equal((await fetch(base+'/health/live',{method:'POST'})).status,405);
 assert.equal((await fetch(base+'/members')).status,404);
 assert.equal((await fetch(base+'/admin')).status,404);
});
