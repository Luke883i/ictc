import { $, $$, state, storageSet } from './common.js';

const surfaces = Object.freeze({
  home: '#homeView',
  monitoring: '#monitoringView',
  incidents: '#incidentsView',
  proof: '#proofView'
});
let navigationEpoch = 0;

function normalizeSurface(value) {
  return Object.hasOwn(surfaces, value) ? value : 'home';
}

export function renderSurfaceNavigation() {
  const active = normalizeSurface(state.service);
  state.service = active;
  for (const [surface, selector] of Object.entries(surfaces)) {
    const view = $(selector);
    if (view) view.hidden = surface !== active;
  }
  $$('[data-service]').forEach(button => {
    button.setAttribute('aria-current', button.dataset.service === active ? 'page' : 'false');
  });
  $$('[data-proof-service]').forEach(button => {
    button.setAttribute('aria-current', active === 'proof' ? 'page' : 'false');
  });
  document.documentElement.dataset.ictcSurface = active;
  return active;
}

export function navigateSurface(value, { focus = true, focusTarget = null } = {}) {
  const active = normalizeSurface(value);
  navigationEpoch += 1;
  const epoch = navigationEpoch;
  state.service = active;
  storageSet('ictc-service', active);
  renderSurfaceNavigation();
  document.dispatchEvent(new CustomEvent('ictc:surface-changed', { detail: { surface: active } }));
  if (!focus) return active;
  const targetSelector = focusTarget || surfaces[active] || '#main';
  const focusCurrent = () => {
    if (epoch !== navigationEpoch || state.service !== active) return;
    const target = $(targetSelector);
    if (!target || target.hidden) return;
    target.focus({ preventScroll: false });
  };
  focusCurrent();
  queueMicrotask(focusCurrent);
  requestAnimationFrame(focusCurrent);
  return active;
}

export function installSurfaceRouter() {
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-service],[data-proof-service]');
    if (!trigger) return;
    const surface = trigger.dataset.service || trigger.dataset.proofService;
    event.preventDefault();
    event.stopImmediatePropagation();
    navigateSurface(surface);
  }, true);
  document.addEventListener('ictc:rendered', renderSurfaceNavigation);
  renderSurfaceNavigation();
}
