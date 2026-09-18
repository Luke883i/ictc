import { $, $$, state, storageSet } from './common.js';
import { SURFACE_LABELS } from './product-copy.js';

const SURFACES = Object.freeze({
  home: '#homeView',
  processes: '#processesView',
  grc: '#grcView',
  monitoring: '#monitoringView',
  incidents: '#incidentsView',
  proof: '#proofView',
  epistemic: '#epistemicView'
});
const GRC_PROCEDURES = new Set(['objects', 'coverage', 'actions', 'risks', 'assurance']);
const SURFACE_PROCEDURE=Object.freeze({monitoring:'monitoring',incidents:'incidents'});
const BACK_LABELS = Object.freeze({
  home: `Torna a ${SURFACE_LABELS.home}`,
  processes: `Torna a ${SURFACE_LABELS.processes}`,
  proof: `Torna a ${SURFACE_LABELS.proofCompact}`,
  monitoring: 'Torna al monitoraggio',
  incidents: 'Torna agli eventi',
  grc: 'Torna al processo precedente',
  epistemic: 'Torna al Reticolo epistemico'
});

let navigationEpoch = 0;
let installed = false;
let lastRoute = null;

function normalizeSurface(value) {
  return Object.hasOwn(SURFACES, value) ? value : 'home';
}
function normalizeProcedure(value) {
  return GRC_PROCEDURES.has(value) ? value : null;
}
function enabledProcedureSet(){const enabled=state.data?.experience?.procedurePolicy?.enabled;return Array.isArray(enabled)&&enabled.length?new Set(enabled):null;}
function blockedProcedure(route){const enabled=enabledProcedureSet();if(!enabled)return null;const id=route.surface==='grc'?route.procedureId:SURFACE_PROCEDURE[route.surface];return id&&!enabled.has(id)?id:null;}
function storedProcedure() {
  try { return normalizeProcedure(localStorage.getItem('ictc-grc-process')); }
  catch { return null; }
}
function currentProcedure() {
  return normalizeProcedure(state.activeProcessId) || storedProcedure() || 'objects';
}
function routeFor(surface = state.service, procedureId = null) {
  const route = { surface: normalizeSurface(surface) };
  if (route.surface === 'grc') route.procedureId = normalizeProcedure(procedureId) || currentProcedure();
  const blocked=blockedProcedure(route);
  return blocked?{surface:'processes',blockedProcedureId:blocked,reason:'procedure-disabled'}:route;
}
function sameRoute(left, right) {
  return Boolean(left && right && left.surface === right.surface && (left.procedureId || null) === (right.procedureId || null));
}
function routeFromUrl() {
  const url = new URL(location.href);
  const view = url.searchParams.get('view');
  if (!view || !Object.hasOwn(SURFACES, view)) return null;
  const route = { surface: view };
  if (view === 'grc') route.procedureId = normalizeProcedure(url.searchParams.get('procedure')) || 'objects';
  return route;
}
function routeUrl(route) {
  const url = new URL(location.href);
  url.searchParams.set('view', route.surface);
  if (route.surface === 'grc' && route.procedureId) url.searchParams.set('procedure', route.procedureId);
  else url.searchParams.delete('procedure');
  return `${url.pathname}${url.search}${url.hash}`;
}
function applyRoute(route) {
  const next = routeFor(route?.surface, route?.procedureId);
  state.service = next.surface;
  if (next.surface === 'grc') {
    state.activeProcessId = next.procedureId;
    storageSet('ictc-grc-process', next.procedureId);
  }
  storageSet('ictc-service', next.surface);
  lastRoute = next;
  return next;
}
function commitHistory(route, mode = 'push', from = null) {
  if (mode === 'none') return;
  const current = history.state?.ictc ? history.state.route : null;
  if (mode === 'push' && sameRoute(current, route)) return;
  const payload = { ictc: true, route, from: from || history.state?.route || lastRoute || null };
  history[mode === 'replace' ? 'replaceState' : 'pushState'](payload, '', routeUrl(route));
}
function focusSurface(active, targetSelector = null) {
  const epoch = ++navigationEpoch;
  const selector = targetSelector || SURFACES[active] || '#main';
  const focusCurrent = () => {
    if (epoch !== navigationEpoch || state.service !== active) return;
    const target = $(selector);
    if (!target || target.hidden) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: false });
  };
  focusCurrent();
  queueMicrotask(focusCurrent);
  requestAnimationFrame(focusCurrent);
}
function reducedMotion() {
  return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
}
function transitionDirection(from, next, mode) {
  if (mode === 'pop' || (next.surface === 'processes' && from.surface !== 'processes')) return 'back';
  if (from.surface === 'processes' && next.surface !== 'processes') return 'forward';
  return from.surface === next.surface ? 'lateral' : 'cross';
}
function runTransition(update, direction) {
  const root = document.documentElement;
  root.dataset.ictcTransitionDirection = direction;
  if (reducedMotion() || typeof document.startViewTransition !== 'function') {
    update();
    queueMicrotask(() => delete root.dataset.ictcTransitionDirection);
    return null;
  }
  const transition = document.startViewTransition(update);
  Promise.resolve(transition.finished).finally(() => delete root.dataset.ictcTransitionDirection);
  return transition;
}
function focusAfterTransition(transition, surface, targetSelector) {
  if (!transition) {
    focusSurface(surface, targetSelector);
    return;
  }
  Promise.resolve(transition.ready).catch(() => {}).then(() => focusSurface(surface, targetSelector));
}
function guardCurrentRoute(){const requested={surface:normalizeSurface(state.service)};if(requested.surface==='grc')requested.procedureId=normalizeProcedure(state.activeProcessId)||currentProcedure();const next=routeFor(requested.surface,requested.procedureId);if(!sameRoute(requested,next)){const from=lastRoute||requested;applyRoute(next);commitHistory(next,'replace',from);return next;}return requested;}
export function renderSurfaceNavigation() {
  const guarded=guardCurrentRoute(),active = normalizeSurface(guarded.surface);
  state.service = active;
  for (const [surface, selector] of Object.entries(SURFACES)) {
    const view = $(selector);
    if (view) view.hidden = surface !== active;
  }
  $$('.workspace-return').forEach(button => {
    const owner = button.closest('.view');
    if (owner && !owner.hidden) button.setAttribute('data-workspace-return', '');
    else button.removeAttribute('data-workspace-return');
  });
  $$('[data-service]').forEach(button => button.setAttribute('aria-current', button.dataset.service === active ? 'page' : 'false'));
  document.documentElement.dataset.ictcSurface = active;
  document.documentElement.dataset.ictcWorkspace = ['monitoring', 'incidents', 'grc', 'epistemic'].includes(active) ? active : 'none';
  return active;
}
function announceSurfaceChanged(next, from, direction, extra = {}) {
  document.dispatchEvent(new CustomEvent('ictc:surface-changed', {
    detail: {
      surface: next.surface,
      procedureId: next.procedureId || null,
      route: next,
      from,
      direction,
      ...extra
    }
  }));
}
function commitSurfaceNavigation(next, from, direction, extra = {}) {
  return runTransition(() => {
    renderSurfaceNavigation();
    announceSurfaceChanged(next, from, direction, extra);
  }, direction);
}
export function navigateSurface(value, {
  focus = true,
  focusTarget = null,
  historyMode = 'push',
  procedureId = null,
  origin = null
} = {}) {
  const from = routeFor(state.service);
  const next = routeFor(value, procedureId);
  const direction = transitionDirection(from, next, historyMode);
  applyRoute(next);
  commitHistory(next, historyMode, origin || from);
  const transition = commitSurfaceNavigation(next, from, direction,{blockedProcedureId:next.blockedProcedureId||null});
  if (focus) focusAfterTransition(transition, next.surface, focusTarget);
  return next.surface;
}
export function getBackLabel() {
  const from = history.state?.ictc ? history.state.from : null;
  return BACK_LABELS[from?.surface] || `Torna a ${SURFACE_LABELS.processes}`;
}
export function navigateBack() {
  const from = history.state?.ictc ? history.state.from : null;
  if (from && history.length > 1) {
    history.back();
    return from.surface;
  }
  return navigateSurface('processes', { historyMode: 'replace' });
}
function isContextualTrigger(trigger) {
  return trigger.hasAttribute('data-grc-process') || trigger.hasAttribute('data-home-action') || trigger.hasAttribute('data-global-kind');
}
function restoreFromHistory(event) {
  const route = event.state?.ictc ? event.state.route : routeFromUrl();
  if (!route) return;
  const from = routeFor(state.service);
  const next = applyRoute(route);
  const transition = commitSurfaceNavigation(next, from, 'back', { history: 'pop', blockedProcedureId:next.blockedProcedureId||null });
  focusAfterTransition(transition, next.surface, null);
}
export function installSurfaceRouter() {
  if (installed) return;
  installed = true;
  const initial = routeFromUrl() || routeFor(state.service);
  applyRoute(initial);
  commitHistory(initial, 'replace', null);
  window.addEventListener('popstate', restoreFromHistory);
  window.addEventListener('click', event => {
    const back = event.target.closest?.('[data-nav-back]');
    if (back) {
      event.preventDefault();
      event.stopImmediatePropagation();
      navigateBack();
      return;
    }
    const trigger = event.target.closest?.('[data-service]');
    if (!trigger || isContextualTrigger(trigger)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    navigateSurface(trigger.dataset.service);
  }, true);
  document.addEventListener('ictc:rendered', renderSurfaceNavigation);
  renderSurfaceNavigation();
}
