import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateA6Ux1} from './s4-a6-ux1-footer-model.mjs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const baseline={css:read('./public/a6-ux1-fixed-safe-footer.css'),styles:read('./public/styles.css'),registry:read('./current-gate-registry.mjs'),workflow:read('../.github/workflows/s4-a6-ux1-fixed-safe-footer.yml'),browser:read('./browser-s4-a6-ux1-fixed-safe-footer.py'),authority:read('../docs/convergence/convergence-authority.json')};
assert.equal(validateA6Ux1(baseline).ok,true,'baseline must satisfy A6-UX1 contract');
const families=[
 ['drop-import',s=>({...s,styles:s.styles.replace("@import url('./a6-ux1-fixed-safe-footer.css');\n",'')})],
 ['move-import',s=>({...s,styles:s.styles.replace("@import url('./a6-ux1-fixed-safe-footer.css');\n",'').replace("@import url('./semantic-composition-3-1.css');\n", "@import url('./a6-ux1-fixed-safe-footer.css');\n@import url('./semantic-composition-3-1.css');\n")})],
 ['desktop-reserve-zero',s=>({...s,css:s.css.replace('--a6-ux1-footer-base:44px','--a6-ux1-footer-base:0px')})],
 ['mobile-reserve-zero',s=>({...s,css:s.css.replace('--a6-ux1-footer-base:52px','--a6-ux1-footer-base:0px')})],
 ['drop-safe-area',s=>({...s,css:s.css.replace('env(safe-area-inset-bottom,0px)','0px')})],
 ['drop-scroll-padding',s=>({...s,css:s.css.replace('scroll-padding-bottom:var(--a6-ux1-footer-reserve);','')})],
 ['drop-body-reserve',s=>({...s,css:s.css.replace('padding-bottom:var(--a6-ux1-footer-reserve)!important;','padding-bottom:0!important;')})],
 ['static-footer',s=>({...s,css:s.css.replace('position:fixed!important','position:static!important')})],
 ['drop-bottom-inset',s=>({...s,css:s.css.replace('inset:auto 0 0 0!important','inset:auto!important')})],
 ['hardcode-height',s=>({...s,css:s.css.replace('height:var(--a6-ux1-footer-reserve)!important','height:44px!important')})],
 ['hardcode-min-height',s=>({...s,css:s.css.replace('min-height:var(--a6-ux1-footer-reserve)!important','min-height:44px!important')})],
 ['body-flex-root',s=>({...s,css:s.css.replace('padding-bottom:var(--a6-ux1-footer-reserve)!important;','padding-bottom:var(--a6-ux1-footer-reserve)!important;display:flex;')})],
 ['body-fixed',s=>({...s,css:s.css.replace('padding-bottom:var(--a6-ux1-footer-reserve)!important;','padding-bottom:var(--a6-ux1-footer-reserve)!important;position:fixed;')})],
 ['body-overflow-hidden',s=>({...s,css:s.css.replace('padding-bottom:var(--a6-ux1-footer-reserve)!important;','padding-bottom:var(--a6-ux1-footer-reserve)!important;overflow:hidden;')})],
 ['drop-native-check',s=>({...s,registry:s.registry.replace("'v3/s4-a6-ux1-fixed-safe-footer-check.mjs',",'')})],
 ['drop-native-saturation',s=>({...s,registry:s.registry.replace('v3/s4-a6-ux1-fixed-safe-footer-saturation.mjs','v3/removed-saturation.mjs')})],
 ['drop-pr-trigger',s=>({...s,workflow:s.workflow.replace('  pull_request:\n','')})],
 ['drop-browser-command',s=>({...s,workflow:s.workflow.replace('python -u v3/browser-s4-a6-ux1-fixed-safe-footer.py','echo skipped')})],
 ['drop-source-command',s=>({...s,workflow:s.workflow.replace('node v3/s4-a6-ux1-fixed-safe-footer-check.mjs','echo skipped')})],
 ['drop-browser-geometry',s=>({...s,browser:s.browser.replaceAll('getBoundingClientRect','rectMeasureDisabled')})],
 ['drop-native-focus',s=>({...s,browser:s.browser.replaceAll('native-focus-non-overlap','focus-overlap-disabled')})],
 ['drop-root-negative',s=>({...s,browser:s.browser.replaceAll('root-trap-negative','root-trap-disabled')})],
 ['stale-authority-base',s=>({...s,authority:s.authority.replace('25b1dde1c6032f1057a7d63a449ab2bdb43a0299','28e6dae3ec5b84ebfc4c4a1a42dee69426332470')})],
 ['drop-subslice',s=>({...s,authority:s.authority.replace('"currentSubSlice": "A6-UX1"','"currentSubSlice": null')})]
];
let seed=0xa6f001d5;const rnd=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;seed>>>=0;return seed%n};
const kills=Object.fromEntries(families.map(([name])=>[name,0]));
const trials=100000;
for(let i=0;i<trials;i++){
  const [name,mutate]=families[i<families.length?i:rnd(families.length)];
  const candidate=mutate({...baseline});
  if(!validateA6Ux1(candidate).ok)kills[name]++;
}
const survivors=Object.entries(kills).filter(([,count])=>count===0);
assert.deepEqual(survivors,[],`surviving mutation families: ${JSON.stringify(survivors)}`);
console.log(JSON.stringify({ok:true,slice:'S4-A6',executionUnit:'A6-UX1',seed:'0xa6f001d5',trials,families:families.length,kills,evidenceGrade:'E2 deterministic source/model falsification; the prior local million-mutation campaign remains separate evidence.'}));
