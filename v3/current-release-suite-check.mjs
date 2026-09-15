import { access, readFile } from 'node:fs/promises';
import { CURRENT_RUNTIME, CURRENT_SEMANTIC } from './current-release-suite.mjs';
import { ASSURANCE_COVERAGE_CONTRACT } from './assurance-risk-model.mjs';
import { LEGACY_DEMO_GATES, DEMO_SUITE_GATES, NATIVE_GATES, CURRENT_AUTHORITY_VECTOR } from './current-gate-registry.mjs';

const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
const ci=await readFile(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8');
const postMerge=await readFile(new URL('../.github/workflows/post-merge-evidence.yml',import.meta.url),'utf8');
const currentRelease=await readFile(new URL('./current-release-suite.mjs',import.meta.url),'utf8');
const currentSemantic32=await readFile(new URL('./current-semantic-3-2.mjs',import.meta.url),'utf8');
const failures=[];
const check=(condition,message)=>{if(!condition)failures.push(message);};

check(pkg.scripts?.test==='npm run test:current','package.json test must resolve to test:current');
check(pkg.scripts?.['test:current:semantic']==='node v3/current-semantic-3-2.mjs','semantic current suite must resolve through native lattice 3.2 wrapper');
check(pkg.scripts?.['test:current:runtime']==='node v3/current-release-suite.mjs runtime','runtime current suite script drift');
check(pkg.scripts?.['test:current']==='npm run test:current:semantic && npm run test:current:runtime','current suite aggregator drift');
check(postMerge.includes('npm run test:current'),'post-merge evidence must execute the current suite');
check(!postMerge.includes('- run: npm test'),'post-merge evidence must not execute the historical npm test alias directly');
check(ci.includes('npm run test:current:semantic'),'PR CI must consume the canonical semantic current suite');
check(ci.includes('npm run test:current:runtime'),'PR CI must consume the canonical runtime current suite');
check(currentRelease.includes('const CHECK_TIMEOUT_MS=60_000'),'default per-check timeout must remain bounded at 60 seconds');
check(currentRelease.includes("'v3/runtime-stabilization-command-ledger-check.mjs':180_000"),'FULL-sync command-ledger durability gate must retain its explicit I/O-heavy timeout budget');

const paths=[...new Set([...CURRENT_SEMANTIC,...CURRENT_RUNTIME])];
for(const path of paths){try{await access(new URL(`../${path}`,import.meta.url));}catch{failures.push(`current suite path missing: ${path}`);}}
check(new Set(CURRENT_SEMANTIC).size===CURRENT_SEMANTIC.length,'semantic suite contains duplicate check paths');
check(new Set(CURRENT_RUNTIME).size===CURRENT_RUNTIME.length,'runtime suite contains duplicate check paths');
for(const [family,contract] of Object.entries(ASSURANCE_COVERAGE_CONTRACT)){
  const suite=contract.mode==='runtime'?CURRENT_RUNTIME:CURRENT_SEMANTIC;
  check(contract.candidates.some(path=>suite.includes(path)),`assurance coverage family missing from ${contract.mode} suite: ${family}`);
}

const directSemantic=['v3/procedure-finetuning-2-3-check.mjs','v3/procedure-record-contract-2-4-check.mjs','v3/surface-truth-contract-2-5-check.mjs','v3/shell-admin-demo-check-2-6.mjs','v3/semantic-closure-2-8-causality-check.mjs','v3/semantic-closure-2-8-ui-check.mjs','v3/semantic-closure-2-8-saturation.mjs','v3/runtime-stabilization-semantic-check.mjs','v3/runtime-stabilization-2-9-saturation.mjs','v3/semantic-foundation-3-0-check.mjs','v3/semantic-foundation-3-0-saturation.mjs'];
for(const gate of directSemantic)check(CURRENT_SEMANTIC.includes(gate),`versioned semantic gate must be directly attributable: ${gate}`);
for(const gate of ['v3/semantic-closure-2-8-runtime-check.mjs','v3/runtime-stabilization-command-ledger-check.mjs'])check(CURRENT_RUNTIME.includes(gate),`versioned runtime gate must be directly attributable: ${gate}`);

const native32=['v3/native-semantic-lattice-3-2-check.mjs','v3/native-semantic-lattice-3-2-ui-check.mjs','v3/native-semantic-lattice-3-2-saturation.mjs','v3/native-semantic-lattice-3-2-stress.mjs'];
for(const gate of native32){
  check(NATIVE_GATES.includes(gate),`native lattice gate must be directly attributable in current gate registry: ${gate}`);
  try{await access(new URL(`./${gate.replace('v3/','')}`,import.meta.url));}catch{failures.push(`native lattice gate path missing: ${gate}`);}
}
const legacyDemo=['v3/demo-seed-contract-check.mjs','v3/demo-seed-saturation.mjs','v3/demo-outcome-audit-check.mjs','v3/demo-outcome-saturation.mjs','v3/demo-reality-context-check.mjs','v3/demo-procedure-ontology-check.mjs','v3/demo-operating-year-check.mjs','v3/demo-operating-year-saturation.mjs'];
check(JSON.stringify([...LEGACY_DEMO_GATES])===JSON.stringify(legacyDemo),'legacy DEMO retirement registry drift');
const suite22=['v3/demo-suite-2-2-module-load-check.mjs','v3/demo-suite-2-2-runtime-semantic-check.mjs','v3/demo-suite-2-2-runtime-store-check.mjs','v3/demo-suite-2-2-projection-closure-check.mjs'];
check(JSON.stringify([...DEMO_SUITE_GATES])===JSON.stringify(suite22),'Suite 2.2 acceptance registry drift');
for(const gate of suite22){try{await access(new URL(`./${gate.replace('v3/','')}`,import.meta.url));}catch{failures.push(`Suite 2.2 gate path missing: ${gate}`);}}
const presentationRetirement=['v3/ui-finetuning-3-4-check.mjs','v3/ui-finetuning-3-4-saturation.mjs'];
const beautySemanticP5=['v3/uiux-beauty-semantic-p5-check.mjs','v3/uiux-beauty-semantic-p5-mutation-1m.mjs','v3/uiux-beauty-semantic-p5-new-main-mutation-1m.mjs'];
for(const gate of beautySemanticP5){check(NATIVE_GATES.includes(gate),`P5 beauty-semantic gate missing from native registry: ${gate}`);try{await access(new URL(`./${gate.replace('v3/','')}`,import.meta.url));}catch{failures.push(`P5 beauty-semantic gate path missing: ${gate}`);}}
for(const gate of presentationRetirement){
  check(NATIVE_GATES.includes(gate),`presentation-retirement gate missing from native registry: ${gate}`);
  try{await access(new URL(`./${gate.replace('v3/','')}`,import.meta.url));}catch{failures.push(`presentation-retirement gate path missing: ${gate}`);}
}
check(currentSemantic32.includes('CURRENT_SEMANTIC_ACTIVE')&&currentSemantic32.includes('LEGACY_DEMO_GATES')&&currentSemantic32.includes('DEMO_SUITE_GATES')&&currentSemantic32.includes('NATIVE_GATES'),'semantic wrapper must consume explicit current/replaced/Suite 2.2/native registry classes');
check(CURRENT_AUTHORITY_VECTOR.uiPresentation?.value==='local-owners','current authority vector must publish local presentation owners');
check(CURRENT_AUTHORITY_VECTOR.uiPresentation?.classification==='canonical-distributed-presentation','current presentation classification must be canonical distributed ownership');

if(failures.length){console.error(JSON.stringify({ok:false,failures},null,2));process.exit(1);}
console.log(JSON.stringify({ok:true,semanticChecks:CURRENT_SEMANTIC.length,runtimeChecks:CURRENT_RUNTIME.length,uniqueChecks:paths.length,coverageFamilies:Object.keys(ASSURANCE_COVERAGE_CONTRACT).length,legacyDemoGatesRetired:legacyDemo.length,demoSuite22Gates:suite22.length,presentationRetirementGates:presentationRetirement.length,beautySemanticP5Gates:beautySemanticP5.length,procedureFineTuningContract:'2.4.0',surfaceTruthContract:'2.5.0',shellAdminDemoContract:'2.6.0',semanticClosureContract:'2.8.0',runtimeStabilizationContract:'2.9.0',semanticFoundationContract:'3.0.1',nativeSemanticLatticeContract:'3.2.0',uiPresentationContract:'local-owners',versionedGateAttribution:'direct+registry+wrapper',defaultCheckTimeoutMs:60000,ioHeavyCommandLedgerTimeoutMs:180000}));
