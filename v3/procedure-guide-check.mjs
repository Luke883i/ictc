import assert from 'node:assert/strict';
import { procedureGuide, procedureGuideIndex } from './runtime/procedure-guide.mjs';
import { compileProcessRegistry } from './runtime/process-kernel.mjs';

const expected=['monitoring','incidents','objects','coverage','actions','risks','assurance'];
for(const id of expected){const guide=procedureGuide(id);assert.equal(guide.authority,'runtime-procedure-guide');assert.equal(guide.process.id,id);assert.ok(guide.entry.length>10);assert.ok(guide.exit.length>10);assert.equal(guide.steps.length,5);assert.ok(guide.steps.some(step=>step.id==='assist'));assert.ok(guide.steps.some(step=>step.id==='decide'));assert.ok(guide.steps.filter(step=>step.aiRole==='proposal-only').length<=1);assert.equal(typeof guide.evidence.bundle,'boolean');assert.ok(guide.claimBoundary);}
const auditor=procedureGuideIndex({role:'auditor'});assert.ok(auditor.find(item=>item.processId==='risks')?.readOnly);assert.equal(auditor.some(item=>item.processId==='administration'),false);
const synthetic={id:'synthetic-compliance-watch',code:'SX-01',label:'Synthetic compliance watch',archetype:'monitor-review',kind:'service',service:'monitoring',surface:false,runtimeAdapter:'monitoring',objectTypes:['source'],inputs:['natural-language-objective'],authority:{runtime:'projection',human:'source-decision',ai:'assist-only'},roleModes:{admin:{mode:'read-write',actionLabel:'Apri',description:'Test'},auditor:{mode:'read-only',actionLabel:'Consulta',description:'Test'}},decision:{humanRequired:true,checkpoint:'source-review'},evidence:{receiptRequiredOnWrite:true,bundle:true},claimBoundary:'Synthetic test only.'};
const compiled=compileProcessRegistry([synthetic]);assert.equal(compiled.expectedCoreEdits,0);assert.ok(compiled.definitions.some(item=>item.id===synthetic.id));
console.log(`procedure-guide-check: ok (guides=${expected.length}, syntheticCoreEdits=${compiled.expectedCoreEdits})`);
