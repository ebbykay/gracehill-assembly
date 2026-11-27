import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {readAdminConfig} from '../../apps/api/src/admin-runtime.mjs';
import {createAdminAuthHttp} from '../../apps/api/src/admin-auth-http.mjs';
import {createApp} from '../../apps/api/src/app.mjs';
test('runtime is opt-in and validates complete HTTPS settings',()=>{
 assert.equal(readAdminConfig({},null),null);
 assert.throws(()=>readAdminConfig({ADMIN_ORIGIN:'https://admin.example'},null));
 const env={ADMIN_ORIGIN:'https://admin.example',OIDC_CLIENT_ID:'admin',OIDC_AUTHORISATION_ENDPOINT:'https://issuer.example/authorize',OIDC_TOKEN_ENDPOINT:'https://issuer.example/token'};
 assert.equal(readAdminConfig(env,{issuer:'https://issuer.example'}).redirectUri,'https://admin.example/auth/callback');
 assert.throws(()=>readAdminConfig({...env,ADMIN_ORIGIN:'http://admin.example'},{}));
});
test('workspace is protected and sign-in form is available',async t=>{
 const token='a'.repeat(43);
 const server=createApp({adminAuth:createAdminAuthHttp({origin:'https://admin.example',workspace:true,login:{},sessions:{resolve:async value=>value===token?'fixture':null}})});
 server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>new Promise(r=>server.close(r)));
 const base='http://127.0.0.1:'+server.address().port;
 const denied=await fetch(base+'/admin/',{redirect:'manual'});assert.equal(denied.status,303);assert.equal(denied.headers.get('location'),'/admin/login');
 const login=await fetch(base+'/admin/login');assert.match(await login.text(),/action="\/auth\/login"/);
 const page=await fetch(base+'/admin/',{headers:{Cookie:'__Host-gracehill_session='+token}});assert.equal(page.status,200);assert.match(await page.text(),/Programme management/);assert.match(page.headers.get('content-security-policy'),/frame-ancestors 'none'/);
});
