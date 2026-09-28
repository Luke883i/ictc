import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateA6Ux1} from './s4-a6-ux1-footer-model.mjs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const baseline={css:read('./public/a6-ux1-fixed-safe-footer.css'),styles:read('./public/styles.css'),registry:read('./current-gate-registry.mjs'),workflow:read('../.github/workflows/s4-a6-ux1-fixed-safe-footer.yml'),browser:read('./browser-s4-a6-ux1-fixed-safe-footer.py')};
assert.equal(validateA6Ux1(baseline).ok,true,'baseline must satisfy A6-UX1 fixed safe contract');
const families=[
 ['drop-import',s=>({...s,styles:s.styles.replace("@import url('./a6-ux1-fixed-safe-footer.css');\n",'')})],
 ['desktop-min-zero',s=>({...s,css:s.css.replace('--a6-ux1-footer-min:44px','--a6-ux1-footer-min:0px')})],
 ['mobile-min-zero',s=>({...s,css:s.css.replace('--a6-ux1-footer-min:52px','--a6-ux1-footer-min:0px')})],
 ['drop-safe-area',s=>({...s,css:s.css.replace('env(safe-area-inset-bottom,0px)','0px')})],
 ['break-reserve',s=>({...s,css:s.css.replace('--a6-ux1-footer-reserve:calc(var(--a6-ux1-footer-min) + var(--a6-ux1-footer-safe-bottom))','--a6-ux1-footer-reserve:0px')})],
 ['drop-scroll-reserve',s=>({...s,css:s.css.replace('scroll-padding-bottom:calc(var(--a6-ux1-footer-reserve) + 12px)','scroll-padding-bottom:0px')})],
 ['drop-body-reserve',s=>({...s,css:s.css.replace('padding-bottom:var(--a6-ux1-footer-reserve)!important','padding-bottom:0!important')})],
 ['static-regression',s=>({...s,css:s.css.replace('position:fixed!important','position:static!important')})],
 ['drop-bottom-inset',s=>({...s,css:s.css.replace('bottom:0!important','bottom:auto!important')})],
 ['break-height-reserve',s=>({...s,css:s.css.replace('height:var(--a6-ux1-footer-reserve)!important','height:44px!important')})],
 ['drop-min-height',s=>({...s,css:s.css.replace('min-height:var(--a6-ux1-footer-reserve)!important;','')})],
 ['drop-focus-reserve',s=>({...s,css:s.css.replace('scroll-margin-bottom:calc(var(--a6-ux1-footer-reserve) + 12px)','scroll-margin-bottom:0px')})],
 ['body-flex-root',s=>({...s,css:s.css.replace('padding-bottom:var(--a6-ux1-footer-reserve)!important;','padding-bottom:var(--a6-ux1-footer-reserve)!important;display:flex;')})],
 ['body-fixed',s=>({...s,css:s.css.replace('padding-bottom:var(--a6-ux1-footer-reserve)!important;','padding-bottom:var(--a6-ux1-footer-reserve)!important;position:fixed;')})],
 ['body-overflow-hidden',s=>({...s,css:s.css.replace('padding-bottom:var(--a6-ux1-footer-reserve)!important;','padding-bottom:var(--a6-ux1-footer-reserve)!important;overflow:hidden;')})],
 ['drop-native-check',s=>({...s,registry:s.registry.replace("'v3/s4-a6-ux1-fixed-safe-footer-check.mjs',",'')})],
 ['drop-browser-command',s=>({...s,workflow:s.workflow.replace('python -u v3/browser-s4-a6-ux1-fixed-safe-footer.py','echo skipped')})],
 ['drop-source-command',s=>({...s,workflow:s.workflow.replace('node v3/s4-a6-ux1-fixed-safe-footer-check.mjs','echo skipped')})],
 ['drop-browser-geometry',s=>({...s,browser:s.browser.replaceAll('getBoundingClientRect','rectMeasureDisabled')})],
 ['drop-fixed-oracle',s=>({...s,browser:s.browser.replaceAll('fixed-persistent-non-overlap','fixed-oracle-disabled')})],
 ['drop-reserve-oracle',s=>({...s,browser:s.browser.replaceAll('reserve-coupling','reserve-oracle-disabled')})],
 ['drop-root-negative',s=>({...s,browser:s.browser.replaceAll('root-trap-negative','root-trap-disabled')})]
];
let seed=0xa6f001d5;const rnd=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;seed>>>=0;return seed%n};
const kills=Object.fromEntries(families.map(([name])=>[name,0])),trials=100000;
for(let i=0;i<trials;i++){const row=families[i<families.length?i:rnd(families.length)],name=row[0],mutate=row[1],candidate=mutate({...baseline});if(!validateA6Ux1(candidate).ok)kills[name]++;}
const survivors=Object.entries(kills).filter(([,count])=>count===0);assert.deepEqual(survivors,[],'surviving mutation families: '+JSON.stringify(survivors));
console.log(JSON.stringify({ok:true,slice:'S4-A6',executionUnit:'A6-UX1',seed:'0xa6f001d5',trials,families:families.length,kills,evidenceGrade:'E2 deterministic fixed-safe source/model falsification; governance lineage remains delegated to convergence-authority.'}));
