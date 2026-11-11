/** Falsifies AS-IS document claims against executable source and public assets.
 * All edits are real, made in a disposable worktree, then restored. */
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('../../',import.meta.url)));
const temp=mkdtempSync(join(tmpdir(),'ictc-source-doc-mutants-')),checkout=join(temp,'worktree');
const SEED=0x20261110;let seed=SEED;
function next(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
const git=(...args)=>spawnSync('git',args,{cwd:root,encoding:'utf8',timeout:30000});
const run=()=>spawnSync(process.execPath,['scripts/documentation-lattice-check.mjs'],{cwd:checkout,encoding:'utf8',timeout:60000,maxBuffer:4_000_000});
const cases=[
 ['atlas-retired-legacy-route','docs/REPOSITORY_ATLAS.md','| `tests/legacy/` |','| `v3/tests/legacy/` |'],
 ['atlas-retired-public-asset','docs/REPOSITORY_ATLAS.md','| `public/grc-v2.css` e','| `v3/public/grc-v2.css` e'],
 ['product-invented-label','docs/PRODUCT.md','| MC-01 | Standard e Controlli |','| MC-01 | Valutazione di conformità automatica |'],
 ['release-identity-version','src/contracts/release-identity.json','"productVersion":"1.8.0"','"productVersion":"9.9.9"'],
 ['runtime-projection-drift','src/runtime/model.mjs','experience:{services:2','experience:{services:9'],
 ['http-projection-drift','src/server.mjs','projected.experience.services=7','projected.experience.services=9'],
 ['css-current-consumer-moved','public/styles.css',"@import url('./grc-workspace.css')","@import url('./grc-v2.css')"],
 ['css-duplicated-bytes-drift','public/grc-v2.css','.grc-cockpit{','.grc-cockpit{/* source-drift */'],
 ['finetuning-asset-repointed','public/ui/procedure-finetuning-2-3.js',"'/procedure-finetuning-2-3.css'","'/not-the-actual-finetuning.css'"],
 ['grc-legacy-consumer-repointed','src/runtime/grc-runtime.mjs',"from './grc-runtime-legacy.mjs'","from './grc-runtime-missing.mjs'"],
 ['ui-current-installer-repointed','public/ui/active-experience.js',"from './procedure-finetuning-2-3.js'","from './procedure-finetuning-2-4.js'"]
];
const rows=[];
try{
 const added=git('worktree','add','--detach',checkout,'HEAD');assert.equal(added.status,0,added.stderr);
 let r=run();assert.equal(r.status,0,`baseline docs failed: ${r.stdout.slice(-900)} ${r.stderr.slice(-900)}`);
 const order=[...cases.keys()];for(let i=order.length-1;i>0;i--){const j=next()%(i+1);[order[i],order[j]]=[order[j],order[i]];}
 for(const idx of order){
  const [name,file,from,to]=cases[idx],target=join(checkout,file),before=readFileSync(target,'utf8');
  assert.ok(before.includes(from),`inert mutation ${name}`);
  writeFileSync(target,before.replace(from,to));r=run();const detail=r.stdout+'\n'+r.stderr;
  const detected=r.status!==0&&detail.includes('semantic-source:');
  rows.push({name,file,detected,exit:r.status,signal:r.signal||null});
  writeFileSync(target,before);
  assert.ok(detected,`survivor ${name}: ${detail.slice(-1200)}`);
 }
 const target=join(checkout,'docs/REPOSITORY_ATLAS.md'),original=readFileSync(target,'utf8');
 const benign=original.replace('## Razionalizzazione e archiviazione: decisioni basate sui consumer',
 '## Razionalizzazione e archiviazione: decisioni basate sui consumer\n\nLa verifica delle dichiarazioni resta subordinata ai consumer effettivi.');
 assert.notEqual(benign,original);writeFileSync(target,benign);r=run();
 assert.equal(r.status,0,'benign documentary clarification rejected: '+r.stdout.slice(-800)+' '+r.stderr.slice(-600));
 writeFileSync(target,original);r=run();assert.equal(r.status,0,'restored source/doc baseline was not accepted');
 const receipt={schema:'ictc-semantic-doc-source-falsification/v1',seed:SEED,head:git('rev-parse','HEAD').stdout.trim(),
  physicalMutations:rows.length,killed:rows.filter(x=>x.detected).length,positive:1,rows,
  scope:'Current Atlas, PRODUCT, release identity, executable server/model/adapter imports, browser CSS consumer and bytes; executable checker on disposable Git worktree',
  limitation:'Source and document congruence is not a runtime/browser/user-acceptance proof; no file disposal authorized.'};
 mkdirSync(join(root,'artifacts'),{recursive:true});
 writeFileSync(join(root,'artifacts','semantic-doc-source-falsification.json'),JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify({ok:true,seed:SEED,killed:receipt.killed,physicalMutations:receipt.physicalMutations,positive:receipt.positive,head:receipt.head}));
}finally{git('worktree','remove','--force',checkout);rmSync(temp,{force:true,recursive:true});}
