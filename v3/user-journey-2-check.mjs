import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';

const root = new URL('./', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const [html, common, render, actions, workspaces, admin, css, dod] = await Promise.all([
  read('public/index.html'),
  read('public/ui/common.js'),
  read('public/ui/render.js'),
  read('public/ui/actions.js'),
  read('public/ui/workspaces.js'),
  read('public/ui/admin-center.js'),
  read('public/journey-reborn.css'),
  read('../docs/USER_JOURNEY_2_DOD.md'),
]);

const checks = [];
function check(id, condition, evidence) {
  assert.ok(condition, `${id}: ${evidence}`);
  checks.push({ id, evidence });
}

check('single-home', (html.match(/id="homeView"/g) || []).length === 1, 'one canonical home view');
check('home-default', common.includes("storageGet('ictc-service','home')"), 'home is the default route');
check('three-routes', (html.match(/data-service=/g) || []).length === 3, 'home plus two operational routes');
check('two-operational-services', html.includes('data-service="monitoring"') && html.includes('data-service="incidents"'), 'monitoring and events remain distinct');
check('one-primary-home-action', (html.match(/id="homePrimaryAction"/g) || []).length === 1, 'one contextual primary CTA');
check('role-guidance', render.includes('renderHome') && render.includes('Amministratore') && render.includes('Utente') && render.includes('Auditor'), 'home guidance is role-aware');
check('capability-boundary', render.includes("capability('manage-monitoring')") && render.includes("capability('report-incident')"), 'guidance uses server-issued capabilities');
check('contextual-ai', render.includes('AI disponibile') && render.includes('AI non configurata'), 'AI readiness is explained without claiming authority');
check('horizontal-journey', html.includes('id="homeJourney"') && css.includes('.journey-strip') && css.includes('grid-auto-flow:column'), 'four-step journey is horizontal');
check('compact-first-viewport', css.includes('--shell-max:1280px') && css.includes('.hero{padding:var(--space-5) 0}'), 'density contract is encoded');
check('mobile-journey', css.includes('overflow-x:auto') && css.includes('scroll-snap-type:x proximity'), 'narrow journey remains ordered and scrollable');
check('home-actions-wired', actions.includes('data-home-action') && actions.includes('activateHomeAction'), 'contextual CTAs are executable');
check('plain-language-dod', dod.includes('One coherent entry point') && dod.includes('Horizontal guided journey'), 'global DoD is explicit');

const experienceText = `${html}\n${render}\n${workspaces}\n${admin}`;
for (const legacy of [
  'Plan Reveal',
  'AI Lens',
  'Question Compass',
  'Origin Diff',
  'Compliance evidence workspace',
  'Control plane',
  'Fonti normative',
  'Segnalazione progressiva',
]) {
  check(`legacy-${legacy.toLowerCase().replaceAll(' ', '-')}`, !experienceText.includes(legacy), `legacy label removed: ${legacy}`);
}

for (const preferred of [
  'Home',
  'Monitoraggio',
  'Eventi',
  'Evidenze',
  'Configurazione AI',
  'Amministrazione',
  'Suggerimento AI da verificare',
]) {
  check(`preferred-${preferred.toLowerCase().replaceAll(' ', '-')}`, experienceText.includes(preferred), `preferred label present: ${preferred}`);
}

check('human-authority', experienceText.includes('tu approvi') || experienceText.includes('conferma umana'), 'human decision boundary remains visible');
check('no-global-dom-polling', !experienceText.includes('new MutationObserver'), 'journey does not depend on global DOM polling');

await import('node:fs/promises').then(async ({ mkdir, writeFile }) => {
  await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
  await writeFile(
    new URL('../artifacts/user-journey-2-check.json', import.meta.url),
    JSON.stringify({ ok: true, checks }, null, 2),
  );
});
console.log(`user-journey-2-check: ok (${checks.length} checks)`);
