import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const contract=JSON.parse(readFileSync(path.join(root,'procedure-finetuning-micro-surface-contract-2-3.json'),'utf8'));
assert.deepEqual(contract.scope,['monitoring','incidents','objects','coverage','actions']);
const controls=Object.values(contract.procedures).flatMap(p=>p.controls);
assert.equal(new Set(controls.map(x=>x.id)).size,controls.length);
assert.ok(controls.length>=70);
for(const c of controls){for(const k of ['id','phase','kind','selector','purpose','authority','effect','tier'])assert.ok(c[k],`${c.id}:${k}`);assert.ok(['primary','secondary','drilldown'].includes(c.tier));}
assert.equal(contract.globalDod.runtimeOrphans,0);
assert.equal(contract.globalDod.deadControls,0);
assert.equal(contract.globalDod.shadowSemanticRepairs,0);
assert.equal(contract.globalDod.minControlTargetPx,44);
console.log(JSON.stringify({ok:true,procedures:5,microSurfaces:controls.length,contract:contract.schemaVersion}));
