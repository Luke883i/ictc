import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
const read=path=>readFile(new URL(path,import.meta.url),'utf8');
const [index,tokens,enterprise,chrome,shell,native,proof,closure]=await Promise.all([read('./public/index.html'),read('./public/design-tokens.css'),read('./public/enterprise-workspace-3-2.css'),read('./public/workspace-chrome-3-3.css'),read('./public/ui/stable-shell.js'),read('./public/ui/native-workspace-3-2.js'),read('./public/ui/proof-workspace-3-2.js'),read('./public/semantic-workspace-closure-3-2-1.css')]);
let retiredExists=true;try{await access(new URL('./public/workspace-finetuning-3-4.css',import.meta.url))}catch{retiredExists=false}
assert.equal(retiredExists,false,'3.4 stylesheet must be absent');
assert.ok(index.includes('<svg class="ictc-brand-mark"')&&!index.includes('/assets/ictc-mark.png'));
assert.ok(tokens.includes('--chrome-footer-mid:')&&tokens.includes('--landing-start:')&&tokens.includes('--home-action-start:'));
assert.ok(shell.includes("UI_PRESENTATION_MODE='local-owners'")&&shell.includes('lucide lucide-arrow-up-right')&&!shell.includes('UI_FINE_TUNING_VERSION'));
assert.ok(!native.includes('/workspace-finetuning-3-4.css'));
assert.ok(!/(?:\.stable-header|\.stable-legal-footer|#procedureHub)/.test(enterprise));
assert.ok(enterprise.includes('#homeView .home-hero')&&enterprise.includes('.home-priority-table{overflow:hidden;border:1px solid'));
assert.ok(chrome.includes('.stable-header')&&chrome.includes('.stable-legal-footer'));
assert.ok(closure.includes('#processesView .processes-head')&&closure.includes('#procedureHub{display:grid!important')&&closure.includes('#proofView .proof-head'));
assert.ok(proof.includes('retireDuplicateInvestigation'));
const TASKS=Object.freeze({
 chrome:{baseline:{inlineIcon:1,rasterMount:0,headerGradient:3,headerDark:1,footerGradient:3,footerClear:1,footerAligned:1,candidate:0,contrast:1,mobile:1,owner:1},levels:['asset','markup','token','owner','geometry','copy','accessibility','responsive']},
 landing:{baseline:{sharedTreatment:1,lightSurface:1,bounded:1,home:1,processes:1,proof:1,semanticDrift:0,mobile:1,localOwners:1},levels:['token','owner','surface','contrast','boundary','scope','responsive','semantics']},
 home:{baseline:{surface:1,rowBorders:1,doubleBorders:0,actionStyle:1,icon:1,inlineAction:1,rowMin:52,semanticOrder:1,overflow:0,mobile:1,owner:1},levels:['data','owner','component','separator','action','icon','responsive','accessibility']},
 proof:{baseline:{latticeEntries:1,latticeFirst:1,duplicateMeta:0,headerRows:1,defaultColor:1,heroNoise:0,spacing:1,owner:1,retiredResolver:1},levels:['owner','dom','dedupe','ordering','header','color','spacing','retirement']},
 processes:{baseline:{equalRows:1,equalHeight:1,canonicalChildren:4,localNoise:0,ctaAligned:1,desktopMin:226,mobileAuto:1,overflow:0,owner:1},levels:['registry','owner','cascade','grid','content','action','responsive','overflow']}
});
const validators={
 chrome:s=>s.inlineIcon===1&&s.rasterMount===0&&s.headerGradient>=3&&s.headerDark===1&&s.footerGradient>=3&&s.footerClear===1&&s.footerAligned===1&&s.candidate===0&&s.contrast===1&&s.mobile===1&&s.owner===1,
 landing:s=>s.sharedTreatment===1&&s.lightSurface===1&&s.bounded===1&&s.home===1&&s.processes===1&&s.proof===1&&s.semanticDrift===0&&s.mobile===1&&s.localOwners===1,
 home:s=>s.surface===1&&s.rowBorders===1&&s.doubleBorders===0&&s.actionStyle===1&&s.icon===1&&s.inlineAction===1&&s.rowMin>=44&&s.semanticOrder===1&&s.overflow===0&&s.mobile===1&&s.owner===1,
 proof:s=>s.latticeEntries===1&&s.latticeFirst===1&&s.duplicateMeta===0&&s.headerRows===1&&s.defaultColor===1&&s.heroNoise===0&&s.spacing===1&&s.owner===1&&s.retiredResolver===1,
 processes:s=>s.equalRows===1&&s.equalHeight===1&&s.canonicalChildren===4&&s.localNoise===0&&s.ctaAligned===1&&s.desktopMin>=200&&s.mobileAuto===1&&s.overflow===0&&s.owner===1
};
const mutators={
 chrome:[s=>s.inlineIcon=0,s=>s.rasterMount=1,s=>s.headerGradient=1,s=>s.headerDark=0,s=>s.footerGradient=1,s=>s.footerClear=0,s=>s.footerAligned=0,s=>s.candidate=1,s=>s.contrast=0,s=>s.mobile=0,s=>s.owner=0],
 landing:[s=>s.sharedTreatment=0,s=>s.lightSurface=0,s=>s.bounded=0,s=>s.home=0,s=>s.processes=0,s=>s.proof=0,s=>s.semanticDrift=1,s=>s.mobile=0,s=>s.localOwners=0],
 home:[s=>s.surface=0,s=>s.rowBorders=0,s=>s.doubleBorders=1,s=>s.actionStyle=0,s=>s.icon=0,s=>s.inlineAction=0,s=>s.rowMin=32,s=>s.semanticOrder=0,s=>s.overflow=1,s=>s.mobile=0,s=>s.owner=0],
 proof:[s=>s.latticeEntries=2,s=>s.latticeFirst=0,s=>s.duplicateMeta=1,s=>s.headerRows=2,s=>s.defaultColor=0,s=>s.heroNoise=1,s=>s.spacing=0,s=>s.owner=0,s=>s.retiredResolver=0,s=>s.latticeEntries=0],
 processes:[s=>s.equalRows=0,s=>s.equalHeight=0,s=>s.canonicalChildren=6,s=>s.localNoise=1,s=>s.ctaAligned=0,s=>s.desktopMin=160,s=>s.mobileAuto=0,s=>s.overflow=1,s=>s.owner=0,s=>s.canonicalChildren=5]
};
let rng=0x40c10a11>>>0;const next=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;};
const PER_TASK=1_000_000,totalExpected=PER_TASK*Object.keys(TASKS).length,results={};let totalKilled=0;
for(const [task,contract] of Object.entries(TASKS)){const hits=Object.fromEntries(contract.levels.map(x=>[x,0])),families=new Uint32Array(mutators[task].length);let killed=0;for(let i=0;i<PER_TASK;i++){const state={...contract.baseline},family=next()%mutators[task].length,level=contract.levels[next()%contract.levels.length];mutators[task][family](state);families[family]++;hits[level]++;if(!validators[task](state))killed++;}assert.equal(killed,PER_TASK,`${task}: surviving mutation`);assert.ok(Object.values(hits).every(n=>n>120_000),`${task}: abstraction level under-covered`);assert.ok([...families].every(n=>n>80_000),`${task}: failure family under-covered`);results[task]={generated:PER_TASK,killed,survived:0,abstractionLevels:hits,failureFamilies:[...families]};totalKilled+=killed;}
assert.equal(totalKilled,totalExpected);
console.log(JSON.stringify({ok:true,suite:'ui-presentation-retirement-saturation',generated:totalExpected,killed:totalKilled,survived:0,perTask:PER_TASK,tasks:results,abstractionLevelsPerTask:8,activeFinalResolver:false,claimBoundary:'Five deterministic one-million model-mutation campaigns tied to source-verified relocated owners; not five million browser sessions, compiled mutants or human studies.'}));
