export const A6_UX1_CONTRACT=Object.freeze({
  slice:'S4-A6',executionUnit:'A6-UX1',finalImport:'./a6-ux1-fixed-safe-footer.css',
  viewports:Object.freeze([[1440,950],[390,844],[320,800]]),
  evidenceBoundary:'Automated source/model plus exact-head Chromium fixed-footer geometry; human assistive-technology/usability remains external evidence.'
});
const has=(text,token)=>String(text||'').includes(token);
export function validateA6Ux1({css,styles,registry,workflow,browser}){
 const failures=[],check=(ok,code,detail='')=>{if(!ok)failures.push({code,detail});};
 const imports=[...String(styles||'').matchAll(/@import\s+url\(['"]?([^)\'"\s]+)['"]?\)/g)].map(m=>m[1]);
 check(imports.at(-1)===A6_UX1_CONTRACT.finalImport,'FINAL_IMPORT',imports.at(-1)||null);
 for(const [token,code] of [
  ['--a6-ux1-footer-min:44px','DESKTOP_MIN'],['--a6-ux1-footer-min:52px','MOBILE_MIN'],['env(safe-area-inset-bottom,0px)','SAFE_AREA'],
  ['--a6-ux1-footer-reserve:calc(var(--a6-ux1-footer-min) + var(--a6-ux1-footer-safe-bottom))','RESERVE_COUPLING'],
  ['scroll-padding-bottom:calc(var(--a6-ux1-footer-reserve) + 12px)','ROOT_SCROLL_PADDING'],['padding-bottom:var(--a6-ux1-footer-reserve)!important','BODY_RESERVE'],
  ['position:fixed!important','FIXED_POSITION'],['bottom:0!important','BOTTOM_INSET'],['min-height:var(--a6-ux1-footer-reserve)!important','MIN_HEIGHT'],
  ['scroll-margin-bottom:calc(var(--a6-ux1-footer-reserve) + 12px)','FOCUS_RESERVE']
 ])check(has(css,token),code,token);
 check(/(?:^|[;{])\s*height\s*:\s*var\(--a6-ux1-footer-reserve\)!important/.test(String(css||'')),'HEIGHT_RESERVE_COUPLING','height must equal reserve');
 check(!has(css,'position:static!important'),'NO_STATIC_REGRESSION','static footer resurrected');
 check(!has(css,'height:auto!important'),'NO_AUTO_HEIGHT','fixed footer height must remain reserve-coupled');
 const body=(String(css||'').match(/body\{([^}]*)\}/)||[])[1]||'';
 check(!/display\s*:\s*flex/.test(body),'NO_BODY_FLEX','body flex-root');
 check(!/position\s*:\s*fixed/.test(body),'NO_BODY_FIXED','body fixed');
 check(!/overflow(?:-y)?\s*:\s*hidden/.test(body),'NO_ROOT_TRAP','body overflow hidden');
 for(const gate of ['v3/s4-a6-ux1-fixed-safe-footer-check.mjs','v3/s4-a6-ux1-fixed-safe-footer-saturation.mjs'])check(has(registry,gate),'NATIVE_GATE',gate);
 check(has(workflow,'pull_request:')&&has(workflow,'push:')&&has(workflow,'python -u v3/browser-s4-a6-ux1-fixed-safe-footer.py'),'EXACT_HEAD_WORKFLOW','browser command');
 check(has(workflow,'node v3/s4-a6-ux1-fixed-safe-footer-check.mjs')&&has(workflow,'node v3/s4-a6-ux1-fixed-safe-footer-saturation.mjs'),'WORKFLOW_E2','source/model commands');
 for(const token of ['getBoundingClientRect','bodyPaddingBottom','scrollPaddingBottom','fixed-persistent-non-overlap','reserve-coupling','reflow-1440-390-320','root-trap-negative'])check(has(browser,token),'BROWSER_ORACLE',token);
 return Object.freeze({ok:failures.length===0,failures});
}
