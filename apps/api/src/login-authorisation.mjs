export function authorisationUrl(config,attempt){
 const endpoint=new URL(config.authorisationEndpoint);
 const redirect=new URL(config.redirectUri);
 for(const url of [endpoint,redirect]){
 if(url.protocol!=='https:'||url.username||url.password||url.hash||url.search)throw new Error('Invalid login endpoint');
 }
 if(typeof config.clientId!=='string'||!config.clientId.trim())throw new Error('Client ID required');
 for(const field of ['state','nonce','challenge']){
 if(typeof attempt[field]!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(attempt[field]))throw new Error('Invalid login attempt');
 }
 endpoint.search=new URLSearchParams({response_type:'code',client_id:config.clientId,redirect_uri:redirect.href,scope:'openid',state:attempt.state,nonce:attempt.nonce,code_challenge:attempt.challenge,code_challenge_method:'S256'}).toString();
 return endpoint.href;
}
