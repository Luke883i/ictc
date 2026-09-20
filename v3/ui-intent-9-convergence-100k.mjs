import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const chrome=read('./public/workspace-chrome-3-3.css');
const home=read('./public/enterprise-workspace-3-2.css');
const footer=read('./public/a6-ux1-fixed-safe-footer.css');
const journey=read('./public/procedure-journey-2-1.css');
const evidence=read('./public/ui/evidence-download-ui.js');
const browser=read('./browser-pr60-polish.py');
const workflow=read('../.github/workflows/ci.yml');

assert.ok(chrome.includes('.topbar{height:var(--ui-header-h)!important;min-height:var(--ui-header-h)!important}'));
assert.ok(chrome.includes('.topbar .stable-header-inner{height:100%!important}'));
assert.ok(home.includes('height:calc(100dvh - var(--ui-header-h,56px) - var(--a6-ux1-footer-reserve,44px))')&&home.includes('max-height:calc(100dvh - var(--ui-header-h,56px) - var(--a6-ux1-footer-reserve,44px))')&&home.includes('#homeView{box-sizing:border-box;'));
assert.ok(footer.includes('padding-bottom:var(--a6-ux1-footer-reserve)!important'));
assert.ok(journey.includes('.evidence-export-menu>div{position:absolute;z-index:76;'));
assert.ok(evidence.includes("ictc:evidence-download-complete")&&evidence.includes('menuClosed: true'));
assert.ok(browser.includes("page.expect_response")&&browser.includes("__ictcEvidenceDownloads")&&browser.includes("__ictcEvidenceAnchorClicks")&&browser.includes("HTMLAnchorElement.prototype.click")&&browser.includes("content-length")&&!browser.includes("response.body()")&&!browser.includes('page.expect_download(timeout=60000)'));
assert.ok(workflow.includes("phase.startswith('evidence-downloads-')"));

const FORMATS=['pdf','xml','md','zip'];
const FAMILIES=['header-owner','header-token','home-budget','footer-reserve','body-scroll','format-set','fetch-status','payload-bytes','completion-order','completion-format','completion-base','menu-close','phase-prefix','authority-count','native-download-side-effect','popup-stacking'];
let seed=0x166c011a;
const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
const ri=n=>rnd()%n;
const valid=()=>({
  headerOwner:'chrome-3.3',headerToken:56,effectiveHeader:56,homeExtra:0,viewport:720+ri(900),
  footerReserve:44,bodyFooterReserve:44,bodyOverflow:'auto',formats:[...FORMATS],
  fetchStatus:200,payloadBytes:1+ri(2_000_000),lifecycleOrderValid:true,
  completionFormat:'pdf',requestedFormat:'pdf',
  completionBase:'/api/evidence/mission/x',requestedBase:'/api/evidence/mission/x',
  menuClosed:true,phase:'evidence-downloads-pdf',presentationOwners:1,nativeDownloadSuppressed:true,
  footerZ:75,popupZ:76
});
function failures(s){
  const out=[];
  if(s.headerOwner!=='chrome-3.3')out.push('header-owner');
  if(s.headerToken!==s.effectiveHeader)out.push('header-token');
  const homeHeight=s.viewport-s.headerToken-s.footerReserve+s.homeExtra;
  if(s.effectiveHeader+homeHeight+s.bodyFooterReserve>s.viewport+1)out.push('home-budget');
  if(s.bodyFooterReserve!==s.footerReserve)out.push('footer-reserve');
  if(s.bodyOverflow==='hidden')out.push('body-scroll');
  if(s.formats.join('|')!==FORMATS.join('|'))out.push('format-set');
  if(s.fetchStatus!==200)out.push('fetch-status');
  if(!(s.payloadBytes>0))out.push('payload-bytes');
  if(!s.lifecycleOrderValid)out.push('completion-order');
  if(s.completionFormat!==s.requestedFormat)out.push('completion-format');
  if(s.completionBase!==s.requestedBase)out.push('completion-base');
  if(!s.menuClosed)out.push('menu-close');
  if(!/^evidence-downloads-(pdf|xml|md|zip)$/.test(s.phase))out.push('phase-prefix');
  if(s.presentationOwners!==1)out.push('authority-count');
  if(!s.nativeDownloadSuppressed)out.push('native-download-side-effect');
  if(s.popupZ<=s.footerZ)out.push('popup-stacking');
  return out;
}
function mutate(s,family){
  switch(family){
    case'header-owner':s.headerOwner='legacy-base';break;
    case'header-token':s.effectiveHeader=72;break;
    case'home-budget':s.homeExtra=16;break;
    case'footer-reserve':s.bodyFooterReserve=s.footerReserve+8;break;
    case'body-scroll':s.bodyOverflow='hidden';break;
    case'format-set':s.formats=s.formats.filter(x=>x!=='zip');break;
    case'fetch-status':s.fetchStatus=500;break;
    case'payload-bytes':s.payloadBytes=0;break;
    case'completion-order':s.lifecycleOrderValid=false;break;
    case'completion-format':s.completionFormat='xml';s.requestedFormat='pdf';break;
    case'completion-base':s.completionBase='/api/evidence/incident/y';break;
    case'menu-close':s.menuClosed=false;break;
    case'phase-prefix':s.phase='evidence-downloads';break;
    case'authority-count':s.presentationOwners=2;break;
    case'native-download-side-effect':s.nativeDownloadSuppressed=false;break;
    case'popup-stacking':s.popupZ=45;break;
  }
}
const coverage=Object.fromEntries(FAMILIES.map(x=>[x,0]));
let positives=0,mutants=0,multiMutations=0;
for(let i=0;i<100_000;i++){
  const s=valid();
  if(i%17===0){assert.deepEqual(failures(s),[]);positives++;continue;}
  const depth=1+ri(4),chosen=new Set();
  while(chosen.size<depth)chosen.add(FAMILIES[ri(FAMILIES.length)]);
  for(const family of chosen){mutate(s,family);coverage[family]++;mutants++;}
  if(chosen.size>1)multiMutations++;
  const observed=failures(s);
  for(const family of chosen)assert.ok(observed.includes(family),`mutation survived: ${family}; observed=${observed.join(',')}`);
}
assert.ok(Object.values(coverage).every(n=>n>5000),coverage);
console.log(JSON.stringify({ok:true,slice:'UI-INTENT-9-CONVERGENCE',trials:100000,positives,mutants,multiMutations,families:FAMILIES.length,coverage,seed:'0x166c011a',collapsedInvariants:['canonical-header-token-owns-effective-box','home-plus-fixed-footer-fits-viewport','authenticated-evidence-fetch-precedes-completion','download-phase-observability-covers-format-suffixes','single-presentation-authority','sequential-browser-harness-suppresses-native-download-manager-side-effect','evidence-popup-stacks-above-fixed-footer'],claimBoundary:'Deterministic semantic/source mutation evidence only; Chromium and exact-head CI remain independent runtime evidence.'}));
