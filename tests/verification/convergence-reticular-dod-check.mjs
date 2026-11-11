import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=resolve(fileURLToPath(new URL('../..',import.meta.url)));
const json=p=>JSON.parse(readFileSync(join(ROOT,p),'utf8'));
const authority=json('docs/convergence/convergence-authority.json');
const gaps=json('tests/contracts/gaps.json');
const remediation=json('audit/remediation-registry.json');
const originalTracked=execFileSync('git',['ls-files','-z'],{cwd:ROOT,encoding:'utf8'}).split('\0').filter(Boolean);
const essential=['src/bootstrap.mjs','src/server.mjs','src/store.mjs','src/sqlite-state-persistence.mjs','docs/PRODUCT.md','docs/authority-matrix.yaml'];
const physical={noCurrentV3:originalTracked.every(p=>!p.startsWith('v3/')),canonicalPresent:essential.every(p=>originalTracked.includes(p)),tracked:originalTracked.length};
const SLICE=['C1-COMPAT-CONTRACTION','C2-DELIVERY-PROVENANCE','C3-CAPACITY-CONTRACT','C4-AI-EVAL-DRIFT','C5-SEMANTIC-OWNER-COMPRESSION'];
// A local oracle must not turn an implementation into a terminal governance fact.
// The existing JSON/workbook and GitHub own terminal state and review evidence.
export function evaluateReticularClosure({authority,gaps,remediation,physical}){
 const c=Object.fromEntries((authority.conditionalSlices||[]).map(x=>[x.id,x]));
 const g=Object.fromEntries((gaps.gaps||[]).map(x=>[x.id,x]));
 const f=Object.fromEntries((remediation.findings||[]).map(x=>[x.id,x]));
 const s=Object.fromEntries((authority.serialChain||[]).map(x=>[x.id,x]));
 const C1=Boolean(physical.noCurrentV3&&physical.canonicalPresent&&c['C1-COMPAT-CONTRACTION']?.state==='done');
 const C2=Boolean(c['C2-DELIVERY-PROVENANCE']?.state==='done'&&f['F-06']?.status==='resolved');
 const C3=Boolean(c['C3-CAPACITY-CONTRACT']?.state==='done'&&f['F-13']?.status==='resolved');
 const C4=Boolean(c['C4-AI-EVAL-DRIFT']?.state==='done'&&f['F-15']?.status==='resolved');
 const C5=Boolean(c['C5-SEMANTIC-OWNER-COMPRESSION']?.state==='done');
 const conditions={C1,C2,C3,C4,C5};
 const S4=SLICE.every((id,i)=>conditions[`C${i+1}`]===true)&&s['S4-A6-CLOSE']?.state==='done'&&g['GAP-020']?.status==='closed';
 const S5=S4&&s['S5-CANDIDATE-SEAL']?.state==='done'&&g['GAP-021']?.status==='closed';
 const externalGaps=['GAP-007','GAP-009','GAP-012','GAP-014','GAP-022'];
 const externallyProven=externalGaps.every(id=>g[id]?.status==='closed');
 const independent=remediation.findings.filter(x=>x.requiredGrade==='E3'||x.requiredGrade==='E4').every(x=>x.status==='resolved');
 const global=S5&&externallyProven&&independent;
 const blocked=[...SLICE.filter((id,i)=>!conditions[`C${i+1}`]),...(!S4?['S4-A6-CLOSE']:[]),...(!S5?['S5-CANDIDATE-SEAL']:[]),...externalGaps.filter(id=>g[id]?.status!=='closed'),...(!independent?['REMEDIATION-E3-E4']:[])];
 return {schemaVersion:'1.0.0',authority:'derived-e2-no-new-authority',physical,conditions,S4,S5,externallyProven,independent,global,blocked,limitations:['C1 includes unobserved dynamic/external consumers; physical cutover alone never resolves it.','C3 endpoint paging is opt-in and bounds response, not total in-memory projection or deployment scale.','C4 self-reported AI evaluation windows do not prove independently measured drift or provider safety.','No output can replace the convergence authority workbook, review protection or deployment evidence.']};
}
const report=evaluateReticularClosure({authority,gaps,remediation,physical});
assert.equal(report.physical.noCurrentV3,true);
assert.equal(report.physical.canonicalPresent,true);
assert.equal(report.conditions.C2,true);
assert.equal(report.conditions.C5,true);
assert.equal(report.conditions.C1,false);
assert.equal(report.conditions.C3,false);
assert.equal(report.conditions.C4,false);
assert.equal(report.S4,false);
assert.equal(report.S5,false);
assert.equal(report.global,false);
// Explicit negative/positive counterfactuals: no single declaration can seal S4/S5.
for(const id of ['C1-COMPAT-CONTRACTION','C3-CAPACITY-CONTRACT','C4-AI-EVAL-DRIFT']){
 const forged=structuredClone(authority);forged.conditionalSlices.find(x=>x.id===id).state='done';
 assert.equal(evaluateReticularClosure({authority:forged,gaps,remediation,physical}).S4,false);
}
const forgedGaps=structuredClone(gaps);for(const g of forgedGaps.gaps)if(g.id==='GAP-020'||g.id==='GAP-021')g.status='closed';
assert.equal(evaluateReticularClosure({authority,gaps:forgedGaps,remediation,physical}).S5,false);
const forgedRemediation=structuredClone(remediation);for(const f of forgedRemediation.findings)if(f.id==='F-13'||f.id==='F-15')f.status='resolved';
assert.equal(evaluateReticularClosure({authority,gaps,remediation:forgedRemediation,physical}).S4,false);
// Seeded semantic mutants cover 12 interacting, causally distinct facts. All
// 4096 combinations are exhausted at least once before random replay; no
// expensive whole-registry cloning and no claim of 10M physical Git patches.
const trials=Number(process.argv.find(s=>s.startsWith('--mutations='))?.split('=')[1]||50000);
if(!Number.isSafeInteger(trials)||trials<4096||trials>10000000)throw Error('mutations 4096..10M');
let seed=20261110,escaped=0,positive=0,negative=0,distinct=0;
const seen=new Uint8Array(4096);
const next=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
for(let i=0;i<trials;i++){
 const mask=i<4096?i:next()&4095;
 if(!seen[mask]){distinct++;seen[mask]=1;}
 const on=k=>Boolean(mask&(1<<k));
 const a={conditionalSlices:SLICE.map((id,i)=>({id,state:([on(0),true,on(1),on(2),true][i])?'done':'in-progress'})),serialChain:[{id:'S4-A6-CLOSE',state:on(5)?'done':'blocked'},{id:'S5-CANDIDATE-SEAL',state:on(7)?'done':'blocked'}]};
 const g={gaps:[{id:'GAP-020',status:on(6)?'closed':'open'},{id:'GAP-021',status:on(8)?'closed':'open'},...['GAP-007','GAP-009','GAP-012','GAP-014','GAP-022'].map(id=>({id,status:on(9)?'closed':'open'}))]};
 const r={findings:[{id:'F-06',status:'resolved'},{id:'F-13',status:on(3)?'resolved':'open'},{id:'F-15',status:on(4)?'resolved':'in-remediation'},{id:'F-01',requiredGrade:'E3',status:on(9)?'resolved':'blocked-external'}]};
 const p={noCurrentV3:!on(10),canonicalPresent:!on(11)};
 const result=evaluateReticularClosure({authority:a,gaps:g,remediation:r,physical:p});
 const expectedC1=on(0)&&!on(10)&&!on(11),expectedC3=on(1)&&on(3),expectedC4=on(2)&&on(4);
 const expectedS4=expectedC1&&expectedC3&&expectedC4&&on(5)&&on(6);
 const expectedS5=expectedS4&&on(7)&&on(8),expectedGlobal=expectedS5&&on(9);
 if(result.conditions.C1!==expectedC1||result.conditions.C3!==expectedC3||result.conditions.C4!==expectedC4||result.S4!==expectedS4||result.S5!==expectedS5||result.global!==expectedGlobal)escaped++;
 if(result.global)positive++;else negative++;
}
assert.equal(escaped,0,'semantic reticular mutant disagrees with backward-derived AND oracle');
assert.equal(distinct,4096,'finite model saturation incomplete');
assert.ok(positive>0&&negative>0,'mutation catalog must admit and reject counterfactuals');
mkdirSync(join(ROOT,'artifacts'),{recursive:true});
const receipt={...report,mutation:{seed:20261110,trials,falseTerminalSurvivors:escaped,cohort:'finite-source-model-mutants-not-Git-patches',distinctProfiles:distinct,positiveGlobalCounterfactuals:positive,negativeGlobalCounterfactuals:negative},commit:null};
writeFileSync(join(ROOT,'artifacts','convergence-reticular-dod.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({ok:true,trials,falseTerminalSurvivors:escaped,conditions:report.conditions,terminal:report.global,blocked:report.blocked}));
if(process.argv.includes('--require-global')&&!report.global)process.exit(27);
