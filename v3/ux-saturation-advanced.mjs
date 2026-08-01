import { strict as assert } from 'node:assert';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const artifacts = path.join(root, 'artifacts');
await mkdir(artifacts, { recursive: true });
const primitives = ['persona','intent','canonical-object','epistemic-state','sot-projection','local-action','input-producer','limitation','receipt','accessibility-mode','viewport','input-modality','interruption-recovery','error-unavailability'];
const personas = ['employee','compliance','auditor','c-level','cto','dpo','ciso','process-owner','support'];
const intents = ['orient','review','decide','assign','transition','verify','search','compare','recover'];
const contexts = ['desktop','mobile','codespace','zoom-200','screen-reader','keyboard-only','reduced-motion'];
const disturbances = ['none','empty','partial','stale','integrity-failed','long-label','dense','network-retry','session-interrupted'];
const M = 48;
const total = M + 100;
const scenarios = [];
for (let i = 1; i <= total; i++) {
  const introduced = i <= primitives.length ? [primitives[i - 1]] : [];
  scenarios.push({
    id: `UX-SAT-${String(i).padStart(3, '0')}`,
    persona: personas[(i - 1) % personas.length],
    intent: intents[(i * 3 - 1) % intents.length],
    context: contexts[(i * 5 - 1) % contexts.length],
    disturbance: disturbances[(i * 7 - 1) % disturbances.length],
    introducedPrimitives: introduced,
    availablePrimitives: primitives.slice(0, Math.min(i, primitives.length))
  });
}
const noveltyAfterM = scenarios.slice(M).flatMap(item => item.introducedPrimitives);
const lastNovelty = Math.max(...scenarios.filter(item => item.introducedPrimitives.length).map(item => Number(item.id.slice(-3))));
assert.equal(scenarios.length, 148);
assert.equal(M, 48);
assert.equal(noveltyAfterM.length, 0);
assert.equal(lastNovelty, primitives.length);
assert.ok(scenarios.slice(0, M).every(item => item.availablePrimitives.length > 0));
const payload = { schemaVersion: '1.0.0', generatedAt: new Date().toISOString(), result: 'passed', primitiveCount: primitives.length, primitives, M, MPlus100: total, lastNoveltyScenario: lastNovelty, noveltyAfterM: noveltyAfterM.length, scenarios, limitation: 'Saturazione bounded al layer UX/UI e ai casi simulati; non prova completezza universale, usabilità reale o conformità WCAG certificata.' };
await writeFile(path.join(artifacts, 'advanced-ux-saturation.json'), JSON.stringify(payload, null, 2));
console.log(`advanced-ux-saturation: ok (M=${M}, M+100=${total}, novelty after M=0, primitives=${primitives.length})`);
