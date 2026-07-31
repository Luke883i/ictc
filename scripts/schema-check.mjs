import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { buildState, readSeed, readLedger, verifyLedger } from '../lib/domain.mjs';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const schemaDir = path.join(root, 'schemas');
const schemaNames = [];
for (const name of await readdir(schemaDir)) {
  if (!name.endsWith('.json')) continue;
  schemaNames.push(name);
  const schema = JSON.parse(await readFile(path.join(schemaDir, name), 'utf8'));
  if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema') throw new Error(`${name}: wrong JSON Schema dialect`);
  if (!schema.$id || !schema.title || !schema.type) throw new Error(`${name}: $id/title/type required`);
}
const seed = await readSeed();
const requiredCollections = ['ecosystems','sources','findings','scoutJobs','controlCoverage','matters'];
for (const collection of requiredCollections) if (!Array.isArray(seed[collection])) throw new Error(`seed.${collection} must be an array`);
for (const source of seed.sources) for (const field of ['id','ecosystemId','title','kind','locator','authorityClass','lifecycle','reviewState','reviewOwner']) if (!source[field]) throw new Error(`source ${source.id || '?'} missing ${field}`);
for (const job of seed.scoutJobs) for (const field of ['id','label','ecosystemId','schedule','mode','lastRunState','reviewOwner']) if (!job[field]) throw new Error(`job ${job.id || '?'} missing ${field}`);
for (const matter of seed.matters) for (const field of ['id','kind','title','originalNarrative','workflowState','owner','raci','facts']) if (!matter[field]) throw new Error(`matter ${matter.id || '?'} missing ${field}`);
const state = await buildState();
if (!state.views?.headline) throw new Error('projection missing views.headline');
if (!Array.isArray(state.views.traceCards) || state.views.traceCards.length < 4) throw new Error('projection missing runtime traces');
for (const trace of state.views.traceCards) {
  if (!trace.data?.steps?.length) throw new Error(`trace ${trace.id} has no steps`);
  for (const step of trace.data.steps) for (const field of ['id','label','status','statusLabel','statement','producer','inputRefs']) if (step[field] === undefined) throw new Error(`trace ${trace.id}/${step.id || '?'} missing ${field}`);
}
const wiring = JSON.parse(await readFile(path.join(root, 'docs', 'ui-wiring-manifest.json'), 'utf8'));
if (!wiring.version || !Array.isArray(wiring.controls) || !wiring.controls.length) throw new Error('ui wiring manifest invalid');
for (const control of wiring.controls) for (const field of ['id','selector','effect','evidence']) if (!control[field]) throw new Error(`wiring control missing ${field}`);
const ledger = await readLedger();
for (const event of ledger) for (const field of ['id','type','actor','producer','at','previousHash','payload','hash']) if (event[field] === undefined) throw new Error(`ledger event ${event.id || '?'} missing ${field}`);
if (!verifyLedger(ledger).ok) throw new Error('ledger does not satisfy audit-event/hash-chain contract');
const attestationPath = path.join(root, 'artifacts', 'visual-attestation.json');
try {
  await access(attestationPath);
  const attestation = JSON.parse(await readFile(attestationPath, 'utf8'));
  for (const field of ['schemaVersion','generatedAt','mode','inspectedBy','viewport','artifacts','checks','limitation']) if (attestation[field] === undefined) throw new Error(`visual attestation missing ${field}`);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
console.log(`schema-check: ok (${schemaNames.length} schemas, ${seed.sources.length} sources, ${seed.scoutJobs.length} jobs, ${seed.matters.length} matters, ${ledger.length} audit events)`);
