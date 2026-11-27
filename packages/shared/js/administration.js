(() => {
 const title=document.getElementById('adminPageTitle'),description=document.getElementById('module-description'),content=document.getElementById('module-content');
 if(!title||!description||!content)return;
 const modules={
 dashboard:['Review planned operational modules.','Operational readiness','Public website available; internal services not connected.'],
 membership:['Manage membership records after security approval.','Required capabilities','Member registration, consent, access controls and retention.'],
 attendance:['Plan attendance workflows.','Required capabilities','Service records, attendance counts and reporting.'],
 finance:['Plan accountable financial operations.','Required capabilities','Transaction approval, reconciliation and restricted financial reporting.'],
 events:['Plan church programme publication.','Required capabilities','Draft, review, publish and archive programme records.'],
 ministry:['Plan team and ministry coordination.','Required capabilities','Ministry assignments, volunteer roles and schedules.'],
 media:['Plan public media publication.','Required capabilities','Resource registration, rights approval and publishing.'],
 care:['Plan confidential pastoral support.','Required capabilities','Restricted access, consent and retention rules.'],
 communications:['Plan announcements and follow-up.','Required capabilities','Approved recipients, consent and delivery tracking.'],
 reports:['Plan operational reporting.','Required capabilities','Authorised aggregated metrics and audit trails.'],
 settings:['Plan organisation configuration.','Required capabilities','Server-side identity, permissions and configuration audit.']
 };
 const buttons=[...document.querySelectorAll('[data-department]')];
 buttons.forEach(button=>button.addEventListener('click',()=>{
 const data=modules[button.dataset.department];if(!data)return;
 buttons.forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
 title.textContent=button.textContent;description.textContent=data[0];
 const card=document.createElement('article'),heading=document.createElement('h2'),p=document.createElement('p');
 heading.textContent=data[1];p.textContent=data[2];card.append(heading,p);
 const readiness=document.createElement('article'),h=document.createElement('h2'),note=document.createElement('p');h.textContent='Readiness';note.textContent='Not connected to operational services.';readiness.append(h,note);
 content.replaceChildren(card,readiness);title.focus();
 }));
})();
