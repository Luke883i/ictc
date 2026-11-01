import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateUiuxConvergeContract, validateUiuxMiningV2Coverage, UIUX_MINING_V2_COVERAGE, CANONICAL_SURFACES } from './uiux-converge-0-model.mjs';
import { HOME_COMPLIANCE, ICTC_MANIFEST } from './public/ui/product-copy.js';
import { REGULATORY_PRIMERS } from './public/ui/regulatory-primers.js';
const read=path=>readFile(new URL(path,import.meta.url),'utf8');
const [contractRaw,closureRaw,entryRaw,tokens,icons,shell,frame,native,enterprise,closureCss,compositionCss,registry,index,contextJs]=await Promise.all([
  read('./uiux-converge-0-contract.json'),read('./capability-closure-e2-contract.json'),read('./uiux-prototype-entry-contract.json'),
  read('./public/design-tokens.css'),read('./public/ui/ui-icons.js'),read('./public/ui/stable-shell.js'),read('./public/ui/procedure-frame.js'),read('./public/ui/native-semantic-lattice-3-2.js'),
  read('./public/enterprise-workspace-3-2.css'),read('./public/semantic-workspace-closure-3-2-1.css'),read('./public/semantic-composition-3-1.css'),read('./current-gate-registry.mjs'),read('./public/index.html'),read('./public/ui/compliance-context.js')
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
  h.indexOf('id="homePriorities"')<h.indexOf('id="homeComplianceOverview"')&&
  sh.includes('renderHomePulse();renderHomeCompliance();renderHomeBoarding()')&&
  sh.includes('catalogue.filter(item=>item.enabled!==false)')&&
  sh.includes("const placeholder=item.kind==='placeholder'")&&
  sh.includes("placeholder?'Area prevista, non operativa.")&&
  sh.includes("esc(placeholder?'Contenuto futuro, senza funzione operativa.':item.description||'Descrizione non disponibile.')")&&
  sh.includes("if(!source)throw new Error('Regulatory example source unavailable: '")&&
  sh.includes('if(host.innerHTML!==html)host.innerHTML=html;')&&
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
  [shell,'if(host.innerHTML!==html)host.innerHTML=html;','host.innerHTML=html;',null,null],
  [shell,'class="home-compliance-route" data-service="proof"','class="home-compliance-route" data-service="home"',null,null],
  [enterprise,'#homeView .home-compliance-full-body{display:grid;gap:.75rem;padding-top:.6rem}','#otherView .home-compliance-full-body{display:grid;gap:.75rem;padding-top:.6rem}',null,null]
];
for(const [source,from,to] of narrativeMutants){
  assert.ok(source.includes(from),'stale Home mutation fixture: '+from);
  const changed=source.replace(from,to);
  assert.ok(!homeNarrativeOracle(source===index?changed:index,source===shell?changed:shell,source===enterprise?changed:enterprise),
    'Home semantic mutant survived: '+from);
}

assert.ok(index.includes('<h1 id="homeTitle">Cosa richiede una decisione</h1>')&&shell.includes("title.textContent='Cosa richiede una decisione'")&&shell.includes("homeFirstPlane='decision>worklist'")&&shell.includes("priorities.dataset.homeWorkQueue='3.2'")&&shell.includes("priorities.dataset.uiuxConverge='P1'"),'Home must be work-first and visible-cutover bounded');
assert.ok(shell.includes("uiIcon('arrow-up-right'")&&shell.includes("uiIcon('chevron-right'"),'Home directional actions must use icons');
assert.ok(frame.includes('data-uiux-layout="row"')&&frame.includes("host.dataset.uiuxLayout='rows'"),'Process Hub row contract missing');
assert.ok(frame.includes("uiIcon('chevron-left'")&&frame.includes("uiIcon('arrow-up-right'"),'Procedure icon affordances missing');
for(const name of ["'badge-check'","'circle-half'","'wrench'","'circle-slash'"])assert.ok(icons.includes(name),'typed maturity pictogram absent '+name);
for(const name of ["badge-check","circle-half","wrench","circle-slash"])assert.ok(frame.includes("icon:'"+name+"'"),'maturity model must retain distinct pictogram '+name);
assert.ok(frame.includes('role="img" aria-label="Maturità dichiarata:')&&frame.includes("uiIcon(meta.icon,'ui-icon maturity-icon')"),'icon-only badges require accessible text and a typed SVG');
assert.ok(!frame.includes("meta.color")&&!frame.includes("Indicativa: non certifica conformità né disponibilità."),'maturity legend must omit the redundant boundary sentence');
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
 if(!c.includes('<summary><span><b>Come si collegano i processi</b><small>Passaggi di lavoro tra fonti, rischi, azioni e verifiche.</small></span><span aria-hidden="true">›</span></summary>'))return false;
 if(!pcRule(s,'#processesView .processes-head{').includes('max-width:none!important;inline-size:100%;box-sizing:border-box;min-width:0'))return false;
 const badge=pcRule(s,':is(#procedureHub,.procedure-maturity-legend) .procedure-maturity{');
 if(['--maturity-bg','--maturity-border','--maturity-ink'].some(t=>!badge.includes('var('+t)))return false;
 for(const [id,hue] of pcStates){const rule=pcRule(s,'.procedure-maturity[data-maturity="'+id+'"]{');const bg=pcRgb((rule.match(/--maturity-bg:(#[0-9a-f]{6})/i)||[])[1]||''),fg=pcRgb((rule.match(/--maturity-ink:(#[0-9a-f]{6})/i)||[])[1]||'');if(!bg||!fg||pcHue(bg)!==hue||pcContrast(bg,fg)<4.5)return false;}
 const pair=pcRule(s,'#processesView :is(.compliance-process-lifecycle,.compliance-context)>summary{');
 if(['min-height:72px','font-size:var(--type-control,1rem)','padding:10px 12px','justify-content:space-between','border-radius:10px'].some(x=>!pair.includes(x)))return false;
 return s.includes('#processesView :is(.compliance-process-lifecycle,.compliance-context)>summary small{color:var(--color-muted);font-size:.78rem;font-weight:500;line-height:1.35}');
}
const pcHex=(h,s,l)=>{const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2,a=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return'#'+a.map(v=>Math.round((v+m)*255).toString(16).padStart(2,'0')).join('')};
const pcOps=[
 ['narrow-max',(a,i)=>a[2]=a[2].replace('max-width:none!important;inline-size:100%','max-width:'+(360+i*7)+'px!important;inline-size:100%')],
 ['narrow-percent',(a,i)=>a[2]=a[2].replace('inline-size:100%;box-sizing:border-box','inline-size:'+(50+i*.49).toFixed(2)+'%;box-sizing:border-box')],
 ['false-ready',(a,i)=>a[2]=a[2].replace('--maturity-bg:#e5f4ec','--maturity-bg:'+pcHex(340+i%20,.57,.85+i%10*.004))],
 ['false-partial',(a,i)=>a[2]=a[2].replace('--maturity-bg:#fff5cf','--maturity-bg:'+pcHex(200+i%60,.57,.85+i%10*.004))],
 ['false-construction',(a,i)=>a[2]=a[2].replace('--maturity-bg:#fff0e3','--maturity-bg:'+pcHex(110+i%65,.57,.85+i%10*.004))],
 ['false-placeholder',(a,i)=>a[2]=a[2].replace('--maturity-bg:#edf0f3','--maturity-bg:'+pcHex(195+i%90,.65,.85+i%10*.004))],
 ['overclaim',(a,i)=>a[0]=a[0].replace("ready:Object.freeze({label:'Pronto',icon:'badge-check'","ready:Object.freeze({label:'Pronto certificato livello "+(i+1)+"',icon:'circle-slash'")],
 ['wrong-count',(a,i)=>a[1]=a[1].replace('Come si collegano i processi</b>','Come si collegano i '+(i+1)+' processi</b>')],
 ['false-description',(a,i)=>a[1]=a[1].replace('Passaggi di lavoro tra fonti, rischi, azioni e verifiche.','Conformità automatica su '+(i+1)+' cicli certificati.')],
 ['short-summary',(a,i)=>a[2]=a[2].replace('min-height:72px;display:flex;align-items:center;justify-content:space-between','min-height:'+(30+i*.39).toFixed(2)+'px;display:flex;align-items:center;justify-content:space-between')]
];
const pcBaseline=[frame,contextJs,closureCss],pcSeed=0x1c7c2026;assert.ok(pcOracle(...pcBaseline),'Processes landing must meet the source-level DoD');
const pcCounts=Array(10).fill(0);let pcKilled=0;
for(let trial=0;trial<1000;trial++){const k=(trial*7+pcSeed%10)%10,index=Math.floor(trial/10),mutant=[...pcBaseline];pcOps[k][1](mutant,index);pcCounts[k]++;
 assert.ok(mutant.some((v,i)=>v!==pcBaseline[i]),'Inert source mutation: '+pcOps[k][0]+':'+index);
 assert.ok(!pcOracle(...mutant),'Surviving source mutation: '+pcOps[k][0]+':'+index);pcKilled++;
}
assert.equal(pcKilled,1000);assert.deepEqual(pcCounts,Array(10).fill(100));

console.log(JSON.stringify({ok:true,profile:'UIUX-CONVERGE-0/P1',surfaces:13,procedures:7,homePriorityMax:3,homeTitleOwner:'local-owner-visible-cutover',controlMinPx:44,processHub:'local-owner-row-list',icons:'inline-lucide-compatible-svg',latePresentationOverridesRetired:['Home','Process Hub','Procedure Frame','Proof'],businessRuntimeChanged:false,miningIssuesCovered:352,miningMechanisms:11,sliceTerminal:true,reconciledBy:'GOV-TRAMA-RECONCILE-1'}));
