import { $, esc, S, status } from './core.js';
import { chooseInitialLayer, deriveProjectionStack } from './projection-layer-model.js';

const PREFERENCE_KEY = 'ictc:ux-preferences:v1';
const defaults = { text: 'default', density: 'comfortable', contrast: 'system', motion: 'system' };
let activeLayer = null;
let lastStack = null;

const icon = value => ({
  'attention-required': '!',
  'awaiting-human-review': '?',
  'human-owned': 'R',
  verified: '✓',
  failed: '×',
  unavailable: '–',
  observed: '·'
}[value] || '·');

function readPreferences() {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(PREFERENCE_KEY) || '{}') }; }
  catch { return { ...defaults }; }
}

function writePreferences(value) {
  localStorage.setItem(PREFERENCE_KEY, JSON.stringify(value));
}

function announce(message) {
  let region = $('#ux-announcer');
  if (!region) {
    region = document.createElement('div');
    region.id = 'ux-announcer';
    region.className = 'ux-sr-only';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    document.body.append(region);
  }
  region.textContent = '';
  requestAnimationFrame(() => { region.textContent = message; });
}

function applyPreferences(preferences, announceChange = false) {
  const root = document.documentElement;
  root.dataset.uxText = preferences.text;
  root.dataset.uxDensity = preferences.density;
  root.dataset.uxContrast = preferences.contrast;
  root.dataset.uxMotion = preferences.motion;
  if (preferences.motion === 'reduced') document.body.classList.add('motion-reduced');
  else if (preferences.motion === 'system') document.body.classList.toggle('motion-reduced', matchMedia('(prefers-reduced-motion: reduce)').matches);
  else document.body.classList.remove('motion-reduced');
  if (announceChange) announce('Preferenze di accessibilità e comfort aggiornate.');
}

function cycle(current, values) {
  const position = Math.max(0, values.indexOf(current));
  return values[(position + 1) % values.length];
}

function preferenceButton(name, label, value) {
  return `<button type="button" class="ux-preference" data-ux-preference="${name}" aria-pressed="${value !== defaults[name]}"><span>${esc(label)}</span><small>${esc(value)}</small></button>`;
}

function mountToolbar() {
  if ($('#ux-preferences')) return;
  const preferences = readPreferences();
  applyPreferences(preferences);
  const toolbar = document.createElement('div');
  toolbar.id = 'ux-preferences';
  toolbar.className = 'ux-preferences';
  toolbar.setAttribute('role', 'group');
  toolbar.setAttribute('aria-label', 'Accessibilità e comfort');
  toolbar.innerHTML = `<button type="button" class="ux-preference ux-preference-home" aria-label="Apri preferenze di accessibilità e comfort" aria-keyshortcuts="Alt+U" aria-expanded="false"><span aria-hidden="true">Aa</span><small>Comfort</small></button><div class="ux-preference-panel" hidden>${preferenceButton('text', 'Testo', preferences.text)}${preferenceButton('density', 'Densità', preferences.density)}${preferenceButton('contrast', 'Contrasto', preferences.contrast)}${preferenceButton('motion', 'Movimento', preferences.motion)}<p>Preferenze locali del browser. Non modificano dati o stati ICTC.</p></div>`;
  const top = document.querySelector('.top');
  if (top) top.insertBefore(toolbar, top.querySelector('#addSource'));
  else document.body.prepend(toolbar);

  const home = toolbar.querySelector('.ux-preference-home');
  const panel = toolbar.querySelector('.ux-preference-panel');
  home.addEventListener('click', () => {
    const expanded = home.getAttribute('aria-expanded') === 'true';
    home.setAttribute('aria-expanded', String(!expanded));
    panel.hidden = expanded;
    if (!expanded) panel.querySelector('button')?.focus();
  });

  toolbar.addEventListener('click', event => {
    const button = event.target.closest?.('[data-ux-preference]');
    if (!button) return;
    const current = readPreferences();
    const name = button.dataset.uxPreference;
    const values = {
      text: ['default', 'large', 'xlarge'],
      density: ['comfortable', 'compact', 'spacious'],
      contrast: ['system', 'high'],
      motion: ['system', 'reduced', 'full']
    }[name];
    current[name] = cycle(current[name], values);
    writePreferences(current);
    applyPreferences(current, true);
    button.querySelector('small').textContent = current[name];
    button.setAttribute('aria-pressed', String(current[name] !== defaults[name]));
  });

  document.addEventListener('keydown', event => {
    if (event.altKey && event.key.toLowerCase() === 'u') {
      event.preventDefault();
      home.focus();
      announce('Preferenze di accessibilità e comfort disponibili.');
    }
  });
}

function stageTab(stage, selected) {
  const metric = stage.metric?.value === null || stage.metric?.value === undefined ? '—' : stage.metric.value;
  return `<button type="button" class="ux-projection-select" role="tab" data-ux-stage="${esc(stage.id)}" data-status="${esc(stage.epistemicStatus)}" ${selected ? 'data-selected="true"' : ''} aria-selected="${selected}" aria-controls="${esc(stage.id)}-panel" id="${esc(stage.id)}-tab" tabindex="${selected ? '0' : '-1'}">
    <span class="ux-status-symbol" aria-hidden="true">${icon(stage.epistemicStatus)}</span>
    <span><b>${esc(stage.label)}</b><small>${esc(status[stage.epistemicStatus] || stage.epistemicStatus)}</small></span>
    <strong>${esc(metric)}</strong>
  </button>`;
}

function stagePanel(stage, selected) {
  const limits = stage.limitations.map(item => `<li>${esc(item)}</li>`).join('');
  const inputs = stage.inputs.map(item => `<li><code>${esc(item.id)}</code></li>`).join('');
  return `<article class="ux-projection-panel" role="tabpanel" data-ux-stage-panel="${esc(stage.id)}" id="${esc(stage.id)}-panel" aria-labelledby="${esc(stage.id)}-tab" ${selected ? '' : 'hidden'}>
    <p class="ux-projection-statement">${esc(stage.statement)}</p>
    <p><b>Prossima azione:</b> ${esc(stage.nextAction)}</p>
    <button type="button" class="ux-open-target" data-ux-target="${esc(stage.target.value)}">Apri ${esc(stage.label.toLowerCase())}</button>
    <details><summary>Origine, limiti e significato</summary><div class="ux-projection-detail"><p><b>Produttore:</b> ${esc(stage.producer.id)}</p><p>${esc(stage.detail)}</p><b>Input runtime</b><ul>${inputs}</ul><b>Non conclude</b><ul>${limits}</ul></div></details>
  </article>`;
}
function renderProjectionStack() {
  const main = $('#main');
  if (!main || !S.data) return;
  main.querySelector('#ux-projection-stack')?.remove();
  lastStack = deriveProjectionStack(S.data, S.view, $('#lens')?.value || 'everyday');
  if (!activeLayer || !lastStack.stages.some(stage => stage.id === activeLayer)) activeLayer = chooseInitialLayer(lastStack);
  const section = document.createElement('section');
  section.id = 'ux-projection-stack';
  section.className = 'ux-projection-stack';
  section.setAttribute('aria-labelledby', 'ux-projection-title');
  section.setAttribute('aria-describedby', 'ux-projection-boundary');
  section.innerHTML = `<header class="ux-projection-header"><div><span class="eyebrow">Proiezione SOT</span><h2 id="ux-projection-title">Dove serve attenzione, decisione o prova?</h2><p id="ux-projection-boundary">Quattro compressioni derivate dal bootstrap corrente. Non sono punteggi e non aggiungono conclusioni.</p></div><span class="ux-layer-badge">4 livelli · 1 azione alla volta</span></header><div class="ux-projection-tabs" role="tablist" aria-label="Livelli della proiezione">${lastStack.stages.map(stage => stageTab(stage, stage.id === activeLayer)).join('')}</div><div class="ux-projection-panels">${lastStack.stages.map(stage => stagePanel(stage, stage.id === activeLayer)).join('')}</div><footer><details><summary>Confine della rappresentazione</summary><ul>${lastStack.limitations.map(item => `<li>${esc(item)}</li>`).join('')}</ul></details></footer>`;
  const frames = main.querySelector('#ictc-action-frames');
  const head = main.querySelector('.page-head');
  if (frames) frames.insertAdjacentElement('beforebegin', section);
  else if (head) head.insertAdjacentElement('afterend', section);
  else main.prepend(section);
}

function selectLayer(id, focus = false) {
  activeLayer = id;
  document.querySelectorAll('.ux-projection-select').forEach(tab => {
    const selected = tab.dataset.uxStage === id;
    if (selected) tab.setAttribute('data-selected', 'true'); else tab.removeAttribute('data-selected');
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focus) tab.focus();
  });
  document.querySelectorAll('[data-ux-stage-panel]').forEach(panel => {
    panel.hidden = panel.dataset.uxStagePanel !== id;
  });
  const stage = lastStack?.stages.find(item => item.id === id);
  if (stage) announce(`${stage.label}. ${status[stage.epistemicStatus] || stage.epistemicStatus}. ${stage.statement}`);
}

function requestNavigation(view) {
  const nav = document.querySelector(`nav [data-view="${CSS.escape(view)}"]`);
  if (nav) nav.click();
  else {
    S.view = view;
    document.dispatchEvent(new CustomEvent('ictc:navigate-request', { detail: { view } }));
  }
  requestAnimationFrame(() => $('#main h1')?.focus({ preventScroll: false }));
}

function bindProjectionInteractions() {
  document.addEventListener('click', event => {
    const tab = event.target.closest?.('.ux-projection-select');
    if (tab) return selectLayer(tab.dataset.uxStage);
    const target = event.target.closest?.('[data-ux-target]');
    if (target) requestNavigation(target.dataset.uxTarget);
  });
  document.addEventListener('keydown', event => {
    const tab = event.target.closest?.('.ux-projection-select');
    if (!tab || !['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    const tabs = [...document.querySelectorAll('.ux-projection-select')];
    const index = tabs.indexOf(tab);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    event.preventDefault();
    selectLayer(tabs[next].dataset.uxStage, true);
  });
}

function enhanceDocumentSemantics() {
  const nav = document.querySelector('nav');
  if (nav && !nav.id) nav.id = 'primary-navigation';
  const main = $('#main');
  if (main) main.setAttribute('aria-busy', 'false');
  document.querySelectorAll('button, [role="button"], summary, input:not([type="hidden"]), select').forEach(control => control.classList.add('ux-target-size'));
  document.querySelectorAll('.page-head h1').forEach(heading => heading.setAttribute('tabindex', '-1'));
}

export function mountAdvancedUx() {
  if (document.documentElement.dataset.advancedUxMounted === 'true') return;
  document.documentElement.dataset.advancedUxMounted = 'true';
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'advanced-ux.css';
  document.head.append(link);
  mountToolbar();
  bindProjectionInteractions();
  document.addEventListener('ictc:rendered', () => {
    enhanceDocumentSemantics();
    renderProjectionStack();
    document.documentElement.dataset.uxReady = 'true';
  });
  enhanceDocumentSemantics();
  renderProjectionStack();
}
