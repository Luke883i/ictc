import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const load=rel=>JSON.parse(readFileSync(path.join(root,rel),'utf8'));
const truth=load('v3/capability-truth.json');
const releaseIdentity=load('v3/release-identity.json');
const documentationManifest=load('docs/documentation-manifest.json');
const gaps=load('v3/gaps.json');
const publicRegistry=load('v3/public/gap-registry.json');
const EXPECTED_SCOPE='ICTC current capability truth after merged PR #118; S1 worklist and RC reference closure reconciled; release stage candidate; repository capabilities separated from deployment/independent evidence.';
const EXPECTED_BLOCKERS=['S2-CAUSALITY','S3-RELIABILITY','S4-ASSURANCE-CONTRACTION','S5-CANDIDATE-SEAL'];
const S1_GAPS=['GAP-015','GAP-016'];
const S1_CAPABILITY='procedure-worklist-and-risk-reference-closure';
const failures=[];const check=(ok,msg)=>{if(!ok)failures.push(msg);};

check(truth.schemaVersion==='1.0.0','capability truth schema drift');
check(truth.authority==='capability-truth','capability truth authority drift');
check(truth.auditedAnchor?.mainSha==='30f0968e4aacc15fa8bace3846c11ecb725c9bb9','audited anchor must be exact post-#118 main');
check(truth.auditedAnchor?.mergedPr===118,'audited anchor PR must be #118');
check(truth.auditedAnchor?.meaning==='post-s1-procedure-worklist-rc-reference-closure','audited anchor meaning drift');
check(releaseIdentity.releaseStage==='candidate','release must remain candidate before S5');
check(truth.releaseClaim?.stage===releaseIdentity.releaseStage,'release claim/identity drift');
check(truth.releaseClaim?.classification==='truth-current','capability truth must remain truth-current');
check(truth.releaseClaim?.enterpriseCandidate===false,'S1 reconciliation cannot claim enterprise-candidate');
check(truth.releaseClaim?.enterpriseReady===false,'repository truth cannot claim enterprise-ready');
check(String(truth.releaseClaim?.claimBoundary||'').includes('S2-S5'),'remaining internal chain must be S2-S5');
const presentation=documentationManifest.versionAxes?.uiPresentation;
check(presentation?.value==='local-owners','presentation authority regression');
check(presentation?.classification==='canonical-distributed-presentation','presentation classification regression');

const capabilities=truth.repositoryCapabilities||[];
check(capabilities.length>=9,'post-S1 capability census unexpectedly small');
check(new Set(capabilities.map(x=>x.id)).size===capabilities.length,'duplicate capability id');
for(const item of capabilities){
  check(item.status==='repository-proven',`${item.id}: capability status drift`);
  check(Array.isArray(item.evidencePaths)&&item.evidencePaths.length>=2,`${item.id}: insufficient proof paths`);
  check(Boolean(String(item.residualBoundary||'').trim()),`${item.id}: residual boundary missing`);
  for(const rel of item.evidencePaths||[])check(existsSync(path.join(root,rel)),`${item.id}: evidence path missing: ${rel}`);
}
const s1=capabilities.find(x=>x.id===S1_CAPABILITY);
check(Boolean(s1),'S1 capability missing');
check(JSON.stringify(s1?.closesGapIds||[])===JSON.stringify(S1_GAPS),'S1 capability closure map drift');
for(const rel of ['v3/runtime/procedure-worklist.mjs','v3/procedure-worklist-s1-check.mjs','v3/procedure-worklist-s1-saturation.mjs'])check(s1?.evidencePaths?.includes(rel),`S1 proof missing: ${rel}`);

check(gaps.schemaVersion==='1.2.0','gap schema drift');
check(gaps.scope===EXPECTED_SCOPE,'gap scope must be reconciled post-#118');
check(JSON.stringify(gaps.closureClasses)===JSON.stringify(['repository-internal','external-evidence','independent-evidence']),'closure class registry drift');
const canonical=gaps.gaps||[], ids=canonical.map(x=>x.id), open=canonical.filter(x=>x.status==='open');
check(new Set(ids).size===ids.length,'duplicate canonical gap id');
check(JSON.stringify(publicRegistry.gaps.map(x=>x.id))===JSON.stringify(open.map(x=>x.id)),'public registry must equal canonical open-gap order');
check(publicRegistry.schemaVersion===gaps.schemaVersion,'public/canonical schema drift');
check(publicRegistry.scope===gaps.scope,'public/canonical scope drift');
for(const id of S1_GAPS){
  const gap=canonical.find(x=>x.id===id);
  check(Boolean(gap),`${id}: missing`);check(gap?.status==='closed',`${id}: S1 closure regressed`);check(gap?.closureClass==='repository-internal',`${id}: closure class drift`);check(gap?.targetSlice==='S1',`${id}: target slice drift`);
  check(gap?.changePaths?.includes('v3/runtime/procedure-worklist.mjs'),`${id}: runtime worklist authority missing`);
  check(gap?.testPaths?.includes('v3/procedure-worklist-s1-check.mjs'),`${id}: exact S1 check missing`);
  check(gap?.testPaths?.includes('v3/procedure-worklist-s1-saturation.mjs'),`${id}: S1 saturation missing`);
  check((gap?.evidence||[]).length>0&&Boolean(gap?.limitations?.length),`${id}: closure evidence/limitation missing`);
  check(!publicRegistry.gaps.some(x=>x.id===id),`${id}: closed gap leaked into public open registry`);
}

const blockerGroups=truth.currentInternalBlockers||[], blockerIds=blockerGroups.map(x=>x.id), internalIds=blockerGroups.flatMap(x=>x.gapIds||[]);
check(JSON.stringify(blockerIds)===JSON.stringify(EXPECTED_BLOCKERS),'internal blocker lattice must begin at S2');
check(new Set(internalIds).size===internalIds.length,'internal gap assigned more than once');
for(const group of blockerGroups)for(const id of group.gapIds||[]){const gap=canonical.find(x=>x.id===id);check(gap?.status==='open',`${id}: blocker not open`);check(gap?.closureClass==='repository-internal',`${id}: blocker class drift`);check(gap?.targetSlice===group.targetSlice,`${id}: blocker target drift`);}
const openInternal=open.filter(x=>x.closureClass==='repository-internal').map(x=>x.id).sort();check(JSON.stringify([...internalIds].sort())===JSON.stringify(openInternal),'every open internal gap must be assigned exactly once to S2-S5');

const external=truth.externalEvidenceBoundaries||[], expectedExternal=['E4-SCANNER-EFFECTIVENESS','E4-IDENTITY-EFFECTIVENESS','E4-HUMAN-VALIDATION','E4-OBSERVABILITY-ALERTING','E4-BRANCH-PROTECTION'];
check(JSON.stringify(external.map(x=>x.id))===JSON.stringify(expectedExternal),'E4 boundary census drift');
const externalGapIds=external.flatMap(x=>x.gapIds||[]);check(new Set(externalGapIds).size===externalGapIds.length,'external gap assigned more than once');
const openExternal=open.filter(x=>['external-evidence','independent-evidence'].includes(x.closureClass)).map(x=>x.id).sort();check(JSON.stringify([...externalGapIds].sort())===JSON.stringify(openExternal),'every open external/independent gap must map exactly once to E4');
for(const boundary of external){check(boundary.status==='external-evidence-required',`${boundary.id}: repository cannot self-close E4`);for(const id of boundary.gapIds||[]){const gap=canonical.find(x=>x.id===id);check(gap?.status==='open',`${id}: E4 gap must remain open`);check(['external-evidence','independent-evidence'].includes(gap?.closureClass),`${id}: E4 class drift`);}}
for(const item of capabilities)for(const id of item.retiresAbsenceClaimFrom||[]){const gap=canonical.find(x=>x.id===id);check(gap?.status==='open'&&gap?.closureClass==='external-evidence',`${id}: retired absence claim must remain external evidence boundary`);}
const openText=JSON.stringify(open).toLowerCase();for(const fragment of truth.staleOpenClaimFragments||[])check(!openText.includes(String(fragment).toLowerCase()),`stale open claim returned: ${fragment}`);
assert.deepEqual(failures,[],failures.join('\n'));
console.log(JSON.stringify({ok:true,suite:'capability-truth-post-s1-reconciliation',anchor:truth.auditedAnchor,capabilities:capabilities.length,s1Closed:S1_GAPS,openInternal,externalGapIds,claimBoundary:truth.releaseClaim.claimBoundary}));
