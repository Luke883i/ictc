import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root=new URL('./',import.meta.url);
const contract=JSON.parse(await readFile(new URL('./v1-1-enterprise-experience-contract.json',root),'utf8'));
const pkg=JSON.parse(await readFile(new URL('../package.json',root),'utf8'));
const shell=await readFile(new URL('./public/ui/stable-shell.js',root),'utf8');
const proof=await readFile(new URL('./public/ui/proof-surface.js',root),'utf8');
const active=await readFile(new URL('./public/ui/active-experience.js',root),'utf8');
const procedureAdmin=await readFile(new URL('./public/ui/procedure-admin.js',root),'utf8');
const server=await readFile(new URL('./server.mjs',root),'utf8');
const mark=await readFile(new URL('./public/assets/ictc-mark.png',root));
const has=(source,needle,message=needle)=>assert.ok(source.includes(needle),message);

assert.equal(contract.releaseProfile,'1.1_stable');
assert.equal(contract.experience,'stable-2');
assert.equal(contract.productName,'Integrated Compliance Tower Control');
assert.equal(pkg.version,'1.8.0','product profile must not falsify package/runtime lineage');
assert.deepEqual(contract.permanentShell.map(x=>x.label),['Oggi','Processi','Evidenze']);
assert.deepEqual(contract.businessProcesses,['RN-01','EC-01','AO-01','MC-01','AP-01','RC-01','AR-01']);
assert.equal(contract.processCardinality,7);
assert.equal(contract.processPresentation,'standalone-peers');
assert.equal(contract.home.primaryActions,1);
assert.equal(contract.home.maxPriorityRows,3);
assert.equal(contract.home.fullCatalogCopies,1);
assert.equal(contract.progressiveDisclosure.maxLevels,5);
assert.equal(contract.procedurePolicy.adminFeatureFlagPerProcedure,true);
assert.equal(contract.procedurePolicy.minimumEnabled,1);
assert.deepEqual(contract.procedurePolicy.userScopes,{monitoring:'organization',incidents:'created-by',objects:'organization',coverage:'organization',actions:'assigned-or-created',risks:'organization',assurance:'created-by'});

assert.ok(mark.length>1000,'official project mark asset is unexpectedly empty');
assert.deepEqual([...mark.subarray(0,8)],[137,80,78,71,13,10,26,10],'official project mark must be a PNG');
has(shell,"mark.src='/assets/ictc-mark.png'");
has(shell,'Integrated Compliance Tower Control');
has(shell,'Governa la compliance operativa, senza perdere la traccia.');
has(shell,"dataset.ictcExperience='stable-2'");
has(shell,"evidence.textContent='Evidenze'");
has(shell,'state.data.decisions?.records?.length','Home pulse must use the canonical DecisionRecord projection');
has(shell,'.slice(0,3)','Home priority disclosure must remain capped at three rows');
for(const label of ['Inventario di sistemi e oggetti','Controlli e copertura','Azioni correttive','Rischi di compliance','Questionari e verifiche'])has(shell,label,label);

has(proof,'Evidenze e tracciabilità');
has(proof,'Decisioni umane recenti');
has(proof,'id="proofAdvanced"');
assert.ok(proof.indexOf('Decisioni umane recenti')<proof.indexOf('Postura tecnica, export e limiti'),'business evidence must precede technical posture');
has(proof,'non dimostra automaticamente che la prova sia sufficiente');
has(active,'installProcedureAdmin');
has(procedureAdmin,"api('/api/admin/procedures')");
has(procedureAdmin,'Almeno una procedura deve restare attiva');
has(server,"PRODUCT_NAME='Integrated Compliance Tower Control'");
has(server,"STABILITY_PROFILE='1.1_stable'");
has(server,'assertWritePathEnabled(snapshot,method,pathname)');
has(server,"if(!procedureEnabled(state,'monitoring'))return");

console.log('v1-1-enterprise-experience-check: ok (brand, release contract, peer processes, evidence audience and procedure-policy wiring; geometry is browser-gated)');
