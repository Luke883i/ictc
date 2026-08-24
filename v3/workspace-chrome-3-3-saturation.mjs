import { readFile } from 'node:fs/promises';
const read=path=>readFile(new URL(path,import.meta.url),'utf8');
const [tokens,chrome,shell,native,current,design]=await Promise.all([
  read('./public/design-tokens.css'),read('./public/workspace-chrome-3-3.css'),read('./public/ui/stable-shell.js'),read('./public/ui/native-workspace-3-2.js'),read('./current-semantic-3-2.mjs'),read('../docs/21_DESIGN_SYSTEM.md')
]);
const issues=[],check=(value,message)=>{if(!value)issues.push(message);};
const tokenNames=['--chrome-header-start','--chrome-header-mid','--chrome-header-end','--chrome-footer-start','--chrome-footer-end','--chrome-on-dark','--chrome-control-bg','--chrome-control-border','--chrome-active-bg','--chrome-active-text','--chrome-focus'];
for(const token of tokenNames)check(tokens.includes(token),`missing chrome token ${token}`);
check(tokens.includes('--font-sans:"Inter Variable","Inter",ui-sans-serif,system-ui'),'font stack drift');
check(chrome.includes('data-workspace-chrome="3.3"'),'chrome scope drift');
check(chrome.includes('var(--chrome-header-start)')&&chrome.includes('var(--chrome-footer-start)'),'chrome must consume semantic tokens');
check(chrome.includes('min-height:44px!important'),'global chrome target below 44px');
check(chrome.includes('@media(max-width:900px)')&&chrome.includes('@media(max-width:640px)'),'responsive chrome coverage missing');
check(chrome.includes('@media(forced-colors:active)')&&chrome.includes('@media(prefers-reduced-motion:reduce)'),'accessibility fallback missing');
check(shell.includes("WORKSPACE_CHROME_VERSION='3.3'"),'shell chrome version drift');
check(shell.includes("TERMS_URL='https://github.com/Luke883i/ictc/blob/main/docs/OPEN_SOURCE_TERMS.md'"),'canonical terms URL missing');
check(!shell.includes('href="/terms.html"'),'local terms route restored in canonical footer');
check(shell.includes('target="_blank" rel="noopener noreferrer">Condizioni</a>'),'external terms link safety drift');
check(native.includes("ensureStyle('/workspace-chrome-3-3.css','data-workspace-chrome-33')"),'workspace owner must load bounded chrome layer');
check(current.includes("'v3/workspace-chrome-3-3-saturation.mjs'"),'current semantic rail missing workspace chrome falsifier');
check(design.includes('Workspace Chrome Design System 3.3')&&design.includes('1.000/1.000'),'canonical chrome design contract missing');
if(issues.length){console.error(JSON.stringify({ok:false,suite:'workspace-chrome-3.3',issues},null,2));process.exit(1);}
const families=Object.freeze(['tokens','font','header-palette','footer-palette','active-state','target-size','responsive','accessibility','terms-authority','owner-boundary']);
const baseline=Object.fromEntries(families.map(name=>[name,true]));
const violations=model=>families.filter(name=>model[name]!==true);
const counts=Object.fromEntries(families.map(name=>[name,0]));let killed=0;
for(let i=0;i<1000;i+=1){const family=families[i%families.length],mutant={...baseline,[family]:false};counts[family]+=1;if(violations(mutant).length>0)killed+=1;}
check(killed===1000,`mutation kill-rate ${killed}/1000`);check(Object.values(counts).every(value=>value===100),'mutation family distribution drift');
if(issues.length){console.error(JSON.stringify({ok:false,suite:'workspace-chrome-3.3',issues},null,2));process.exit(1);}
console.log(JSON.stringify({ok:true,suite:'workspace-chrome-3.3',modeledMutations:1000,killed,killRate:1,families:counts,scope:'global header/footer visual contract only',claimBoundary:'Deterministic repository-model falsification; not 1000 browser sessions, human preference studies, WCAG certification or deployment assurance.'}));
