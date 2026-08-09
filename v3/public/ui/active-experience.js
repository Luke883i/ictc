import { $, esc, state } from './common.js';
import { installBindings } from './actions.js';
import { installAdminCenter } from './admin-center.js';
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

let installed=false;

function ensureStableShell(){
  document.title='ICTC · Compliance operativa';
  document.documentElement.dataset.ictcEdition='1.0-stable';
  document.documentElement.dataset.ictcStability='stable';
  document.documentElement.dataset.ictcExperience='stable-1';
  const nav=$('.service-nav');
  const services=nav?[...nav.querySelectorAll('[data-service]')].map(node=>node.dataset.service):[];
  if(JSON.stringify(services)!==JSON.stringify(['home','processes','proof']))throw Object.assign(new Error('Shell stabile non canonica'),{code:'stable-shell-missing',details:{services}});
  $('.home-journey-panel')?.setAttribute('hidden','');
  $('.home-overview-grid')?.setAttribute('hidden','');
}

function renderProcedureHub(){
  const host=$('#procedureHub');
  if(!host||!state.data)return;
  const procedures=(state.data.procedures||[]).filter(item=>item.code&&item.id!=='evidence');
  host.dataset.procedureHub='stable-runtime-derived';
  host.innerHTML=procedures.map(item=>{
    const count=Number(item.attentionCount||0);
    const metrics=(item.metrics||[]).slice(0,2);
    const status=count>0?`${count} da vedere`:'In ordine';
    let action='';
    if(item.service==='grc')action=`<button class="primary" type="button" data-service="grc" data-grc-process="${esc(item.id)}">${esc(item.actionLabel||'Apri')}</button>`;
    else if(['monitoring','incidents'].includes(item.service))action=`<button class="primary" type="button" data-service="${esc(item.service)}">${esc(item.actionLabel||'Apri')}</button>`;
    return `<article class="stable-process-card" data-procedure-id="${esc(item.id)}" data-process-code="${esc(item.code)}"><header><div><span class="process-code">${esc(item.code)}</span><h2>${esc(item.label)}</h2></div><span class="stable-status ${count>0?'attention':'ready'}">${esc(status)}</span></header>${metrics.length?`<div class="stable-metrics">${metrics.map(m=>`<span><b>${esc(m.value)}</b><small>${esc(m.label)}</small></span>`).join('')}</div>`:''}<footer>${action}<details><summary>Scopo e limiti</summary><p>${esc(item.description||'')}</p>${item.claimBoundary?`<small>${esc(item.claimBoundary)}</small>`:''}</details></footer></article>`;
  }).join('')||'<div class="empty">Nessun processo disponibile per il profilo corrente.</div>';
}

function renderStableChrome(){
  ensureStableShell();
  renderProcedureHub();
}

export function installActiveExperience(){
  if(installed)return;
  installed=true;
  renderStableChrome();
  installProofSurface();
  installTraceExplorer();
  installGrcWorkspace();
  installSurfaceRouter();
  installBindings();
  installAdminCenter();
  installEnterpriseExperience();
  installFi01Reference();
  installGlobalTools();
  installAiOptionalControls();
  installProcessHandoffs();
  installRiskActionFidelity();
  document.addEventListener('ictc:rendered',renderStableChrome);
}
