import { state } from './common.js';
import { NATIVE_SEMANTIC_LATTICE_VERSION, PROCEDURE_WORKSPACE } from './native-semantic-lattice-3-2.js';
const GRC_IDS=new Set(['objects','coverage','actions','risks','assurance']);
let installed=false,observer=null,lastCanonicalBody=null;
function selected(){let id=state.activeProcessId||'';try{id=id||localStorage.getItem('ictc-grc-process')||'';}catch{}return GRC_IDS.has(id)?id:'objects';}
function disclosure(host,key,label,node){if(!host||!node)return null;const procedure=selected();let detail=host.querySelector(`:scope > details[data-composition-detail="${key}"]`),reset=!detail||detail.dataset.compositionProcedure!==procedure;if(!detail){detail=document.createElement('details');detail.className='composition-detail';detail.dataset.compositionDetail=key;detail.innerHTML=`<summary>${label}</summary><div data-composition-detail-body></div>`;host.append(detail);}const body=detail.querySelector('[data-composition-detail-body]');if(node.parentElement!==body)body.append(node);detail.dataset.compositionProcedure=procedure;if(reset)detail.removeAttribute('open');return detail;}
function ensureAttentionSlot(root,procedure){const frame=root?.querySelector(':scope > .procedure-frame');if(!root||!frame)return null;let slot=root.querySelector(`:scope > [data-procedure-attention-slot="${procedure}"]`),changed=false;for(const stale of root.querySelectorAll(':scope > [data-procedure-attention-slot]'))if(stale!==slot&&stale.dataset.procedureAttentionSlot!==procedure)stale.remove();if(!slot){slot=document.createElement('div');slot.dataset.procedureAttentionSlot=procedure;slot.dataset.attentionSlotOwner='grc-workspace-3-2.js';slot.dataset.informationRole='attention';changed=true;}if(frame.nextElementSibling!==slot){frame.after(slot);changed=true;}if(changed)document.dispatchEvent(new CustomEvent('ictc:attention-slot-ready',{detail:{procedureId:procedure,owner:slot.dataset.attentionSlotOwner}}));return slot;}
function canonicalRecords(procedure){const grc=state.data?.grc||{};if(procedure==='objects')return grc.objects?.objects||[];if(procedure==='coverage')return grc.coverage?.mappings||[];if(procedure==='actions')return grc.actions?.actions||[];if(procedure==='risks')return grc.risks?.risks||[];if(procedure==='assurance')return grc.assurance?.cases||[];return[];}
function recordKind(procedure){return procedure==='objects'?'object':procedure==='coverage'?'mapping':procedure==='actions'?'action':procedure==='risks'?'risk':'assurance-case';}
function annotateCanonicalRecords(root,procedure){const cards=[...root.querySelectorAll('.grc-body .grc-list > article')],records=canonicalRecords(procedure),kind=recordKind(procedure);cards.forEach((card,index)=>{const record=records[index];if(!record)return;card.dataset.grcRecordId=String(record.id);card.dataset.grcRecordKind=kind;card.dataset.grcRecordProcedure=procedure;if(procedure==='coverage'&&record.requirementRef)card.dataset.grcRequirementRef=String(record.requirementRef);});root.dataset.grcRecordTargetMap=cards.length===records.length?'exact':'partial';}
function clearActiveTargets(){for(const node of document.querySelectorAll('[data-work-target-active]')){delete node.dataset.workTargetActive;delete node.dataset.workTargetSubjectId;delete node.dataset.workTargetAction;}}
function focusNode(node){if(!node)return;node.scrollIntoView({block:'center',behavior:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'auto':'smooth'});if(!node.hasAttribute('tabindex')&&!node.matches('button,a,input,select,textarea,summary'))node.tabIndex=-1;node.focus({preventScroll:true});}
function exactRecord(ref){return document.querySelector(`#grcWorkspace [data-grc-record-procedure="${CSS.escape(ref.procedureId)}"][data-grc-record-kind="${CSS.escape(ref.subjectType)}"][data-grc-record-id="${CSS.escape(ref.subjectId)}"]`);}
function frameworkCard(id){return id?document.querySelector(`#grcWorkspace [data-framework-card="${CSS.escape(id)}"]`):null;}
function mappingByRequirement(requirementRef){return requirementRef?document.querySelector(`#grcWorkspace [data-grc-record-procedure="coverage"][data-grc-record-kind="mapping"][data-grc-requirement-ref="${CSS.escape(requirementRef)}"]`):null;}
function actionControl(ref,record){if(!record||!ref)return null;const id=ref.subjectId,action=ref.intendedAction;if(action==='inspect-record')return null;if(action==='review-object')return record.querySelector('[data-object-review="active"]');if(action==='reattest-object')return record.querySelector(`[data-object-attest="${CSS.escape(id)}"]`);if(action==='review-mapping')return record.querySelector('[data-uiux-mapping-decision],[data-mapping-decision]');if(action==='resolve-gap')return null;if(action==='adopt-action')return record.querySelector(`[data-action-adopt="${CSS.escape(id)}"]`);if(action==='progress-action')return record.querySelector(`[data-uiux-action-quick="${CSS.escape(id)}"],[data-action-progress]`);if(action==='verify-action')return record.querySelector(`[data-uiux-action-verify="${CSS.escape(id)}"],[data-v4-action-verify="${CSS.escape(id)}"]`);if(action==='review-risk')return record.querySelector(`[data-risk-review="${CSS.escape(id)}"]`);if(action==='decide-treatment')return record.querySelector(`[data-v4-risk-treatment="${CSS.escape(id)}"]`);if(action==='draft-response')return record.querySelector(`[data-assurance-propose="${CSS.escape(id)}"]`);if(action==='review-response')return record.querySelector(`[data-assurance-approve="${CSS.escape(id)}"],[data-assurance-answer]`);return null;}
function resolveGrcTarget(detail){const ref=detail.targetRef;if(!GRC_IDS.has(ref.procedureId))return false;let record=null,control=null,resolution='record';if(ref.procedureId==='coverage'&&ref.subjectType==='standard'){record=frameworkCard(ref.subjectId);control=record?.querySelector('.market-scope-editor > summary,[data-standard-scope-decision],[data-standard-scope]')||null;resolution=control?'record-action':'record-intent';}else if(ref.procedureId==='coverage'&&ref.subjectType==='requirement-scope'){record=mappingByRequirement(ref.context?.requirementRef)||frameworkCard(ref.context?.frameworkId);control=record?.querySelector('[data-uiux-scope-decision]')||record?.querySelectoЉ	ЦЩ]K[Ь[‹\Э[™\™Xњ›ЭЬЩ\—IК_ќ[Ь™\ЫЫ][ЫЏXЫЫќ›Ы	‰њ™XЫЬ™Лљ\Р]љXќ]J	Щ]KYњ[Y]ЫЬљЛXШ\™	КOЙЭ\Y\™\]Z\™[Y[ќXЫЫќ^	ОЫЫќ›ЫЙЬ™XЫЬ™XXЭ[Ы‰О‰Э\Y\™\]Z\™[Y[ќXЫЫќ^	ОЯY[Щ^Ь™XЫЬ™Y^XЭ™XЫЬ™
™YЉNШЫЫќ›ЫXXЭ[ЫђЫЫќ›Ы
™Y‹™XЫЬ™
NЬ™\ЫЫ][ЫЏXЫЫќ›ЫЙЬ™XЫЬ™XXЭ[Ы‰О‰Ь™XЫЬ™Z[ќ[ќ	ОЯZYЉ\™XЫЬ™
\™]\›€[ЩNШЫX\ђXЭ]™U\™Щ]К
NЬ™XЫЬ™™]\Щ]ќЫЬљХ\™Щ]XЭ]™OIЭќYIОЬ™XЫЬ™™]\Щ]ќЫЬљХ\™Щ]ЭXљ™XЭY\™Y‹њЭXљ™XЭYЬ™XЫЬ™™]\Щ]ќЫЬљХ\™Щ]XЭ[ЫЏ\™Y‹љ[ќ[™YXЭ[ЫЋЪYЉ™Y‹ЫЫќ^Л››ЩRY
\™XЫЬ™™]\Щ]ќЫЬљХ\™Щ]›ЩRY\™Y‹ЫЫќ^››ЩRYЩ›ШЭ\У›ЩJЫЫќ›Ы™XЫЬ™
NЩ]Z[њ™\ЫЫ™Y]ќYNЩ]Z[њ™\ЫЫ][ЫЏ\™\ЫЫ][ЫЋЩ]Z[њ™XЫЬ™Y\™XЫЬ™™]\Щ]™ЬФ™XЫЬ™Y™Y‹њЭXљ™XЭYЩ]Z[љ\РXЭ[ЫђЫЫќ›ЫP›ЫЫX[ЉЫЫќ›Ы
NЬ™]\›€ќYNЯB™^Ьќќ[Э[Ы€\QЬХЫЬљЬЬXЩLМЉ
^ШЫЫњЭ›ЫЭYШЭ[Y[ќњ]Y\ћTЩ[XЭЬЉ	ИЩЬХЫЬљЬЬXЩIКNЪYЉ\›ЫЭ
\™]\›ЋШЫЫњЭ›ШЩY\™O\Щ[XЭY

NЬ›ЫЭ™]\Щ]›ШШ[ЫЫ\ЬЪ][Ы“ЭЫ™\ЏIЩЬЛ]ЫЬљЬЬXЩKLЛL‹љњЙОЬ›ЫЭ™]\Щ]›]]™TЩ[X[ќXУ]XЩOSђUU‘WФСSPS•PЧУUPСWХ‘T”ТSУЋЬ›ЫЭ™]\Щ]ЫЫ\ЬЪ][Ы”Э\™XЩO\›ШЩY\™NЩ[њЭ\™P][ќ[Ы”ЫЭ
›ЫЭ›ШЩY\™JNШЫЫњЭ›ЩO\›ЫЭњ]Y\ћTЩ[XЭЬЉ	Л™ЬЛX›ЩIК_›ЫЭ\ЭX›ЩKњ]Y\ћTЩ[XЭЬЉ	Л™ЬЛ[\Э	КNЪYЉ\Э
^Ы\Э™]\Щ]љ[™›Ь›X][Ы”›ЫOIШ][ќ[Ы‰ОШЫЫњЭЭќXЭ\[VЛ‹‹›ЩKЪ[™[—K™љ[™
›ЩOO€[›ЩK›X]Ъ\К	Лњ›ШЩY\™KYњ[YK™ЬЛZXY™ЬЛ[]‹ZXY	КJNЪYЉЭќXЭ\[	‰њЭќXЭ\[OO[\Э
X›ЩKљ[њЩ\ќ™Y›Ь™J\ЭЭќXЭ\[
NЯX[››Э]PШ[›ЫљXШ[™XЫЬ™К›ЫЭ›ШЩY\™JNШЫЫњЭЬ\ПX›ЩKњ]Y\ћTЩ[XЭЬЉ	Л™ЬЛZЬ\ЙКNЪYЉЬ\КY\ШЫЬЭ\™J›ЩK	Ь›ШЩ\ЬЛ\Э]\ЙЛ	ФЭ]И[›ШЩ\ЬЫЙЛЬ\КNШЫЫњЭX]X›ЩKњ]Y\ћTЩ[XЭЬЉ	Л™ЬЛZX]	КNЪYЉX]
Y\ШЫЬЭ\™J›ЩK	Ьљ\ЪЛX[[\Ъ\ЙЛ	УX]љXЩHH]YЫ[И[H[]^љ[Ы™IЛX]
NШЫЫњЭ›Ь›OX›ЩKњ]Y\ћTЩ[XЭЬЉ	ИЩЬФљ[X\ћQ›Ь›IКKЫЬOT“РСQT‘WХУФ’ФФPСVЬ›ШЩY\™WNЪYЉ›Ь›I‰ЫЬJ^Щ›Ь›K™]\Щ]љ[™›Ь›X][Ы”›ЫOIШXЭ[Ы‰ОШЫЫњЭЭ[[X\ћOY›Ь›Kњ]Y\ћTЩ[XЭЬЉ	ОњШЫЬH€Э[[X\ћIКNЪYЉЭ[[X\ћJ\Э[[X\ћKќ^ЫЫќ[ќXЫЬKњљ[X\ћNЯ_B™ќ[Э[Ы€Ш[›ЫљXШ[›ЩJ›ЫЭYШЭ[Y[ќњ]Y\ћTЩ[XЭЬЉ	ИЩЬХЫЬљЬЬXЩIКJ^Ь™]\›€›ЫЭЛњ]Y\ћTЩ[XЭЬЉ	ОњШЫЬH€™ЬЛX›ЩIК_ќ[ЯB™ќ[Э[Ы€X›\ЪШ[›ЫљXШ[ЫЫ[Z]
›ЫЭYШЭ[Y[ќњ]Y\ћTЩ[XЭЬЉ	ИЩЬХЫЬљЬЬXЩIКJ^ШЫЫњЭ›ЩOXШ[›ЫљXШ[›ЩJ›ЫЭ
NЪYЉX›Щ_›ЩOOO[\ЭШ[›ЫљXШ[›ЩJ\™]\›€[ЩNЫ\ЭШ[›ЫљXШ[›ЩOX›ЩNШ\QЬХЫЬљЬЬXЩLМЉ
NЩШЭ[Y[ќ™\Ь]Ъ]™[ќ
™]ИЭ\ЭЫQ]™[ќ
	ЪXЭОЫЫќ^XЪ[™ЩY	ЛЩ]Z[ћЬЭ\™XЩN‰ЩЬЙЛ›ШЩY\™RYњЩ[XЭY

K™X\ЫЫЋ‰ЩЬЛ\™[™\‹XЫЫ[Z]Y	Я_JJNЬ™]\›€ќYNЯB™ќ[Э[Ы€ШњЩ\ќ™PШ[›ЫљXШ[™[™\Љ
^ШЫЫњЭ›ЫЭYШЭ[Y[ќњ]Y\ћTЩ[XЭЬЉ	ИЩЬХЫЬљЬЬXЩIКNЪYЉ\›ЫЭШњЩ\ќ™\Љ\™]\›ЋЫ\ЭШ[›ЫљXШ[›ЩOXШ[›ЫљXШ[›ЩJ›ЫЭ
NЫШњЩ\ќ™\Џ[™]И]]][Ы“ШњЩ\ќ™\Љ

OOњX›\ЪШ[›ЫљXШ[ЫЫ[Z]
›ЫЭ
JNЫШњЩ\ќ™\‹›ШњЩ\ќ™J›ЫЭШЪ[\ЭќќY_JNЯB™ќ[Э[Ы€ЫЫќ™\™ЩJ
^ЫШњЩ\ќ™PШ[›ЫљXШ[™[™\Љ
NШ\QЬХЫЬљЬЬXЩLМЉ
NЯB™ќ[Э[Ы€Ы”Э\™XЩPЪ[™ЩY
]™[ќ
^ЪYЉ]™[ќЛ™]Z[ЛњЭ\™XЩOOOIЩЬЙК^ЫШњЩ\ќ™PШ[›ЫљXШ[™[™\Љ
NЬ™]\›ЋЯXЫЫќ™\™ЩJ
NЯB™^Ьќќ[Э[Ы€[њЭ[ЬХЫЬљЬЬXЩLМЉ
^ЪYЉ[њЭ[Y
\™]\›ЋЪ[њЭ[Y]ќYNЫШњЩ\ќ™PШ[›ЫљXШ[™[™\Љ
NЩШЭ[Y[ќY]™[ќ\Э[™\Љ	ЪXЭОќЫЬљЛ]\™Щ]\™\]Y\Э	Л]™[ќOћШЫЫњЭ]Z[Y]™[ќ™]Z[ЪYЉ]Z[Лњ™\ЫЫ™YY]Z[Лќ\™Щ]™YЉ\™]\›ЋЬ™\ЫЫ™QЬХ\™Щ]
]Z[
NЯJNЩШЭ[Y[ќY]™[ќ\Э[™\Љ	ЪXЭОњЭ\™XЩKXЪ[™ЩY	ЛЫ”Э\™XЩPЪ[™ЩY
NЩ›ЬЉЫЫњЭ]™[ќЩ€ЙЪXЭОњ™[™\™Y	Л	ЪXЭОЫЫќ^XЪ[™ЩY	Л	ЪXЭОњ›Ъ™XЭ[Ы‹XЫЫ[Z]Y	ЧJYШЭ[Y[ќY]™[ќ\Э[™\Љ]™[ќЫЫќ™\™ЩJNШЫЫќ™\™ЩJ
NЯB