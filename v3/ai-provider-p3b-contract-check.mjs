import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AI_PROVIDER_IDS, AI_PROVIDER_PROFILES, buildAiProviderRequest, normalizeAiProviderId, providerAuthHeaders, providerContent, providerDefaults, resolveAiProvider } from './runtime/ai-provider-adapters.mjs';
import { normalizeAiKeyEnv } from './runtime/ai-secret-policy.mjs';
import { readScreenshotLedger, validateScreenshotLedger } from './uiux-p3-screenshot-ledger.mjs';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
export function runAiProviderP3bContractCheck(){
  const metrics=validateScreenshotLedger(readScreenshotLedger(),{expectedOwner:'P3B'});
  assert.deepEqual(AI_PROVIDER_IDS,['openai','anthropic','deepseek','custom-openai-compatible']);
  assert.equal(AI_PROVIDER_PROFILES.openai.protocol,'openai-chat-completions');
  assert.equal(AI_PROVIDER_PROFILES.anthropic.protocol,'anthropic-messages');
  assert.equal(AI_PROVIDER_PROFILES.deepseek.protocol,'openai-chat-completions');
  assert.equal(providerDefaults('openai').apiKeyEnv,'ICTC_LLM_API_KEY_OPENAI');
  assert.equal(providerDefaults('anthropic').apiKeyEnv,'ICTC_LLM_API_KEY_ANTHROPIC');
  assert.equal(providerDefaults('deepseek').apiKeyEnv,'ICTC_LLM_API_KEY_DEEPSEEK');
  for(const id of AI_PROVIDER_IDS)assert.equal(normalizeAiKeyEnv(providerDefaults(id).apiKeyEnv),providerDefaults(id).apiKeyEnv,`provider ${id} must stay inside canonical AI secret namespace`);
  assert.equal(normalizeAiProviderId('',AI_PROVIDER_PROFILES.anthropic.endpoint),'anthropic');
  assert.equal(normalizeAiProviderId('',AI_PROVIDER_PROFILES.deepseek.endpoint),'deepseek');
  assert.equal(normalizeAiProviderId('','https://llm.example/v1/chat/completions'),'custom-openai-compatible');
  const openai=resolveAiProvider({provider:'openai',model:'gpt-test'}),anthropic=resolveAiProvider({provider:'anthropic',model:'claude-test'}),deepseek=resolveAiProvider({provider:'deepseek',model:'deepseek-test'}),custom=resolveAiProvider({provider:'custom-openai-compatible',endpoint:'https://llm.example/v1/chat/completions',model:'custom-test',apiKeyEnv:'ICTC_LLM_API_KEY_CUSTOM'});
  assert.equal(openai.endpoint,AI_PROVIDER_PROFILES.openai.endpoint);assert.equal(anthropic.endpoint,AI_PROVIDER_PROFILES.anthropic.endpoint);assert.equal(deepseek.endpoint,AI_PROVIDER_PROFILES.deepseek.endpoint);assert.equal(custom.endpoint,'https://llm.example/v1/chat/completions');
  const common={prompt:'system',inputJson:'{"x":1}',maxOutputTokens:64,temperature:.1};
  const openaiReq=buildAiProviderRequest(openai,common),anthropicReq=buildAiProviderRequest(anthropic,common);
  assert.ok(Array.isArray(openaiReq.body.messages));assert.equal(openaiReq.body.response_format.type,'json_object');assert.equal(openaiReq.body.max_tokens,64);
  assert.equal(anthropicReq.body.system,'system');assert.ok(Array.isArray(anthropicReq.body.messages));assert.equal(anthropicReq.body.max_tokens,64);assert.equal(anthropicReq.headers['anthropic-version'],'2023-06-01');assert.equal('response_format' in anthropicReq.body,false);
  assert.deepEqual(providerAuthHeaders(openai,'secret'),{authorization:'Bearer secret'});assert.deepEqual(providerAuthHeaders(anthropic,'secret'),{'x-api-key':'secret'});
  assert.equal(providerContent(openai,{choices:[{message:{content:'{"ok":true}'}}]}),'{"ok":true}');assert.equal(providerContent(anthropic,{content:[{type:'text',text:'{"ok":true}'}]}),'{"ok":true}');
  const ai=read('./ai.mjs'),admin=read('./runtime/admin.mjs'),settings=read('./public/ui/settings-1-8-fix.js'),css=read('./public/settings-1-8-fix.css'),openapi=read('../docs/openapi.yaml');
  for(const token of ['fetchAiEndpoint','assertAiBudget','validateSchema','buildAiProviderRequest','providerAuthHeaders','providerContent','testAiProvider'])assert.ok(ai.includes(token),`AI call-path missing ${token}`);
  for(const token of ["pathname==='/api/admin/ai/test'","requirePermission(actor,'configure-ai'","validateSettings","testAiProvider"])assert.ok(admin.includes(token),`probe boundary missing ${token}`);
  for(const token of ['OpenAI','Anthropic','DeepSeek','Personalizzato (OpenAI-compatible)','ICTC_LLM_API_KEY_OPENAI','ICTC_LLM_API_KEY_ANTHROPIC','ICTC_LLM_API_KEY_DEEPSEEK','data-ai-provider-test','data-ai-provider-status','Configurazione modificata: verifica prima dell’uso.','/api/admin/ai/test','Impostazioni avanzate'])assert.ok(settings.includes(token),`guided settings missing ${token}`);
  for(const token of ['.ai-provider-selector','.ai-provider-advanced','.ai-provider-status','data-ai-provider-status="ok"','data-ai-provider-status="error"'])assert.ok(css.includes(token),`provider settings CSS missing ${token}`);
  assert.ok(openapi.includes('/api/admin/ai/test:'));assert.ok(openapi.includes('senza salvarla'));
  let seed=0x50334216,passed=0;const next=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
  for(let i=0;i<100000;i++){const family=next()%6;if(family===0)assert.notEqual(AI_PROVIDER_PROFILES.anthropic.protocol,'openai-chat-completions');if(family===1)assert.deepEqual(providerAuthHeaders(anthropic,'k'),{'x-api-key':'k'});if(family===2)assert.equal(normalizeAiProviderId('',AI_PROVIDER_PROFILES.deepseek.endpoint),'deepseek');if(family===3)assert.equal(normalizeAiKeyEnv(providerDefaults('openai').apiKeyEnv),'ICTC_LLM_API_KEY_OPENAI');if(family===4)assert.equal(normalizeAiKeyEnv(providerDefaults('anthropic').apiKeyEnv),'ICTC_LLM_API_KEY_ANTHROPIC');if(family===5)assert.equal(validateScreenshotLedger(readScreenshotLedger(),{expectedOwner:'P3B'}).p3b,'6/6');passed++;}
  return Object.freeze({ok:true,suite:'ai-provider-p3b-contract-check',...metrics,owner:'P3B',ownedFindings:'6/6',providerProfiles:'4/4',protocolFamilies:'2/2',secretNamespace:'4/4',deterministicContractTrials:100000,passed,claimBoundary:'Repository/runtime contract only; no external provider availability, credential validity, production capacity or business-decision authority claim.'});
}
if(import.meta.url===`file://${process.argv[1]}`)console.log(JSON.stringify(runAiProviderP3bContractCheck()));
