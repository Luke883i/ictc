import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { processDefinitions, surfaceProcessDefinitions, assertRelation } from './runtime/process-kernel.mjs';
const contract=JSON.parse(await readFile(new URL('./product-contract.json',import.meta.url),'utf8'));
const server=await readFile(new URL('./server.mjs',import.meta.url),'utf8');
const activeUi=await readFile(new URL('./public/ui/active-experience.js',import.meta.url),'utf8').catch(()=>'');
const ids=['objects','coverage','actions','risks','assurance'];
try {
  assert.equal(contract.productEdition,'1.2 Market Candidate','V2 capabilities run under the 1.2 successor profile');
  assert.deepEqual(contract.permanentShell,['home','processes','proof']);
  assert.equal(contract.experienceMetrics.activeUiCompositions,1);
  assert.equal(contract.services.find(x=>x.id==='coverage').label,'Standard e Controlli');
  for(const id of ids){assert.ok(processDefinitions().some(x=>x.id===id),`${id} process definition missing`);assert.ok(surfaceProcessDefinitions().some(x=>x.id===id),`${id} surface process definition missing`);}
  for(const rel of['object-related-to-object','mapping-links-object','gap-generates-action','risk-affects-object','risk-mitigated-by-control','assurance-supported-by-evidence'])assert.equal(assertRelation(rel),rel);
  assert.ok(server.includes('createGrcRuntime'),'shared GRC runtime missing');assert.ok(server.includes('createGrcEvidenceStore'),'shared GRC evidence store missing');assert.ok(server.includes('standardLibraryProjection'),'Standard e Controlli successor library missing');
  assert.equal((activeUi.match(/installGrcWorkspace\(\)/g)||[]).length,1,'V2 capabilities must converge on one GRC workspace implementation');
  for(const forbidden of['installBusinessNexus','installProcessLandscape','installV3EntryPoint','installNoviceEntry'])assert.ok(!activeUi.includes(forbidden),`legacy presentation authority returned: ${forbidden}`);
  console.log(`v2-grc-convergence-check: ok (V2 relations/runtime preserved under ${contract.productEdition}; one successor workspace, three permanent surfaces)`);
} catch(error){console.error(`::error title=v2-grc-convergence::${error.stack||error.message}`);throw error;}
