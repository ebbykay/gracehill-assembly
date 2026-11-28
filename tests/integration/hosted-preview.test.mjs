import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createHostedPreview} from '../../apps/api/src/hosted-preview.mjs';
test('hosted preview exposes only health information',async t=>{
 const server=createHostedPreview();server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>new Promise(r=>server.close(r)));
 const base='http://127.0.0.1:'+server.address().port;
 assert.equal((await fetch(base+'/health/live')).status,200);
 assert.equal((await fetch(base+'/health/ready')).status,503);
 for(const path of ['/admin/','/auth/login','/api/admin/programmes','/internal/access/programme-publish'])assert.equal((await fetch(base+path)).status,404);
 assert.equal((await fetch(base+'/health/live',{method:'POST'})).status,405);
});
