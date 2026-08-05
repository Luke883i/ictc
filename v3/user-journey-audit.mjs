import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
const root = new URL('./', import.meta.url);
const read = name => readFile(new URL(name, root), 'utf8');
const [contractText, html, render, workspaces, actions, css, monitoring, incidents] = await Promise.all([
  read('product-contract.json'), read('public/index.html'), read('public/ui/render.js'), read('public/ui/workspaces.js'),
  read('public/ui/actions.js'), read('public/journey-reborn.css'), read('runtime/monitoring.mjs'), read('runtime/incidents.mjs')
]);
const contract = JSON.parse(contractText);
const checks = [];
function annotation(value) { return String(value).replaceAll('%','%25').replaceAll('\r','%0D').replaceAll('\n','%0A'); }
function check(id, condition, outcome) {
  if (!condition) console.error(`::error title=user-journey-audit-${annotation(id)}::${annotation(outcome)}`);
  assert.ok(condition, `${id}: ${outcome}`);
  checks.push({id,outcome});
}
check('single-home-entry', (html.match(/id="homeView"/g)||[]).length === 1 && html.includes('Cosa devi fare adesso?'), 'one explanatory home entry');
check('one-contextual-cta', (html.match(/id="homePrimaryAction"/g)||[]).length === 1 && render.includes('homeAction('), 'one primary action derived from role and state');
check('horizontal-guidance', html.includes('id="homeJourney"') && css.includes('grid-auto-flow:column'), 'four-step horizontal journey');
check('minimal-monitoring-entry', (html.match(/name="objective"[^>]*required/g)||[]).length === 1, 'one mandatory monitoring question');
check('minimal-incident-entry', (html.match(/name="originalNarrative"[^>]*required/g)||[]).length === 1 && (html.match(/name="awarenessAt"[^>]*required/g)||[]).length === 1, 'narrative and awareness time only');
check('role-correct-entry', html.includes('missionForm" class="focus-card admin-only') && html.includes('userMonitoringIntro') && render.includes('auditor'), 'admin composes; user contributes; auditor reads');
check('progressive-details', html.includes('<details class="mission-prompt"'), 'advanced instructions remain collapsed');
check('single-question', workspaces.includes('incident.nextQuestion') && workspaces.includes('Domanda successiva'), 'one adaptive question is rendered at a time');
check('suggestion-boundary', workspaces.includes('Suggerimento AI da verificare') && workspaces.includes('Viene registrato solo dopo'), 'AI suggestion is not visually equivalent to a fact');
check('reason-visible', workspaces.includes('sourceDecisionReason') && workspaces.includes('pauseReason') && workspaces.includes('closureNote'), 'critical decisions collect reasons in context');
check('recovery-visible', workspaces.includes('Riprova analisi AI') && render.includes('Riprova AI') && render.includes('analisi AI non riuscita'), 'degraded journeys explain preservation and retry');
check('version-history', workspaces.includes('Versioni') && workspaces.includes('formulationVersions'), 'saved wording history is visible');
check('source-lineage', workspaces.includes('Cronologia fonte') && workspaces.includes('observations'), 'source rediscovery history is visible');
check('protected-evidence', render.includes('data-download-evidence') && workspaces.includes('data-download-evidence') && actions.includes('downloadProtected'), 'evidence is downloaded with active identity');
check('receipt-feedback', html.includes('proofPulse') && actions.includes('showReceipt'), 'successful writes surface a receipt');
check('role-leakage-zero', render.includes("capability('manage-monitoring')") && actions.includes('activateHomeAction'), 'write paths are capability-aware');
check('reduced-motion', css.includes('prefers-reduced-motion'), 'motion has an accessibility fallback');
check('no-browser-prompts', !actions.includes('prompt(') && !actions.includes('confirm('), 'decisions use explicit in-context controls');
check('monitoring-lifecycle', monitoring.includes('/pause') && monitoring.includes('/resume') && monitoring.includes('/revise'), 'plan can be revised, paused and resumed');
check('incident-lifecycle', incidents.includes('/formulation') && incidents.includes('/submit') && incidents.includes('/close'), 'wording, submission and closure are distinct writes');
check('home-plus-two-services', (html.match(/data-service=/g)||[]).length === 3 && contract.services.length === 2, 'home precedes two operational services');
check('compact-density', css.includes('--shell-max:1280px') && css.includes('.hero{padding:var(--space-5) 0}'), 'first viewport is compact');
check('plain-language', !`${html}\n${render}\n${workspaces}`.includes('Plan Reveal') && !`${html}\n${render}\n${workspaces}`.includes('AI Lens'), 'internal labels are removed');
await import('node:fs/promises').then(({mkdir,writeFile}) => Promise.all([
  mkdir(new URL('../artifacts/', import.meta.url), {recursive:true}),
  writeFile(new URL('../artifacts/user-journey-audit.json', import.meta.url), JSON.stringify({ok:true,checks}, null, 2))
]));
console.log(`user-journey-audit: ok (${checks.length} checks)`);
