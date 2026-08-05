import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
const root = new URL('./', import.meta.url);
const read = name => readFile(new URL(name, root), 'utf8');
const [contractText, invariantsText, questions, monitoring, incidents, contributions, model, store, common] = await Promise.all([
  read('product-contract.json'), read('experience-invariants.json'), read('question-engine.mjs'),
  read('runtime/monitoring.mjs'), read('runtime/incidents.mjs'), read('runtime/contributions.mjs'),
  read('runtime/model.mjs'), read('store.mjs'), read('public/ui/common.js')
]);
const contract = JSON.parse(contractText);
const invariants = JSON.parse(invariantsText);
const checks = [];
function check(id, condition, detail) { assert.ok(condition, `${id}: ${detail}`); checks.push({id, detail}); }
check('two-services', contract.services.map(item=>item.id).join(',') === 'monitoring,incidents', 'only monitoring and incidents');
check('two-roles', contract.roles.map(item=>item.id).join(',') === 'admin,user', 'only admin and user');
check('invariant-depth', invariants.invariants.length >= 18, `${invariants.invariants.length} explicit invariants`);
check('monitoring-raw-first', monitoring.indexOf('monitoring.mission.intent.recorded') < monitoring.indexOf('planningEnvelope = await completePlan'), 'objective is persisted before planning AI');
check('contribution-raw-first', contributions.indexOf('contribution.recorded') < contributions.indexOf('enrichOne(recordedId'), 'material is persisted before enrichment AI');
check('incident-raw-first', incidents.indexOf('incident.intake.recorded') < incidents.indexOf('analyzeOne(recordedId'), 'narrative is persisted before analysis AI');
check('human-adoption', questions.includes('ai-suggestion-confirmed') && questions.includes('human-corrected-or-entered'), 'AI suggestions require a recorded human relation');
check('question-purpose', questions.includes('whyNow') && questions.includes('evidenceUse'), 'every adaptive question explains purpose and evidence use');
check('draft-gate', incidents.includes("'questions-open'") && incidents.indexOf("'questions-open'") < incidents.indexOf('const ai = await draftIncident'), 'draft is blocked while gaps remain');
check('versioned-formulation', incidents.includes('formulationVersions') && incidents.includes('incident.formulation.saved'), 'wording is versioned before submission');
check('saved-digest-submit', incidents.includes('formulationSha256') && incidents.includes('formulation-conflict'), 'submission binds the confirmed version digest');
check('recoverable-ai', monitoring.includes('needs-plan') && contributions.includes('/api/contributions/:id/enrich') && incidents.includes('/api/incidents/:id/analyze'), 'all AI entry points preserve raw input and expose retry');
check('reasoned-decisions', monitoring.includes('reason-required') && incidents.includes('closure-note-required'), 'source, pause and close decisions require reasons');
check('least-privilege', model.includes('visibleContributions') && model.includes('visibleIncidents') && model.includes('prompts: null'), 'user projection excludes unrelated private data and prompts');
check('observation-history', model.includes('mergeCatalogObservation') && model.includes('observations'), 'rediscovery appends observations');
check('linked-evidence', store.includes('relatedSha256') && store.includes('eventsSha256') && store.includes('formulations'), 'bundles link related objects, versions and events');
check('attachment-cleanup', store.includes('deleteAttachments') && contributions.includes('deleteAttachments') && incidents.includes('deleteAttachments'), 'failed raw writes remove unreferenced files');
check('protected-download', common.includes('downloadProtected') && common.includes("'x-ictc-role'"), 'evidence download carries active identity headers');
check('anti-overclaim', contract.boundaries.some(item=>item.includes('non determina')) && contract.boundaries.some(item=>item.includes('non verità')), 'legal and evidentiary limits remain explicit');
await import('node:fs/promises').then(({mkdir,writeFile}) => Promise.all([
  mkdir(new URL('../artifacts/', import.meta.url), {recursive:true}),
  writeFile(new URL('../artifacts/onto-epistemic-audit.json', import.meta.url), JSON.stringify({ok:true,checks}, null, 2))
]));
console.log(`onto-epistemic-audit: ok (${checks.length} checks)`);
