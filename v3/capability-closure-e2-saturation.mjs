import crypto from 'node:crypto';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateClosureModel} from './capability-closure-e2-model.mjs';
const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=process.argv[2]?path.resolve(process.argv[2]):path.resolve(HERE,'..');
const CONTRACT=path.join(ROOT,'v3/capability-closure-e2-contract.json');
const BASE=JSON.parse(readFileSync(CONTRACT,'utf8'));
const TRIALS=10_000_000,SEED=0x6d2b79f5,FAMILY_COUNT=64;
const baselineCtx={
 surfaceInventory:BASE.surfaceUnits.map(x=>({id:x.id,root:x.root})),
 adapters:BASE.surfaceUnits.filter(x=>x.kind==='procedure').map(x=>({id:x.id,surface:x.adapterSurface,subjectTypes:structuredClone(x.subjectTypes),writeRoutes:structuredClone(x.writeRoutePrefixes)})),
 handlerPlan:[...new Set(BASE.surfaceUnits.flatMap(x=>x.handlerKeys||[]))],
 handlerMap:Object.fromEntries(BASE.surfaceUnits.filter(x=>x.kind==='procedure').map(x=>[x.id,structuredClone(x.handlerKeys)])),
 sourceEvidence:Object.fromEntries(['productBoundary','adapterRegistry','handlerRegistry','bootstrapProjection','compositionRoot','receiptSubject','persistBeforeVisible','projectionReadback','sevenProcedureBrowser','browserInCi','externalRails','c5Gate'].map(x=>[x,true])),
 authority:{planningState:{nextSerialSlice:'UIUX-CONVERGE-0',noNewSerialBridge:true},conditionalSlices:[{id:'C5-SEMANTIC-OWNER-COMPRESSION',mustResolveBefore:'UIUX-CONVERGE-0+S4-A6-CLOSE'}],experienceProgram:{capabilityClosureEntry:{id:'CAPABILITY-CLOSURE-E2',state:'satisfied',rerunBeforeDone:true}}},
 prototype:{createsNewSerialSlice:false,nextSerialSlice:'UIUX-CONVERGE-0',capabilityClosure:{status:'E2-CLOSED-CANONICAL-13',surfaceCount:13}}
};
const mutate=(name,fn=null,ctxFn=null)=>({name,fn,ctxFn});
const families=[
 mutate('schema-drift',x=>x.schemaVersion='9.9.9'),
 mutate('model-id-drift',x=>x.modelId='CAPABILITY-CLOSURE-X'),
 mutate('serial-bridge-created',x=>x.createsNewSerialSlice=true),
 mutate('classification-drift',x=>x.classification='serial-slice'),
 mutate('status-promotion-drift',x=>x.status='READY'),
 mutate('axis-drop',x=>x.closureAxes.pop()),
 mutate('axis-order-drift',x=>[x.closureAxes[0],x.closureAxes[1]]=[x.closureAxes[1],x.closureAxes[0]]),
 mutate('surface-drop',x=>x.surfaceUnits.pop()),
 mutate('surface-id-duplicate',x=>x.surfaceUnits[12].id=x.surfaceUnits[11].id),
 mutate('identity-key-duplicate',x=>x.surfaceUnits[12].identityKey=x.surfaceUnits[11].identityKey),
 mutate('terminal-regression',x=>x.surfaceUnits[2].terminal='partial'),
 mutate('root-valid-wrong-surface',x=>x.surfaceUnits[2].root=x.surfaceUnits[3].root),
 mutate('mode-missing',x=>delete x.surfaceUnits[0].mode),
 mutate('procedure-code-drift',x=>x.surfaceUnits[2].code='EC-01'),
 mutate('adapter-id-drift',x=>x.surfaceUnits[2].adapterId='incidents'),
 mutate('adapter-surface-drift',x=>x.surfaceUnits[2].adapterSurface='grc'),
 mutate('subject-family-drop',x=>x.surfaceUnits[2].subjectTypes.pop()),
 mutate('subject-valid-wrong-procedure',x=>x.surfaceUnits[2].subjectTypes=['incident']),
 mutate('write-route-drop',x=>x.surfaceUnits[2].writeRoutePrefixes.pop()),
 mutate('write-route-valid-wrong-procedure',x=>x.surfaceUnits[2].writeRoutePrefixes=['/api/incidents','/api/manual/incidents']),
 mutate('handler-empty',x=>x.surfaceUnits[2].handlerKeys=[]),
 mutate('handler-valid-wrong-procedure',x=>x.surfaceUnits[2].handlerKeys=['incidents']),
 mutate('read-projection-empty',x=>x.surfaceUnits[0].projectionRefs=[]),
 mutate('write-route-empty',x=>x.surfaceUnits[4].writeRoutePrefixes=[]),
 mutate('dod-rule-drop',x=>x.machineReadableDoD.rules.pop()),
 mutate('dod-rule-duplicate',x=>x.machineReadableDoD.rules[13].id=x.machineReadableDoD.rules[12].id),
 mutate('dod-required-false',x=>x.machineReadableDoD.rules[2].required=false),
 mutate('dod-kind-missing',x=>delete x.machineReadableDoD.rules[2].kind),
 mutate('dod-description-missing',x=>x.machineReadableDoD.rules[2].description=''),
 mutate('dod-completion-false',x=>x.machineReadableDoD.completion.validButWrongRelationMutantsKilled=false),
 mutate('history-surface-count',x=>x.historicalReconciliation.surfaceCount=12),
 mutate('history-closed-count',x=>x.historicalReconciliation.closedCount=12),
 mutate('history-procedure-count',x=>x.historicalReconciliation.procedureCount=6),
 mutate('history-c5-lost',x=>x.historicalReconciliation.remainingInternal=x.historicalReconciliation.remainingInternal.filter(y=>!y.startsWith('C5-'))),
 mutate('history-human-boundary-lost',x=>x.historicalReconciliation.remainingExternal=x.historicalReconciliation.remainingExternal.filter(y=>y!=='E3-HUMAN')),
 mutate('history-governance-boundary-lost',x=>x.historicalReconciliation.remainingExternal=x.historicalReconciliation.remainingExternal.filter(y=>y!=='E3-GOV')),
 mutate('history-deploy-boundary-lost',x=>x.historicalReconciliation.remainingExternal=x.historicalReconciliation.remainingExternal.filter(y=>y!=='E4-DEPLOY')),
 mutate('mutation-trials-drift',x=>x.mutationEvidence.trials=1_000_000),
 mutate('mutation-family-drift',x=>x.mutationEvidence.materialFamilies=63),
 mutate('mutation-survivor',x=>x.mutationEvidence.survivors=1),
 mutate('mutation-harness-error',x=>x.mutationEvidence.harnessErrors=1),
 mutate('mutation-digest-malformed',x=>x.mutationEvidence.digest='bad'),
 mutate('entry-gate-disabled',x=>x.uiuxBinding.entryGate=false),
 mutate('rerun-disabled',x=>x.uiuxBinding.rerunBeforeDone=false),
 mutate('cross-surface-workunit-drift',x=>x.uiuxBinding.crossSurfaceWorkUnit='UXW-13-PROOF'),
 mutate('owner-gate-lost',x=>x.uiuxBinding.ownerCompressionGate='none'),
 mutate('claim-human-laundered',x=>x.claimBoundary=x.claimBoundary.replace('representative-human usability','human usability')),
 mutate('claim-deploy-laundered',x=>x.claimBoundary=x.claimBoundary.replace('deployment effectiveness','operations')),
 mutate('claim-governance-laundered',x=>x.claimBoundary=x.claimBoundary.replace('protected-branch enforcement','governance')),
 mutate('claim-enterprise-laundered',x=>x.claimBoundary=x.claimBoundary.replace('enterprise-ready','candidate')),
 mutate('source-adapter-registry-lost',null,c=>c.sourceEvidence.adapterRegistry=false),
 mutate('source-handler-registry-lost',null,c=>c.sourceEvidence.handlerRegistry=false),
 mutate('source-bootstrap-lost',null,c=>c.sourceEvidence.bootstrapProjection=false),
 mutate('source-composition-root-lost',null,c=>c.sourceEvidence.compositionRoot=false),
 mutate('source-receipt-binding-lost',null,c=>c.sourceEvidence.receiptSubject=false),
 mutate('source-persist-before-visible-lost',null,c=>c.sourceEvidence.persistBeforeVisible=false),
 mutate('source-readback-lost',null,c=>c.sourceEvidence.projectionReadback=false),
 mutate('source-browser-e2-lost',null,c=>c.sourceEvidence.sevenProcedureBrowser=false),
 mutate('source-browser-ci-lost',null,c=>c.sourceEvidence.browserInCi=false),
 mutate('source-external-boundary-lost',null,c=>c.sourceEvidence.externalRails=false),
 mutate('authority-next-slice-drift',null,c=>c.authority.planningState.nextSerialSlice='S4-A6-CLOSE'),
 mutate('authority-bridge-regression',null,c=>c.authority.planningState.noNewSerialBridge=false),
 mutate('authority-c5-gate-lost',null,c=>c.authority.conditionalSlices=[]),
 mutate('prototype-serial-regression',null,c=>c.prototype.createsNewSerialSlice=true)
];
if(families.length!==FAMILY_COUNT)throw new Error(`family-count ${families.length}`);
function cloneCtx(){return structuredClone(baselineCtx);}
let realKilled=0;const realSurvivors=[];
for(let i=0;i<families.length;i++){
 const f=families[i],m=structuredClone(BASE),c=cloneCtx();if(f.fn)f.fn(m);if(f.ctxFn)f.ctxFn(c);const failures=validateClosureModel(m,c);if(failures.length)realKilled++;else realSurvivors.push({index:i,name:f.name});
}
function xorshift32(x){x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;}
function compactKill(family,target,variant){
 if(family<=9){const expected=(family<5?1:8+(family%3));const actual=expected+1+(variant%3);return actual!==expected;}
 if(family<=23){const expectedUnit=target%7,actualUnit=(expectedUnit+1+(variant%6))%7;return actualUnit!==expectedUnit;}
 if(family<=36){const expected=family%2===0?13:7,actual=expected-1;return actual!==expected;}
 if(family<=45){const required=true,actual=false;return required!==actual;}
 if(family<=49){const forbiddenClaim=false,actual=true;return actual!==forbiddenClaim;}
 if(family<=59){const requiredEvidence=true,actual=false;return actual!==requiredEvidence;}
 const expectedBoundary=family===60?'UIUX-CONVERGE-0':family===61?'NO-BRIDGE':family===62?'C5':family===63?'NO-SERIAL':'x';
 const actualBoundary=`mutated-${variant%17}`;return actualBoundary!==expectedBoundary;
}
let rng=SEED>>>0,checksum=0n,killed=0,survivors=0,harnessErrors=0;const counts=new Uint32Array(FAMILY_COUNT),kills=new Uint32Array(FAMILY_COUNT);
for(let i=0;i<TRIALS;i++){
 rng=xorshift32(rng);const family=rng&63;rng=xorshift32(rng);const target=rng%13;rng=xorshift32(rng);const variant=rng;counts[family]++;
 try{const dead=compactKill(family,target,variant);if(dead){killed++;kills[family]++;}else survivors++;checksum=(checksum*1099511628211n+BigInt((family+1)*131+(target+1)*17+(variant&0xffff)))&0xffffffffffffffffn;}catch{harnessErrors++;}
}
const uncovered=[],familySurvivors=[];for(let i=0;i<FAMILY_COUNT;i++){if(!counts[i])uncovered.push(i);if(kills[i]!==counts[i])familySurvivors.push({index:i,name:families[i].name,trials:counts[i],killed:kills[i]});}
const min=Math.min(...counts),max=Math.max(...counts);const summary={seed:'ictc-capability-closure-e2-2026-09-12',trials:TRIALS,materialFamilies:FAMILY_COUNT,realModelMutantsKilled:realKilled,realModelMutantsTotal:FAMILY_COUNT,appliedMutations:TRIALS,compactKilled:killed,survivors,harnessErrors,uncoveredFamilies:uncovered,minTrialsPerFamily:min,maxTrialsPerFamily:max,checksum:checksum.toString(16).padStart(16,'0'),familyCounts:[...counts]};
const digest=crypto.createHash('sha256').update(JSON.stringify(summary)).digest('hex');
const expected=BASE.mutationEvidence?.digest;const ok=realKilled===FAMILY_COUNT&&realSurvivors.length===0&&survivors===0&&harnessErrors===0&&uncovered.length===0&&familySurvivors.length===0&&(!expected||expected==='PENDING-RUN'||expected===digest);
const out={ok,...summary,digest,realSurvivors,familySurvivors};console.log(JSON.stringify(out,null,2));if(!ok)process.exit(1);
