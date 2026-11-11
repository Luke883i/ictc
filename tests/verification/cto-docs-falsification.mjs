/** Physical mutations of the real README, executed with the existing documentation oracle. */
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm,mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../../',import.meta.url)));
const tmp=await mkdtemp(path.join(tmpdir(),'ictc-cto-docs-'));
const checkout=path.join(tmp,'candidate');
const git=(...args)=>spawnSync('git',args,{cwd:root,encoding:'utf8',timeout:30000});
const seed=0xC702026, mutators=[
 ['loss-of-f13',s=>s.replace(/`F-13`/g,'`F-X`')],
 ['loss-of-f15',s=>s.replace(/`F-15`/g,'`F-Y`')],
 ['loss-of-gov',s=>s.replace(/GAP-022/g,'GAP-XXX')],
 ['loss-of-human',s=>s.replace(/GAP-012/g,'GAP-XXX')],
 ['loss-of-scanner',s=>s.replace(/GAP-007/g,'GAP-XXX')],
 ['loss-of-identity',s=>s.replace(/GAP-009/g,'GAP-XXX')],
 ['loss-of-observability',s=>s.replace(/GAP-014/g,'GAP-XXX')],
 ['missing-remediation-sot',s=>s.replace(/audit\/remediation-registry\.json/g,'audit/unknown.json')],
 ['missing-convergence-sot',s=>s.replace(/docs\/convergence\/convergence-authority\.json/g,'docs/convergence/nonexistent.json')],
 ['missing-release-gate',s=>s.replace(/npm run release:check/g,'npm run invented:pass')],
 ['missing-ci-provenance',s=>s.replace(/\.github\/workflows\/enterprise-candidate\.yml/g,'.github/workflows/none.yml')],
 ['fabricated-ready',s=>s.replace('**Go/no-go CTO:**','enterprise-ready: PASS\n\n**Go/no-go CTO:**')]
];
const run=()=>spawnSync(process.execPath,['scripts/documentation-lattice-check.mjs'],{cwd:checkout,encoding:'utf8',timeout:60000,maxBuffer:1_000_000});
const rows=[];
try{
 const added=git('worktree','add','-q','--detach',checkout,'HEAD');assert.equal(added.status,0,added.stderr);
 const file=path.join(checkout,'README.md'),baseline=await readFile(file,'utf8');
 let r=run();assert.equal(r.status,0,'baseline docs failed: '+r.stderr+' '+r.stdout.slice(-700));
 let currentSeed=seed>>>0;
 const order=[...mutators.keys()].sort((a,b)=>a-b);
 // Stable deterministic shuffle (not a claim of independent random sampling).
 for(let i=order.length-1;i>0;i--){currentSeed^=currentSeed<<13;currentSeed^=currentSeed>>>17;currentSeed^=currentSeed<<5;const j=(currentSeed>>>0)%(i+1);[order[i],order[j]]=[order[j],order[i]];}
 for(const idx of order){
  const [name,mutate]=mutators[idx],sample=mutate(baseline);assert.notEqual(sample,baseline,`inert mutation ${name}`);
  await writeFile(file,sample);r=run();const detail=`${r.stdout}\n${r.stderr}`;
  rows.push({name,exit:r.status,detected:r.status!==0 && /cto:/.test(detail)});
  assert.equal(rows.at(-1).detected,true,`survivor ${name}: ${detail.slice(-1200)}`);
  await writeFile(file,baseline);
 }
 // A content-neutral copy clarification must not fail the CTO gate.
 const positive=baseline.replace('**Go/no-go CTO:**',
  '**Go/no-go CTO:** Una valutazione dimostrativa non attribuisce poteri decisionali ulteriori. ');
 assert.notEqual(positive,baseline,'benign positive must change physical README');
 await writeFile(file,positive);r=run();assert.equal(r.status,0,'benign positive rejected: '+r.stdout.slice(-700));
 await writeFile(file,baseline);r=run();assert.equal(r.status,0,'restored baseline not accepted');
 const report={schemaVersion:'1.0.0',head:git('rev-parse','HEAD').stdout.trim(),seed,source:'physical README rewrites in detached worktree',
  cases:rows.length,killed:rows.filter(x=>x.detected).length,survivors:rows.filter(x=>!x.detected).length,positive:1,rows,
  claimBoundary:'Bounded document mutants only; no independent user study, no enterprise-ready assertion.'};
 await mkdir(path.join(root,'artifacts'),{recursive:true});
 await writeFile(path.join(root,'artifacts','cto-docs-falsification.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({ok:true,cases:report.cases,killed:report.killed,survivors:report.survivors,positive:report.positive}));
}finally{
 git('worktree','remove','--force',checkout);
 await rm(tmp,{recursive:true,force:true});
}
