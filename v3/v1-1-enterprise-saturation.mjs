import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { routeWorkIntent } from './runtime/work-orchestration.mjs';
import { PROCEDURE_IDS, normalizeProcedureFeatures, procedurePolicyProjection } from './runtime/procedure-policy.mjs';

const FINDINGS=Object.freeze({
 F01:'sparse-home-orientation',F02:'duplicate-process-catalog',F03:'grc-process-compression',F04:'evidence-audience-mismatch',F05:'technical-detail-too-early',F06:'feature-flag-ui-only',F07:'disabled-process-write',F08:'disabled-process-routing',F09:'modal-double-scroll',F10:'modal-close-offscreen',F11:'mobile-header-overload',F12:'row-scope-undocumented',F13:'brand-identity-drift',F14:'empty-visible-action',F15:'competing-primary-actions',F16:'legal-footer-drift',F17:'ai-dependency-dead-end',F18:'standalone-process-loss',F19:'evidence-business-context-loss',F20:'all-process-disabled-dead-end',F21:'disabled-process-scheduler',F22:'disabled-target-handoff'
});
const TARGET=Object.freeze({
 brand:'Integrated Compliance Tower Control',officialMark:true,homePulse:true,homePriorityCap:3,homeCatalog:false,catalogCopies:1,grcSiblingTabs:false,evidenceLabel:'Evidenze',businessEvidenceFirst:true,technicalLevel:5,featureFlagsServer:true,disabledWritesBlocked:true,disabledRoutingBlocked:true,modalScrollRegions:1,closeInside:true,mobileHeaderHeight:46,rowScopeDeclared:true,emptyButtons:0,primaryActions:1,legalFooter:true,aiMandatory:false,standaloneProcesses:7,evidenceHasDecisions:true,minimumEnabled:1,schedulerHonorsFlags:true,handoffsHonorTargetFlags:true
});
const PROCESSES=['monitoring','incidents','objects','coverage','actions','risks','assurance'];
const ROLES=['admin','user','auditor'];
const DEVICES=['desktop','mobile','tablet'];
const AI=['ready','off','failure'];
const INTENTS=['home','known-process','unknown-intent','evidence','admin','write','route','cross-process'];
const LOADS=['empty','normal','attention','heavy'];
const IDENTITIES=['local','trusted-header'];

function finding(code,detail){return{code,kind:FINDINGS[code],detail};}
function inspect(s,p=TARGET){const out=[];const add=(c,d='')=>out.push(finding(c,d));
 if(s.intent==='home'&&!p.homePulse)add('F01','Home lacks product-wide operational pulse');
 if(p.catalogCopies!==1||p.homeCatalog)add('F02',`catalog copies=${p.catalogCopies}, homeCatalog=${p.homeCatalog}`);
 if(PROCESSES.includes(s.process)&&['objects','coverage','actions','risks','assurance'].includes(s.process)&&p.grcSiblingTabs)add('F03',s.process);
 if(s.intent==='evidence'&&!p.businessEvidenceFirst)add('F04');
 if(s.intent==='home'&&p.technicalLevel<5)add('F05');
 if(s.intent==='admin'&&!p.featureFlagsServer)add('F06');
 if(s.intent==='write'&&s.processDisabled&&!p.disabledWritesBlocked)add('F07',s.process);
 if(s.intent==='route'&&s.processDisabled&&!p.disabledRoutingBlocked)add('F08',s.process);
 if(s.modalOpen&&p.modalScrollRegions>1)add('F09',String(p.modalScrollRegions));
 if(s.modalOpen&&!p.closeInside)add('F10');
 if(s.device==='mobile'&&p.mobileHeaderHeight>48)add('F11',String(p.mobileHeaderHeight));
 if(PROCESSES.includes(s.process)&&!p.rowScopeDeclared)add('F12',s.process);
 if((s.intent==='home'||s.intent==='known-process')&&(p.brand!=='Integrated Compliance Tower Control'||!p.officialMark))add('F13');
 if(p.emptyButtons>0)add('F14',String(p.emptyButtons));
 if(p.primaryActions>1)add('F15',String(p.primaryActions));
 if(!p.legalFooter)add('F16');
 if((s.ai==='off'||s.ai==='failure')&&p.aiMandatory)add('F17',s.ai);
 if(s.intent==='known-process'&&p.standaloneProcesses!==7)add('F18',String(p.standaloneProcesses));
 if(s.intent==='evidence'&&!p.evidenceHasDecisions)add('F19');
 if(s.intent==='admin'&&p.minimumEnabled<1)add('F20');
 if(s.process==='monitoring'&&s.processDisabled&&s.load!=='empty'&&!p.schedulerHonorsFlags)add('F21');
 if(s.intent==='cross-process'&&s.targetDisabled&&!p.handoffsHonorTargetFlags)add('F22',`${s.process}->${s.target}`);
 return out;
}
function scenario(i,{mutation=null}={}){const process=PROCESSES[i%PROCESSES.length],target=PROCESSES[(i*3+2)%PROCESSES.length];return{index:i,role:ROLES[i%ROLES.length],device:DEVICES[Math.floor(i/3)%DEVICES.length],ai:AI[Math.floor(i/9)%AI.length],intent:INTENTS[Math.floor(i/27)%INTENTS.length],load:LOADS[Math.floor(i/216)%LOADS.length],identity:IDENTITIES[Math.floor(i/864)%IDENTITIES.length],process,target,processDisabled:(i%5===0),targetDisabled:(i%7===0),modalOpen:(i%4===0),mutation};}
const MUTANTS=Object.freeze({
 F01:{homePulse:false},F02:{homeCatalog:true,catalogCopies:2},F03:{grcSiblingTabs:true},F04:{businessEvidenceFirst:false},F05:{technicalLevel:2},F06:{featureFlagsServer:false},F07:{disabledWritesBlocked:false},F08:{disabledRoutingBlocked:false},F09:{modalScrollRegions:2},F10:{closeInside:false},F11:{mobileHeaderHeight:64},F12:{rowScopeDeclared:false},F13:{brand:'ICTC',officialMark:false},F14:{emptyButtons:1},F15:{primaryActions:3},F16:{legalFooter:false},F17:{aiMandatory:true},F18:{standaloneProcesses:3},F19:{evidenceHasDecisions:false},F20:{minimumEnabled:0},F21:{schedulerHonorsFlags:false},F22:{handoffsHonorTargetFlags:false}
});
function relevantScenario(code,i){const base=scenario(i);switch(code){case'F01':return{...base,intent:'home'};case'F03':return{...base,intent:'known-process',process:'actions'};case'F04':case'F19':return{...base,intent:'evidence'};case'F05':return{...base,intent:'home'};case'F06':case'F20':return{...base,intent:'admin'};case'F07':return{...base,intent:'write',process:'coverage',processDisabled:true};case'F08':return{...base,intent:'route',process:'risks',processDisabled:true};case'F09':case'F10':return{...base,modalOpen:true};case'F11':return{...base,device:'mobile'};case'F12':return{...base,process:'objects'};case'F13':return{...base,intent:'home'};case'F17':return{...base,ai:'off'};case'F18':return{...base,intent:'known-process'};case'F21':return{...base,process:'monitoring',processDisabled:true,load:'attention'};case'F22':return{...base,intent:'cross-process',process:'risks',target:'actions',targetDisabled:true};default:return base;}}

// 1 -> M discovery: every scenario varies business dimensions and injects one falsifiable semantic mutation.
const discoveries=[];const firstDiscovery={};let M=0;const codes=Object.keys(FINDINGS);
for(let i=1;i<=codes.length*7;i++){
 const code=codes[(i*11+3)%codes.length],s=relevantScenario(code,i),policy={...TARGET,...MUTANTS[code]},findings=inspect(s,policy);discoveries.push({index:i,scenario:s,mutant:code,findings});
 for(const f of findings)if(firstDiscovery[f.code]==null){firstDiscovery[f.code]=i;M=Math.max(M,i);}
 if(Object.keys(firstDiscovery).length===codes.length&&i>=codes.length*3)break;
}
assert.equal(Object.keys(firstDiscovery).length,codes.length,`discovery missed ${codes.filter(c=>firstDiscovery[c]==null).join(',')}`);
assert.ok(M>0);

// Frozen M+1000 holdouts: semantically unique tuples, target policy only, no inert cosmetic salt.
const holdouts=[];const signatures=new Set();let cursor=M+1;
while(holdouts.length<1000){
 const s=scenario(cursor++);const sig=[s.role,s.device,s.ai,s.intent,s.load,s.identity,s.process,s.target,s.processDisabled,s.targetDisabled,s.modalOpen].join('|');
 if(signatures.has(sig))continue;signatures.add(sig);const findings=inspect(s,TARGET);holdouts.push({index:s.index,scenario:s,findings});
}
const holdoutFindings=holdouts.flatMap(x=>x.findings);assert.equal(holdoutFindings.length,0);
assert.equal(signatures.size,1000);

// Mutations must be discriminated by a semantically relevant scenario.
const mutationResults=[];
for(const code of codes){const s=relevantScenario(code,9000+codes.indexOf(code)),findings=inspect(s,{...TARGET,...MUTANTS[code]});const killed=findings.some(x=>x.code===code);mutationResults.push({code,killed,findings});assert.equal(killed,true,`${code} survived`);}

// Bind the abstract UX oracle to the executable procedure policy/routing substrate.
const allOn={settings:{procedures:{features:Object.fromEntries(PROCEDURE_IDS.map(id=>[id,true]))}}};
assert.equal(procedurePolicyProjection(allOn,{role:'admin'}).procedures.length,7);
const noRisk={settings:{procedures:{features:normalizeProcedureFeatures({risks:false},{features:Object.fromEntries(PROCEDURE_IDS.map(id=>[id,true]))})}}};
const routed=routeWorkIntent({text:'valuta rischio impatto probabilità',inputType:'text'},noRisk);
assert.equal(routed.candidates.some(x=>x.processId==='risks'),false,'disabled risk must not be routed');
assert.throws(()=>normalizeProcedureFeatures({features:Object.fromEntries(PROCEDURE_IDS.map(id=>[id,false]))},{features:Object.fromEntries(PROCEDURE_IDS.map(id=>[id,true]))}),error=>error.code==='procedure-policy-empty');

const report={schemaVersion:'1.1.0',releaseProfile:'1.1_stable',method:'semantic-novelty-convergence',discovery:{scenarioCount:discoveries.length,findingClasses:codes.length,M,firstDiscovery},confirmation:{from:M+1,holdouts:1000,semanticUniqueTuples:signatures.size,newFindingClasses:0,oracleMismatches:holdoutFindings.length},mutation:{total:mutationResults.length,killed:mutationResults.filter(x=>x.killed).length,survived:mutationResults.filter(x=>!x.killed).map(x=>x.code),score:mutationResults.filter(x=>x.killed).length/mutationResults.length},findingCatalog:FINDINGS,scope:{roles:ROLES,devices:DEVICES,aiModes:AI,intents:INTENTS,loads:LOADS,identities:IDENTITIES,processes:PROCESSES},evidenceGrade:'E2-model-assisted',claimBoundary:'No-novelty is bounded to declared enterprise experience/runtime invariants. It is not independent human research, production certification, legal compliance or proof of evidence sufficiency.'};
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});
await writeFile(new URL('../artifacts/v1-1-enterprise-saturation.json',import.meta.url),JSON.stringify(report,null,2));
console.log(`v1-1-enterprise-saturation: M=${M}; M+1000=0 new findings; mutation=${report.mutation.killed}/${report.mutation.total}`);
