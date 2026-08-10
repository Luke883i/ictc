import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const [styles,refinedCss,refinedJs,active,copy,shell,tools,browser]=await Promise.all([
  read('./public/styles.css'),read('./public/refined-product.css'),read('./public/ui/refined-product.js'),read('./public/ui/active-experience.js'),read('./public/ui/product-copy.js'),read('./public/ui/stable-shell.js'),read('./public/ui/global-tools.js'),read('./browser-v1-9-experience.py')
]);
const failures=[];const requireToken=(source,token,label=token)=>{if(!source.includes(token))failures.push(label);};
const marketIndex=styles.indexOf("@import url('./market-1-2.css');"),experienceIndex=styles.indexOf("@import url('./experience-1-9.css');"),refinedIndex=styles.indexOf("@import url('./refined-product.css');");
if(marketIndex<0)failures.push('market-css-not-canonical');if(experienceIndex<0)failures.push('experience-css-missing');if(refinedIndex<0)failures.push('refined-css-missing');if(!(marketIndex<experienceIndex&&experienceIndex<refinedIndex))failures.push('canonical-css-order');
for(const token of ['html:has(dialog[open])','dialog[open]{overflow:hidden','min-height:0!important','card-actions button:not(.primary)','refined-incident-intake','refined-question-why','--refined-control-min:44px'])requireToken(refinedCss,token,`refined-css:${token}`);
for(const token of ['link[data-market-12]','neutralizeDynamicMarketCss','refineIncidentIntake','refineQuestion','refineProofSurface'])requireToken(refinedJs,token,`refined-js:${token}`);
for(const token of ['installRefinedProduct','installProcedureFrame'])requireToken(active,token,`active:${token}`);
for(const token of ['Postura Standard & Security ICTC','proofCompact'])requireToken(copy,token,`copy:${token}`);
for(const token of ['SURFACE_LABELS.home','SURFACE_LABELS.processes','SURFACE_LABELS.proof'])requireToken(shell,token,`shell:${token}`);
for(const token of ['SURFACE_LABELS.proof','function allowedRecent(item){return rows().some','navigator.platform'])requireToken(tools,token,`tools:${token}`);
for(const token of ['one_scroll_owner','painted','incident-intake','Postura Standard & Security ICTC'])requireToken(browser,token,`browser:${token}`);
assert.deepEqual(failures,[],`refined product invariant drift: ${failures.join(', ')}`);
console.log(JSON.stringify({ok:true,authority:'refined-product-static-contract',cssOrder:{marketIndex,experienceIndex,refinedIndex},invariants:31}));
