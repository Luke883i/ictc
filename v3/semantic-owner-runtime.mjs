import { createHash } from 'node:crypto';
import { REQUIRED_CONTRIBUTOR_ROUTE_IDS } from './contributor-runtime.mjs';

export const OWNER_CLASSES=Object.freeze(['OWNER','ADAPTER','OBSERVER','COMPATIBILITY','RETIRED']);
export const REQUIRED_TASK_ROUTE_IDS=REQUIRED_CONTRIBUTOR_ROUTE_IDS;
export const sha256=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');

export function validateSemanticOwnerContract(contract){
  const failures=[];
  const check=(condition,message)=>{if(!condition)failures.push(message);};
  check(contract?.modelId==='C5-SEMANTIC-OWNER-COMPRESSION','model-id');
  check(contract?.classification==='repository-bounded-semantic-owner-orientation-and-freshness-contract','classification');
  const classes=Object.keys(contract?.ownerClasses||{});
  check(OWNER_CLASSES.every(item=>classes.includes(item))&&classes.length===OWNER_CLASSES.length,'owner-classes');
  const surfaces=Array.isArray(contract?.surfaceOwners)?contract.surfaceOwners:[];
  check(surfaces.length===13,'surface-count');
  const surfaceIds=surfaces.map(item=>item.id);
  check(new Set(surfaceIds).size===surfaceIds.length,'duplicate-surface');
  check(surfaces.every(item=>item.owner&&item.class==='OWNER'),'surface-owner');
  check(contract?.constitutionalOwners?.surfaceCount===13,'declared-surface-count');
  check(contract?.constitutionalOwners?.businessProcedureCount===7,'business-procedure-count');
  check(contract?.constitutionalOwners?.finalGlobalResolver===null,'global-final-resolver');
  check(contract?.constitutionalOwners?.globalAnnotationClass==='OBSERVER','global-annotation-class');
  const routes=Array.isArray(contract?.taskRoutes)?contract.taskRoutes:[];
  check(JSON.stringify(routes.map(item=>item.id))===JSON.stringify(REQUIRED_TASK_ROUTE_IDS),'task-route-identity');
  check(new Set(routes.map(item=>item.id)).size===REQUIRED_TASK_ROUTE_IDS.length,'duplicate-task-route');
  for(const route of routes){
    check(Boolean(route.entry),`task-route-entry:${route.id}`);
    check(Boolean(route.authority),`task-route-authority:${route.id}`);
    check(Boolean(route.nearestCheck),`task-route-nearest:${route.id}`);
    check(Boolean(route.convergenceRail),`task-route-convergence:${route.id}`);
  }
  const contributor=contract?.contributorDoD||{};
  check(contributor.classification==='derived-contributor-runtime-projection','contributor-classification');
  check(contributor.createsNewAuthority===false,'contributor-authority-widening');
  check(contributor.branchPolicy?.source==='.github/gov-01f-policy.json','contributor-branch-policy');
  check(contributor.branchPolicy?.directMainAllowed===false,'contributor-direct-main');
  check(contributor.enterpriseRuntime?.mustRemainDistinct===true,'contributor-runtime-mode-collapse');
  check(contributor.enterpriseRuntime?.enterpriseOwner==='v3/runtime/enterprise-runtime-kernel.mjs','contributor-enterprise-owner');
  check(contributor.enterpriseRuntime?.durableOwner==='v3/runtime/postgres-enterprise-authority.mjs','contributor-durable-owner');
  check(contributor.codeowners?.canonical==='.github/CODEOWNERS'&&contributor.codeowners?.rootMode==='pointer-only','contributor-codeowners');
  check(contributor.externalHumanValidation==='E3-HUMAN','contributor-human-boundary');
  const freshness=contract?.freshness||{};
  check(Array.isArray(freshness.inputs)&&freshness.inputs.length>=8,'freshness-inputs');
  check(new Set(freshness.inputs||[]).size===(freshness.inputs||[]).length,'duplicate-freshness-input');
  check(freshness.staleMustFail===true,'stale-must-fail');
  check(Array.isArray(freshness.receiptRequiredFields)&&freshness.receiptRequiredFields.includes('receiptDigest'),'receipt-schema');
  check(contract?.trajectory?.slice==='C5-SEMANTIC-OWNER-COMPRESSION','trajectory-slice');
  check(contract?.trajectory?.createsNewSerialSlice===false,'serial-slice-widening');
  check((contract?.trajectory?.mustBeTerminalBefore||[]).includes('UIUX-CONVERGE-0'),'c5-before-uiux');
  check(contract?.trajectory?.allConditionalsTerminalBefore==='S4-A6-CLOSE','conditionals-before-s4');
  check(JSON.stringify(contract?.trajectory?.externalRailsRemainExternal||[])===JSON.stringify(['E3-HUMAN','E3-GOV','E4-DEPLOY']),'external-rails');
  check(contract?.p3Prestate?.p3a?.status==='merged'&&contract?.p3Prestate?.p3a?.pr===149,'p3a-prestate');
  check(contract?.p3Prestate?.p3b?.status==='merged'&&contract?.p3Prestate?.p3b?.pr===150,'p3b-prestate');
  check(contract?.p3Prestate?.combinedFindingCount===28,'p3-finding-count');
  check(contract?.p3Prestate?.duplicateOwnershipAllowed===false&&contract?.p3Prestate?.unownedFindingAllowed===false,'p3-owner-policy');
  const intents=contract?.intentAccounting?.items||[];
  const allowedDispositions=new Set(['enforced','documented','preserved','deferred-owned','external']);
  check(intents.length===35,'intent-ledger-count');
  check(new Set(intents.map(item=>item.id)).size===intents.length,'intent-ledger-duplicate-id');
  check(intents.every(item=>item.intent&&allowedDispositions.has(item.disposition)&&item.evidence),'intent-ledger-invalid');
  check(intents.filter(item=>item.disposition==='deferred-owned').every(item=>item.owner),'deferred-owner-missing');
  const intentCoverage=intents.length?intents.filter(item=>allowedDispositions.has(item.disposition)).length/intents.length:0;
  check(intentCoverage>=Number(contract?.intentAccounting?.minimumCoverage||1),'intent-coverage');
  check(Number(contract?.metrics?.surfaceOwnerCoverageMin)===1,'metric-surface-owner');
  check(Number(contract?.metrics?.taskRouteCoverageMin)===1,'metric-task-route');
  check(Number(contract?.metrics?.atomicIntentCoverageMin)>=.99,'metric-intent');
  check(Number(contract?.metrics?.mutationTrials)===10000,'metric-mutation-trials');
  check(Number(contract?.metrics?.needsAuditTrials)===10000,'metric-needs-audit-trials');
  return Object.freeze({ok:failures.length===0,failures,intentCoverage,surfaceOwnerCoverage:surfaces.length===13?1:surfaces.length/13,taskRouteCoverage:routes.length===REQUIRED_TASK_ROUTE_IDS.length?1:routes.length/REQUIRED_TASK_ROUTE_IDS.length});
}

export function taskRoute(contract,id){return (contract.taskRoutes||[]).find(item=>item.id===id)||null;}

export function buildSemanticClosureReceipt(contract,{sliceId=contract.trajectory?.slice,observedHead='unknown',inputs={},dependencyReceipts=[],evidenceRefs=[],limitations=[]}={}){
  const inputManifest=Object.entries(inputs).sort(([a],[b])=>a.localeCompare(b)).map(([path,content])=>Object.freeze({path,sha256:sha256(content)}));
  const deps=(dependencyReceipts||[]).map(item=>Object.freeze({sliceId:item.sliceId||'',receiptDigest:item.receiptDigest||''})).sort((a,b)=>a.sliceId.localeCompare(b.sliceId));
  const core={sliceId,observedHead,inputManifest,dependencyReceipts:deps,evidenceRefs:[...evidenceRefs],limitations:[...limitations]};
  return Object.freeze({...core,receiptDigest:sha256(JSON.stringify(core))});
}

export function evaluateSemanticClosureFreshness(receipt,{inputs={},dependencyReceipts=[]}={}){
  const current=new Map(Object.entries(inputs).map(([path,content])=>[path,sha256(content)]));
  const staleInputs=(receipt.inputManifest||[]).filter(item=>current.get(item.path)!==item.sha256).map(item=>item.path);
  const currentDeps=new Map((dependencyReceipts||[]).map(item=>[item.sliceId,item.receiptDigest]));
  const staleDependencies=(receipt.dependencyReceipts||[]).filter(item=>currentDeps.get(item.sliceId)!==item.receiptDigest).map(item=>item.sliceId);
  return Object.freeze({fresh:staleInputs.length===0&&staleDependencies.length===0,staleInputs,staleDependencies});
}
