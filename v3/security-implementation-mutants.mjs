import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const root=new URL('./',import.meta.url);
const baseline={
  encoding:await readFile(new URL('public/ui/security-encoding.js',root),'utf8'),
  fi01:await readFile(new URL('public/ui/fi01-reference.js',root),'utf8'),
  boundaries:await readFile(new URL('runtime/security-boundaries.mjs',root),'utf8'),
  network:await readFile(new URL('network-policy.mjs',root),'utf8'),
  server:await readFile(new URL('server.mjs',root),'utf8'),
  storage:await readFile(new URL('runtime/attachment-storage.mjs',root),'utf8'),
  integrity:await readFile(new URL('runtime/attachment-integrity.mjs',root),'utf8'),
  workflow:await readFile(new URL('../.github/workflows/security.yml',root),'utf8')
};

function oracles(files){
  return {
    fi01NoDirectInterpolation:!files.fi01.includes('${reference.'),
    fi01ContextRenderer:files.fi01.includes('internalReferencePanelMarkup(reference)')&&['masterSystem','masterId','masterVersion','contentSha256'].every(field=>files.encoding.includes(`htmlEsc(reference.${field})`))&&files.encoding.includes('href=safeHref(reference.referenceUrl)'),
    hrefHttpOnly:files.encoding.includes("if(!['http:','https:'].includes(url.protocol))return''"),
    htmlEscapesAllContexts:/replace\(\/\[&<>"'\]\//.test(files.encoding),
    aiFlagsIndependent:files.network.includes("Object.freeze({allowPrivate:env.ICTC_ALLOW_PRIVATE_AI==='1',allowInsecure:env.ICTC_ALLOW_INSECURE_AI==='1'})")&&files.network.includes("if (url.protocol !== 'https:' && !optIns.allowInsecure)")&&!files.network.includes('!optIns.allowInsecure && !optIns.allowPrivate')&&!files.network.includes('&& !localDevelopmentOptIn'),
    authenticatedRateKey:files.boundaries.includes('export function edgeRateLimitKey')&&files.boundaries.includes("actor?.identityMode==='trusted-header'&&subject")&&files.boundaries.includes('subject:${subject}')&&files.boundaries.includes('remote:${remote}'),
    edgeBeforeAuth:files.server.indexOf('edgeRateLimitKey({tenantId:resolved.tenantId,remoteAddress})')>=0&&files.server.indexOf('edgeRateLimitKey({tenantId:resolved.tenantId,remoteAddress})')<files.server.indexOf('authorizeEnterpriseActor('),
    rateAfterAuth:files.server.indexOf('authorizeEnterpriseActor(')>=0&&files.server.indexOf('authenticatedRateLimitKey({tenantId:resolved.tenantId,actor')>files.server.indexOf('authorizeEnterpriseActor('),
    writeBoundaryCentral:files.server.includes('assertBrowserWriteBoundary(request)'),
    attachmentCanonical:files.boundaries.includes('raw!==attachmentId')&&files.boundaries.includes("!/^[A-Za-z0-9][A-Za-z0-9._-]{0,199}$/.test(attachmentId)")&&files.boundaries.includes('attachment-id-invalid'),
    attachmentConfined:files.boundaries.includes('path.resolve(base,attachmentId)')&&files.boundaries.includes('attachment-path-invalid')&&files.storage.includes('attachmentStoragePath(')&&files.integrity.includes('attachmentStoragePath('),
    noDirectAttachmentJoin:!/[.]join\((?:cleanPath|quarantinePath|store[.](?:cleanAttachmentsPath|quarantinePath)),\s*attachmentId\)/.test(files.storage+files.integrity),
    sastRequired:/\n  repository-sast:\n/.test(files.workflow)&&files.workflow.includes('security-sast-check.mjs')&&!/repository-sast:[\s\S]{0,180}\n\s+if:/.test(files.workflow),
    runtimeDodRequired:/\n  runtime-security-dod:\n/.test(files.workflow)&&files.workflow.includes('security-runtime-dod-check.mjs')&&files.workflow.includes('security-main-mutation-1m.mjs'),
    checkoutCredentialsDisabled:(files.workflow.match(/actions\/checkout@/g)||[]).length===(files.workflow.match(/persist-credentials:\s*false/g)||[]).length
  };
}

const baseOracle=oracles(baseline);for(const [name,ok] of Object.entries(baseOracle))assert.equal(ok,true,`baseline oracle failed: ${name}`);

const mutants=[
  ['FI01-RAW-SYSTEM','encoding',s=>s.replace('htmlEsc(reference.masterSystem)','reference.masterSystem')],
  ['FI01-RAW-ID','encoding',s=>s.replace('htmlEsc(reference.masterId)','reference.masterId')],
  ['FI01-JS-HREF','encoding',s=>s.replace("if(!['http:','https:'].includes(url.protocol))return'';",'')],
  ['FI01-DIRECT-SINK','fi01',s=>s.replace('panel.innerHTML = internalReferencePanelMarkup(reference);','panel.innerHTML = `<h3>${reference.masterSystem}</h3>`;')],
  ['AI-PRIVATE-ALSO-INSECURE','network',s=>s.replace("allowInsecure:env.ICTC_ALLOW_INSECURE_AI==='1'","allowInsecure:env.ICTC_ALLOW_INSECURE_AI==='1'||env.ICTC_ALLOW_PRIVATE_AI==='1'")],
  ['AI-OLD-COUPLED-GUARD','network',s=>s.replace("if (url.protocol !== 'https:' && !optIns.allowInsecure) {","if (url.protocol !== 'https:' && !optIns.allowInsecure && !optIns.allowPrivate) {")],
  ['RATE-PROXY-REMOTE','boundaries',s=>s.replace("if(actor?.identityMode==='trusted-header'&&subject)return `${tenant}|subject:${subject}`;","if(actor?.identityMode==='trusted-header'&&subject)return `${tenant}|remote:${remoteAddress}`;")],
  ['RATE-LOCAL-SUBJECT','boundaries',s=>s.replace("if(actor?.identityMode==='trusted-header'&&subject)return `${tenant}|subject:${subject}`;","if(subject)return `${tenant}|subject:${subject}`;")],
  ['RATE-BEFORE-AUTH','server',s=>s.replace("const state=store.snapshot(),actor=authorizeEnterpriseActor(actorFrom(request,permissions,state.settings.identity),state),key=authenticatedRateLimitKey({tenantId:resolved.tenantId,actor,remoteAddress})","const key=authenticatedRateLimitKey({tenantId:resolved.tenantId,actor:{id:'preauth',identityMode:'trusted-header'},remoteAddress}),state=store.snapshot(),actor=authorizeEnterpriseActor(actorFrom(request,permissions,state.settings.identity),state)")],
  ['EDGE-GUARD-REMOVED','server',s=>s.replace("const remoteAddress=request.socket?.remoteAddress,edgeKey=edgeRateLimitKey({tenantId:resolved.tenantId,remoteAddress}),edgeBudget=edgeAbuseBudget.consume(edgeKey);if(!edgeBudget.allowed){rateLimited=true;response.setHeader('retry-after',String(edgeBudget.retryAfterSeconds));throw httpError(429,'Troppe richieste','edge-rate-limited',{retryAfterSeconds:edgeBudget.retryAfterSeconds});}","const remoteAddress=request.socket?.remoteAddress;")],
  ['EDGE-AFTER-AUTH','server',s=>s.replace("const remoteAddress=request.socket?.remoteAddress,edgeKey=edgeRateLimitKey({tenantId:resolved.tenantId,remoteAddress}),edgeBudget=edgeAbuseBudget.consume(edgeKey);","const remoteAddress=request.socket?.remoteAddress;const __edgeAfterAuth='edge';").replace("const state=store.snapshot(),actor=authorizeEnterpriseActor(actorFrom(request,permissions,state.settings.identity),state),key=","const state=store.snapshot(),actor=authorizeEnterpriseActor(actorFrom(request,permissions,state.settings.identity),state),edgeKey=edgeRateLimitKey({tenantId:resolved.tenantId,remoteAddress}),edgeBudget=edgeAbuseBudget.consume(edgeKey),key=")],
  ['WRITE-BOUNDARY-REMOVED','server',s=>s.replace('assertBrowserWriteBoundary(request);','')],
  ['ATTACH-TRIM-ALIAS','boundaries',s=>s.replace('if(raw!==attachmentId||','if(')],
  ['ATTACH-ALLOW-SLASH','boundaries',s=>s.replace("!/^[A-Za-z0-9][A-Za-z0-9._-]{0,199}$/.test(attachmentId)","!/^[A-Za-z0-9][A-Za-z0-9._\\/-]{0,199}$/.test(attachmentId)")],
  ['ATTACH-NO-CONFINEMENT','boundaries',s=>s.replace("if(resolved!==path.join(base,attachmentId)||!resolved.startsWith(`${base}${path.sep}`)){\n    throw boundaryError(400,'attachment-path-invalid','Percorso allegato non confinato',{attachmentId});\n  }",'')],
  ['ATTACH-DIRECT-JOIN','storage',s=>s.replace('attachmentStoragePath(cleanPath,attachmentId)','path.join(cleanPath,attachmentId)')],
  ['SAST-JOB-CONDITIONAL','workflow',s=>s.replace('  repository-sast:\n    runs-on:','  repository-sast:\n    if: ${{ vars.ICTC_ENABLE_GHAS == \'true\' }}\n    runs-on:')],
  ['SAST-CHECK-REMOVED','workflow',s=>s.replace('      - run: node v3/security-sast-check.mjs\n','')],
  ['RUNTIME-DOD-REMOVED','workflow',s=>s.replace('      - run: node v3/security-runtime-dod-check.mjs\n','')],
  ['CHECKOUT-CREDENTIALS','workflow',s=>s.replace(/persist-credentials: false/g,'persist-credentials: true')]
];

const rows=[];
for(const [id,file,mutate] of mutants){
  const changed=mutate(baseline[file]);assert.notEqual(changed,baseline[file],`${id}: mutation did not change source`);
  const files={...baseline,[file]:changed},after=oracles(files),killedBy=Object.entries(after).filter(([name,ok])=>baseOracle[name]&&!ok).map(([name])=>name);
  const killed=killedBy.length>0;rows.push({id,file,killed,killedBy});assert.equal(killed,true,`${id} survived implementation-mutant rail`);
}
const report={schemaVersion:'1.0.0',authority:'security-implementation-mutants',baseSha:'c35ed3479eff20826bb49d8280c3ea1e37be2fdc',mutantCount:rows.length,killed:rows.filter(x=>x.killed).length,survivors:rows.filter(x=>!x.killed).length,mutants:rows,claimBoundary:'Targeted source-level implementation mutants over the remediated security topology. This establishes oracle sensitivity for named regressions; it is not exhaustive mutation coverage.'};
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(new URL('../artifacts/security-implementation-mutants.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));