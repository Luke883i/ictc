// Audit-only proof projection. Canonical states remain in the existing owner registers.
import assert from 'node:assert/strict';
import {runSemanticDODMutations} from './semantic-dod-reticular-mutation-100k.mjs';
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
const processUi=read('public/ui/procedure-frame.js');
const homeCss=read('public/enterprise-workspace-3-2.css');
const procCss=read('public/semantic-workspace-closure-3-2-1.css');
const staticFilterMarkup=read('public/index.html');
const staticFilterLabels=[
 '<input id="catalogSearch" type="search" aria-label="Cerca fonti per titolo, autorità o identificativo"',
 '<select id="catalogState" aria-label="Filtra le fonti per stato"'
];
const filterNamesPresent=markup=>staticFilterLabels.every(label=>markup.includes(label));
assert.equal(filterNamesPresent(staticFilterMarkup),true,'RN source filters lack accessible names');
for(const label of staticFilterLabels){
 assert.equal(filterNamesPresent(staticFilterMarkup.replace(label,label.replace(/ aria-label="[^"]+"/,''))),false,
  'one-label deletion mutant escaped');
}

const source={
 D02:read('README.md').includes('merged con la PR #283') &&
      !read('README.md').includes('in pre-PR (non ancora released)') &&
      read('docs/GAP_REGISTER.md').includes('La PR #283 merged integra') &&
      read('docs/PROJECT_TRAJECTORY.md').includes('non sostituisce `src/contracts/release-identity.json`') &&
      !read('docs/PROJECT_TRAJECTORY.md').includes('non sostituisce `v3/release-identity.json`'),
 D04:home.includes('data-home-guide-action>Comprimi guida') &&
      home.includes("guide.open?'Comprimi guida':'Espandi guida'") &&
      home.includes("guide.addEventListener('toggle',syncGuide)") &&
      homeCss.includes('#homeView .home-compliance-full>summary{'),
 D05:homeCss.includes('max-inline-size:min(100%,1120px);margin-inline:auto') &&
      processUi.includes('<dl class="process-inline-facts">') &&
      processUi.includes('<dt>Traccia prodotta</dt>') &&
      processUi.includes('esc(process.requirementClass)') &&
      processUi.includes('esc(process.produces)') &&
      processUi.includes('</footer>${process?') &&
      processUi.includes('data-process-secondary-detail') &&
      procCss.includes('#procedureHub{grid-auto-rows:auto!important;align-items:start!important}') &&
      procCss.includes('grid-column:1/-1;grid-row:auto') &&
      !procCss.includes(':has(.process-inline-detail[open])') &&
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

const V8_PREPR_COMMIT_SHAS=["d315412b3325f41fa2c89c2e521d2181d0de6da5","716fb98033f03da54d011bb95df85f38b38e326f","62085550e65ec7dbe51585667e49d3514d466efb","90bc11dd8b87be999bcb9b94e449659072b978ac","056cef5352ea02cba3a852f9c058dac5a9dfe85e","9283fe759caad231ccf002e4a9526b34a7af34e1","6fe8a4d6a4316a105e5aebc508c3d67baa1b5400","1627ff590deb8a32f45738c9ad7f4d88981919fc","506cbe19691ae9fe713f3a9ea4658f1ad27d7732","183bb2f202d077ae3265206223f7f78e3eecc328","a1173d183b20210f52c94b7698acbb1a7f2de841","966aa30532d4640162f5ec921350d372e1124a59","61a157671cb9cdc94685e62c682dcbf9486e91b5","b8013b448f8eed3afb1b9c8d3966517ba8ec47a9","55c05d30331abf59b42bf36e338e84153ebf0fa0","bc848c966e425249eb9316e3270c5294117f1125","6f05839b4c435b7d6d6e5d7ca825f88e511560fc","2b5458c79097e3dd38fc697f432a63502033db39","cabf092a606e4b164dbbae840db3b928b4ac8faf","9caaeef371fdef6953bb52b00c03e0aaa06e470f","1823e4e74ebf459a52c09dc1b2f114dbf5c4363c","8e05e7ff4c14afe88106319bbc0be21652d8d917","1468a3006f41c27a844c03abb28e3563596f2759","f86a782e3fccebd5652817c646c23ebdab34974e"];
const v8Disposition=V8_PREPR_COMMIT_SHAS.map((sha,i)=>{
 const n=i+1;
 const disposition=([1,2,12,21,22].includes(n)?'ADAPTED_SOURCE_SCOPED':
  n===23?'ADAPTED_BROWSER_SCOPED':
  [8,24].includes(n)?'GENERATED_COMPASS_REPROJECTED':
  'OPEN_DIFF_RECONCILIATION');
 return {ordinal:n,sourceCommitSha:sha,disposition};
});
assert.equal(v8Disposition.length,24);
assert.equal(new Set(v8Disposition.map(x=>x.sourceCommitSha)).size,24);
assert.equal(v8Disposition.filter(x=>x.disposition==='ADAPTED_SOURCE_SCOPED').length,5);
// The original local pre-PR replay proves its own tree, never rebasing onto post-283 main.
assert.equal(state.D03,'HOLD','all 24 commits are not semantically absorbed on this PR');

const reticularFalsification=runSemanticDODMutations(ROOT);
assert.equal(reticularFalsification.globalDoD,false);
const receipt={
 schema:'ictc.semantic-dod-chain.derived.v2',
 authority:'none; receipt only; canonical owners unchanged',
 abstractDoD:'intent AND owner AND scope AND claim-matched witness AND no contradictory evidence AND independent evidence where required',
 scope:'source-only + fail-closed counterfactuals; NOT global ICTC runtime',
 gates:rows.map(x=>({...x,status:state[x.id]})),
 coverage:{obligations:15,structurallyValidated:15,independentlyEvidenceQualified:0,dag:true,sourceScoped:Object.values(state).filter(v=>v==='SOURCE_SCOPED').length},
 blockers,global:false,
 reticularFalsification,
 v8PrePrLineage:{
  origin:'uploaded immutable V8 pre-PR git-mailbox; historical local base, not post-283 main',
  originalPatchSha256:'e5b7480d8730378ab9604d8f80ca606e8bd86deca766eb4968f09d6afd131b01',
  originalZipSha256:'f2f1435aa832f188ff675f8018b3b56f607b2d8a18423c1542e0a1d72640ee18',
  sourceCommitCount:24,dispositions:v8Disposition,
  fullySemanticallyAbsorbed:false,unverifiedOriginalGitTree:true,
  sourceControlNotSameAsNativeBrowser:true
 },
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
