import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { state } from './public/ui/common.js';
import { installDemoSuite30Ui } from './public/ui/demo-suite-3-0-ui.js';

const [active,shell]=await Promise.all([
  readFile(new URL('./public/ui/active-experience.js',import.meta.url),'utf8'),
  readFile(new URL('./public/ui/stable-shell.js',import.meta.url),'utf8')
]);

class FakeElement{
  constructor(){this.innerHTML='';this.attributes=new Map();}
  setAttribute(name,value){this.attributes.set(name,String(value));}
  getAttribute(name){return this.attributes.get(name)??null;}
}

const card=new FakeElement(),dialog=new FakeElement(),listeners=new Map();
globalThis.document={
  documentElement:{dataset:{}},
  querySelector(selector){return selector==='#ictcDemoCard'?card:selector==='#ictcDemoDialog'?dialog:null;},
  addEventListener(type,handler){const handlers=listeners.get(type)||[];handlers.push(handler);listeners.set(type,handlers);}
};

const flush=()=>new Promise(resolve=>queueMicrotask(resolve));
const dispatch=async type=>{for(const handler of listeners.get(type)||[])handler();await flush();};
const setDemo=(overrides={})=>{
  state.data={experience:{demo:{
    enabled:true,
    projectionAuthority:'demo-suite-3-0',
    coherent:true,
    organizationName:'ICTC Demo Mutation',
    stateDigest:'0123456789abcdef',
    positiveRecords:188,
    stressFixtures:512,
    legacySourceStatus:'generator-only',
    ...overrides
  }}};
};

setDemo();
installDemoSuite30Ui();
await flush();

assert.equal(document.documentElement.dataset.ictcDemoSuite,'3.0');
assert.equal(document.documentElement.dataset.ictcDemoProjection,'demo-suite-3-0');
assert.ok((listeners.get('ictc:rendered')||[]).length>0,'Suite 3.0 UI must react to canonical render events');
assert.ok((listeners.get('ictc:surface-changed')||[]).length>0,'Suite 3.0 UI must react to surface changes');
assert.match(card.innerHTML,/Suite 3\.0 · Suite 3\.0 verificata/);
assert.match(dialog.innerHTML,/>188 record business 3\.0</);
assert.match(dialog.innerHTML,/>512 fixture escluse</);
for(const token of ['Evidence Lattice','read-only derivato','Suite 2.2 deprecata','Dimostrazione, non verdetto'])assert.ok(dialog.innerHTML.includes(token),`Suite 3.0 rendered disclosure missing ${token}`);
assert.ok(card.getAttribute('aria-label')?.includes('Suite 3.0'),'Suite 3.0 card aria-label missing');
assert.ok(active.includes("from './demo-suite-3-0-ui.js'"),'Suite 3.0 UI owner not imported by composition root');
assert.ok(active.includes('installDemoSuite30Ui'),'Suite 3.0 UI owner not installed by composition root');
assert.ok(shell.includes('ictcDemoCard')&&shell.includes('ictcDemoDialog'),'base progressive disclosure surface missing');

const sentinel='<unchanged-by-non-authoritative-state>';
dialog.innerHTML=sentinel;
setDemo({projectionAuthority:'demo-suite-2-2'});
await dispatch('ictc:rendered');
assert.equal(dialog.innerHTML,sentinel,'non-authoritative DEMO projection must not render Suite 3.0 disclosure');
setDemo({enabled:false});
await dispatch('ictc:rendered');
assert.equal(dialog.innerHTML,sentinel,'disabled DEMO state must not render Suite 3.0 disclosure');

setDemo({organizationName:'<img src=x onerror=alert(1)>',positiveRecords:731,stressFixtures:509});
await dispatch('ictc:rendered');
assert.match(dialog.innerHTML,/>731 record business 3\.0</);
assert.match(dialog.innerHTML,/>509 fixture escluse</);
assert.ok(dialog.innerHTML.includes('&lt;img src=x onerror=alert(1)&gt;'),'organization name must be HTML-escaped in disclosure');
assert.ok(!dialog.innerHTML.includes('<img src=x onerror=alert(1)>'),'raw organization HTML must not enter disclosure');

const TRIALS=10_000,SEED=0x30f17e;
let rng=SEED>>>0;
const next=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;};
for(let trial=0;trial<TRIALS;trial++){
  const positiveRecords=next()%1_000_000,stressFixtures=next()%100_000,coherent=(next()&1)===0;
  setDemo({positiveRecords,stressFixtures,coherent,organizationName:`Mutation ${trial}`});
  await dispatch(trial&1?'ictc:surface-changed':'ictc:rendered');
  assert.ok(dialog.innerHTML.includes(`>${positiveRecords} record business 3.0</strong>`),`runtime positiveRecords laundering at trial ${trial}`);
  assert.ok(dialog.innerHTML.includes(`>${stressFixtures} fixture escluse</strong>`),`runtime stressFixtures laundering at trial ${trial}`);
  assert.ok(dialog.innerHTML.includes(coherent?'Suite 3.0 verificata':'Suite 3.0 non coerente'),`runtime coherence laundering at trial ${trial}`);
}

console.log(JSON.stringify({
  ok:true,
  control:'DEMO-SUITE-3.0-UI',
  projectionAuthority:'demo-suite-3-0',
  suite:'3.0',
  recordCountBinding:'runtime-projection-behavior',
  mutationExecutions:TRIALS,
  mutationSeed:`0x${SEED.toString(16)}`,
  authorityGate:'runtime-behavior',
  escaping:'runtime-behavior',
  legacy22:'deprecated-generator-only',
  claimBoundary:'10k deterministic UI runtime-truth mutations; separate from the 1M Suite 3.0 cutover mutation rail.'
}));
