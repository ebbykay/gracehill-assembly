import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {can,authenticate} from '../../apps/api/src/access.mjs';
import {createApp} from '../../apps/api/src/app.mjs';
test('roles are least privilege and unknown roles deny',()=>{
 assert.equal(can({subject:'fixture',roles:['editor']},'programme:draft'),true);
 for(const role of ['editor','administrator','constructor','__proto__'])assert.equal(can({subject:'fixture',roles:[role]},'pastoral:read'),false);
 assert.equal(can(null,'programme:publish'),false);
 assert.equal(can({subject:'fixture',roles:['publisher']},'programme:publish'),true);
});
test('authentication rejects unverified or malformed identity',async()=>{
 const req={headers:{authorization:'Bearer fixture'}};
 assert.equal(await authenticate(req),null);
 assert.equal(await authenticate(req,async()=>{throw Error('invalid')}),null);
 assert.equal(await authenticate(req,async()=>({subject:'',roles:['editor']})),null);
 assert.equal(await authenticate({headers:{authorization:'Basic fixture'}},async()=>({subject:'x',roles:['editor']})),null);
});
test('protected route denies by default and checks verified permissions',async t=>{
 const verifier=async token=>token==='publisher-fixture'?{subject:'fixture-publisher',roles:['publisher']}:token==='editor-fixture'?{subject:'fixture-editor',roles:['editor']}:null;
 const server=createApp({verifyToken:verifier});server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>new Promise(r=>server.close(r)));
 const url='http://127.0.0.1:'+server.address().port+'/internal/access/programme-publish';
 const request=(token,extra={})=>fetch(url,{headers:{...(token?{Authorization:'Bearer '+token}:{}),...extra}});
 assert.equal((await request(null,{'x-role':'publisher'})).status,401);
 assert.equal((await request('invalid')).status,401);
 assert.equal((await request('editor-fixture')).status,403);
 assert.equal((await request('publisher-fixture')).status,200);
});
