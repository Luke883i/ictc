import {census,verifyInventory} from './repository-inventory.mjs';
import {writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {root} from './repository-inventory.mjs';
const base=census();verifyInventory(base);
for(const path of ['.env.example','LICENSE.md','NOTICE.md']){
  const entry=base.entries.find(x=>x.path===path);
  if(!entry||entry.purposeState!=='active-root')throw new Error('protected configuration/legal root misclassified: '+path);
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
];
const results=[];
for(const [name,mutate] of mutations){const copy=clone();mutate(copy);try{verifyInventory(copy,base);results.push({name,killed:false});}catch(error){results.push({name,killed:true,reason:String(error.message).slice(0,140)});}}
const output={cases:results.length,killed:results.filter(x=>x.killed).length,results,scope:'real tracked-tree oracle, mutated receipts rather than source code'};
mkdirSync(join(root,'artifacts'),{recursive:true});writeFileSync(join(root,'artifacts/repository-inventory-falsification.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output));if(output.killed!==output.cases)process.exit(1);
