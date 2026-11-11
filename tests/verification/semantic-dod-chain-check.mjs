// Audit-only proof projection. Canonical states remain in the existing owner registers.
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=resolve(fileURLToPath(new URL('../..',import.meta.url)));
const read=p=>readFileSync(join(ROOT,p),'utf8');
const json=p=>JSON.parse(read(p));
const gaps=json('tests/contracts/gaps.json');
const remediation=json('audit/remediation-registry.json');
const authority=json('docs/convergence/convergence-authority.json');
const find=(xs,id)=>xs.find(x=>x.id===id)?.status ?? xs.find(x=>x.id===id)?.state;
const home=read('public/ui/stable-shell.js');
const process=read('public/ui/procedure-frame.js');
const homeCss=read('public/enterprise-workspace-3-2.css');
const procCss=read('public/semantic-workspace-closure-3-2-1.css');
const source={
 D02:read('README.md').includes('merged con la PR #283') &&
      !read('README.md').includes('in pre-PR (non ancora released)') &&
      read('docs/GAP_REGISTER.md').includes('La PR #283 merged integra') &&
      !read('docs/PROJECT_TRAJECTORY.md').includes('non sostituisce ' + 'v3/release-identity.json'),
 D04:home.includes('data-home-guide-action>Comprimi guida') &&
      home.includes("guide.open?'Comprimi guida':'Espandi guida'") &&
      home.includes("guide.addEventListener('toggle',syncGuide)") &&
      homeCss.includes('#homeView .home-compliance-full>summary{'),
 D05:homeCss.includes('max-inline-size:min(100%,1120px);margin-inline:auto') &&
      process.includes('<dl class="process-inline-facts">') &&
      process.includes('<dt>Traccia prodotta</dt>') &&
      process.includes('esc(process.requirementClass)') &&
      process.includes('esc(process.produces)') &&
      procCss.includes(':has(.process-inline-detail[open])') &&
      procCss.includes('grid-template-columns:3.6rem minmax(0,1fr)!important')
};
for(const id of ['D02','D04','D05'])assert.equal(source[id],true,'source regression '+id);
const raw=[
 ['D01','GAP-022 + GitHub rulesets','E3-GOV',[],['R07','R17']],
 ['D02','README + GAP_REGISTER + PROJECT_TRAJECTORY','E2-SOURCE',[],['R04','R05','R06','R08']],
 ['D03','V8 lineage + public UI owners','E2-INTEGRATION',[],['R14','R20','R21','R22','R23']],
 ['D04','public/ui/stable-shell.js','E2-SOURCE+BROWSER',['D03'],[]],
 ['D05','public/ui/procedure-frame.js + CSS','E2-SOURCE+BROWSER',['D03'],[]],
 ['D06','tests/browser + GAP-008/012','E2-REAL-BROWSER',['D04','D05'],['R16']],
 ['D07','CSS owners / cascade register','E2-CSSOM',['D06'],['R14']],
 ['D08','C1-COMPAT-CONTRACTION','E2-RUNTIME+BROWSER',['D03'],['R11']],
 ['D09','src/store.mjs / SqliteStatePersistence','E2-RESTART',['D08'],['R11']],
 ['D10','F-13 / C3-CAPACITY-CONTRACT','E2-CAPACITY',['D08'],['R12']],
 ['D11','F-15 / C4-AI-EVAL-DRIFT','E2-EVAL',['D08'],['R13']],
 ['D12','src/runtime/onboarding-policy.mjs','E2-RUNTIME',['D03'],['R11']],
 ['D13','C2 + enterprise-candidate attestations','E2-HOSTED',['D08','D09','D10','D11','D12'],['R10']],
 ['D14','GAP-012 + GAP-022','E3-HUMAN+GOV',['D01','D06'],['R16','R17']],
 ['D15','GAP-007/009/014 + external remediation','E4-DEPLOY',['D13'],['R18']]
];
const rows=raw.map(([id,owner,evidenceClass,dependsOn,crosswalk])=>({id,owner,evidenceClass,dependsOn,crosswalk}));
function validate(xs){
 const names=new Set(xs.map(x=>x.id));
 assert.equal(names.size,15,'15 distinct DoD obligations');
 for(let i=1;i<=15;i++)assert(names.has('D'+String(i).padStart(2,'0')));
 const visited=new Set(),active=new Set();
 function walk(id){
  if(active.has(id))throw Error('DoD cycle: '+id);
  if(visited.has(id))return;
  active.add(id);
  for(const dep of xs.find(x=>x.id===id).dependsOn){
   assert(names.has(dep)&&dep!==id,'missing/self dependency '+id+' > '+dep);
   walk(dep);
  }
  active.delete(id);visited.add(id);
 }
 for(const x of xs){
  assert.ok(x.owner&&x.evidenceClass&&Array.isArray(x.crosswalk),'missing evidence metadata '+x.id);
  walk(x.id);
 }
 return true;
}
validate(rows);
for(const x of rows){
 const altered=structuredClone(rows);altered.find(a=>a.id===x.id).dependsOn.push('MISSING');
 assert.throws(()=>validate(altered),'missing-dependency mutant survived '+x.id);
}
function qualifies(e,kind){
 if(!e||e.exactHead!==true||e.contentVerified!==true||e.claimMatched!==true)return false;
 if(kind.includes('BROWSER')||kind==='E2-CSSOM')return e.kind==='ICTC_NATIVE_BROWSER'&&e.synthetic===false&&e.dom===true&&e.cssom===true&&/^[a-f0-9]{64}$/.test(e.screenshotSha256||'');
 if(kind.startsWith('E3'))return e.kind==='INDEPENDENT_E3'&&e.independent===true&&e.authorized===true;
 if(kind==='E4-DEPLOY')return e.kind==='INDEPENDENT_E4'&&e.independent===true&&e.environmentVerified===true;
 return e.kind==='ACTUAL_SCOPED_PROOF';
}
const synthetic={kind:'SYNTHETIC_FIXTURE',synthetic:true,exactHead:true,contentVerified:true,claimMatched:true,dom:true,cssom:true,screenshotSha256:'a'.repeat(64)};
for(const x of rows)assert.equal(qualifies(synthetic,x.evidenceClass),false,'fixture falsely proves '+x.id);
for(const t of ['E3-GOV','E3-HUMAN+GOV','E4-DEPLOY'])assert.equal(qualifies({...synthetic,kind:'ACTUAL_SCOPED_PROOF'},t),false,'external proof substituted '+t);
const blockers={
 C1:find(authority.conditionalSlices,'C1-COMPAT-CONTRACTION'),
 C3:find(authority.conditionalSlices,'C3-CAPACITY-CONTRACT'),
 C4:find(authority.conditionalSlices,'C4-AI-EVAL-DRIFT'),
 F13:find(remediation.findings,'F-13'),F15:find(remediation.findings,'F-15'),
 E3HUMAN:find(gaps.gaps,'GAP-012'),E3GOV:find(gaps.gaps,'GAP-022'),
 E4:['GAP-007','GAP-009','GAP-014'].map(id=>[id,find(gaps.gaps,id)])
};
for(const [k,v] of Object.entries(blockers))assert.ok(v!==undefined,'missing canonical blocker '+k);
const state=Object.fromEntries(rows.map(x=>[x.id,source[x.id]?'SOURCE_SCOPED':x.evidenceClass.startsWith('E3')||x.evidenceClass.startsWith('E4')?'EXTERNAL_HOLD':'HOLD']));
if(find(remediation.findings,'F-06')==='resolved')state.D13='E2_REPOSITORY_SCOPED_HOSTED_HOLD';
const receipt={
 schema:'ictc.semantic-dod-chain.derived.v1',
 authority:'none; receipt only; canonical owners unchanged',
 abstractDoD:'intent AND owner AND scope AND claim-matched witness AND no contradictory evidence AND independent evidence where required',
 scope:'source-only + fail-closed counterfactuals; NOT global ICTC runtime',
 gates:rows.map(x=>({...x,status:state[x.id]})),
 coverage:{obligations:15,qualified:15,dag:true,sourceScoped:Object.values(state).filter(v=>v==='SOURCE_SCOPED').length},
 blockers,global:false,
 limitations:['10M bundled model mutations are not ICTC source patches or ten full product CI cycles.',
 'V8 source predicates cannot close 360 native-product browser cells or 179 CSS collision candidates.',
 'Hosted artifacts, reviews, representative people and deployment need independent receipts.',
 'C1/C3/C4, S4/S5 and E3/E4 cannot be promoted by this audit-only oracle.']
};
assert.equal(receipt.global,false);
mkdirSync(join(ROOT,'artifacts'),{recursive:true});
writeFileSync(join(ROOT,'artifacts/semantic-dod-chain.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({ok:true,coverage:receipt.coverage,source:source,blockers,global:receipt.global}));
if(process.argv.includes('--require-global'))process.exit(27);
