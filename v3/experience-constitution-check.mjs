import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXPERIENCE_ROOT, EXPECTED_EXPERIENCE_PARTICIPANTS, analyzeExperienceParticipants, assertExpectedExperienceParticipants } from './public/ui/experience-constitution.js';
import { MAX_EXPERIENCE_REPLAY_CYCLES } from './public/ui/experience-lifecycle.js';

const root=path.dirname(fileURLToPath(import.meta.url));
const repo=path.dirname(root);
const read=relative=>readFileSync(path.join(repo,relative),'utf8');
const noop=()=>{};
const expected=EXPECTED_EXPERIENCE_PARTICIPANTS.map(item=>({...item,render:noop}));
assert.equal(EXPERIENCE_ROOT.id,'active-experience');
assert.equal(EXPERIENCE_ROOT.installer,'installActiveExperience');
assert.equal(MAX_EXPERIENCE_REPLAY_CYCLES,32);
assert.deepEqual(analyzeExperienceParticipants(expected),[]);
assert.deepEqual(assertExpectedExperienceParticipants(expected).map(item=>item.id),['procedure-executive-harmonization-1-5','procedure-ui-ux-1-6','procedure-ui-ux-integrity-1-6','procedure-sequential-ux-2-2','procedure-control-anchors-1-4']);

const app=read('v3/public/app.js');
const active=read('v3/public/ui/active-experience.js');
const executive=read('v3/public/ui/procedure-executive-harmonization-1-5.js');
const executiveBase=read('v3/public/ui/procedure-executive-harmonization-1-5-base.js');
const presentation=read('v3/public/ui/procedure-ui-ux-1-6.js');
const integrity=read('v3/public/ui/procedure-ui-ux-integrity-1-6.js');
const journey=read('v3/public/ui/procedure-sequential-ux-2-2.js');
const anchors=read('v3/public/ui/procedure-control-anchors-1-4.js');
const anchorsBase=read('v3/public/ui/procedure-control-anchors-1-4-base.js');
const lifecycle=read('v3/public/ui/experience-lifecycle.js');
const css=read('v3/public/ui-convergence.css');
const current=read('v3/current-release-suite.mjs');
const workflow=read('.github/workflows/uiux-onto-epistemic.yml');
const uiStandard=read('.github/workflows/ui-standard.yml');
const ci=read('.github/workflows/ci.yml');
const pkg=JSON.parse(read('package.json'));
const authority=read('docs/authority-matrix.yaml');

const rootInstalls=app.match(/\binstall[A-Z][A-Za-z0-9_]*\(\);/g)||[];
assert.deepEqual(rootInstalls,['installActiveExperience();'],'app.js must expose one composition installer only');
assert.doesNotMatch(app,/procedure-sequential-ux-2-2|installSequentialProcedureUx/,'journey overlay must not be a second app composition root');
assert.match(active,/installProcedureExecutiveHarmonization|installProcedureControlAnchors/);
assert.match(active,/installProcedureUiUxFinetuning,installProcedureUiUxIntegrity,installSequentialProcedureUx/,'final procedure participants must remain installed in canonical composition');
assert.match(active,/assertRegisteredExperienceConstitution\(\)/);assert.match(active,/installExperienceLifecycle\(\)/);

for(const [name,source,phase,authorityClass] of [
  ['harmonization',executive,'harmonization','presentation-harmonization'],
  ['presentation',presentation,'presentation','decision-presentation'],
  ['integrity',integrity,'integrity','integrity-observer'],
  ['journey',journey,'journey','journey-overlay'],
  ['annotation',anchors,'annotation','control-annotation']
]){
  assert.match(source,new RegExp(`phase:'${phase}'`),`${name} phase registration missing`);
  assert.match(source,new RegExp(`authority:'${authorityClass}'`),`${name} authority registration missing`);
  assert.doesNotMatch(source,/queueMicrotask|setTimeout\s*\(/,`${name} must not use timing as authority`);
}
assert.doesNotMatch(executiveBase,/queueMicrotask|setTimeout\s*\(/,'executive base must not retain a late timing escape');
assert.doesNotMatch(anchorsBase,/queueMicrotask|setTimeout\s*\(/,'anchor base must not retain a late timing escape');
assert.doesNotMatch(journey,/ictc:sequential-rendered/,'journey must not need a side-channel event to trigger later annotation');
assert.equal((lifecycle.match(/queueMicrotask/g)||[]).length,1,'lifecycle may contain one coalescing boundary only');
assert.match(lifecycle,/if\(flushing\)\{replay=true;return;\}/,'reentrant requests must replay in the current flush instead of queueing an echo microtask');
assert.match(lifecycle,/MAX_EXPERIENCE_REPLAY_CYCLES/);assert.match(lifecycle,/experience-lifecycle-nonconvergent/);assert.match(lifecycle,/Authority order is defined by EXPERIENCE_PHASES/);
assert.doesNotMatch(presentation,/createElement\(['"]style['"]\)/,'presentation must not inject CSP-blocked inline CSS');assert.doesNotMatch(integrity,/createElement\(['"]style['"]\)/,'integrity must not inject CSP-blocked inline CSS');assert.match(css,/Procedure UI\/UX 1\.6: CSP-safe final presentation geometry/,'effective 1.6 styling must remain externally owned');
for(const check of['v3/experience-constitution-check.mjs','v3/experience-constitution-saturation.mjs','v3/uiux-onto-epistemic-check.mjs','v3/uiux-onto-epistemic-saturation.mjs'])assert.ok(current.includes(`'${check}'`),`canonical current suite missing ${check}`);
assert.doesNotMatch(workflow,/\bpull_request\s*:/,'dedicated UIUX workflow must not remain a second PR gate authority');assert.match(workflow,/workflow_dispatch\s*:/,'manual UIUX diagnostic replay must remain available');
assert.doesNotMatch(uiStandard,/\bpull_request\s*:/,'historical ui-standard workflow must not remain a second PR gate authority');assert.match(uiStandard,/workflow_dispatch\s*:/,'manual ui-standard diagnostic replay must remain available');
for(const browser of['v3/browser-pr60-polish.py','v3/browser-procedure-finetuning-1-4.py'])assert.ok(ci.includes(browser),`canonical browser rail missing migrated coverage: ${browser}`);
assert.match(ci,/post_browser_failure/,'canonical browser rail must publish per-script failure provenance');
assert.equal(pkg.private,true,'package must be non-publishable by default');
for(const key of['ui_composition_root','ui_presentation_harmonization','ui_decision_presentation','ui_integrity_observer','ui_journey_overlay','ui_control_annotation'])assert.match(authority,new RegExp(`\\n  ${key}:`),`authority matrix missing ${key}`);
console.log(JSON.stringify({ok:true,root:EXPERIENCE_ROOT.id,participants:EXPECTED_EXPERIENCE_PARTICIPANTS.length,phaseOrder:EXPECTED_EXPERIENCE_PARTICIPANTS.map(item=>item.phase),timingAuthority:'forbidden-in-final-participants',coalescingAuthority:'experience-lifecycle-only',browserGateAuthority:'ci.yml/browser-journeys',manualDiagnostics:['uiux-onto-epistemic','ui-standard'],replayGuard:MAX_EXPERIENCE_REPLAY_CYCLES,packagePrivate:true}));
