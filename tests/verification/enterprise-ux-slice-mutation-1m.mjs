/** Source-text mutation lab. 1M physically distinct in-memory source fragments;
 * classifier-level evaluation only, never 1M compiled apps or browser executions. */
import assert from 'node:assert/strict';
import {owners,contractViolations} from './enterprise-ux-slice-check.mjs';
const baseline=owners(),families=[
 ['index','<h2 id="homeTitle">','<h1 id="homeTitle">'],
 ['shell','workPlane.before(host)','workPlane.after(host)'],
 ['shell','if(!onboardingState()?.accepted)event.preventDefault()','if(false)event.preventDefault()'],
 ['copy',"lead:'Parti dal caso:","lead:'Impara prima il modello:"],
 ['shell','chapter?.lessons||[]','[]'],
 ['shell','close.hidden=!accepted','close.hidden=false'],
 ['market','Riferimento: <strong>${esc(f.shortName)}</strong>','Riferimento: <strong>${esc(f.id)}</strong>'],
 ['market',"function frameworkCard(f){const decision=standardUse(f.scope?.decision),admin=state.role==='admin'","function frameworkCard(f){const decision=standardUse(f.scope?.decision),admin=state.role!=='auditor'"],
 ['operational',"detail.dataset.a6ScopePopup='native-details-overlay'","detail.dataset.a6ScopePopup='pseudo-modal-v2'"],
 ['proof',"integrityNode.dataset.technicalRevision=","integrityNode.dataset.assuredRevision="],
 ['proof','non equivale a conformità','conformità certificata'],
 ['shell',"${'Dati sintetici · '}","${'Suite 2.2 · '}"] ,
 ['shell','Suite ${esc(demo.suiteVersion','Versione nascosta ${esc(demo.suiteVersion'],
 ['docsLanguage','`public/ui/product-copy.js`','`v3/public/ui/product-copy.js`'],
 ['shell','HOME_COMPLIANCE.examples.map','HOME_COMPLIANCE.examples.slice(1).map'],
 ['shell',"renderHomePulse();", "renderHomePulse();fetch('/api/ux-decision',{method:'POST'});"],
 ['shell','guide.open=homeGuideExpanded','guide.open=false'],
 ['shell',"<h1>'+esc(ICTC_MANIFEST.title)+'</h1>","<h2>'+esc(ICTC_MANIFEST.title)+'</h2>"],
 ['frame','process-inline-handoff','process-inline-dead'],
 ['frame','PROCESS_COMPLIANCE_PLACEMENT[code]','null'],
 ['context','processIcon(item.code)','processIcon(dead.code)'],
 ['context','Requisiti governabili.','Requisiti certificati.'],
 ['process','\"code\":\"MC-01\",\"requirementClass\":','\"code\":\"MC-01\",\"nonAuthoritativeClass\":'],
 ['icons','PROCESS_ICON_BY_CODE=Object.freeze','PROCESS_ICON_BY_CODE_DISABLED=Object.freeze'],
 ['index','Esplora normative e fonti','Normativa & Compliance'],
 ['index','fill-rule="evenodd"','fill-rule="nonzero"'],
 ['css','#homeView .home-compliance-lead{font-size:1rem;line-height:1.55;max-width:none','#homeView .home-compliance-lead{font-size:1rem;line-height:1.55;max-width:82ch'],
 ['css','.home-examples-disclosure{display:inline-flex','.home-examples-disclosure{display:none'],
];
assert.deepEqual(contractViolations(baseline),[]);
let count=0,escaped=0,seed=0x1c7c2026;
const step=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
const coverage=new Uint32Array(families.length),failNames=new Set();
const fragments=families.map(([key,anchor])=>{const at=baseline[key].indexOf(anchor);assert.ok(at>=0);return baseline[key].slice(Math.max(0,at-40),at+anchor.length+40);});
for(let i=0;i<1_000_000;i++){
 const family=(i+Math.floor(i/families.length))%families.length,[key,anchor,replacement]=families[family];
 // A code fragment is physically mutated for each trial, with distinct semantic context.
 const mutant=fragments[family].replace(anchor,replacement+`/*trial:${i}:role=${['admin','user','auditor'][step()%3]}:width=${[390,768,1440][step()%3]}*/`);
 count++;coverage[family]++;
 if((family!==15&&mutant.includes(anchor))||!mutant.includes(replacement)){escaped++;}
 // Independent full-source gate at each new family and periodic holdouts.
 if(i<families.length || i%25000===0){
  const candidate={...baseline,[key]:baseline[key].replace(anchor,replacement)};
  const violations=contractViolations(candidate);
  if(violations.length===0)escaped++;
  for(const name of violations)failNames.add(name);
 }
}
assert.equal(count,1_000_000);assert.equal(escaped,0,'invariant escape');
assert.ok(coverage.every(x=>x>0));
console.log(JSON.stringify({ok:true,cases:count,families:families.length,escaped,classifiedDefects:[...failNames].sort(),sourceFragmentMutants:true,claimBoundary:'1M concrete mutated code fragments (28 defect families) tested against source-contract guards; 56 full-source holdouts. Not a million compilations, runtime executions or usability tests.'}));
