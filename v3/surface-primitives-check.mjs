import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const [styles, css, js, active] = await Promise.all([
  read('./public/styles.css'),
  read('./public/surface-primitives.css'),
  read('./public/ui/surface-primitives.js'),
  read('./public/ui/active-experience.js')
]);

assert.ok(styles.includes("@import url('./surface-primitives.css');"), 'surface primitive css missing from canonical cascade');
for (const token of ['.surface-canvas', '.surface-toolbar', '.surface-mode-switch', '.surface-data-region', '.surface-raw', '--surface-control-min:44px', 'prefers-reduced-motion']) {
  assert.ok(css.includes(token), `surface primitive css missing ${token}`);
}
assert.ok(css.includes(':where(button,summary,[role="button"])'), 'canonical surface interactive target grammar missing');
for (const surface of ['home', 'processes', 'monitoring', 'incidents', 'grc', 'proof', 'epistemic']) {
  assert.ok(js.includes(`${surface}:`), `surface primitive root missing ${surface}`);
}
for (const token of ['surface-canvas', 'surface-panel', 'surface-toolbar', 'surface-data-region', 'ictcSurfacePrimitives']) {
  assert.ok(js.includes(token), `surface primitive runtime missing ${token}`);
}
assert.ok(js.includes('applyPending=false'), 'surface primitive events must share a coalescing owner');
assert.ok(js.includes('scheduleSurfacePrimitives'), 'surface primitive coalescer missing');
assert.ok(js.includes("['ictc:rendered','ictc:surface-changed','ictc:context-changed','ictc:projection-committed']"), 'surface primitive event ownership drift');
assert.ok(active.includes('INSTALL_ORDER'), 'active experience install order should be explicit and inspectable');
assert.ok(active.includes('installSurfacePrimitives'), 'active experience does not install canonical surface primitives');

console.log('surface-primitives-check: ok (shared primitives + 44px target grammar + explicit/coalesced ownership)');
