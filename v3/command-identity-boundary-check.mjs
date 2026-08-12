import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { bodyJson, commandFrom } from './runtime/http.mjs';
function request(url,body){return Object.assign(Readable.from([Buffer.from(body)]),{method:'POST',url,headers:{host:'127.0.0.1:4173','content-type':'application/json','x-ictc-command-id':'client-retry-7'},socket:{remoteAddress:'127.0.0.1'}});}
const a=request('/api/incidents/manual-intake','{"a":1,"b":2}');await bodyJson(a);const ca=commandFrom(a);
const same=request('/api/incidents/manual-intake','{"b":2,"a":1}');await bodyJson(same);const cs=commandFrom(same);
const changedBody=request('/api/incidents/manual-intake','{"a":1,"b":3}');await bodyJson(changedBody);const cb=commandFrom(changedBody);
const changedRoute=request('/api/contributions','{"a":1,"b":2}');await bodyJson(changedRoute);const cr=commandFrom(changedRoute);
assert.equal(ca.id,cs.id,'canonical JSON retry must retain command identity');
assert.notEqual(ca.id,cb.id,'same client token with different payload must not replay prior envelope');
assert.notEqual(ca.id,cr.id,'same client token on different route must not replay prior envelope');
assert.equal(ca.metadata.clientCommandId,'client-retry-7');
assert.match(ca.metadata.commandInputSha256,/^[0-9a-f]{64}$/);
console.log('command-identity-boundary-check: ok (client token bound to method+URL+canonical input digest)');
