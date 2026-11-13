import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PROCEDURE_IDS,normalizeProcedurePresentation,procedurePolicyProjection} from '../../src/runtime/procedure-policy.mjs';
const read=path=>readFileSync(new URL('../../'+path,import.meta.url),'utf8');
const s=Object.freeze({frame:read('public/ui/procedure-frame.js'),anatomy:read('public/ui/procedure-anatomy.js'),shell:read('public/ui/stable-shell.js'),copy:read('public/ui/product-copy.js'),market:read('public/ui/procedure-market-ux.js'),admin:read('src/runtime/admin.mjs'),css:read('public/semantic-workspace-closure-3-2-1.css'),recordCss:read('public/procedure-record-primitives-2-4.css')});
function laws(x){
 return {
 seven:PROCEDURE_IDS.length===7,
 maturityOff:procedurePolicyProjection({settings:{}},{role:'admin'}).presentation.showMaturity===false&&x.frame.includes('showCatalogueMaturity()?maturityBadge'),
 maturityOn:normalizeProcedurePresentation({presentation:{showMaturity:true}}).showMaturity===true&&x.frame.includes('ensureMaturityLegend(host)'),
 independentFlag:x.admin.includes('normalizeProcedurePresentation(input,')&&x.admin.includes('features,presentation'),
 onboarding:x.shell.includes('required.length===3&&count===3')&&x.shell.includes('seen.add(id)')&&x.shell.includes('onboardingLessonGate(dialog)'),
 noComprehension:x.shell.includes('Conferma')&&x.shell.includes('onboarding')&&x.copy.includes('problemNarrative:'),
 homeActions:x.copy.includes('responseSteps:Object.freeze(')&&x.shell.includes('home-compliance-response-steps'),
 inspector:x.anatomy.includes('r8ProcedureInspector')&&x.anatomy.includes('inspectorSources(host)')&&x.anatomy.includes('dialog.showModal()'),
 noDuplicateInspectorWriter:x.anatomy.includes('cloneNode(true)')&&x.anatomy.includes('data-r8-inspector-source')&&x.anatomy.includes('duplicate.remove()'),
 mcSingleWriter:x.market.includes("mapping?.querySelector('form.market-mapping-form')")&&x.market.includes('replaceChildren(mappingForm)')&&x.market.includes("dataset.writer='existing-grc-mapping-form'"),
 compact:x.css.includes('R8 canonical seven-procedure compact header')&&x.css.includes('min-height:0!important'),
 readable:x.recordCss.includes('minmax(19rem,1.5fr)')&&x.recordCss.includes('flex-wrap:nowrap'),
 };
}
const expected=laws(s);assert.ok(Object.values(expected).every(Boolean),JSON.stringify(expected));
const broken=[
 x=>({...x,frame:x.frame.replace('showCatalogueMaturity()?maturityBadge','false?maturityBadge')}),
 x=>({...x,admin:x.admin.replaceAll('features,presentation','features')}),
 x=>({...x,shell:x.shell.replace('required.length===3&&count===3','count>=0')}),
 x=>({...x,copy:x.copy.replace('problemNarrative:','unboundedNarrative:')}),
 x=>({...x,copy:x.copy.replace('responseSteps:Object.freeze(','responseStepsDisabled:Object.freeze(')}),
 x=>({...x,anatomy:x.anatomy.replaceAll('dialog.showModal()','dialog.show()')}),
 x=>({...x,anatomy:x.anatomy.replaceAll('duplicate.remove()','')}),
 x=>({...x,market:x.market.replaceAll('replaceChildren(mappingForm)','append(mappingForm.cloneNode(true))')}),
 x=>({...x,css:x.css.replaceAll('R8 canonical seven-procedure compact header','old-header')}),
 x=>({...x,recordCss:x.recordCss.replaceAll('minmax(19rem,1.5fr)','minmax(2rem,1fr)')}),
];
for(const [i,mutation] of broken.entries()){const observed=laws(mutation(s));assert.ok(Object.values(observed).some(v=>!v),'mutant survived '+i);}
console.log(JSON.stringify({ok:true,gate:'ux-r8-adoption-source-policy',sourceLaws:Object.keys(expected).length,mutations:broken.length,mutantsKilled:broken.length,claimLimit:'source and pure runtime only; user journeys, screenshots and human usability require separate proof'}));
