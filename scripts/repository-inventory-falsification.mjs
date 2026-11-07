import {census,verifyInventory,v3DependencyTopology} from './repository-inventory.mjs';
import {deriveMigrationFrontier} from './repository-migration-frontier.mjs';
import {writeFileSync,mkdirSync,readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {root} from './repository-inventory.mjs';
const base=census();verifyInventory(base);
const sample=deriveMigrationFrontier([
 {path:'v3/runtime/k0-destination-probe.mjs',sha256:'a',bytes:1,v3StructuralRole:'runtime-candidate'},
 {path:'src/runtime/k0-destination-probe.mjs',sha256:'b',bytes:1,v3StructuralRole:null}
],{edges:[],dynamic:[]});
if(sample.nodes.length!==1||sample.nodes[0].destinationCandidate!=='src/runtime/k0-destination-probe.mjs'||
   !sample.nodes[0].blockers.includes('TARGET_PATH_OCCUPIED')||sample.nodes[0].decision!=='HOLD')
 throw new Error('K0 occupied candidate target did not veto migration');
const sibling=base.dependencyTopology.edges.find(e=>e.from==='v3/browser-v2-grc-check.py'&&e.to==='v3/browser-v3-all-service.py'&&e.kind==='python-sibling-literal-candidate');
const helper=base.dependencyTopology.edges.find(e=>e.from==='v3/browser-ao-activation.py'&&e.to==='v3/browser_test_support.py'&&e.kind==='python-local-import-candidate');
if(!sibling||!helper)throw new Error('K0 source-bound Python sibling/local-import edges not observed');
const absoluteCss=base.dependencyTopology.edges.find(e=>e.from==='v3/public/ui/procedure-finetuning-2-3.js'&&
 e.to==='v3/public/procedure-finetuning-2-3.css'&&e.kind==='browser-absolute-url-candidate');
if(!absoluteCss)throw new Error('K0 source-bound absolute browser URL reference not observed');
for(const name of ['v3/browser-v2-grc-check.py','v3/runtime/demo-suite-2-2-fixture.mjs'])
 if(!base.dependencyTopology.dynamic.includes(name))
  throw new Error('K0 dynamic consumer risk not observed: '+name);
for(const path of ['.env.example','LICENSE.md','NOTICE.md']){
  const entry=base.entries.find(x=>x.path===path);
  if(!entry||entry.purposeState!=='active-root')throw new Error('protected configuration/legal root misclassified: '+path);
}
if(base.migrationFrontier.summary.useQualification?.mappedV3!==base.status.v3Structural.files||
   base.migrationFrontier.nodes.some(x=>!x.observedUse||x.safeDeleteAuthorized!==false||
     x.useEvidence?.externalConsumers!=='UNKNOWN'||x.useEvidence?.runtimeNonContributionProven!==false))
 throw new Error('K0 use qualification fails closed');
if(base.migrationFrontier.nodes.find(x=>x.path==='v3/bootstrap.mjs')?.observedUse!=='DECLARED_RUNTIME_ROOT'||
   base.migrationFrontier.nodes.find(x=>x.path==='v3/server.mjs')?.observedUse!=='DECLARED_RUNTIME_ROOT')
 throw new Error('K0 canonical runtime roots absent');
const cutsets=base.migrationFrontier.cutsets;
const closed=base.migrationFrontier.closureReticulum;
if(Object.values(cutsets.counts).reduce((a,b)=>a+b,0)!==base.status.v3Structural.files||
   cutsets.automaticCohortMoveAuthorized!==false||
   cutsets.phaseDecisions.K4_ATOMIC_ENTRY_STATE!=='HOLD'||
   closed.minimalConjunctiveGateCount!==12||
   closed.directedDependencies.length!==19||
   closed.trackedV3!==base.status.v3Structural.files||
   closed.externallyCertified!==false||
   closed.automaticDeleteAuthorized!==false)
 throw new Error('reticular K0-K5 structural source-bound proof invalid');
for(const [path,phase] of [
 ['v3/server.mjs','K4_ATOMIC_ENTRY_STATE'],
 ['v3/runtime/grc-runtime-legacy.mjs','K3_RUNTIME_SCC'],
 ['v3/public/ui/procedure-finetuning-2-3.js','K2_CONTRACT_ASSET_FIXTURE'],
 ['v3/browser-v2-grc-check.py','K1_VERIFICATION']]){
 if(base.migrationFrontier.nodes.find(x=>x.path===path)?.phaseCandidate!==phase)
  throw new Error('reticular K1-K5 phase routing inconsistent: '+path);
}
const clone=()=>structuredClone(base);
const mutations=[
 ['omitted-file',d=>{d.entries.pop();d.status.total--;d.status.classified--;}],
 ['forged-digest',d=>{d.entries[0].sha256='0'.repeat(64);}],
 ['false-safe-delete',d=>{d.entries[0].disposition='SAFE_DELETE';}],
 ['false-registered-authority',d=>{let e=d.entries.find(x=>x.category==='document:unregistered');e.category='document:current';e.evidence='documentation-manifest';e.disposition='PROTECT_AUTHORITY';}],
 ['duplicated-path',d=>{d.entries[1].path=d.entries[0].path;}],
 ['fake-size',d=>{d.entries[0].bytes++;}],
 ['fake-total',d=>{d.status.total++;}],
 ['false-quarantine',d=>{d.status.automaticQuarantines++;}],
 ['forged-purpose-state',d=>{d.entries.find(x=>x.path==='LICENSE.md').purposeState='retirement-candidate';}],
 ['omitted-directory',d=>{d.directories.pop();}],
 ['forged-directory-subtree',d=>{d.directories[0].subtreeFiles++;}],
 ['forged-directory-bytes',d=>{d.directories[0].subtreeBytes++;}],
 ['false-directory-removal-authority',d=>{d.directories[0].moveOrDeleteAuthorized=true;}],
 ['forged-dynamic-risk',d=>{d.directories.find(x=>x.path==='v3').dynamicRiskFiles++;}],
 ['forged-legacy-class',d=>{d.directories.find(x=>x.path==='docs').explicitHistoricalOrMigrationFiles++;}],
 ['forged-allowed-retirement',d=>{d.directories.find(x=>x.path==='docs').retirementCandidates=1;}],
 ['false-root-direct-file-count',d=>{d.status.rootDirectFiles++;}],
 ['false-directory-count',d=>{d.status.directoryCount++;}],
 ['directory-authorization-laundering',d=>{d.status.directoryDisposition='AUTO_DELETE';}],
 ['v3-source-disguised-as-test',d=>{d.entries.find(x=>x.path==='v3/server.mjs').v3StructuralRole='verification';}],
 ['v3-public-url-disguised-as-fixture',d=>{d.entries.find(x=>x.path==='v3/public/index.html').v3StructuralRole='fixture-candidate';}],
 ['v3-fabricated-owner-qualification',d=>{d.status.v3Structural.ownerQualified=true;}],
 ['v3-rename-without-consumer-proof',d=>{d.status.v3Structural.moveOrRenameAuthorized=true;}],
 ['v3-fabricated-consumer-proof',d=>{d.status.v3Structural.independentConsumerProof=true;}],
 ['v3-fabricated-completeness',d=>{d.status.v3Structural.classifiedByPath++;}],
 ['v3-count-drift',d=>{d.status.v3Structural.topLevelFiles++;}],
 ['dependency-edge-omitted',d=>{d.dependencyTopology.edges.pop();}],
 ['dependency-invented-edge',d=>{d.dependencyTopology.edges.push({from:'v3/server.mjs',to:'v3/not-real.mjs',kind:'code-or-contract-literal'});}],
 ['dependency-fake-clearance',d=>{d.dependencyTopology.externalConsumersCleared=true;}],
 ['dependency-fake-move-authority',d=>{d.dependencyTopology.automaticMoveAuthorized=true;}],
 ['dependency-dynamic-risk-erased',d=>{d.dependencyTopology.dynamicSelectorSources=0;}],
 ['dependency-fake-covered-target',d=>{d.status.dependencyTopology.v3TargetsWithObservedLiterals++;}],
 ['python-sibling-edge-erased',d=>{const i=d.dependencyTopology.edges.findIndex(e=>e.from===sibling.from&&e.to===sibling.to&&e.kind===sibling.kind);if(i<0)throw new Error('missing sibling preimage');d.dependencyTopology.edges.splice(i,1);}],
 ['python-local-import-edge-erased',d=>{const i=d.dependencyTopology.edges.findIndex(e=>e.from===helper.from&&e.to===helper.to&&e.kind===helper.kind);if(i<0)throw new Error('missing helper preimage');d.dependencyTopology.edges.splice(i,1);}],
 ['python-runpy-risk-erased',d=>{d.dependencyTopology.dynamic=d.dependencyTopology.dynamic.filter(x=>x!=='v3/browser-v2-grc-check.py');d.dependencyTopology.dynamicSelectorSources--;}],
 ['js-dynamic-fixture-risk-erased',d=>{d.dependencyTopology.dynamic=d.dependencyTopology.dynamic.filter(x=>x!=='v3/runtime/demo-suite-2-2-fixture.mjs');d.dependencyTopology.dynamicSelectorSources--;}],
 ['frontier-node-omitted',d=>{d.migrationFrontier.nodes.pop();}],
 ['frontier-fabricated-clearance',d=>{d.migrationFrontier.nodes[0].decision='MOVE';}],
 ['frontier-blocker-erased',d=>{d.migrationFrontier.nodes[0].blockers=[];}],
 ['frontier-path-repointed',d=>{d.migrationFrontier.nodes[0].path='v3/fabricated.mjs';}],
 ['frontier-forged-scc',d=>{d.migrationFrontier.summary.sccCount++;}],
 ['frontier-fake-destination',d=>{d.migrationFrontier.nodes.find(x=>x.destinationCandidate===null).destinationCandidate='src/fake-owner.mjs';}],
 ['frontier-forged-external-count',d=>{d.migrationFrontier.nodes[0].observedExternalInbound++;}],
 ['frontier-forged-summary',d=>{d.status.migrationFrontier.mappedV3++;}],
 ['frontier-false-move-authority',d=>{d.migrationFrontier.summary.automaticMoveAuthorized=true;}],
 ['frontier-forged-target-collision',d=>{d.migrationFrontier.nodes[0].blockers.push('TARGET_PATH_OCCUPIED');}],
 ['frontier-http-edge-erased',d=>{const i=d.dependencyTopology.edges.findIndex(x=>x.kind==='http-static-route-candidate');if(i<0)throw Error('source HTTP preimage absent');d.dependencyTopology.edges.splice(i,1);}],
 ['frontier-http-mount-count-forged',d=>{d.dependencyTopology.httpStaticCandidateCount=0;}],
 ['liveness-forged-production-root',d=>{d.migrationFrontier.nodes.find(x=>x.path==='v3/store.mjs').observedUse='DECLARED_RUNTIME_ROOT';}],
 ['liveness-fabricated-nonruntime-proof',d=>{d.migrationFrontier.nodes[0].useEvidence.runtimeNonContributionProven=true;}],
 ['liveness-fabricated-external-clearance',d=>{d.migrationFrontier.nodes[0].useEvidence.externalConsumers='CLEARED';}],
 ['liveness-false-deletion',d=>{d.migrationFrontier.nodes[0].safeDeleteAuthorized=true;}],
 ['liveness-summary-forged',d=>{d.migrationFrontier.summary.useQualification.automaticallyRetirable++;}],
 ['liveness-historical-count-forged',d=>{d.migrationFrontier.summary.useQualification.byObservedUse.HISTORICAL_NO_RUNTIME_WITNESS++;}],
 ['liveness-source-evidence-erased',d=>{d.migrationFrontier.nodes.find(x=>x.path==='v3/server.mjs').useEvidence.runtimeRoot=false;}],
 ['liveness-false-runtime-noncontribution',d=>{d.migrationFrontier.summary.useQualification.runtimeNonContributionCertified++;}],
 ['browser-css-absolute-url-edge-erased',d=>{const i=d.dependencyTopology.edges.findIndex(e=>e.from===absoluteCss.from&&e.to===absoluteCss.to&&e.kind===absoluteCss.kind);if(i<0)throw Error('browser CSS preimage absent');d.dependencyTopology.edges.splice(i,1);}],
 ['cutset-forged-phase',d=>{d.migrationFrontier.nodes.find(x=>x.path==='v3/server.mjs').phaseCandidate='K1_VERIFICATION';}],
 ['cutset-forged-count',d=>{d.migrationFrontier.cutsets.counts.K4_ATOMIC_ENTRY_STATE++;}],
 ['cutset-false-authority',d=>{d.migrationFrontier.cutsets.automaticCohortMoveAuthorized=true;}],
 ['cutset-erased-cross-edges',d=>{d.migrationFrontier.cutsets.crossPhaseEdgeCounts={};}],
 ['closure-all-verified-forged',d=>{d.migrationFrontier.closureReticulum.gates.forEach(x=>{x.status='VERIFIED';});}],
 ['closure-false-auto-delete',d=>{d.migrationFrontier.closureReticulum.automaticDeleteAuthorized=true;}],
 ['closure-gate-omission',d=>{d.migrationFrontier.closureReticulum.gates.pop();}],
 ['closure-false-empty-v3',d=>{d.migrationFrontier.closureReticulum.trackedV3=0;}],
];
const results=[];
for(const [name,mutate] of mutations){const copy=clone();mutate(copy);try{verifyInventory(copy,base);results.push({name,killed:false});}catch(error){results.push({name,killed:true,reason:String(error.message).slice(0,140)});}}
// Physical source mutations: disposable copies of actual ICTC tracked sources.
// No mutation alters the tracked working tree or authorizes migration.
const originals=[
 'v3/browser-v2-grc-check.py',
 'v3/browser-v3-all-service.py',
 'v3/browser-ao-activation.py',
 'v3/browser_test_support.py',
 'v3/runtime/demo-suite-2-2-fixture.mjs',
 'v3/server.mjs',
 'v3/public/index.html',
 'v3/public/ui/procedure-finetuning-2-3.js',
 'v3/public/procedure-finetuning-2-3.css'
];
const scratch=mkdtempSync(join(tmpdir(),'ictc-k0-physical-'));
const physical=[];
try{
 const records=originals.map(path=>({path,body:readFileSync(join(root,path),'utf8')}));
 for(const rec of records){
  mkdirSync(join(scratch,rec.path.split('/').slice(0,-1).join('/')),{recursive:true});
  writeFileSync(join(scratch,rec.path),rec.body);
 }
 const entries=records.map(({path,body})=>({path,bytes:Buffer.byteLength(body)}));
 const graph=()=>v3DependencyTopology(entries,scratch);
 const mutations=[
  {name:'python-sibling-target-corruption',path:originals[0],search:"browser-v3-all-service.py",replace:"missing-v3-all-service.py",
   killed:g=>!g.edges.some(e=>e.from===originals[0]&&e.to===originals[1])&&g.unresolved.some(e=>e.from===originals[0]&&e.kind==='python-sibling-literal-candidate')},
  {name:'python-helper-import-corruption',path:originals[2],search:'from browser_test_support import ensure_onboarded',replace:'import json',
   killed:g=>!g.edges.some(e=>e.from===originals[2]&&e.to===originals[3]&&e.kind==='python-local-import-candidate')},
  {name:'template-fixture-dynamic-selector-erasure',path:originals[4],search:'new URL(`../demo/demo-suite-2-2-fixture-${part}.b64`,import.meta.url)',
   replace:"new URL('../demo/demo-suite-2-2-fixture-01.b64',import.meta.url)",
   killed:g=>!g.dynamic.includes(originals[4])},
  {name:'browser-absolute-css-link-corruption',path:originals[7],search:"link.href='/procedure-finetuning-2-3.css';",replace:"link.href='/missing-procedure-style.css';",
   killed:g=>!g.edges.some(e=>e.from===originals[7]&&e.to===originals[8]&&e.kind==='browser-absolute-url-candidate')&&
    g.unresolved.some(e=>e.from===originals[7]&&e.kind==='browser-absolute-url-candidate')},
  {name:'http-static-root-rebound',path:originals[5],search:"const publicRoot=path.join(here,'public');",
   replace:"const publicRoot=path.join(here,'public-assets');",
   killed:g=>g.httpStaticCandidateCount===0&&!g.edges.some(e=>e.kind==='http-static-route-candidate')}
 ];
 const before=graph();
 if(!before.edges.some(e=>e.from===originals[0]&&e.to===originals[1])||
    !before.edges.some(e=>e.from===originals[2]&&e.to===originals[3])||
    !before.dynamic.includes(originals[4])||
    !before.edges.some(e=>e.from===originals[7]&&e.to===originals[8]&&e.kind==='browser-absolute-url-candidate')||
    before.httpStaticCandidateCount!==3)
  throw new Error('K0 physical-preimage witness absent');
 for(let cycle=0;cycle<10;cycle++)for(const mutation of mutations){
  const original=records.find(r=>r.path===mutation.path).body;
  if(!original.includes(mutation.search))throw new Error('K0 physical-mutant seed missing: '+mutation.name);
  const changed=original.replace(mutation.search,mutation.replace);
  if(changed===original)throw new Error('K0 no-op physical-mutant: '+mutation.name);
  writeFileSync(join(scratch,mutation.path),changed);
  try{
   const killed=mutation.killed(graph());
   physical.push({cycle:cycle+1,name:mutation.name,killed});
   if(!killed)throw new Error('K0 physical source mutant survived: '+mutation.name);
  }finally{writeFileSync(join(scratch,mutation.path),original);}
 }
}finally{rmSync(scratch,{recursive:true,force:true});}
const output={cases:results.length,killed:results.filter(x=>x.killed).length,results,
 physicalSourceMutations:physical.length,physicalSourceMutantsKilled:physical.filter(x=>x.killed).length,
 physicalSourceCycles:10,physical,
 scope:'real tree inventory + receipt mutations + 40 isolated physical edits of actual source preimages; not full CI, not ten million source mutants'};
mkdirSync(join(root,'artifacts'),{recursive:true});writeFileSync(join(root,'artifacts/repository-inventory-falsification.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output));if(output.killed!==output.cases||output.physicalSourceMutantsKilled!==output.physicalSourceMutations)process.exit(1);
