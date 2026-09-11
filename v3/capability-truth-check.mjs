import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const defaultRoot=path.resolve(here,'..');
export const TRUTH0_MAIN='5d129a49d0d7907847ff59a3c5fa7d85edb8b66a';
export const A6_UX4_MAIN='f766fc064b0f8552f4821776755d72b56b757205';
const FOUNDATION='9f56b4444b212b36e5957f00df6cac0be381a9b1';
const EXPECTED_A6=['s4-a6-ux1-fixed-safe-footer','s4-a6-ux2-canonical-chrome-palette','s4-a6-ux3-operational-surfaces','s4-a6-ux4-semantic-surfaces'];
const OPEN_TARGETS={
 'GAP-007':['external-evidence','E4-DEPLOY'],
 'GAP-009':['external-evidence','E4-DEPLOY'],
 'GAP-012':['independent-evidence','E3-HUMAN'],
 'GAP-014':['external-evidence','E4-DEPLOY'],
 'GAP-020':['repository-internal','S4-A6-CLOSE'],
 'GAP-021':['repository-internal','S5-CANDIDATE-SEAL'],
 'GAP-022':['external-evidence','E3-GOV']
};
const EXT_BOUNDARIES={
 'E4-DEPLOY-SCANNER':['GAP-007','E4-DEPLOY'],
 'E4-DEPLOY-IDENTITY':['GAP-009','E4-DEPLOY'],
 'E3-HUMAN-VALIDATION':['GAP-012','E3-HUMAN'],
 'E4-DEPLOY-OBSERVABILITY':['GAP-014','E4-DEPLOY'],
 'E3-GOV-BRANCH-PROTECTION':['GAP-022','E3-GOV']
};
const load=(root,rel)=>JSON.parse(readFileSync(path.join(root,rel),'utf8'));
export function loadCapabilityTruthFixture(root=defaultRoot){
 return {truth:load(root,'v3/capability-truth.json'),releaseIdentity:load(root,'v3/release-identity.json'),documentationManifest:load(root,'docs/documentation-manifest.json'),gaps:load(root,'v3/gaps.json'),publicRegistry:load(root,'v3/public/gap-registry.json'),remediation:load(root,'audit/remediation-registry.json'),root};
}
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function validateCapabilityTruth({truth,releaseIdentity,documentationManifest,gaps,publicRegistry,remediation,root=defaultRoot,pathExists=rel=>existsSync(path.join(root,rel)),gateSource=null}){
 const failures=[]; const check=(ok,msg)=>{if(!ok)failures.push(msg)};
 check(truth?.schemaVersion==='1.2.0','capability truth schema must be 1.2.0');
 check(truth?.authority==='capability-truth','capability truth authority drift');
 check(truth?.auditedAnchor?.mainSha===FOUNDATION&&truth?.auditedAnchor?.mergedPr===121,'S0-S3 foundation anchor drift');
 check(truth?.latestReconciliation?.mainSha===TRUTH0_MAIN&&truth?.latestReconciliation?.mergedPr===136,'TRUTH-0 base reconciliation drift');
 check(truth?.latestReconciliation?.mode==='exact-base-preimage','TRUTH-0 reconciliation must be exact-base-preimage');
 check(truth?.latestRuntimeMain?.mainSha===A6_UX4_MAIN&&truth?.latestRuntimeMain?.mergedPr===135,'latest runtime main must be A6-UX4/#135');
 check(releaseIdentity?.releaseStage==='candidate','release must remain candidate');
 check(truth?.releaseClaim?.stage==='candidate'&&truth?.releaseClaim?.classification==='truth-current','release truth classification drift');
 check(truth?.releaseClaim?.enterpriseCandidate===false,'TRUTH-0 cannot promote enterprise-candidate');
 check(truth?.releaseClaim?.enterpriseReady===false,'repository truth cannot claim enterprise-ready');
 check(documentationManifest?.versionAxes?.uiPresentation?.value==='local-owners','uiPresentation truth must remain local-owners');
 check(documentationManifest?.versionAxes?.uiPresentation?.classification==='canonical-distributed-presentation','presentation classification drift');
 const p=truth?.s4Progress||{};
 check(p.parentGap==='GAP-020'&&p.parentState==='open','GAP-020 parent must remain open');
 check(same(p.completed,['S4-A0','S4-A1','S4-A2','S4-A3','S4-A4','S4-A5']),'S4 A0-A5 history drift');
 check(same(p.completedExecutionUnits,['A6-UX1','A6-UX2','A6-UX3','A6-UX4']),'A6 UX1-UX4 lineage drift');
 check(p.completedThrough==='A6-UX4','A6-UX4 must be latest merged execution unit');
 check(p.latestRuntimeMain?.mainSha===A6_UX4_MAIN&&p.latestRuntimeMain?.mergedPr===135,'S4 progress runtime anchor drift');
 check(p.nextConvergenceSlice==='SCOPE-0','next convergence slice must be SCOPE-0');
 check(p.plannedClosureSlice==='S4-A6-CLOSE','GAP-020 planned closure slice drift');
 const caps=truth?.repositoryCapabilities||[];
 check(caps.length===21,'repository capability census must be exactly 21 at TRUTH-0');
 check(new Set(caps.map(x=>x.id)).size===caps.length,'duplicate repository capability id');
 for(const c of caps){
   check(c.status==='repository-proven',`${c.id}: capability status drift`);
   check(Array.isArray(c.evidencePaths)&&c.evidencePaths.length>=2,`${c.id}: insufficient evidence paths`);
   check(Boolean(String(c.residualBoundary||'').trim()),`${c.id}: residual boundary missing`);
   for(const rel of c.evidencePaths||[]) check(pathExists(rel),`${c.id}: evidence path missing ${rel}`);
 }
 for(const id of EXPECTED_A6) check(caps.some(c=>c.id===id),`${id}: A6 capability missing`);
 const requiredClosed={'GAP-010':'runtime-reliability-contract-s3','GAP-015':'procedure-worklist-and-risk-reference-closure','GAP-016':'procedure-worklist-and-risk-reference-closure','GAP-017':'ar-temporal-review-and-explicit-epistemic-effects','GAP-018':'ar-temporal-review-and-explicit-epistemic-effects','GAP-019':'runtime-reliability-contract-s3'};
 check(gaps?.schemaVersion==='1.3.0','gap schema must be 1.3.0');
 check(String(gaps?.scope||'').includes(TRUTH0_MAIN)&&String(gaps?.scope||'').includes('A6-UX4'),'gap scope is not reconciled to TRUTH-0');
 check(same(gaps?.closureClasses,['repository-internal','external-evidence','independent-evidence']),'closure class registry drift');
 const canonical=gaps?.gaps||[]; const ids=canonical.map(g=>g.id); const open=canonical.filter(g=>g.status==='open');
 check(canonical.length===22&&new Set(ids).size===22,'canonical gap census/uniqueness drift');
 check(same(publicRegistry?.gaps||[],open),'public registry must equal canonical open gap objects exactly');
 check(publicRegistry?.schemaVersion===gaps?.schemaVersion&&publicRegistry?.scope===gaps?.scope,'public/canonical metadata drift');
 check(same(open.map(g=>g.id),Object.keys(OPEN_TARGETS)),'open gap census/order drift');
 for(const [id,[closureClass,targetSlice]] of Object.entries(OPEN_TARGETS)){
   const g=canonical.find(x=>x.id===id); check(g?.status==='open',`${id}: must remain open`); check(g?.closureClass===closureClass,`${id}: closureClass drift`); check(g?.targetSlice===targetSlice,`${id}: target rail/slice drift`);
 }
 for(const [id,capId] of Object.entries(requiredClosed)){
   const g=canonical.find(x=>x.id===id); check(g?.status==='closed',`${id}: closed gap regressed`); check(caps.some(c=>c.id===capId),`${id}: closure capability missing`);
 }
 const internal=truth?.currentInternalBlockers||[];
 check(same(internal.map(x=>x.id),['S4-A6-CLOSE','S5-CANDIDATE-SEAL']),'internal blocker lattice drift');
 check(same(internal.flatMap(x=>x.gapIds||[]),['GAP-020','GAP-021']),'internal blocker gap mapping drift');
 const ext=truth?.externalEvidenceBoundaries||[];
 check(same(ext.map(x=>x.id),Object.keys(EXT_BOUNDARIES)),'external evidence boundary census drift');
 for(const [id,[gapId,rail]] of Object.entries(EXT_BOUNDARIES)){
   const e=ext.find(x=>x.id===id); check(e?.status==='external-evidence-required',`${id}: external status drift`); check(same(e?.gapIds,[gapId]),`${id}: gap mapping drift`); check(e?.rail===rail,`${id}: rail drift`);
 }
 const findings=Object.fromEntries((remediation?.findings||[]).map(f=>[f.id,f]));
 for(const id of ['F-06','F-13','F-15']) check(findings[id]?.requiredGrade==='E2'&&['open','in-remediation'].includes(findings[id]?.status),`${id}: E2 debt classification drift`);
 for(const id of ['F-01','F-14','F-16']) check(findings[id]?.requiredGrade==='E3'&&findings[id]?.status==='blocked-external',`${id}: E3 boundary classification drift`);
 for(const id of ['F-02','F-04','F-05','F-07','F-10','F-12']) check(findings[id]?.requiredGrade==='E4'&&findings[id]?.status==='blocked-external',`${id}: E4 boundary classification drift`);
 const openText=JSON.stringify(open).toLowerCase(); for(const frag of truth?.staleOpenClaimFragments||[]) check(!openText.includes(String(frag).toLowerCase()),`stale/forbidden open claim present: ${frag}`);
 const src=gateSource??(()=>{try{return readFileSync(path.join(root,'v3/current-gate-registry.mjs'),'utf8')}catch{return''}})();
 const m=src.match(/COMPATIBILITY_REGRESSION_GATES\s*=\s*Object\.freeze\(\[([\s\S]*?)\]\)/); if(m){const count=(m[1].match(/\.mjs/g)||[]).length;check(count===24,`compatibility regression gate count drift: ${count}`);} else check(false,'compatibility regression gate registry not readable');
 return {ok:failures.length===0,failures,counts:{capabilities:caps.length,gaps:canonical.length,openGaps:open.length,a6ExecutionUnits:p.completedExecutionUnits?.length||0,externalBoundaries:ext.length}};
}
function failMutation(name,fixture,mutate){const x=structuredClone(fixture);mutate(x);const r=validateCapabilityTruth({...x,pathExists:()=>true,gateSource:"export const COMPATIBILITY_REGRESSION_GATES=Object.freeze(["+Array(24).fill("'x.mjs'").join(',')+"]);"});assert.equal(r.ok,false,`${name}: survived`);return name;}
export function selfTestCapabilityTruth(fixture){return [
 failMutation('stale-main',fixture,x=>x.truth.latestReconciliation.mainSha='0'.repeat(40)),
 failMutation('stale-runtime',fixture,x=>x.truth.latestRuntimeMain.mainSha='0'.repeat(40)),
 failMutation('premature-enterprise-candidate',fixture,x=>x.truth.releaseClaim.enterpriseCandidate=true),
 failMutation('premature-enterprise-ready',fixture,x=>x.truth.releaseClaim.enterpriseReady=true),
 failMutation('close-gap020',fixture,x=>x.gaps.gaps.find(g=>g.id==='GAP-020').status='closed'),
 failMutation('public-only-drift',fixture,x=>x.publicRegistry.gaps.find(g=>g.id==='GAP-020').targetSlice='S4'),
 failMutation('human-to-e4',fixture,x=>x.gaps.gaps.find(g=>g.id==='GAP-012').targetSlice='E4-DEPLOY'),
 failMutation('branch-to-e4',fixture,x=>x.gaps.gaps.find(g=>g.id==='GAP-022').targetSlice='E4-DEPLOY'),
 failMutation('a6-capability-lost',fixture,x=>x.truth.repositoryCapabilities=x.truth.repositoryCapabilities.filter(c=>c.id!=='s4-a6-ux4-semantic-surfaces')),
 failMutation('a6-lineage-lost',fixture,x=>x.truth.s4Progress.completedExecutionUnits.pop()),
 failMutation('scope-skip',fixture,x=>x.truth.s4Progress.nextConvergenceSlice='REALITY-0'),
 failMutation('e3-human-boundary-lost',fixture,x=>x.truth.externalEvidenceBoundaries=x.truth.externalEvidenceBoundaries.filter(e=>e.rail!=='E3-HUMAN')),
 failMutation('e3-grade-laundered',fixture,x=>x.remediation.findings.find(f=>f.id==='F-16').requiredGrade='E2')
 ];}

const direct=process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url;
if(direct){const root=path.resolve(process.argv[2]||defaultRoot);const fixture=loadCapabilityTruthFixture(root);const result=validateCapabilityTruth(fixture);let self=[];try{self=selfTestCapabilityTruth(fixture)}catch(e){result.ok=false;result.failures.push(`self-test: ${e.message}`)};console.log(JSON.stringify({...result,selfTests:self.length},null,2));if(!result.ok)process.exit(1);}
