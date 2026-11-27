export function mappedVerifier(verifyExternal,store){
 if(typeof verifyExternal!=='function'||!store)return undefined;
 return async token=>{
 const claims=await verifyExternal(token);
 if(!claims||typeof claims.issuer!=='string'||typeof claims.subject!=='string')return null;
 return store.resolve(claims.issuer,claims.subject);
 };
}
