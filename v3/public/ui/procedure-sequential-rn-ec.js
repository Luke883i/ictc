import { $, compactList, ensureSequence } from './procedure-sequential-dom.js';
import { declareProcedureEditorialOrder, ensureEditorialCompositionCss } from './procedure-editorial-slots.js';

export const RN_EC_EDITORIAL_ORDER=Object.freeze({
  monitoring:Object.freeze(['advanced-context','reference','attention','controls','primary']),
  incidents:Object.freeze(['advanced-context','reference','attention','controls','primary'])
});
const attentionSlotOwner='procedure-sequential-rn-ec.js';
const OWNER=attentionSlotOwner;
let targetResolverBound=false;
function attr(root,name,value){return root?.querySelector(`[${name}="${CSS.escape(String(value))}"]`)||null;}
function clearActiveTargets(){for(const node of document.querySelectorAll('[data-work-target-active]')){delete node.dataset.workTargetActive;delete node.dataset.workTargetSubjectId;delete node.dataset.workTargetAction;}}
function focusNode(node){if(!node)return;node.scrollIntoView({block:'center',behavior:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'auto':'smooth'});if(!node.hasAttribute('tabindex')&&!node.matches('button,a,input,select,textarea,summary'))node.tabIndex=-1;node.focus({preventScroll:true});}
function resolve(detail,record,control,resolution='record-action'){if(!record)return false;clearActiveTargets();record.dataset.workTargetActive='true';record.dataset.workTargetSubjectId=detail.targetRef.subjectId;record.dataset.workTargetAction=detail.targetRef.intendedAction;focusNode(control||record);detail.resolved=true;detail.resolution=control?resolution:'record-intent';detail.recordId=detail.targetRef.subjectId;detail.hasActionControl=Boolean(control);return true;}
function resolveMonitoring(detail){const ref=detail.targetRef,id=ref.subjectId;if(ref.subjectType==='mission'){const control=attr(document,'data-open-plan',id)||attr(document,'data-id',id)?.closest('.mission-card')?.querySelector('[data-seq-owner-monitor="open"]');return resolve(detail,control?.closest('.mission-card'),control);}if(ref.subjectType==='source'){const control=attr(document,'data-open-source',id);return resolve(detail,control?.closest('.catalog-card'),control);}if(ref.subjectType==='run'&&ref.context?.missionId){const control=attr(document,'data-open-plan',ref.context.missionId)||attr(document,'data-id',ref.context.missionId)?.closest('.mission-card')?.querySelector('[data-seq-owner-monitor="open"]');return resolve(detail,control?.closest('.mission-card'),control,'typed-context-record');}return false;}
function resolveIncident(detail){const ref=detail.targetRef,control=attr(document,'data-open-incident',ref.subjectId);return resolve(detail,control?.closest('.incident-card'),control);}
function bindTargetResolver(){if(targetResolverBound)return;targetResolverBound=true;document.addEventListener('ictc:work-target-request',event=>{const detail=event.detail,ref=detail?.targetRef;if(!ref||detail.resolved)return;if(ref.procedureId==='monitoring')resolveMonitoring(detail);else if(ref.procedureId==='incidents')resolveIncident(detail);});}
function declare(host,id){return declareProcedureEditorialOrder(host,{procedureId:id,owner:OWNER,order:RN_EC_EDITORIAL_ORDER[id],controlSelector:':scope > .hero,:scope > #aiSetup',primarySelector:':scope > .section-block'});}
export function renderRn(){const host=$('#monitoringView');if(!host||host.hidden)return;ensureEditorialCompositionCss();bindTargetResolver();declare(host,'monitoring');ensureSequence(host,'monitoring');compactList($('#missionsList'),'.mission-card',12,'Altri monitoraggi');compactList($('#catalogList'),'.catalog-card',16,'Altre fonti');}
export function renderEc(){const host=$('#incidentsView');if(!host||host.hidden)return;ensureEditorialCompositionCss();bindTargetResolver();declare(host,'incidents');ensureSequence(host,'incidents');compactList($('#incidentList'),'.incident-card',12,'Altri fascicoli evento');}
