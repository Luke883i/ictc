import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const [language,polish,nexus,novice,landscape,active]=await Promise.all([
  './public/ui/business-language.js','./public/ui/business-language-polish.js','./public/ui/business-nexus.js','./public/ui/novice-entry.js','./public/ui/process-landscape.js','./public/ui/active-experience.js'
].map(read));
for(const s of ['Monitoraggio normativo','Eventi e segnalazioni','Inventario di sistemi e oggetti','Controlli e copertura','Azioni correttive','Rischi di compliance','Questionari e verifiche'])assert.ok(language.includes(s),s);
for(const s of ['Compliance operativa e tracciabile','Processi di compliance','Impostazioni AI','Non sai da dove iniziare?','Da fare','Decisioni da confermare','Indicatori di compliance','Prove e tracciabilità','Riferimenti a standard','Ricostruisci una decisione o un fascicolo','Registro delle modifiche','Dettagli tecnici','Invia a verifica'])assert.ok(polish.includes(s),s);
for(const s of ['Processi di compliance','Come funziona','Assistente AI · Attivo','Assistente AI · Disattivato'])assert.ok(nexus.includes(s),s);
for(const s of ['Scegli il processo','più pertinente','Consulta processo'])assert.ok(novice.includes(s),s);
for(const s of ['Vista per ciclo operativo','Dettagli metodologici'])assert.ok(landscape.includes(s),s);
assert.ok(nexus.includes("from './business-language.js'"));assert.ok(landscape.includes("from './business-language.js'"));
assert.match(active,/installExperiencePolish\(\)/);assert.match(active,/dataset\.ictcExperience='active-1'/);
for(const forbidden of ['MutationObserver','prompt(','confirm('])assert.ok(!`${polish}\n${nexus}\n${novice}\n${landscape}`.includes(forbidden),forbidden);
console.log('v4-1-lexical-contract-check: ok');
