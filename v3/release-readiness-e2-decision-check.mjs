import assert from 'node:assert/strict';
import {evaluateReleaseEligibility,REQUIRED_RECEIPTS,REQUIRED_GAPS} from './release-readiness-e2-decision.mjs';
import {evaluateReleaseFacts,selectConvergentPolicy} from './release-readiness-e2-lib.mjs';
import {exactProcedureSet,validateRuntimeHealth} from './release-readiness-e2-health.mjs';

const sha='a'.repeat(40),tree='b'.repeat(40),now=1_700_000_000_000;
const candidate={sha,tree,artifactDigest:'sha256:'+'c'.repeat(64)};
const gaps={gaps:REQUIRED_GAPS.map(id=>({id,status:'closed'}))};
const receipts=[...REQUIRED_RECEIPTS.map((type,i)=>({type,actor:type==='independent-review'?'independent-reviewer':type==='release-authority'?'release-authorizer':'build-owner',issuer:'outside-ictc-'+i,sha,tree,issuedAt:now-1000,expiresAt:now+60000})),...REQUIRED_GAPS.map((gapId,i)=>({type:'gap-closure',gapId,actor:'external-'+i,issuer:'external-service-'+i,sha,tree,issuedAt:now-1000,expiresAt:now+60000}))];
const verifier=(receipt,subject)=>({valid:true,provenance:'independent-source',subjectSha:subject.sha,subjectTree:subject.tree});
function decision(overrides={},opts={verifyExternal:verifier}){return evaluateReleaseEligibility({candidate,gaps,receipts,now,profile:'experimental',...overrides},opts);}
const scenarios=[];
function negative(label,overrides={},opts){const r=decision(overrides,opts);assert.equal(r.eligible,false,label);scenarios.push(label);}
assert.equal(decision().verdict,'GO_ELIGIBLE_PENDING_HUMAN_EXECUTION','MODEL fixture must have a reachable GO_ELIGIBLE state');
negative('no-trusted-verifier',{},{});
negative('wrong-candidate-sha',{candidate:{...candidate,sha:'d'.repeat(40)}});
negative('stale-evidence',{now:now+70000});
negative('missing-review',{receipts:receipts.filter(r=>r.type!=='independent-review')});
negative('missing-identity',{receipts:receipts.filter(r=>r.type!=='deployment-identity')});
negative('open-gap',{gaps:{gaps:[...gaps.gaps.slice(1),{id:REQUIRED_GAPS[0],status:'open'}]}});
negative('unverified-gap-closure',{receipts:receipts.filter(r=>r.gapId!==REQUIRED_GAPS[0])});
negative('separation-of-duties',{receipts:receipts.map(r=>r.type==='independent-review'?{...r,actor:'build-owner'}:r)});
negative('forged-verifier-return',{}, {verifyExternal:()=>({valid:true})});
negative('external-rejection',{}, {verifyExternal:()=>({valid:false,provenance:'independent-source',subjectSha:sha,subjectTree:tree})});
negative('enterprise-scope',{profile:'enterprise-candidate'});
negative('missing-signature-validity',{receipts:receipts.map(r=>r.type==='release-authority'?{...r,expiresAt:now-20}:r)});
negative('unknown-profile',{profile:'enterprise-ready'});
negative('no-candidate-digest',{candidate:{...candidate,artifactDigest:null}});
negative('closed-gap-with-invalid-receipt',{receipts:receipts.map(r=>r.gapId===REQUIRED_GAPS[0]?{...r,sha:'e'.repeat(40)}:r)});
const badVerifier=()=>{throw new Error('network unavailable')};negative('verifier-error',{}, {verifyExternal:badVerifier});
// Independent oracles for the HTTP surface: reject duplication, omission, extra, and version drift.
const ids=['a','b','c','d','e','f','g'];
assert.ok(exactProcedureSet(ids,ids));
for(const [name,services,supported,version] of [
  ['duplicate',Array(7).fill('a'),ids,'1.8.0'],
  ['missing',ids.slice(0,6),ids,'1.8.0'],
  ['foreign',[...ids.slice(0,6),'unknown'],ids,'1.8.0'],
  ['duplicate-supported',ids,Array(7).fill('a'),'1.8.0'],
  ['version-drift',ids,ids,'9.9.9']
]){
 const r=validateRuntimeHealth({ok:true,services,supportedServices:supported,version,integrity:{ok:true}},ids,'1.8.0');
 assert.equal(r.ok,false,name);scenarios.push('runtime-'+name);
}
const policy=selectConvergentPolicy();assert.equal(policy.evaluated,1000);assert.ok(policy.admissible>1);assert.ok(policy.frontier>1);assert.equal(policy.winner.id,'C9-0-9');
// Gap-state progress: closed is permitted when an externally verified closure is supplied.
const source={product:'',gaps,contributing:'',prTemplate:'',server:'',startup:'',http:'',readme:'',docs:'',truth:{externalEvidenceBoundaries:[{id:'E3-GOV-BRANCH-PROTECTION'},{id:'E3-HUMAN-VALIDATION'}],currentInternalBlockers:[{id:'S5-CANDIDATE-SEAL'}]},verifiedClosures:Object.fromEntries(REQUIRED_GAPS.map(id=>[id,{verified:true,source:'external-verifier'}]))};
const current=evaluateReleaseFacts(source),missing=evaluateReleaseFacts({...source,verifiedClosures:{}});
for(const id of ['L21','L22','L23']){assert.equal(current.local.find(x=>x.id===id)?.ok,true,id);assert.equal(missing.local.find(x=>x.id===id)?.ok,false,id);}
console.log(JSON.stringify({ok:true,modelEligibleReachable:true,modelIsNotAuthorizedRelease:true,negativeScenarios:scenarios.length,policy:{tested:policy.evaluated,admissible:policy.admissible,frontier:policy.frontier,winner:policy.winner.id},gapProgression:['L21','L22','L23']}));
