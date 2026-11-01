import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateUiuxConvergeContract, validateUiuxMiningV2Coverage, UIUX_MINING_V2_COVERAGE, CANONICAL_SURFACES } from './uiux-converge-0-model.mjs';
import { HOME_COMPLIANCE, ICTC_MANIFEST } from './public/ui/product-copy.js';
import { REGULATORY_PRIMERS } from './public/ui/regulatory-primers.js';
const read=path=>readFile(new URL(path,import.meta.url),'utf8');
const [contractRaw,closureRaw,entryRaw,tokens,icons,shell,frame,native,enterprise,closureCss,compositionCss,registry,index]=await Promise.all([
  read('./uiux-converge-0-contract.json'),read('./capability-closure-e2-contract.json'),read('./uiux-prototype-entry-contract.json'),
  read('./public/design-tokens.css'),read('./public/ui/ui-icons.js'),read('./public/ui/stable-shell.js'),read('./public/ui/procedure-frame.js'),read('./public/ui/native-semantic-lattice-3-2.js'),
  read('./public/enterprise-workspace-3-2.css'),read('./public/semantic-workspace-closure-3-2-1.css'),read('./public/semantic-composition-3-1.css'),read('./current-gate-registry.mjs'),read('./public/index.html')
]);
const contract=JSON.parse(contractRaw),closure=JSON.parse(closureRaw),entry=JSON.parse(entryRaw),verdict=validateUiuxConvergeContract(contract);
assert.equal(verdict.ok,true,verdict.errors.join('\n'));const mining=validateUiuxMiningV2Coverage();assert.equal(mining.ok,true,mining.errors.join('\n'));assert.equal(mining.issueCount,352);assert.equal(UIUX_MINING_V2_COVERAGE.registerSha256,'43333a22d54533cad68aa398b093a8811cce9a9e1081aca194ec19e1145840e6');
assert.deepEqual(new Set(contract.surfaceProgram.map(x=>x.id)),new Set(CANONICAL_SURFACES));
assert.deepEqual(new Set(closure.surfaceUnits.map(x=>x.id)),new Set(CANONICAL_SURFACES));
assert.equal(entry.nextSerialSlice,'UIUX-CONVERGE-0');assert.equal(entry.capabilityClosure.rerunBeforeDone,true);assert.equal(contract.sliceTerminal,true);assert.equal(contract.reconciliation?.id,'GOV-TRAMA-RECONCILE-1');assert.ok(contract.reconciliation.externalBoundary.includes('E3-HUMAN'));
for(const token of ['--ui-control-h:44px','--ui-row-compact:52px','--ui-row-max:64px','--type-display:','--weight-description:400','--transition-interactive:'])assert.ok(tokens.includes(token),`design token missing ${token}`);
for(const icon of ["'arrow-up-right'","'chevron-left'","'chevron-right'","'info'"])assert.ok(icons.includes(icon),`icon primitive missing ${icon}`);
assert.ok(shell.includes(".slice(0,3)"),'Home queue must converge to max 3');

/* HOME-COMPLIANCE-1 — bound the business narrative to existing Home/copy/policy owners. */
assert.ok(ICTC_MANIFEST.title.includes('Rispettare le norme')&&ICTC_MANIFEST.title.includes('rischi e costi'),'Home value proposition must be obligation-first');
assert.deepEqual(HOME_COMPLIANCE.examples.map(item=>item.id),['GDPR','231/2001','NIS2','DORA']);
assert.equal(Object.keys(REGULATORY_PRIMERS).length,5,'no sixth global regulatory primer');
assert.equal(HOME_COMPLIANCE.questions.length,4);
assert.ok(HOME_COMPLIANCE.economics.includes('non calcola automaticamente'),'cost capability may not be asserted');
assert.ok(HOME_COMPLIANCE.boundary.includes('non certifica conformità')&&HOME_COMPLIANCE.boundary.includes('decisioni restano umane'));
for(const item of HOME_COMPLIANCE.examples){
  assert.ok(item.case.length>60&&item.paths.includes('-01'),'legal example needs a business question and existing process links');
  assert.ok(item.sourceUrl||REGULATORY_PRIMERS[item.id]?.sourceUrl,'legal example requires primary source');
}
assert.ok(HOME_COMPLIANCE.examples.find(x=>x.id==='231/2001')?.boundary.includes('non è un adempimento automaticamente obbligatorio'));
assert.ok(HOME_COMPLIANCE.examples.find(x=>x.id==='NIS2')?.nationalUrl.includes('24G00155'),'NIS2 Italy transposition reference absent');
const homeNarrativeOracle=(h,sh,style)=>(
  h.includes('id="homeComplianceOverview"')&&
  h.indexOf('id="homeComplianceOverview"')<h.indexOf('id="homePriorities"')&&
  sh.includes('renderHomePulse();renderHomeCompliance();renderHomeBoarding()')&&
  sh.includes('catalogue.filter(item=>item.enabled!==false)')&&
  sh.includes("const placeholder=item.kind==='placeholder'")&&
  sh.includes("placeholder?'Area prevista, non operativa.")&&
  sh.includes("esc(placeholder?'Contenuto futuro, senza funzione operativa.':item.description||'Descrizione non disponibile.')")&&
  sh.includes("if(!source)throw new Error('Regulatory example source unavailable: '")&&
  sh.includes('if(lastHomeComplianceHtml!==html||!host.querySelector')&&
  sh.includes('data-home-business-guide')&&
  sh.includes('class="home-compliance-route" data-service="proof"')&&
  style.includes('#homeView .home-compliance-overview')&&
  style.includes('.home-compliance-detail>summary')&&
  style.includes('@media(max-width:760px)')&&
  style.includes('#homeView .home-compliance-full-body{display:grid;gap:.75rem;padding-top:.6rem}')
);
assert.ok(homeNarrativeOracle(index,shell,enterprise),'Home narrative projection / local owner contract broken');
const narrativeMutants=[
  [index,'id="homeComplianceOverview"','id="otherHomeOverview"',null,null],
  [shell,'renderHomePulse();renderHomeCompliance();renderHomeBoarding()','renderHomePulse();renderHomeBoarding()',null,null],
  [shell,'catalogue.filter(item=>item.enabled!==false)','catalogue',null,null],
  [shell,"const placeholder=item.kind==='placeholder'","const placeholder=false",null,null],
  [shell,"placeholder?'Area prevista, non operativa.","placeholder?'",null,null],
  [shell,"esc(placeholder?'Contenuto futuro, senza funzione operativa.':item.description||'Descrizione non disponibile.')","item.description||'Descrizione non disponibile.'",null,null],
  [shell,"if(!source)throw new Error('Regulatory example source unavailable: '","if(false)throw new Error('Regulatory example source unavailable: '",null,null],
  [shell,'if(lastHomeComplianceHtml!==html||!host.querySelector','if(false||!host.querySelector',null,null],
  [shell,'class="home-compliance-route" data-service="proof"','class="home-compliance-route" data-service="home"',null,null],
  [enterprise,'#homeView .home-compliance-full-body{display:grid;gap:.75rem;padding-top:.6rem}','#otherView .home-compliance-full-body{display:grid;gap:.75rem;padding-top:.6rem}',null,null]
];
for(const [source,from,to] of narrativeMutants){
  assert.ok(source.includes(from),'stale Home mutation fixture: '+from);
  const changed=source.replace(from,to);
  assert.ok(!homeNarrativeOracle(source===index?changed:index,source===shell?changed:shell,source===enterprise?changed:enterprise),
    'Home semantic mutant survived: '+from);
}


/* HOME-ORDER-4: the Home explains the product before presenting the current work.
 * The retired decision card remains an inert compatibility target, never a visible badge.
 * Business targets continue to be owned by the server worklist and existing router.
 */
const homeOrderOracle=(h,sh,style)=>{
  const home=h.slice(h.indexOf('id="homeView"'),h.indexOf('id="processesView"'));
  const intro=home.indexOf('id="homeComplianceOverview"'),work=home.indexOf('class="home-hero"');
  return intro>=0&&work>intro&&
    home.includes('data-home-compat-only="true"')&&home.includes('hidden inert aria-hidden="true"')&&
    sh.includes('Priorità per processo')&&sh.includes("ensureComplianceContext(root,'home',{after:workPlane,compact:true})")&&
    sh.includes('lastHomeComplianceHtml=html;')&&sh.includes("const host=$('#homeComplianceOverview');if(!host)return;")&&
    style.includes('height:auto;max-height:none;min-height:0;display:grid;align-content:start;')&&
    style.includes('grid-template-columns:minmax(0,1fr);grid-template-areas:"intro" "priorities"!important')&&
    style.includes('padding-bottom:var(--a6-ux1-footer-reserve,44px)!important')&&
    style.includes('#homeView .home-intro{padding:.2rem .35rem!important;gap:.28rem!important}')&&
    style.includes('#homeView #homeTitle{font-size:clamp(1.35rem,2.2vw,1.8rem)!important');
};
assert.ok(homeOrderOracle(index,shell,enterprise),'Home semantic four-plane order or inert badge retirement broken');
for(const [preimage,from,to] of [
  [index,'id="homeComplianceOverview"','id="homeComplianceOld"'],
  [index,'data-home-compat-only="true"','data-home-compat-only="false"'],
  [index,'hidden inert aria-hidden="true"','data-visible="true"'],
  [shell,'Priorità per processo','Priorità generiche'],
  [shell,'lastHomeComplianceHtml=html;','lastHomeComplianceHtml=null;'],
  [shell,"const host=$('#homeComplianceOverview');if(!host)return;","const host=$('#homeComplianceOverview');if(!host||!state.data)return;"],
  [enterprise,'height:auto;max-height:none;min-height:0;display:grid;align-content:start;','height:100vh;max-height:100vh;min-height:0;display:grid;align-content:center;'],
  [enterprise,'grid-template-areas:"intro" "priorities"!important','grid-template-areas:"intro next" "priorities priorities"!important'],
  [enterprise,'padding-bottom:var(--a6-ux1-footer-reserve,44px)!important','padding-bottom:0!important']
]){
  assert.ok(preimage.includes(from),'stale Home-order mutant '+from);
  const candidate=preimage.replace(from,to);
  assert.ok(!homeOrderOracle(preimage===index?candidate:index,preimage===shell?candidate:shell,preimage===enterprise?candidate:enterprise),'Home-order mutant survived: '+from);
}

assert.ok(index.includes('<h1 id="homeTitle">Cosa richiede una decisione</h1>')&&shell.includes("title.textContent='Cosa richiede una decisione'")&&shell.includes("homeFirstPlane='decision>worklist'")&&shell.includes("priorities.dataset.homeWorkQueue='3.2'")&&shell.includes("priorities.dataset.uiuxConverge='P1'"),'Home must be work-first and visible-cutover bounded');
assert.ok(shell.includes("uiIcon('arrow-up-right'")&&shell.includes("uiIcon('chevron-right'"),'Home directional actions must use icons');
assert.ok(frame.includes('data-uiux-layout="row"')&&frame.includes("host.dataset.uiuxLayout='rows'"),'Process Hub row contract missing');
assert.ok(frame.includes("uiIcon('chevron-left'")&&frame.includes("uiIcon('arrow-up-right'"),'Procedure icon affordances missing');
for(const name of ["'badge-check'","'circle-half'","'wrench'","'circle-slash'"])assert.ok(icons.includes(name),'typed maturity pictogram absent '+name);
for(const name of ["badge-check","circle-half","wrench","circle-slash"])assert.ok(frame.includes("icon:'"+name+"'"),'maturity model must retain distinct pictogram '+name);
assert.ok(frame.includes('role="img" aria-label="Maturità dichiarata:')&&frame.includes("uiIcon(meta.icon,'ui-icon maturity-icon')"),'icon-only badges require accessible text and a typed SVG');
assert.ok(!frame.includes("meta.color")&&frame.includes("Indicativa: non certifica conformità né disponibilità."),'legend must not rely on four colour names or long explanations');
assert.ok(closureCss.includes('#procedureHub{grid-auto-rows:1fr!important}')&&closureCss.includes('grid-template-columns:4.4rem minmax(0,1fr) 2.6rem 12rem!important;'),'row height and small badge column must have one owner');
assert.ok(frame.includes('aria-disabled="true"')&&frame.includes('Non disponibile</span>')&&!frame.includes('In preparazione · nessuna azione operativa'),'placeholder should be an inert affordance, not a business button');
assert.ok(closureCss.includes('pointer-events:none;user-select:none;')&&closureCss.includes('min-height:44px;'),'disabled visual control must be inert and accessible in size');

assert.ok(frame.includes('procedure-context-detail')&&frame.includes('procedure-boundary')&&frame.includes('procedure-value'),'procedure visible boundary/progressive rationale contract missing');
for(const semanticNeedle of ['catalogueSummary:\'Fonti e cambiamenti da verificare','catalogueSummary:\'Azioni, responsabili, scadenze','catalogueSummary:\'Richieste, risposte versionate'])assert.ok(native.includes(semanticNeedle),`concise procedure copy missing ${semanticNeedle}`);
assert.ok(enterprise.includes('.home-priority-main{display:grid;grid-template-columns:4.2rem')&&enterprise.includes('transition:var(--transition-interactive)'),'Home local owner must own compact interaction rows');
assert.ok(closureCss.includes('#procedureHub .procedure-card[data-uiux-layout="row"]')&&closureCss.includes('grid-template-areas:"code title purpose action"'),'Process Hub local owner must own row grammar');
for(const target of ['#procedureHub .procedure-card .procedure-primary','.procedure-frame[data-procedure-header-contract="3.2.1"] .procedure-back','.procedure-frame[data-procedure-header-contract="3.2.1"] .procedure-context-detail>summary','.procedure-frame[data-procedure-header-contract="3.2.1"] .procedure-primary'])assert.ok(closureCss.includes(target),`critical target selector missing ${target}`);
assert.ok((closureCss.match(/min-height:44px/g)||[]).length>=5,'critical touched controls must preserve >=44px source contract');
assert.ok(!closureCss.includes('repeat(3,minmax(0,1fr))')&&!closureCss.includes('min-height:226px'),'retired equal-height card matrix must not remain in current Process Hub owner');
assert.ok(!compositionCss.includes('#homeView')&&!compositionCss.includes('#processesView')&&!compositionCss.includes('#proofView'),'shared composition layer must not retake Home/Processi/Proof local presentation');
assert.ok(!compositionCss.includes('#procedureHub{display')&&!compositionCss.includes('.procedure-frame-main'),'shared composition layer must not override Process Hub/procedure-frame geometry');
for(const source of [shell,frame]){assert.equal(source.includes('>→<'),false,'ASCII right arrow must not remain in canonical touched action source');assert.equal(source.includes('>←<'),false,'ASCII left arrow must not remain in canonical touched action source');assert.equal(source.includes('<i aria-hidden="true">→</i>'),false,'legacy arrow i-tag must not remain');}
assert.equal(frame.includes('/api/'),false,'Procedure frame convergence must not introduce business API routes');assert.equal(native.includes('/api/'),false,'Native lattice convergence must not introduce business API routes');const shellRoutes=[...shell.matchAll(/api\(['"](\/api\/[^'"]+)/g)].map(x=>x[1]);assert.deepEqual([...new Set(shellRoutes)],['/api/profile/onboarding'],'Shell may call only the existing store/audit onboarding profile route; no business write authority is introduced.');
const gates=['v3/capability-closure-e2-check.mjs','v3/capability-closure-e2-saturation.mjs','v3/uiux-converge-0-check.mjs','v3/uiux-converge-0-style-saturation.mjs','v3/uiux-converge-0-e2e-saturation.mjs'];
for(const gate of gates)assert.ok(registry.includes(`'${gate}'`),`current registry missing ${gate}`);
assert.ok(registry.indexOf("'v3/capability-closure-e2-check.mjs'")<registry.indexOf("'v3/uiux-converge-0-check.mjs'"),'UIUX rail must remain downstream of capability closure');
console.log(JSON.stringify({ok:true,profile:'UIUX-CONVERGE-0/P1',surfaces:13,procedures:7,homePriorityMax:3,homeTitleOwner:'local-owner-visible-cutover',controlMinPx:44,processHub:'local-owner-row-list',icons:'inline-lucide-compatible-svg',latePresentationOverridesRetired:['Home','Process Hub','Procedure Frame','Proof'],businessRuntimeChanged:false,miningIssuesCovered:352,miningMechanisms:11,sliceTerminal:true,reconciledBy:'GOV-TRAMA-RECONCILE-1'}));
