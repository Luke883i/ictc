import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { buildSemanticClosureReceipt, evaluateSemanticClosureFreshness, validateSemanticOwnerContract } from './semantic-owner-runtime.mjs';
import { LOCAL_COMPOSITION_OWNERS } from './public/ui/native-semantic-lattice-3-2.js';

const read=path=>readFile(new URL(path,import.meta.url),'utf8');
const exists=async path=>{try{await stat(new URL(path,import.meta.url));return true}catch{return false}};
const contract=JSON.parse(await read('./semantic-owner-contract.json'));
const verdict=validateSemanticOwnerContract(contract);
assert.equal(verdict.ok,true,verdict.failures.join('\n'));
assert.equal(verdict.intentCoverage,1,'all declared atomic intentions must be disposition-accounted');
assert.equal(verdict.surfaceOwnerCoverage,1,'13/13 surface owners required');
assert.equal(verdict.taskRouteCoverage,1,'all task route families required');

for(const surface of contract.surfaceOwners)assert.equal(await exists(`./${surface.owner.replace(/^v3\//,'')}`),true,`owner file missing ${surface.id}: ${surface.owner}`);
for(const [surface,owner] of Object.entries(LOCAL_COMPOSITION_OWNERS)){
  if(surface==='navigation')continue;
  const declared=contract.surfaceOwners.find(item=>item.id===surface);
  assert.ok(declared,`native owner missing from C5 contract: ${surface}`);
  assert.equal(declared.owner,`v3/public/ui/${owner}`,`owner drift ${surface}`);
}
const aiSettings=contract.surfaceOwners.find(item=>item.id==='ai-settings');
assert.equal(aiSettings.owner,'v3/public/ui/settings-1-8-fix.js');

const [authority,convergence,manifestText,allocationText,active,annotation,settings,startHere,testing,v3Readme,registry]=await Promise.all([
  read('../docs/authority-matrix.yaml'),read('../docs/convergence/convergence-authority.json'),read('../docs/documentation-manifest.json'),read('./uiux-p3-screenshot-allocation.json'),
  read('./public/ui/active-experience.js'),read('./public/ui/semantic-composition-runtime.js'),read('./public/ui/settings-1-8-fix.js'),read('../docs/START_HERE.md'),read('../docs/TESTING.md'),read('./README.md'),read('./current-gate-registry.mjs')
]);
const convergenceModel=JSON.parse(convergence),manifest=JSON.parse(manifestText),allocation=JSON.parse(allocationText);
assert.match(authority,/ui_composition_root:\s*\n\s*authority: v3\/public\/ui\/active-experience\.js\s*\n\s*classification: exclusive/,'exclusive composition root authority missing');
assert.match(authority,/final_resolver: none/,'global final resolver must remain absent');
assert.ok(active.includes('installSemanticComposition'),'global annotation must remain mounted');
assert.ok(annotation.includes('annotation')||annotation.includes('semantic'),'semantic annotation runtime missing');
assert.ok(settings.includes('installSettings18Structure')&&settings.includes('data-ai-provider'),'P3B settings owner missing');

const c5=convergenceModel.conditionalSlices.find(item=>item.id==='C5-SEMANTIC-OWNER-COMPRESSION');
assert.ok(c5,'C5 missing from convergence authority');
assert.equal(c5.mustResolveBefore,'UIUX-CONVERGE-0+S4-A6-CLOSE');
assert.deepEqual(convergenceModel.externalRails.map(item=>item.id),['E3-HUMAN','E3-GOV','E4-DEPLOY']);
assert.equal(manifest.versionAxes?.convergenceGovernance?.value,'GOV-WB5','documentation governance axis must match convergence authority');
assert.equal(convergenceModel.governanceRevision,'GOV-WB5');
assert.ok((manifest.documents||[]).some(item=>item.path==='v3/README.md'&&item.authoritative===false),'v3 README must be registered as non-authoritative local operating projection');

assert.equal(allocation.findings.length,28,'P3 finding denominator drift');
assert.equal(allocation.findings.filter(item=>item.owner==='P3A').length,22,'P3A allocation drift');
assert.equal(allocation.findings.filter(item=>item.owner==='P3B').length,6,'P3B allocation drift');
assert.equal(new Set(allocation.findings.map(item=>item.id)).size,28,'P3 finding IDs must remain unique');

assert.ok(startHere.includes('## Router per tipo di modifica'),'START_HERE must begin contributor routing before deep curriculum');
for(const route of contract.taskRoutes)assert.ok(startHere.includes(`\`${route.id}\``)||startHere.toLowerCase().includes(route.id),'START_HERE task route missing '+route.id);
assert.ok(testing.includes('## Feedback per tipo di modifica'),'TESTING task-first feedback matrix missing');
assert.ok(v3Readme.includes('state.sqlite'),'v3 README must describe current SQLite persistence');
assert.ok(v3Readme.includes('npm start'),'v3 README must expose current bootstrap entry');
assert.equal(v3Readme.includes('runtime/tenants/<tenant-id>/ledger.jsonl'),false,'v3 README still advertises retired JSONL storage');
assert.equal(v3Readme.includes('./ictc-v3.sh start'),false,'v3 README still advertises retired launcher as canonical');

for(const gate of ['v3/c5-semantic-owner-check.mjs','v3/c5-semantic-owner-saturation.mjs','v3/c5-needs-audit-saturation.mjs'])assert.ok(registry.includes(`'${gate}'`),`current gate registry missing ${gate}`);
assert.ok(registry.indexOf("'v3/c5-semantic-owner-check.mjs'")<registry.indexOf("'v3/uiux-converge-0-check.mjs'"),'C5 owner gate must execute before UIUX convergence gates');

const inputContents={};
for(const path of contract.freshness.inputs)inputContents[path]=await read(`../${path}`);
const receipt=buildSemanticClosureReceipt(contract,{observedHead:process.env.GITHUB_SHA||contract.baseObservation.mainSha,inputs:inputContents,evidenceRefs:['C5 owner contract check','P3A/P3B merged prestate'],limitations:['E3-HUMAN/E3-GOV/E4-DEPLOY remain external']});
const fresh=evaluateSemanticClosureFreshness(receipt,{inputs:inputContents,dependencyReceipts:[]});
assert.equal(fresh.fresh,true,'fresh receipt rejected');
const mutated={...inputContents,[contract.freshness.inputs[0]]:inputContents[contract.freshness.inputs[0]]+'\nsemantic-drift'};
const stale=evaluateSemanticClosureFreshness(receipt,{inputs:mutated,dependencyReceipts:[]});
assert.equal(stale.fresh,false,'semantic input mutation must stale receipt');
assert.deepEqual(stale.staleInputs,[contract.freshness.inputs[0]],'stale input attribution drift');
const depReceipt=buildSemanticClosureReceipt(contract,{sliceId:'DEPENDENCY',observedHead:'dep',inputs:{'dep.txt':'a'}});
const dependent=buildSemanticClosureReceipt(contract,{observedHead:'head',inputs:inputContents,dependencyReceipts:[depReceipt]});
const depFresh=evaluateSemanticClosureFreshness(dependent,{inputs:inputContents,dependencyReceipts:[depReceipt]});
assert.equal(depFresh.fresh,true);
const depChanged={...depReceipt,receiptDigest:'0'.repeat(64)};
const depStale=evaluateSemanticClosureFreshness(dependent,{inputs:inputContents,dependencyReceipts:[depChanged]});
assert.equal(depStale.fresh,false,'dependency receipt drift must stale dependent receipt');
assert.deepEqual(depStale.staleDependencies,['DEPENDENCY']);

console.log(JSON.stringify({ok:true,slice:'C5-SEMANTIC-OWNER-COMPRESSION',surfaces:13,procedures:7,taskRoutes:contract.taskRoutes.length,atomicIntentCoverage:verdict.intentCoverage,p3Findings:28,receiptDigest:receipt.receiptDigest,claimBoundary:contract.claimBoundary}));
