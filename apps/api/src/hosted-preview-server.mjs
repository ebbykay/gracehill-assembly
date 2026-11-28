import {readHostedDatabaseConfig,openHostedHealthPool,checkHostedDatabase} from './hosted-db-health.mjs';
import {createHostedPreview} from './hosted-preview.mjs';
for(const name of Object.keys(process.env)){
 if((name==='DATABASE_URL'||name.startsWith('OIDC_')||name==='ADMIN_ORIGIN')&&process.env[name])throw Error('Operational configuration prohibited in hosted preview');
}
const port=Number(process.env.PORT||10000);
if(!Number.isInteger(port)||port<1||port>65535)throw Error('Invalid port');
const pool=await openHostedHealthPool(readHostedDatabaseConfig());
const server=createHostedPreview({dbHealth:()=>checkHostedDatabase(pool)});
server.listen(port,'0.0.0.0',()=>console.log('Hosted preview listening'));
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>server.close(async()=>{if(pool)await pool.end();process.exit(0)}));
