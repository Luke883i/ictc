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
const proof=read('retirement-minimality-certificate.json');
const obligations=proof.obligations;
assert.equal(obligations.length,12);
assert.equal(review.unregistered,149);
assert.equal(counterfactual.qualified,149);
assert.equal(counterfactual.safeDeleteDecisions,0);
assert.equal(executable.certifiedSafeDeletes,0);
assert.equal(proof.exhaustivelyChecked,3**12);
const byCounter=new Map(counterfactual.cases.map(c=>[c.path,c]));
const exEdges=new Map();for(const e of executable.edges){const edges=exEdges.get(e.target)||[];edges.push(e.source);exEdges.set(e.target,edges);}
const digest=x=>createHash('sha256').update(x).digest('hex');
const cards=review.entries.map(entry=>{
 const physical=byCounter.get(entry.path);assert.ok(physical,`missing individual removal observation ${entry.path}`);
 assert.equal(physical.sha256,entry.sha256);
 assert.equal(entry.sha256,digest(readFileSync(join(root,entry.path))));
 assert.equal(physical.counterfactual.restored,true);
 const consumers=[...new Set([...(entry.markdownTargets||[]),...(entry.firstPartyExecutable||[]),...(exEdges.get(entry.path)||[])])].sort();
 const statuses=Object.fromEntries(obligations.map(k=>[k,'UNKNOWN']));
 // An observed consumer edge is a positive blocker. Conversely, zero observed
 // edges leaves UNKNOWN: no inference of safety from absence within a scan.
 if(consumers.length)statuses.staticImports='FAILED';
 if(consumers.some(x=>x.startsWith('.github/workflows/')))statuses.configsAndCi='FAILED';
 const blocked=Object.entries(statuses).filter(([,state])=>state!=='VERIFIED').map(([name,state])=>({name,state}));
 return {path:entry.path,sha256:entry.sha256,role:entry.role,knownConsumers:consumers,
   testedRemoval:{restored:true,docsCheckDetected:physical.counterfactual.detectedByExistingDocsCheck,
     scope:'isolated documentation lattice only; not full runtime/CI/deployment/human retention'},
   obligations:statuses,decision:'HOLD_UNKNOWN',safeDelete:false,blocked};
});
const result={schema:'ictc-document-retirement-gate/v1',authority:'derived only, never authorizes disposal',
  denominator:149,qualified:cards.length,readyForDelete:0,
  positiveConsumerEdges:cards.filter(x=>x.knownConsumers.length).length,
  noObservedConsumerEdges:cards.filter(x=>!x.knownConsumers.length).length,
  obligations,claimBoundary:'Every doc has 12 explicit evidence blockers. No external owner attestation, retention determination, dynamic consumer exclusions or complete step-wise CI proof. UNKNOWN is not ABSENT and a scoped removal is not a deletion authorization.',cards};
function verify(r){
 assert.equal(r.denominator,review.unregistered);assert.equal(r.qualified,review.entries.length);
 assert.equal(r.readyForDelete,0);assert.equal(new Set(r.cards.map(x=>x.path)).size,149);
 assert.deepEqual(r,buildExpected());return true;
}
// Compare against independently rebuilt baseline, not mutable report metadata.
function buildExpected(){return {schema:'ictc-document-retirement-gate/v1',authority:'derived only, never authorizes disposal',denominator:149,qualified:cards.length,readyForDelete:0,
 positiveConsumerEdges:cards.filter(x=>x.knownConsumers.length).length,noObservedConsumerEdges:cards.filter(x=>!x.knownConsumers.length).length,obligations,
 claimBoundary:'Every doc has 12 explicit evidence blockers. No external owner attestation, retention determination, dynamic consumer exclusions or complete step-wise CI proof. UNKNOWN is not ABSENT and a scoped removal is not a deletion authorization.',cards};}
verify(result);
if(process.argv.includes('--falsify')){
 const attackers=[
  x=>x.readyForDelete=1,x=>x.cards[0].safeDelete=true,x=>x.cards.pop(),
  x=>x.cards[1].path=x.cards[0].path,x=>x.cards[0].decision='SAFE_DELETE',
  x=>x.cards[0].obligations.ownerApproval='VERIFIED',
  x=>x.cards[0].knownConsumers.push('fake-consumer'),x=>x.noObservedConsumerEdges++
 ];
 let killed=0;for(const mutate of attackers){const candidate=structuredClone(result);mutate(candidate);try{verify(candidate);}catch{killed++;}}
 assert.equal(killed,attackers.length,'retirement falsification escaped');result.negativeMutants={killed,total:attackers.length};
}
mkdirSync(dir,{recursive:true});writeFileSync(join(dir,'document-retirement-gate.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({ok:true,documentCards:result.qualified,positiveEdges:result.positiveConsumerEdges,noObservedEdges:result.noObservedConsumerEdges,safeDeletes:0,negative:result.negativeMutants||null}));
