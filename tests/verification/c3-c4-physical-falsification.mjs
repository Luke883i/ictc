import {mkdtempSync,readFileSync,writeFileSync,rmSync,cpSync,mkdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=resolve(fileURLToPath(new URL('../..',import.meta.url)));
const samples=[
 ['c3-limit-oversize','src/runtime/api-reliability.mjs','TRACE_PAGE_MAX=50','TRACE_PAGE_MAX=500','tests/verification/c3-trace-pagination-check.mjs'],
 ['c3-stale-inverted','src/runtime/api-reliability.mjs','cursor.revision!==revision','cursor.revision===revision','tests/verification/c3-trace-pagination-check.mjs'],
 ['c3-actor-inverted','src/runtime/api-reliability.mjs','cursor.binding!==binding','cursor.binding===binding','tests/verification/c3-trace-pagination-check.mjs'],
 ['c3-legacy-shape','src/runtime/api-reliability.mjs',"if(!entries.has('limit')&&!entries.has('cursor'))return graph;","if(!entries.has('limit')&&!entries.has('cursor'))return {...graph};",'tests/verification/c3-trace-pagination-check.mjs'],
 ['c3-duplicate-page','src/runtime/api-reliability.mjs','start=index+1;','start=index;','tests/verification/c3-trace-pagination-check.mjs'],
 ['c3-cursor-limit-inverted','src/runtime/api-reliability.mjs','cursor.limit!==limit','cursor.limit===limit','tests/verification/c3-trace-pagination-check.mjs'],
 ['c4-suspension-bypass','src/enterprise.mjs',"policy.mode==='suspended'","policy.mode==='observe'",'tests/verification/c4-ai-eval-drift-check.mjs'],
 ['c4-drift-threshold-inverted','src/enterprise.mjs','entry.observedDrift<=entry.maxDrift','entry.observedDrift>=entry.maxDrift','tests/verification/c4-ai-eval-drift-check.mjs'],
 ['c4-policy-version-inverted','src/enterprise.mjs','value.policyVersion<=Number(old.policyVersion||0)','value.policyVersion>=Number(old.policyVersion||0)','tests/verification/c4-ai-eval-drift-check.mjs'],
 ['c4-evaluation-result-inverted','src/enterprise.mjs',"entry.status!=='pass'","entry.status==='pass'",'tests/verification/c4-ai-eval-drift-check.mjs'],
 ['c4-expiry-inverted','src/enterprise.mjs','expiry<=now','expiry>=now','tests/verification/c4-ai-eval-drift-check.mjs'],
 ['c4-required-samples-relaxed','src/enterprise.mjs','entry.samples<20','entry.samples<1','tests/verification/c4-ai-eval-drift-check.mjs']
];
const tmp=mkdtempSync(join(tmpdir(),'ictc-c3c4-source-mutants-')),candidate=join(tmp,'repo');
cpSync(root,candidate,{recursive:true,filter:p=>!['.git','artifacts','node_modules'].includes(p.split('/').at(-1))});
const outcomes=[];
try{
 for(const [id,path,needle,replacement,test] of samples){
   const file=join(candidate,path),original=readFileSync(file,'utf8');assert.ok(original.includes(needle),`missing canonical source mutation target ${id}`);
   assert.equal(original.split(needle).length,2,`nonunique target ${id}`);
   writeFileSync(file,original.replace(needle,replacement));
   const syntax=spawnSync(process.execPath,['--check',path],{cwd:candidate,encoding:'utf8'});
   assert.equal(syntax.status,0,`syntax-mutant is not a behavioral counterexample: ${id}`);
   const result=spawnSync(process.execPath,[test],{cwd:candidate,encoding:'utf8',timeout:80000});
   outcomes.push({id,mutation:'physical-source-rewrite',test,detected:result.status!==0,exitCode:result.status,syntaxValid:true,outputTail:(result.stderr||result.stdout||'').slice(-380)});
   writeFileSync(file,original);
 }
 const survivors=outcomes.filter(x=>!x.detected);
 assert.equal(survivors.length,0,`physical mutation survivors: ${survivors.map(x=>x.id).join(',')}`);
 mkdirSync(join(root,'artifacts'),{recursive:true});
 writeFileSync(join(root,'artifacts','c3-c4-physical-falsification.json'),JSON.stringify({schemaVersion:'1.0.0',seed:20261110,mutations:outcomes.length,detected:outcomes.length-survivors.length,survivors:survivors.length,outcomes,claimBoundary:'Source files physically mutated in a disposable full checkout; no 10M Git patches, no external deployment assurance, no terminal C3/C4 claim.'},null,2)+'\n');
 console.log(JSON.stringify({ok:true,mutations:outcomes.length,killed:outcomes.length-survivors.length,survivors:survivors.length}));
}finally{rmSync(tmp,{recursive:true,force:true});}
