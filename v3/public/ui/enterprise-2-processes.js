import { $, $$, esc, state } from './common.js';

const DISCLOSURE_COPY = Object.freeze({
  admin: Object.freeze({
    method: 'Passaggi, checkpoint e responsabilità operative',
    proof: 'Controlli, tracce, accessi e limiti dichiarati'
  }),
  user: Object.freeze({
    method: 'Istruzioni per registrare fatti e contribuire',
    proof: 'Tracce disponibili e limiti dell’assistenza'
  }),
  auditor: Object.freeze({
    method: 'Criteri di lettura e ricostruzione delle attività',
    proof: 'Origine, versioni, accesso e limiti della prova'
  })
});

const ADMIN_PROCESS = Object.freeze({
  '.admin-proof-panel': 'evidence',
  '[data-admin-section="stato-dei-controlli"]': 'evidence',
  '[data-admin-section="azioni-richieste"]': 'evidence',
  '[data-admin-section="utilizzo-ai"]': 'ai',
  '[data-admin-section="governance-ai"]': 'ai',
  '[data-identity-admin]': 'identity',
  '[data-enterprise2-local-users]': 'identity'
});

function role() {
  return state.data?.actor?.role || state.role || 'user';
}

function processCatalog() {
  return state.data?.ontology?.processes || {};
}

function processTerm(id) {
  return processCatalog()[id] || null;
}

function label(process) {
  return process?.code ? `${process.code} · ${process.label}` : process?.label || '';
}

function setText(node, value) {
  if (node && value && node.textContent !== value) node.textContent = value;
}

function markSurface(root, process) {
  if (!root || !process) return;
  if (process.code) root.dataset.processCode = process.code;
  root.dataset.processName = process.label;
}

function legacyProcedureIds(id) {
  if (id === 'monitoring') return { title: 'homeMonitoringTitle', copy: 'homeMonitoringCopy', status: 'homeMonitoringStatus', action: 'homeMonitoringAction' };
  if (id === 'incidents') return { title: 'homeIncidentTitle', copy: 'homeIncidentCopy', status: 'homeIncidentStatus', action: 'homeIncidentAction' };
  return { title: '', copy: '', status: '', action: '' };
}

function procedureMetrics(item) {
  const values = Array.isArray(item.metrics) ? item.metrics.slice(0, 2) : [];
  if (!values.length) values.push({ value: item.attentionCount || 0, label: 'elementi da approfondire' });
  return values.map(metric => `<b>${esc(metric.value)}</b><span>${esc(metric.label)}</span>`).join('');
}

function procedureAction(item, ids) {
  const common = `class="secondary" type="button"${ids.action ? ` id="${ids.action}"` : ''}`;
  if (item.action === 'open-administration') return `<button ${common} data-procedure-admin="true">${esc(item.actionLabel)}</button>`;
  return `<button ${common} data-service="${esc(item.service || 'home')}">${esc(item.actionLabel)}</button>`;
}

function procedureCard(item) {
  const ids = legacyProcedureIds(item.id);
  const code = item.code ? `${esc(item.code)} · ` : '';
  return `<article class="process-lane" data-lane="${esc(item.id)}" data-procedure-id="${esc(item.id)}" data-procedure-state="${esc(item.state)}" data-read-only="${item.readOnly ? 'true' : 'false'}"${item.code ? ` data-process-code="${esc(item.code)}"` : ''} data-process-name="${esc(item.label)}">
    <p class="eyebrow">${code}${esc(item.label)}</p>
    <h2${ids.title ? ` id="${ids.title}"` : ''}>${esc(item.label)}</h2>
    <p${ids.copy ? ` id="${ids.copy}"` : ''}>${esc(item.description)}</p>
    <div class="lane-status"${ids.status ? ` id="${ids.status}"` : ''}>${procedureMetrics(item)}</div>
    ${procedureAction(item, ids)}
  </article>`;
}

function renderProcedureHub() {
  const host = $('.process-lanes');
  if (!host) return false;
  if (host.id === 'procedureHub' && host.dataset.procedureHub === 'semantic-workspace-closure-3-2-1') {
    host.dataset.enterprise2Processes = 'compatibility-observer';
    setText($('.workbench-home-rule'), 'Le procedure disponibili derivano dal ruolo e dallo stato corrente. La priorità suggerita resta una sola.');
    return true;
  }
  const procedures = state.data?.procedures;
  if (!Array.isArray(procedures) || !procedures.length) return false;
  const signature = JSON.stringify(procedures.map(item => [item.id, item.state, item.attentionCount, item.metrics, item.actionLabel, item.description]));
  if (host.dataset.procedureSignature !== signature) {
    host.innerHTML = procedures.map(procedureCard).join('');
    host.dataset.procedureSignature = signature;
  }
  host.dataset.procedureHub = 'server-derived';
  host.setAttribute('aria-label', 'Procedure ICTC disponibili');
  setText($('.workbench-home-rule'), 'Le procedure disponibili derivano dal ruolo e dallo stato corrente. La priorità suggerita resta una sola.');
  return true;
}

function normalizeHomeProcesses() {
  const projected = renderProcedureHub();
  const monitoring = $('.process-lane[data-lane="monitoring"]');
  const incidents = $('.process-lane[data-lane="incidents"]');
  const monitoringProcess = processTerm('monitoring');
  const incidentProcess = processTerm('incidents');

  if (!projected && monitoring && monitoringProcess) {
    monitoring.dataset.processCode = monitoringProcess.code;
    monitoring.dataset.processName = monitoringProcess.label;
    setText(monitoring.querySelector(':scope > .eyebrow'), label(monitoringProcess));
  }
  if (!projected && incidents && incidentProcess) {
    incidents.dataset.processCode = incidentProcess.code;
    incidents.dataset.processName = incidentProcess.label;
    setText(incidents.querySelector(':scope > .eyebrow'), label(incidentProcess));
  }
  if (monitoring && monitoringProcess) monitoring.setAttribute('aria-label', `${monitoring.dataset.processCode || monitoringProcess.code} · ${monitoring.dataset.processName || monitoringProcess.label}. ${monitoring.querySelector('h2')?.textContent || 'Area operativa'}`);
  if (incidents && incidentProcess) incidents.setAttribute('aria-label', `${incidents.dataset.processCode || incidentProcess.code} · ${incidents.dataset.processName || incidentProcess.label}. ${incidents.querySelector('h2')?.textContent || 'Area operativa'}`);

  const stack = $('.home-disclosure-stack');
  if (!stack) return;
  const activeRole = role();
  const copy = DISCLOSURE_COPY[activeRole] || DISCLOSURE_COPY.user;
  const method = stack.querySelector('[data-home-disclosure="method"]');
  const proof = stack.querySelector('[data-home-disclosure="proof"]');
  setText(method?.querySelector('summary small'), copy.method);
  setText(proof?.querySelector('summary small'), copy.proof);

  const order = activeRole === 'auditor' ? [proof, method] : [method, proof];
  for (const disclosure of order) if (disclosure) stack.append(disclosure);
  stack.dataset.disclosureProfile = activeRole;

  for (const disclosure of [method, proof]) {
    if (!disclosure || disclosure.dataset.processDisclosureBound === 'true') continue;
    disclosure.dataset.processDisclosureBound = 'true';
    disclosure.open = false;
    disclosure.addEventListener('toggle', event => {
      if (event.isTrusted) disclosure.dataset.userState = disclosure.open ? 'open' : 'closed';
    });
  }
}

function normalizeOperationalSurfaces() {
  const monitoring = $('#monitoringView');
  const incidents = $('#incidentsView');
  const proof = $('#proofView');
  const monitoringProcess = processTerm('monitoring');
  const incidentProcess = processTerm('incidents');
  const evidenceProcess = processTerm('evidence');
  markSurface(monitoring, monitoringProcess);
  markSurface(incidents, incidentProcess);
  markSurface(proof, evidenceProcess);
  setText(monitoring?.querySelector('.core-title > .eyebrow'), label(monitoringProcess));
  setText(incidents?.querySelector('.core-title > .eyebrow'), label(incidentProcess));
  setText(proof?.querySelector('.proof-shell .eyebrow, .proof-hero .eyebrow, :scope > .eyebrow'), label(evidenceProcess));
}

function directAdminPanels(grid) {
  return [...(grid?.children || [])].filter(node => node.classList.contains('admin-panel'));
}

function ownerPanel(dialog, selector) {
  const target = dialog?.querySelector(selector);
  if (!target) return { target: null, panel: null };
  const panel = target.classList.contains('admin-panel') ? target : target.closest('.admin-panel');
  return { target, panel };
}

function enforceSingleAdminSurface(dialog, selector) {
  const grid = dialog?.querySelector('.admin-grid');
  const { target, panel } = ownerPanel(dialog, selector);
  if (!grid || !target || !panel || panel.parentElement !== grid) return false;
  for (const candidate of directAdminPanels(grid)) candidate.hidden = candidate !== panel;
  panel.hidden = false;
  const disclosure = target.matches('details') ? target : panel.querySelector(':scope > .admin-disclosure');
  if (disclosure) disclosure.open = true;
  dialog.dataset.activeAdminSection = selector;
  return true;
}

function normalizeAdminProcesses() {
  const dialog = $('#adminCenter');
  if (!dialog) return;
  for (const button of $$('.admin-section-nav [data-admin-target]', dialog)) {
    const selector = button.dataset.adminTarget;
    const processKey = ADMIN_PROCESS[selector];
    const process = processTerm(processKey);
    if (!process) continue;
    const base = button.textContent.replace(/^[A-Z]{2}-\d{2}\s*[·-]\s*/, '').trim();
    setText(button, `${process.code} · ${base}`);
    button.dataset.processCode = process.code;
    button.setAttribute('aria-label', `${process.code} · ${base}`);
    button.title = `${process.code} · ${process.label}`;
    const { panel } = ownerPanel(dialog, selector);
    if (panel) {
      panel.dataset.processCode = process.code;
      panel.dataset.processName = process.label;
    }
  }
  const current = dialog.querySelector('.admin-section-nav [aria-current="page"][data-admin-target]');
  if (dialog.open && current) enforceSingleAdminSurface(dialog, current.dataset.adminTarget);
}

let scheduled = false;
function applyProcessArchitecture() {
  if (!state.data?.actor || !state.data?.ontology || scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    normalizeHomeProcesses();
    normalizeOperationalSurfaces();
    normalizeAdminProcesses();
    document.documentElement.dataset.processCatalog = 'enterprise-2';
    document.documentElement.dataset.ontologyAuthority = state.data.ontology.authority || 'runtime';
  });
}

export function installEnterprise2ProcessArchitecture() {
  document.addEventListener('ictc:rendered', applyProcessArchitecture);
  document.addEventListener('ictc:surface-changed', applyProcessArchitecture);
  document.addEventListener('click', event => {
    const adminProcedure = event.target.closest('[data-procedure-admin]');
    if (adminProcedure) {
      event.preventDefault();
      $('#openAdminCenter')?.click();
      setTimeout(applyProcessArchitecture, 0);
      setTimeout(applyProcessArchitecture, 300);
      return;
    }
    const adminTarget = event.target.closest('#adminCenter .admin-section-nav [data-admin-target]');
    if (adminTarget) {
      const dialog = adminTarget.closest('#adminCenter');
      queueMicrotask(() => {
        enforceSingleAdminSurface(dialog, adminTarget.dataset.adminTarget);
        normalizeAdminProcesses();
      });
      return;
    }
    if (event.target.closest('#openAdminCenter, [data-proof-service], [data-service]')) {
      setTimeout(applyProcessArchitecture, 0);
      setTimeout(applyProcessArchitecture, 300);
    }
  }, true);
  if (state.data?.actor) applyProcessArchitecture();
}
