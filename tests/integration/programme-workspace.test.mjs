import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createApp} from '../../apps/api/src/app.mjs';
import {createProgrammeWorkspace,renderProgrammeWorkspace} from '../../apps/api/src/programme-workspace.mjs';
const row={id:'fixture',title:'<script>alert(1)</script>',description:'<img src=x>',starts_at:'2099-01-01T09:00:00Z',ends_at:'2099-01-01T10:00:00Z',status:'draft',revision:1};
const principal=role=>({subject:'fixture',roles:[role]});
test('render escapes records and exposes role-appropriate controls',()=>{
 const editor=renderProgrammeWorkspace(principal('editor'),[row]);
 assert.match(editor,/Create programme/);assert.match(editor,/Submit for review/);assert.doesNotMatch(editor,/<script>alert/);assert.match(editor,/&lt;script&gt;/);
 const publisher=renderProgrammeWorkspace(principal('publisher'),[{...row,status:'review'}]);
 assert.match(publisher,/Return to draft/);assert.match(publisher,/>Publish</);assert.doesNotMatch(publisher,/Create programme/);
});
test('programme workspace and assets require current editorial permission',async t=>{
 const handler=createProgrammeWorkspace({store:{list:async()=>[row]},resolvePrincipal:async req=>req.headers['x-fixture-role']?principal(req.headers['x-fixture-role']):null,assets:{'/admin/programmes.js':{type:'text/javascript',body:'fixture'}}});
 const server=createApp({adminAuth:handler});server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>new Promise(r=>server.close(r)));
 const base='http://127.0.0.1:'+server.address().port;
 assert.equal((await fetch(base+'/admin/programmes',{redirect:'manual'})).status,303);
 assert.equal((await fetch(base+'/admin/programmes',{headers:{'x-fixture-role':'finance'}})).status,403);
 const response=await fetch(base+'/admin/programmes',{headers:{'x-fixture-role':'editor'}});assert.equal(response.status,200);assert.match(response.headers.get('content-security-policy'),/script-src 'self'/);
 assert.equal((await fetch(base+'/admin/programmes.js',{redirect:'manual'})).status,303);
});
