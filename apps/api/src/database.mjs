export async function openDatabase(url){
 if(!url)return null;
 const parsed=new URL(url);
 if(!['postgres:','postgresql:'].includes(parsed.protocol)||!['127.0.0.1','localhost','[::1]'].includes(parsed.hostname))throw new Error('Development database must use loopback');
 const {Pool}=await import('pg');
 const pool=new Pool({connectionString:url,max:5,connectionTimeoutMillis:3000,idleTimeoutMillis:10000,statement_timeout:5000,query_timeout:6000});
 pool.on('error',()=>console.error(JSON.stringify({event:'database_idle_connection_error'})));
 return pool;
}
export async function databaseAvailable(db){
 if(!db)return false;
 try{await db.query('SELECT 1');return true;}catch{return false;}
}
