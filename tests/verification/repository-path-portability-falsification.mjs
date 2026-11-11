/** Real disposable filesystem mutations of the existing repository root contract.
 * They do not prove external consumer absence or authorize file retirement. */
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,symlinkSync,rmSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {inspectRepositoryFilesystem} from '../../scripts/repository-path-portability.mjs';
const SEED=0x20261110;
let state=SEED;function next(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
const root=mkdtempSync(join(tmpdir(),'ictc-fs-mutants-'));
const cases=[];
function put(where,content='export const bounded=true;\n'){
 const target=join(root,where);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,content);
}
function baseline(){put('src/entry.mjs');put('README.md','# Test fixture\n');put('tests/legacy/historical.txt','preserved\n');}
function reset(){rmSync(root,{recursive:true,force:true});mkdirSync(root,{recursive:true});baseline();}
const patterns=[
 (n)=>{put(`src/Core${n}.mjs`);put(`src/core${n}.mjs`);return 'case-insensitive path collision';},
 (n)=>{put(`docs/SCOPE${n}.md`);put(`docs/scope${n}.md`);return 'case-insensitive path collision';},
 (n)=>{put(`src/aux.${n}`);return 'non-portable filesystem name';},
 (n)=>{put(`docs/NUL.${n}`);return 'non-portable filesystem name';},
 (n)=>{put(`src/component${n}.`);return 'non-portable filesystem name';},
 (n)=>{put(`src/component${n} `);return 'non-portable filesystem name';},
 (n)=>{put(`src/handoff${n}:alternate.js`);return 'non-portable filesystem name';},
 (n)=>{put(`docs/cafe\u0301-${n}.md`);return 'non-NFC filesystem name';},
 (n)=>{put(`src/weird\\${n}.js`);return 'non-portable filesystem name';},
 (n)=>{const t=`src/link-${n}`;symlinkSync('../README.md',join(root,t));return 'unqualified repository symlink';}
];
try{
 reset();assert.deepEqual(inspectRepositoryFilesystem(root).errors,[],'baseline must remain portable');
 for(let i=0;i<80;i++){
  reset();const index=(next()+i)%patterns.length,signature=patterns[index](next()%100000);
  const posture=inspectRepositoryFilesystem(root);const caught=posture.errors.some(e=>e.includes(signature));
  assert.ok(caught,`survivor: physical mutation ${i} ${signature}: ${JSON.stringify(posture.errors)}`);
  cases.push({id:i,family:signature,detected:caught});
 }
 const positives=[
  'src/valid-module.mjs',['docs','Start-here.md'].join('/'),'tests/legacy/preserved-fixture.json',
  'public/assets/icon.svg','.env.example','src/nested/another-module.js',
  'docs/caf\u00e9.md','src/shared/README.md'
 ];
 reset();for(const name of positives)put(name);
 assert.deepEqual(inspectRepositoryFilesystem(root).errors,[],'valid source/reference filenames must remain allowed');
 const projectRoot=resolve(fileURLToPath(new URL('../../',import.meta.url)));
 const real=inspectRepositoryFilesystem(projectRoot);
 assert.deepEqual(real.errors,[],'current tracked/source checkout must remain portable');
 const report={ok:true,schema:'ictc-repository-path-portability/v1',seed:SEED,physicalNegativeCases:cases.length,killed:cases.filter(x=>x.detected).length,positiveFiles:positives.length,repositoryPaths:real.examined,symlinks:real.symlinks.length,claimBoundary:'Real disposable filesystem edits; not an external URL, dynamic consumer, or SAFE_DELETE proof.'};
 mkdirSync(join(projectRoot,'artifacts'),{recursive:true});
 writeFileSync(join(projectRoot,'artifacts/repository-path-portability-falsification.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));
}finally{rmSync(root,{recursive:true,force:true});}
