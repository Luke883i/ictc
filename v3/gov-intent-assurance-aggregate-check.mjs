import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {A_FAMILIES,B_FAMILIES,C_FAMILIES,assertBaselineBindings,loadContract,runSaturation} from './gov-intent-assurance-lib.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),contract=loadContract(root);assertBaselineBindings(root,contract);
assert.equal(contract.authorityEffect,'NONE');assert.equal(contract.trajectoryImpact,'neutral');assert.equal(contract.createsNewSot,false);assert.equal(contract.createsNewRoadmapCursor,false);assert.equal(contract.persistsDynamicCursor,false);
assert.deepEqual(Object.keys(contract.campaigns),['A','B','C']);assert.equal(contract.campaigns.A.failureFamilies,A_FAMILIES.length);assert.equal(contract.campaigns.B.failureFamilies,B_FAMILIES.length);assert.equal(contract.campaigns.C.failureFamilies,C_FAMILIES.length);for(const id of ['A','B','C']){assert.equal(contract.campaigns[id].trials,1000000);assert.equal(contract.campaigns[id].noNoveltyTail,100000);}
const union=new Set([...A_FAMILIES,...B_FAMILIES,...C_FAMILIES]);assert.equal(union.size,A_FAMILIES.length+B_FAMILIES.length+C_FAMILIES.length);assert.ok(contract.linkage.rule.includes('all three green'));assert.ok(contract.linkage.sharedInvariants.length>=7);
const canaries=['A','B','C'].map((id,i)=>runSaturation(id,{trials:10000,tail:1000,seed:BigInt(9001+i*7919)}));assert.ok(canaries.every(x=>x.ok&&x.survivors===0&&x.noNovelty));
console.log(JSON.stringify({ok:true,suite:contract.contractId,baselineMainSha:contract.baselineMainSha,globalQualification:'A && B && C',campaigns:Object.fromEntries(canaries.map(x=>[x.campaign,{canaryTrials:x.trials,failureFamilies:x.failureFamilies,pairs:x.pairs,survivors:x.survivors,noNovelty:x.noNovelty}])),sharedInvariants:contract.linkage.sharedInvariants,claimBoundary:contract.claimBoundary}));
