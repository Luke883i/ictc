import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export const SEED_PREPR_REQUIRED_FIELDS=Object.freeze(['id','intent','property','owners','requires','falsifier','done']);
const SEED_IDS=Object.freeze(['UI-OBJECT-TYPE-COMPRESSION-1','DEMO-TRUTH-METADATA-1','STANDARD-KNOWLEDGE-PACK-UX-1','EP-ADMIN-LANDING-1','HOMEBOARDING-1']);
const PROPERTY_TOKENS=Object.freeze({
  'UI-OBJECT-TYPE-COMPRESSION-1':['primitive','deprecazione','ontologie parallele'],
  'DEMO-TRUTH-METADATA-1':['l0-l5','derivata meccanicamente','hand-authored'],
  'STANDARD-KNOWLEDGE-PACK-UX-1':['word-like','provenance/version/digest','ricostruzione inventata'],
  'EP-ADMIN-LANDING-1':['knowledge explorer','configuration console','writer'],
  'HOMEBOARDING-1':['norme ortogonali','bad e worst scenario','comprensione operativa']
});
const REQUIRED_OWNERS=Object.freeze({
  'UI-OBJECT-TYPE-COMPRESSION-1':['v3/information-density-model.mjs','v3/uiux-converge-0-model.mjs','v3/public/ui/native-semantic-lattice-3-2.js'],
  'DEMO-TRUTH-METADATA-1':['v3/runtime/demo-suite-3-0.mjs'],
  'STANDARD-KNOWLEDGE-PACK-UX-1':['v3/runtime/standard-library-handler.mjs','v3/runtime/standard-public-source-pack.mjs','v3/public/ui/standard-browser.js','v3/standards/standard-catalog-1-2.json','v3/public/ui/procedure-market-ux.js'],
  'EP-ADMIN-LANDING-1':['v3/public/ui/epistemic-workspace-3-2.js','v3/public/ui/admin-workspace-3-2.js','v3/public/enduser-composition-p2.css'],
  'HOMEBOARDING-1':['v3/public/ui/stable-shell.js','v3/public/ui/product-copy.js']
});
const OWNER_ALLOWLIST=new Set(Object.values(REQUIRED_OWNERS).flat());
const uniq=a=>new Set(a).size===a.length;
function cycle(seeds){
  const byId=new Map(seeds.map(s=>[s.id,s])),visiting=new Set(),done=new Set();
  const walk=id=>{if(done.has(id))return false;if(visiting.has(id))return true;visiting.add(id);for(const dep of byId.get(id)?.requires||[])if(walk(dep))return true;visiting.delete(id);done.add(id);return false;};
  return seeds.some(s=>walk(s.id));
}
export function validateSeedPrePrContract(contract,{root=process.cwd(),checkFiles=true}={}){
  const failures=[],fail=(id,detail='')=>failures.push(detail?id+':'+detail:id);
  if(contract?.schemaVersion!=='1.0.0')fail('schema');
  if(contract?.contractId!=='SEED-PREPR-1')fail('contract-id');
  if(contract?.classification!=='repository-bounded-intent-seed-input-not-authority')fail('classification');
  if(contract?.serialSlice!==false)fail('serial-slice');
  if(contract?.semanticMutationBudget!==1_000_000)fail('mutation-budget');
  const rules=contract?.rules||{};
  if(rules.authority!=='input-only'||rules.onePropertyPerSeed!==true||rules.existingOwnersOnly!==true||rules.dependencyGraph!=='acyclic'||rules.newOwnerRequiresSeedSplit!==true||rules.externalEvidenceCannotBeSynthesized!==true)fail('rules');
  if(rules.acceptance!=='runtime-readback + exact-head-green + post-merge-main-green')fail('acceptance');
  const seeds=Array.isArray(contract?.seeds)?contract.seeds:[];
  if(seeds.length!==5||!uniq(seeds.map(s=>s.id))||JSON.stringify(seeds.map(s=>s.id))!==JSON.stringify(SEED_IDS))fail('seed-census');
  const ids=new Set(seeds.map(s=>s.id));
  for(const seed of seeds){
    const keys=Object.keys(seed).sort(),expected=[...SEED_PREPR_REQUIRED_FIELDS].sort();
    if(JSON.stringify(keys)!==JSON.stringify(expected))fail('seed-fields',seed.id||'?');
    if(typeof seed.intent!=='string'||seed.intent.trim().length<40)fail('intent',seed.id);
    if(typeof seed.property!=='string'||(seed.property.match(/→/g)||[]).length<2)fail('property-chain',seed.id);
    if(!Array.isArray(seed.owners)||seed.owners.length===0||!uniq(seed.owners))fail('owners',seed.id);
    if(!Array.isArray(seed.requires)||!uniq(seed.requires)||seed.requires.some(x=>x===seed.id||!ids.has(x)))fail('requires',seed.id);
    if(!Array.isArray(seed.falsifier?.nearest)||seed.falsifier.nearest.length<2||seed.falsifier.semanticTrials!==contract.semanticMutationBudget)fail('falsifier',seed.id);
    const done=seed.done||{};
    if(done.runtimeReadback!==true||done.exactHead!==true||done.postMergeMain!==true||typeof done.claimBoundary!=='string'||done.claimBoundary.length<50)fail('done',seed.id);
    const property=String(seed.property||'').toLocaleLowerCase('it-IT');
    for(const token of PROPERTY_TOKENS[seed.id]||[])if(!property.includes(token.toLocaleLowerCase('it-IT')))fail('property-obligation',seed.id+':'+token);
    const requiredOwners=REQUIRED_OWNERS[seed.id]||[];
    if(JSON.stringify(seed.owners)!==JSON.stringify(requiredOwners))fail('owner-set',seed.id);
    for(const owner of seed.owners||[])if(!OWNER_ALLOWLIST.has(owner))fail('owner-not-canonical',seed.id+':'+owner);
    if(checkFiles){
      for(const owner of seed.owners){if(owner.startsWith('docs/'))fail('runtime-owner-doc',seed.id+':'+owner);if(!existsSync(path.join(root,owner)))fail('owner-missing',seed.id+':'+owner);}
      for(const gate of seed.falsifier.nearest)if(!existsSync(path.join(root,gate)))fail('falsifier-missing',seed.id+':'+gate);
    }
  }
  if(cycle(seeds))fail('dependency-cycle');
  const home=seeds.find(s=>s.id==='HOMEBOARDING-1'),typing=seeds.find(s=>s.id==='UI-OBJECT-TYPE-COMPRESSION-1'),demo=seeds.find(s=>s.id==='DEMO-TRUTH-METADATA-1'),standards=seeds.find(s=>s.id==='STANDARD-KNOWLEDGE-PACK-UX-1'),epAdmin=seeds.find(s=>s.id==='EP-ADMIN-LANDING-1');
  if((typing?.requires||[]).length!==0)fail('typing-root');
  for(const seed of [demo,standards,epAdmin])if(!seed?.requires?.includes('UI-OBJECT-TYPE-COMPRESSION-1'))fail('typing-dependency',seed?.id||'?');
  for(const id of ['UI-OBJECT-TYPE-COMPRESSION-1','DEMO-TRUTH-METADATA-1','STANDARD-KNOWLEDGE-PACK-UX-1'])if(!home?.requires?.includes(id))fail('home-reuse-dependency',id);
  return Object.freeze({ok:failures.length===0,failures:Object.freeze(failures)});
}
export function loadSeedPrePrContract(file=new URL('./seed-prepr-contract.json',import.meta.url)){return JSON.parse(readFileSync(file,'utf8'));}
export function compileSeedPrePrOrder(contract){
  const byId=new Map(contract.seeds.map(s=>[s.id,s])),out=[],seen=new Set();
  const visit=id=>{if(seen.has(id))return;for(const dep of byId.get(id)?.requires||[])visit(dep);seen.add(id);out.push(id);};
  for(const seed of contract.seeds)visit(seed.id);
  return Object.freeze(out);
}
