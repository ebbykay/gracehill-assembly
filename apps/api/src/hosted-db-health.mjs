// Staging connectivity only: no operational queries, migrations or identity services.
export function readHostedDatabaseConfig(env=process.env){
 const value=env.STAGING_DATABASE_URL;
 if(!value)return null;
 const url=new URL(value);
 if(!['postgres:','postgresql:'].includes(url.protocol)||!/^dpg-[a-z0-9]+(?:-a)?$/.test(url.hostname)||!url.username||!url.password||url.search||url.hash||url.port&&url.port!=='5432')throw Error('Use a Render internal database URL without query parameters');
 return {connectionString:value,max:1,connectionTimeoutMillis:3000,idleTimeoutMillis:10000,statement_timeout:3000,query_timeout:4000,application_name:'gracehill-staging-health'};
}
export async function openHostedHealthPool(config){
 if(!config)return null;
 const {Pool}=await import('pg');
 const pool=new Pool(config);
 pool.on('error',()=>console.error(JSON.stringify({event:'staging_database_idle_error'})));
 return pool;
}
export async function checkHostedDatabase(pool){
 if(!pool)return 'not_configured';
 try{await pool.query('SELECT 1');return 'available';}catch{return 'unavailable';}
}
