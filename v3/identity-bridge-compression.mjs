import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const components = ['trust', 'subject', 'decision', 'role', 'match', 'adminContinuity', 'persistence', 'disclosure'];
const witnesses = {
  trust: [{ trust: 'wrong' }, { trust: 'correct' }],
  subject: [{ subject: 'missing' }, { subject: 'present' }],
  decision: [{ decision: 'deny' }, { decision: 'allow' }],
  role: [{ role: 'user' }, { role: 'admin' }],
  match: [{ match: 'user-rule' }, { match: 'group-rule' }],
  adminContinuity: [{ adminContinuity: 'lost' }, { adminContinuity: 'preserved' }],
  persistence: [{ persistence: 'draft' }, { persistence: 'receipt-readback' }],
  disclosure: [{ disclosure: 'secret-in-ui' }, { disclosure: 'deployment-only' }]
};
const baseline = {
  trust: 'correct', subject: 'present', decision: 'allow', role: 'user', match: 'group-rule',
  adminContinuity: 'preserved', persistence: 'receipt-readback', disclosure: 'deployment-only'
};
const signature = (value, omitted = null) => components.filter(name => name !== omitted).map(name => `${name}:${value[name]}`).join('|');
for (const component of components) {
  const [leftDelta, rightDelta] = witnesses[component];
  const left = { ...baseline, ...leftDelta };
  const right = { ...baseline, ...rightDelta };
  assert.notEqual(signature(left), signature(right), component);
  assert.equal(signature(left, component), signature(right, component), component);
}
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/identity-bridge-compression.json', import.meta.url), JSON.stringify({
  ok: true,
  canonicalPrimitives: components,
  primitiveCount: components.length,
  irreducibleWitnesses: components.length,
  claim: 'Nessuna primitiva può essere rimossa senza collassare almeno una coppia semanticamente distinta entro il modello dichiarato.'
}, null, 2));
console.log(`identity-bridge-compression: ok (${components.length} primitive, ${components.length} witness di irriducibilità)`);
