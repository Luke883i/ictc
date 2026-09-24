import assert from 'node:assert/strict';
import { compileSeedPrePrOrder, loadSeedPrePrContract, validateSeedPrePrContract } from './seed-prepr.mjs';
const contract=loadSeedPrePrContract(),verdict=validateSeedPrePrContract(contract);
assert.equal(verdict.ok,true,verdict.failures.join('\n'));
assert.deepEqual(compileSeedPrePrOrder(contract),['UI-OBJECT-TYPE-COMPRESSION-1','DEMO-TRUTH-METADATA-1','STANDARD-KNOWLEDGE-PACK-UX-1','EP-ADMIN-LANDING-1','HOMEBOARDING-1']);
assert.equal(contract.rules.authority,'input-only');
assert.equal(contract.serialSlice,false);
console.log(JSON.stringify({ok:true,contract:contract.contractId,seeds:contract.seeds.map(s=>s.id),compiledOrder:compileSeedPrePrOrder(contract),claimBoundary:'Seed-prePR is typed intent input only. It cannot redefine product, convergence, runtime, evidence or merge truth.'}));
