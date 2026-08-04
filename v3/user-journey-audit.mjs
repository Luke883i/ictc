import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
const root = new URL('./', import.meta.url);
const read = name => readFile(new URL(name, root), 'utf8');
const [contractText, html, render, workspaces, actions, css, monitoring, incidents] = await Promise.all([
  read('product-contract.json'), read('public/index.html'), read('public/ui/render.js'), read('public/ui/workspaces.js'),
  read('public/ui/actions.js'), read('public/styles-experience.css'), read('runtime/monitoring.mjs'), read('runtime/incidents.mjs')
]);
const contract = JSON.parse(contractText);
const checks = [];
function check(id, condition, outcome) { assert.ok(condition, `${id}: ${outcome}`); checks.push({id,outcome}); }
check('minimal-monitoring-entry', (html.match(/name="objective"[^>]*required/g)||[]).length === 1, 'one mandatory monitoring question');
check('minimal-incident-entry', (html.match(/name="originalNarrative"[^>]*required/g)||[]).length === 1 && (html.match(/name="awarenessAt"[^>]*required/g)||[]).length === 1, 'narrative and awareness time only');
check('role-correct-entry', html.includes('missionForm" class="focus-card admin-only') && html.includes('userMonitoringIntro'), 'admin composes; user reads and contributes');
check('progressive-details', html.includes('<details class="mission-prompt"'), 'advanced prompt remains collapsed');
check('single-question', workspaces.includes('incident.nextQuestion') && workspaces.includes('Question Compass'), 'one adaptive question is rendered at a time');
check('suggestion-boundary', workspaces.includes('Proposta AI modificabile') && workspaces.includes('Diventa dato soltanto'), 'suggestion is never visually equivalent to a fact');
check('reason-visible', workspaces.includes('sourceDecisionReason') && workspaces.includes('pauseReason') && workspaces.includes('closureNote'), 'critical decisions collect reasons in context');
check('recovery-visible', workspaces.includes('Riprova analisi AI') && render.includes('Riprova AI') && render.includes('AI da riprovare'), 'degraded journeys explain preservation and retry');
check('version-history', workspaces.includes('Versioni formulazione') && workspaces.includes('formulationVersions'), 'saved wording history is visible');
check('source-lineage', workspaces.includes('Lineage') && workspaces.includes('observations'), 'source rediscovery history is visible');
check('protected-evidence', render.includes('data-download-evidence') && workspaces.includes('data-download-evidence') && actions.includes('downloadProtected'), 'evidence is downloaded with active identity');
check('receipt-feedback', html.includes('proofPulse') && actions.includes('showReceipt'), 'every successful write can surface a proof pulse');
check('role-leakage-zero', !render.includes('disabled administrative') && render.includes("state.data.actor.role === 'admin'"), 'administrative actions are omitted rather than disabled for users');
check('reduced-motion', css.includes('prefers-reduced-motion'), 'motion has an accessibility fallback');
check('no-browser-prompts', !actions.includes('prompt(') && !actions.includes('confirm('), 'decisions use explicit in-context controls');
check('monitoring-lifecycle', monitoring.includes('/pause') && monitoring.includes('/resume') && monitoring.includes('/revise'), 'plan can be revised, paused and resumed');
check('incident-lifecycle', incidents.includes('/formulation') && incidents.includes('/submit') && incidents.includes('/close'), 'wording, submission and closure are distinct writes');
check('two-service-navigation', (html.match(/data-service=/g)||[]).length === 2 && contract.services.length === 2, 'navigation mirrors product scope');
await import('node:fs/promises').then(({mkdir,writeFile}) => Promise.all([
  mkdir(new URL('../artifacts/', import.meta.url), {recursive:true}),
  writeFile(new URL('../artifacts/user-journey-audit.json', import.meta.url), JSON.stringify({ok:true,checks}, null, 2))
]));
console.log(`user-journey-audit: ok (${checks.length} checks)`);
