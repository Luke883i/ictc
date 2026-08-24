import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const [router, primitives, styles, css] = await Promise.all([
  read('./public/ui/surface-router.js'),
  read('./public/ui/surface-primitives.js'),
  read('./public/styles.css'),
  read('./public/procedure-journey-2-1.css')
]);

for (const token of ['document.startViewTransition', 'prefers-reduced-motion: reduce', 'ictcTransitionDirection', 'transitionDirection', 'focusAfterTransition', 'announceSurfaceChanged', 'commitSurfaceNavigation']) {
  assert.ok(router.includes(token), `surface transition contract missing ${token}`);
}
for (const token of ["setAttribute('aria-current'", 'document.documentElement.dataset.ictcSurface', "new CustomEvent('ictc:surface-changed'", 'routeUrl(route)', 'commitHistory(route']) {
  assert.ok(router.includes(token), `current-route semantic contract missing ${token}`);
}
for (const token of ['retireInjectedNarrative', '[data-surface-context-strip]']) {
  assert.ok(primitives.includes(token), `structural primitive retirement contract missing ${token}`);
}
assert.equal(primitives.includes('Percorso corrente'), false, 'structural primitives must not reintroduce a visible current-path breadcrumb');
assert.ok(styles.includes("@import url('./procedure-journey-2-1.css');"), '2.1 journey css missing from canonical cascade');
for (const token of ['::view-transition-old(root)', '::view-transition-new(root)', '@media(prefers-reduced-motion:reduce)', '.surface-context-strip']) {
  assert.ok(css.includes(token), `journey css missing ${token}`);
}
assert.equal(router.includes('await document.startViewTransition'), false, 'navigation must not become async-gated by transition API');

const start = router.indexOf('export function navigateSurface');
const end = router.indexOf('export function getBackLabel');
const nav = router.slice(start, end);
for (const token of ['applyRoute(next)', 'commitHistory(next', 'commitSurfaceNavigation(next, from, direction)']) {
  assert.ok(nav.includes(token), `navigateSurface missing committed contract ${token}`);
}
assert.ok(nav.indexOf('applyRoute(next)') < nav.indexOf('commitHistory(next'), 'route state must precede History commit');
assert.ok(nav.indexOf('commitHistory(next') < nav.indexOf('commitSurfaceNavigation(next, from, direction)'), 'History must be committed before the surface DOM/semantic commit');

const commitStart=router.indexOf('function commitSurfaceNavigation');
const commitEnd=router.indexOf('export function navigateSurface');
const committed=router.slice(commitStart,commitEnd);
for(const token of ['runTransition(() => {','renderSurfaceNavigation();','announceSurfaceChanged(next, from, direction, extra);'])assert.ok(committed.includes(token),`surface commit missing ${token}`);
assert.ok(committed.indexOf('renderSurfaceNavigation();') < committed.indexOf('announceSurfaceChanged(next, from, direction, extra);'),'surface semantic notification must follow the visible DOM commit inside the transition update');
const restoreStart=router.indexOf('function restoreFromHistory');
const restoreEnd=router.indexOf('export function installSurfaceRouter');
const restore=router.slice(restoreStart,restoreEnd);
assert.ok(restore.includes("commitSurfaceNavigation(next, from, 'back', { history: 'pop' })"),'popstate must use the same committed surface boundary');

console.log('journey-navigation-check: ok (synchronous route/history state + committed visible-surface semantic event + progressive transitions; no redundant breadcrumb owner)');
