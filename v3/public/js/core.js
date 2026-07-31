export const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const status={observed:'Osservato',verified:'Verifica deterministica','attention-required':'Richiede attenzione','awaiting-human-review':'Da valutare','human-reviewed':'Review registrata','human-owned':'Responsabilità confermata','ai-proposed':'Proposta AI',candidate:'Candidata',mapped:'Mappato','operating-declared':'Operatività dichiarata','evidence-available':'Evidenza disponibile',operational:'Operativo',bounded:'Delimitato','not-implemented':'Non implementato',failed:'Non completato'};
export const titles={home:'Oggi',atlas:'Atlante',journeys:'Percorsi',changes:'Novità',sources:'Fonti',matters:'Eventi',evidence:'Prove',system:'Sistema'};
export const matterStates=['facts-to-confirm','owned','assessing','responding','closure-review','closed'];
export const matterNames={'facts-to-confirm':'Fatti da confermare',owned:'Owner confermato',assessing:'Valutazioni',responding:'Risposta','closure-review':'Review di chiusura',closed:'Chiuso'};
export const S={data:null,view:location.hash.slice(1)||'home',selected:null,detail:null,tab:'understand',journey:'journey-change',scene:0,trace:'trace-monitoring',sourceMode:'link',session:null};
export async function api(path,options={}){const response=await fetch(path,{headers:{'content-type':'application/json'},...options});const body=(response.headers.get('content-type')||'').includes('json')?await response.json():await response.text();if(!response.ok)throw Error(body.error||body||response.status);return body}
export const pill=s=>`<span class="pill ${esc(s)}">${esc(status[s]||s)}</span>`;
export const page=(k,t,d)=>`<header class="page-head"><div><span class="eyebrow">${esc(k)}</span><h1>${esc(t)}</h1><p>${esc(d)}</p></div></header>`;
export const card=(x,actions='')=>`<article class="card">${pill(x.epistemicStatus)}<h3>${esc(x.label)}</h3><p>${esc(x.statement)}</p>${actions}<footer><small>${esc(x.nextAction||x.limitations?.[0]||'')}</small><button data-object="${esc(x.id)}">Apri</button></footer></article>`;
export function handshake(kind,text){$('#handshake').textContent=`${{collect:'🤲',process:'🫱‍🫲',persist:'🤝',error:'×'}[kind]||'·'} ${text}`}
