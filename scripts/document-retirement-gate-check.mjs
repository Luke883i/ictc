/** Non-authoritative projection of existing documentary, consumer and finite-retirement evidence.
 * A missing consumer is never proof of absence, and this script never authorizes deletion.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {root} from './repository-inventory.mjs';
const dir=join(root,'artifacts');
const read=name=>JSON.parse(readFileSync(join(dir,name),'utf8'));
const review=read('document-retention-review.json');
const counterfactual=read('document-causal-qualification.json');
const executable=read('executable-doc-reference.json');
const independent=read('independent-document-consumer-scan.json');
const inventory=read('repository-inventory.json');
const proof=read('retirement-minimality-certificate.json');
const obligations=proof.obligations;
assert.equal(obligations.length,12);
assert.equal(review.unregistered,149);
assert.equal(counterfactual.qualified,149);
assert.equal(counterfactual.safeDeleteDecisions,0);
assert.equal(executable.certifiedSafeDeletes,0);
assert.equal(independent.qualified,review.unregistered);
assert.equal(independent.safeDeletes,0);
assert.equal(inventory.status.declaredSafeDeletes,0);
assert.equal(inventory.status.automaticQuarantines,0);
assert.equal(proof.exhaustivelyChecked,3**12);
const byCounter=new Map(counterfactual.cases.map(c=>[c.path,c]));
const exEdges=new Map();for(const e of executable.edges){const edges=exEdges.get(e.target)||[];edges.push(e.source);exEdges.set(e.target,edges);}
const digest=x=>createHash('sha256').update(x).digest('hex');
const independentByPath=new Map(independent.cases.map(x=>[x.path,x]));
const inventoryByPath=new Map(inventory.entries.map(x=>[x.path,x]));
assert.equal(independentByPath.size,review.unregistered,'independent source missing or duplicated path');
assert.equal(inventoryByPath.size,inventory.status.total,'source inventory missing or duplicated path');
const positiveIndependentReaders=x=>x.readers.filter(r=>['resolved-markdown-link','exact-path-literal'].includes(r.mode)).map(r=>r.source).sort();

const cards=review.entries.map(entry=>{
 const physical=byCounter.get(entry.path);assert.ok(physical,`missing individual removal observation ${entry.path}`);
 assert.equal(physical.sha256,entry.sha256);
 assert.equal(entry.sha256,digest(readFileSync(join(root,entry.path))));
 assert.equal(physical.counterfactual.restored,true);
 const independentlyObserved=independentByPath.get(entry.path);
 const tracked=inventoryByPath.get(entry.path);
 assert.ok(independentlyObserved&&tracked,'missing independent or canonical inventory path: '+entry.path);
 assert.equal(independentlyObserved.sha256,entry.sha256,'independent scan content drift: '+entry.path);
 assert.equal(tracked.sha256,entry.sha256,'canonical inventory content drift: '+entry.path);
 const originallyObserved=[...new Set([...(entry.markdownTargets||[]),...(entry.firstPartyExecutable||[]),...(exEdges.get(entry.path)||[])])].sort();
 const independentStrong=positiveIndependentReaders(independentlyObserved);
 // Add independent positive evidence; never convert absence in either scan into a verified-negative.
 const consumers=[...new Set([...originallyObserved,...independentStrong])].sort();
 const reconciliation={
   independentStrongReaders:independentStrong,
   independentOnlyReaders:independentStrong.filter(x=>!originallyObserved.includes(x)),
   originallyObservedOnlyReaders:originallyObserved.filter(x=>!independentStrong.includes(x)),
   unresolvedBasenameMentions:independentlyObserved.readers.filter(x=>x.mode==='basename-mention-unresolved').map(x=>x.source).sort(),
   absentReferenceIsProof:false,
   independentContentBound:true
 };

 const statuses=Object.fromEntries(obligations.map(k=>[k,'UNKNOWN']));
 // An observed consumer edge is a positive blocker. Conversely, zero observed
 // edges leaves UNKNOWN: no inference of safety from absence within a scan.
 if(consumers.length)statuses.staticImports='FAILED';
 if(consumers.some(x=>x.startsWith('.github/workflows/')))statuses.configsAndCi='FAILED';
 const blocked=Object.entries(statuses).filter(([,state])=>state!=='VERIFIED').map(([name,state])=>({name,state}));
 return {path:entry.path,sha256:entry.sha256,role:entry.role,knownConsumers:consumers,reconciliation,
   testedRemoval:{restored:true,docsCheckDetected:physical.counterfactual.detectedByExistingDocsCheck,
     scope:'isolated documentation lattice only; not full runtime/CI/deployment/human retention'},
   obligations:statuses,decision:'HOLD_UNKNOWN',safeDelete:false,blocked};
});
// Fixed review sample of six pre-existing, explicitly historical V2 documents.
 // A bounded pilot selection is NOT a new lifecycle registry or a declaration of no consumers.
const historicalPilotPaths=Object.freeze([
 'docs/17_SATURATION_V2.md',
 'docs/23_VALIDATION_REPORT_V2.md',
 'docs/24_BLUEPRINT_V2_ITALIANO.md',
 'docs/V2_0_EPISTEMIC_LATTICE_CONVERGENCE.md',
 'docs/V2_GRC_CONVERGENCE.md',
 'docs/V2_GRC_DOD.md'
]);
const cardsByPath=new Map(cards.map(x=>[x.path,x]));
const lineagePilot=historicalPilotPaths.map(path=>{
 const card=cardsByPath.get(path),tracked=inventoryByPath.get(path);
 assert.ok(card&&tracked,'historical sample path missing from existing owner census: '+path);
 assert.equal(tracked.sha256,card.sha256);
 assert.equal(card.testedRemoval.restored,true);
 assert.equal(card.safeDelete,false);
 return {path,sha256:card.sha256,canonicalPurpose:tracked.purposeState,canonicalReason:tracked.purposeReason,
   observedConsumerSources:card.knownConsumers,independentOnlyReaders:card.reconciliation.independentOnlyReaders,
   unresolvedBasenameMentions:card.reconciliation.unresolvedBasenameMentions,
   isolatedDocsGateDetected:card.testedRemoval.docsCheckDetected,isolatedRestorationVerified:card.testedRemoval.restored,
   unproven:{humanRetention:'UNKNOWN',externalAndPublicUrls:'UNKNOWN',dynamicConsumers:'UNKNOWN',
     fullRuntimeAndCiRemoval:'UNKNOWN',prHistoryAndSemanticUniqueness:'UNKNOWN'},
   disposition:'HOLD_REVIEW',physicalMoveAuthorized:false,physicalDeleteAuthorized:false};
});
const crossOracle={
 independentlyQualified:independentByPath.size,
 hashBoundToCanonicalInventory:cards.length,
 independentExclusivePositiveDocuments:cards.filter(x=>x.reconciliation.independentOnlyReaders.length>0).length,
 basenameMentionsRemainUnresolved:cards.filter(x=>x.reconciliation.unresolvedBasenameMentions.length>0).length,
 unprovedNegativeConsumerClaims:0,
 automatedRetirements:0
};
const result={schema:'ictc-document-retirement-gate/v1',authority:'derived only, never authorizes disposal',
  denominator:149,qualified:cards.length,readyForDelete:0,
  positiveConsumerEdges:cards.filter(x=>x.knownConsumers.length).length,
  noObservedConsumerEdges:cards.filter(x=>!x.knownConsumers.length).length,
  obligations,crossOracle,lineagePilot,claimBoundary:'Every doc has 12 explicit evidence blockers. No external owner attestation, retention determination, dynamic consumer exclusions or complete step-wise CI proof. UNKNOWN is not ABSENT and a scoped removal is not a deletion authorization.',cards};
function verify(r){
 assert.equal(r.denominator,review.unregistered);assert.equal(r.qualified,review.entries.length);
 assert.equal(r.readyForDelete,0);assert.equal(new Set(r.cards.map(x=>x.path)).size,149);
 assert.equal(r.crossOracle.hashBoundToCanonicalInventory,r.denominator);
 assert.equal(r.crossOracle.unprovedNegativeConsumerClaims,0);
 assert.equal(r.lineagePilot.length,6);
 assert.equal(new Set(r.lineagePilot.map(x=>x.path)).size,6);
 assert.ok(r.lineagePilot.every(x=>x.disposition==='HOLD_REVIEW'&&!x.physicalMoveAuthorized&&!x.physicalDeleteAuthorized));
 assert.ok(r.cards.every(x=>x.reconciliation.absentReferenceIsProof===false));
 assert.deepEqual(r,buildExpected());return true;
}
// Compare against independently rebuilt baseline, not mutable report metadata.
function buildExpected(){return {schema:'ictc-document-retirement-gate/v1',authority:'derived only, never authorizes disposal',denominator:149,qualified:cards.length,readyForDelete:0,
 positiveConsumerEdges:cards.filter(x=>x.knownConsumers.length).length,noObservedConsumerEdges:cards.filter(x=>!x.knownConsumers.length).length,obligations,crossOracle,lineagePilot,
 claimBoundary:'Every doc has 12 explicit evidence blockers. No external owner attestation, retention determination, dynamic consumer exclusions or complete step-wise CI proof. UNKNOWN is not ABSENT and a scoped removal is not a deletion authorization.',cards};}
verify(result);
if(process.argv.includes('--falsify')){
 const attackers=[
  x=>x.readyForDelete=1,x=>x.cards[0].safeDelete=true,x=>x.cards.pop(),
  x=>x.cards[1].path=x.cards[0].path,x=>x.cards[0].decision='SAFE_DELETE',
  x=>x.cards[0].obligations.ownerApproval='VERIFIED',
  x=>x.cards[0].knownConsumers.push('fake-consumer'),x=>x.noObservedConsumerEdges++,
  x=>x.cards[0].reconciliation.independentContentBound=false,
  x=>x.cards[0].reconciliation.independentStrongReaders.push('forged-source'),
  x=>x.cards[0].reconciliation.absentReferenceIsProof=true,
  x=>x.crossOracle.hashBoundToCanonicalInventory--,
  x=>x.crossOracle.unprovedNegativeConsumerClaims++,
  x=>x.lineagePilot.pop(),
  x=>x.lineagePilot[0].physicalMoveAuthorized=true,
  x=>x.lineagePilot[0].physicalDeleteAuthorized=true,
  x=>x.lineagePilot[0].unproven.humanRetention='VERIFIED',
  x=>x.lineagePilot[0].sha256='0'.repeat(64)
 ];
 let killed=0;for(const mutate of attackers){const candidate=structuredClone(result);mutate(candidate);try{verify(candidate);}catch{killed++;}}
 assert.equal(killed,attackers.length,'retirement falsification escaped');result.negativeMutants={killed,total:attackers.length};
}
mkdirSync(dir,{recursive:true});writeFileSync(join(dir,'document-retirement-gate.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({ok:true,documentCards:result.qualified,pilotDocuments:result.lineagePilot.length,independentlyQualified:result.crossOracle.independentlyQualified,sourceHashesBound:result.crossOracle.hashBoundToCanonicalInventory,independentOnlyPositiveDocuments:result.crossOracle.independentExclusivePositiveDocuments,positiveEdges:result.positiveConsumerEdges,noObservedEdges:result.noObservedConsumerEdges,safeDeletes:0,negative:result.negativeMutants||null}));
