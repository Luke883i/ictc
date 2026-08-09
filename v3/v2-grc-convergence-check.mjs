import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { processDefinitions, surfaceProcessDefinitions, assertRelation } from './runtime/process-kernel.mjs';
const contract=JSON.parse(await readFile(new URL('./product-contract.json',import.meta.url),'utf8'));
const server=await readFile(new URL('./server.mjs',import.meta.url),'utf8');
const activeUi=await readFile(new URL('./public/ui/active-experience.js',import.meta.url),'utf8').catch(()=>'');
const ids=['objects','coverage','actions','risks','assurance'];
assert.equal(contract.productEdition,'1.2 Market Candidate','V2 capabilities now run under the 1.2 successor product profile');
for(const id of ids){assert.ok(processDefinitions().some(x=>x.id===id),`${id} process definition missing`);assert.ok(surfaceProcessDefinitions().some(x=>x.id===id),`${id} surface process definition missing`);}
for(const rel of['object-related-to-object','mapping-links-object','gap-generates-action','risk-affects-object','risk-mitigated-by-control','assurance-supported-by-evidence'])assert.equal(assertRelation(rel),rel);
assert.ok(server.includes('createGrcRuntime'),'shared GRC runtime missing');
assert.ok(server.includes('createGrcEvidenceStore'),'shared GRC evidence store missing');
assert.ok(server.includes('standardLibraryProjection'),'Standard e Controlli successor library missing');
if(activeUi)assert.doesNotMatch(activeUi,/data-service="objects"|data-service="coverage"|data-service="actions"|data-service="risks"|data-service="assurance"/,'V2 capabilities must not reappear as permanent top-level services');
console.log(`v2-grc-convergence-check: ok (V2 contracts and relations preserved under ${contract.productEdition}; runtime behavior is verified by v2-grc-runtime-check)`);
