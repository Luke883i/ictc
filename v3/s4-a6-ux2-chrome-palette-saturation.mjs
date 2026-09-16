import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {validateChromePalette} from './s4-a6-ux2-chrome-palette-model.mjs';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const [tokens,chrome,business,styles,ux1,registry,workflow,design]=await Promise.all([read('./public/design-tokens.css'),read('./public/workspace-chrome-3-3.css'),read('./public/business-surface-convergence-2-7.css'),read('./public/styles.css'),read('./public/a6-ux1-fixed-safe-footer.css'),read('./current-gate-registry.mjs'),read('../.github/workflows/s4-a6-ux2-chrome-palette.yml'),read('../docs/21_DESIGN_SYSTEM.md')]);
let closureExists=true;try{await access(new URL('./public/business-surface-convergence-2-7-closure.css',import.meta.url));}catch{closureExists=false;}
const baseline=Object.freeze({tokens,chrome,business,styles,ux1,registry,workflow,design,closureExists});assert.equal(validateChromePalette(baseline).length,0,'baseline must pass before mutation');
const families=Object.freeze([
 ['dead-header-selector',s=>({...s,chrome:s.chrome.replaceAll('.topbar','.stable-header')})],
 ['business-topbar-owner',s=>({...s,business:s.business+'\nhtml[data-business-surface-convergence="2.7.0"] .topbar{background:#fff}\n'})],
 ['business-footer-owner',s=>({...s,business:s.business+'\nhtml[data-business-surface-convergence="2.7.0"] #stableLegalFooter{background:#fff}\n'})],
 ['closure-import',s=>({...s,styles:s.styles.replace("@import url('./ui-convergence.css');","@import url('./business-surface-convergence-2-7-closure.css');\n@import url('./ui-convergence.css');")})],
 ['closure-file',s=>({...s,closureExists:true})],
 ['duplicate-header-token',s=>({...s,tokens:s.tokens.replace('--chrome-header-start:#24415f;','--chrome-header-start:#24415f;--chrome-header-start:#ffffff;')})],
 ['missing-header-mid',s=>({...s,tokens:s.tokens.replace('--chrome-header-mid:#315b7c;','')})],
 ['duplicate-footer-token',s=>({...s,tokens:s.tokens.replace('--chrome-footer-start:#1b324b;','--chrome-footer-start:#1b324b;--chrome-footer-start:#ffffff;')})],
 ['footer-too-light',s=>({...s,tokens:s.tokens.replace('--chrome-footer-end:#365f7f;','--chrome-footer-end:#ffffff;')})],
 ['on-dark-low-contrast',s=>({...s,tokens:s.tokens.replace('--chrome-on-dark:#ffffff;','--chrome-on-dark:#285b84;')})],
 ['muted-low-contrast',s=>({...s,tokens:s.tokens.replace('--chrome-on-dark-muted:#e7eef7;','--chrome-on-dark-muted:#285b84;')})],
 ['header-gradient-detached',s=>({...s,chrome:s.chrome.replace('var(--chrome-header-mid)','var(--color-brand)')})],
 ['footer-gradient-detached',s=>({...s,chrome:s.chrome.replace('var(--chrome-footer-mid)','var(--color-brand)')})],
 ['header-control-geometry-contamination',s=>({...s,chrome:s.chrome.replace('box-shadow:0 1px 4px rgba(8,18,35,.08)!important}','box-shadow:0 1px 4px rgba(8,18,35,.08)!important;min-height:44px!important}')})],
 ['focus-removed',s=>({...s,chrome:s.chrome.replaceAll(':focus-visible',':focus-never')})],
 ['forced-colors-removed',s=>({...s,chrome:s.chrome.replace('@media(forced-colors:active)','@media(forced-colors-never:active)')})],
 ['reduced-motion-removed',s=>({...s,chrome:s.chrome.replace('@media(prefers-reduced-motion:reduce)','@media(prefers-reduced-motion:no-preference)')})],
 ['ux1-palette-contamination',s=>({...s,ux1:s.ux1+'\nhtml[data-ictc-experience="market-1"] #stableLegalFooter{background:#fff}\n'})],
 ['ux1-fixed-removed',s=>({...s,ux1:s.ux1.replace('position:fixed!important','position:static!important')})],
 ['gate-workflow-detached',s=>({...s,registry:s.registry.replace("'v3/s4-a6-ux2-chrome-palette-check.mjs',",''),workflow:s.workflow.replace('node v3/s4-a6-ux2-chrome-palette-check.mjs','node v3/noop.mjs')})]
]);
for(const [id,mutate] of families){const mutated=mutate({...baseline});assert.notDeepEqual(mutated,baseline,`no-op mutation family: ${id}`);assert.ok(validateChromePalette(mutated).length>0,`preflight survivor: ${id}`);}
let x=0xa6c02f17;const rnd=n=>{x^=x<<13;x^=x>>>17;x^=x<<5;x>>>=0;return x%n};const trials=100000,hits=Object.fromEntries(families.map(([id])=>[id,0])),survivors=[];
for(let i=0;i<trials;i++){const fi=i<families.length?i:rnd(families.length),[id,mutate]=families[fi],mutated=mutate({...baseline}),failures=validateChromePalette(mutated);hits[id]++;if(failures.length===0)survivors.push({i,id});}
assert.equal(survivors.length,0,JSON.stringify(survivors.slice(0,10)));assert.ok(Object.values(hits).every(n=>n>0),'every family must be exercised');
console.log(JSON.stringify({ok:true,slice:'S4-A6',executionUnit:'A6-UX2',campaign:'real in-memory source-string antagonists',seed:'0xa6c02f17',trials,survivors:0,families:families.length,familyHits:hits,evidenceGrade:'E2 source mutation evidence; not 100000 browser sessions or users.'}));
