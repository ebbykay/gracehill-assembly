export function readConfig(env=process.env){
 const host=env.API_HOST||'127.0.0.1';
 const port=Number(env.API_PORT||3001);
 if(host!=='127.0.0.1'&&host!=='::1')throw new Error('Only loopback binding is permitted in this foundation');
 if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid API_PORT');
 return Object.freeze({host,port});
}
