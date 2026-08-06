import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const contract = JSON.parse(await readFile(new URL('./standard-proof-1-6-contract.json', import.meta.url), 'utf8'));
const slug = value => String(value).normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const canonical = new Set();

for (const [family, values] of Object.entries(contract.semanticPrimitives)) {
  for (const value of values) canonical.add(`${family}:${slug(value)}`);
}
for (const value of contract.universalInvariants) canonical.add(`invariant:${slug(value)}`);
for (const value of contract.benchmarkFamilies) canonical.add(`benchmark:${slug(value.id)}`);
for (const value of contract.architecture) canonical.add(`architecture:${slug(value.id)}`);
for (const value of contract.journeys) canonical.add(`journey:${slug(value.id)}`);
for (const value of contract.glossary) canonical.add(`glossary:${slug(value.term)}`);
for (const value of Object.keys(contract.metrics)) canonical.add(`metric:${slug(value)}`);
canonical.add(`boundary:${slug(contract.claimBoundary)}`);

const aliases = new Map([
  ['ontology:raw-input', 'ontology:material'],
  ['ontology:raw-material', 'ontology:material'],
  ['ontology:candidate-document', 'ontology:source'],
  ['ontology:proof', 'ontology:evidence'],
  ['ontology:audit-proof', 'ontology:evidence'],
  ['ontology:file', 'ontology:dossier'],
  ['ontology:record', 'ontology:dossier'],
  ['ontology:write-receipt', 'ontology:receipt'],
  ['ontology:llm-trace', 'ontology:ai-trace'],
  ['ontology:approval', 'ontology:human-decision'],
  ['ontology:identity', 'ontology:actor'],
  ['ontology:permission', 'ontology:capability'],
  ['ontology:blocker', 'ontology:readiness'],
  ['ontology:external-proof', 'ontology:attestation'],
  ['interaction:cta', 'interaction:primary-action'],
  ['interaction:expandable', 'interaction:disclosure'],
  ['interaction:modal', 'interaction:dialog'],
  ['interaction:focus', 'interaction:focus-ring'],
  ['interaction:loading', 'interaction:loading-state'],
  ['interaction:empty', 'interaction:empty-state'],
  ['interaction:error', 'interaction:error-state'],
  ['interaction:retry', 'interaction:recovery-action'],
  ['assurance:standard', 'assurance:benchmark'],
  ['assurance:evidence', 'assurance:evidence-path'],
  ['assurance:gap', 'assurance:deployment-gap'],
  ['assurance:version', 'assurance:release-identity'],
  ['aesthetic:beauty', 'aesthetic:delight'],
  ['aesthetic:compactness', 'aesthetic:density'],
  ['aesthetic:clarity', 'aesthetic:hierarchy']
]);

for (const target of aliases.values()) assert.ok(canonical.has(target), `alias target missing: ${target}`);
const compress = value => aliases.get(value) || value;
const candidateVocabulary = [...canonical, ...aliases.keys()];
const compressed = new Set(candidateVocabulary.map(compress));
assert.deepEqual(compressed, canonical);

const N = canonical.size;
const tail = 100;
const tailNovelty = [];
const aliasEntries = [...aliases.entries()];
const canonicalEntries = [...canonical];
for (let index = 0; index < tail; index += 1) {
  const candidates = [
    aliasEntries[index % aliasEntries.length][0],
    canonicalEntries[index % canonicalEntries.length],
    aliasEntries[(index * 7) % aliasEntries.length][0]
  ];
  for (const candidate of candidates) {
    const reduced = compress(candidate);
    if (!canonical.has(reduced)) tailNovelty.push({ index: index + 1, candidate, reduced });
  }
}
assert.equal(tailNovelty.length, contract.metrics.NPlus100Novelty);
if (contract.compression) {
  assert.equal(contract.compression.N, N);
  assert.equal(contract.compression.NPlus100, N + tail);
}

const report = {
  schemaVersion: contract.schemaVersion,
  model: contract.model,
  ok: true,
  inputVocabulary: candidateVocabulary.length,
  aliasCount: aliases.size,
  N,
  NPlus100: N + tail,
  compressionRatio: Number((N / candidateVocabulary.length).toFixed(4)),
  tailNovelty,
  canonicalPrimitives: [...canonical].sort(),
  limitation: 'Semantic compression is bounded to the declared ICTC vocabulary and aliases.'
};
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/standard-proof-1-6-compression.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(`standard-proof-1-6-compression: ok (input=${report.inputVocabulary}, N=${N}, N+100=${report.NPlus100}, aliases=${report.aliasCount})`);
