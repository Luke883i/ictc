import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { assertRnClosedUniverse, assertRnVerifiableSource, inferRnSourceClass, normalizeRnDiscoveredItem, rnVerificationBasis, RN_SOURCE_CLASSES } from './runtime/rn-monitoring-policy.mjs';
const [contributions,manual,monitoring]=await Promise.all(['./runtime/contributions.mjs','./runtime/manual-monitoring.mjs','./runtime/monitoring.mjs'].map(p=>readFile(new URL(p,import.meta.url),'utf8')));
assert.deepEqual(RN_SOURCE_CLASSES,['binding-eu-law','binding-italian-law','competent-authority-decisions','public-jurisprudence-and-case-information-without-personal-data']);
assert.deepEqual(assertRnClosedUniverse(null),RN_SOURCE_CLASSES);assert.throws(()=>assertRnClosedUniverse(['binding-eu-law']),e=>e.code==='rn-source-universe-fixed');
const accepted=[
  {title:'Regolamento UE',documentType:'regulation',jurisdiction:'Unione europea',authority:'EUR-Lex',sourceUrl:'https://eur-lex.europa.eu/example'},
  {title:'D.Lgs.',documentType:'legislative-decree',jurisdiction:'Italia',authority:'Normattiva',identifier:'D.Lgs. 1/2026'},
  {title:'Provvedimento Garante',documentType:'authority-decision',authority:'Garante per la protezione dei dati personali',sourceUrl:'https://www.garanteprivacy.it/example'},
  {title:'Sentenza',documentType:'case-law',authority:'Corte di Cassazione',sourceUrl:'https://www.cortedicassazione.it/example'}
];
assert.deepEqual(accepted.map(inferRnSourceClass),RN_SOURCE_CLASSES);for(const item of accepted){assert.ok(normalizeRnDiscoveredItem(item,{sourceClasses:null}));const basis=assertRnVerifiableSource(item);assert.equal(basis.verifiable,true);assert.ok(basis.reference);}
assert.equal(rnVerificationBasis({sourceClass:'binding-eu-law',authority:'EUR-Lex'}).verifiable,false);assert.throws(()=>assertRnVerifiableSource({sourceClass:'binding-eu-law',authority:'EUR-Lex'}),e=>e.code==='rn-source-reference-required');assert.throws(()=>assertRnVerifiableSource({sourceClass:'binding-eu-law',sourceUrl:'https://eur-lex.europa.eu/example'}),e=>e.code==='rn-source-authority-required');
const preserved=assertRnVerifiableSource({sourceClass:'binding-italian-law',authority:'Gazzetta Ufficiale',origin:{kind:'contribution',contributionId:'contrib-1'}});assert.equal(preserved.reference.kind,'preserved-contribution');
for(const item of [
  {title:'Microsoft 365 release note',documentType:'other',authority:'Microsoft'},
  {title:'Questionario cliente',documentType:'other',authority:'Cliente Automotive'},
  {title:'DPA fornitore',documentType:'other',authority:'Payroll Partner'},
  {title:'Restore test interno',documentType:'other',authority:'IT interno'}
])assert.equal(normalizeRnDiscoveredItem(item,{sourceClasses:null}),null,item.title);
assert.match(contributions,/normalizeRnDiscoveredItem/);assert.match(contributions,/if\s*\(!eligible\)\s*\{\s*excluded\s*\+=\s*1;\s*continue;/);assert.match(contributions,/normalizeCatalogItem\(eligible,/);assert.doesNotMatch(contributions,/normalizeCatalogItem\(raw,/);
assert.match(manual,/assertRnClosedUniverse/);assert.match(manual,/sourceClasses:assertRnClosedUniverse/);assert.match(manual,/normalizeRnDiscoveredItem/);assert.match(manual,/rn-source-class-required/);assert.match(manual,/sourceClasses:mission\.sourceClasses/);
assert.match(monitoring,/sourceClasses:\s*assertRnClosedUniverse/);assert.match(monitoring,/assertRnVerifiableSource/);assert.match(monitoring,/current\.rnVerification/);assert.match(monitoring,/mission\.sourceClasses\s*=\s*assertRnClosedUniverse/);
console.log(JSON.stringify({ok:true,control:'RN-CONTRIBUTOR-BOUNDARY',writePaths:['scheduled-ai','human-contribution+ai-enrichment','human-manual-observation'],closedWorld:true,persistedClosedUniverse:true,verificationProvenanceRequired:true,sourceClasses:RN_SOURCE_CLASSES,outOfNatureExcluded:true}));
