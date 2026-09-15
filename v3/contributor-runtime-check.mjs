import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateSemanticOwnerContract } from './semantic-owner-runtime.mjs';
import { branchAccepted, failureRoute, REQUIRED_CONTRIBUTOR_ROUTE_IDS, validateContributorRuntimeModel } from './contributor-runtime.mjs';

const read=path=>readFile(new URL(path,import.meta.url),'utf8');
const [contractText,policyText,contributing,startHere,testing,rootCodeowners,canonicalCodeowners,c3Text]=await Promise.all([
  read('./semantic-owner-contract.json'),read('../.github/gov-01f-policy.json'),read('../CONTRIBUTING.md'),read('../docs/START_HERE.md'),read('../docs/TESTING.md'),read('../CODEOWNERS'),read('../.github/CODEOWNERS'),read('./c3-enterprise-runtime-closure.json')
]);
const contract=JSON.parse(contractText),policy=JSON.parse(policyText),c3=JSON.parse(c3Text);
const semantic=validateSemanticOwnerContract(contract);assert.equal(semantic.ok,true,semantic.failures.join('\n'));
const rootRules=rootCodeowners.split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
const canonicalRules=canonicalCodeowners.split(/\r?\n/).map(line=>line.trim()).filter(line=>line&&!line.startsWith('#'));
const projection={
  branchPolicyVisible:contributing.includes('.github/gov-01f-policy.json')&&policy.allowedBranchPrefixes.every(prefix=>contributing.includes(`\`${prefix}\``))&&startHere.includes('.github/gov-01f-policy.json'),
  enterpriseRouteVisible:startHere.includes('`enterprise-runtime`')&&startHere.includes('v3/c3-enterprise-runtime-closure.json')&&startHere.includes('v3/runtime/enterprise-runtime-kernel.mjs'),
  failureRoutingVisible:contract.contributorDoD.ciFailureRouting.every(item=>testing.includes(`\`${item.id}\``)&&testing.includes(`\`${item.localReproducer}\``)),
  rootCodeownersPointer:rootRules.length>0&&rootRules.every(line=>line.startsWith('#'))&&rootCodeowners.includes('.github/CODEOWNERS'),
  canonicalCodeownersHasRules:canonicalRules.length>0,
  enterpriseOwnerMatches:c3.runtimeMode?.enterprise===contract.contributorDoD.enterpriseRuntime.enterpriseOwner,
  durableOwnerMatches:c3.implementation?.sharedDurableAuthority===contract.contributorDoD.enterpriseRuntime.durableOwner
};
const verdict=validateContributorRuntimeModel({contract,policy,projection});assert.equal(verdict.ok,true,verdict.failures.join('\n'));
assert.equal(policy.defaultBranch,'main');assert.equal(policy.serverSidePrevention,false,'GOV-01F must not launder branch protection');
assert.equal(branchAccepted('feat/example',policy),true);assert.equal(branchAccepted('agent/example',policy),true);assert.equal(branchAccepted('main',policy),false);assert.equal(branchAccepted('random/example',policy),false);
assert.deepEqual(contract.taskRoutes.map(item=>item.id),[...REQUIRED_CONTRIBUTOR_ROUTE_IDS]);
assert.equal(failureRoute(contract,'c3-enterprise-runtime')?.routeId,'enterprise-runtime');
assert.ok(testing.includes('## Diagnosi dei failure di contribuibilità'));
assert.ok(startHere.includes('RuntimeStore')&&startHere.includes('SQLite compatibility path'));
console.log(JSON.stringify({ok:true,model:'CONTRIBUTOR-RUNTIME-1',routes:contract.taskRoutes.length,branchPrefixes:policy.allowedBranchPrefixes.length,failureRoutes:contract.contributorDoD.ciFailureRouting.length,rootCodeowners:'pointer-only',enterpriseRuntimeOwner:c3.runtimeMode.enterprise,durableAuthority:c3.implementation.sharedDurableAuthority,claimBoundary:contract.contributorDoD.claimBoundary}));
