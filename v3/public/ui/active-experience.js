import { $, esc, state } from './common.js';
import { installBindings } from './actions.js';
import { installAdminCenter } from './admin-center.js';
import { installProcedureAdmin } from './procedure-admin.js';
import { installEnterpriseExperience } from './enterprise-ux.js';
import { installFi01Reference } from './fi01-reference.js';
import { installGlobalTools } from './global-tools.js';
import { installProofSurface } from './proof-surface.js';
import { installTraceExplorer } from './trace-explorer.js';
import { installGrcWorkspace } from './grc-workspace.js';
import { installSurfaceRouter } from './surface-router.js';
import { installAiOptionalControls } from './ai-optional-controls.js';
import { installProcessHandoffs } from './process-handoffs.js';
import { installRiskActionFidelity } from './risk-action-fidelity.js';
import { ensureStableShell, installStableShell } from './stable-shell.js';
import { installProcedureMarketUx } from './procedure-market-ux.js';
import { installProcedureAnatomy } from './procedure-anatomy.js';
import { installDraftStore } from './draft-store.js';
import { installStandardBrowser } from './standard-browser.js';
import { installStandardUseLanguage } from './standard-use-language.js';
let installed=false;
function installStableProfileMenu(){const host=$('.top-actions');if(!host||$('#stableProfileMenu'))return;const roleControl=$('.role-control'),runtime=$('#runtimeStatus'),admin=$('#openAdminCenter'),settings=$('#openSettings');const wrapper=document.createElement('details');wrapper.id='stableProfileMenu';wrapper.className='stable-profile-menu';wrapper.innerHTML='<summary>Profilo</summary><div class="stable-profile-popover"><div data-stable-role-slot></div><div class="stable-profile-actions" data-stable-profile-actions></div></div>';host.insertBefore(wrapper,runtime||null);if(roleControl)wrapper.querySelector('[data-stable-role-slot]').append(roleControl);const actions=wrapper.querySelector('[data-stable-profile-actions]');for(const button of [admin,settings])if(button){button.hidden=false;actions.append(button);button.addEventListener('click',()=>wrapper.removeAttribute('open'));}}
function updateStableProfileMenu(){const menu=$('#stableProfileMenu');if(!menu)return;const isAdmin=state.role==='admin',actions=menu.querySelector('[data-stable-profile-actions]');if(actions)actions.hidden=!isAdmin;const summary=menu.querySelector('summary');if(summary)summary.textContent=isAdmin?'Amministrazione':state.role==='auditor'?'Auditor':'Profilo';}
function operationalFor(id){return(state.data?.procedures||[]).find(item=>item.id===id)||null;}
function businessProcedures(){const enabled=new Set(state.data?.experience?.procedurePolicy?.enabled||[]);return(state.data?.procedureRegistry?.procedures||[]).filter(item=>!enabled.size||enabled.has(item.id));}
function removeHiddenDuplicateEntries(){const legacy=$('#userMonitoringIntro [data-open-contribution]');if(legacy)legacy.removeAttribute('data-open-contribution');}
function renderProcedureHub(){const host=$('#procedureHub');if(!host||!state.data)return;const procedures=businessProcedures();host.dataset.procedureHub='canonical-business-registry-derived';host.innerHTML=procedures.map(canonical=>{const item=operationalFor(canonical.id)||{},label=canonical.label,code=canonical.code,purpose=canonical.purpose||'',claim=canonical.claimBoundary||'',count=Number(item.attentionCount||0),metrics=(item.metrics||[]).slice(0,4),status=count>0?`${count} da vedere`:'In ordine',surface=canonical.adapter?.surface||item.service||'',service=surface==='grc'?'grc':surface;let action='';if(service==='grc')action=`<button class="primary" type="button" data-service="grc" data-grc-process="${esc(canonical.id)}">${esc(item.actionLabel||'Apri')}</button>`;else if(['monitoring','incidents'].includes(service))action=`<button class="primary" type="button" data-service="${esc(service)}">${esc(item.actionLabel||'Apri')}</button>`;return `<article class="stable-process-card" data-procedure-id="${esc(canonical.id)}" data-process-code="${esc(code)}"><header><div><span class="process-code">${esc(code)}</span><h2>${esc(label)}</h2></div><span class="stable-status ${count>0?'attention':'ready'}">${esc(status)}</span></header>${metrics.length?`<div class="stable-metrics">${metrics.map(m=>`<span><b>${esc(m.value)}</b><small>${esc(m.label)}</small></span>`).join('')}</div>`:''}<footer>${action}<details><summary>Scopo e limiti</summary><p>${esc(purpose)}</p>${claim?`<small>${esc(claim)}</small>`:''}</details></footer></article>`;}).join('')||'<div class="empty">Nessun processo operativo per il profilo corrente.</div>';}
function renderStableChrome(){ensureStableShell();removeHiddenDuplicateEntries();renderProcedureHub();updateStableProfileMenu();}
export function installActiveExperience(){if(installed)return;installed=true;installStableShell();installProofSurface();installTraceExplorer();installGrcWorkspace();installSurfaceRouter();installStandardUseLanguage();installProcedureMarketUx();installStandardBrowser();installDraftStore();installProcedureAnatomy();installBindings();installAdminCenter();installProcedureAdmin();installEnterpriseExperience();installFi01Reference();installGlobalTools();installAiOptionalControls();installProcessHandoffs();installRiskActionFidelity();installStableProfileMenu();updateStableProfileMenu();renderStableChrome();document.addEventListener('ictc:rendered',renderStableChrome);}
