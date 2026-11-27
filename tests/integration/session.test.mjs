import test from 'node:test';
import assert from 'node:assert/strict';
import {createLoginAttempt,validLoginState,createSessionSecret,sessionCookie,clearSessionCookie,digest} from '../../apps/api/src/session-security.mjs';
import {createSessionStore} from '../../apps/api/src/session-store.mjs';
test('PKCE and state use fresh randomness and expiration',()=>{
 const a=createLoginAttempt(1000),b=createLoginAttempt(1000);
 assert.notEqual(a.state,b.state);assert.notEqual(a.nonce,b.nonce);
 assert.equal(a.challenge,Buffer.from(digest(a.verifier),'hex').toString('base64url'));
 assert.equal(validLoginState(a,a.state,1001),true);
 assert.equal(validLoginState(a,b.state,1001),false);
 assert.equal(validLoginState(a,a.state,301000),false);
});
test('session cookie flags and opaque hashed secret',()=>{
 const {token,hash}=createSessionSecret();assert.equal(hash,digest(token));assert.notEqual(token,hash);
 for(const flag of ['Secure','HttpOnly','SameSite=Lax','Path=/','Max-Age=900'])assert.ok(sessionCookie(token).includes(flag));
 assert.match(clearSessionCookie(),/Max-Age=0/);assert.throws(()=>sessionCookie('bad;token'));
});
test('session persistence never sends plaintext token to database',async()=>{
 const calls=[];const store=createSessionStore({query:async(sql,args)=>{calls.push({sql,args});return {rowCount:1,rows:[{identity_id:'fixture'}]};}});
 const token=await store.create('fixture');assert.equal(calls[0].args[0],digest(token));
 assert.equal(await store.resolve(token),'fixture');assert.equal(calls[1].args[0],digest(token));
 await store.revoke(token);assert.equal(calls[2].args[0],digest(token));assert.equal(await store.resolve('invalid'),null);
});
