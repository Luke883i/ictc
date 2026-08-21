import { HUMAN_ACTIONS } from './semantic-foundation-actions.js';
import { PROCEDURE_LANGUAGE } from './semantic-foundation-processes.js';
import { SEMANTIC_FOUNDATION_VERSION } from './semantic-foundation-model.js';

let installed=false,pending=false;
const ACTION_SELECTORS=Object.freeze({
  'monitoring.activate':'[data-activate-mission]',
  'monitoring.run':'[data-run-mission]',
  'monitoring.pause':'[data-pause-mission]',
  'source.accept':'[data-source-decision="verified"]',
  'source.reject':'[data-source-decision="rejected"]',
  'incident.submit':'[data-submit-incident]',
  'incident.close':'[data-close-incident]',
  'object.approve':'[data-object-review="active"]',
  'object.reattest':'[data-object-attest]',
  'mapping.mapped':'[data-mapping-decision="mapped"]',
  'mapping.gap':'[data-mapping-decision="gap"]',
  'mapping.na':'[data-mapping-decision="not-applicable"]',
  'action.adopt':'[data-action-adopt]',
  'action.start':'[data-action-progress="in-progress"]',
  'action.complete':'[data-action-progress="done"]',
  'risk.review':'[data-risk-review]',
  'assurance.approve':'[data-assurance-approve]'
});
function label(node,value){if(node&&value&&node.textContent!==value)node.textContent=value;}
function annotateActions(){for(const [id,selector] of Object.entries(ACTION_SELECTORS)){const spec=HUMAN_ACTIONS[id];for(const node of document.querySelectorAll(selector)){node.dataset.semanticAction=id;node.dataset.semanticFoundation=SEMANTIC_FOUNDATION_VERSION;node.dataset.actionAuthority=spec.authority;node.dataset.actionReversible=String(spec.reversible);node.dataset.actionImportance=spec.importance.join(' ');node.setAttribute('aria-description',`${spec.effect} Autorità: ${spec.authority}. Evidenza: ${spec.evidence}.`);label(node,spec.label);}}}
function refineGrc(){const root=document.querySelector('#grcWorkspace');if(!root)return;const selected=document.querySelector('[data-grc-process].active')?.dataset.grcProcess||'';const meta=PROCEDURE_LANGUAGE[selected];if(!meta)return;root.dataset.semanticProcedure=selected;const head=root.querySelector('.grc-head');if(head){label(head.querySelector('h1'),meta.label);const purpose=head.querySelector('h1 + p');if(purpose)purpose.textContent=meta.governs;}
  const kpis=root.querySelector('.grc-kpis');if(kpis)kpis.setAttribute('aria-description','Indicatori operativi del perimetro corrente; non sono un punteggio di conformità.');
}
function refineEpistemic(){const root=document.querySelector('#epistemicView');if(!root)return;label(root.querySelector('#epistemicTitle'),'Relazioni tra decisioni, fonti ed evidenze');const purpose=root.querySelector('.procedure-purpose span');if(purpose)purpose.textContent='Esplora dipendenze, basi e versioni registrate senza trasformare relazioni o inferenze in conclusioni di conformità.';const search=root.querySelector('#epistemicSearch');if(search)search.placeholder='Decisione, fonte, requisito, evidenza…';for(const button of root.querySelectorAll('[data-epistemic-mode]')){const text=(button.textContent||'').trim();if(text==='Flat / raw')button.textContent='Vista tecnica';if(text==='Proto-grafo')button.textContent='Relazioni grafiche';}}
function refineProof(){const root=document.querySelector('#proofView');if(!root)return;label(root.querySelector('#proofTitle'),'Evidenze e registrazioni ICTC');const lead=root.querySelector('#proofTitle + p');if(lead)lead.textContent='Verifica quali decisioni, evidenze e limiti sono registrati nel perimetro accessibile.';}
function refineAdmin(){const root=document.querySelector('#adminCenter');if(!root)return;label(root.querySelector('.admin-head .eyebrow'),'Amministrazione del sistema');label(root.querySelector('#adminOverviewTitle'),'Controlli tecnici e azioni richieste');}
function apply(){pending=false;if(!document.body)return;document.documentElement.dataset.semanticFoundation=SEMANTIC_FOUNDATION_VERSION;annotateActions();refineGrc();refineEpistemic();refineProof();refineAdmin();}
function schedule(){if(pending)return;pending=true;queueMicrotask(apply);}
export function applySemanticFoundation(){apply();}
export function installSemanticFoundation(){if(installed)return;installed=true;for(const event of ['ictc:rendered','ictc:surface-changed','ictc:context-changed','ictc:projection-committed'])document.addEventListener(event,schedule);document.addEventListener('toggle',schedule,true);schedule();}
