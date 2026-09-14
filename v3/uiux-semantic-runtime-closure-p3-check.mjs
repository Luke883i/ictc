import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { AI_PROVIDER_PROFILES, buildAiProviderRequest, providerAuthHeaders, providerContent, resolveAiProvider } from './runtime/ai-provider-adapters.mjs';
import { P3_FORBIDDEN_MASK, P3_REQUIRED_MASK, convergeSemanticMutation, p3InvariantSnapshot } from './uiux-semantic-runtime-closure-p3-model.mjs';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const [operational,semantic,standard,globalTools,native,settings,css,ai,admin]=await Promise.all([
  read('./public/ui/operational-surface-a6-ux3.js'),read('./public/ui/semantic-surface-a6-ux4.js'),read('./public/ui/standard-browser.js'),read('./public/ui/global-tools.js'),read('./public/ui/native-workspace-3-2.js'),read('./public/ui/settings-1-8-fix.js'),read('./public/semantic-runtime-closure-p3.css'),read('./ai.mjs'),read('./runtime/admin.mjs')
]);
for(const token of ['data-semantic-count-owner="primary"','data-a6-registry-total','retireLegacyRegistryHead','data-enduser-primitive=\'ControlRail\''])assert.ok(operational.includes(token),`operational missing ${token}`);
for(const token of ['.procedure-queue-tools','contextualizeCoverageMapping','requirement-first','ictc:coverage-mapping-context'])assert.ok(semantic.includes(token),`semantic missing ${token}`);
for(const token of ['official-public-reference','authorized-licensed','ictc-operational-formulation','reference-only','Apri fonte ufficiale','Usa questo requisito nel mapping'])assert.ok(standard.includes(token),`standard browser missing ${token}`);
for(const token of ['<kbd>↑</kbd><kbd>↓</kbd>','<kbd>Invio</kbd>','KIND_LABELS'])assert.ok(globalTools.includes(token),`command palette missing ${token}`);
assert.ok(native.includes('/semantic-runtime-closure-p3.css'));assert.ok(css.includes('grid-template-columns:minmax(12rem,1fr)'));assert.ok(css.includes('#procedureHub .procedure-card'));assert.ok(css.includes('.procedure-frame-context'));
for(const provider of ['openai','anthropic','deepseek','custom-openai-compatible'])assert.ok(AI_PROVIDER_PROFILES[provider]);
const anthropic=resolveAiProvider({endpoint:'https://api.anthropic.com/v1/messages',model:'claude-test',apiKeyEnv:'ANTHROPIC_API_KEY'});assert.equal(anthropic.provider,'anthropic');const req=buildAiProviderRequest(anthropic,{prompt:'p',inputJson:'{}',maxOutputTokens:64,temperature:.1});assert.equal(req.headers['anthropic-version'],'2023-06-01');assert.equal(providerAuthHeaders(anthropic,'secret')['x-api-key'],'secret');assert.equal(providerContent(anthropic,{content:[{type:'text',text:'{"ok":true}'}]}),'{"ok":true}');
const openai=resolveAiProvider({endpoint:'https://api.openai.com/v1/chat/completions',model:'gpt-test'});assert.equal(openai.provider,'openai');assert.equal(providerAuthHeaders(openai,'secret').authorization,'Bearer secret');
assert.ok(ai.includes('testAiProvider'));assert.ok(ai.includes('buildAiProviderRequest'));assert.ok(admin.includes("'/api/admin/ai/test'"));assert.ok(settings.includes('OpenAI')&&settings.includes('Anthropic')&&settings.includes('DeepSeek'));
const worst=(P3_FORBIDDEN_MASK|0xffc00000)>>>0,closed=convergeSemanticMutation(worst),snapshot=p3InvariantSnapshot(closed);assert.equal(closed&P3_FORBIDDEN_MASK,0);assert.equal(closed&P3_REQUIRED_MASK,P3_REQUIRED_MASK);assert.ok(Object.values(snapshot).every(Boolean));
console.log('uiux-semantic-runtime-closure-p3-check: ok');
