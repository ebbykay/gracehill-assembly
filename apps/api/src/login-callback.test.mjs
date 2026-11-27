import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPair,SignJWT} from 'jose';
import {createIdVerifier,createCodeExchange,createLoginService} from './login-callback.mjs';
const config={issuer:'https://issuer.example',clientId:'admin',tokenEndpoint:'https://issuer.example/token',redirectUri:'https://admin.example/auth/callback'};
test('ID token requires correct nonce and authorised party',async()=>{
 const {publicKey,privateKey}=await generateKeyPair('RS256');
 const verify=createIdVerifier(config,publicKey);
 const sign=(nonce,azp)=>new SignJWT({nonce,...(azp?{azp}:{})}).setProtectedHeader({alg:'RS256'}).setIssuer(config.issuer).setSubject('fixture').setAudience(config.clientId).setIssuedAt().setExpirationTime('2m').sign(privateKey);
 assert.deepEqual(await verify(await sign('expected'),'expected'),{issuer:config.issuer,subject:'fixture'});
 await assert.rejects(async()=>verify(await sign('wrong'),'expected'));
 await assert.rejects(async()=>verify(await sign('expected','other'),'expected'));
});
test('code exchange posts verifier and disallows redirects',async()=>{
 const exchange=createCodeExchange(config,async(url,options)=>{
 assert.equal(url.href,config.tokenEndpoint);assert.equal(options.redirect,'error');assert.equal(options.body.get('code_verifier'),'fixture-verifier');
 return {ok:true,json:async()=>({id_token:'fixture-token'})};
 });
 assert.equal(await exchange('code','fixture-verifier'),'fixture-token');
});
test('callback consumes attempt before exchange and activates mapped session once',async()=>{
 let consumed=false,created=0;
 const service=createLoginService({config,attempts:{consume:async()=>{if(consumed)return null;consumed=true;return {nonce:'nonce',verifier:'verifier'};}},exchange:async()=>{assert.ok(consumed);return 'token';},verifyId:async()=>({issuer:config.issuer,subject:'fixture'}),identities:{resolve:async()=>({subject:'mapped-id'})},sessions:{create:async id=>{assert.equal(id,'mapped-id');created++;return 'a'.repeat(43);}}});
 const input={code:'code',state:'state',browser:'browser'};
 const result=await service.complete(input);assert.equal(result.cookies.length,2);assert.match(result.cookies[1],/HttpOnly/);
 assert.equal(await service.complete(input),null);assert.equal(created,1);
});
