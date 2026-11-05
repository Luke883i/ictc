/**
 * C1-2/F7 falsifier for the existing repository-contract owner, not a new SOT.
 * Each edit is isolated under OS tmpdir and rolled back. Old checks are NOT
 * executed as current runtime/CI requirements, and no delete is authorized.
 */
import {cpSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,relative,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const sourceRoot=resolve(fileURLToPath(new URL('..',import.meta.url)));
const args=process.argv.slice(2);
if(!args.includes('--falsify'))throw Error('Use --falsify (source mutation is performed only in an isolated disposable copy)');
const argCases=args.find(arg=>arg.startsWith('--model-cases='));
const count=argCases?Number(argCases.split('=')[1]):100000;
if(!Number.isSafeInteger(count)||count<0||count>10000000)throw Error('model-cases must be an integer from 0 to 10000000');
// A separate, repeatable 12-bit policy model. This is NOT a source mutation.
let seed=0xc120f7a5,seen=new Uint8Array(4096),observed=0,escapes=0;
function xorshift(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
function qualify(guards){return guards.every(Boolean)}
for(let i=0;i<count;i++){
  const mask=(i%8192===0)?4095:(i%8192<=12?4095^(1<<(i%8192-1)):xorshift()&4095);
  const guards=Array.from({length:12},(_,b)=>Boolean(mask&(1<<b)));
  if(qualify(guards)!==(mask===4095))escapes++;
  if(!seen[mask]){seen[mask]=1;observed++}
}
// Exhaust the finite contract even if the seeded campaign missed a profile.
let exhausted=0;for(let mask=0;mask<4096;mask++){
 const flags=Array.from({length:12},(_,b)=>(mask&(1<<b))!==0);
 if(qualify(flags)!==(mask===4095))escapes++;
 exhausted++;
}
const sandbox=mkdtempSync(join(tmpdir(),'ictc-c12-f7-'));
const candidate=join(sandbox,'repo');
const excluded=new Set(['.git','node_modules']);
const toolFiles=['schema-check.mjs','ui-wiring-check.mjs','verify.mjs'];
const cases=[
 ...toolFiles.map(name=>({id:'npm-promotes-'+name,file:'package.json',bad:s=>{const j=JSON.parse(s);j.scripts['current-legacy']='node scripts/'+name;return JSON.stringify(j)},expect:'legacy historical checker promoted to current route'})),
 ...toolFiles.map(name=>({id:'ci-promotes-'+name,file:'.github/workflows/docs-command-contract.yml',bad:s=>s.replace('      - name: Validate documented commands',`      - name: Accidental legacy current job\n        run: node scripts/${name}\n      - name: Validate documented commands`),expect:'legacy historical checker promoted to current route'})),
 {id:'model-old-literal-promoted',file:'v3/runtime/model.mjs',bad:s=>s.replace('experience:{services:2','experience:{services:7'),expect:'legacy service literal vs current HTTP projection drift'},
 {id:'server-current-http-redirected',file:'v3/server.mjs',bad:s=>s.replace('projected.experience.services=7','projected.experience.services=2'),expect:'legacy service literal vs current HTTP projection drift'},
 {id:'atlas-omits-F7',file:'docs/REPOSITORY_ATLAS.md',bad:s=>s.replace('C1-2 · Legacy tooling / F7','unqualified legacy checkers'),expect:'legacy tooling classification missing'},
 {id:'atlas-promotes-F7',file:'docs/REPOSITORY_ATLAS.md',bad:s=>s.replace('HISTORICAL_DIAGNOSTIC_HOLD_CONSUMERS','CURRENT_RUNTIME_CERTIFIED'),expect:'legacy tooling classification missing'},
 {id:'legacy-schema-repointed',file:'scripts/schema-check.mjs',bad:s=>s.replace('../lib/domain.mjs','../v3/domain.mjs'),expect:'historical tooling source signature drift'},
 {id:'legacy-ui-repointed',file:'scripts/ui-wiring-check.mjs',bad:s=>s.replace("'server.mjs'","'v3/server.mjs'"),expect:'historical tooling source signature drift'},
 {id:'legacy-verify-repointed',file:'scripts/verify.mjs',bad:s=>s.replace("'v1/release.json'","'v3/release-identity.json'"),expect:'historical tooling source signature drift'},
 ...toolFiles.map(name=>({id:'legacy-tool-deleted-'+name,file:'scripts/'+name,bad:()=>null,expect:'historical tooling source signature drift'}))
];
const result={schema:'ictc-c1-2-f7-falsification/v1',sourceTreeOnly:true,authority:'NONE',seedHex:'0xc120f7a5',semanticPolicyModel:{cases:count,observedProfiles:observed,profileSpace:4096,exhaustedProfiles:exhausted,escapes,modelOnly:true},physical:{cases:cases.length,killed:0,survivors:[],results:[]},negativeControls:[],limitations:['No dynamic import or external consumer absence proof','F7 global closure not claimed','10M semantic policy models are not 10M physical file rewrites']};
const invoke=()=>{
 const p=spawnSync(process.execPath,[join(sourceRoot,'scripts/repository-contract.mjs'),candidate],{cwd:candidate,encoding:'utf8',timeout:25000});
 let data=null;try{data=JSON.parse(p.stdout)}catch{}
 return {exit:p.status,status:data?.status,failures:data?.failures||[],error:p.error?.message||p.stderr?.slice(0,200)||''};
};
try{
 cpSync(sourceRoot,candidate,{recursive:true,filter:p=>{if(p===sourceRoot)return true;const rel=relative(sourceRoot,p).split(/[\\/]/);return !excluded.has(rel[0])&&!['runtime','artifacts'].includes(rel[0]);}});
 const baseline=invoke();if(baseline.exit!==0||baseline.status!=='PASS_SCOPED')throw Error('baseline checker not PASS_SCOPED: '+JSON.stringify(baseline));
 for(const test of cases){
  const p=join(candidate,test.file),before=readFileSync(p,'utf8'),after=test.bad(before);
  if(after===before)throw Error('vacuous physical mutant: '+test.id);
  if(after===null)rmSync(p);else writeFileSync(p,after);
  const actual=invoke();writeFileSync(p,before);
  const killed=actual.exit===1&&actual.status==='REFUTED'&&actual.failures.some(x=>x.includes(test.expect));
  result.physical.results.push({id:test.id,killed,failure:actual.failures.find(x=>x.includes(test.expect))||actual.error});
  if(killed)result.physical.killed++;else result.physical.survivors.push(test.id);
 }
 // False-positive control: a comment mentioning a command is not a live CI invocation.
 const workflow=join(candidate,'.github/workflows/docs-command-contract.yml'),original=readFileSync(workflow,'utf8');
 writeFileSync(workflow,original+'\n# node scripts/schema-check.mjs is an historical reference only\n');
 const commentOnly=invoke();writeFileSync(workflow,original);
 result.negativeControls.push({id:'comment-not-CI',pass:commentOnly.exit===0&&commentOnly.status==='PASS_SCOPED'});
 const reverted=invoke();result.negativeControls.push({id:'revert-is-identical-PASS',pass:reverted.exit===0&&reverted.status==='PASS_SCOPED'});
}finally{rmSync(sandbox,{recursive:true,force:true})}
result.status=result.physical.killed===result.physical.cases&&result.semanticPolicyModel.escapes===0&&result.negativeControls.every(x=>x.pass)?'PASS_SCOPED':'REFUTED';
console.log(JSON.stringify(result,null,2));if(result.status!=='PASS_SCOPED')process.exitCode=1;
