import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateUiuxConvergeContract, validateUiuxMiningV2Coverage, UIUX_MINING_V2_COVERAGE, CANONICAL_SURFACES } from '../../src/lib/uiux-converge-0-model.mjs';
import { HOME_COMPLIANCE, ICTC_MANIFEST } from '../../public/ui/product-copy.js';
import { REGULATORY_PRIMERS } from '../../public/ui/regulatory-primers.js';
const read=path=>readFile(new URL(path,import.meta.url),'utf8');
const [contractRaw,closureRaw,entryRaw,tokens,icons,shell,frame,native,enterprise,closureCss,compositionCss,registry,index,contextJs]=await Promise.all([
  read('../contracts/uiux-converge-0-contract.json'),read('../contracts/capability-closure-e2-contract.json'),read('../contracts/uiux-prototype-entry-contract.json'),
  read('../../public/design-tokens.css'),read('../../public/ui/ui-icons.js'),read('../../public/ui/stable-shell.js'),read('../../public/ui/procedure-frame.js'),read('../../public/ui/native-semantic-lattice-3-2.js'),
  read('../../public/enterprise-workspace-3-2.css'),read('../../public/semantic-workspace-closure-3-2-1.css'),read('../../public/semantic-composition-3-1.css'),read('../../scripts/current-gate-registry.mjs'),read('../../public/index.html'),read('../../public/ui/compliance-context.js')
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
/* Post-278: source-level Home-and-Process convergence; presentation before work,
   no duplicated catalogue and no additional write authority. */
const currentNarrativeOracle=(h,sh,style,fr=frame,context=contextJs)=>
  h.indexOf('id="homeComplianceOverview"')>=0&&
  h.indexOf('id="homeComplianceOverview"')<h.indexOf('class="home-hero"')&&
  h.includes('<h2 id="homeTitle">Cosa richiede una decisione</h2>')&&
  sh.includes('renderHomePulse();renderHomeCompliance();renderHomeBoarding()')&&
  sh.includes('workPlane.before(host)')&&
  sh.includes("homeFirstPlane='value>guide>worklist'")&&
  sh.includes('guide.open=homeGuideExpanded')&&
  !sh.includes('data-home-case-first')&&sh.includes('home-examples-disclosure')&&
  sh.includes("<h1>'+esc(ICTC_MANIFEST.title)+'</h1>")&&
  !sh.includes('data-home-procedure-catalogue')&&
  sh.includes("if(!source)throw new Error('Regulatory example source unavailable: '")&&
  sh.includes('lastHomeComplianceHtml=html;')&&
  sh.includes('class="home-compliance-route secondary" data-service="proof"')&&
  fr.includes('PROCESS_COMPLIANCE_PLACEMENT[code]')&&
  fr.includes('process-inline-handoff')&&
  fr.includes('view.querySelector(selector)?.remove()')&&
  style.includes('#homeView .home-compliance-full-body{display:grid;gap:.45rem;padding-top:.15rem}')&&
  style.includes('#homeView .home-compliance-lead{font-size:1rem;line-height:1.55;max-width:none;min-width:0;white-space:normal');
assert.ok(currentNarrativeOracle(index,shell,enterprise),'Home and Process canonical presentation contract broken');
const narrativeMutants=[
 [index,'id="homeComplianceOverview"','id="homeComplianceRetired"'],
 [index,'<h2 id="homeTitle">','<h1 id="homeTitle">'],
 [shell,'renderHomePulse();renderHomeCompliance();renderHomeBoarding()','renderHomePulse();renderHomeBoarding()'],
 [shell,'workPlane.before(host)','workPlane.after(host)'],
 [shell,"homeFirstPlane='value>guide>worklist'","homeFirstPlane='decision>worklist'"],
 [shell,'guide.open=homeGuideExpanded','guide.open=false'],
 [shell,'home-examples-disclosure','home-examples-retired'],
 [shell,"<h1>'+esc(ICTC_MANIFEST.title)+'</h1>","<h2>'+esc(ICTC_MANIFEST.title)+'</h2>"],
 [shell,"if(!source)throw new Error('Regulatory example source unavailable: '","if(false)throw new Error('Regulatory example source unavailable: '"],
 [shell,'class="home-compliance-route secondary" data-service="proof"','class="home-compliance-route secondary" data-service="home"'],
 [frame,'PROCESS_COMPLIANCE_PLACEMENT[code]','null'],
 [frame,'process-inline-handoff','process-inline-disabled'],
 [frame,'view.querySelector(selector)?.remove()','void selector'],
 [enterprise,'#homeView .home-compliance-full-body{display:grid;gap:.45rem;padding-top:.15rem}','#homeView .home-compliance-full-body{display:grid;gap:2rem;padding-top:2rem}'],
];
for(const [preimage,from,to] of narrativeMutants){
  assert.ok(preimage.includes(from),'stale narrative mutation fixture: '+from);
  const candidate=preimage.replace(from,to);
  assert.ok(!currentNarrativeOracle(preimage===index?candidate:index,preimage===shell?candidate:shell,preimage===enterprise?candidate:enterprise,preimage===frame?candidate:frame,preimage===contextJs?candidate:contextJs),'semantic mutant survived: '+from);
}
assert.ok(index.includes('<h2 id="homeTitle">Cosa richiede una decisione</h2>')&&shell.includes("title.textContent='Cosa richiede una decisione'")&&shell.includes("homeFirstPlane='value>guide>worklist'")&&shell.includes("priorities.dataset.homeWorkQueue='3.2'")&&shell.includes("priorities.dataset.uiuxConverge='P1'"),'Home priority work queue must remain bounded below the value narrative');
assert.ok(shell.includes("uiIcon('arrow-up-right'")&&shell.includes("uiIcon('chevron-right'"),'Home directional actions must use icons');
assert.ok(frame.includes('data-uiux-layout="row"')&&frame.includes("host.dataset.uiuxLayout='rows'"),'Process Hub row contract missing');
assert.ok(frame.includes("uiIcon('chevron-left'")&&frame.includes("uiIcon('arrow-up-right'"),'Procedure icon affordances missing');
for(const name of ["'badge-check'","'circle-half'","'wrench'","'circle-slash'"])assert.ok(icons.includes(name),'typed maturity pictogram absent '+name);
for(const name of ["badge-check","circle-half","wrench","circle-slash"])assert.ok(frame.includes("icon:'"+name+"'"),'maturity model must retain distinct pictogram '+name);
assert.ok(frame.includes('role="img" aria-label="Maturità dichiarata:')&&frame.includes("uiIcon(meta.icon,'ui-icon maturity-icon')"),'icon-only badges require accessible text and a typed SVG');
assert.ok(!frame.includes("meta.color")&&!frame.includes("Indicativa: non certifica conformità né disponibilità."),'maturity legend must omit the redundant boundary sentence');
assert.ok(closureCss.includes('#procedureHub{grid-auto-rows:auto!important;align-items:start!important}')&&closureCss.includes('grid-template-columns:6rem minmax(0,1fr) 2.6rem 12rem!important;')&&frame.includes('</footer>${process?')&&frame.includes('data-process-secondary-detail')&&!closureCss.includes(':has(.process-inline-detail[open])'),'compact independent rows and native secondary detail must have one owner');
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
const gates=['tests/verification/capability-closure-e2-check.mjs','tests/verification/capability-closure-e2-saturation.mjs','tests/verification/uiux-converge-0-check.mjs','tests/verification/uiux-converge-0-style-saturation.mjs','tests/verification/uiux-converge-0-e2e-saturation.mjs'];
for(const gate of gates)assert.ok(registry.includes(`'${gate}'`),`current registry missing ${gate}`);
assert.ok(registry.indexOf("'tests/verification/capability-closure-e2-check.mjs'")<registry.indexOf("'tests/verification/uiux-converge-0-check.mjs'"),'UIUX rail must remain downstream of capability closure');

/* PROCESSI-237: 1,000 real source-string mutations on three canonical UI owners, seed 0x1c7c2026. */
const pcRule=(src,needle)=>{const i=src.indexOf(needle);return i<0?'':src.slice(i,src.indexOf('}',i)+1)};
const pcRgb=hex=>/^#[a-f0-9]{6}$/i.test(hex)?[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)):null;
const pcLum=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
const pcHue=c=>{const a=c.map(v=>v/255),hi=Math.max(...a),lo=Math.min(...a),d=hi-lo;if(d<.045)return'grey';let h=hi===a[0]?((a[1]-a[2])/d)%6:hi===a[1]?(a[2]-a[0])/d+2:(a[0]-a[1])/d+4;h=(h*60+360)%360;return h>=95&&h<=175?'green':h>=39&&h<=67?'yellow':h>=15&&h<39?'orange':'other'};
const pcContrast=(a,b)=>{const x=pcLum(a),y=pcLum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const pcStates=[['ready','green'],['scaffold-yellow','yellow'],['scaffold-orange','orange'],['placeholder','grey']];
function pcOracle(f,c,s){
 if(!f.includes('Maturità dichiarata:')||f.includes('Indicativa: non certifica conformità né disponibilità.'))return false;
 for(const x of ["ready:Object.freeze({label:'Pronto',icon:'badge-check'","'scaffold-yellow':Object.freeze({label:'Parziale',icon:'circle-half'","'scaffold-orange':Object.freeze({label:'In costruzione',icon:'wrench'","placeholder:Object.freeze({label:'Segnaposto',icon:'circle-slash'"])if(!f.includes(x))return false;
 if(!f.includes("placeholder?'Area prevista, non operativa.'")||!f.includes('aria-disabled="true"'))return false;
 if(!f.includes('PROCESS_COMPLIANCE_PLACEMENT[code]')||!f.includes('process-inline-handoff')||!f.includes('view.querySelector(selector)?.remove()')||f.includes('processCompliancePlacementHtml()'))return false;
 if(!pcRule(s,'#processesView .processes-head{').includes('max-width:none!important;inline-size:100%;box-sizing:border-box;min-width:0'))return false;
 const badge=pcRule(s,':is(#procedureHub,.procedure-maturity-legend) .procedure-maturity{');
 if(['--maturity-bg','--maturity-border','--maturity-ink'].some(t=>!badge.includes('var('+t)))return false;
 for(const [id,hue] of pcStates){const rule=pcRule(s,'.procedure-maturity[data-maturity="'+id+'"]{');const bg=pcRgb((rule.match(/--maturity-bg:(#[0-9a-f]{6})/i)||[])[1]||''),fg=pcRgb((rule.match(/--maturity-ink:(#[0-9a-f]{6})/i)||[])[1]||'');if(!bg||!fg||pcHue(bg)!==hue||pcContrast(bg,fg)<4.5)return false;}
 const pair=pcRule(s,'#processesView :is(.compliance-process-lifecycle,.compliance-context)>summary{');
 if(!f.includes('Handoff documentabili, non decisioni automatiche né certificazione di conformità.'))return false;
 return s.includes('#processesView :is(.compliance-process-lifecycle,.compliance-context)>summary small{color:var(--color-muted);font-size:.78rem;font-weight:500;line-height:1.35}');
}
const pcWrongColor=(r,g,b)=>'#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
const pcOps=[
 ['narrow-max',(a,i)=>a[2]=a[2].replace('max-width:none!important;inline-size:100%','max-width:'+(360+i*7)+'px!important;inline-size:100%')],
 ['narrow-percent',(a,i)=>a[2]=a[2].replace('inline-size:100%;box-sizing:border-box','inline-size:'+(50+i*.49).toFixed(2)+'%;box-sizing:border-box')],
 ['false-ready',(a,i)=>a[2]=a[2].replace('--maturity-bg:#e5f4ec','--maturity-bg:'+pcWrongColor(240+i%10,140+Math.floor(i/10)*4,170+i%10))],
 ['false-partial',(a,i)=>a[2]=a[2].replace('--maturity-bg:#fff5cf','--maturity-bg:'+pcWrongColor(145+i%10,175+Math.floor(i/10)*3,235+i%10))],
 ['false-construction',(a,i)=>a[2]=a[2].replace('--maturity-bg:#fff0e3','--maturity-bg:'+pcWrongColor(170+i%10,230+Math.floor(i/10)*2,165+i%10))],
 ['false-placeholder',(a,i)=>a[2]=a[2].replace('--maturity-bg:#edf0f3','--maturity-bg:'+pcWrongColor(190+i%10,185+Math.floor(i/10)*2,240+i%10))],
 ['overclaim',(a,i)=>a[0]=a[0].replace("ready:Object.freeze({label:'Pronto',icon:'badge-check'","ready:Object.freeze({label:'Pronto certificato livello "+(i+1)+"',icon:'circle-slash'")],
 ['wrong-count',(a,i)=>a[0]=a[0].replace('process-inline-handoff','process-inline-removed-'+i)],
 ['false-description',(a,i)=>a[0]=a[0].replace('Handoff documentabili, non decisioni automatiche né certificazione di conformità.','Conformità automatica su '+(i+1)+' cicli certificati.')],
 ['short-summary',(a,i)=>a[0]=a[0].replace('Handoff documentabili, non decisioni automatiche né certificazione di conformità.','Handoff certificano conformità '+i)]
];
const pcBaseline=[frame,contextJs,closureCss],pcSeed=0x1c7c2026;assert.ok(pcOracle(...pcBaseline),'Processes landing must meet the source-level DoD');
const pcCounts=Array(10).fill(0),pcSeen=new Set();let pcKilled=0;
for(let trial=0;trial<1000;trial++){const k=(trial*7+pcSeed%10)%10,index=Math.floor(trial/10),mutant=[...pcBaseline];pcOps[k][1](mutant,index);pcCounts[k]++;
 assert.ok(mutant.some((v,i)=>v!==pcBaseline[i]),'Inert source mutation: '+pcOps[k][0]+':'+index);
 assert.ok(!pcOracle(...mutant),'Surviving source mutation: '+pcOps[k][0]+':'+index);pcSeen.add(mutant.join('\u0000'));pcKilled++;
}
assert.equal(pcKilled,1000);assert.equal(pcSeen.size,1000,'Distinct source mutations');assert.deepEqual(pcCounts,Array(10).fill(100));

console.log(JSON.stringify({ok:true,profile:'UIUX-CONVERGE-0/P1',surfaces:13,procedures:7,homePriorityMax:3,homeTitleOwner:'local-owner-visible-cutover',controlMinPx:44,processHub:'local-owner-row-list',icons:'inline-lucide-compatible-svg',latePresentationOverridesRetired:['Home','Process Hub','Procedure Frame','Proof'],businessRuntimeChanged:false,miningIssuesCovered:352,miningMechanisms:11,sliceTerminal:true,reconciledBy:'GOV-TRAMA-RECONCILE-1'}));
