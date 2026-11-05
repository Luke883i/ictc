/** Non-authoritative projection of existing documentary, consumer and finite-retirement evidence.
 * A missing consumer is never proof of absence, and this script never authorizes deletion.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync} from 'node:fs';
import {execFileSync,spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {join,dirname} from 'node:path';
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
/** C1-3c: bounded historical witnesses, not a lifecycle registry or a
 * safe-delete list. PR associations are immutable GitHub observations; only
 * local Git ancestry, historical blobs and exact file bytes are asserted here.
 * Original paths and public URLs remain unchanged.
 */
const historicalPilotOrigins=Object.freeze({
 'docs/17_SATURATION_V2.md':{commit:'c210b79218f648ac3bc0f8ea25da003082f3e75e',observedPr:2},
 'docs/23_VALIDATION_REPORT_V2.md':{commit:'e7829443ad9f9b5087fb6d35f3fe387ddaae3d7e',observedPr:1},
 'docs/24_BLUEPRINT_V2_ITALIANO.md':{commit:'e7829443ad9f9b5087fb6d35f3fe387ddaae3d7e',observedPr:1},
 'docs/V2_0_EPISTEMIC_LATTICE_CONVERGENCE.md':{commit:'84d7b64566dbf75c8e6fef909057c10e41bf086d',observedPr:59},
 'docs/V2_GRC_CONVERGENCE.md':{commit:'a4fc60a9b0b11e25c511307e90c5e03724552cc4',observedPr:46},
 'docs/V2_GRC_DOD.md':{commit:'b43506d66c8fa660ececb0f3ff9de7052bb93bec',observedPr:46}
});
function historicalWitness(path,origin,bytesRoot=root){
 assert.match(origin.commit,/^[a-f0-9]{40}$/);
 const ancestor=spawnSync('git',['merge-base','--is-ancestor',origin.commit,'HEAD'],{cwd:root,encoding:'utf8'});
 assert.equal(ancestor.status,0,'origin commit not an ancestor of candidate: '+path);
 const opts={cwd:root,encoding:'utf8'};
 const originBlob=execFileSync('git',['rev-parse',origin.commit+':'+path],opts).trim();
 const candidateBlob=execFileSync('git',['rev-parse','HEAD:'+path],opts).trim();
 assert.match(originBlob,/^[a-f0-9]{40}$/);
 assert.equal(candidateBlob,originBlob,'Git tree blob drift: '+path);
 const oldBytes=execFileSync('git',['show',origin.commit+':'+path],{cwd:root,maxBuffer:2*1024*1024});
 const currentBytes=readFileSync(join(bytesRoot,path));
 assert.equal(digest(currentBytes),digest(oldBytes),'historical content drift: '+path);
 return {originCommit:origin.commit,originPrObservation:origin.observedPr,
   originBlob,candidateBlob,exactBytesPreserved:true,ancestorVerified:true,
   githubPrAssociationVerifiedByCi:false};
}
const historicalPilotPaths=Object.keys(historicalPilotOrigins);
const cardsByPath=new Map(cards.map(x=>[x.path,x]));
const lineagePilot=historicalPilotPaths.map(path=>{
 const card=cardsByPath.get(path),tracked=inventoryByPath.get(path),origin=historicalPilotOrigins[path];
 assert.ok(card&&tracked,'historical sample path missing from existing owner census: '+path);
 assert.equal(tracked.category,'document:unregistered','historical sample unexpectedly entered current manifest: '+path);
 assert.equal(tracked.sha256,card.sha256);
 assert.equal(card.testedRemoval.restored,true);
 assert.equal(card.safeDelete,false);
 const history=historicalWitness(path,origin);
 const logicalHandling=tracked.purposeState==='lineage-only'?'ARCHIVE_LOGICAL':'PRESERVE_EXISTING_REFERENCES';
 return {path,sha256:card.sha256,canonicalPurpose:tracked.purposeState,canonicalReason:tracked.purposeReason,
   historicalWitness:history,logicalHandling,
   disposition:'HOLD_REVIEW',observedConsumerSources:card.knownConsumers,
   independentOnlyReaders:card.reconciliation.independentOnlyReaders,
   unresolvedBasenameMentions:card.reconciliation.unresolvedBasenameMentions,
   isolatedDocsGateDetected:card.testedRemoval.docsCheckDetected,isolatedRestorationVerified:card.testedRemoval.restored,
   claimPreservation:'ORIGINAL_BYTES_AND_PUBLIC_PATH_UNCHANGED',
   unproven:{humanRetention:'UNKNOWN',externalAndPublicUrls:'UNKNOWN',dynamicConsumers:'UNKNOWN',
     fullRuntimeAndCiRemoval:'UNKNOWN',prHistoryAndSemanticUniqueness:'UNKNOWN'},
   physicalMoveAuthorized:false,physicalDeleteAuthorized:false};
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
 assert.ok(r.lineagePilot.every(x=>x.claimPreservation==='ORIGINAL_BYTES_AND_PUBLIC_PATH_UNCHANGED'&&
   x.historicalWitness.exactBytesPreserved&&x.historicalWitness.ancestorVerified&&
   x.historicalWitness.originBlob===x.historicalWitness.candidateBlob&&
   x.historicalWitness.githubPrAssociationVerifiedByCi===false));
 assert.ok(r.lineagePilot.every(x=>['ARCHIVE_LOGICAL','PRESERVE_EXISTING_REFERENCES'].includes(x.logicalHandling)));
 assert.ok(r.lineagePilot.every(x=>Object.values(x.unproven).every(y=>y==='UNKNOWN')));
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
  x=>x.lineagePilot[0].sha256='0'.repeat(64),
  x=>x.lineagePilot[0].historicalWitness.originBlob='0'.repeat(40),
  x=>x.lineagePilot[0].historicalWitness.ancestorVerified=false,
  x=>x.lineagePilot[0].historicalWitness.githubPrAssociationVerifiedByCi=true,
  x=>x.lineagePilot[0].claimPreservation='ORIGINAL_REPLACED',
  x=>x.lineagePilot[0].logicalHandling='RETIRE_PHYSICAL'
 ];
 let killed=0;for(const mutate of attackers){const candidate=structuredClone(result);mutate(candidate);try{verify(candidate);}catch{killed++;}}
 assert.equal(killed,attackers.length,'retirement falsification escaped');
 // Six real, disposable on-disk byte edits: every altered historical source must
 // be rejected by the same origin witness, with the Git checkout untouched.
 const scratch=mkdtempSync(join(tmpdir(),'ictc-c1-3c-lineage-'));
 let physicalKilled=0;
 try{
   for(const [path,origin] of Object.entries(historicalPilotOrigins)){
     const target=join(scratch,path);
     mkdirSync(dirname(target),{recursive:true});
     writeFileSync(target,Buffer.concat([readFileSync(join(root,path)),Buffer.from('\\n# FALSE HISTORICAL CLAIM\\n')]));
     try{historicalWitness(path,origin,scratch);}
     catch(error){if(/historical content drift/.test(String(error.message)))physicalKilled++;else throw error;}
   }
 }finally{rmSync(scratch,{recursive:true,force:true});}
 assert.equal(physicalKilled,historicalPilotPaths.length,'historical source mutation escaped');
 result.negativeMutants={killed,total:attackers.length,physicalBytesMutatedAndRejected:physicalKilled};

}
mkdirSync(dir,{recursive:true});writeFileSync(join(dir,'document-retirement-gate.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({ok:true,documentCards:result.qualified,pilotDocuments:result.lineagePilot.length,independentlyQualified:result.crossOracle.independentlyQualified,sourceHashesBound:result.crossOracle.hashBoundToCanonicalInventory,independentOnlyPositiveDocuments:result.crossOracle.independentExclusivePositiveDocuments,positiveEdges:result.positiveConsumerEdges,noObservedEdges:result.noObservedConsumerEdges,historySourceBytesPreserved:result.lineagePilot.filter(x=>x.historicalWitness.exactBytesPreserved).length,logicalArchives:result.lineagePilot.filter(x=>x.logicalHandling==='ARCHIVE_LOGICAL').length,physicalArchives:0,safeDeletes:0,negative:result.negativeMutants||null}));
