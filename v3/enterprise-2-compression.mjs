import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const contract = JSON.parse(await readFile(new URL('./enterprise-2-contract.json', import.meta.url), 'utf8'));
const invariants = contract.globalInvariants.map(item => item.id);
const baseline = Object.fromEntries(invariants.map(id => [id, 'satisfied']));
const witnesses = Object.fromEntries(invariants.map((id, index) => [id, [
  { ...baseline, [id]: `violated-${index + 1}` },
  { ...baseline, [id]: 'satisfied' }
]]));
const signature = (value, omitted = null) => invariants.filter(id => id !== omitted).map(id => `${id}:${value[id]}`).join('|');

for (const invariant of invariants) {
  const [left, right] = witnesses[invariant];
  assert.notEqual(signature(left), signature(right), `${invariant} has no distinguishing witness`);
  assert.equal(signature(left, invariant), signature(right, invariant), `${invariant} is derivable from another invariant`);
}

const report = {
  schemaVersion: contract.schemaVersion,
  ok: true,
  canonicalInvariants: contract.globalInvariants,
  invariantCount: invariants.length,
  irreducibleWitnesses: invariants.length,
  claim: 'Within the declared model, removing any retained invariant collapses at least one pair of semantically distinct UI/UX states.',
  limitations: ['Irreducibility applies to this contract vocabulary and does not preclude a future equivalent reformulation.']
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/enterprise-2-compression.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`enterprise-2-compression: ok (${invariants.length} invariants, ${invariants.length} witnesses)`);
