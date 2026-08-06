import { $, $$, state } from './common.js';

export const ENTERPRISE_PROCESS_CATALOG = Object.freeze({
  monitoring: Object.freeze({ code: 'RN-01', name: 'Monitoraggio normativo' }),
  incidents: Object.freeze({ code: 'EC-01', name: 'Gestione eventi e segnalazioni' }),
  evidence: Object.freeze({ code: 'EV-01', name: 'Evidenze e controlli' }),
  identity: Object.freeze({ code: 'IA-01', name: 'Identità e accessi' }),
  ai: Object.freeze({ code: 'GA-01', name: 'Governo dei servizi AI' })
});

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

function label(process) {
  return `${process.code} · ${process.name}`;
}

function setText(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}

function markSurface(root, process) {
  if (!root) return;
  root.dataset.processCode = process.code;
  root.dataset.processName = process.name;
}

function normalizeHomeProcesses() {
  const monitoring = $('.process-lane[data-lane="monitoring"]');
  const incidents = $('.process-lane[data-lane="incidents"]');
  const monitoringProcess = ENTERPRISE_PROCESS_CATALOG.monitoring;
  const incidentProcess = ENTERPRISE_PROCESS_CATALOG.incidents;

  if (monitoring) {
    monitoring.dataset.processCode = monitoringProcess.code;
    monitoring.dataset.processName = monitoringProcess.name;
    setText(monitoring.querySelector(':scope > .eyebrow'), label(monitoringProcess));
    monitoring.setAttribute('aria-label', `${label(monitoringProcess)}. ${monitoring.querySelector('h2')?.textContent || 'Area operativa'}`);
  }
  if (incidents) {
    incidents.dataset.processCode = incidentProcess.code;
    incidents.dataset.processName = incidentProcess.name;
    setText(incidents.querySelector(':scope > .eyebrow'), label(incidentProcess));
    incidents.setAttribute('aria-label', `${label(incidentProcess)}. ${incidents.querySelector('h2')?.textContent || 'Area operativa'}`);
  }

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
  markSurface(monitoring, ENTERPRISE_PROCESS_CATALOG.monitoring);
  markSurface(incidents, ENTERPRISE_PROCESS_CATALOG.incidents);
  markSurface(proof, ENTERPRISE_PROCESS_CATALOG.evidence);
  setText(monitoring?.querySelector('.core-title > .eyebrow'), label(ENTERPRISE_PROCESS_CATALOG.monitoring));
  setText(incidents?.querySelector('.core-title > .eyebrow'), label(ENTERPRISE_PROCESS_CATALOG.incidents));
  setText(proof?.querySelector('.proof-shell .eyebrow, .proof-hero .eyebrow, :scope > .eyebrow'), label(ENTERPRISE_PROCESS_CATALOG.evidence));
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
    const process = ENTERPRISE_PROCESS_CATALOG[processKey];
    if (!process) continue;
    const base = button.textContent.replace(/^[A-Z]{2}-\d{2}\s*[·-]\s*/, '').trim();
    setText(button, `${process.code} · ${base}`);
    button.dataset.processCode = process.code;
    button.setAttribute('aria-label', `${process.code} · ${base}`);
    button.title = `${process.code} · ${process.name}`;
    const { panel } = ownerPanel(dialog, selector);
    if (panel) {
      panel.dataset.processCode = process.code;
      panel.dataset.processName = process.name;
    }
  }
  const current = dialog.querySelector('.admin-section-nav [aria-current="page"][data-admin-target]');
  if (dialog.open && current) enforceSingleAdminSurface(dialog, current.dataset.adminTarget);
}

let scheduled = false;
function applyProcessArchitecture() {
  if (!state.data?.actor || scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    normalizeHomeProcesses();
    normalizeOperationalSurfaces();
    normalizeAdminProcesses();
    document.documentElement.dataset.processCatalog = 'enterprise-2';
  });
}

export function installEnterprise2ProcessArchitecture() {
  document.addEventListener('ictc:rendered', applyProcessArchitecture);
  document.addEventListener('ictc:surface-changed', applyProcessArchitecture);
  document.addEventListener('click', event => {
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
