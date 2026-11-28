// Static SQL definitions; no user-controlled identifiers.
const models=Object.freeze({
 ministries:{table:'ministries',cols:'id,name,active,revision',insert:'name',keys:['name'],permission:'ministry:write'},
 'ministry-assignments':{table:'ministry_assignments',cols:'ministry_id,member_id,responsibility',insert:'ministry_id,member_id,responsibility',keys:['ministryId','memberId','responsibility'],permission:'ministry:write'},
 'finance-entries':{table:'finance_entries',cols:'id,label,direction,amount_minor,entry_date,status,created_by,reviewed_by,revision',insert:'label,direction,amount_minor,entry_date,created_by',keys:['label','direction','amountMinor','entryDate'],actor:true,permission:'finance:write'},
 'finance-budgets':{table:'finance_budgets',cols:'month,ceiling_minor,revision',insert:'month,ceiling_minor',keys:['month','ceilingMinor'],permission:'finance:write'},
 'media-resources':{table:'media_resources',cols:'id,title,description,format,resource_url,status,revision',insert:'title,description,format,resource_url',keys:['title','description','format','resourceUrl'],permission:'media:draft'},
 'care-followups':{table:'care_followups',cols:'id,case_ref,due_date,status,revision',insert:'case_ref,due_date',keys:['caseRef','dueDate'],permission:'pastoral:write'},
 announcements:{table:'announcements',cols:'id,title,body,audience,scheduled_at,status,revision',insert:'title,body,audience,scheduled_at',keys:['title','body','audience','scheduledAt'],permission:'communications:write'}
});
export function createOperationsStore(db){
 async function transaction(actor,rid,action,fn){
 const c=await db.connect();
 try{await c.query('BEGIN');const result=(await fn(c)).rows[0];if(!result){await c.query('ROLLBACK');return null;}
 await c.query("INSERT INTO gracehill.audit_events(actor_id,request_id,action,outcome) VALUES ($1,$2,$3,'allowed')",[actor,rid,action]);await c.query('COMMIT');return result;
 }catch(e){await c.query('ROLLBACK');if(['23503','23505','23514'].includes(e.code))return null;throw e;}finally{c.release();}
 }
 const get=k=>{if(!Object.hasOwn(models,k))throw Error('Unknown resource');return models[k];};
 return {
 async list(k){const m=get(k);return (await db.query('SELECT '+m.cols+' FROM gracehill.'+m.table+' ORDER BY '+m.cols.split(',')[0]+' LIMIT 100')).rows;},
 create(k,d,actor,rid){const m=get(k),values=m.keys.map(key=>d[key]);if(m.actor)values.push(actor);return transaction(actor,rid,m.permission,c=>c.query('INSERT INTO gracehill.'+m.table+'('+m.insert+') VALUES ('+values.map((_,i)=>'$'+(i+1)).join(',')+') RETURNING '+m.cols,values));},
 transition(k,id,d,actor,rid,permission){
 const m=get(k);if(!['finance-entries','media-resources','care-followups','announcements'].includes(k))throw Error('Unsupported transition');
 const finance=k==='finance-entries',review=finance&&['approved','rejected'].includes(d.to);
 const args=[d.to,id,d.revision,d.from];let set='status=$1,revision=revision+1',where='id=$2 AND revision=$3 AND status=$4';
 if(finance){args.push(actor);if(review){set+=',reviewed_by=$5';where+=' AND created_by<>$5';}else where+=' AND created_by=$5';}
 if(k==='media-resources')set+=',updated_at=now()';
 return transaction(actor,rid,permission,c=>c.query('UPDATE gracehill.'+m.table+' SET '+set+' WHERE '+where+' RETURNING '+m.cols,args));
 },
 budget(month,d,actor,rid){return transaction(actor,rid,'finance:write',c=>c.query('UPDATE gracehill.finance_budgets SET ceiling_minor=$1,revision=revision+1 WHERE month=$2 AND revision=$3 RETURNING month,ceiling_minor,revision',[d.ceilingMinor,month,d.revision]));},
 async financeSummary(month){return (await db.query("SELECT COALESCE(SUM(amount_minor) FILTER(WHERE direction='income'),0)::text AS income_minor,COALESCE(SUM(amount_minor) FILTER(WHERE direction='expense'),0)::text AS expense_minor FROM gracehill.finance_entries WHERE status='approved' AND entry_date >= $1::date AND entry_date < ($1::date+interval '1 month')",[month])).rows[0];}
 };
}
