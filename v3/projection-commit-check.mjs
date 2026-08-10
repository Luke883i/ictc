import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source=await readFile(new URL('./public/ui/controller.js',import.meta.url),'utf8');
for(const token of ['committedRevision','refreshSequence','projection-revision-regressed','ictc:projection-committed','previousRevision,revision,changed:revision!==previousRevision','reason'])assert.ok(source.includes(token),`projection commit contract missing ${token}`);
assert.equal((source.match(/ictc:projection-committed/g)||[]).length,1,'controller must have one projection-commit event owner');
assert.ok(source.indexOf("state.data=next")<source.indexOf("ictc:projection-committed"),'projection commit must be emitted after installing bootstrap projection');
assert.ok(source.includes('if(sequence!==refreshSequence)return state.data'),'stale bootstrap refresh must not overwrite a newer one');
console.log('projection-commit-check: ok (single revision-monotonic projection commit owner)');
