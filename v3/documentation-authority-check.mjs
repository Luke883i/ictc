import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const [readme,agents,architecture,testing,development,security,persistence,pkgText,identityText]=await Promise.all([read('../README.md'),read('../AGENTS.md'),read('../docs/11_ARCHITECTURE.md'),read('../docs/TESTING.md'),read('../docs/DEVELOPMENT.md'),read('../SECURITY.md'),read('./sqlite-state-persistence.mjs'),read('../package.json'),read('./release-identity.json')]);
const pkg=JSON.parse(pkgText),identity=JSON.parse(identityText),normative=[['README',readme],['AGENTS',agents],['architecture',architecture],['testing',testing],['development',development],['security',security]];
for(const [name,text] of normative)assert.ok(text.length>300,`${name} unexpectedly empty`);
for(const [name,text] of [['README',readme],['AGENTS',agents],['architecture',architecture]]){assert.match(text,/SQLite/i,`${name} must name current SQLite persistence`);assert.ok(!/current[^\n]{0,80}(?:SOT|persistence)[^\n]{0,80}state\.json/i.test(text),`${name} claims state.json is current persistence`);}
for(const token of ['PRAGMA journal_mode=WAL','PRAGMA synchronous=FULL','CREATE TABLE IF NOT EXISTS snapshot','CREATE TABLE IF NOT EXISTS audit','CREATE TABLE IF NOT EXISTS subject_version','CREATE TABLE IF NOT EXISTS epistemic_step'])assert.ok(persistence.includes(token),`persistence executable contract missing ${token}`);
assert.match(architecture,/snapshot[^\n]*mutabile/i);assert.match(architecture,/audit[^\n]*append-only/i);assert.match(architecture,/subject_version[^\n]*append-only/i);assert.match(architecture,/epistemic_step[^\n]*append-only/i);assert.match(architecture,/non è oggi un event store completo/i);
assert.equal(pkg.scripts.test,'npm run test:current');assert.match(testing,/npm test` esegue `test:current`/);assert.match(testing,/exact PR HEAD/i);assert.match(development,/state\.sqlite/);
assert.equal(identity.journeyProfile,'2.1-procedure-journey-semantic-exploration-pre-candidate');assert.ok(readme.includes(identity.journeyProfile));assert.match(security,/CodeQL is conditional|CodeQL è condizionale/i);assert.match(security,/not executed|non eseguito/i);
for(const format of ['PDF','XML','Markdown','ZIP'])assert.ok(readme.includes(format),`README missing evidence format ${format}`);
console.log(JSON.stringify({ok:true,check:'documentation-authority',authorities:['sqlite-state-persistence','package:test','release-identity','security-workflow-boundary'],files:normative.map(([name])=>name)}));
