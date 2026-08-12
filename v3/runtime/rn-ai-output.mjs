import { validateSchema } from '../ai-output-schema.mjs';
import { RN_SOURCE_CLASSES } from './rn-monitoring-policy.mjs';

const OPTIONAL=new Set(['sourceClass','domainLabels','applicationHypothesis','semanticConcepts']);
const BASE_KEYS=['title','documentType','authority','jurisdiction','identifier','sourceUrl','publicationDate','effectiveDate','summary','relevance','confidence','changeType','noveltyReason'];
function bounded(value,max){if(typeof value!=='string')throw Object.assign(new Error('RN AI output string expected'),{status:502,code:'rn-ai-output-invalid'});if(value.length>max)throw Object.assign(new Error('RN AI output string too long'),{status:502,code:'rn-ai-output-invalid'});return value;}
function list(value,maxItems,maxLength){if(value==null)return[];if(!Array.isArray(value)||value.length>maxItems)throw Object.assign(new Error('RN AI output list invalid'),{status:502,code:'rn-ai-output-invalid'});return value.map(v=>bounded(v,maxLength));}
export function validateRnDiscoveryOutput(value,purpose='compliance-discovery'){
  if(!value||typeof value!=='object'||Array.isArray(value)||!Array.isArray(value.items))throw Object.assign(new Error('RN AI output must contain items'),{status:502,code:'rn-ai-output-invalid'});
  const baseInput={items:value.items.map(item=>Object.fromEntries(Object.entries(item||{}).filter(([key])=>BASE_KEYS.includes(key))))};
  const base=validateSchema(purpose,baseInput);
  const items=base.items.map((item,index)=>{const raw=value.items[index]||{};for(const key of Object.keys(raw))if(!BASE_KEYS.includes(key)&&!OPTIONAL.has(key))throw Object.assign(new Error(`RN AI output field not allowed: ${key}`),{status:502,code:'rn-ai-output-invalid'});const sourceClass=raw.sourceClass==null?'':bounded(raw.sourceClass,200);if(sourceClass&&!RN_SOURCE_CLASSES.includes(sourceClass))throw Object.assign(new Error(`RN source class invalid: ${sourceClass}`),{status:502,code:'rn-ai-output-invalid'});return{...item,sourceClass,domainLabels:list(raw.domainLabels,20,200),applicationHypothesis:raw.applicationHypothesis==null?'':bounded(raw.applicationHypothesis,6000),semanticConcepts:list(raw.semanticConcepts,40,500)};});return{items};
}
