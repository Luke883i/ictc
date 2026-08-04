import { strict as assert } from 'node:assert';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = file => readFile(path.join(root,file),'utf8');
const [dodText, contractText, access, store, api, monitoring, common, actions, guidance, workflow, saturation] = await Promise.all([
  read('v3/multi-user-dod.json'), read('v3/public/core-workspaces.json'), read('v3/lib/access-context.mjs'), read('v3/lib/store.mjs'),
  read('v3/lib/api.mjs'), read('v3/lib/monitoring-runtime.mjs'), read('v3/public/js/journey-shell-common.js'),
  read('v3/public/js/journey-shell-actions.js'), read('v3/public/js/journey-guidance.js'), read('.github/workflows/multi-client.yml'), read('v3/multi-client-saturation.mjs')
]);
const dod = JSON.parse(dodText); const contract = JSON.parse(contractText);
const evidence = [
  /resolveAccessContext/.test(access), contract.actions.every(item=>item.permission), /delete clean\.tenantId/.test(api)&&/delete clean\.actor/.test(api),
  /runtime.*tenants/s.test(store), /actionId/.test(store)&&/actorRole/.test(store), /commandId/.test(store), /ledger-head-changed/.test(store),
  /replayed/.test(store), /tenantId.*actorId/s.test(api), /SESSION_TTL_MS/.test(api)&&/SESSION_LIMIT/.test(api), /tenant selezionato/.test(api),
  contract.workspaces.length===2, /Monitora URL/.test(contractText)&&/Aggiungi contenuto/.test(contractText)&&/Segnala/.test(contractText),
  /actionableTasks\[0\]/.test(guidance), /waitingTasks/.test(guidance)&&/In attesa/.test(guidance),
  contract.actions.every(item=>item.route&&item.permission&&item.projection&&item.producer), /readbackVerified/.test(store), /transitions/.test(store),
  /read-only/.test(monitoring), /Nessuna azione per il tuo ruolo/.test(guidance)&&/Non significa conformità/.test(guidance),
  /M = 48/.test(saturation)&&/MPlus100 = 148/.test(saturation), /audit:multi-client/.test(workflow)&&/multi-user-dod/.test(workflow),
  /structuredClone\(event\.payload\)/.test(store)
];
assert.equal(dod.criteria.length,23); assert.equal(evidence.length,23);
const results=dod.criteria.map((item,index)=>({...item,status:evidence[index]?'passed':'failed'}));
assert.equal(results.filter(item=>item.status==='failed').length,0,JSON.stringify(results.filter(item=>item.status==='failed')));
await mkdir(path.join(root,'artifacts'),{recursive:true});
await writeFile(path.join(root,'artifacts/multi-user-dod.json'),JSON.stringify({schemaVersion:'1.0.0',generatedAt:new Date().toISOString(),result:'passed',passed:23,total:23,criteria:results,limitations:dod.limitations},null,2));
console.log('multi-user-dod: ok (23/23 criteria)');
