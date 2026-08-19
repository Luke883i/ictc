import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { GLOBAL_UX_DOD, PROCEDURE_SEQUENCE, apPrimaryAction, mcMappingOptions, mcNextDecision, rnPrimaryAction, validateDecisionSurface } from './public/ui/procedure-sequential-policy.js';

const root=path.dirname(fileURLToPath(import.meta.url));
const read=name=>readFileSync(path.join(root,name),'utf8');
const inventory=JSON.parse(read('uiux-onto-epistemic-surface-inventory.json'));
const overlayFiles=['public/ui/procedure-sequential-ux-2-2.js','public/ui/procedure-sequential-dom.js','public/ui/procedure-sequential-rn-ec.js','public/ui/procedure-sequential-rn-owner.js','public/ui/procedure-sequential-ao-mc.js','public/ui/procedure-sequential-ap.js'];
const ui=overlayFiles.map(read).join('\n');
const app=read('public/app.js');
const active=read('public/ui/active-experience.js');
const ownerRuntime=read('runtime/user-monitoring.mjs');
const coverage=read('runtime/coverage-semantics.mjs');
const aoOwner=read('public/ui/ao-auditor-facts-1-4.js');
const canonical=read('public/ui/procedure-ui-ux-1-6.js');
const anchors=read('public/ui/procedure-control-anchors-1-4-base.js');

assert.equal(Object.keys(PROCEDURE_SEQUENCE).length,5);
assert.equal(GLOBAL_UX_DOD.primaryActionsPerDecisionContext,1);
assert.equal(rnPrimaryAction({state:'active'}).label,'Apri monitoraggio');
assert.equal(rnPrimaryAction({state:'paused'}).intent,'open-monitor');
assert.equal(mcNextDecision({state:'proposed',requirementScope:null}).owner,'requirement-scope');
assert.equal(mcNextDecision({state:'proposed',requirementScope:{decision:'applicable'}}).intent,'decide-mapping');
assert.equal(apPrimaryAction({state:'ready-for-review'},{canManage:true}).selector,'[data-uiux-action-verify]');
assert.deepEqual(mcMappingOptions({targetIds:['obj-1']},[]).map(x=>x.value),['gap']);
assert.deepEqual(mcMappingOptions({targetIds:['obj-1']},['obj-1']).map(x=>x.value),['mapped','gap']);
assert.deepEqual(validateDecisionSurface({primaryActions:2}),['duplicate-primary-action']);

assert.match(app,/installActiveExperience\(\)/);
assert.doesNotMatch(app,/installSequentialProcedureUx|procedure-sequential-ux-2-2/,'2.2 must not be a second app composition root');
assert.match(active,/installSequentialProcedureUx/,'2.2 must be composed by the canonical active experience');
assert.match(active,/installProcedureUiUxFinetuning,installProcedureUiUxIntegrity,installSequentialProcedureUx/,'constitutional order must be presentation -> integrity -> journey');
assert.ok(ui.includes("phase:'journey'")&&ui.includes("authority:'journey-overlay'"),'2.2 must register as non-authoritative journey phase');
assert.equal(ui.includes('queueMicrotask'),false,'2.2 must not depend on timing to follow the canonical presentation owner');

assert.ok(ui.includes('/api/user/monitors'));
assert.ok(ownerRuntime.includes('assertRnClosedUniverse')&&ownerRuntime.includes('sourceClasses:assertRnClosedUniverse'));
for(const forbidden of ['data-seq-object-complete','data-seq-mc-action','data-seq-action-verify','/api/standards/requirement-scope','/api/grc/mappings/${','/api/grc/actions/${'])assert.equal(ui.includes(forbidden),false,`parallel decision owner forbidden in 2.2: ${forbidden}`);
assert.ok(aoOwner.includes('data-ao-complete-object')&&aoOwner.includes('/api/grc/objects/${encodeURIComponent(objectId)}/update'),'AO completion must remain canonically owned');
for(const token of ['data-uiux-scope-decision','data-uiux-mapping-decision','data-uiux-action-verify','/api/standards/requirement-scope','/api/grc/mappings/${id}/decision','/api/grc/actions/${id}/verify'])assert.ok(canonical.includes(token),`canonical 1.6 owner missing ${token}`);

assert.ok(coverage.includes('latestRequirementScope(state,m.requirementRef)'));
assert.equal(coverage.includes('m.requirementRef||m.requirementLabel'),false,'coverage projection must not resurrect requirementLabel fallback');

assert.ok(ui.includes("import { api, esc, notify")&&ui.includes("esc(mission.objective||'')")&&ui.includes("esc((mission.sourceHints||[]).join(', '))")&&ui.includes("esc(mission.promptOverride||'')"));
assert.ok(ui.includes('ictc:sequential-rendered')&&anchors.includes('ictc:sequential-rendered'),'canonical journey owner must re-anchor journey controls');
assert.equal(ui.includes('seqDecisionDialog'),false,'2.2 must not create a second generic decision dialog');
assert.equal(ui.includes('epistemicMetaCard'),false,'EP posture is already owned by merged 1.6 and must not be moved twice');

assert.deepEqual(Object.keys(inventory.procedures).sort(),Object.keys(PROCEDURE_SEQUENCE).sort());
const surfaces=Object.values(inventory.procedures).flatMap(x=>x.surfaces);
assert.equal(surfaces.length,30);
for(const [id,p] of Object.entries(inventory.procedures)){
  assert.ok(p.surfaces.length>=5,`surface inventory incomplete: ${id}`);
  for(const surface of p.surfaces){assert.ok(surface.governedObject&&surface.purpose&&surface.materialQuestion&&surface.claimBoundary,`incomplete surface spec ${surface.id}`);assert.ok(Array.isArray(surface.runtimeWrites),`runtimeWrites missing ${surface.id}`);}
}

console.log(JSON.stringify({ok:true,procedures:5,surfaces:surfaces.length,primaryActionBudget:1,progressiveListBudget:GLOBAL_UX_DOD.listItemsBeforeProgressiveDisclosure,newWriteOwner:'user-monitoring-only',delegatedOwners:['procedure-ui-ux-1-6','ao-auditor-facts-1-4'],journeyAnchorOwner:'procedure-control-anchors-1-4',compositionRoot:'active-experience',timingAuthority:'none'}));
