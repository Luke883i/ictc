import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { callJson } from './ai.mjs';
import { AI_OUTPUT_PURPOSES, validateSchema } from './ai-output-schema.mjs';

const validPlan = {
  queries: ['nis2 site:europa.eu'],
  preferredSources: ['EUR-Lex'],
  inclusionCriteria: ['fonte ufficiale'],
  exclusionCriteria: ['duplicati'],
  rationale: 'Perimetro dichiarato.'
};
const validItem = {
  title: 'Direttiva NIS2', documentType: 'directive', authority: 'Unione europea', jurisdiction: 'UE',
  identifier: 'CELEX:32022L2555', sourceUrl: 'https://eur-lex.europa.eu/eli/dir/2022/2555/oj',
  publicationDate: '2022-12-27', effectiveDate: '2023-01-16', summary: 'Sintesi.', relevance: 'Pertinente.', confidence: 0.9
};
const validAnalysis = {
  proposedKind: 'incident', kindConfidence: 0.8, extractedFacts: ['Fatto'], assumptions: [], signals: ['technical-detection'],
  timeline: [{ at: '2026-08-07T10:00:00Z', event: 'Alert', source: 'user' }], affectedServices: [], impact: '', mitigations: [], indicators: [],
  suggestedQuestions: [{ label: 'Il servizio e ancora impattato?', reason: 'Cambia il passo successivo.' }]
};
const validDraft = { narrative: 'Formulazione da verificare.', factsUsed: ['Fatto'], unresolvedPoints: [], limitations: ['Verifica umana richiesta.'] };

assert.deepEqual(AI_OUTPUT_PURPOSES, ['monitoring-plan', 'compliance-discovery', 'contribution-enrichment', 'incident-analysis', 'incident-draft']);
assert.deepEqual(validateSchema('monitoring-plan', validPlan), validPlan);
assert.deepEqual(validateSchema('compliance-discovery', { items: [validItem] }), { items: [validItem] });
assert.deepEqual(validateSchema('contribution-enrichment', { items: [validItem] }), { items: [validItem] });
assert.deepEqual(validateSchema('incident-analysis', validAnalysis), validAnalysis);
assert.deepEqual(validateSchema('incident-draft', validDraft), validDraft);

const rejects = [
  () => validateSchema('monitoring-plan', { ...validPlan, queries: 'not-an-array' }),
  () => validateSchema('monitoring-plan', { ...validPlan, extra: true }),
  () => validateSchema('compliance-discovery', { items: [{ ...validItem, confidence: 1.1 }] }),
  () => validateSchema('compliance-discovery', { items: [{ ...validItem, sourceUrl: 'https://user:secret@example.test/x' }] }),
  () => validateSchema('incident-analysis', { ...validAnalysis, proposedKind: 'breach' }),
  () => validateSchema('incident-analysis', { ...validAnalysis, signals: ['invented-signal'] }),
  () => validateSchema('incident-draft', { ...validDraft, narrative: '' }),
];
for (const reject of rejects) assert.throws(reject, error => error.code === 'ai-output-schema-invalid');
assert.throws(() => validateSchema('future-unregistered-purpose', {}), error => error.code === 'ai-output-schema-unknown-purpose');

const savedPrivate = process.env.ICTC_ALLOW_PRIVATE_AI;
const savedInsecure = process.env.ICTC_ALLOW_INSECURE_AI;
process.env.ICTC_ALLOW_PRIVATE_AI = '1';
process.env.ICTC_ALLOW_INSECURE_AI = '1';
let providerOutput = { ...validPlan, queries: 'invalid' };
const server = createServer(async (request, response) => {
  for await (const _chunk of request) { /* consume request */ }
  const content = JSON.stringify(providerOutput);
  const payload = JSON.stringify({ id: 'schema-provider', choices: [{ message: { content } }] });
  response.writeHead(200, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload), 'x-request-id': 'schema-check' });
  response.end(payload);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
try {
  const { port } = server.address();
  const settings = { llm: { endpoint: `http://127.0.0.1:${port}/v1`, model: 'schema-test', apiKeyEnv: '', temperature: 0 }, governance: {} };
  await assert.rejects(callJson(settings, 'monitoring-plan', 'Schema integration test', {}), error => error.code === 'ai-output-schema-invalid');
  providerOutput = validPlan;
  const accepted = await callJson(settings, 'monitoring-plan', 'Schema integration test', {});
  assert.deepEqual(accepted.output, validPlan);
  assert.equal(accepted.trace.purpose, 'monitoring-plan');
  assert.match(accepted.trace.outputSha256, /^[0-9a-f]{64}$/);
  assert.ok(accepted.trace.limitations.some(item => item.includes('contratto strutturale')));
} finally {
  await new Promise(resolve => server.close(resolve));
  if (savedPrivate == null) delete process.env.ICTC_ALLOW_PRIVATE_AI; else process.env.ICTC_ALLOW_PRIVATE_AI = savedPrivate;
  if (savedInsecure == null) delete process.env.ICTC_ALLOW_INSECURE_AI; else process.env.ICTC_ALLOW_INSECURE_AI = savedInsecure;
}

console.log('ai-output-schema-check: ok (5 purposes, strict keys/types/bounds, callJson fail-closed)');
