import { $, $$ } from './common.js';

const DESIGN_SYSTEM_ID = 'ictc-aurora-1';
const MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const SURFACE_META = Object.freeze({
  home: Object.freeze({ accent: 'indigo', label: 'Panoramica' }),
  monitoring: Object.freeze({ accent: 'cyan', label: 'Monitoraggio normativo' }),
  incidents: Object.freeze({ accent: 'amber', label: 'Eventi e segnalazioni' }),
  proof: Object.freeze({ accent: 'violet', label: 'Evidenze e controlli' })
});

const ACTION_PRIORITY = Object.freeze({
  openJobConfig: 'primary',
  openIncident: 'primary',
  openProofDetails: 'primary',
  homeMonitoringAction: 'secondary',
  homeIncidentAction: 'secondary',
  monitoringContributionAction: 'secondary',
  monitoringContext: 'quiet',
  eventsContext: 'quiet',
  openAdminCenter: 'quiet'
});

function prefersReducedMotion() {
  return globalThis.matchMedia?.(MOTION_QUERY).matches === true;
}

function currentSurface() {
  const explicit = document.documentElement.dataset.ictcSurface;
  if (explicit && SURFACE_META[explicit]) return explicit;
  for (const [surface, selector] of Object.entries({
    home: '#homeView', monitoring: '#monitoringView', incidents: '#incidentsView', proof: '#proofView'
  })) {
    const node = $(selector);
    if (node && !node.hidden) return surface;
  }
  return 'home';
}

function setButtonPriority() {
  for (const [id, priority] of Object.entries(ACTION_PRIORITY)) {
    const button = document.getElementById(id);
    if (button) button.dataset.priority = priority;
  }
  for (const card of $$('.mission-card,.incident-card')) {
    const actions = $$('.card-actions button', card).filter(button => !button.hidden);
    actions.forEach((button, index) => {
      if (!button.dataset.priority) button.dataset.priority = index === actions.length - 1 ? 'secondary' : 'quiet';
    });
  }
  for (const footer of $$('dialog footer')) {
    const actions = $$('button', footer).filter(button => !button.hidden);
    actions.forEach((button, index) => {
      if (button.dataset.priority) return;
      const decisive = /accetta|salva|invia|conferma|attiva|registra|chiudi/i.test(button.textContent || '');
      button.dataset.priority = decisive || index === actions.length - 1 ? 'primary' : 'secondary';
    });
  }
}

function statusKey(value) {
  const text = String(value || '').trim().toLowerCase();
  if (/accettat|attiv|coerente|complet|con evidenza|inviato/.test(text)) return 'positive';
  if (/da valutare|da approvare|informazioni richieste|azioni necessarie|da completare/.test(text)) return 'attention';
  if (/esclus|errore|non riuscita|blocc/.test(text)) return 'critical';
  if (/pausa|manuale|sola lettura|non determinato/.test(text)) return 'neutral';
  return 'informative';
}

function normalizeStatuses(root = document) {
  for (const node of $$('.pill,.runtime-status,.origin-tag,.status-badge,[data-status]', root)) {
    node.dataset.tone = statusKey(node.textContent);
  }
}

function decorateCards() {
  const cards = $$('.process-lane,.mission-card,.incident-card,.catalog-card,.proof-answer-grid article,.proof-verdict>div,.readiness-row,.user-row');
  cards.forEach((card, index) => {
    card.dataset.dsCard = 'true';
    card.style.setProperty('--ds-stagger-index', String(index % 8));
  });
}

function normalizeDisclosures() {
  for (const details of $$('details')) {
    details.dataset.dsDisclosure = 'true';
    const summary = details.querySelector(':scope > summary');
    if (!summary || summary.querySelector(':scope > .ds-disclosure-mark')) continue;
    const mark = document.createElement('span');
    mark.className = 'ds-disclosure-mark';
    mark.setAttribute('aria-hidden', 'true');
    summary.append(mark);
  }
}

function normalizeDesignDialogs() {
  for (const dialog of $$('dialog')) {
    dialog.dataset.dsDialog = 'true';
    if (dialog.open && !prefersReducedMotion() && dialog.dataset.dsAnimated !== 'true') {
      dialog.dataset.dsAnimated = 'true';
      dialog.animate([
        { opacity: 0, transform: 'translateY(12px) scale(.985)' },
        { opacity: 1, transform: 'translateY(0) scale(1)' }
      ], { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
  }
}

function applySurfaceIdentity(surface = currentSurface()) {
  const meta = SURFACE_META[surface] || SURFACE_META.home;
  document.documentElement.dataset.dsSurface = surface;
  document.documentElement.dataset.dsAccent = meta.accent;
  const active = document.querySelector('main > section:not([hidden])');
  if (active) {
    active.dataset.dsSurface = surface;
    active.setAttribute('aria-label', active.getAttribute('aria-label') || meta.label);
  }
}

function animateSurface(surface = currentSurface()) {
  if (prefersReducedMotion()) return;
  const selector = { home: '#homeView', monitoring: '#monitoringView', incidents: '#incidentsView', proof: '#proofView' }[surface];
  const view = selector ? $(selector) : null;
  if (!view || view.hidden) return;
  view.getAnimations().forEach(animation => animation.cancel());
  view.animate([
    { opacity: .2, transform: 'translateY(8px)', filter: 'blur(3px)' },
    { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }
  ], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
}

function animateDisclosure(event) {
  const details = event.target.closest?.('details[data-ds-disclosure="true"]');
  if (!details || prefersReducedMotion()) return;
  const body = [...details.children].find(node => node.tagName !== 'SUMMARY');
  if (!body || !details.open) return;
  body.getAnimations().forEach(animation => animation.cancel());
  body.animate([
    { opacity: 0, transform: 'translateY(-5px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ], { duration: 180, easing: 'cubic-bezier(.2,.8,.2,1)' });
}

let designScheduled = false;
function renderDesignSystem({ animate = false } = {}) {
  if (designScheduled) return;
  designScheduled = true;
  queueMicrotask(() => {
    designScheduled = false;
    document.documentElement.dataset.designSystem = DESIGN_SYSTEM_ID;
    document.documentElement.style.colorScheme = 'light dark';
    setButtonPriority();
    normalizeStatuses();
    decorateCards();
    normalizeDisclosures();
    normalizeDesignDialogs();
    const surface = currentSurface();
    applySurfaceIdentity(surface);
    if (animate) animateSurface(surface);
    document.dispatchEvent(new CustomEvent('ictc:design-system-ready', {
      detail: { id: DESIGN_SYSTEM_ID, surface }
    }));
  });
}

export function installEnterprise2DesignSystem() {
  document.addEventListener('ictc:rendered', () => renderDesignSystem());
  document.addEventListener('ictc:surface-changed', () => renderDesignSystem({ animate: true }));
  document.addEventListener('toggle', animateDisclosure, true);
  document.addEventListener('click', event => {
    if (event.target.closest('button,[role="button"],a[href]')) {
      document.documentElement.dataset.dsInput = 'pointer';
    }
    if (event.target.closest('#openAdminCenter,[data-open-plan],[data-open-source],[data-open-incident],#openProofDetails')) {
      requestAnimationFrame(() => normalizeDesignDialogs());
    }
  }, true);
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab') document.documentElement.dataset.dsInput = 'keyboard';
  }, true);
  renderDesignSystem();
}
