import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'..');
export function validateTrajectory(m,p){
 const f=[],ck=(v,c,d='')=>{if(!v)f.push({code:c,detail:d});};
 ck(m?.schemaVersion==='1.0.0'&&m?.auditId==='TRAJECTORY-1-141','SCHEMA');
 ck(m?.classification==='repository-derived-trajectory-audit'&&m?.evidenceGrade==='E2-repository-trajectory','CLASS');
 ck(m?.observedMainSha==='122b18e8bb672774a0380492eb27580c255f9458','MAIN');
 ck(m?.coverage?.startPr===1&&m?.coverage?.endPr===141&&m?.coverage?.expectedCount===141,'CENSUS');
 const seen=new Map();for(const e of m?.epochs||[]){ck(Number.isInteger(e.start)&&Number.isInteger(e.end)&&e.start<=e.end,'EPOCH_RANGE',e.id);for(let n=e.start;n<=e.end;n++)seen.set(n,(seen.get(n)||0)+1);}for(let n=1;n<=141;n++)ck(seen.get(n)===1,'PR_COVERAGE',String(n));ck(seen.size===141&&m.epochs.length===8,'PR_COUNT');
 ck((m?.claimClasses||[]).length===7,'CLAIM_CLASSES');
 ck(m?.findings?.some(x=>x.id==='A2-POST-MERGE-TRUTH-RECONCILIATION'&&x.status==='SUPPORTED'),'TRUTH_LAG_FINDING');
 ck(m?.debt?.some(x=>x.id==='D-GOV-TRUTH-LAG'&&x.status==='resolved-in-candidate'),'TRUTH_LAG_DEBT');
 ck(m?.governanceAssessment?.verdict==='INCOHERENT-AS-LIVE-STATE-MODEL','GOV_VERDICT');
 const ce=m?.governanceAssessment?.counterexample||{};ck(ce.gitMergedPr===141&&ce.gitMainSha==='122b18e8bb672774a0380492eb27580c255f9458'&&ce.committedAuthorityMergedPr===140&&ce.committedState==='candidate','COUNTEREXAMPLE');
 const c=m?.prototypeAssessment?.criteria||[];ck(c.length===10,'BRIDGE_CRITERIA_COUNT');ck(c.some(x=>x.id==='causalPrerequisite'&&x.passes===false),'BRIDGE_CAUSAL_FAIL');ck(c.some(x=>x.id==='observableRuntimeProductEffect'&&x.passes===false),'BRIDGE_OBSERVABLE_FAIL');ck(c.some(x=>x.id==='notNaturalPartOfUiuxConverge'&&x.passes===false),'BRIDGE_DUPLICATION_FAIL');ck(c.some(x=>x.id==='noAuthorityShadow'&&x.passes===false),'BRIDGE_AUTHORITY_FAIL');ck(m?.prototypeAssessment?.verdict==='NO-NEW-SERIAL-BRIDGE','BRIDGE_DECISION');
 ck(m?.canonicalRoadmap?.completedThrough==='DECIDE-0'&&m?.canonicalRoadmap?.nextSerial==='UIUX-CONVERGE-0'&&m?.canonicalRoadmap?.c5TerminalBeforeUiuxDone===true,'ROADMAP');
 const me=m?.mutationEvidence||{};ck(me.trials===1000000&&me.materialFamilies===32&&me.materialKilled===32&&me.realModelMutants===25&&me.realModelMutantsKilled===25&&me.survivors===0&&me.harnessErrors===0&&me.digest==='3a0ba79ac13cf4f6ea84bc5ddd0606d52c4e1ed7a6fbe5f5058185957dbc5969','MUTATION_EVIDENCE');
 ck(p?.modelId==='UIUX-PROTOTYPE-ENTRY-CONTRACT'&&p?.status==='READY-TO-CONVERGE-BOUNDED'&&p?.createsNewSerialSlice===false&&p?.nextSerialSlice==='UIUX-CONVERGE-0','PROTO_CONTRACT');
 const req=Object.fromEntries((p?.requirements||[]).map(x=>[x.id,x]));for(const id of ['PR-01','PR-02','PR-03','PR-04','PR-05','PR-06','PR-07','PR-08'])ck(req[id]?.status==='repository-proven-bounded','PROTO_BASE',id);ck(req['PR-09']?.status==='not-yet-terminal','OWNER_DEBT');ck(req['PR-10']?.status==='external','HUMAN_EXTERNAL');
 const cb=String(m?.claimBoundary||'').toLowerCase();for(const token of ['representative human usability','enterprise readiness','legal compliance'])ck(cb.includes(token),'CLAIM_BOUNDARY',token);
 return f;
}
function run(root=ROOT){const m=JSON.parse(readFileSync(path.join(root,'v3/trajectory-1-141-model.json'),'utf8')),p=JSON.parse(readFileSync(path.join(root,'v3/uiux-prototype-entry-contract.json'),'utf8')),f=validateTrajectory(m,p);if(f.length){console.error(JSON.stringify({ok:false,failures:f},null,2));process.exit(1);}console.log(JSON.stringify({ok:true,suite:'trajectory-1-141',coveredPrs:141,epochs:m.epochs.length,governanceVerdict:m.governanceAssessment.verdict,bridgeDecision:m.prototypeAssessment.verdict,nextSerial:p.nextSerialSlice}));}
if(import.meta.url===`file://${process.argv[1]}`)run(process.argv[2]?path.resolve(process.argv[2]):ROOT);
