import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPair,SignJWT} from 'jose';
import {createTokenVerifier,readIdentityConfig} from './token-verifier.mjs';
test('configuration is opt-in and requires HTTPS',()=>{
 assert.equal(readIdentityConfig({}),null);
 assert.throws(()=>readIdentityConfig({OIDC_ISSUER:'https://issuer.example'}));
 assert.throws(()=>readIdentityConfig({OIDC_ISSUER:'http://issuer.example',OIDC_AUDIENCE:'api',OIDC_JWKS_URL:'https://issuer.example/keys'}));
});
test('signed access tokens require trusted signature, claims and token type',async()=>{
 const {publicKey,privateKey}=await generateKeyPair('RS256');
 const other=await generateKeyPair('RS256');
 const config={issuer:'https://issuer.example',audience:'gracehill-api'};
 const verify=createTokenVerifier(config,publicKey);
 const make=({issuer=config.issuer,audience=config.audience,typ='at+jwt',expiration='5m',key=privateKey}={})=>new SignJWT({roles:['administrator']}).setProtectedHeader({alg:'RS256',typ}).setIssuer(issuer).setAudience(audience).setSubject('fixture').setIssuedAt().setExpirationTime(expiration).sign(key);
 assert.deepEqual(await verify(await make()),{issuer:config.issuer,subject:'fixture'});
 for(const opts of [{issuer:'https://wrong.example'},{audience:'wrong'},{typ:'JWT'},{expiration:1},{key:other.privateKey}])await assert.rejects(async()=>verify(await make(opts)));
});
