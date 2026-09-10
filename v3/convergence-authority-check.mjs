import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const defaultRoot=path.resolve(here,'..');
export const TRUTH0_MAIN='5d129a49d0d7907847ff59a3c5fa7d85edb8b66a';
export const A6_UX4_MAIN='f766fc064b0f8552f4821776755d72b56b757205';
const A='docs/convergence/convergence-authority.json';
const W='docs/convergence/ICTC_CONVERGENCE_AUTHORITY_ACTIVE.xlsx';
const R='artifacts/convergence-authority-receipt.json';
const S='artifacts/convergence-authority-saturation.json';
const CHAIN=['GOV-WB4','TRUTH-0','SCOPE-0','REALITY-0','DECIDE-0','S4-A6-CLOSE','S5-CANDIDATE-SEAL'];
const CONDITIONAL=['C1-COMPAT-CONTRACTION','C2-DELIVERY-PROVENANCE','C3-CAPACITY-CONTRACT','C4-AI-EVAL-DRIFT','C5-SEMANTIC-OWNER-COMPRESSION'];
const LEGACY=['C1','C2','C3','C4','C5'];
const ELIGIBLE={'C1-COMPAT-CONTRACTION':'DECIDE-0','C2-DELIVERY-PROVENANCE':'TRUTH-0','C3-CAPACITY-CONTRACT':'DECIDE-0','C4-AI-EVAL-DRIFT':'DECIDE-0','C5-SEMANTIC-OWNER-COMPRESSION':'TRUTH-0'};
const DEBT_REF={'C1-COMPAT-CONTRACTION':['GAP-020'],'C2-DELIVERY-PROVENANCE':['F-06'],'C3-CAPACITY-CONTRACT':['F-13'],'C4-AI-EVAL-DRIFT':['F-15'],'C5-SEMANTIC-OWNER-COMPRESSION':['GAP-020']};
const SOTS=['SOT-GIT','SOT-PRODUCT','SOT-ARCH','SOT-RUNTIME','SOT-CAPABILITY','SOT-GAPS','SOT-REMEDIATION','SOT-CONVERGENCE','SOT-EXTERNAL'];
const RAILS=['E3-HUMAN','E3-GOV','E4-DEPLOY'];
const A0A7={A0:'7ba353d3bf5a19dd940daa66a4f9121f5fd9990407e98640c5b5b6faad6368b1',A1:'392922c18ba7cebfa1ffeb2cac8bdea68827547d5a38a001a9ecdba1948bc5fc',A2:'86bc23b38ea75873828fdf7f4a3188117a1f7c79ba8f1c552857eb4f8edff6fc',A3:'c91a4a479a4180628a9095e5ef5bf304daee093cf77bc032820ec1d56ca6152e',A4:'f522c71f8bff5bfdd44da103c66cbe9b28964e422e8b3f31ad75541a71562c45',A5:'145c4803573176d4828c033e504163421e120944c3d9e5aece9f04902a9e2ead',A6:'798d018511d2c2c6ba068308e2db00ef81c5bd422f7839e4f8e88ced27250924',A7:'68a57fbc0bf615ada5dbde2150acdf947acdc5c0682cc7cc131fc706af4817db'};
const top=['schemaVersion','governanceRevision','authority','classification','scope','nonAuthority','baseAnchor','observedContext','currentExecution','serialChain','conditionalSlices','conditionalResolutionPolicy','sourceOfTruth','internalDebt','externalRails','scopeDimensions','s5Seal','reconciliations','auditLineage','trajectoryImpactPolicy','projection','receipt','claimBoundary'];
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b); const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const binding=a=>({schemaVersion:a.schemaVersion,governanceRevision:a.governanceRevision,authorityPath:A,projectionVersion:a.projection?.version,baseMainSha:a.baseAnchor?.mainSha,currentSlice:a.currentExecution?.currentSlice,nextAfterMerge:a.currentExecution?.nextAfterMerge,serialChain:(a.serialChain||[]).map(x=>x.id),conditionalSlices:(a.conditionalSlices||[]).map(x=>({id:x.id,eligibleAfter:x.eligibleAfter,mustResolveBefore:x.mustResolveBefore,debtRefs:x.debtRefs})),sotIds:(a.sourceOfTruth||[]).map(x=>x.id),externalRailIds:(a.externalRails||[]).map(x=>x.id),receiptPath:a.receipt?.path});
const terminal=x=>['done','not-required'].includes(x?.state);
export function validateAuthority(a,{capabilityTruth=null,gaps=null,publicRegistry=null,remediation=null,workbookSha=null,workbookText=null}={}){
 const f=[]; const check=(ok,code,detail='')=>{if(!ok)f.push({code,detail})};
 check(a&&typeof a==='object'&&!Array.isArray(a),'OBJECT'); if(!a||typeof a!=='object')return f;
 check(same(Object.keys(a).sort(),top.slice().sort()),'TOP_LEVEL_ALLOWLIST',Object.keys(a));
 check(a.schemaVersion==='2.1.0','SCHEMA',a.schemaVersion);check(a.governanceRevision==='GOV-WB4','REVISION',a.governanceRevision);check(a.authority==='convergence-authority','AUTHORITY');
 check(a.baseAnchor?.mainSha===TRUTH0_MAIN&&a.baseAnchor?.mergedPr===136,'BASE_ANCHOR',a.baseAnchor);check(a.baseAnchor?.meaning==='post-gov-wb4-main','BASE_MEANING');
 check(a.observedContext?.latestMergedPr?.number===136&&a.observedContext?.latestMergedPr?.mergeSha===TRUTH0_MAIN,'OBSERVED_GOV',a.observedContext?.latestMergedPr);
 check(a.observedContext?.latestRuntimePr?.number===135&&a.observedContext?.latestRuntimePr?.mergeSha===A6_UX4_MAIN,'OBSERVED_RUNTIME',a.observedContext?.latestRuntimePr);
 check(a.observedContext?.branchProtection?.protected===false&&a.observedContext?.branchProtection?.classification==='E3-GOV-external-evidence-boundary','BRANCH_PROTECTION_BOUNDARY',a.observedContext?.branchProtection);
 const chain=a.serialChain||[];check(same(chain.map(x=>x.id),CHAIN),'CHAIN_IDS');check(new Set(chain.map(x=>x.id)).size===CHAIN.length,'CHAIN_UNIQUE');
 const cur=a.currentExecution?.currentSlice;const ci=CHAIN.indexOf(cur);check(cur==='TRUTH-0','CURRENT_TRUTH0',cur);check(a.currentExecution?.stateOnPullRequest==='candidate','CURRENT_CANDIDATE');check(a.currentExecution?.nextAfterMerge==='SCOPE-0','NEXT_SCOPE');check(a.currentExecution?.parentS4A6RemainsOpen===true,'PARENT_OPEN');
 chain.forEach((x,i)=>{check(x.order===i+1,'CHAIN_ORDER',x.id);check(x.dependsOn===(i?CHAIN[i-1]:null),'CHAIN_DEP',x.id);const expected=i<ci?'done':i===ci?'candidate':'blocked';check(x.state===expected,'CHAIN_PREFIX',`${x.id}:${x.state}->${expected}`);check(String(x.purpose||'').length>15,'CHAIN_PURPOSE',x.id);check(String(x.userEffect||'').length>15,'CHAIN_EFFECT',x.id)});
 const cs=a.conditionalSlices||[];check(same(cs.map(x=>x.id),CONDITIONAL),'CONDITIONAL_IDS',cs.map(x=>x.id));check(same(cs.map(x=>x.legacyId),LEGACY),'CONDITIONAL_LINEAGE',cs.map(x=>x.legacyId));check(new Set(cs.map(x=>x.id)).size===5,'CONDITIONAL_UNIQUE');
 cs.forEach(x=>{check(x.executionMode==='conditional','CONDITIONAL_MODE',x.id);check(x.eligibleAfter===ELIGIBLE[x.id],'CONDITIONAL_ELIGIBILITY',x.id);check(x.mustResolveBefore==='S4-A6-CLOSE','CONDITIONAL_DEADLINE',x.id);check(same(x.debtRefs,DEBT_REF[x.id]),'CONDITIONAL_DEBT',x.id);check(['todo','active','done','not-required'].includes(x.state),'CONDITIONAL_STATE',x.id);const ei=CHAIN.indexOf(x.eligibleAfter);if(['active','done','not-required'].includes(x.state))check(chain[ei]?.state==='done','CONDITIONAL_TOO_EARLY',x.id);if(x.state==='not-required')for(const k of ['decisionAuthority','rationale','evidenceRef'])check(Boolean(String(x[k]||'').trim()),'NOT_REQUIRED_EVIDENCE',`${x.id}:${k}`)});
 check(same(a.conditionalResolutionPolicy?.terminalStates,['done','not-required']),'RESOLUTION_TERMINALS');check(same(a.conditionalResolutionPolicy?.notRequiredRequires,['decisionAuthority','rationale','evidenceRef']),'NOT_REQUIRED_POLICY');
 if(ci>=CHAIN.indexOf('S4-A6-CLOSE'))check(cs.every(terminal),'UNRESOLVED_BEFORE_S4_CLOSE',cs.filter(x=>!terminal(x)).map(x=>x.id));
 const debt=Object.fromEntries((a.internalDebt||[]).map(x=>[x.id,x]));const debtTargets={'GOV-POST135':'GOV-WB4','GOV-README-PRESENTATION':'GOV-WB4','GOV-UX3-PLANNING-SHADOW':'GOV-WB4','TRUTH-POST135':'TRUTH-0','F-06':'C2-DELIVERY-PROVENANCE','F-13':'C3-CAPACITY-CONTRACT','F-15':'C4-AI-EVAL-DRIFT','GAP-020':'S4-A6-CLOSE','GAP-021':'S5-CANDIDATE-SEAL'};
 check(same(Object.keys(debt),Object.keys(debtTargets)),'DEBT_IDS',Object.keys(debt));for(const [id,target] of Object.entries(debtTargets)){check(debt[id]?.closureClass==='repository-internal','DEBT_CLASS',id);check(debt[id]?.target===target,'DEBT_TARGET',`${id}:${debt[id]?.target}`)}
 check(debt['GOV-POST135']?.status==='resolved'&&debt['GOV-README-PRESENTATION']?.status==='resolved'&&debt['GOV-UX3-PLANNING-SHADOW']?.status==='resolved','GOV_DEBT_RECONCILED');check(debt['TRUTH-POST135']?.status==='candidate-fixed','TRUTH_DEBT_CANDIDATE');check(['open','in-remediation'].includes(debt['F-06']?.status)&&['open','in-remediation'].includes(debt['F-13']?.status)&&['open','in-remediation'].includes(debt['F-15']?.status),'F_DEBT_STILL_OPEN');check(debt['GAP-020']?.status==='open'&&debt['GAP-021']?.status==='open','PARENT_DEBT_OPEN');
 check(same(a.sourceOfTruth?.map(x=>x.id),SOTS),'SOT_IDS');check(same(a.externalRails?.map(x=>x.id),RAILS),'RAIL_IDS');for(const r of a.externalRails||[])check(r.state==='external'&&Array.isArray(r.items)&&r.items.length>0,'RAIL_BOUNDARY',r.id);
 const scope=a.scopeDimensions||[];check(scope.length===13&&new Set(scope.map(x=>x.id)).size===13,'SCOPE_13');scope.forEach((x,i)=>{check(x.id===`SCOPE-${String(i+1).padStart(2,'0')}`,'SCOPE_ID',x.id);check(x.ownerSlice==='SCOPE-0'&&x.state==='undefined','SCOPE_PREMATURE',x.id)});
 const phases=a.s5Seal?.phases||[];check(same(phases.map(x=>x.id),['B0','B1','B2'])&&phases.every(x=>x.state==='blocked'),'S5_BLOCKED');check(a.s5Seal?.enterpriseCandidate===false&&a.s5Seal?.enterpriseReady===false,'RELEASE_PROMOTION_FORBIDDEN');
 const aud=Object.fromEntries((a.auditLineage||[]).map(x=>[x.id,x]));for(const [id,h] of Object.entries(A0A7))check(aud[id]?.sha256===h&&aud[id]?.frozen===true,'AUDIT_FROZEN',id);
 const rec=Object.fromEntries((a.reconciliations||[]).map(x=>[x.id,x]));check(rec['REC-A6-UX4-MAIN']?.mergedPr===135&&rec['REC-A6-UX4-MAIN']?.mergeSha===A6_UX4_MAIN,'UX4_RECONCILIATION');check(rec['REC-GOV-WB4-MAIN']?.mergedPr===136&&rec['REC-GOV-WB4-MAIN']?.mergeSha===TRUTH0_MAIN,'GOV_RECONCILIATION');
 check(a.projection?.path===W&&a.projection?.version==='TRUTH-0'&&a.projection?.classification==='derived-readable-projection'&&a.projection?.bindingSheet==='BINDING','PROJECTION_META');check(/^[0-9a-f]{64}$/.test(a.projection?.sha256||''),'PROJECTION_SHA_FORMAT');const bsha=sha(Buffer.from(JSON.stringify(binding(a))));check(a.projection?.bindingSha256===bsha,'BINDING_SHA',bsha);
 if(workbookSha!==null)check(a.projection?.sha256===workbookSha,'WORKBOOK_SHA',workbookSha);if(workbookText!==null){for(const token of [bsha,'TRUTH-0','SCOPE-0',...CONDITIONAL])check(workbookText.includes(token),'WORKBOOK_BINDING_TOKEN',token)}
 check(a.receipt?.path===R&&a.receipt?.saturationPath===S&&a.receipt?.tracked===false&&a.receipt?.selfReferenceForbidden===true,'RECEIPT_POLICY');check(String(a.claimBoundary||'').includes('changes no business write authority')||String(a.claimBoundary||'').includes('changes no business'),'CLAIM_BOUNDARY_BUSINESS');check(String(a.claimBoundary||'').includes('E3-HUMAN')&&String(a.claimBoundary||'').includes('E3-GOV')&&String(a.claimBoundary||'').includes('E4-DEPLOY'),'CLAIM_BOUNDARY_EXTERNAL');
 if(capabilityTruth){check(capabilityTruth.latestReconciliation?.mainSha===TRUTH0_MAIN&&capabilityTruth.latestRuntimeMain?.mainSha===A6_UX4_MAIN,'CROSS_CAPABILITY_ANCHOR');check(capabilityTruth.s4Progress?.nextConvergenceSlice==='SCOPE-0'&&capabilityTruth.s4Progress?.parentState==='open','CROSS_CAPABILITY_PROGRESS')}
 if(gaps){const om=Object.fromEntries((gaps.gaps||[]).filter(x=>x.status==='open').map(x=>[x.id,x.targetSlice]));check(om['GAP-012']==='E3-HUMAN'&&om['GAP-022']==='E3-GOV'&&om['GAP-007']==='E4-DEPLOY'&&om['GAP-020']==='S4-A6-CLOSE'&&om['GAP-021']==='S5-CANDIDATE-SEAL','CROSS_GAP_ROUTING',om);if(publicRegistry)check(same(publicRegistry.gaps,(gaps.gaps||[]).filter(x=>x.status==='open')),'CROSS_PUBLIC_GAPS')}
 if(remediation){const fm=Object.fromEntries((remediation.findings||[]).map(x=>[x.id,x]));check(fm['F-06']?.requiredGrade==='E2'&&fm['F-13']?.requiredGrade==='E2'&&fm['F-15']?.requiredGrade==='E2','CROSS_E2_DEBT');check(fm['F-01']?.requiredGrade==='E3'&&fm['F-16']?.requiredGrade==='E3','CROSS_E3_RAILS')}
 return f;
}
export function loadAuthorityFixture(root=defaultRoot){const load=rel=>JSON.parse(readFileSync(path.join(root,rel),'utf8'));return{authority:load(A),capabilityTruth:load('v3/capability-truth.json'),gaps:load('v3/gaps.json'),publicRegistry:load('v3/public/gap-registry.json'),remediation:load('audit/remediation-registry.json')}};
function failMutation(name,fixture,mutate){const x=structuredClone(fixture);mutate(x);const r=validateAuthority(x.authority,{capabilityTruth:x.capabilityTruth,gaps:x.gaps,publicRegistry:x.publicRegistry,remediation:x.remediation});assert.ok(r.length>0,`${name}: survived`);return name;}
export function selfTestAuthority(fixture){return[
 failMutation('skip-truth',fixture,x=>x.authority.currentExecution.currentSlice='SCOPE-0'),
 failMutation('premature-scope',fixture,x=>x.authority.serialChain[2].state='candidate'),
 failMutation('conditional-removed',fixture,x=>x.authority.conditionalSlices.pop()),
 failMutation('conditional-after-s5',fixture,x=>x.authority.conditionalSlices[0].mustResolveBefore='S5-CANDIDATE-SEAL'),
 failMutation('c2-delayed',fixture,x=>x.authority.conditionalSlices[1].eligibleAfter='DECIDE-0'),
 failMutation('not-required-without-authority',fixture,x=>{x.authority.serialChain[1].state='done';x.authority.conditionalSlices[1].state='not-required'}),
 failMutation('close-gap020',fixture,x=>x.authority.internalDebt.find(d=>d.id==='GAP-020').status='resolved'),
 failMutation('f06-target-launder',fixture,x=>x.authority.internalDebt.find(d=>d.id==='F-06').target='S4-A6-CLOSE'),
 failMutation('human-to-e4',fixture,x=>x.gaps.gaps.find(g=>g.id==='GAP-012').targetSlice='E4-DEPLOY'),
 failMutation('branch-to-e4',fixture,x=>x.gaps.gaps.find(g=>g.id==='GAP-022').targetSlice='E4-DEPLOY'),
 failMutation('enterprise-candidate',fixture,x=>x.authority.s5Seal.enterpriseCandidate=true),
 failMutation('enterprise-ready',fixture,x=>x.authority.s5Seal.enterpriseReady=true),
 failMutation('scope-defined-early',fixture,x=>x.authority.scopeDimensions[0].state='defined'),
 failMutation('binding-drift',fixture,x=>x.authority.projection.bindingSha256='0'.repeat(64)),
 failMutation('public-gap-drift',fixture,x=>x.publicRegistry.gaps.pop())
]}
function workbookUnzippedText(file){const p=spawnSync('unzip',['-p',file],{encoding:'utf8',maxBuffer:32*1024*1024});if(p.error||p.status!==0)throw new Error(`cannot inspect XLSX: ${p.error?.message||p.stderr||p.status}`);return p.stdout;}
const direct=process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url;
if(direct){const root=path.resolve(process.argv[2]||defaultRoot);const fx=loadAuthorityFixture(root);const wbPath=path.join(root,W);let wbSha=null,wbText=null;try{const b=readFileSync(wbPath);wbSha=sha(b);wbText=workbookUnzippedText(wbPath)}catch(e){console.error(e.message);process.exit(1)}const failures=validateAuthority(fx.authority,{...fx,workbookSha:wbSha,workbookText:wbText});let selfTests=0;try{selfTests=selfTestAuthority(fx).length}catch(e){failures.push({code:'SELF_TEST',detail:e.message})}const result={ok:failures.length===0,failures,selfTests,baseMain:TRUTH0_MAIN,currentSlice:fx.authority.currentExecution.currentSlice,nextAfterMerge:fx.authority.currentExecution.nextAfterMerge,conditionalSlices:fx.authority.conditionalSlices.map(x=>({id:x.id,state:x.state,eligibleAfter:x.eligibleAfter,mustResolveBefore:x.mustResolveBefore})),workbookSha256:wbSha,bindingSha256:fx.authority.projection.bindingSha256};console.log(JSON.stringify(result,null,2));if(result.ok){mkdirSync(path.join(root,'artifacts'),{recursive:true});writeFileSync(path.join(root,R),JSON.stringify(result,null,2)+'\n');writeFileSync(path.join(root,S),JSON.stringify({classification:'E2 semantic/source-policy evidence only',selfTests},null,2)+'\n')}else process.exit(1)}
