import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const [router, primitives, styles, css] = await Promise.all([
  read('./public/ui/surface-router.js'),
  read('./public/ui/surface-primitives.js'),
  read('./public/styles.css'),
  read('./public/procedure-journey-2-1.css')
]);

for (const token of ['document.startViewTransition', 'prefers-reduced-motion: reduce', 'ictcTransitionDirection', 'transitionDirection', 'focusAfterTransition', 'announceSurfaceChanged']) {
  assert.ok(router.includes(token), `surface transition contract missing ${token}`);
}
for (const token of ['surface-context-strip', 'Percorso corrente', 'data-service="processes"', 'surfaceContextLevel', 'ictc:context-changed']) {
  assert.ok(primitives.includes(token), `current-path contract missing ${token}`);
}
assert.ok(styles.includes("@import url('./procedure-journey-2-1.css');"), '2.1 journey css missing from canonical cascade');
for (const token of ['::view-transition-old(root)', '::view-transition-new(root)', '@media(prefers-reduced-motion:reduce)', '.surface-context-strip']) {
  assert.ok(css.includes(token), `journey css missing ${token}`);
}
assert.equal(router.includes('await document.startViewTransition'), false, 'navigation must not become async-gated by transition API');

const start = router.indexOf('export function navigateSurface');
const end = router.indexOf('export function getBackLabel');
const nav = router.slice(start, end);
for (const token of ['applyRoute(next)', 'commitHistory(next', 'announceSurfaceChanged(next', 'runTransition(renderSurfaceNavigation']) {
  assert.ok(nav.includes(token), `navigateSurface missing synchronous contract ${token}`);
}
assert.ok(nav.indexOf('applyRoute(next)') < nav.indexOf('commitHistory(next'), 'route state must precede History commit');
assert.ok(nav.indexOf('commitHistory(next') < nav.indexOf('announceSurfaceChanged(next'), 'History must be committed before surface semantic notification');
assert.ok(nav.indexOf('announceSurfaceChanged(next') < nav.indexOf('runTransition(renderSurfaceNavigation'), 'surface semantic notification must not be delayed by visual animation');

console.log('journey-navigation-check: ok (readable synchronous route semantics + progressive visual transitions + current-path primitive)');
