import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const here=new URL('./',import.meta.url);const files={
  fi01:await readFile(new URL('public/ui/fi01-reference.js',here),'utf8'),
  encoding:await readFile(new URL('public/ui/security-encoding.js',here),'utf8'),
  network:await readFile(new URL('network-policy.mjs',here),'utf8'),
  server:await readFile(new URL('server.mjs',here),'utf8'),
  storage:await readFile(new URL('runtime/attachment-storage.mjs',here),'utf8'),
  integrity:await readFile(new URL('runtime/attachment-integrity.mjs',here),'utf8'),
  boundaries:await readFile(new URL('runtime/security-boundaries.mjs',here),'utf8'),
  workflow:await readFile(new URL('../.github/workflows/security.yml',here),'utf8')
};
const rules=[
  {id:'SAST-01',ok:!files.fi01.includes('${reference.'),evidence:'FI-01 has no direct reference.* template interpolation at the sink.'},
  {id:'SAST-02',ok:files.fi01.includes('internalReferencePanelMarkup(reference)')&&['masterSystem','masterId','masterVersion','contentSha256'].every(field=>files.encoding.includes(`htmlEsc(reference.${field})`))&&files.encoding.includes('href=safeHref(reference.referenceUrl)'),evidence:'Every externally supplied FI-01 display field uses an HTML context encoder and referenceUrl passes through the URL allowlist.'},
  {id:'SAST-03',ok:files.encoding.includes("if(!['http:','https:'].includes(url.protocol))return''"),evidence:'FI-01 href output is constrained to HTTP(S).'},
  {id:'SAST-04',ok:files.network.includes("Object.freeze({allowPrivate:env.ICTC_ALLOW_PRIVATE_AI==='1',allowInsecure:env.ICTC_ALLOW_INSECURE_AI==='1'})")&&files.network.includes("if (url.protocol !== 'https:' && !optIns.allowInsecure)"),evidence:'Private-network and insecure-transport opt-ins are independent.'},
  {id:'SAST-05',ok:files.server.includes('assertBrowserWriteBoundary(request)')&&files.server.indexOf('edgeRateLimitKey({tenantId:resolved.tenantId,remoteAddress})')<files.server.indexOf('authorizeEnterpriseActor(')&&files.server.indexOf('authorizeEnterpriseActor(')<files.server.indexOf('authenticatedRateLimitKey({tenantId:resolved.tenantId,actor'),evidence:'Write boundary is centralized; coarse edge abuse control runs before auth and subject-scoped control runs after authentication.'},
  {id:'SAST-06',ok:files.boundaries.includes('export function edgeRateLimitKey')&&files.boundaries.includes("actor?.identityMode==='trusted-header'&&subject")&&files.boundaries.includes('subject:${subject}')&&files.boundaries.includes('remote:${remote}'),evidence:'Abuse-control key spaces separate remote edge pressure from trusted authenticated subjects.'},
  {id:'SAST-07',ok:files.boundaries.includes('raw!==attachmentId')&&files.boundaries.includes("!/^[A-Za-z0-9][A-Za-z0-9._-]{0,199}$/.test(attachmentId)")&&files.boundaries.includes('attachment-path-invalid'),evidence:'Attachment identifiers are canonical single-segment values before physical path resolution.'},
  {id:'SAST-08',ok:!/[.]join\((?:cleanPath|quarantinePath|store[.](?:cleanAttachmentsPath|quarantinePath)),\s*attachmentId\)/.test(files.storage+files.integrity)&&files.storage.includes('attachmentStoragePath(')&&files.integrity.includes('attachmentStoragePath('),evidence:'Attachment metadata IDs do not feed filesystem joins directly.'},
  {id:'SAST-09',ok:/\n  repository-sast:\n/.test(files.workflow)&&files.workflow.includes('security-sast-check.mjs')&&!/repository-sast:[\s\S]{0,180}\n\s+if:/.test(files.workflow),evidence:'First-party SAST is unconditional in the security workflow.'},
  {id:'SAST-10',ok:(files.workflow.match(/actions\/checkout@/g)||[]).length===(files.workflow.match(/persist-credentials:\s*false/g)||[]).length,evidence:'Every security-workflow checkout disables credential persistence.'},
  {id:'SAST-11',ok:!Object.values(files).some(source=>/\beval\s*\(|new\s+Function\s*\(/.test(source)),evidence:'Changed security surface contains no dynamic code execution primitives.'}
];
for(const rule of rules)assert.equal(rule.ok,true,`${rule.id}: ${rule.evidence}`);
const report={schemaVersion:'1.1.0',authority:'repository-first-party-security-sast',result:'passed',ruleCount:rules.length,rules,claimBoundary:'Required first-party static analysis over the security-sensitive sinks changed by this slice. It is not equivalent to CodeQL or an independent SAST product; CodeQL remains supplemental when GHAS is available.'};await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(new URL('../artifacts/security-sast.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));