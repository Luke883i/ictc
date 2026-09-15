import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateContributorRuntimeModel } from './contributor-runtime.mjs';
const clone=value=>structuredClone(value);
const contract=JSON.parse(await readFile(new URL('./semantic-owner-contract.json',import.meta.url),'utf8'));
const policy=JSON.parse(await readFile(new URL('../.github/gov-01f-policy.json',import.meta.url),'utf8'));
const projection={branchPolicyVisible:true,enterpriseRouteVisible:true,failureRoutingVisible:true,rootCodeownersPointer:true,canonicalCodeownersHasRules:true,enterpriseOwnerMatches:true,durableOwnerMatches:true};
const baseline=validateContributorRuntimeModel({contract,policy,projection});assert.equal(baseline.ok,true,baseline.failures.join('\n'));
let x=0xC017B100;const rnd=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296};const pick=a=>a[Math.floor(rnd()*a.length)];
const mutations=[
['drop-route',m=>m.contract.taskRoutes.splice(Math.floor(rnd()*m.contract.taskRoutes.length),1)],
['reorder-route',m=>{[m.contract.taskRoutes[0],m.contract.taskRoutes[1]]=[m.contract.taskRoutes[1],m.contract.taskRoutes[0]]}],
['duplicate-route',m=>m.contract.taskRoutes[9]={...m.contract.taskRoutes[8]}],
['enterprise-entry',m=>m.contract.taskRoutes[9].entry='v3/server.mjs'],
['enterprise-authority',m=>m.contract.taskRoutes[9].authority='v3/store.mjs'],
['enterprise-nearest',m=>m.contract.taskRoutes[9].nearestCheck='npm test'],
['new-authority',m=>m.contract.contributorDoD.createsNewAuthority=true],
['fast-path-loss',m=>m.contract.contributorDoD.fastPath.stages.pop()],
['fast-path-order',m=>m.contract.contributorDoD.fastPath.stages.reverse()],
['hop-budget',m=>m.contract.contributorDoD.fastPath.maxAuthorityHops=5],
['branch-source',m=>m.contract.contributorDoD.branchPolicy.source='CONTRIBUTING.md'],
['branch-prefix-loss',m=>m.contract.contributorDoD.branchPolicy.allowedPrefixesProjection.pop()],
['branch-prefix-extra',m=>m.contract.contributorDoD.branchPolicy.allowedPrefixesProjection.push('tmp/')],
['direct-main',m=>m.contract.contributorDoD.branchPolicy.directMainAllowed=true],
['branch-policy-hidden',m=>m.projection.branchPolicyVisible=false],
['server-protection-launder',m=>m.policy.serverSidePrevention=true],
['enterprise-contract',m=>m.contract.contributorDoD.enterpriseRuntime.contract='v3/c3-capacity-contract.json'],
['enterprise-owner',m=>m.contract.contributorDoD.enterpriseRuntime.enterpriseOwner='v3/server.mjs'],
['durable-owner',m=>m.contract.contributorDoD.enterpriseRuntime.durableOwner='v3/sqlite-state-persistence.mjs'],
['mode-collapse',m=>m.contract.contributorDoD.enterpriseRuntime.mustRemainDistinct=false],
['root-codeowners-mode',m=>m.contract.contributorDoD.codeowners.rootMode='authoritative'],
['root-codeowners-source',m=>m.projection.rootCodeownersPointer=false],
['canonical-codeowners-empty',m=>m.projection.canonicalCodeownersHasRules=false],
['failure-route-loss',m=>m.contract.contributorDoD.ciFailureRouting.pop()],
['failure-route-bind',m=>m.contract.contributorDoD.ciFailureRouting[0].routeId='missing'],
['failure-local-loss',m=>m.contract.contributorDoD.ciFailureRouting[0].localReproducer=''],
['failure-doc-hidden',m=>m.projection.failureRoutingVisible=false],
['enterprise-doc-hidden',m=>m.projection.enterpriseRouteVisible=false],
['enterprise-source-drift',m=>m.projection.enterpriseOwnerMatches=false],
['durable-source-drift',m=>m.projection.durableOwnerMatches=false],
['human-boundary',m=>m.contract.contributorDoD.externalHumanValidation='E2']
];
const kills=new Map(mutations.map(([name])=>[name,0]));let killed=0,survivors=0;
for(let i=0;i<100000;i++){
  const m={contract:clone(contract),policy:clone(policy),projection:clone(projection)};const [name,apply]=pick(mutations);apply(m);
  const verdict=validateContributorRuntimeModel(m);if(verdict.ok){survivors++;console.error(JSON.stringify({survivor:i,name}));break;}killed++;kills.set(name,kills.get(name)+1);
}
assert.equal(killed,100000);assert.equal(survivors,0);for(const [name,count] of kills)assert.ok(count>0,`unexercised ${name}`);
console.log(JSON.stringify({ok:true,model:'CONTRIBUTOR-RUNTIME-1',seed:'0xC017B100',trials:100000,families:mutations.length,killed,survivors,killRate:killed/100000,familyKills:Object.fromEntries(kills),claimBoundary:'Deterministic contributor-contract adversarial mutations; not 100k human contributions, PRs or independent usability observations.'}));
