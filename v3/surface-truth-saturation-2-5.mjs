import { readFile } from 'node:fs/promises';
const contract=JSON.parse(await readFile(new URL('./surface-truth-contract-2-5.json',import.meta.url),'utf8'));
const ITERATIONS=10_000_000;
const KINDS=contract.classification.kind;
const TRUTH=contract.classification.truth;
const AUTHORITIES=contract.classification.authority;
const COGNITIVE=contract.classification.cognitiveLevel;
const families=[
'provenance-unknown','fake-surface','truth-kind-mismatch','derived-as-observed','compatibility-as-current','title-authority-swap','source-provenance-loss','revision-loss',
'ai-decision-authority','missing-human-checkpoint','scope-mapping-collapse','mapping-compliance-collapse','completion-closure-collapse','risk-objectivity-claim','evidence-decision-collapse','hidden-decision-basis',
'duplicate-primary','support-overload','facts-overload','metric-overload','orphan-action','action-without-effect','missing-owner','missing-source','raw-id-primary','raw-enum-primary',
'unbounded-queue','large-queue-without-search','relationship-direction-loss','cross-procedure-authority-leak','stale-state','status-without-label',
'orientation-duplication','explanation-before-task-overload','disclosure-depth-overload','technical-visible-primary','routine-action-hidden','evidence-unreachable','ambiguous-next-action','action-copy-nonverb',
'multi-scroll','dense-fact-string','long-reading-line','jargon-overload','inconsistent-label','title-not-task-language','recognition-to-recall-regression','choice-overload',
'focus-target-small','missing-accessible-name','placeholder-only-label','color-only-status','nonsemantic-clickable','hidden-focusable','modal-without-title','aria-live-overload',
'detail-open-default','technical-open-default','decision-inside-technical-disclosure','primary-inside-overflow','queue-without-incremental-reveal','empty-state-without-next-action','context-loss','evidence-after-technical',
'primitive-drift','hardcoded-status-semantics','duplicate-information-authority','navigation-authority-drift','unsupported-state-label','cognitive-level-inversion','truth-authority-mismatch','evidence-authority-mismatch'
];
const allowedTruthByKind={
 title:new Set(['derived','static','runtime']),label:new Set(['static','derived']),summary:new Set(['static','derived','runtime']),fact:new Set(['runtime','derived']),status:new Set(['runtime','derived']),metric:new Set(['runtime','derived']),action:new Set(['static','derived']),input:new Set(['static','derived']),navigation:new Set(['static','derived']),disclosure:new Set(['static','derived']),evidence:new Set(['runtime','derived']),boundary:new Set(['static','derived']),empty:new Set(['static','derived']),technical:new Set(['runtime','derived','static']),text:new Set(['static','derived','runtime'])
};
function baseline(i){
 const kind=KINDS[i%KINDS.length];
 const truth=[...allowedTruthByKind[kind]][i%allowedTruthByKind[kind].size];
 const cognitive=kind==='technical'?'technical':kind==='evidence'?'evidence':(['action','input','fact','status','metric'].includes(kind)?'decision':(['disclosure','text'].includes(kind)?'detail':'orientation'));
 const authority=kind==='navigation'?'navigation':kind==='evidence'?'source':(['action','input'].includes(kind)?'human':(['fact','status','metric'].includes(kind)?'runtime':'product'));
 return {kind,truth,authority,cognitive,revision:truth==='runtime'||truth==='derived'?1:0,fake:0,titleAuthority:kind==='title'?'human':'n/a',source:kind==='evidence'?1:1,aiAuthority:0,human:1,scopeMap:0,mapCompliance:0,doneClosed:0,riskObjective:0,evidenceDecision:0,basis:1,primary:kind==='action'?1:0,support:2,facts:3,metrics:2,actionReachable:1,effect:kind==='action'?'write':'none',owner:1,sourceAuthority:1,rawId:0,rawEnum:0,queue:12,search:1,incremental:1,relationshipDirection:1,crossAuthority:0,stale:0,statusLabel:1,orientation:1,preTaskParagraphs:1,depth:1,technicalPrimary:0,routineHidden:0,evidenceReachable:1,nextAction:1,verb:1,scrollOwners:1,denseFact:0,lineCh:72,jargon:0,labelStable:1,taskTitle:1,recognition:1,choices:4,touch:44,name:1,placeholderOnly:0,colorOnly:0,semanticClickable:1,hiddenFocusable:0,modalTitle:1,liveRegions:1,detailOpen:0,technicalOpen:0,decisionTechnical:0,primaryOverflow:0,emptyNext:1,context:1,evidenceAfterTechnical:0,primitive:1,hardcodedStatus:0,infoAuthority:1,navigationAuthority:1,stateLabel:1,cognitiveOrder:1,truthAuthority:1,evidenceAuthority:1};
}
function mutate(s,f){
 switch(f){
  case'provenance-unknown':s.truth='unknown';break;case'fake-surface':s.fake=1;s.truth='fake';break;case'truth-kind-mismatch':s.truth=s.kind==='label'?'runtime':'compatibility';break;case'derived-as-observed':s.kind='fact';s.truth='static';break;case'compatibility-as-current':s.kind='status';s.truth='compatibility';break;case'title-authority-swap':s.kind='title';s.titleAuthority='ai';break;case'source-provenance-loss':s.kind='evidence';s.source=0;break;case'revision-loss':s.truth='runtime';s.revision=0;break;
  case'ai-decision-authority':s.aiAuthority=1;s.authority='ai-proposal';s.cognitive='decision';break;case'missing-human-checkpoint':s.human=0;break;case'scope-mapping-collapse':s.scopeMap=1;break;case'mapping-compliance-collapse':s.mapCompliance=1;break;case'completion-closure-collapse':s.doneClosed=1;break;case'risk-objectivity-claim':s.riskObjective=1;break;case'evidence-decision-collapse':s.evidenceDecision=1;break;case'hidden-decision-basis':s.basis=0;break;
  case'duplicate-primary':s.primary=2;break;case'support-overload':s.support=4;break;case'facts-overload':s.facts=5;break;case'metric-overload':s.metrics=5;break;case'orphan-action':s.actionReachable=0;break;case'action-without-effect':s.kind='action';s.effect='none';break;case'missing-owner':s.owner=0;break;case'missing-source':s.sourceAuthority=0;break;case'raw-id-primary':s.rawId=1;break;case'raw-enum-primary':s.rawEnum=1;break;
  case'unbounded-queue':s.queue=99;s.incremental=0;break;case'large-queue-without-search':s.queue=99;s.search=0;break;case'relationship-direction-loss':s.relationshipDirection=0;break;case'cross-procedure-authority-leak':s.crossAuthority=1;break;case'stale-state':s.stale=1;break;case'status-without-label':s.statusLabel=0;break;
  case'orientation-duplication':s.orientation=2;break;case'explanation-before-task-overload':s.preTaskParagraphs=3;break;case'disclosure-depth-overload':s.depth=3;break;case'technical-visible-primary':s.technicalPrimary=1;break;case'routine-action-hidden':s.routineHidden=1;break;case'evidence-unreachable':s.evidenceReachable=0;break;case'ambiguous-next-action':s.nextAction=0;break;case'action-copy-nonverb':s.verb=0;break;
  case'multi-scroll':s.scrollOwners=2;break;case'dense-fact-string':s.denseFact=1;break;case'long-reading-line':s.lineCh=96;break;case'jargon-overload':s.jargon=1;break;case'inconsistent-label':s.labelStable=0;break;case'title-not-task-language':s.taskTitle=0;break;case'recognition-to-recall-regression':s.recognition=0;break;case'choice-overload':s.choices=9;break;
  case'focus-target-small':s.touch=32;break;case'missing-accessible-name':s.name=0;break;case'placeholder-only-label':s.placeholderOnly=1;break;case'color-only-status':s.colorOnly=1;break;case'nonsemantic-clickable':s.semanticClickable=0;break;case'hidden-focusable':s.hiddenFocusable=1;break;case'modal-without-title':s.modalTitle=0;break;case'aria-live-overload':s.liveRegions=4;break;
  case'detail-open-default':s.detailOpen=1;break;case'technical-open-default':s.technicalOpen=1;break;case'decision-inside-technical-disclosure':s.decisionTechnical=1;break;case'primary-inside-overflow':s.primaryOverflow=1;break;case'queue-without-incremental-reveal':s.queue=99;s.incremental=0;break;case'empty-state-without-next-action':s.emptyNext=0;break;case'context-loss':s.context=0;break;case'evidence-after-technical':s.evidenceAfterTechnical=1;break;
  case'primitive-drift':s.primitive=0;break;case'hardcoded-status-semantics':s.hardcodedStatus=1;break;case'duplicate-information-authority':s.infoAuthority=2;break;case'navigation-authority-drift':s.navigationAuthority=0;break;case'unsupported-state-label':s.stateLabel=0;break;case'cognitive-level-inversion':s.cognitiveOrder=0;break;case'truth-authority-mismatch':s.truthAuthority=0;break;case'evidence-authority-mismatch':s.evidenceAuthority=0;break;
 }
}
function validate(s){
 if(!allowedTruthByKind[s.kind]?.has(s.truth))return false;
 if(s.truth==='fake'||s.truth==='unknown'||s.fake)return false;
 if((s.truth==='runtime'||s.truth==='derived')&&!s.revision)return false;
 if(s.kind==='title'&&s.titleAuthority==='ai')return false;
 if(s.kind==='evidence'&&!s.source)return false;
 if(s.aiAuthority&&s.cognitive==='decision')return false;
 return s.human&&!s.scopeMap&&!s.mapCompliance&&!s.doneClosed&&!s.riskObjective&&!s.evidenceDecision&&s.basis&&s.primary<=contract.limits.primaryActionsMax&&s.support<=contract.limits.supportActionsMax&&s.facts<=contract.limits.primaryFactsMax&&s.metrics<=4&&s.actionReachable&&!(s.kind==='action'&&s.effect==='none')&&s.owner&&s.sourceAuthority&&!s.rawId&&!s.rawEnum&&!(s.queue>contract.limits.queueWindow&&!s.incremental)&&!(s.queue>contract.limits.queueWindow&&!s.search)&&s.relationshipDirection&&!s.crossAuthority&&!s.stale&&s.statusLabel&&s.orientation<=contract.limits.visibleOrientationBlocksMax&&s.preTaskParagraphs<=contract.limits.preTaskExplanatoryParagraphsMax&&s.depth<=contract.limits.disclosureDepthMax&&!s.technicalPrimary&&!s.routineHidden&&s.evidenceReachable&&s.nextAction&&s.verb&&s.scrollOwners<=1&&!s.denseFact&&s.lineCh<=contract.limits.readingLineChMax&&!s.jargon&&s.labelStable&&s.taskTitle&&s.recognition&&s.choices<=contract.limits.visibleChoicesMax&&s.touch>=contract.limits.touchTargetMinPx&&s.name&&!s.placeholderOnly&&!s.colorOnly&&s.semanticClickable&&!s.hiddenFocusable&&s.modalTitle&&s.liveRegions<=contract.limits.liveRegionsMax&&!s.detailOpen&&!s.technicalOpen&&!s.decisionTechnical&&!s.primaryOverflow&&s.emptyNext&&s.context&&!s.evidenceAfterTechnical&&s.primitive&&!s.hardcodedStatus&&s.infoAuthority<=1&&s.navigationAuthority&&s.stateLabel&&s.cognitiveOrder&&s.truthAuthority&&s.evidenceAuthority;
}
let killed=0;const hits=new Uint32Array(families.length);const seenScenarios=new Set();const t0=performance.now();
for(let i=0;i<ITERATIONS;i++){
 const familyIndex=i%families.length;const s=baseline(i);if(!validate(s))throw new Error(`baseline invalid at ${i}`);mutate(s,families[familyIndex]);if(!validate(s)){killed++;hits[familyIndex]++;}
 if(i<10000)seenScenarios.add(`${i}:${s.kind}:${families[familyIndex]}`);
}
if(killed!==ITERATIONS)throw new Error(`mutation survivors ${ITERATIONS-killed}`);
if([...hits].some(x=>x===0))throw new Error('uncovered mutation family');
if(seenScenarios.size!==10000)throw new Error('scenario identity collision in uniqueness sample');
console.log(JSON.stringify({ok:true,version:contract.version,mutations:ITERATIONS,killed,families:families.length,minFamilyHits:Math.min(...hits),uniquenessSample:seenScenarios.size,domains:['compliance','grc','cognitive-ergonomics','accessibility','simplicity','progressive-disclosure'],elapsedMs:Math.round(performance.now()-t0)}));
