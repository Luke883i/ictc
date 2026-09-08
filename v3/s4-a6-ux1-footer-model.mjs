export const A6_UX1_CONTRACT=Object.freeze({
  slice:'S4-A6',
  executionUnit:'A6-UX1',
  finalImport:'./a6-ux1-fixed-safe-footer.css',
  viewports:Object.freeze([[1440,950],[390,844],[320,800]]),
  evidenceBoundary:'Automated source/model plus exact-head Chromium geometry; human assistive-technology/usability remains E4.'
});

const escapeRegExp=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const exactProp=(css,prop,value)=>new RegExp(`(?:^|[;{]\\s*)${escapeRegExp(prop)}\\s*:\s*${escapeRegExp(value)}(?:\\s*!important)?\\s*(?:;|})`,'m').test(css);
const has=(text,token)=>text.includes(token);

export function validateA6Ux1({css,styles,registry,workflow,browser,authority}){
  const failures=[];
  const check=(condition,code,detail)=>{if(!condition)failures.push({code,detail});};
  const imports=[...styles.matchAll(/@import\s+url\(['"]?([^)'"\s]+)['"]?\)/g)].map(m=>m[1]);
  check(imports.at(-1)===A6_UX1_CONTRACT.finalImport,'FINAL_IMPORT',imports.at(-1)||null);
  check(has(css,'--a6-ux1-footer-base:44px'),'DESKTOP_RESERVE','44px token missing');
  check(has(css,'--a6-ux1-footer-base:52px'),'MOBILE_RESERVE','52px token missing');
  check(has(css,'env(safe-area-inset-bottom,0px)'),'SAFE_AREA','safe-area coupling missing');
  check(exactProp(css,'scroll-padding-bottom','var(--a6-ux1-footer-reserve)'),'ROOT_SCROLL_PADDING','root scroll-padding contract missing');
  check(exactProp(css,'padding-bottom','var(--a6-ux1-footer-reserve)'),'BODY_RESERVE','body reserve contract missing');
  check(exactProp(css,'position','fixed'),'FIXED_POSITION','footer must be fixed');
  check(has(css,'inset:auto 0 0 0!important'),'BOTTOM_INSET','footer bottom inset missing');
  check(exactProp(css,'height','var(--a6-ux1-footer-reserve)'),'EXACT_HEIGHT','footer height must equal reserve');
  check(exactProp(css,'min-height','var(--a6-ux1-footer-reserve)'),'MIN_HEIGHT','footer minimum must equal reserve');
  check(!/(?:^|[;{]\s*)display\s*:\s*flex\s*(?:;|})/m.test(css.split('body{')[1]?.split('}')[0]||''),'NO_BODY_FLEX','A6 resolver must not create a body flex-root');
  check(!/(?:^|[;{]\s*)position\s*:\s*fixed\s*(?:;|})/m.test(css.split('body{')[1]?.split('}')[0]||''),'NO_BODY_FIXED','A6 resolver must not fix the body');
  check(!/(?:^|[;{]\s*)overflow(?:-y)?\s*:\s*hidden\s*(?:;|})/m.test(css.split('body{')[1]?.split('}')[0]||''),'NO_ROOT_TRAP','A6 resolver must not hide body overflow');
  for(const gate of ['v3/s4-a6-ux1-fixed-safe-footer-check.mjs','v3/s4-a6-ux1-fixed-safe-footer-saturation.mjs'])check(has(registry,gate),'NATIVE_GATE',gate);
  check(has(workflow,'pull_request:')&&has(workflow,'push:')&&has(workflow,'run: python -u v3/browser-s4-a6-ux1-fixed-safe-footer.py'),'EXACT_HEAD_WORKFLOW','dedicated exact-head browser command missing');
  check(has(workflow,'node v3/s4-a6-ux1-fixed-safe-footer-check.mjs')&&has(workflow,'node v3/s4-a6-ux1-fixed-safe-footer-saturation.mjs'),'WORKFLOW_E2','source/model gates missing from workflow');
  for(const token of ['getBoundingClientRect','position','bodyPaddingBottom','scrollPaddingBottom','native-focus-non-overlap','reflow-1440-390-320','root-trap-negative'])check(has(browser,token),'BROWSER_ORACLE',token);
  check(has(authority,'"baseAnchor"')&&has(authority,'"mainSha": "25b1dde1c6032f1057a7d63a449ab2bdb43a0299"'),'AUTHORITY_BASE','authority must bind exact PR base');
  check(has(authority,'"currentSubSlice": "A6-UX1"')&&has(authority,'"trajectoryImpact": "planned"'),'AUTHORITY_SLICE','planned A6-UX1 lineage missing');
  return Object.freeze({ok:failures.length===0,failures});
}
