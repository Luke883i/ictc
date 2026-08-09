import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { DEFAULT_POLICY, PROCESS_SPECS, inspectExperience } from './v1-stable-experience-model.mjs';

const roles=['admin','user','auditor'];
const expertise=['novice','operator','expert','external-auditor','regulator'];
const intents=['continue-work','start-known-process','start-unknown','inspect-status','search-record','prove-decision','audit','configure'];
const processes=Object.keys(PROCESS_SPECS);
const ai=['on','off'];
const identityModes=['local','trusted-header'];
const devices=['mobile','tablet','desktop'];
let rng=0x10c7c001;
function rand(){rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/2**32;}
function pick(xs){return xs[Math.floor(rand()*xs.length)];}
function buildNormal(i){return {kind:'usage',i,role:pick(roles),expertise:pick(expertise),intent:pick(intents),process:pick(processes),ai:pick(ai),identityMode:pick(identityModes),device:pick(devices),attention:Math.floor(rand()*9),openRecord:rand()>.62,rawTrace:rand()>.90,deepTechnical:rand()>.94,searchHitType:rand()>.82?'evidence':'record'};}
const adverseKinds=['ai-failure','network-flap','stale-evidence','unknown-reference','large-queue','zero-data','many-urgent','mobile-small','read-only-escalation','deep-link-proof','stale-role','missing-process','conflicting-intent','superseded-record'];
function buildAdversarial(i){const kind=pick(adverseKinds),s={kind:'adversarial',adversity:kind,i,role:pick(roles),expertise:pick(expertise),intent:pick(intents),process:pick(processes),ai:pick(ai),identityMode:pick(identityModes),device:pick(devices),attention:Math.floor(rand()*50),openRecord:rand()>.45,rawTrace:rand()>.73,deepTechnical:rand()>.78,searchHitType:rand()>.6?'evidence':'record'};if(kind==='ai-failure')s.aiFailure=true;if(kind==='network-flap')s.networkFlap=true;if(kind==='stale-evidence')s.staleEvidence=true;if(kind==='unknown-reference')s.unknownReference=true;if(kind==='zero-data')s.attention=0;if(kind==='large-queue')s.attention=250;if(kind==='many-urgent')s.attention=40;if(kind==='mobile-small')s.device='mobile';if(kind==='read-only-escalation'){s.role='auditor';s.intent='continue-work';}if(kind==='deep-link-proof'){s.intent='prove-decision';s.rawTrace=true;}if(kind==='missing-process'){s.intent='start-unknown';s.process='missing';}if(kind==='conflicting-intent'){s.intent='audit';s.process=pick(processes);}return s;}
function uniqueScenarios(count,builder){const out=[],seen=new Set();let i=0;while(out.length<count&&i<count*100){const s=builder(i++),key=JSON.stringify({...s,i:undefined});if(seen.has(key))continue;seen.add(key);out.push({...s,i:out.length});}assert.equal(out.length,count,`unique scenario budget ${count}`);return out;}
function runScenarios(items,policy=DEFAULT_POLICY){const findings=[];for(const s of items){const result=inspectExperience(s,policy);for(const f of result.findings)findings.push({scenario:s.i,kind:s.kind,adversity:s.adversity||null,...f});}return findings;}
const usage=uniqueScenarios(1000,buildNormal),adversarial=uniqueScenarios(1000,buildAdversarial);
const usageFindings=runScenarios(usage),adversarialFindings=runScenarios(adversarial);
assert.deepEqual(usageFindings,[],'usage findings');
assert.deepEqual(adversarialFindings,[],'adversarial findings');
const mutants={
  'duplicate-catalog':{processCatalogCopies:2},
  'home-full-catalog':{homeShowsFullCatalog:true},
  'six-levels':{maxDisclosure:6},
  'two-primary-actions':{primaryActionsPerContext:2},
  'trace-at-level-three':{technicalTraceMinLevel:3},
  'evidence-at-level-two':{evidenceDetailMinLevel:2},
  'ai-required':{aiMandatory:true},
  'auditor-writes':{auditorCanWrite:true},
  'trusted-role-switcher':{trustedIdentityRoleSwitcher:true},
  'admin-in-header':{permanentAdminControls:true},
  'export-in-header':{permanentExportControl:true},
  'methodology-on-cards':{processCardsCarryMethodology:true},
  'home-attention-seven':{homeMaxAttentionProcesses:7}
};
const mutantResults=[];
for(const [name,patch] of Object.entries(mutants)){const policy={...DEFAULT_POLICY,...patch};const findings=runScenarios([...usage,...adversarial],policy);mutantResults.push({name,killed:findings.length>0,firstFinding:findings[0]?.kind||null});}
assert.ok(mutantResults.every(x=>x.killed),`surviving mutants: ${mutantResults.filter(x=>!x.killed).map(x=>x.name).join(',')}`);
const digest=createHash('sha256').update(JSON.stringify({usage,adversarial,mutantResults})).digest('hex');
const report={schemaVersion:'1.0.0',release:'1.0_stable',usageScenarios:usage.length,adversarialScenarios:adversarial.length,total:usage.length+adversarial.length,usageFindings:[],adversarialFindings:[],mutants:mutantResults.length,mutantsKilled:mutantResults.filter(x=>x.killed).length,mutationScore:mutantResults.filter(x=>x.killed).length/mutantResults.length,maxDisclosure:5,processes:processes.length,digest};
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});
await writeFile(new URL('../artifacts/v1-stable-experience-saturation.json',import.meta.url),JSON.stringify(report,null,2));
console.log(`v1-stable-experience-saturation: ok (${report.usageScenarios} usage + ${report.adversarialScenarios} adversarial; mutants ${report.mutantsKilled}/${report.mutants}; digest=${digest})`);
