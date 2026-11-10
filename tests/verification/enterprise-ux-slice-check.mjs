/** A bounded, owner-preserving UI convergence gate. Not an E3 human or browser oracle. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');
export const owners=()=>Object.fromEntries([
 ['shell','public/ui/stable-shell.js'],['copy','public/ui/product-copy.js'],
 ['index','public/index.html'],['market','public/ui/procedure-market-ux.js'],
 ['operational','public/ui/operational-surface-a6-ux3.js'],
 ['proof','public/ui/proof-surface.js'],
 ['docsLanguage','docs/03_ENDUSER_LANGUAGE.md'],['docsJourney','docs/04_USER_JOURNEYS.md']
].map(([key,path])=>[key,read(path)]));
export function contractViolations(x){
 const f=[];const need=(condition,code)=>{if(!condition)f.push(code)};
 need(x.index.includes('<h1 id="homeTitle">Cosa richiede una decisione</h1>'),'HOME_H1');
 need(x.shell.includes("workPlane.after(host)")&&x.shell.includes('data.homeFirstPlane')===false,'HOME_ORDER');
 need(x.shell.includes("example.dataset.homeCaseFirst='true'")&&x.shell.includes('HOME_COMPLIANCE.examples[0].case'),'HOME_CONCRETE_CASE');
 need(x.shell.includes('renderHomePulse()')&&x.shell.includes('renderHomeCompliance()'),'HOME_EXISTING_OWNER');
 need(x.copy.includes("lead:'Parti dal caso:")&&!x.copy.includes('Impara prima il modello:'),'ONBOARDING_CASE_FIRST');
 need(x.shell.includes('HOMEBOARDING.chain')&&x.shell.includes('HOMEBOARDING_LESSONS.map'),'ONBOARDING_LESSONS');
 need(x.shell.includes("if(!onboardingState()?.accepted)event.preventDefault()")&&x.shell.includes('close.hidden=!value.accepted'),'ONBOARDING_GATE');
 need(x.market.includes('Riferimento: <strong>${esc(f.shortName)}</strong>')&&x.market.includes("esc(f.edition||'edizione non indicata')"),'STANDARD_OBJECT');
 need(x.market.includes("function frameworkCard(f){const decision=standardUse(f.scope?.decision),admin=state.role==='admin'")&&x.market.includes('data-standard-scope="${esc(f.id)}"'),'STANDARD_WRITER_OWNER');
 need(x.operational.includes("detail.dataset.a6ScopePopup='native-details-overlay'") ,'STANDARD_BROWSER_COMPAT');
 need(x.proof.includes("integrityNode.textContent=integrity.ok?'Coerente tecnicamente'")&&x.proof.includes('integrityNode.dataset.technicalRevision='),'PROOF_REVISION_SEPARATION');
 need(x.proof.includes('non equivale a conformità'),'PROOF_BOUNDARY');
 need(x.shell.includes("${'Dati sintetici · '}")&&!x.shell.includes("'Suite 2.2 · ': 'Dati sintetici · '"),'DEMO_PRIMARY_NO_RELEASE');
 need(x.shell.includes('Suite ${esc(demo.suiteVersion'),'DEMO_PROVENANCE_RETAINED');
 need(!x.docsLanguage.includes('`v3/')&&!x.docsJourney.includes('`v3/'),'DOCS_CANONICAL_PATHS');
 need(!x.shell.includes("fetch('/api/")&&!x.shell.includes('method:\'POST\''),'SHELL_NO_WRITER');
 return f;
}
if(process.argv[1]&&new URL('file://'+process.argv[1]).pathname===new URL(import.meta.url).pathname){
 const f=contractViolations(owners());assert.deepEqual(f,[],`enterprise slice source contract: ${f.join(', ')}`);
 console.log(JSON.stringify({ok:true,sourceInvariants:16,gate:'owner preserving enterprise-UX slice',open:['native browser before/after','keyboard and assistive E3','enterprise human evidence','legacy retirement','all 109 issues'],claims:'source contract only'}));
}
