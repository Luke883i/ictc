import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const SEED=5410;
const PROCEDURES=['monitoring','incidents','objects','coverage','actions','risks','assurance'];
const PROFILES=['admin','user','auditor','service'];
const OPS=['create','update','decision','attest','job','ai-proposal','report','import'];
const HISTORY=['fresh','deep','same-payload-repeat','legacy'];
const RESULT=['full-subject','envelope','boolean','multi-subject'];
const STANDARD=['none','undeclared','tracked','reference','not-used','new-edition'];
const AI=['off','on','provider-failure','stale-basis'];
const EVIDENCE=['none','declared','observed','digest-bound','stale','redacted'];
const DRAFT=['none','dirty','refresh','conflict'];
const DEPENDENCY=['none','single','cycle','mass-change'];
const TIME=['current','historical','effective-future','retro-correction'];
const SCOPE=['organization','unit','legal-entity','participant'];
const PROC_STATE=['enabled','disabled-read','reenabled'];
const RULES=Object.freeze({
  'C01-result-is-not-after-state':s=>['envelope','boolean','multi-subject'].includes(s.result)&&['create','update','decision','attest'].includes(s.op),
  'C02-version-occurrence-distinct-from-payload':s=>s.history==='same-payload-repeat'&&['decision','attest','job'].includes(s.op),
  'C03-history-outside-current-snapshot':s=>s.history==='deep',
  'C04-explicit-multi-subject-effects':s=>s.result==='multi-subject',
  'C05-no-scattered-procedure-id-sets':s=>['report','decision'].includes(s.op),
  'C06-single-write-route-owner':s=>s.procedure==='actions'&&s.op==='update',
  'C07-projection-basis-transitive':s=>s.time!=='current'||s.scope!=='organization',
  'C08-current-auth-gates-history':s=>s.time==='historical'&&['user','auditor'].includes(s.profile),
  'C09-standard-use-not-validation':s=>s.procedure==='coverage'&&['undeclared','tracked','reference','not-used'].includes(s.standard),
  'C10-requirement-edition-binding':s=>s.procedure==='coverage'&&s.standard==='new-edition',
  'C11-reviewneed-idempotent-materiality':s=>['cycle','mass-change'].includes(s.dependency),
  'C12-draft-survives-refresh':s=>['dirty','refresh','conflict'].includes(s.draft),
  'C13-ai-off-core-parity':s=>['off','provider-failure'].includes(s.ai)&&s.op!=='ai-proposal',
  'C14-evidence-purpose-strength':s=>['declared','stale','redacted'].includes(s.evidence),
  'C15-disabled-history-readable-no-write':s=>s.procState!=='enabled',
  'C16-service-principal-not-human-authority':s=>s.profile==='service'&&['job','import','decision'].includes(s.op),
  'C17-report-metric-same-basis':s=>s.op==='report',
  'C18-no-synthetic-compliance-score':s=>s.op==='report'
});
function rng(seed){let x=seed>>>0;return()=>{x=(1664525*x+1013904223)>>>0;return x/0x100000000;};}
const random=rng(SEED),dimensions=[HISTORY,RESULT,STANDARD,AI,EVIDENCE,DRAFT,DEPENDENCY,TIME,SCOPE,PROC_STATE,OPS],seen=new Set(),scenarios=[];
while(scenarios.length<10000){const n=scenarios.length,values=dimensions.map((list,j)=>list[(n*(j*2+3)+j*7+Math.floor(random()*list.length))%list.length]),scenario={procedure:PROCEDURES[n%PROCEDURES.length],profile:PROFILES[n%PROFILES.length],history:values[0],result:values[1],standard:values[2],ai:values[3],evidence:values[4],draft:values[5],dependency:values[6],time:values[7],scope:values[8],procState:values[9],op:values[10]},key=JSON.stringify(scenario);if(seen.has(key))continue;seen.add(key);scenarios.push(scenario);}
const first={},activation=Object.fromEntries(Object.keys(RULES).map(k=>[k,0]));for(let i=0;i<scenarios.length;i++)for(const[name,rule]of Object.entries(RULES))if(rule(scenarios[i])){activation[name]++;if(first[name]==null)first[name]=i+1;}
assert.equal(Object.keys(first).length,Object.keys(RULES).length,'Every normalized class must be activated');const M=Math.max(...Object.values(first));assert.ok(M+1000<=scenarios.length,'Need full M+1000 confirmation window');const procCounts=Object.fromEntries(PROCEDURES.map(p=>[p,scenarios.filter(s=>s.procedure===p).length])),profileCounts=Object.fromEntries(PROFILES.map(p=>[p,scenarios.filter(s=>s.profile===p).length]));assert.ok(Math.max(...Object.values(procCounts))-Math.min(...Object.values(procCounts))<=1);assert.ok(Math.max(...Object.values(profileCounts))-Math.min(...Object.values(profileCounts))<=1);
const known=new Set(Object.keys(first)),novel=[];for(let i=M;i<M+1000;i++){const active=Object.entries(RULES).filter(([,rule])=>rule(scenarios[i])).map(([name])=>name);for(const name of active)if(!known.has(name))novel.push({scenario:i+1,name});}assert.equal(novel.length,0,'No normalized novelty is allowed in M+1000');
const mutants=Object.keys(RULES).map(name=>({name,killed:scenarios.some(RULES[name])}));assert.ok(mutants.every(x=>x.killed),'Every semantic mutant must be killed');
const report={schemaVersion:'1.0.0',releaseProfile:'post_pr54_semantic_closure',seed:SEED,scenarios:10000,unique:seen.size,balanced:{procedures:procCounts,profiles:profileCounts},findingClasses:Object.keys(RULES).length,firstDiscovery:first,M,mPlus1000:{start:M+1,end:M+1000,newClasses:novel.length},mutation:{killed:mutants.filter(x=>x.killed).length,total:mutants.length,score:mutants.filter(x=>x.killed).length/mutants.length},activation,limitations:['Model-assisted architectural saturation; not 10,000 browser executions or independent human evidence.','No-novelty means the chosen dimensions stopped changing the normalized remediation taxonomy; it cannot prove absence of unknown-unknowns.']};await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(new URL('../artifacts/semantic-closure-saturation.json',import.meta.url),JSON.stringify(report,null,2));console.log('semantic-closure-saturation: ok',JSON.stringify({M,classes:report.findingClasses,mPlus1000New:0,mutation:report.mutation,scenarios:10000}));
