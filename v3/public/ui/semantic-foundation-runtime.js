import { state } from './common.js';
import { HUMAN_ACTIONS, HUMAN_ACTION_BINDINGS } from './semantic-foundation-actions.js';
import { PROCEDURE_LANGUAGE } from './semantic-foundation-processes.js';
import { SEMANTIC_FOUNDATION_VERSION } from './semantic-foundation-model.js';

let installed=false,pending=false;
function selectedGrc(){let saved='';try{saved=localStorage.getItem('ictc-grc-process')||'';}catch{}return state.activeProcessId||saved||'objects';}
function bindingTargets(binding){if(binding.selector)return [...document.querySelectorAll(binding.selector)];const roots=[...document.querySelectorAll(binding.root||'')],targets=[];for(const root of roots){const decision=root.querySelector(binding.decisionSelector||'');if(!decision||decision.value!==binding.decisionValue)continue;const target=root.querySelector(binding.targetSelector||'');if(target)targets.push(target);}return targets;}
function annotateNode(node,id,spec){const description=`${spec.effect} ${spec.boundary} Autorità: ${spec.authority}. Evidenza: ${spec.evidence}.`;node.dataset.semanticAction=id;node.dataset.semanticLabel=spec.label;node.dataset.semanticFoundation=SEMANTIC_FOUNDATION_VERSION;node.dataset.actionAuthority=spec.authority;node.dataset.actionReversible=String(spec.reversible);node.dataset.actionImportance=spec.importance.join(' ');node.dataset.actionBoundary=spec.boundary;node.setAttribute('aria-description',description);node.title=description;}
export function annotateSemanticActions(){for(const [id,binding] of Object.entries(HUMAN_ACTION_BINDINGS)){const spec=HUMAN_ACTIONS[id];for(const node of bindingTargets(binding))annotateNode(node,id,spec);}}
function annotateGrc(){const root=document.querySelector('#grcWorkspace');if(!root)return;const selected=selectedGrc(),meta=PROCEDURE_LANGUAGE[selected];if(!meta)return;root.dataset.semanticProcedure=selected;root.dataset.semanticProcedureCode=meta.code;const frame=root.querySelector('.procedure-frame');if(frame)frame.dataset.semanticFoundation=SEMANTIC_FOUNDATION_VERSION;const kpis=root.querySelector('.grc-kpis');if(kpis)kpis.setAttribute('aria-description','Indicatori operativi del perimetro corrente; non sono un punteggio di conformità.');}
function annotateEpistemic(){const root=document.querySelector('#epistemicView');if(!root)return;root.dataset.semanticFoundation=SEMANTIC_FOUNDATION_VERSION;}
function annotateProof(){const root=document.querySelector('#proofView');if(!root)return;root.dataset.semanticFoundation=SEMANTIC_FOUNDATION_VERSION;}
function annotateAdmin(){const root=document.querySelector('#adminCenter');if(!root)return;root.dataset.semanticFoundation=SEMANTIC_FOUNDATION_VERSION;}
function apply(){pending=false;if(!document.body)return;document.documentElement.dataset.semanticFoundation=SEMANTIC_FOUNDATION_VERSION;annotateGrc();annotateEpistemic();annotateProof();annotateAdmin();annotateSemanticActions();}
function schedule(){if(pending)return;pending=true;queueMicrotask(apply);}
export function applySemanticFoundation(){apply();}
export function installSemanticFoundation(){if(installed)return;installed=true;for(const event of ['ictc:rendered','ictc:surface-changed','ictc:context-changed','ictc:projection-committed'])document.addEventListener(event,schedule);document.addEventListener('toggle',schedule,true);schedule();}
