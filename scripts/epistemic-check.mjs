import { buildState } from '../lib/domain.mjs';

const state = await buildState();
const values = state.views;
const envelopes = [values.headline, ...values.proofTiles, ...values.sourceCards, ...values.findingCards, ...values.jobCards, ...values.coverageCards, ...values.matterCards, ...values.traceCards];
const required = ['id','label','statement','claimClass','epistemicStatus','producer','inputs','limitations','data'];
const allowed = new Set(['observed','verified','attention-required','awaiting-human-review','human-reviewed','human-owned','ai-proposed','candidate','failed','unavailable','human-rejected','mapped','designed','operating-declared','evidence-available']);
for (const envelope of envelopes) {
  for (const field of required) if (envelope[field] === undefined || envelope[field] === null) throw new Error(`${envelope.id || '?'} missing ${field}`);
  if (!allowed.has(envelope.epistemicStatus)) throw new Error(`${envelope.id}: unknown epistemicStatus ${envelope.epistemicStatus}`);
  if (!Array.isArray(envelope.inputs) || !Array.isArray(envelope.limitations) || envelope.limitations.length === 0) throw new Error(`${envelope.id}: inputs/limitations invalid`);
  if (!envelope.producer.type || !envelope.producer.id) throw new Error(`${envelope.id}: producer invalid`);
  if (/ai/i.test(envelope.producer.type) && ['human-reviewed','human-owned','verified'].includes(envelope.epistemicStatus)) throw new Error(`${envelope.id}: AI producer cannot mint authoritative state`);
}
for (const trace of values.traceCards) { if (trace.claimClass !== 'runtime-trace' || !trace.data.steps?.length) throw new Error(`${trace.id}: invalid runtime trace`); }
const serialized = JSON.stringify(state.views);
if (/"overall"|"complianceScore"|"legalConclusion"/.test(serialized)) throw new Error('Forbidden aggregate field in view model');
console.log(`epistemic-check: ok (${envelopes.length} outcome envelopes)`);
