import { strict as assert } from 'node:assert';
import path from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { readReleaseManifest } from './release.mjs';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const manifest = await readReleaseManifest();
const attestation = JSON.parse(await readFile(path.join(root, 'artifacts', 'v1-stability-attestation.json'), 'utf8'));
const byPersona = Object.fromEntries(manifest.buyerResistances.map(item => [item.persona, item]));
const differentiators = new Set(manifest.differentiators.map(item => item.id));
const simulations = [
  {
    persona: 'c-level',
    question: 'Perché acquistarlo invece di usare dashboard e fogli esistenti?',
    expected: ['catena epistemica', 'decisioni', 'receipt', 'limiti'],
    evidence: ['DIF-001', 'DIF-003', 'MET-001', 'MET-002']
  },
  {
    persona: 'auditor',
    question: 'Come distinguo integrità tecnica, completezza e giudizio umano?',
    expected: ['hash-chain', 'scope', 'esclusioni', 'review'],
    evidence: ['DIF-001', 'DIF-002', 'DIF-003', 'DOD-008']
  },
  {
    persona: 'cto',
    question: 'Che cosa impedisce di esporre accidentalmente il prototipo come servizio enterprise?',
    expected: ['safe bind', 'binary upload disabled', 'readiness', 'single-user'],
    evidence: ['DOD-002', 'DOD-003', 'DOD-004', 'MET-006']
  }
];
for (const simulation of simulations) {
  assert.ok(byPersona[simulation.persona], `${simulation.persona}: resistenza non codificata`);
  assert.ok(byPersona[simulation.persona].mitigation.length >= 40);
  for (const evidence of simulation.evidence.filter(item => item.startsWith('DIF-'))) assert.ok(differentiators.has(evidence), `${evidence}: differenziatore assente`);
}
assert.equal(attestation.result, 'passed');
assert.equal(attestation.externallyCertified, false);
assert.equal(attestation.metrics.coreJourneySuccessRate, 1);
assert.equal(attestation.metrics.receiptReadbackRate, 1);
assert.equal(attestation.metrics.criticalInScopeBlockers, 0);
assert.ok(manifest.claim.includes('non certificato da una terza parte'));
assert.ok(manifest.excludedScope.some(item => /OIDC|RBAC/.test(item)));
const artifactDir = path.join(root, 'artifacts');
await mkdir(artifactDir, { recursive: true });
await writeFile(path.join(artifactDir, 'v1-buyer-simulation.json'), JSON.stringify({
  schemaVersion: '1.0.0',
  generatedAt: new Date().toISOString(),
  result: 'passed',
  personas: simulations,
  differentiationCount: differentiators.size,
  residualRisks: manifest.buyerResistances.map(item => ({ persona: item.persona, residualRisk: item.residualRisk })),
  limitation: 'La simulazione verifica copertura e prove disponibili; non sostituisce interviste, procurement, audit indipendente o test di adozione.'
}, null, 2));
console.log(`v1-buyer-simulation: ok (${simulations.length} personas, ${differentiators.size} differentiators)`);
