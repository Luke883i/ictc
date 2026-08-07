import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
await import('./enterprise-2-compliance-flow-saturation.mjs');
const model = JSON.parse(await read('./enterprise-2-compliance-flow-model.json'));
const scenarios = JSON.parse(await read('../artifacts/enterprise-2-compliance-flow-scenarios.json'));
const ui = [
  await read('./public/ui/enterprise-2-compliance-flow.js'),
  await read('./public/ui/enterprise-2-compliance-fields.js'),
  await read('./public/ui/enterprise-2-compliance-settings.js'),
  await read('./public/ui/enterprise-2-compliance-operations.js')
].join('\n');
const css = `${await read('./public/enterprise-2-compliance-flow.css')}\n${await read('./public/enterprise-2-compliance-configuration.css')}`;
const app = await read('./public/app.js');
const styles = await read('./public/styles.css');
const docs = await read('../docs/ENTERPRISE_2_COMPLIANCE_FLOW.md');
const browser = await read('./browser-enterprise-2-compliance-flow-check.py');
const verified = [];

function verify(name, assertion) {
  assertion();
  verified.push(name);
}

verify('six-stage-human-flow', () => {
  assert.equal(model.stages.length, 6);
  assert.deepEqual(model.stages.map(stage => stage.id), ['frame','scope','collect','assess','decide','review']);
  for (const label of ['Inquadra','Delimita','Raccogli','Valuta','Decidi e attua','Riesamina']) assert.match(ui, new RegExp(label));
  assert.match(ui, /Fase consigliata/);
  assert.match(ui, /Vedi il percorso completo/);
});
verify('terminal-wiring', () => {
  assert.match(app, /enterprise-2-compliance-flow\.js/);
  assert.match(app, /installEnterprise2ComplianceFlow\(\)/);
  assert.match(styles, /enterprise-2-compliance-flow\.css/);
  assert.match(styles, /enterprise-2-compliance-configuration\.css/);
  assert.ok(app.indexOf('installEnterprise2ComplianceFlow()') > app.indexOf('installEnterprise2DesignSystem()'));
  assert.ok(styles.indexOf('enterprise-2-compliance-flow.css') > styles.indexOf('enterprise-2-design-system-refinement.css'));
  assert.ok(styles.indexOf('enterprise-2-compliance-configuration.css') > styles.indexOf('enterprise-2-compliance-flow.css'));
});
verify('authority-safe', () => {
  assert.doesNotMatch(ui, /\bfetch\s*\(/);
  assert.doesNotMatch(ui, /\bapi\s*\(/);
  assert.doesNotMatch(ui, /permissions?\s*=/i);
  assert.match(model.claimBoundary, /does not determine legal/i);
});
verify('settings-essential-first', () => {
  assert.equal(model.configurationSteps.length, 3);
  assert.deepEqual(model.configurationSteps.map(step => step.essential), [true,true,false]);
  assert.match(ui, /configuration-overview/);
  assert.match(ui, /openSettingsSection/);
  assert.match(ui, /sibling\.open = false/);
  assert.match(ui, /Contesto organizzativo/);
  assert.match(ui, /Connessione AI/);
  assert.match(ui, /Istruzioni assistite/);
  assert.match(ui, /Le singole ricerche si configurano in Monitoraggio normativo/);
});
verify('professional-form-copy', () => {
  for (const label of ['Ambito operativo','Ambiti territoriali','Indirizzo del servizio','Modello autorizzato','Nome della variabile segreta','Variabilità della risposta']) assert.match(ui, new RegExp(label));
  for (const avoided of ['Policy globali e prompt tecnici','Configurazione del singolo job','Compliance score','Stato di conformità']) assert.doesNotMatch(ui, new RegExp(avoided));
});

verify('monitoring-configuration-flow', () => {
  assert.match(ui, /Configura una ricerca normativa/);
  assert.match(ui, /Obiettivo e ambito/);
  assert.match(ui, /Criteri di ricerca/);
  assert.match(ui, /Frequenza e istruzioni/);
  assert.match(ui, /Riferimento del confronto/);
  assert.match(ui, /Novità dal riferimento/);
  assert.match(ui, /Una persona verifica il piano prima dell’attivazione/);
  assert.match(css, /job-configuration-overview/);
  assert.match(css, /job-config-group/);
  assert.doesNotMatch(css, /job-configuroup/);
});

verify('admin-progressive-groups', () => {
  assert.match(ui, /Contesto del servizio/);
  assert.match(ui, /Limiti e modelli/);
  assert.match(ui, /Aggiungi identità locale/);
  assert.match(ui, /bindSingleOpen/);
  assert.match(ui, /Salva regole di accesso/);
});
verify('responsive-and-preferences', () => {
  for (const token of ['320','390','zoom-200']) assert.ok(JSON.stringify(model.dimensions.viewport).includes(token));
  assert.match(css, /@media\(max-width:480px\)/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css, /@media\(forced-colors:active\)/);
  assert.match(css, /min-height:48px|min-height:44px/);
  assert.match(css, /grid-template-columns:1fr/);
});

verify('browser-journey-contract', () => {
  assert.match(browser, /data-compliance-flow=\"compliance-guided-1\"/);
  assert.match(browser, /settings-single-open/);
  assert.match(browser, /monitoring-single-open/);
  assert.match(browser, /settings-390/);
  assert.match(browser, /settings-320/);
  assert.match(browser, /forced_colors='active'/);
});

verify('scenario-tail', () => {
  assert.equal(scenarios.tailScenarios.length, 100);
  assert.equal(scenarios.M, 134);
  assert.equal(scenarios.MPlus100, 234);
  for (const scenario of scenarios.tailScenarios) {
    assert.ok(scenario.description.length > 80);
    assert.ok(scenario.lexicalDecision.canonical);
    assert.ok(scenario.componentRefactoring.pattern);
  }
});
verify('dod-and-standards', () => {
  assert.ok(model.definitionOfDone.length >= 20);
  assert.ok(model.standards.some(value => /WCAG 2\.2/.test(value)));
  assert.ok(model.standards.some(value => /WAI-ARIA/.test(value)));
  assert.match(docs, /Definition of Done/);
  assert.match(docs, /M \+ 100/);
  assert.match(docs, /non dimostra/i);
});

const report = {
  schemaVersion: model.schemaVersion,
  ok: true,
  model: model.id,
  verified,
  stages: model.stages.map(({ id, label }) => ({ id, label })),
  configurationSteps: model.configurationSteps,
  scenarioTail: scenarios.tailScenarios.length,
  M: scenarios.M,
  MPlus100: scenarios.MPlus100,
  definitionOfDone: model.definitionOfDone,
  standards: model.standards,
  claimBoundary: model.claimBoundary
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/enterprise-2-compliance-flow-check.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`enterprise-2-compliance-flow-check: ok (${verified.length} groups, ${report.stages.length} stages, ${report.scenarioTail} confirmation scenarios)`);
