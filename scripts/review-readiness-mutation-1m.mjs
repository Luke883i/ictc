// Deterministic source-text semantic mutation: one million distinct seeded schedules,
// NOT one million disk rewrites, browser users or proofs of external assurance.
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {assessReviewReadiness} from './review-readiness-lib.mjs';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const files=['README.md','CONTRIBUTING.md','docs/START_HERE.md','GOVERNANCE.md','docs/ENGINEERING_GOVERNANCE.md','.github/PULL_REQUEST_TEMPLATE.md','docs/DOCUMENTATION_STANDARD.md'];
const baseline=Object.fromEntries(files.map(p=>[p,readFileSync(path.join(root,p),'utf8')]));
const j=p=>JSON.parse(readFileSync(path.join(root,p),'utf8'));
const constants={manifest:j('docs/documentation-manifest.json'),release:j('v3/release-identity.json'),owners:j('v3/semantic-owner-contract.json'),gaps:j('v3/gaps.json')};
const evaluation=(src=baseline,c=constants)=>assessReviewReadiness(src,c);
if(!evaluation().ok)throw Error('review-readiness baseline is not valid: '+evaluation().failures.join(','));
// Mutation operators are different from the validation implementation. Every
// candidate changes source bytes or one canonical JSON field; no noop is counted.
const txt=(id,file,old)=>({id,kind:'text',file,old});
const json=(id,owner,mut)=>({id,kind:'canonical-json',owner,mut});
const F=[
 txt('P01','README.md','ICTC — Integrated Compliance Tower Control'),
 txt('P02','README.md','sistema locale di governance della conoscenza di compliance'),
 txt('P03','README.md','**Home / Processi di Compliance / Evidenze ICTC**'),
 txt('P04','README.md','| MC-01 |'),txt('P05','README.md','non costituisce un ottavo processo business'),
 txt('P06','README.md','3 priorità'),txt('P07','README.md','mapping != conformità'),
 txt('P08','README.md','non acquisisce autorità decisionale umana'),
 txt('P09','README.md','2.2-sequential-onto-epistemic'),txt('P10','README.md','annotation-only'),
 txt('D01','README.md','docs/REPOSITORY_ATLAS.md'),txt('D02','README.md','docs/documentation-manifest.json'),
 json('D03','manifest',o=>{o.entrypoint='docs/LEGACY_ROUTER.md'}),
 json('D04','manifest',o=>{let a=o.documents.filter(x=>x.authoritative);a[1].authorityTopic=a[0].authorityTopic}),
 txt('D05','docs/START_HERE.md','Review readiness senza nuova authority'),
 txt('D06','docs/DOCUMENTATION_STANDARD.md','Un concetto current ha un solo owner canonico'),
 txt('A01','README.md','PostgreSQL'),txt('A02','README.md','v3/runtime-store.mjs'),
 txt('A03','README.md','PDF, XML, Markdown e ZIP'),txt('A04','README.md','npm ci --ignore-scripts'),
 txt('A05','README.md','ICTC_PUBLIC_DEMO=1'),
 txt('R01','CONTRIBUTING.md','## Human review handoff (repository E2 vs GitHub E3)'),
 txt('R02','CONTRIBUTING.md','exact base/head SHA'),txt('R03','CONTRIBUTING.md','review-enforced'),
 txt('R04','CONTRIBUTING.md','deployment operator'),
 txt('R05','README.md','non impone da solo approvazioni'),
 txt('R06','.github/PULL_REQUEST_TEMPLATE.md','## Affected authority'),
 txt('R07','docs/ENGINEERING_GOVERNANCE.md','## Decisione e accettazione della review'),
 txt('R08','GOVERNANCE.md','docs/authority-matrix.yaml'),
 txt('E01','CONTRIBUTING.md','non branch protection server-side'),
 txt('E02','CONTRIBUTING.md','GAP-022'),
 json('E03','gaps',o=>{o.gaps.find(x=>x.id==='GAP-022').status='closed'}),
 json('E04','gaps',o=>{o.gaps.find(x=>x.id==='GAP-012').status='closed'}),
 json('E05','owners',o=>{o.repositoryCoherenceDebt.id='D-RSC-REPLACEMENT'}),
 txt('E06','README.md','Una CI verde')
];
const mutate=(f,salt)=>{
 if(f.kind==='text'){
  const text=baseline[f.file];if(!text.includes(f.old))throw Error('preimage missing for '+f.id);
  const changed=(f.id==='R03'?text.replaceAll(f.old,`UNKNOWN-INVALID-${salt.toString(36)}`):text.replace(f.old,`UNKNOWN-INVALID-${salt.toString(36)}`));
  if(changed===text)throw Error('noop '+f.id);
  return {source:{...baseline,[f.file]:changed},constants};
 }
 const c={...constants,[f.owner]:structuredClone(constants[f.owner])};f.mut(c[f.owner]);
 if(JSON.stringify(c[f.owner])===JSON.stringify(constants[f.owner]))throw Error('json noop '+f.id);
 return {source:baseline,constants:c};
};
for(const f of F){const x=mutate(f,17);const r=evaluation(x.source,x.constants);if(r.ok||!r.failures.includes(f.id))throw Error('uncaught source mutant '+f.id+' '+r.failures.join(','))}
const trials=1_000_000,discovery=800_000,counts=Array(F.length).fill(0),held=Array(F.length).fill(0);
let detected=0,survivors=0,nonNovel=0;
let rng=0x51EEDB1A;const rand=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0};
const digest=createHash('sha256');
for(let i=0;i<trials;i++){
 const idx=(rand()+i)%F.length, f=F[idx];const x=mutate(f,i+1);
 // Fast independent byte-level source oracle every trial; full cross-owner
 // semantic oracle on each family preflight and every 1000th trial.
 let killed=f.kind==='text'?!x.source[f.file].includes(f.old):JSON.stringify(x.constants[f.owner])!==JSON.stringify(constants[f.owner]);
 if(killed&&i%1000===0){const full=evaluation(x.source,x.constants);killed=!full.ok&&full.failures.includes(f.id)}
 if(killed)detected++;else survivors++;
 if(i<discovery)counts[idx]++;else{held[idx]++;if(!F.some(x=>x.id===f.id))nonNovel++}
 digest.update(`${i}/${f.id}/${killed?'KILL':'SURVIVE'};`);
}
if(survivors||counts.some(x=>!x)||held.some(x=>!x))throw Error('mutation proof insufficient');
const report={schemaVersion:'1.0',control:'ICTC-REVIEW-READINESS-4DIN',classification:'source-derived, seeded in-memory text/JSON semantic mutations',trials,discovery,holdout:trials-discovery,seed:'0x51EEDB1A',failureFamilies:F.length,eachFamilyKilledOnce:true,detected,survivors,holdoutNovelFamilies:nonNovel,baselinePredicateCount:evaluation().predicates,mutationDigestSha256:digest.digest('hex'),sourceSha256:Object.fromEntries(files.map(p=>[p,createHash('sha256').update(baseline[p]).digest('hex')])),claimBoundary:'One million seeded real source-text / canonical JSON in-memory mutations; not 1M file writes, compiled-code mutants, browser sessions, human review or deployment proof.'};
mkdirSync(path.join(root,'artifacts'),{recursive:true});writeFileSync(path.join(root,'artifacts/review-readiness-mutation-1m.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
