import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
await import('./delivery-provenance-check.mjs');

// Compiled semantic model for C2-DELIVERY-PROVENANCE.
// Values are deliberately multi-valued so composite mutations can collide/non-trivially interact.
const I=Object.freeze({
 exactSha:0,checkoutExact:1,fetchDepth:2,persistCreds:3,cleanTree:4,treeSha:5,
 packageHash:6,lockHash:7,archiveFromHead:8,archiveDigest:9,archiveIncludesLock:10,
 sbomGeneratedSameCheckout:11,sbomCycloneDx:12,sbomDigest:13,sbomCanonicalOwner:14,
 provenanceSource:15,provenanceInputs:16,provenanceOutputs:17,provenanceBoundary:18,
 buildAttest:19,sbomAttest:20,attestPinned:21,idToken:22,attestWrite:23,contentsRead:24,
 ghVerify:25,attestationIds:26,bundleReceipt:27,receiptDigest:28,
 enterpriseGateWired:29,currentRailWired:30,f06Owner:31,f06CandidateState:32,
 noNewAuthority:33,noNewWorkflow:34,noSecondSbomOwner:35,mergeNotRelease:36,noEnterprisePromotion:37,
 externalRailsOpen:38,keylessPolicyExplicit:39,repoBoundVerify:40,artifactUpload:41,
 actionPinsImmutable:42,subjectIsCandidate:43,sbomSubjectMatchesCandidate:44,workflowExactHeadEnv:45,
 failureFailClosed:46,postMergeActRequired:47
});
const N=48,BASE=new Int32Array(N).fill(1);
BASE[I.persistCreds]=0; BASE[I.noNewAuthority]=1; BASE[I.noNewWorkflow]=1; BASE[I.noSecondSbomOwner]=1;
BASE[I.noEnterprisePromotion]=1; BASE[I.externalRailsOpen]=1; BASE[I.f06CandidateState]=2; // 2=in-remediation-candidate, 1=resolved, 0=open/drift
BASE[I.fetchDepth]=0; // 0 means full history, nonzero means shallow/unknown

function validate(s){
 if(s[I.exactSha]!==1||s[I.checkoutExact]!==1||s[I.workflowExactHeadEnv]!==1)return 1;
 if(s[I.fetchDepth]!==0||s[I.persistCreds]!==0||s[I.cleanTree]!==1||s[I.treeSha]!==1)return 2;
 if(s[I.packageHash]!==1||s[I.lockHash]!==1)return 3;
 if(s[I.archiveFromHead]!==1||s[I.archiveDigest]!==1||s[I.archiveIncludesLock]!==1||s[I.subjectIsCandidate]!==1)return 4;
 if(s[I.sbomGeneratedSameCheckout]!==1||s[I.sbomCycloneDx]!==1||s[I.sbomDigest]!==1||s[I.sbomCanonicalOwner]!==1||s[I.sbomSubjectMatchesCandidate]!==1)return 5;
 if(s[I.provenanceSource]!==1||s[I.provenanceInputs]!==1||s[I.provenanceOutputs]!==1||s[I.provenanceBoundary]!==1)return 6;
 if(s[I.buildAttest]!==1||s[I.sbomAttest]!==1||s[I.attestPinned]!==1||s[I.actionPinsImmutable]!==1)return 7;
 if(s[I.idToken]!==1||s[I.attestWrite]!==1||s[I.contentsRead]!==1)return 8;
 if(s[I.ghVerify]!==1||s[I.repoBoundVerify]!==1||s[I.attestationIds]!==1||s[I.bundleReceipt]!==1||s[I.receiptDigest]!==1)return 9;
 if(s[I.enterpriseGateWired]!==1||s[I.currentRailWired]!==1||s[I.artifactUpload]!==1)return 10;
 if(s[I.f06Owner]!==1||s[I.f06CandidateState]!==2)return 11;
 if(s[I.noNewAuthority]!==1||s[I.noNewWorkflow]!==1||s[I.noSecondSbomOwner]!==1)return 12;
 if(s[I.mergeNotRelease]!==1||s[I.noEnterprisePromotion]!==1||s[I.externalRailsOpen]!==1||s[I.keylessPolicyExplicit]!==1||s[I.postMergeActRequired]!==1)return 13;
 if(s[I.failureFailClosed]!==1)return 14;
 return 0;
}
assert.equal(validate(BASE),0);
const op=(idx,val)=>[idx,val];
const F=[
 ['identity.expected-sha-cut','identity',[op(I.exactSha,0)]],
 ['identity.checkout-main','identity',[op(I.checkoutExact,0)]],
 ['identity.expected-env-cut','identity',[op(I.workflowExactHeadEnv,0)]],
 ['identity.shallow-checkout','identity',[op(I.fetchDepth,1)]],
 ['identity.credentials-persist','identity',[op(I.persistCreds,1)]],
 ['identity.dirty-tree-accepted','identity',[op(I.cleanTree,0)]],
 ['identity.tree-sha-cut','identity',[op(I.treeSha,0)]],
 ['input.package-hash-cut','inputs',[op(I.packageHash,0)]],
 ['input.lock-hash-cut','inputs',[op(I.lockHash,0)]],
 ['artifact.archive-worktree','artifact',[op(I.archiveFromHead,0)]],
 ['artifact.digest-cut','artifact',[op(I.archiveDigest,0)]],
 ['artifact.lock-excluded','artifact',[op(I.archiveIncludesLock,0)]],
 ['artifact.subject-not-candidate','artifact',[op(I.subjectIsCandidate,0)]],
 ['sbom.other-checkout','sbom',[op(I.sbomGeneratedSameCheckout,0)]],
 ['sbom.format-drift','sbom',[op(I.sbomCycloneDx,0)]],
 ['sbom.digest-cut','sbom',[op(I.sbomDigest,0)]],
 ['sbom.duplicate-owner','sbom',[op(I.sbomCanonicalOwner,0),op(I.noSecondSbomOwner,0)]],
 ['sbom.subject-mismatch','sbom',[op(I.sbomSubjectMatchesCandidate,0)]],
 ['prov.source-cut','provenance',[op(I.provenanceSource,0)]],
 ['prov.inputs-cut','provenance',[op(I.provenanceInputs,0)]],
 ['prov.outputs-cut','provenance',[op(I.provenanceOutputs,0)]],
 ['prov.boundary-cut','provenance',[op(I.provenanceBoundary,0)]],
 ['attest.build-cut','signing',[op(I.buildAttest,0)]],
 ['attest.sbom-cut','signing',[op(I.sbomAttest,0)]],
 ['attest.mutable-action','signing',[op(I.attestPinned,0),op(I.actionPinsImmutable,0)]],
 ['attest.id-token-cut','signing',[op(I.idToken,0)]],
 ['attest.permission-cut','signing',[op(I.attestWrite,0)]],
 ['attest.contents-read-cut','signing',[op(I.contentsRead,0)]],
 ['verify.command-cut','verification',[op(I.ghVerify,0)]],
 ['verify.repo-scope-cut','verification',[op(I.repoBoundVerify,0)]],
 ['verify.ids-cut','verification',[op(I.attestationIds,0)]],
 ['verify.bundle-receipt-cut','verification',[op(I.bundleReceipt,0)]],
 ['verify.receipt-digest-cut','verification',[op(I.receiptDigest,0)]],
 ['gate.enterprise-unwired','gate',[op(I.enterpriseGateWired,0)]],
 ['gate.current-rail-unwired','gate',[op(I.currentRailWired,0)]],
 ['gate.artifacts-not-uploaded','gate',[op(I.artifactUpload,0)]],
 ['owner.f06-bypassed','governance',[op(I.f06Owner,0)]],
 ['owner.f06-premature-resolved','governance',[op(I.f06CandidateState,1)]],
 ['authority.new-sot','governance',[op(I.noNewAuthority,0)]],
 ['workflow.new-parallel','governance',[op(I.noNewWorkflow,0)]],
 ['boundary.merge-equals-release','boundary',[op(I.mergeNotRelease,0)]],
 ['boundary.enterprise-promotion','boundary',[op(I.noEnterprisePromotion,0)]],
 ['boundary.external-rails-closed','boundary',[op(I.externalRailsOpen,0)]],
 ['boundary.keyless-policy-implicit','boundary',[op(I.keylessPolicyExplicit,0)]],
 ['boundary.postmerge-act-cut','boundary',[op(I.postMergeActRequired,0)]],
 ['failure.soft-fail','failure',[op(I.failureFailClosed,0)]],
 ['compound.fake-green','compound',[op(I.buildAttest,0),op(I.ghVerify,0),op(I.f06CandidateState,1)]],
 ['compound.unbound-sbom-signed','compound',[op(I.sbomGeneratedSameCheckout,0),op(I.sbomAttest,1),op(I.sbomSubjectMatchesCandidate,0)]],
 ['compound.provenance-no-inputs','compound',[op(I.provenanceInputs,0),op(I.buildAttest,1),op(I.receiptDigest,1)]]
].map(([id,domain,ops],index)=>Object.freeze({id,domain,ops,index}));
assert.equal(F.length,49);
const state=new Int32Array(BASE),singleCodes=new Set();
for(const f of F){for(const [i,v] of f.ops)state[i]=v;const code=validate(state);assert.notEqual(code,0,'single survived '+f.id);singleCodes.add(code);for(const [i] of f.ops)state[i]=BASE[i];}
// Deletion/minimality oracle: every semantic mechanism is necessary.
const mechanisms=[
 ['exact-identity',I.checkoutExact],['clean-checkout',I.cleanTree],['source-tree',I.treeSha],['package-input',I.packageHash],['lock-input',I.lockHash],['candidate-archive',I.archiveFromHead],['archive-digest',I.archiveDigest],['sbom-same-head',I.sbomGeneratedSameCheckout],['sbom-format',I.sbomCycloneDx],['sbom-digest',I.sbomDigest],['provenance-source',I.provenanceSource],['provenance-inputs',I.provenanceInputs],['provenance-outputs',I.provenanceOutputs],['build-attestation',I.buildAttest],['sbom-attestation',I.sbomAttest],['immutable-actions',I.actionPinsImmutable],['oidc',I.idToken],['attestation-write',I.attestWrite],['verify',I.ghVerify],['verify-repo',I.repoBoundVerify],['attestation-ids',I.attestationIds],['receipt',I.bundleReceipt],['enterprise-wire',I.enterpriseGateWired],['current-rail-wire',I.currentRailWired],['f06-owner',I.f06Owner],['no-new-authority',I.noNewAuthority],['no-new-workflow',I.noNewWorkflow],['single-sbom-owner',I.noSecondSbomOwner],['merge-boundary',I.mergeNotRelease],['enterprise-boundary',I.noEnterprisePromotion],['external-boundary',I.externalRailsOpen],['keyless-policy',I.keylessPolicyExplicit],['postmerge-act',I.postMergeActRequired],['fail-closed',I.failureFailClosed]
];
for(const [name,idx] of mechanisms){const old=state[idx];state[idx]=idx===I.persistCreds?1:0;assert.notEqual(validate(state),0,'removable mechanism '+name);state[idx]=old;}

const TOTAL=10_000_000,TAIL=1_000_000,DISCOVERY=TOTAL-TAIL,SEED=0xc2d3117e;
let rng=SEED>>>0;const next=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;},ri=n=>next()%n;
const coverage=new Uint32Array(F.length),pair=new Uint8Array(F.length*F.length),domainCoverage=Object.fromEntries([...new Set(F.map(f=>f.domain))].map(x=>[x,0]));
const discoveryCodes=new Set(),tailNovel=new Set();let killed=0,lastNovelAt=-1,maxDepth=0;const chosen=new Int16Array(5);
for(let trial=0;trial<TOTAL;trial++){
 const depth=1+ri(5);if(depth>maxDepth)maxDepth=depth;let count=0;
 while(count<depth){const pick=ri(F.length);let dup=false;for(let j=0;j<count;j++)if(chosen[j]===pick){dup=true;break;}if(!dup)chosen[count++]=pick;}
 for(let a=0;a<count;a++){const f=F[chosen[a]];coverage[f.index]++;domainCoverage[f.domain]++;for(const [i,v] of f.ops)state[i]=v;for(let b=a+1;b<count;b++){const x=Math.min(chosen[a],chosen[b]),y=Math.max(chosen[a],chosen[b]);pair[x*F.length+y]=1;}}
 const code=validate(state);if(code===0)throw new Error(`survivor @${trial} ${[...chosen.slice(0,count)].map(i=>F[i].id).join(',')}`);killed++;
 if(trial<DISCOVERY){if(!discoveryCodes.has(code))lastNovelAt=trial;discoveryCodes.add(code);}else if(!discoveryCodes.has(code))tailNovel.add(code);
 for(let a=0;a<count;a++)for(const [i] of F[chosen[a]].ops)state[i]=BASE[i];
}
let pairs=0;for(let i=0;i<F.length;i++)for(let j=i+1;j<F.length;j++)pairs+=pair[i*F.length+j];
const mathematicalPairs=F.length*(F.length-1)/2;
assert.equal(killed,TOTAL);assert.equal(tailNovel.size,0);assert.equal(pairs,mathematicalPairs);assert.ok(Math.min(...coverage)>0);assert.ok(Object.values(domainCoverage).every(x=>x>0));
const report={schema:'c2-delivery-provenance-falsifier/v1',seedHex:'0x'+SEED.toString(16),trials:TOTAL,discoveryTrials:DISCOVERY,noNoveltyTail:TAIL,operatorFamilies:F.length,pairCoverage:pairs,mathematicalPairs,survivors:0,deletionOracle:{cases:mechanisms.length,killed:mechanisms.length,survivors:0},normalizedFailureFamilies:discoveryCodes.size,lastNovelAt,maxDepth,domainCoverage,receiptSha256:null,boundary:'Compiled strategic-semantic model evidence only; not repository CI, GitHub OIDC/Sigstore execution, deployment, human or legal proof.'};
report.receiptSha256=createHash('sha256').update(JSON.stringify(report)).digest('hex');
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(new URL('../artifacts/delivery-provenance-saturation-10m.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
