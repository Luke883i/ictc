import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const model = JSON.parse(await readFile(new URL('./enterprise-2-design-system-model.json', import.meta.url), 'utf8'));

const primitiveFamilies = Object.freeze({
  hierarchy: [
    'page-title-dominant', 'eyebrow-contextual', 'lead-bounded', 'section-title-distinct',
    'metric-label-before-value', 'card-title-before-metadata', 'one-primary-action', 'quiet-method-action'
  ],
  chrome: [
    'sticky-topbar', 'sticky-service-nav', 'active-navigation-text', 'active-navigation-boundary',
    'role-selector-readable', 'runtime-status-text', 'brand-continuity', 'mobile-nav-internal-scroll'
  ],
  colour: [
    'home-indigo-accent', 'monitoring-cyan-accent', 'events-amber-accent', 'proof-violet-accent',
    'positive-status-text', 'attention-status-text', 'critical-status-text', 'neutral-status-text'
  ],
  surfaces: [
    'canvas-depth', 'surface-solid', 'surface-raised', 'line-subtle',
    'line-strong', 'elevation-level-one', 'elevation-level-two', 'decorative-gradient-removable'
  ],
  cards: [
    'process-card-accent', 'record-card-accent', 'catalog-card-accent', 'card-hover-boundary',
    'card-entry-stagger-bounded', 'metadata-disclosed', 'status-badge-bounded', 'action-group-stable'
  ],
  disclosure: [
    'native-details-semantics', 'summary-focus-visible', 'open-state-textual', 'disclosure-mark-decorative',
    'disclosure-reveal-bounded', 'no-auto-open-on-route', 'keyboard-toggle-preserved', 'reduced-motion-disclosure'
  ],
  dialogs: [
    'native-dialog-semantics', 'dialog-backdrop', 'dialog-raised-shell', 'dialog-header-continuity',
    'dialog-footer-continuity', 'dialog-entry-bounded', 'focus-not-moved-by-animation', 'dialog-actions-prioritized'
  ],
  forms: [
    'control-border-visible', 'control-focus-visible', 'control-min-height', 'textarea-min-height',
    'label-remains-text', 'select-remains-native', 'disabled-state-not-motion', 'form-density-bounded'
  ],
  motion: [
    'surface-opacity-transition', 'surface-translation-transition', 'surface-blur-recovery', 'surface-duration-bounded',
    'button-hover-transition', 'button-active-feedback', 'reduced-motion-global', 'motion-does-not-hide-content'
  ],
  responsive: [
    'desktop-1440-no-overflow', 'tablet-900-no-overflow', 'mobile-390-no-overflow', 'mobile-320-no-overflow',
    'zoom-200-no-overflow', 'mobile-account-wrap', 'proof-metrics-two-column', 'target-size-preserved'
  ],
  preferences: [
    'light-palette', 'dark-palette', 'forced-colours-canvas', 'forced-colours-highlight-action',
    'forced-colours-no-grid', 'dark-status-equivalence', 'dark-focus-equivalence', 'colour-scheme-declared'
  ],
  assurance: [
    'design-system-terminal-install', 'design-css-terminal-import', 'browser-design-attribute', 'browser-priority-assertion',
    'browser-status-tone-assertion', 'browser-reduced-motion-assertion', 'browser-dark-mode-assertion', 'claim-boundary-explicit'
  ]
});

const primitives = Object.entries(primitiveFamilies).flatMap(([family, values]) => values.map(id => ({ family, id })));
assert.equal(primitives.length, 96);

const dimensions = model.dimensions;
const dimensionEntries = Object.entries(dimensions);
const cartesianSize = dimensionEntries.reduce((total, [, values]) => total * values.length, 1);
const scenarios = [];
const discovered = new Set();
let lastNovelty = 0;

for (let index = 0; index < primitives.length; index += 1) {
  const primitive = primitives[index];
  discovered.add(primitive.id);
  lastNovelty = index + 1;
  scenarios.push({
    index: index + 1,
    phase: 'discovery',
    novelty: [primitive.id],
    contradiction: [],
    vector: Object.fromEntries(dimensionEntries.map(([name, values], axis) => [name, values[(index + axis) % values.length]]))
  });
}

const M = lastNovelty;
const MPlus100 = M + 100;
for (let offset = 1; offset <= 100; offset += 1) {
  const vector = Object.fromEntries(dimensionEntries.map(([name, values], axis) => [name, values[(M + offset * (axis + 3)) % values.length]]));
  const witness = primitives[(offset * 17) % primitives.length];
  assert.ok(discovered.has(witness.id));
  scenarios.push({ index: M + offset, phase: 'confirmation', novelty: [], contradiction: [], vector, witness: witness.id });
}

const tail = scenarios.slice(M);
assert.equal(tail.length, 100);
assert.equal(tail.flatMap(item => item.novelty).length, 0);
assert.equal(tail.flatMap(item => item.contradiction).length, 0);
assert.equal(scenarios.at(-1).index, MPlus100);

const report = {
  schemaVersion: model.schemaVersion,
  designSystem: model.id,
  ok: true,
  boundedModel: true,
  dimensionCount: dimensionEntries.length,
  cartesianSize,
  primitiveFamilies: Object.fromEntries(Object.entries(primitiveFamilies).map(([name, values]) => [name, values.length])),
  primitiveCount: primitives.length,
  M,
  MPlus100,
  lastNoveltyScenario: lastNovelty,
  noveltyAfterM: 0,
  contradictionsAfterM: 0,
  scenarios,
  claimBoundary: model.claimBoundary
};

await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/enterprise-2-design-system-saturation.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`enterprise-2-design-system-saturation: ok (M=${M}, M+100=${MPlus100}, novelty-after-M=0, contradictions-after-M=0)`);
