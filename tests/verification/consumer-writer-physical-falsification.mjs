/** Repeatable real-file semantic mutants in a disposable Git worktree.
 * Finite adversarial catalog; no attempt to turn 24 mutants into a 10M claim.
 */
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import path from 'node:path';import os from 'node:os';
import {procedureAdapters} from '../../src/runtime/procedure-adapters.mjs';
const root=path.resolve(new URL('../..',import.meta.url).pathname),seed=Number(process.env.ICTC_CW_MUTATION_SEED||20261110)>>>0;
const run=(cmd,args,cwd,timeout=30000)=>spawnSync(cmd,args,{cwd,encoding:'utf8',timeout,maxBuffer:8*1024*1024});
const original=run('node',['tests/verification/consumer-writer-reticular-check.mjs'],root);assert.equal(original.status,0,original.stderr);
const graph=JSON.parse(readFileSync(path.join(root,'artifacts/consumer-writer-reticulum.json'),'utf8'));
const directory=mkdtempSync(path.join(os.tmpdir(),'ictc-cw-worktree-'));
const added=run('git',['worktree','add','--detach',directory,'HEAD'],root);assert.equal(added.status,0,added.stderr);
const cases=[],record=[];let browserGuardContract=[];let state=seed||1;
const random=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/2**32;};
const mutate=(source,needle,replacement)=>{assert.ok(source.includes(needle),`missing mutation preimage ${needle}`);return source.split(needle).join(replacement);};
for(const w of graph.procedures){
 cases.push({name:'server-route:'+w.code,mode:'static',changes:[{file:w.owner,needle:`'${w.route}'`,to:`'/api/forged-${w.code.toLowerCase()}'`}]});
 cases.push({name:'client-consumer:'+w.code,mode:'static',changes:w.clientCandidates.map(file=>({file,needle:w.route,to:`/api/forged-${w.code.toLowerCase()}`}))});
 const declared=procedureAdapters().find(a=>a.id===w.id)?.writeRoutes.find(route=>w.route===route||w.route.startsWith(route+'/'));
 assert.ok(declared,'witness must be in canonical adapter registry');
 cases.push({name:'adapter-registry:'+w.code,mode:'static',changes:[{file:'src/runtime/procedure-adapters.mjs',needle:`'${declared}'`,to:`'/api/forged-${w.code.toLowerCase()}'`}]});
}
cases.push({name:'dispatch-spine',mode:'static',changes:[{file:'src/server.mjs',needle:'for(const handler of handlers)if(await handler(request,response,pathname,actor))return',to:'for(const handler of handlers)if(false && await handler(request,response,pathname,actor))return'}]});
cases.push({name:'wrong-audited-event',mode:'runtime',changes:[{file:'src/runtime/procedure-invariant-handler.mjs',needle:"'grc.object.created'",to:"'grc.object.misclassified'"}]});
cases.push({name:'unprotected-assurance-writer',mode:'runtime',changes:[{file:'src/runtime/grc-runtime-legacy.mjs',needle:"if(method==='POST'&&pathname==='/api/grc/assurance'){requirePermission(actor,'contribute-grc',permissions);",to:"if(method==='POST'&&pathname==='/api/grc/assurance'){void actor;"}]});
// The positive control proves the oracle is not a reject-all filter.
cases.push({name:'benign-comment',mode:'static-positive',changes:[{file:'public/ui/actions.js',append:'\n// consumer-writer source invariant: harmless descriptive comment\n'}]});
for(let i=cases.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[cases[i],cases[j]]=[cases[j],cases[i]];}
try{
 for(const test of cases){
  const unique=new Map();for(const c of test.changes){const old=unique.get(c.file)??readFileSync(path.join(directory,c.file),'utf8');unique.set(c.file,c.append?old+c.append:mutate(old,c.needle,c.to));}
  for(const [file,text] of unique)writeFileSync(path.join(directory,file),text);
  const syntax=[...unique.keys()].filter(f=>/\.(?:mjs|js)$/.test(f)).map(file=>run('node',['--check',file],directory,10000));
  assert.ok(syntax.every(r=>r.status===0),`mutant must remain syntactically valid: ${test.name}`);
  const cmd=test.mode==='runtime'?'e2e-cross-process-receipts-check.mjs':'consumer-writer-reticular-check.mjs';
  const result=run('node',[`tests/verification/${cmd}`],directory,test.mode==='runtime'?45000:20000);
  const desired=test.mode==='static-positive'?0:1;const detected=desired===0?result.status===0:result.status!==0&&result.status!==null&&/AssertionError|wrong semantic event|auditor write must be denied|undeclared procedure route|unresolved relative ESM/.test(result.stderr);
  record.push({name:test.name,mode:test.mode,detected,exit:result.status,syntaxValid:true,files:[...unique.keys()],stderrExcerpt:result.stderr.slice(-550)});
  const reset=run('git',['reset','--hard','HEAD'],directory);assert.equal(reset.status,0,reset.stderr);
  if(!detected)throw new Error(`source/runtime mutant survived: ${test.name}: ${result.stderr.slice(-800)}`);
 }
 // Contract-only negatives prove that the browser guard is not reject-all.
 // These receipts are deliberately SYNTHETIC and exist ONLY in a throwaway
 // worktree; they MUST NEVER be reported as executed Playwright evidence.
 for(const proofFile of ['tests/verification/consumer-writer-reticular-check.mjs','tests/verification/consumer-writer-evidence-gate.mjs'])
  writeFileSync(path.join(directory,proofFile),readFileSync(path.join(root,proofFile),'utf8'));
 const cleanGraph=run('node',['tests/verification/consumer-writer-reticular-check.mjs'],directory);assert.equal(cleanGraph.status,0,cleanGraph.stderr);
 const head=run('git',['rev-parse','HEAD'],directory).stdout.trim();
 const validProcedures=Object.fromEntries(graph.procedures.map(w=>[w.code,{method:'POST',path:w.route,status:201}]));
 const runId='ab'.repeat(16),baseRevision=5,finalRevision=19;
 const witnessFile=path.join(directory,'artifacts/browser-consumer-writer-witness.json');
 const journeyFile=path.join(directory,'artifacts/browser-v2-1-procedure-journey.json');
 const nativeBase={ok:true,schema:'ictc-browser-consumer-writer-witness/v1',gitHead:head,witnessRunId:runId,procedures:validProcedures,baseRevision,finalRevision};
 const journeyBase={ok:true,gitHead:head,witnessRunId:runId,networkWriteWitnessCount:7,baseRevision,finalRevision};
 const browserGuardCases=[
  {name:'synthetic-valid-shape',native:{...nativeBase},journey:{...journeyBase},accept:true},
  {name:'stale-source-head',native:{...nativeBase,gitHead:'0'.repeat(40)},journey:{...journeyBase}},
  {name:'cross-run-replay',native:{...nativeBase},journey:{...journeyBase,witnessRunId:'cd'.repeat(16)}},
  {name:'wrong-consumer-route',native:{...nativeBase,procedures:{...validProcedures,'EC-01':{method:'POST',path:'/api/forged',status:201}}},journey:{...journeyBase}},
  {name:'write-failure-masked',native:{...nativeBase,procedures:{...validProcedures,'AR-01':{method:'POST',path:'/api/grc/assurance',status:403}}},journey:{...journeyBase}},
  {name:'get-masquerading-as-post',native:{...nativeBase,procedures:{...validProcedures,'RN-01':{method:'GET',path:'/api/contributions',status:200}}},journey:{...journeyBase}},
  {name:'no-ui-revision-advance',native:{...nativeBase,finalRevision:baseRevision},journey:{...journeyBase,finalRevision:baseRevision}},
  {name:'different-journey-head',native:{...nativeBase},journey:{...journeyBase,gitHead:'f'.repeat(40)}}
 ];
 const guardResults=[];
 for(const sample of browserGuardCases){
  writeFileSync(witnessFile,JSON.stringify(sample.native));writeFileSync(journeyFile,JSON.stringify(sample.journey));
  const probe=run('node',['tests/verification/consumer-writer-evidence-gate.mjs','--browser-only','--require-browser'],directory,20000);
  const correct=sample.accept?probe.status===0:probe.status===27;
  guardResults.push({name:sample.name,syntheticOnly:true,accepted:probe.status===0,expectedAccepted:!!sample.accept,correct});
  if(!correct)throw new Error(`synthetic browser guard contract drift ${sample.name}, exit=${probe.status} ${probe.stderr}`);
 }
 browserGuardContract=guardResults;
}finally{run('git',['worktree','remove','--force',directory],root);rmSync(directory,{recursive:true,force:true});}
const summary={schema:'ictc-cw-physical-mutants/v1',gitHead:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),seed,mutations:record.length,invalidMutations:record.filter(x=>x.mode!=='static-positive').length,validControls:record.filter(x=>x.mode==='static-positive').length,killed:record.filter(x=>x.mode!=='static-positive'&&x.detected).length,syntheticBrowserGuard:browserGuardContract,survivors:record.filter(x=>!x.detected),cases:record,
 claimBoundary:'Actual syntactically valid source edits applied and reverted in disposable Git worktree; finite catalog, not 10M patched executions, not native browser or proof of external consumer absence.'};
mkdirSync(path.join(root,'artifacts'),{recursive:true});writeFileSync(path.join(root,'artifacts/consumer-writer-physical-falsification.json'),JSON.stringify(summary,null,2)+'\n');
assert.equal(summary.survivors.length,0);console.log(JSON.stringify({ok:true,seed,mutations:summary.mutations,killed:summary.killed,validControls:summary.validControls,syntheticBrowserGuardCases:summary.syntheticBrowserGuard.length}));
