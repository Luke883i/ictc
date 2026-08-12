export const RN_SOURCE_CLASSES = Object.freeze([
  'binding-eu-law',
  'binding-italian-law',
  'competent-authority-decisions',
  'public-jurisprudence-and-case-information-without-personal-data'
]);

export const RN_MINING_POLICY = Object.freeze({
  id: 'RN-01-source-universe-v1',
  closedWorld: true,
  sourceClasses: RN_SOURCE_CLASSES,
  personalDataRule: 'Public jurisprudence/case mining must exclude personal data from extracted candidate content.',
  authorityRule: 'Prefer official EU/Italian institutional sources for normative facts and competent-authority measures.',
  epistemicRule: 'Return candidate observations with source links and explicit limitations; never establish legal applicability, legal interpretation or compliance.'
});

function bounded(value,max=40000){return String(value??'').trim().slice(0,max);}
export function normalizeRnSourceClasses(value,{defaultAll=true}={}){
  const input=Array.isArray(value)?value:value==null?[]:[value];
  const unique=[...new Set(input.map(v=>bounded(v,200)).filter(Boolean))];
  const invalid=unique.filter(v=>!RN_SOURCE_CLASSES.includes(v));
  if(invalid.length)throw Object.assign(new Error(`Classe fonte RN-01 non consentita: ${invalid.join(', ')}`),{status:400,code:'rn-source-class-invalid',details:{invalid,allowed:RN_SOURCE_CLASSES}});
  if(!unique.length&&defaultAll)return [...RN_SOURCE_CLASSES];
  if(!unique.length)throw Object.assign(new Error('Seleziona almeno una classe fonte RN-01'),{status:400,code:'rn-source-class-required'});
  return unique;
}
export function assertRnClosedUniverse(value){
  if(value==null||Array.isArray(value)&&value.length===0)return [...RN_SOURCE_CLASSES];
  const normalized=normalizeRnSourceClasses(value,{defaultAll:false});
  const same=normalized.length===RN_SOURCE_CLASSES.length&&RN_SOURCE_CLASSES.every(item=>normalized.includes(item));
  if(!same)throw Object.assign(new Error('RN-01 sorveglia tutte e sole le quattro classi di fonte dichiarate; il perimetro non e restringibile per classe.'),{status:400,code:'rn-source-universe-fixed',details:{required:RN_SOURCE_CLASSES,received:normalized}});
  return [...RN_SOURCE_CLASSES];
}

export function inferRnSourceClass(item={}){
  const explicit=bounded(item.sourceClass,200);
  if(RN_SOURCE_CLASSES.includes(explicit))return explicit;
  const type=bounded(item.documentType,100).toLowerCase(),jurisdiction=bounded(item.jurisdiction,300).toLowerCase(),authority=bounded(item.authority,500).toLowerCase(),changeType=bounded(item.changeType,100).toLowerCase();
  if(type==='case-law'||changeType==='case-law')return'public-jurisprudence-and-case-information-without-personal-data';
  if(type==='authority-decision')return'competent-authority-decisions';
  if(['regulation','directive','treaty'].includes(type)||/(unione europea|european union|\beu\b)/.test(jurisdiction))return'binding-eu-law';
  if(['law','legislative-decree','decree','constitution'].includes(type)||/(italia|italy|italiana)/.test(jurisdiction))return'binding-italian-law';
  if(type==='decision'||/(garante|\bacn\b|agenzia nazionale|autorità|authority)/.test(authority))return'competent-authority-decisions';
  return null;
}

export function rnMiningPrompt(basePrompt,mission={}){
  const sourceClasses=assertRnClosedUniverse(mission.sourceClasses);
  const custom=bounded(mission.promptOverride,40000);
  return [bounded(basePrompt,40000),'ICTC_RN01_POLICY:',`Closed source universe: ${sourceClasses.join(', ')}.`,RN_MINING_POLICY.personalDataRule,RN_MINING_POLICY.authorityRule,RN_MINING_POLICY.epistemicRule,custom?`Additional human-authored constraints: ${custom}`:''].filter(Boolean).join('\n\n');
}

export function normalizeRnDiscoveredItem(item,mission={}){
  assertRnClosedUniverse(mission.sourceClasses);
  const sourceClass=inferRnSourceClass(item);
  if(!sourceClass)return null;
  return {...item,sourceClass};
}
