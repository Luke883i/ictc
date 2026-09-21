import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateA6Ux1} from './s4-a6-ux1-footer-model.mjs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const baseline={css:read('./public/a6-ux1-fixed-safe-footer.css'),styles:read('./public/styles.css'),registry:read('./current-gate-registry.mjs'),workflow:read('../.github/workflows/s4-a6-ux1-fixed-safe-footer.yml'),browser:read('./browser-s4-a6-ux1-fixed-safe-footer.py')};
assert.equal(validateA6Ux1(baseline).ok,true,'baseline must satisfy A6-UX1 flow contract');
const families=[
 ['drop-import',s=>({...s,styles:s.styles.replace("@import url('./a6-ux1-fixed-safe-footer.css');\n",'')})],
 ['desktop-min-zero',s=>({...s,css:s.css.replace('--a6-ux1-footer-min:44px','--a6-ux1-footer-min:0px')})],
 ['mobile-min-zero',s=>({...s,css:s.css.replace('--a6-ux1-footer-min:52px','--a6-ux1-footer-min:0px')})],
 ['drop-safe-area',s=>({...s,css:s.css.replace('env(safe-area-inset-bottom,0px)','0px')})],
 ['restore-scroll-reserve',s=>({...s,css:s.css.replace('scroll-padding-bottom:0px','scroll-padding-bottom:44px')})],
 ['restore-body-reserve',s=>({...s,css:s.css.replace('padding-bottom:0!important','padding-bottom:44px!important')})],
 ['fixed-overlay',s=>({...s,css:s.css.replace('position:static!important','position:fixed!important')})],
 ['bottom-inset',s=>({...s,css:s.css.replace('inset:auto!important','inset:auto 0 0 0!important')})],
 ['hardcode-height',s=>({...s,css:s.css.replace('height:auto!important','height:44px!important')})],
 ['drop-min-height',s=>({...s,css:s.css.replace('min-height:calc(var(--a6-ux1-footer-min) + var(--a6-ux1-footer-safe-bottom))!important;','')})],
 ['body-flex-root',s=>({...s,css:s.css.replace('padding-bottom:0!important;','padding-bottom:0!important;display:flex;')})],
 ['body-fixed',s=>({...s,css:s.css.replace('padding-bottom:0!important;','padding-bottom:0!important;position:fixed;')})],
 ['body-overflow-hidden',s=>({...s,css:s.css.replace('padding-bottom:0!important;','padding-bottom:0!important;overflow:hidden;')})],
 ['drop-native-check',s=>({...s,registry:s.registry.replace("'v3/s4-a6-ux1-fixed-safe-footer-check.mjs',",'')})],
 ['drop-browser-command',s=>({...s,workflow:s.workflow.replace('python -u v3/browser-s4-a6-ux1-fixed-safe-footer.py','echo skipped')})],
 ['drop-source-command',s=>({...s,workflow:s.workflow.replace('node v3/s4-a6-ux1-fixed-safe-footer-check.mjs','echo skipped')})],
 ['drop-browser-geometry',s=>({...s,browser:s.browser.replaceAll('getBoundingClientRect','rectMeasureDisabled')})],
 ['drop-flow-oracle',s=>({...s,browser:s.browser.replaceAll('normal-flow-non-overlap','flow-oracle-disabled')})],
 ['drop-root-negative',s=>({...s,browser:s.browser.replaceAll('root-trap-negative','root-trap-disabled')})]
];
let seed=0xa6f001d5;const rnd=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;seed>>>=0;return seed%n};
const kills=Object.fromEntries(families.map(([name])=>[name,0])),trials=100000;
for(let i=0;i<trials;i++){const row=families[i<families.length?i:rnd(families.length)],name=row[0],mutate=row[1],candidate=mutate({...baseline});if(!validateA6Ux1(candidate).ok)kills[name]++;}
const survivors=Object.entries(kills).filter(([,count])=>count===0);assert.deepEqual(survivors,[],'surviving mutation families: '+JSON.stringify(survivors));
console.log(JSON.stringify({ok:true,slice:'S4-A6',executionUnit:'A6-UX1',seed:'0xa6f001d5',trials,families:families.length,kills,evidenceGrade:'E2 deterministic flow-safe source/model falsification; governance lineage remains delegated to convergence-authority.'}));
