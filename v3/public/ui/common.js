export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
export const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const labels = {
  candidate:'Da verificare', verified:'Verificata', rejected:'Esclusa', superseded:'Superata', planning:'Pianificazione in corso', 'needs-plan':'Pianificazione non riuscita', draft:'Da approvare', active:'Attivo', paused:'In pausa',
  intake:'Registrato', clarifying:'Informazioni richieste', review:'Da approvare', submitted:'Inviato', closed:'Chiuso',
  event:'Evento', 'near-miss':'Quasi incidente', incident:'Incidente', unknown:'Non determinato', yes:'Sì', no:'No'
};
function storageGet(key, fallback) { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } }
export function storageSet(key, value) { try { localStorage.setItem(key, value); } catch {} }
export const state = {
  data:null, service:storageGet('ictc-service','home'), role:storageGet('ictc-role','admin'),
  activeMissionId:null, activeSourceId:null, activeIncidentId:null
};
let toastTimer;

function commandId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `cmd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
function headers(write = false) {
  const values = {'content-type':'application/json','x-ictc-role':state.role,'x-ictc-actor-id':`local-${state.role}`};
  if (write) { values['x-ictc-command-id'] = commandId(); values['x-ictc-expected-revision'] = String(state.data?.revision ?? 0); }
  return values;
}
function syncRevision(body) {
  const revision = Number(body?.receipt?.revision);
  if (!Number.isFinite(revision) || !state.data) return;
  state.data.revision = Math.max(Number(state.data.revision || 0), revision);
  if (state.data.integrity) state.data.integrity.revision = state.data.revision;
}
export async function api(path, options = {}) {
  const write = options.method && options.method !== 'GET';
  const response = await fetch(path, {...options, headers:{...headers(write),...(options.headers || {})}});
  const type = response.headers.get('content-type') || '';
  const body = type.includes('json') ? await response.json().catch(() => ({})) : await response.text();
  if (!response.ok) {
    const error = new Error(body?.error || body || `Errore ${response.status}`); error.code = body?.code; error.details = body?.details; error.status = response.status; throw error;
  }
  if (write) syncRevision(body);
  return body;
}
export function notify(message, error = false) {
  const toast = $('#toast'); toast.textContent = `${error ? 'Errore · ' : ''}${message}`; toast.dataset.visible = 'true'; toast.style.background = error ? '#991b1b' : '#172033';
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.dataset.visible = 'false'; }, 4500);
}
function receiptsFrom(value, out = []) {
  if (!value || typeof value !== 'object') return out;
  if (value.receipt?.hash) out.push(value.receipt);
  for (const item of Object.values(value)) if (item && typeof item === 'object') receiptsFrom(item, out);
  return out;
}
export function showReceipt(value) {
  const receipt = receiptsFrom(value).at(-1); if (!receipt) return;
  $('#proofAction').textContent = actionLabel(receipt.action); $('#proofHash').textContent = `r${receipt.revision} · ${receipt.hash.slice(0,18)}`; $('#proofPulse').hidden = false;
}
function actionLabel(action) {
  const map = {'settings.updated':'Configurazione salvata','monitoring.mission.intent.recorded':'Obiettivo registrato','monitoring.mission.planned':'Piano registrato','monitoring.mission.revision.requested':'Revisione registrata','monitoring.mission.activated':'Monitoraggio attivato','monitoring.mission.paused':'Monitoraggio sospeso','monitoring.mission.resumed':'Monitoraggio ripreso','monitoring.run.completed':'Controllo registrato','catalog.source.decided':'Decisione sulla fonte registrata','contribution.recorded':'Materiale registrato','contribution.enriched':'Materiale arricchito','incident.intake.recorded':'Evento registrato','incident.analyzed':'Analisi registrata','incident.answers.recorded':'Risposta registrata','incident.draft.generated':'Bozza AI registrata','incident.formulation.saved':'Versione registrata','incident.submitted':'Evento inviato','incident.closed':'Evento chiuso'};
  return map[action] || 'Operazione registrata';
}
export function splitList(value) { return [...new Set(String(value || '').split(/[\n,]/).map(item => item.trim()).filter(Boolean))]; }
export function dateLabel(value) { if (!value) return '—'; const date = new Date(value); return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat('it',{dateStyle:'medium',timeStyle:'short'}).format(date); }
export function localDateTimeValue(date = new Date()) { const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000); return shifted.toISOString().slice(0,16); }
export async function filesPayload(input) {
  const files = [...(input?.files || [])];
  return Promise.all(files.map(file => new Promise((resolve, reject) => {
    if (file.size > 5 * 1024 * 1024) return reject(new Error(`${file.name}: massimo 5 MB`));
    const reader = new FileReader(); reader.onload = () => resolve({name:file.name,mime:file.type || 'application/octet-stream',dataBase64:String(reader.result).split(',').pop()}); reader.onerror = () => reject(reader.error); reader.readAsDataURL(file);
  })));
}
export function openDialog(id) { const dialog = $(`#${id}`); if (!dialog.open) dialog.showModal(); }
export function closeDialog(id) { const dialog = $(`#${id}`); if (dialog.open) dialog.close(); }

export async function downloadProtected(path, fallbackName = 'ictc-evidence.json') {
  const response = await fetch(path, {headers: headers(false)});
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Download non disponibile (${response.status})`);
  }
  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') || '';
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const name = match?.[1] || fallbackName;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.hidden = true;
  document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
