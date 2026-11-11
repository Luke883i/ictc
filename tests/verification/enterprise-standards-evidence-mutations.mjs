// Seeded negative model + real filesystem mutations; no authority/deletion is inferred.
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),args=process.argv.slice(2);
const opt=(k,d)=>{const i=args.indexOf(k);return i<0?d:Number(args[i+1]);};
const cases=opt('--cases',100000),seed=opt('--seed',20261110)>>>0,physical=opt('--physical',1)!==0;
assert.ok(Number.isInteger(cases)&&cases>=1000&&cases<=20000000);
let state=seed;const rand=()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state;};
// Eight independent normative relations with non-compensating owners, claims and E3/E4 boundaries.
const baseline=[
 ['SLSA','E2_HOSTED_PENDING',1,1,1,1,0],
 ['SLSA_SOURCE','E3_HOLD',1,1,1,1,0],
 ['CYCLONEDX','E2_SCOPED',1,1,1,1,0],
 ['OWASP_FILE','E2_SCOPED',1,1,1,1,0],
 ['OWASP_HEADERS','E2_SCOPED',1,1,1,1,0],
 ['OWASP_ACCESS','E2_SCOPED',1,1,1,1,0],
 ['OWASP_API','E2_PARTIAL',1,1,1,1,0],
 ['NIS2_DORA','E3_E4_HOLD',1,1,1,1,0]
];
const validGrade=['E2_HOSTED_PENDING','E3_HOLD','E2_SCOPED','E2_SCOPED','E2_SCOPED','E2_SCOPED','E2_PARTIAL','E3_E4_HOLD'];
const accepts=(rows)=>rows.length===8 && rows.every((r,i)=>r[0]===baseline[i][0]&&r[1]===validGrade[i]&&r.slice(2,6).every(v=>v===1)&&r[6]===0);
assert.ok(accepts(baseline));
const familyCount=16,negatives=new Array(familyCount).fill(0);let positives=0;
for(let i=0;i<cases;i++){
 const rowId=(rand()>>>16)%8,family=i%familyCount;
 if(family===15){const candidate=baseline.map(r=>[...r]);assert.ok(accepts(candidate));positives++;continue;}
 const candidate=baseline.map(r=>[...r]);
 if(family===0)candidate.splice(rowId,1);
 else if(family===1)candidate.push([...candidate[rowId]]);
 else if(family===2)candidate[rowId][0]+='-FORGED';
 else if(family===3)candidate[rowId][1]='E2_SCOPED';
 else if(family===4)candidate[rowId][1]='CERTIFIED';
 else if(family===5)candidate[rowId][2]=0;
 else if(family===6)candidate[rowId][3]=0;
 else if(family===7)candidate[rowId][4]=0;
 else if(family===8)candidate[rowId][5]=0;
 else if(family===9)candidate[rowId][6]=1;
 else if(family===10)candidate[0][1]='E2_SCOPED';
 else if(family===11)candidate[1][1]='E2_SCOPED';
 else if(family===12)candidate[6][1]='E2_SCOPED';
 else if(family===13)candidate[7][1]='E2_SCOPED';
 else if(family===14)candidate.reverse();
 // Family 3 on the existing E2_SCOPED rows would be a valid unchanged vector;
 // force an actual grade forgery so every negative is meaningfully invalid.
 if(family===3&&validGrade[rowId]==='E2_SCOPED')candidate[rowId][1]='E3_HOLD';
 assert.ok(!accepts(candidate),`semantic survivor family ${family}, iteration ${i}`);
 negatives[family]++;
}
let physicalCases=0,physicalKilled=0,positiveControls=0;
if(physical){
 const temp=await mkdtemp(path.join(tmpdir(),'ictc-standards-physical-'));const work=path.join(temp,'checkout');
 try{
  const git=(args)=>spawnSync('git',['-C',root,...args],{encoding:'utf8',timeout:30000});
  const add=git(['worktree','add','--detach',work,'HEAD']);assert.equal(add.status,0,`worktree create: ${add.stderr}`);
  const replacements=[
   ['docs/RELEASE.md','| STD-SLSA-BUILD |','| STD-SLSA-UNLISTED |'],
   ['docs/RELEASE.md','| STD-CYCLONEDX |','| STD-CYCLONEDX-MISSING |'],
   ['docs/RELEASE.md','| STD-OWASP-STATIC |','| STD-OWASP-STATIC-FORGED |'],
   ['docs/RELEASE.md','| STD-OWASP-API |','| STD-OWASP-API-FORGED |'],
   ['docs/RELEASE.md','`E2_HOSTED_PENDING`','`E2_SCOPED`'],
   ['docs/RELEASE.md','`E3_E4_HOLD`','`E2_SCOPED`'],
   ['docs/RELEASE.md','`src/runtime/http.mjs`','`src/runtime/http-fake.mjs`'],
   ['docs/RELEASE.md','`tests/verification/http-security-headers-check.mjs`','`tests/verification/no-such-check.mjs`'],
   ['.github/workflows/enterprise-candidate.yml','--predicate-type https://cyclonedx.org/bom','--predicate-type https://spdx.dev/Document/v2.3'],
   ['.github/workflows/enterprise-candidate.yml','--predicate-type https://slsa.dev/provenance/v1','--predicate-type https://unknown.example.invalid/build'],
   ['.github/workflows/enterprise-candidate.yml','ICTC_GH_SBOM_VERIFY: passed','ICTC_GH_SBOM_VERIFY: unknown'],
   ['src/runtime/http.mjs','realpath(filePath)','filePath'],
   ['src/runtime/http.mjs','static-symlink-escape','not-found'],
   ['src/runtime/http.mjs',"frame-ancestors 'none'","frame-ancestors 'self'"],
   ['src/runtime/http.mjs','browser-cross-site-write','browser-cross-site-allow'],
   ['tests/verification/delivery-provenance-check.mjs','lockedDigestMatches:integrityMatches','lockedDigestIgnored:integrityMatches'],
   ['README.md','Matrice comparativa CTO','Matrice cosmetica CTO']
  ];
  for(const [file,before,after] of replacements){
   const target=path.join(work,file),original=await readFile(target,'utf8');assert.ok(original.includes(before),`missing mutation preimage ${file}: ${before}`);
   const targetRow=before==='`E2_HOSTED_PENDING`'?'STD-SLSA-BUILD':before==='`E3_E4_HOLD`'?'STD-NIS2-DORA':null;
   const mutated=targetRow?original.split('\n').map(line=>line.startsWith(`| ${targetRow} |`)?line.replace(before,after):line).join('\n'):original.replace(before,after);
   assert.notEqual(mutated,original,`mutation did not change its target: ${file} ${before}`);
   await writeFile(target,mutated);
   const check=spawnSync(process.execPath,[path.join(root,'tests/verification/enterprise-standards-evidence-check.mjs'),'--root',work,'--no-receipt'],{cwd:work,encoding:'utf8',timeout:12000});
   physicalCases++;if(check.status!==0)physicalKilled++;else throw new Error(`physical survivor: ${file} :: ${before}`);
   await writeFile(target,original);
  }
  // Benign editorial addition is a positive guard against reject-all oracles.
  const doc=path.join(work,'docs/RELEASE.md'),original=await readFile(doc,'utf8');await writeFile(doc,original+'\n<!-- harmless documentation note -->\n');
  const check=spawnSync(process.execPath,[path.join(root,'tests/verification/enterprise-standards-evidence-check.mjs'),'--root',work,'--no-receipt'],{cwd:work,encoding:'utf8',timeout:12000});assert.equal(check.status,0,`positive control rejected: ${check.stdout} ${check.stderr}`);positiveControls++;
  await writeFile(doc,original);
 }finally{const rem=spawnSync('git',['-C',root,'worktree','remove','--force',work],{encoding:'utf8',timeout:30000});if(rem.status!==0)console.error('worktree cleanup:',rem.stderr);await rm(temp,{recursive:true,force:true});}
}
const report={schema:'ictc-standards-reticular-falsification/v1',seed,modelEvaluations:cases,semanticMutationFamilies:familyCount,modelNegativeCases:negatives.reduce((a,b)=>a+b,0),modelPositiveCases:positives,modelSurvivors:0,physicalMutations:physicalCases,physicalKilled,physicalSurvivors:physicalCases-physicalKilled,physicalPositiveControls:positiveControls,claimBoundary:'Finite model vectors are not independent source recompilations; physical mutations are actual writes on a disposable Git worktree, not 10M physical Git commits.'};
await mkdir(path.join(root,'artifacts'),{recursive:true});await writeFile(path.join(root,'artifacts/enterprise-standards-falsification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
