// Deny by default. The verifier must be supplied by a trusted server-side identity adapter.
const permissions=Object.freeze({
 editor:Object.freeze(['programme:draft','media:draft']),
 publisher:Object.freeze(['programme:publish','media:publish']),
 membership:Object.freeze(['membership:read','membership:write','attendance:read','attendance:write']),
 finance:Object.freeze(['finance:read']),
 pastoral:Object.freeze(['pastoral:read']),
 auditor:Object.freeze(['audit:read']),
 administrator:Object.freeze(['identity:manage'])
});
export function can(principal,permission){
 return Boolean(principal&&typeof principal.subject==='string'&&principal.subject.trim()&&Array.isArray(principal.roles)&&principal.roles.some(role=>typeof role==='string'&&Object.hasOwn(permissions,role)&&permissions[role].includes(permission)));
}
export async function authenticate(req,verifyToken){
 const header=req.headers.authorization;
 if(typeof header!=='string'||header.length>8192||typeof verifyToken!=='function')return null;
 const match=/^Bearer ([A-Za-z0-9._~+\/=-]+)$/i.exec(header);
 if(!match)return null;
 try{
 const p=await verifyToken(match[1]);
 if(!p||typeof p.subject!=='string'||!p.subject.trim()||!Array.isArray(p.roles)||!p.roles.every(r=>typeof r==='string'))return null;
 return {subject:p.subject,roles:p.roles.filter(r=>Object.hasOwn(permissions,r))};
 }catch{return null;}
}
