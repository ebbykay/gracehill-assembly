const memberColumns='id,display_name,household_id,status,joined_on,revision';
export function createMembershipStore(db){
 async function write(actor,requestId,action,fn){
 const c=await db.connect();
 try{await c.query('BEGIN');const result=await fn(c);if(!result){await c.query('ROLLBACK');return null;}
 await c.query("INSERT INTO gracehill.audit_events(actor_id,request_id,action,outcome) VALUES ($1,$2,$3,'allowed')",[actor,requestId,action]);
 await c.query('COMMIT');return result;
 }catch(e){await c.query('ROLLBACK');if(['23503','23505','23514'].includes(e.code))return null;throw e;}finally{c.release();}
 }
 const first=async(c,sql,args)=>(await c.query(sql,args)).rows[0];
 return {
 async households(){return (await db.query('SELECT id,label FROM gracehill.households ORDER BY label,id LIMIT 100')).rows;},
 async members(){return (await db.query('SELECT '+memberColumns+' FROM gracehill.members ORDER BY display_name,id LIMIT 100')).rows;},
 async services(){return (await db.query('SELECT id,title,service_date FROM gracehill.attendance_services ORDER BY service_date DESC,id LIMIT 100')).rows;},
 async register(id){return (await db.query('SELECT member_id,present,revision FROM gracehill.attendance_entries WHERE service_id=$1 ORDER BY member_id LIMIT 500',[id])).rows;},
 createHousehold(label,actor,rid){return write(actor,rid,'membership:write',c=>first(c,'INSERT INTO gracehill.households(label) VALUES ($1) RETURNING id,label',[label]));},
 createMember(d,actor,rid){return write(actor,rid,'membership:write',c=>first(c,'INSERT INTO gracehill.members(display_name,household_id,status,joined_on) VALUES ($1,$2,$3,$4) RETURNING '+memberColumns,[d.displayName,d.householdId,d.status,d.joinedOn]));},
 editMember(id,d,actor,rid){return write(actor,rid,'membership:write',c=>first(c,'UPDATE gracehill.members SET display_name=$1,household_id=$2,status=$3,joined_on=$4,revision=revision+1,updated_at=now() WHERE id=$5 AND revision=$6 RETURNING '+memberColumns,[d.displayName,d.householdId,d.status,d.joinedOn,id,d.revision]));},
 createService(d,actor,rid){return write(actor,rid,'attendance:write',c=>first(c,'INSERT INTO gracehill.attendance_services(title,service_date) VALUES ($1,$2) RETURNING id,title,service_date',[d.title,d.serviceDate]));},
 record(serviceId,memberId,d,actor,rid){return write(actor,rid,'attendance:write',c=>d.revision===0?
 first(c,'INSERT INTO gracehill.attendance_entries(service_id,member_id,present) SELECT $1,id,$3 FROM gracehill.members WHERE id=$2 AND status<>\'inactive\' ON CONFLICT DO NOTHING RETURNING member_id,present,revision',[serviceId,memberId,d.present]):
 first(c,'UPDATE gracehill.attendance_entries SET present=$3,revision=revision+1,updated_at=now() WHERE service_id=$1 AND member_id=$2 AND revision=$4 RETURNING member_id,present,revision',[serviceId,memberId,d.present,d.revision]));}
 };
}
