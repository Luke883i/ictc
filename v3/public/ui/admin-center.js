import { $, api, notify, showReceipt, state } from './common.js';

function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function severityLabel(value){return ({high:'Alta',medium:'Media',low:'Bassa'})[value]||String(value||'Non determinata');}
function roleLabel(value){return ({admin:'Amministratore',user:'Utente',auditor:'Auditor'})[value]||String(value||'Ruolo non determinato');}
function statusLabel(value){return ({active:'Attivo',disabled:'Disabilitato'})[value]||String(value||'Non determinato');}
function ruleLines(rules, key){
  return (rules||[]).map(rule=>`${rule[key]} => ${rule.effect==='deny'?'deny':rule.role}`).join('\n');
}
function parseRuleLines(value, key){
  return String(value||'').split(/\r?\n/).map(line=>line.trim()).filter(line=>line&&!line.startsWith('#')).map(line=>{
    const marker=line.lastIndexOf('=>');
    if(marker<1)return null;
    const subject=line.slice(0,marker).trim();
    const decision=line.slice(marker+2).trim().toLowerCase();
    if(!subject)return null;
    if(key==='user'&&decision==='deny')return {user:subject,effect:'deny'};
    if(!['admin','user','auditor'].includes(decision))return null;
    return key==='user'?{user:subject,effect:'allow',role:decision}:{group:subject,role:decision};
  }).filter(Boolean);
}
function dialogMarkup(){return `
<dialog id="adminCenter" class="admin-center" aria-labelledby="adminCenterTitle">
  <div class="admin-shell">
    <header class="admin-head">
      <div><p class="eyebrow">Amministrazione</p><h2 id="adminCenterTitle">Controlli e accessi</h2><p>Verifica i controlli, governa l’AI e configura le identità.</p></div>
      <button type="button" data-admin-close aria-label="Chiudi">×</button>
    </header>
    <div class="admin-grid">
      <section class="admin-panel"><h3>Stato dei controlli</h3><div id="adminMetrics" class="metric-grid"></div><div id="adminReadiness" class="readiness-list"></div></section>
      <section class="admin-panel"><h3>Azioni richieste</h3><div id="adminAttention" class="readiness-list"></div></section>
      <section class="admin-panel"><h3>Utilizzo AI</h3><div id="adminUsage" class="metric-grid"></div><div id="adminUsagePurpose" class="readiness-list"></div></section>
      <section class="admin-panel">
        <h3>Governance AI</h3>
        <form id="governanceForm" class="admin-form">
          <div class="row"><label>Ambiente<input name="environmentName" required></label><label>Classificazione<select name="classification"><option>internal</option><option>confidential</option><option>restricted</option></select></label></div>
          <label>Responsabile<input name="owner"></label>
          <div class="row"><label>Budget mensile USD<input name="monthlyBudgetUsd" type="number" min="0" step="1"></label><label>Soglia avviso %<input name="warningPercent" type="number" min="1" max="100"></label></div>
          <label>Modelli consentiti, uno per riga<textarea name="allowedModels" rows="3" required></textarea></label>
          <div class="admin-actions"><button class="primary" type="submit">Salva governance</button></div>
        </form>
      </section>
      <section class="admin-panel" data-identity-admin>
        <h3>Identità LDAP / Shibboleth</h3>
        <p class="microcopy">Shibboleth autentica e legge gli attributi LDAP. ICTC riceve soltanto identificativo, nome, email e gruppi dal proxy attendibile; password e credenziali di bind non entrano nel runtime.</p>
        <div id="identityRuntime" class="readiness-list"></div>
        <form id="identityForm" class="admin-form">
          <details class="identity-step" data-identity-step="attributes" open>
            <summary><b>1. Attributi e comportamento</b><small>Provider, header e accesso predefinito</small></summary>
            <div class="identity-step-body">
              <div class="row">
                <label>Strategia<select name="strategy"><option value="legacy-role-header">Header ruolo legacy</option><option value="shibboleth">Shibboleth con mapping</option></select></label>
                <label>Nome provider<input name="providerLabel" maxlength="200" placeholder="Shibboleth SP"></label>
              </div>
              <fieldset><legend>Attributi inoltrati dal proxy</legend>
                <div class="row"><label>Identificativo<input name="subjectHeader" required></label><label>Gruppi<input name="groupsHeader" required></label></div>
                <div class="row"><label>Nome visualizzato<input name="displayNameHeader" required></label><label>Email<input name="emailHeader" required></label></div>
                <div class="row"><label>Separatore gruppi<select name="groupDelimiter"><option value=";">Punto e virgola</option><option value="|">Barra verticale</option><option value=",">Virgola</option><option value=" ">Spazio</option></select></label><label>Identità senza regola<select name="defaultRole"><option value="deny">Nega accesso</option><option value="user">Utente</option></select></label></div>
              </fieldset>
            </div>
          </details>
          <details class="identity-step" data-identity-step="rules">
            <summary><b>2. Regole di accesso</b><small>Utenti espliciti e gruppi ordinati</small></summary>
            <div class="identity-step-body">
              <label>Regole gruppi, in ordine<textarea name="groupRules" rows="6" placeholder="cn=ictc-admins,ou=groups,dc=example,dc=org => admin&#10;cn=ictc-auditors,ou=groups,dc=example,dc=org => auditor&#10;cn=ictc-users,ou=groups,dc=example,dc=org => user"></textarea></label>
              <small>La prima regola gruppo corrispondente determina il ruolo.</small>
              <label>Eccezioni utente<textarea name="userRules" rows="4" placeholder="breakglass@example.org => admin&#10;former.user@example.org => deny"></textarea></label>
              <small>Le eccezioni utente precedono sempre le regole gruppo. Una negazione esplicita prevale su ogni gruppo.</small>
            </div>
          </details>
          <div class="admin-actions"><button class="primary" type="submit">Salva policy identità</button></div>
        </form>
        <details class="identity-step" data-identity-step="test">
          <summary><b>3. Prova il mapping</b><small>Valuta attributi campione senza salvare</small></summary>
          <div class="identity-step-body">
            <form id="identityTestForm" class="admin-form">
              <div class="row"><label>Identificativo campione<input name="subject" required placeholder="alice@example.org"></label><label>Nome<input name="displayName"></label></div>
              <label>Email<input name="email" type="email"></label>
              <label>Gruppi campione, uno per riga<textarea name="groups" rows="4"></textarea></label>
              <div class="admin-actions"><button type="submit">Verifica accesso</button></div>
            </form>
            <div id="identityTestResult" class="readiness-list" aria-live="polite"></div>
          </div>
        </details>
      </section>
      <section class="admin-panel">
        <h3>Utenti locali e legacy</h3>
        <p class="microcopy">Questa directory resta valida per la modalità locale e per gli header ruolo legacy. Con Shibboleth, l’autorità deriva dalle regole gruppo e utente configurate sopra.</p>
        <form id="userForm" class="admin-form">
          <div class="row"><label>ID utente<input name="id" required></label><label>Ruolo<select name="role"><option value="user">Utente</option><option value="auditor">Auditor</option><option value="admin">Amministratore</option></select></label></div>
          <label>Nome visualizzato<input name="displayName" required></label><label>Email<input name="email" type="email"></label>
          <div class="admin-actions"><button class="primary" type="submit">Aggiungi utente</button></div>
        </form>
        <div id="adminUsers" class="user-list"></div>
      </section>
    </div>
  </div>
</dialog>`;}

function controlRow(item){return `<div class="readiness-row"><span><b>${esc(item.label)}</b><small>${esc(item.evidence)}</small>${item.action?`<small>Prossimo passo: ${esc(item.action)}</small>`:''}</span><span class="score ${item.status==='verified'?'good':'warn'}">${item.status==='verified'?'Verificato':'Bloccante'}</span></div>`;}
function identityRuntimeRows(runtime){
  const active=runtime.activeStrategy==='shibboleth'?'Shibboleth attivo':runtime.activeStrategy==='local'?'Configurato per il deployment':'Header legacy attivi';
  return `
    <div class="readiness-row"><span><b>${esc(active)}</b><small>Strategia configurata: ${esc(runtime.configuredStrategy)}</small></span><span class="score ${runtime.activeStrategy==='shibboleth'?'good':'warn'}">${runtime.activeStrategy==='shibboleth'?'Attivo':'Preparato'}</span></div>
    <div class="readiness-row"><span><b>Confine proxy</b><small>Secret: ${runtime.proxySecretConfigured?'configurato':'non attestato'} · binding rete: ${runtime.networkBindAllowed?'consentito':'non consentito'}</small></span><span class="score ${runtime.proxySecretConfigured?'good':'warn'}">${runtime.proxySecretConfigured?'Verificato':'Deployment'}</span></div>
    <div class="readiness-row"><span><b>Percorsi ruolo</b><small>${runtime.groupRuleCount} gruppi · ${runtime.userRuleCount} utenti</small></span><span>${runtime.adminPath?'Admin ✓':'Admin mancante'} · ${runtime.auditorPath?'Auditor ✓':'Auditor mancante'}</span></div>`;
}
function fillIdentityForm(payload){
  const form=$('#identityForm');
  const config=payload.config||{};
  form.elements.strategy.value=config.strategy||'legacy-role-header';
  form.elements.providerLabel.value=config.providerLabel||'Shibboleth SP';
  form.elements.subjectHeader.value=config.headers?.subject||'x-ictc-subject';
  form.elements.displayNameHeader.value=config.headers?.displayName||'x-ictc-display-name';
  form.elements.emailHeader.value=config.headers?.email||'x-ictc-email';
  form.elements.groupsHeader.value=config.headers?.groups||'x-ictc-groups';
  form.elements.groupDelimiter.value=config.groupDelimiter||';';
  form.elements.defaultRole.value=config.defaultRole||'deny';
  form.elements.groupRules.value=ruleLines(config.groupRules,'group');
  form.elements.userRules.value=ruleLines(config.userRules,'user');
  $('#identityRuntime').innerHTML=identityRuntimeRows(payload.runtime||{});
}
function identityPayload(form){
  const data=new FormData(form);
  return {
    strategy:data.get('strategy'),providerLabel:data.get('providerLabel'),
    headers:{subject:data.get('subjectHeader'),displayName:data.get('displayNameHeader'),email:data.get('emailHeader'),groups:data.get('groupsHeader')},
    groupDelimiter:data.get('groupDelimiter'),defaultRole:data.get('defaultRole')==='user'?'user':null,
    groupRules:parseRuleLines(data.get('groupRules'),'group'),userRules:parseRuleLines(data.get('userRules'),'user')
  };
}

async function loadAdmin(){
  const [readiness,usage,users,identity]=await Promise.all([api('/api/admin/readiness'),api('/api/admin/usage'),api('/api/admin/users'),api('/api/admin/identity')]);
  $('#adminMetrics').innerHTML=`<div class="metric"><b>${esc(readiness.verified)}/${esc(readiness.total)}</b><small>Controlli verificati</small></div><div class="metric"><b>${esc(readiness.level==='enterprise-ready'?'Pronto':'Bloccato')}</b><small>Esito</small></div><div class="metric"><b>${esc(users.users.filter(u=>u.status==='active').length)}</b><small>Utenti locali attivi</small></div>`;
  $('#adminReadiness').innerHTML=(readiness.controls||[]).map(controlRow).join('');
  $('#adminAttention').innerHTML=(readiness.attention||[]).map(item=>`<div class="readiness-row"><span><b>${esc(item.label)}</b><small>${esc(item.reason)}</small></span><span class="score warn">${esc(severityLabel(item.severity))}</span></div>`).join('')||'<p>Nessuna azione richiesta.</p>';
  $('#adminUsage').innerHTML=`<div class="metric"><b>$${esc(usage.estimatedCostUsd)}</b><small>Stima mensile</small></div><div class="metric"><b>${esc(usage.totalTokens)}</b><small>Token</small></div><div class="metric"><b>${esc(usage.utilizationPercent)}%</b><small>Budget usato</small></div>`;
  $('#adminUsagePurpose').innerHTML=Object.entries(usage.byPurpose||{}).map(([key,value])=>`<div class="readiness-row"><span>${esc(key)} · ${esc(value.calls)} chiamate</span><span>$${esc(Number(value.estimatedCostUsd||0).toFixed(4))}</span></div>`).join('')||'<p>Nessun utilizzo registrato.</p>';
  $('#adminUsers').innerHTML=users.users.map(user=>`<div class="user-row"><div><b>${esc(user.displayName)}</b><small>${esc(user.id)} · ${esc(roleLabel(user.role))} · ${esc(statusLabel(user.status))}</small></div>${user.id.startsWith('local-')?'':`<button type="button" data-user-toggle="${esc(user.id)}" data-user-status="${user.status==='active'?'disabled':'active'}">${user.status==='active'?'Disabilita':'Riattiva'}</button>`}</div>`).join('');
  const governance=state.data.settings.governance||{},environment=state.data.settings.environment||{};const form=$('#governanceForm');form.elements.environmentName.value=environment.name||'local';form.elements.classification.value=environment.classification||'internal';form.elements.owner.value=environment.owner||'';form.elements.monthlyBudgetUsd.value=governance.monthlyBudgetUsd??250;form.elements.warningPercent.value=governance.warningPercent??80;form.elements.allowedModels.value=(governance.allowedModels||[]).join('\n');
  fillIdentityForm(identity);
}

export function installAdminCenter(){
  if(!$('#adminCenter'))document.body.insertAdjacentHTML('beforeend',dialogMarkup());
  const host=document.querySelector('.top-actions');if(host&&!$('#openAdminCenter'))host.insertAdjacentHTML('afterbegin','<button id="openAdminCenter" class="ghost admin-only" type="button">Amministrazione</button>');
  $('#openAdminCenter')?.addEventListener('click',async()=>{try{await loadAdmin();$('#adminCenter').showModal();}catch(error){notify(error.message,true);}});
  $('[data-admin-close]')?.addEventListener('click',()=>$('#adminCenter').close());
  $('#governanceForm')?.addEventListener('submit',async event=>{event.preventDefault();const form=new FormData(event.currentTarget);try{const result=await api('/api/admin/governance',{method:'PUT',body:JSON.stringify({environment:{name:form.get('environmentName'),classification:form.get('classification'),owner:form.get('owner')},monthlyBudgetUsd:Number(form.get('monthlyBudgetUsd')),warningPercent:Number(form.get('warningPercent')),allowedModels:String(form.get('allowedModels')||'').split(/\n|,/).map(v=>v.trim()).filter(Boolean)})});showReceipt(result);await loadAdmin();notify('Governance salvata');}catch(error){notify(error.message,true);}});
  $('#identityForm')?.addEventListener('submit',async event=>{event.preventDefault();try{const result=await api('/api/admin/identity',{method:'PUT',body:JSON.stringify(identityPayload(event.currentTarget))});showReceipt(result);await loadAdmin();notify('Policy identità salvata');}catch(error){notify(error.message,true);}});
  $('#identityTestForm')?.addEventListener('submit',async event=>{event.preventDefault();const data=new FormData(event.currentTarget);try{const response=await api('/api/admin/identity/test',{method:'POST',body:JSON.stringify({config:identityPayload($('#identityForm')),subject:data.get('subject'),displayName:data.get('displayName'),email:data.get('email'),groups:String(data.get('groups')||'').split(/\r?\n/).map(value=>value.trim()).filter(Boolean)})});const result=response.result;$('#identityTestResult').innerHTML=`<div class="readiness-row"><span><b>${result.allowed?'Accesso consentito':'Accesso negato'}</b><small>${esc(result.reason||`${roleLabel(result.role)} tramite ${result.matchedBy?.type||'regola'}`)}</small></span><span class="score ${result.allowed?'good':'warn'}">${result.allowed?esc(roleLabel(result.role)):'Negato'}</span></div>`;}catch(error){notify(error.message,true);}});
  $('#userForm')?.addEventListener('submit',async event=>{event.preventDefault();const form=new FormData(event.currentTarget);try{const result=await api('/api/admin/users',{method:'POST',body:JSON.stringify(Object.fromEntries(form))});showReceipt(result);event.currentTarget.reset();await loadAdmin();notify('Utente aggiunto');}catch(error){notify(error.message,true);}});
  $('#adminCenter')?.addEventListener('click',async event=>{const button=event.target.closest('[data-user-toggle]');if(!button)return;try{const result=await api(`/api/admin/users/${button.dataset.userToggle}`,{method:'PATCH',body:JSON.stringify({status:button.dataset.userStatus})});showReceipt(result);await loadAdmin();notify('Stato utente aggiornato');}catch(error){notify(error.message,true);}});
}
