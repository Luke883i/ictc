import { $, state } from './common.js';
import { normalizeSettingsDialog } from './enterprise-2-compliance-settings.js';
import { normalizeDialogDensity, normalizeGovernanceForm, normalizeIdentityForms, normalizeJobDialog } from './enterprise-2-compliance-operations.js';

const FLOW_ID = 'compliance-guided-1';

export const COMPLIANCE_FLOW_STAGES = Object.freeze([
  Object.freeze({ id: 'frame', index: 1, label: 'Inquadra', title: 'Chiarisci obiettivo e responsabilità', summary: 'Definisci perché l’attività è necessaria e chi deve prendere la decisione.' }),
  Object.freeze({ id: 'scope', index: 2, label: 'Delimita', title: 'Definisci ambito e criteri', summary: 'Indica perimetro, riferimenti, criteri di inclusione e limiti.' }),
  Object.freeze({ id: 'collect', index: 3, label: 'Raccogli', title: 'Registra fonti e fatti', summary: 'Conserva gli elementi originali prima di interpretarli o classificarli.' }),
  Object.freeze({ id: 'assess', index: 4, label: 'Valuta', title: 'Valuta pertinenza e qualità', summary: 'Distingui fatti, ipotesi, lacune e proposte del modello.' }),
  Object.freeze({ id: 'decide', index: 5, label: 'Decidi e attua', title: 'Registra la decisione umana', summary: 'Motiva la scelta, assegna l’azione e monitora l’esito.' }),
  Object.freeze({ id: 'review', index: 6, label: 'Riesamina', title: 'Conserva evidenze e riesamina', summary: 'Mantieni origine, versioni, limiti e prossima data di revisione.' })
]);

function stageById(id) {
  return COMPLIANCE_FLOW_STAGES.find(stage => stage.id === id) || COMPLIANCE_FLOW_STAGES[0];
}

function visibleSurface() {
  const candidates = [['home', '#homeView'], ['monitoring', '#monitoringView'], ['incidents', '#incidentsView'], ['proof', '#proofView']];
  return candidates.find(([, selector]) => {
    const node = $(selector);
    return node && !node.hidden;
  })?.[0] || document.documentElement.dataset.ictcSurface || 'home';
}

function deriveStage(surface = visibleSurface()) {
  const data = state.data || {};
  if (surface === 'proof') return stageById('review');
  if (surface === 'monitoring') {
    const candidates = (data.sources || data.catalog || []).filter(item => ['candidate', 'pending', 'review'].includes(item.state || item.status));
    if (candidates.length) return stageById('assess');
    if (!(data.missions || data.monitoringJobs || []).length) return stageById('scope');
    return stageById('decide');
  }
  if (surface === 'incidents') {
    const incidents = data.incidents || [];
    if (!incidents.length) return stageById('collect');
    if (incidents.some(item => ['recorded', 'needs-information', 'information-requested'].includes(item.state || item.status))) return stageById('assess');
    if (incidents.some(item => ['draft', 'review', 'ready-for-approval'].includes(item.state || item.status))) return stageById('decide');
    return stageById('review');
  }
  const priority = ($('#homeRecommendation, .home-recommendation')?.textContent || '').toLowerCase();
  if (/configura|obiettivo|ambito/.test(priority)) return stageById('scope');
  if (/fonte|valuta|verifica/.test(priority)) return stageById('assess');
  if (/evento|registra|materiale/.test(priority)) return stageById('collect');
  if (/evidenz|riesamina/.test(priority)) return stageById('review');
  return stageById('frame');
}

function cueHost(surface) {
  const root = $({ home: '#homeView', monitoring: '#monitoringView', incidents: '#incidentsView', proof: '#proofView' }[surface]);
  if (!root) return null;
  const anchor = root.querySelector(':scope > .hero, :scope > .workbench-home-head, :scope > .proof-hero-17, :scope > header, :scope > section');
  return { root, anchor };
}

function buildFlowCue(surface) {
  const cue = document.createElement('aside');
  cue.className = 'compliance-flow-cue';
  cue.dataset.complianceFlowCue = surface;
  cue.innerHTML = '<div class="flow-cue-current"><p class="eyebrow">Fase consigliata</p><div><b data-flow-stage-title></b><span data-flow-stage-summary></span></div><span class="flow-cue-index" data-flow-stage-index></span></div><details class="flow-cue-details"><summary>Vedi il percorso completo</summary><ol class="flow-stage-list"></ol></details>';
  const list = cue.querySelector('.flow-stage-list');
  for (const stage of COMPLIANCE_FLOW_STAGES) {
    const item = document.createElement('li');
    item.dataset.flowStage = stage.id;
    item.innerHTML = `<span>${stage.index}</span><div><b></b><small></small></div>`;
    item.querySelector('b').textContent = stage.label;
    item.querySelector('small').textContent = stage.title;
    list.append(item);
  }
  return cue;
}

function renderFlowCue(surface = visibleSurface()) {
  const host = cueHost(surface);
  if (!host) return;
  let cue = host.root.querySelector(`:scope > [data-compliance-flow-cue="${surface}"]`);
  if (!cue) {
    cue = buildFlowCue(surface);
    if (host.anchor?.nextSibling) host.root.insertBefore(cue, host.anchor.nextSibling);
    else host.root.append(cue);
  }
  const stage = deriveStage(surface);
  cue.dataset.activeFlowStage = stage.id;
  cue.querySelector('[data-flow-stage-title]').textContent = `${stage.label} · ${stage.title}`;
  cue.querySelector('[data-flow-stage-summary]').textContent = stage.summary;
  cue.querySelector('[data-flow-stage-index]').textContent = `${stage.index}/${COMPLIANCE_FLOW_STAGES.length}`;
  for (const item of cue.querySelectorAll('[data-flow-stage]')) {
    const active = item.dataset.flowStage === stage.id;
    item.dataset.current = String(active);
    if (active) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  }
  host.root.dataset.complianceStage = stage.id;
  document.documentElement.dataset.complianceStage = stage.id;
}

let scheduled = false;
function applyComplianceFlow() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    document.documentElement.dataset.complianceFlow = FLOW_ID;
    renderFlowCue();
    normalizeSettingsDialog();
    normalizeJobDialog();
    normalizeGovernanceForm();
    normalizeIdentityForms();
    normalizeDialogDensity();
    document.dispatchEvent(new CustomEvent('ictc:compliance-flow-ready', {
      detail: { id: FLOW_ID, stage: document.documentElement.dataset.complianceStage }
    }));
  });
}

export function installEnterprise2ComplianceFlow() {
  document.addEventListener('ictc:rendered', applyComplianceFlow);
  document.addEventListener('ictc:surface-changed', applyComplianceFlow);
  document.addEventListener('click', event => {
    if (event.target.closest('#openSettings,#openAdminCenter,#openJobConfig,[data-open-plan],[data-open-source],[data-open-incident],#openProofDetails')) {
      requestAnimationFrame(applyComplianceFlow);
      setTimeout(applyComplianceFlow, 120);
    }
  }, true);
  applyComplianceFlow();
}
