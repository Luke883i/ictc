import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateUiuxConvergeContract, CANONICAL_SURFACES } from './uiux-converge-0-model.mjs';
const read=path=>readFile(new URL(path,import.meta.url),'utf8');
const [contractRaw,closureRaw,entryRaw,tokens,icons,shell,frame,native,enterprise,closureCss,compositionCss,registry,index]=await Promise.all([
  read('./uiux-converge-0-contract.json'),read('./capability-closure-e2-contract.json'),read('./uiux-prototype-entry-contract.json'),
  read('./public/design-tokens.css'),read('./public/ui/ui-icons.js'),read('./public/ui/stable-shell.js'),read('./public/ui/procedure-frame.js'),read('./public/ui/native-semantic-lattice-3-2.js'),
  read('./public/enterprise-workspace-3-2.css'),read('./public/semantic-workspace-closure-3-2-1.css'),read('./public/semantic-composition-3-1.css'),read('./current-gate-registry.mjs'),read('./public/index.html')
]);
const contract=JSON.parse(contractRaw),closure=JSON.parse(closureRaw),entry=JSON.parse(entryRaw),verdict=validateUiuxConvergeContract(contract);
assert.equal(verdict.ok,true,verdict.errors.join('\n'));
assert.deepEqual(new Set(contract.surfaceProgram.map(x=>x.id)),new Set(CANONICAL_SURFACES));
assert.deepEqual(new Set(closure.surfaceUnits.map(x=>x.id)),new Set(CANONICAL_SURFACES));
assert.equal(entry.nextSerialSlice,'UIUX-CONVERGE-0');assert.equal(entry.capabilityClosure.rerunBeforeDone,true);
for(const token of ['--ui-control-h:44px','--ui-row-compact:52px','--ui-row-max:64px','--type-display:','--weight-description:400','--transition-interactive:'])assert.ok(tokens.includes(token),`design token missing ${token}`);
for(const icon of ["'arrow-up-right'","'chevron-left'","'chevron-right'","'info'"])assert.ok(icons.includes(icon),`icon primitive missing ${icon}`);
assert.ok(shell.includes(".slice(0,3)"),'Home queue must converge to max 3');
assert.ok(index.includes('<h1 id="homeTitle">Integrated Compliance Tower Control</h1>')&&!shell.includes("title.textContent='Cosa richiede attenzione?'")&&!shell.includes("title.textContent='Integrated Compliance Tower Control'")&&shell.includes("priorities.dataset.homeWorkQueue='3.2'")&&shell.includes("priorities.dataset.uiuxConverge='P1'"),'Home must be static-title, work-first and P1-bounded without temporal title rewrites');
assert.ok(shell.includes("uiIcon('arrow-up-right'")&&shell.includes("uiIcon('chevron-right'"),'Home directional actions must use icons');
assert.ok(frame.includes('data-uiux-layout="row"')&&frame.includes("host.dataset.uiuxLayout='rows'"),'Process Hub row contract missing');
assert.ok(frame.includes("uiIcon('chevron-left'")&&frame.includes("uiIcon('arrow-up-right'"),'Procedure icon affordances missing');
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
for(const source of [shell,frame,native])assert.equal(source.includes('/api/'),false,'UIUX convergence pass must not introduce business API routes');
const gates=['v3/capability-closure-e2-check.mjs','v3/capability-closure-e2-saturation.mjs','v3/uiux-converge-0-check.mjs','v3/uiux-converge-0-style-saturation.mjs','v3/uiux-converge-0-e2e-saturation.mjs'];
for(const gate of gates)assert.ok(registry.includes(`'${gate}'`),`current registry missing ${gate}`);
assert.ok(registry.indexOf("'v3/capability-closure-e2-check.mjs'")<registry.indexOf("'v3/uiux-converge-0-check.mjs'"),'UIUX rail must remain downstream of capability closure');
console.log(JSON.stringify({ok:true,profile:'UIUX-CONVERGE-0/P1',surfaces:13,procedures:7,homePriorityMax:3,homeTitleOwner:'static-canonical',controlMinPx:44,processHub:'local-owner-row-list',icons:'inline-lucide-compatible-svg',latePresentationOverridesRetired:['Home','Process Hub','Procedure Frame','Proof'],businessRuntimeChanged:false,sliceTerminal:false}));
