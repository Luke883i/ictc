import { strict as assert } from 'node:assert';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const html = await readFile(path.join(root, 'app/index.html'), 'utf8');
const css = await readFile(path.join(root, 'app/styles.css'), 'utf8');
const js = await readFile(path.join(root, 'app/app.js'), 'utf8');
const artifactDir = path.join(root, 'artifacts');
await mkdir(artifactDir, { recursive: true });

const checks = [];
function check(name, condition, detail) {
  assert.ok(condition, `${name}: ${detail}`);
  checks.push({ name, status: 'passed', detail });
}

function attributes(fragment) {
  return Object.fromEntries([...fragment.matchAll(/([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)].map(match => [match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? '']));
}

function elements(tag) {
  return [...html.matchAll(new RegExp(`<${tag}\\b([^>]*)>`, 'gi'))].map(match => ({ raw: match[0], attrs: attributes(match[1]) }));
}

function contrast(hexA, hexB) {
  const rgb = hex => {
    const value = hex.replace('#', '');
    return [0, 2, 4].map(index => parseInt(value.slice(index, index + 2), 16) / 255);
  };
  const luminance = hex => rgb(hex).map(value => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
    .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  const [light, dark] = [luminance(hexA), luminance(hexB)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

try {
  check('document-language', /<html\b[^>]*\blang="it"/i.test(html), 'html lang="it"');
  check('document-title', /<title>[^<]+<\/title>/i.test(html), 'titolo presente');
  check('responsive-viewport', /name="viewport"/i.test(html), 'viewport presente');
  check('skip-link', /class="skip-link"[^>]*href="#main"/i.test(html), 'salto diretto al main');
  check('main-landmark', /<main\b[^>]*id="main"[^>]*tabindex="-1"/i.test(html), 'main focalizzabile dopo navigazione');
  check('no-inline-event-handlers', !/\son[a-z]+\s*=/i.test(html), 'compatibile con CSP script-src self');
  check('no-positive-tabindex', !/tabindex="[1-9][0-9]*"/i.test(html), 'ordine del focus nativo');

  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  const labelTargets = new Set([...html.matchAll(/<label\b[^>]*for="([^"]+)"/gi)].map(match => match[1]));
  for (const tag of ['input', 'textarea', 'select']) {
    for (const element of elements(tag)) {
      const type = element.attrs.type || '';
      if (type === 'hidden') continue;
      const labelled = Boolean(element.attrs['aria-label'] || element.attrs['aria-labelledby'] || (element.attrs.id && labelTargets.has(element.attrs.id)));
      check(`label-${tag}-${element.attrs.id || 'unnamed'}`, labelled, element.raw);
    }
  }

  for (const dialog of elements('dialog')) {
    const reference = dialog.attrs['aria-labelledby'];
    const labelled = Boolean(dialog.attrs['aria-label'] || (reference && (ids.has(reference) || js.includes(`id=\"${reference}\"`))));
    check(`dialog-name-${dialog.attrs.id || 'unnamed'}`, labelled, reference || dialog.attrs['aria-label']);
  }

  const staticButtons = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)];
  for (const match of staticButtons) {
    const attrs = attributes(match[1]);
    const text = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    check(`button-name-${attrs.id || attrs['data-nav'] || text.slice(0, 20)}`, Boolean(attrs['aria-label'] || text), match[0].slice(0, 140));
    check(`button-type-${attrs.id || attrs['data-nav'] || text.slice(0, 20)}`, Boolean(attrs.type), 'type esplicito');
  }

  check('visible-focus', /:focus-visible\s*\{[^}]*outline:/s.test(css), 'focus ring esplicito');
  check('reduced-motion', /@media\s*\(prefers-reduced-motion:\s*reduce\)/s.test(css), 'preferenza sistema rispettata');
  check('manual-motion-toggle', /data-motion="reduced"/s.test(css) && /toggleMotion/s.test(js), 'riduzione movimento attivabile dalla UI');
  check('minimum-target-guideline', /min-height:\s*44px/s.test(css), 'controlli principali con altezza minima 44px');
  check('keyboard-command-palette', /\.ctrlKey/s.test(js) && /\.metaKey/s.test(js) && /key\.toLowerCase\(\)|key\.toLowerCase/s.test(js) && /['\"]k['\"]/s.test(js), 'Ctrl/Cmd+K implementato');
  check('navigation-current-state', /aria-current/s.test(js) && /updateNavigation|updateNav/s.test(js), 'stato di navigazione aggiornato');
  check('search-results-wired', /commandResults/s.test(js) && /data-envelope/s.test(js) && /openDetail/s.test(js), 'risultati ricerca aprono il dettaglio');
  check('source-mode-wired', /setSourceMode/s.test(js) && /sourceFile/s.test(js), 'Link e file sono modalità operative');
  check('assistant-expanded-state', /aria-expanded/s.test(js) && /aria-hidden/s.test(js), 'pannello AI espone stato aperto/chiuso');
  check('detail-dialog-name-runtime', /id=\\?"detailTitle\\?"/s.test(js), 'titolo del dettaglio generato nel runtime');

  const contrastPairs = [
    ['ink-on-surface', '#202421', '#ffffff', 4.5],
    ['muted-on-surface', '#68736c', '#ffffff', 4.5],
    ['white-on-accent', '#ffffff', '#3f5950', 4.5],
    ['attention-on-background', '#8a6436', '#fbf5ec', 4.5],
    ['proposal-on-background', '#625d77', '#f3f1f9', 4.5],
    ['danger-on-background', '#85525a', '#faf1f2', 4.5]
  ];
  for (const [name, foreground, background, minimum] of contrastPairs) {
    const ratio = contrast(foreground, background);
    check(`contrast-${name}`, ratio >= minimum, `${ratio.toFixed(2)}:1`);
  }

  const payload = {
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    result: 'passed',
    checks,
    conformanceTarget: 'WCAG 2.2 AA-oriented beta baseline',
    limitations: [
      'Il validator zero-dependency copre struttura, nomi, focus, movimento, wiring e contrasto dei token principali.',
      'La verifica con screen reader e browser/assistive technology reali resta un gate manuale e CI dedicato.'
    ]
  };
  await writeFile(path.join(artifactDir, 'accessibility-audit.json'), JSON.stringify(payload, null, 2));
  console.log(`accessibility-audit: ok (${checks.length} checks)`);
} catch (error) {
  await writeFile(path.join(artifactDir, 'accessibility-audit.json'), JSON.stringify({
    schemaVersion: '1.0.0', generatedAt: new Date().toISOString(), result: 'failed', checks, error: error.message
  }, null, 2));
  throw error;
}
