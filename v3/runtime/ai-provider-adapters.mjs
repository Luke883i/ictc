import { asString } from '../domain.mjs';

export const AI_PROVIDER_IDS=Object.freeze(['openai','anthropic','deepseek','custom-openai-compatible']);
export const AI_PROVIDER_PROFILES=Object.freeze({
  openai:Object.freeze({id:'openai',label:'OpenAI',protocol:'openai-chat-completions',endpoint:'https://api.openai.com/v1/chat/completions',apiKeyEnv:'OPENAI_API_KEY'}),
  anthropic:Object.freeze({id:'anthropic',label:'Anthropic',protocol:'anthropic-messages',endpoint:'https://api.anthropic.com/v1/messages',apiKeyEnv:'ANTHROPIC_API_KEY'}),
  deepseek:Object.freeze({id:'deepseek',label:'DeepSeek',protocol:'openai-chat-completions',endpoint:'https://api.deepseek.com/chat/completions',apiKeyEnv:'DEEPSEEK_API_KEY'}),
  'custom-openai-compatible':Object.freeze({id:'custom-openai-compatible',label:'Personalizzato (OpenAI-compatible)',protocol:'openai-chat-completions',endpoint:'',apiKeyEnv:'ICTC_LLM_API_KEY'})
});

function inferProvider(endpoint=''){
  const value=String(endpoint||'').toLowerCase();
  if(value.includes('api.anthropic.com'))return'anthropic';
  if(value.includes('api.deepseek.com'))return'deepseek';
  if(value.includes('api.openai.com'))return'openai';
  return value?'custom-openai-compatible':'';
}

export function normalizeAiProviderId(value,endpoint=''){
  const raw=asString(value,80).toLowerCase();
  if(AI_PROVIDER_IDS.includes(raw))return raw;
  return inferProvider(endpoint);
}

export function resolveAiProvider(llm={}){
  const provider=normalizeAiProviderId(llm.provider,llm.endpoint);
  const definition=AI_PROVIDER_PROFILES[provider]||null;
  const endpoint=asString(llm.endpoint,4000)||definition?.endpoint||'';
  const apiKeyEnv=asString(llm.apiKeyEnv,200)||definition?.apiKeyEnv||'';
  return Object.freeze({provider,definition,protocol:definition?.protocol||'openai-chat-completions',endpoint,model:asString(llm.model,500),apiKeyEnv});
}

export function providerDefaults(provider){
  const id=normalizeAiProviderId(provider);
  const definition=AI_PROVIDER_PROFILES[id]||AI_PROVIDER_PROFILES['custom-openai-compatible'];
  return {provider:definition.id,endpoint:definition.endpoint,apiKeyEnv:definition.apiKeyEnv,protocol:definition.protocol,label:definition.label};
}

export function buildAiProviderRequest(profile,{prompt,inputJson,maxOutputTokens,temperature}){
  if(profile.protocol==='anthropic-messages'){
    const body={model:profile.model,max_tokens:maxOutputTokens,system:prompt,messages:[{role:'user',content:`${inputJson}\n\nRestituisci esclusivamente JSON valido, senza markdown.`}]};
    if(Number.isFinite(Number(temperature)))body.temperature=Number(temperature);
    return {headers:{'content-type':'application/json','anthropic-version':'2023-06-01'},body};
  }
  return {headers:{'content-type':'application/json'},body:{model:profile.model,temperature:Number(temperature??0.1),max_tokens:maxOutputTokens,response_format:{type:'json_object'},messages:[{role:'system',content:prompt},{role:'user',content:inputJson}]}};
}

export function providerAuthHeaders(profile,key){
  if(!key)return{};
  if(profile.protocol==='anthropic-messages')return{'x-api-key':key};
  return{authorization:`Bearer ${key}`};
}

export function providerContent(profile,envelope={}){
  if(profile.protocol==='anthropic-messages'){
    const blocks=Array.isArray(envelope.content)?envelope.content:[];
    const text=blocks.filter(block=>block?.type==='text').map(block=>block.text||'').join('\n').trim();
    return text||null;
  }
  return envelope.choices?.[0]?.message?.content??envelope.output_text??envelope.content??null;
}

export function providerUsage(envelope={}){
  return envelope.usage||{};
}

export function providerRequestId(response,envelope={}){
  return response?.headers?.get?.('x-request-id')||response?.headers?.get?.('request-id')||envelope.id||'';
}
