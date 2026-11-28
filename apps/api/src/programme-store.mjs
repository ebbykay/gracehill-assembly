export function createProgrammeStore(db){
 const columns='id,title,description,starts_at,ends_at,status,revision';
 async function transaction(actor,requestId,action,operation){
 const client=await db.connect();
 try{
 await client.query('BEGIN');
 const result=await operation(client);
 if(!result){await client.query('ROLLBACK');return null;}
 await client.query('INSERT INTO gracehill.audit_events(actor_id,request_id,action,outcome) VALUES ($1,$2,$3,$4)',[actor,requestId,action,'allowed']);
 await client.query('COMMIT');return result;
 }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
 }
 return {
 async list(){return (await db.query('SELECT '+columns+' FROM gracehill.programmes ORDER BY starts_at,id LIMIT 100')).rows;},
 create(data,actor,requestId){return transaction(actor,requestId,'programme:draft',async c=>(await c.query('INSERT INTO gracehill.programmes(title,description,starts_at,ends_at) VALUES ($1,$2,$3,$4) RETURNING '+columns,[data.title,data.description,data.startsAt,data.endsAt])).rows[0]);},
 edit(id,revision,data,actor,requestId){return transaction(actor,requestId,'programme:draft',async c=>(await c.query("UPDATE gracehill.programmes SET title=$1,description=$2,starts_at=$3,ends_at=$4,revision=revision+1,updated_at=now() WHERE id=$5 AND revision=$6 AND status='draft' RETURNING "+columns,[data.title,data.description,data.startsAt,data.endsAt,id,revision])).rows[0]);},
 transition(id,revision,from,to,actor,requestId,action){return transaction(actor,requestId,action,async c=>(await c.query('UPDATE gracehill.programmes SET status=$1,revision=revision+1,updated_at=now() WHERE id=$2 AND revision=$3 AND status=$4 RETURNING '+columns,[to,id,revision,from])).rows[0]);}
 };
}
