// CORA/TRAMA: owner-level source and function falsifiers, NOT external or browser assurance.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {visibleFrameworkIds} from '../../public/ui/procedure-market-ux.js';
const read=path=>readFileSync(new URL('../../'+path,import.meta.url),'utf8');
const library=Array.from({length:21},(_,i)=>({id:'ref-'+i,shortName:i===19?'Special GDPR':'REF-'+i,title:'Standard '+i,issuer:i%2?'EU':'Global',edition:'2026'}));
const all=new Set(library.map(x=>x.id));
assert.equal(visibleFrameworkIds(library).length,6);
assert.deepEqual(new Set(visibleFrameworkIds(library,'',true)),all);
assert.deepEqual(visibleFrameworkIds(library,'gdpr'),['ref-19']);
assert.deepEqual(visibleFrameworkIds(library,'no-match'),[]);
const market=read('public/ui/procedure-market-ux.js'),frame=read('public/ui/procedure-frame.js');
const ep=read('public/ui/epistemic-lattice.js'),grc=read('public/ui/grc-workspace-base.js');
const risk=read('public/ui/risk-action-fidelity.js'),scheduler=read('public/ui/rn-scheduler-dialog-1-4.js');
const proof=read('public/ui/proof-workspace-3-2.js'),labels=read('public/ui/business-language-polish.js');
const css=read('public/market-1-2.css'),mobile=read('public/enterprise-1-8.css');
function has(text,needle){assert.ok(text.includes(needle),'Missing owner invariant: '+needle);}
for(const term of ['data-market-show-all','data-market-framework-count','frameworkExpanded=!frameworkExpanded','frameworkQuery=event.target.value','library.before(mapping)'])has(market,term);
for(const term of ['.market-mapping-panel','mapping.open=true','focusTarget.focus'])has(frame,term);
has(css,'[data-framework-card][hidden]{display:none!important}');
has(ep,"mode==='explore'&&level==='atom'?scopedAtoms():baseFilteredAtoms()");
has(ep,'Stai vedendo un sottografo locale');
has(ep,'Identificatori e provenienza tecnica');
has(proof,'ensureFirstReadTask(content,factStrip)');
has(labels,"primary.textContent='Collega requisito e controlli'");
has(labels,"primary.textContent='Crea richiesta di verifica'");
has(labels,"primary.textContent='Registra oggetto candidato'");
assert.doesNotMatch(grc,/const risk=event\.target\.closest\('\[data-risk-review\]'\)/);
has(risk,"const native=event.target.closest('[data-risk-review]')");
has(scheduler,"aria-labelledby','jobDialogTitle'");
has(mobile,'max-height:calc(100dvh - 16px)!important');
let seed=2026111216,killed=0;
function next(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
const total=Number(process.env.CASES||10000);
assert.ok(Number.isInteger(total)&&total>=100&&total<=10000000);
for(let i=0;i<total;i++){
 const which=next()%21,field=next()%5;
 const items=library.map(x=>({...x}));
 const key=['shortName','title','issuer','edition','id'][field];
 const unique='FALSIFIER-'+i;
 items[which][key]=unique;
 const observed=visibleFrameworkIds(items,unique,false);
 assert.ok(observed.includes(items[which].id),'Search lost an offscreen source record');
 assert.deepEqual(new Set(visibleFrameworkIds(items,'',true)),new Set(items.map(x=>x.id)));
 if(which>=6)killed++;
}
console.log(JSON.stringify({result:'PASS',checks:'source owners and full-universe MC-01 projection',cases:total,previewOnlyCounterexamples:killed,browser:'NOT_RUN',enterprise:'BLOCKED_EXTERNAL'}));
