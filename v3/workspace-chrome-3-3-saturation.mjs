import { readFile } from 'node:fs/promises';
const read=path=>readFile(new URL(path,import.meta.url),'utf8');
const [tokens,chrome,shell,native,current,design]=await Promise.all([
  read('./public/design-tokens.css'),read('./public/workspace-chrome-3-3.css'),read('./public/ui/stable-shell.js'),read('./public/ui/native-workspace-3-2.js'),read('./current-semantic-3-2.mjs'),read('../docs/21_DESIGN_SYSTEM.md')
]);
const baseline=Object.freeze({tokens,chrome,shell,native,current,design});
const tokenNames=['--chrome-header-start','--chrome-header-mid','--chrome-header-end','--chrome-footer-start','--chrome-footer-end','--chrome-on-dark','--chrome-control-bg','--chrome-control-border','--chrome-active-bg','--chrome-active-text','--chrome-focus'];
const count=(text,needle)=>text.split(needle).length-1;
const checks=Object.freeze([
  ...tokenNames.map(token=>({id:`token:${token}`,test:s=>count(s.tokens,token)===1})),
  {id:'font-stack',test:s=>s.tokens.includes('--font-sans:"Inter Variable","Inter",ui-sans-serif,system-ui')},
  {id:'scope-3.3',test:s=>s.chrome.includes('data-workspace-chrome="3.3"')},
  {id:'header-token-consumption',test:s=>['var(--chrome-header-start)','var(--chrome-header-mid)','var(--chrome-header-end)'].every(x=>s.chrome.includes(x))},
  {id:'footer-token-consumption',test:s=>['var(--chrome-footer-start)','var(--chrome-footer-end)'].every(x=>s.chrome.includes(x))},
  {id:'target-44',test:s=>s.chrome.includes('min-height:44px!important')},
  {id:'responsive-900',test:s=>s.chrome.includes('@media(max-width:900px)')},
  {id:'responsive-640',test:s=>s.chrome.includes('@media(max-width:640px)')},
  {id:'forced-colors',test:s=>s.chrome.includes('@media(forced-colors:active)')},
  {id:'reduced-motion',test:s=>s.chrome.includes('@media(prefers-reduced-motion:reduce)')},
  {id:'active-state',test:s=>s.chrome.includes('[aria-current="page"]')&&s.chrome.includes('var(--chrome-active-bg)')&&s.chrome.includes('var(--chrome-active-text)')},
  {id:'focus-visible',test:s=>s.chrome.includes(':focus-visible')&&s.chrome.includes('var(--chrome-focus)')},
  {id:'shell-version',test:s=>s.shell.includes("WORKSPACE_CHROME_VERSION='3.3'")},
  {id:'terms-authority',test:s=>s.shell.includes("TERMS_URL='https://github.com/Luke883i/ictc/blob/main/docs/OPEN_SOURCE_TERMS.md'")&&!s.shell.includes('href="/terms.html"')},
  {id:'terms-safety',test:s=>s.shell.includes('target="_blank" rel="noopener noreferrer">Condizioni</a>')},
  {id:'owner-bootstrap',test:s=>s.native.includes("ensureStyle('/workspace-chrome-3-3.css','data-workspace-chrome-33')")},
  {id:'current-rail',test:s=>s.current.includes("'v3/workspace-chrome-3-3-saturation.mjs'")},
  {id:'design-contract',test:s=>s.design.includes('Workspace Chrome Design System 3.3')&&s.design.includes('10.000/10.000')},
  {id:'bounded-scope',test:s=>!/#homeView|#processesView|#proofView|#epistemicView|#adminCenter|#grcWorkspace/.test(s.chrome)}
]);
const violations=s=>checks.filter(check=>!check.test(s)).map(check=>check.id);
const issues=violations(baseline);
if(issues.length){console.error(JSON.stringify({ok:false,suite:'workspace-chrome-3.3',phase:'baseline',issues},null,2));process.exit(1);}
const replace=(text,from,to,trial)=>{const next=text.replace(from,to);if(next===text)throw new Error(`ineffective mutation ${String(from)} @${trial}`);return `${next}\n/* mutation-trial:${trial} */\n`;};
const operators=Object.freeze([
  {id:'drop-header-token',source:'tokens',mutate:(v,i)=>replace(v,/--chrome-header-start:[^;]+;/,'',i)},
  {id:'drop-footer-token',source:'tokens',mutate:(v,i)=>replace(v,/--chrome-footer-start:[^;]+;/,'',i)},
  {id:'font-fallback-drift',source:'tokens',mutate:(v,i)=>replace(v,'"Inter Variable","Inter",ui-sans-serif,system-ui','Arial,sans-serif',i)},
  {id:'scope-version-drift',source:'chrome',mutate:(v,i)=>replace(v,/data-workspace-chrome="3\.3"/g,`data-workspace-chrome="3.${4+(i%5)}"`,i)},
  {id:'header-literal-regression',source:'chrome',mutate:(v,i)=>replace(v,'var(--chrome-header-start)',`rgb(${10+i%20} 20 40)`,i)},
  {id:'footer-literal-regression',source:'chrome',mutate:(v,i)=>replace(v,'var(--chrome-footer-start)',`rgb(8 18 ${30+i%20})`,i)},
  {id:'target-shrink',source:'chrome',mutate:(v,i)=>replace(v,'min-height:44px!important',`min-height:${32+(i%12)}px!important`,i)},
  {id:'responsive-900-loss',source:'chrome',mutate:(v,i)=>replace(v,'@media(max-width:900px)',`@media(max-width:${901+i%20}px)`,i)},
  {id:'responsive-640-loss',source:'chrome',mutate:(v,i)=>replace(v,'@media(max-width:640px)',`@media(max-width:${641+i%20}px)`,i)},
  {id:'forced-colors-loss',source:'chrome',mutate:(v,i)=>replace(v,'@media(forced-colors:active)',`@media(forced-colors:${i%2?'none':'inactive'})`,i)},
  {id:'reduced-motion-loss',source:'chrome',mutate:(v,i)=>replace(v,'@media(prefers-reduced-motion:reduce)',`@media(prefers-reduced-motion:no-preference)`,i)},
  {id:'active-state-loss',source:'chrome',mutate:(v,i)=>replace(v,'[aria-current="page"]',`[data-dead-active="${i}"]`,i)},
  {id:'focus-loss',source:'chrome',mutate:(v,i)=>replace(v,/:focus-visible/g,`:focus-within`,i)},
  {id:'shell-version-drift',source:'shell',mutate:(v,i)=>replace(v,"WORKSPACE_CHROME_VERSION='3.3'",`WORKSPACE_CHROME_VERSION='3.${2-(i%2)}'`,i)},
  {id:'terms-local-regression',source:'shell',mutate:(v,i)=>replace(v,"TERMS_URL='https://github.com/Luke883i/ictc/blob/main/docs/OPEN_SOURCE_TERMS.md'",`TERMS_URL='/terms.html?m=${i}'`,i)},
  {id:'terms-rel-loss',source:'shell',mutate:(v,i)=>replace(v,'target="_blank" rel="noopener noreferrer">Condizioni</a>',`target="_self">Condizioni</a>`,i)},
  {id:'bootstrap-loss',source:'native',mutate:(v,i)=>replace(v,"ensureStyle('/workspace-chrome-3-3.css','data-workspace-chrome-33')",`ensureStyle('/workspace-chrome-disabled-${i}.css','data-workspace-chrome-dead')`,i)},
  {id:'rail-loss',source:'current',mutate:(v,i)=>replace(v,"'v3/workspace-chrome-3-3-saturation.mjs'",`'v3/workspace-chrome-dead-${i}.mjs'`,i)},
  {id:'design-contract-drift',source:'design',mutate:(v,i)=>replace(v,'10.000/10.000',`${9999-(i%20)}/10.000`,i)},
  {id:'scope-leak',source:'chrome',mutate:(v,i)=>`${v}\n#homeView[data-mutant="${i}"]{outline:0}\n`}
]);
const TRIALS=10_000,counts=Object.fromEntries(operators.map(op=>[op.id,0]));let killed=0,lastNovelAt=-1;const seen=new Set();const survivors=[];
for(let i=0;i<TRIALS;i+=1){const op=operators[i%operators.length],mutant={...baseline};mutant[op.source]=op.mutate(baseline[op.source],i);counts[op.id]+=1;if(!seen.has(op.id)){seen.add(op.id);lastNovelAt=i;}const detected=violations(mutant);if(detected.length)killed+=1;else survivors.push({trial:i,operator:op.id});}
const familyCounts=Object.values(counts),distributionOk=familyCounts.every(value=>value===TRIALS/operators.length),noNovelAfter=TRIALS-lastNovelAt-1;
if(killed!==TRIALS||survivors.length||seen.size!==operators.length||!distributionOk){console.error(JSON.stringify({ok:false,suite:'workspace-chrome-3.3',phase:'mutation',trials:TRIALS,killed,survivors:survivors.slice(0,20),familyCoverage:`${seen.size}/${operators.length}`,counts},null,2));process.exit(1);}
console.log(JSON.stringify({ok:true,suite:'workspace-chrome-3.3',sourceStringMutationExecutions:TRIALS,killed,killRate:1,declaredFailureFamilies:operators.length,familyCoverage:`${seen.size}/${operators.length}`,perFamily:TRIALS/operators.length,lastNovelAt,noNovelAfter,counts,scope:'global header/footer visual contract only',claimBoundary:'Deterministic source-string mutation executions against the declared static contract; not browser sessions, human preference studies, WCAG certification, legal review or deployment assurance.'}));
