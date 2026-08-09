import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const [language,polish,nexus,entry,landscape,proof,trace,active]=await Promise.all([
  './public/ui/business-language.js','./public/ui/experience-polish.js','./public/ui/business-nexus.js','./public/ui/operational-entry.js','./public/ui/process-landscape.js','./public/ui/proof-surface.js','./public/ui/trace-explorer.js','./public/ui/active-experience.js'
].map(read));
for(const s of ['Monitoraggio normativo','Eventi e segnalazioni','Inventario di sistemi e oggetti','Controlli e copertura','Azioni correttive','Rischi di compliance','Questionari e verifiche'])assert.ok(language.includes(s),s);
for(const s of ['Compliance operativa e tracciabile','Processi di compliance','Impostazioni AI'])assert.ok(polish.includes(s),s);
for(const s of ['Non sai da dove iniziare?','Da fare','Decisioni da confermare','Indicatori di compliance'])assert.ok(polish.includes(s),s);
for(const s of ['Prove e tracciabilità','Riferimenti a standard'])assert.ok(polish.includes(s),s);
for(const s of ['Ricostruisci una decisione o un fascicolo','Registro delle modifiche','Dettagli tecnici'])assert.ok(polish.includes(s),s);
assert.ok(nexus.includes('business-language.js'));
assert.ok(landscape.includes('business-language.js'));
assert.ok(active.includes('installExperiencePolish'));
for(const forbidden of ['MutationObserver','prompt(','confirm('])assert.ok(!`${polish}\n${nexus}\n${entry}\n${landscape}\n${proof}\n${trace}`.includes(forbidden),forbidden);
console.log('v4-1-lexical-contract-check: ok');
