import assert from 'node:assert/strict';
import { normalizeAiKeyEnv } from './runtime/ai-secret-policy.mjs';
assert.equal(normalizeAiKeyEnv('ICTC_LLM_API_KEY'),'ICTC_LLM_API_KEY');
assert.equal(normalizeAiKeyEnv('ICTC_LLM_API_KEY_OPENAI'),'ICTC_LLM_API_KEY_OPENAI');
assert.equal(normalizeAiKeyEnv(''),'');
for(const value of ['PATH','HOME','AWS_SECRET_ACCESS_KEY','GITHUB_TOKEN','ICTC_TRUSTED_PROXY_SECRET','ICTC_LLM_API_KEY_bad'])assert.throws(()=>normalizeAiKeyEnv(value),error=>error.code==='ai-key-env-not-allowed');
console.log('ai-secret-policy-check: ok (arbitrary process.env dereference denied)');
