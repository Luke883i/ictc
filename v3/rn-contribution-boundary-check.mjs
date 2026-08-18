import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { inferRnSourceClass, normalizeRnDiscoveredItem, RN_SOURCE_CLASSES } from './runtime/rn-monitoring-policy.mjs';
const [contributions,manual]=await Promise.all(['./runtime/contributions.mjs','./runtime/manual-monitoring.mjs'].map(p=>readFile(new URL(p,import.meta.url),'utf8')));
assert.deepEqual(RN_SOURCE_CLASSES,['binding-eu-law','binding-italian-law','competent-authority-decisions','public-jurisprudence-and-case-information-without-personal-data']);
const accepted=[
  {title:'Regolamento UE',documentType:'regulation',jurisdiction:'Unione europea'},
  {title:'D.Lgs.',documentType:'legislative-decree',jurisdiction:'Italia'},
  {title:'Provvedimento Garante',documentType:'authority-decision',authority:'Garante per la protezione dei dati personali'},
  {title:'Sentenza',documentType:'case-law',authority:'Corte di Cassazione'}
];
assert.deepEqual(accepted.map(inferRnSourceClass),RN_SOURCE_CLASSES);for(const item of accepted)assert.ok(normalizeRnDiscoveredItem(item,{sourceClasses:null}));
for(const item of [
  {title:'Microsoft 365 release note',documentType:'other',authority:'Microsoft'},
  {title:'Questionario cliente',documentType:'other',authority:'Cliente Automotive'},
  {title:'DPA fornitore',documentType:'other',authority:'Payroll Partner'},
  {title:'Restore test interno',documentType:'other',authority:'IT interno'}
])assert.equal(normalizeRnDiscoveredItem(item,{sourceClasses:null}),null,item.title);
assert.match(contributions,/normalizeRnDiscoveredItem/);assert.match(contributions,/if\s*\(!eligible\)\s*\{\s*excluded\s*\+=\s*1;\s*continue;/);assert.match(contributions,/normalizeCatalogItem\(eligible,/);assert.doesNotMatch(contributions,/normalizeCatalogItem\(raw,/);
assert.match(manual,/normalizeRnDiscoveredItem/);assert.match(manual,/rn-source-class-required/);assert.match(manual,/normalizeCatalogItem\(\{\.\.\.eligible,confidence:0\}/);assert.doesNotMatch(manual,/normalizeCatalogItem\(\{\.\.\.input,title,confidence:0\}/);
console.log(JSON.stringify({ok:true,control:'RN-CONTRIBUTOR-BOUNDARY',writePaths:['scheduled-ai','human-contribution+ai-enrichment','human-manual-observation'],closedWorld:true,sourceClasses:RN_SOURCE_CLASSES,outOfNatureExcluded:true}));
