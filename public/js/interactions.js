import { $, $$, esc, status, matterStates, matterNames, S, api } from './core.js';
import { go, render, openDialog, closeDialog, openObject, renderDetail, mutate } from './render.js';
import { withActionCheckpoint } from './action-frame-ui.js';

const file64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(',')[1]);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

async function source(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const file = form.get('file');
  const payload = { title: form.get('title'), notes: form.get('notes') };
  if (S.sourceMode === 'file' && file?.size) {
    payload.fileName = file.name;
    payload.contentBase64 = await file64(file);
  } else payload.url = form.get('url');
  const result = await withActionCheckpoint('source-propose', {
    title: 'Salvare come fonte candidata?',
    detail: `Titolo: ${payload.title || payload.fileName || payload.url || 'non disponibile'}`,
    consequence: 'La fonte resta candidata e richiede review umana prima di entrare nel perimetro attivo.'
  }, () => mutate('/api/sources', payload, 'Nuova fonte'));
  if (!result) return;
  $('#sourceOutput').textContent = `Candidata ${result.source.id}; review ancora necessaria.`;
  event.currentTarget.reset();
}

async function matter(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const payload = { title: form.get('title'), kind: form.get('kind'), summary: form.get('summary') };
  const result = await withActionCheckpoint('matter-create', {
    title: 'Creare il caso da questo racconto?',
    detail: `Tipo iniziale dichiarato: ${payload.kind}`,
    consequence: 'Il racconto viene conservato; owner e classificazione restano da confermare.'
  }, () => mutate('/api/matters', payload, 'Nuovo evento'));
  if (!result) return;
  event.currentTarget.reset();
  closeDialog('matterDialog');
}

async function decision(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const payload = { outcome: form.get('outcome'), rationale: form.get('rationale') };
  const result = await withActionCheckpoint('change-decision', {
    title: 'Registrare questa decisione d’impatto?',
    detail: `Esito: ${payload.outcome}`,
    consequence: 'La motivazione e l’esito determinano il prossimo stato della change story.'
  }, () => mutate(`/api/changes/${form.get('id')}/decide`, payload, 'Decisione'));
  if (result) closeDialog('decisionDialog');
}

async function control(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const payload = { controlId: form.get('controlId'), rationale: form.get('rationale') };
  const result = await withActionCheckpoint('control-map', {
    title: 'Registrare questo mapping astratto?',
    detail: `Famiglia: ${payload.controlId}`,
    consequence: 'Viene aggiunta una relazione di copertura; non viene attestata efficacia.'
  }, () => mutate(`/api/changes/${form.get('id')}/map-control`, payload, 'Mapping'));
  if (result) closeDialog('controlDialog');
}

async function ledger() {
  const payload = await api('/api/runtime/ledger');
  $('#ledger').innerHTML = payload.events.length
    ? payload.events.map(event => `<div class="chain-row"><b>${esc(event.type)}</b><code>${esc(event.hash.slice(0, 18))}</code></div>`).join('')
    : '<div class="empty">Nessun evento.</div>';
}

function sourceMode(mode) {
  S.sourceMode = mode;
  $$('[data-source-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.sourceMode === mode)));
  $('#urlField').hidden = mode !== 'link';
  $('#fileField').hidden = mode !== 'file';
}

async function ask(event) {
  event.preventDefault();
  const question = $('#question').value.trim();
  if (!question) return;
  const result = await api('/api/assistant', { method: 'POST', body: JSON.stringify({ sessionId: S.session, objectId: S.selected, question }) });
  $('#messages').insertAdjacentHTML('beforeend', `<article class="message"><b>Tu</b><p>${esc(question)}</p></article><article class="message"><b>ICTC AI · proposta</b><p>${esc(result.answer)}</p><small>${esc(result.limitations.join(' · '))}</small></article>`);
  $('#question').value = '';
  $('#capsule').textContent = `${result.citedItemIds.length} oggetti citati · nessuna write authority`;
}

function search() {
  const query = $('#searchInput').value.toLowerCase();
  const items = Object.values(S.data.objectIndex).filter(item => `${item.label} ${item.statement} ${item.claimClass}`.toLowerCase().includes(query)).slice(0, 12);
  $('#searchResults').innerHTML = items.map(item => `<button class="search-result" data-result="${item.id}"><b>${esc(item.label)}</b><small>${esc(status[item.epistemicStatus])}</small></button>`).join('') || '<div class="empty">Nessun risultato.</div>';
  $$('[data-result]').forEach(button => button.onclick = () => { closeDialog('searchDialog'); openObject(button.dataset.result); });
}

export function wireDynamic() {
  $$('[data-view]', $('#main')).forEach(button => button.onclick = () => go(button.dataset.view));
  $$('[data-object]').forEach(button => {
    button.onclick = () => openObject(button.dataset.object);
    button.onkeydown = event => {
      if ((event.key === 'Enter' || event.key === ' ') && button.classList.contains('node')) {
        event.preventDefault();
        openObject(button.dataset.object);
      }
    };
  });
  $$('[data-open]').forEach(button => button.onclick = () => openDialog(button.dataset.open, button));
  $$('[data-journey]').forEach(button => button.onclick = () => { S.journey = button.dataset.journey; S.scene = 0; S.view = 'journeys'; render(); });
  $$('[data-scene]').forEach(button => button.onclick = () => { S.scene += Number(button.dataset.scene); render(); });
  $$('[data-scene-action]').forEach(button => button.onclick = () => /fonte|form/i.test(button.dataset.sceneAction) ? openDialog('sourceDialog', button) : /caso/i.test(button.dataset.sceneAction) ? openDialog('matterDialog', button) : go(button.dataset.target));
  $$('[data-source]').forEach(button => button.onclick = () => withActionCheckpoint('source-review', {
    title: button.dataset.outcome === 'accepted' ? 'Includere questa fonte?' : 'Escludere questa fonte?',
    detail: `Esito scelto: ${button.dataset.outcome}`,
    consequence: 'La review modifica il lifecycle locale della fonte e produce una receipt.'
  }, () => mutate(`/api/sources/${button.dataset.source}/review`, { outcome: button.dataset.outcome }, 'Review fonte')));
  $$('[data-finding]').forEach(button => button.onclick = () => withActionCheckpoint('finding-review', {
    title: button.dataset.outcome === 'relevant' ? 'Registrare la differenza come rilevante?' : 'Registrare la differenza come non rilevante?',
    detail: `Esito scelto: ${button.dataset.outcome}`,
    consequence: button.dataset.outcome === 'relevant' ? 'La review apre una change story da decidere.' : 'La review viene conservata senza aprire una change story.'
  }, () => mutate(`/api/findings/${button.dataset.finding}/review`, { outcome: button.dataset.outcome }, 'Review differenza')));
  $$('[data-job]').forEach(button => button.onclick = () => withActionCheckpoint('job-run', {
    title: 'Eseguire lo scouting simulato?',
    detail: `Differenza simulata: ${button.dataset.changed === 'true' ? 'sì' : 'no'}`,
    consequence: 'Il job registra un esito locale; non effettua acquisizioni remote.'
  }, () => mutate(`/api/jobs/${button.dataset.job}/run`, { changed: button.dataset.changed === 'true' }, 'Scouting')));
  $$('[data-decision]').forEach(button => button.onclick = () => { $('#decisionForm').elements.id.value = button.dataset.decision; openDialog('decisionDialog', button); });
  $$('[data-control]').forEach(button => button.onclick = () => { $('#controlForm').elements.id.value = button.dataset.control; openDialog('controlDialog', button); });
  $$('[data-owner]').forEach(button => button.onclick = async () => {
    const item = S.data.matters.find(value => value.id === button.dataset.owner);
    await withActionCheckpoint('matter-owner', {
      title: 'Confermare owner e RACI?',
      detail: `Owner proposto: ${item.owner}`,
      consequence: 'Owner, Accountable e Responsible diventano una decisione umana registrata.'
    }, () => mutate(`/api/matters/${item.id}/confirm-owner`, { owner: item.owner, raci: item.raci }, 'Responsabilità'));
  });
  $$('[data-transition]').forEach(button => button.onclick = async () => {
    const item = S.data.matters.find(value => value.id === button.dataset.transition);
    const target = matterStates[matterStates.indexOf(item.state) + 1];
    await withActionCheckpoint('matter-transition', {
      title: 'Avanzare il caso?',
      before: matterNames[item.state] || item.state,
      after: matterNames[target] || target,
      detail: `${matterNames[item.state] || item.state} → ${matterNames[target] || target}`,
      consequence: 'La timeline registra una sola transizione consentita.'
    }, () => mutate(`/api/matters/${item.id}/transition`, { to: target }, 'Transizione'));
  });
  $$('[data-trace]').forEach(button => button.onclick = () => { S.trace = button.dataset.trace; render(); });
  $('#ledgerLoad')?.addEventListener('click', ledger);
}

export function bind() {
  $$('nav [data-view],.brand').forEach(button => button.onclick = () => go(button.dataset.view));
  $('#menu').onclick = () => $('#shell').classList.toggle('menu');
  $('#addSource').onclick = event => openDialog('sourceDialog', event.currentTarget);
  $('#addMatter').onclick = event => openDialog('matterDialog', event.currentTarget);
  $('#aiOpen').onclick = () => { $('#shell').classList.add('ai'); $('#aiOpen').setAttribute('aria-expanded', 'true'); $('#question').focus(); };
  $('#aiClose').onclick = () => { $('#shell').classList.remove('ai'); $('#aiOpen').setAttribute('aria-expanded', 'false'); $('#aiOpen').focus(); };
  $$('[data-close]').forEach(button => button.onclick = () => closeDialog(button.dataset.close));
  $$('[data-tab]').forEach(button => button.onclick = () => { S.tab = button.dataset.tab; renderDetail(); });
  $$('[data-source-mode]').forEach(button => button.onclick = () => sourceMode(button.dataset.sourceMode));
  $('#sourceForm').onsubmit = source;
  $('#matterForm').onsubmit = matter;
  $('#decisionForm').onsubmit = decision;
  $('#controlForm').onsubmit = control;
  $('#aiForm').onsubmit = ask;
  $('#searchOpen').onclick = event => { openDialog('searchDialog', event.currentTarget); $('#searchInput').focus(); };
  $('#searchInput').oninput = search;
  window.onkeydown = event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); $('#searchOpen').click(); }
    if (event.key === 'Escape' && $('#shell').classList.contains('ai')) $('#aiClose').click();
  };
  window.onpopstate = () => { S.view = location.hash.slice(1) || 'home'; render(); };
  sourceMode('link');
  document.addEventListener('ictc:rendered', wireDynamic);
}
