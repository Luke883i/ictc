export const REQUIRED_CONTRIBUTOR_ROUTE_IDS=Object.freeze(['ui','api','ai','persistence','docs','governance','security','evidence','runtime','enterprise-runtime']);
export const REQUIRED_FAST_PATH_STAGES=Object.freeze(['task','branch','nearest-check','pull-request']);
export const REQUIRED_FAILURE_ROUTE_IDS=Object.freeze(['docs-command-contract','c5-semantic-owner','c3-enterprise-runtime','enterprise-candidate']);

export function branchAccepted(branchName,policy){
  const name=String(branchName||'');
  if(!name||name===policy?.defaultBranch||name==='master')return false;
  return (policy?.allowedBranchPrefixes||[]).some(prefix=>name.startsWith(prefix));
}

export function failureRoute(contract,id){return (contract?.contributorDoD?.ciFailureRouting||[]).find(item=>item.id===id)||null;}

export function validateContributorRuntimeModel({contract,policy,projection}){
  const failures=[];
  const check=(condition,message)=>{if(!condition)failures.push(message);};
  const routeIds=(contract?.taskRoutes||[]).map(item=>item.id);
  check(JSON.stringify(routeIds)===JSON.stringify(REQUIRED_CONTRIBUTOR_ROUTE_IDS),'route-identity');
  check(new Set(routeIds).size===REQUIRED_CONTRIBUTOR_ROUTE_IDS.length,'route-uniqueness');
  const enterprise=(contract?.taskRoutes||[]).find(item=>item.id==='enterprise-runtime');
  check(enterprise?.entry==='v3/c3-enterprise-runtime-closure.json','enterprise-entry');
  check(enterprise?.authority==='v3/c3-enterprise-runtime-closure.json','enterprise-authority');
  check(enterprise?.nearestCheck==='node v3/c3-enterprise-bench-dod-check.mjs','enterprise-nearest');
  check(Boolean(enterprise?.convergenceRail),'enterprise-convergence');
  const dod=contract?.contributorDoD||{};
  check(dod.classification==='derived-contributor-runtime-projection','contributor-classification');
  check(dod.createsNewAuthority===false,'new-authority');
  check(JSON.stringify(dod.fastPath?.stages||[])===JSON.stringify(REQUIRED_FAST_PATH_STAGES),'fast-path-stages');
  check(Number(dod.fastPath?.maxAuthorityHops)<=2,'authority-hop-budget');
  check(dod.branchPolicy?.source==='.github/gov-01f-policy.json','branch-policy-source');
  check(dod.branchPolicy?.directMainAllowed===false,'direct-main');
  check(dod.branchPolicy?.mustBeVisibleBeforePush===true,'branch-policy-visibility');
  check(JSON.stringify(dod.branchPolicy?.allowedPrefixesProjection||[])===JSON.stringify(policy?.allowedBranchPrefixes||[]),'branch-prefix-drift');
  check(policy?.serverSidePrevention===false,'branch-protection-laundering');
  check(dod.enterpriseRuntime?.contract==='v3/c3-enterprise-runtime-closure.json','enterprise-contract');
  check(dod.enterpriseRuntime?.enterpriseOwner==='v3/runtime/enterprise-runtime-kernel.mjs','enterprise-owner');
  check(dod.enterpriseRuntime?.durableOwner==='v3/runtime/postgres-enterprise-authority.mjs','enterprise-durable-owner');
  check(dod.enterpriseRuntime?.compatibilityPath==='v3/runtime-store.mjs','compatibility-owner');
  check(dod.enterpriseRuntime?.mustRemainDistinct===true,'runtime-mode-collapse');
  check(dod.codeowners?.canonical==='.github/CODEOWNERS','canonical-codeowners');
  check(dod.codeowners?.root==='CODEOWNERS','root-codeowners');
  check(dod.codeowners?.rootMode==='pointer-only','root-codeowners-mode');
  const failureRoutes=dod.ciFailureRouting||[];
  check(JSON.stringify(failureRoutes.map(item=>item.id))===JSON.stringify(REQUIRED_FAILURE_ROUTE_IDS),'failure-route-identity');
  check(failureRoutes.every(item=>routeIds.includes(item.routeId)&&item.localReproducer),'failure-route-binding');
  check(dod.externalHumanValidation==='E3-HUMAN','human-evidence-boundary');
  if(projection){
    check(projection.branchPolicyVisible===true,'branch-policy-doc-visibility');
    check(projection.enterpriseRouteVisible===true,'enterprise-route-doc-visibility');
    check(projection.failureRoutingVisible===true,'failure-routing-doc-visibility');
    check(projection.rootCodeownersPointer===true,'root-codeowners-pointer');
    check(projection.canonicalCodeownersHasRules===true,'canonical-codeowners-rules');
    check(projection.enterpriseOwnerMatches===true,'enterprise-owner-source-drift');
    check(projection.durableOwnerMatches===true,'durable-owner-source-drift');
  }
  return Object.freeze({ok:failures.length===0,failures,routeCoverage:routeIds.length===REQUIRED_CONTRIBUTOR_ROUTE_IDS.length?1:routeIds.length/REQUIRED_CONTRIBUTOR_ROUTE_IDS.length});
}
