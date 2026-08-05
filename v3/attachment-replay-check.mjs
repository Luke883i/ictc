import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { Store } from './store.mjs';
import { createContributionHandler } from './runtime/contributions.mjs';
import { createIncidentHandler } from './runtime/incidents.mjs';

const root = await mkdtemp(path.join(os.tmpdir(), 'ictc-replay-'));
const store = await new Store(root).init();
const permissions = {
  admin: new Set(['read', 'contribute-source', 'report-incident', 'edit-own-incident', 'submit-own-incident', 'close-incident']),
  user: new Set(['read', 'contribute-source', 'report-incident', 'edit-own-incident', 'submit-own-incident'])
};
const actor = { id: 'local-user', role: 'user', permissions: [...permissions.user] };
function request(body, commandId) {
  const stream = Readable.from([Buffer.from(JSON.stringify(body))]);
  stream.method = 'POST';
  stream.headers = { 'x-ictc-command-id': commandId, 'user-agent': 'attachment-replay-check' };
  return stream;
}
function response() {
  return {
    status: null,
    body: '',
    writeHead(status) { this.status = status; },
    end(value = '') { this.body += value; }
  };
}
const attachment = { name: 'proof.txt', mime: 'text/plain', dataBase64: Buffer.from('same proof').toString('base64') };

try {
  const contribution = createContributionHandler({ store, permissions });
  let res = response();
  await contribution(request({ text: 'materiale', attachments: [attachment] }, 'contribution-replay'), res, '/api/contributions', actor);
  assert.equal(res.status, 201);
  assert.equal((await readdir(store.attachmentsPath)).length, 1);
  res = response();
  await contribution(request({ text: 'materiale', attachments: [attachment] }, 'contribution-replay'), res, '/api/contributions', actor);
  assert.equal(res.status, 200);
  assert.equal((await readdir(store.attachmentsPath)).length, 1);

  const incident = createIncidentHandler({ store, permissions });
  const incidentBody = { originalNarrative: 'Evento osservato', awarenessAt: '2026-08-05T08:00:00.000Z', attachments: [attachment] };
  res = response();
  await incident(request(incidentBody, 'incident-replay'), res, '/api/incidents/intake', actor);
  assert.equal(res.status, 201);
  assert.equal((await readdir(store.attachmentsPath)).length, 2);
  res = response();
  await incident(request(incidentBody, 'incident-replay'), res, '/api/incidents/intake', actor);
  assert.equal(res.status, 200);
  assert.equal((await readdir(store.attachmentsPath)).length, 2);
  console.log('attachment-replay-check: ok');
} finally {
  await rm(root, { recursive: true, force: true });
}
