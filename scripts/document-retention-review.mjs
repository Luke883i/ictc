/** Individual risk qualification of unregistered docs not protected by two existing gates.
 * This is a deterministic, non-authoritative HOLD dossier, not an absence-of-consumers proof.
 */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,resolve,posix} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const sha=b=>createHash('sha256').update(b).digest('hex');
const tracked=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean).sort();
const docs=JSON.parse(readFileSync(join(root,'docs/documentation-manifest.json'),'utf8'));
const registered=new Set(docs.documents.map(x=>x.path));
const unregistered=tracked.filter(p=>p.startsWith('docs/')&&/\.(?:md|rst|txt)$/.test(p)&&!registered.has(p));
const searchable=tracked.filter(p=>/\.(?:md|mjs|js|json|yaml|yml|html|css|txt|py|sh)$/.test(p))
 .map(path=>({path,text:readFileSync(join(root,path),'utf8')}));
const graph=new Map(unregistered.map(p=>[p,{links:new Set(),code:new Set(),citations:new Set()}]));
function mdLinks(src,text){
 const list=[];
 for(const m of text.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)){
  const href=m[1].trim();if(!href||/^(https?:|mailto:|#|data:)/.test(href))continue;
  try{list.push(posix.normalize(posix.join(posix.dirname(src),decodeURI(href).split('#')[0])));}catch{}
 }
 return list;
}
for(const source of searchable){
 const links=source.path.endsWith('.md')?new Set(mdLinks(source.path,source.text)):new Set();
 for(const [target,counts] of graph){
  if(source.path===target)continue;
  if(links.has(target))counts.links.add(source.path);
  if((source.path.startsWith('v3/')||source.path.startsWith('.github/workflows/'))&&source.text.includes(target))counts.code.add(source.path);
  else if(source.text.includes(target))counts.citations.add(source.path);
 }
}
const protectedPaths=new Set([...graph].filter(([,e])=>e.links.size||e.code.size).map(([p])=>p));
function assess(path,body,edges){
 const headings=[...body.matchAll(/^#{1,3}\s+(.+)$/gm)].map(x=>x[1].trim()).slice(0,12);
 const isAdr=/\/decisions\//.test(path)||/\bADR[-_ ]?\d+/i.test(path);
 const isAi=/(?:^|[/_.-])(?:AI|LLM|PROMPT|AGENT|MINING)(?=[/_.-]|$)/i.test(path);
 const isOps=/(?:CONFIGURATION|SECURITY|OPERATIONS|CODESPACES|DEVOPS|ACCESSIBILITY|DEVELOPMENT)/i.test(path);
 const isHistorical=/(?:HISTORY|LINEAGE|AUDIT|REPORT|DOD|SATURATION|MIGRATION|EVOLUTION|CONVERGENCE|V\d)/i.test(path);
 const role=isAdr?'architecture-decision-history':isOps?'operational-or-onboarding-reference':isAi?'ai-development-context':isHistorical?'historical-engineering-evidence':'product-design-or-unspecified';
 const reasons=[`role:${role}`];if(edges.citations.size)reasons.push(`literal-citations:${edges.citations.size}`);
 reasons.push('external-and-human-consumers:not-measured','git-history-retention:not-adjudicated','dynamic-consumers:not-excluded');
 return {headings,role,reasons,disposition:'HOLD_REVIEW',requiredNextEvidence:[
  'human owner review of content and retention obligation',
  'Git PR provenance and release/rollback history analysis',
  'search dynamic/non-literal paths plus external consumer assessment',
  'isolated deletion with representative runtime+CI+human regression evidence'
 ]};
}
const entries=unregistered.map(path=>{
 const buf=readFileSync(join(root,path)),body=buf.toString('utf8'),edges=graph.get(path);
 const relation={markdownTargets:[...edges.links].sort(),firstPartyExecutable:[...edges.code].sort(),literalCitations:[...edges.citations].sort()};
 return {path,sha256:sha(buf),bytes:buf.length,...relation,...assess(path,body,edges)};
});
const unresolved=entries.filter(x=>!x.markdownTargets.length&&!x.firstPartyExecutable.length);
const counts=Object.fromEntries([...new Set(entries.map(x=>x.role))].sort().map(k=>[k,entries.filter(x=>x.role===k).length]));
const report={schema:'ictc-document-retention-review/v1',source:'Git-tracked tree + document manifest + literal/link consumer graph + content title/heading cues',
 registered:registered.size,unregistered:unregistered.length,protectedByObservedEdges:protectedPaths.size,
 unresolved:unresolved.length,unresolvedByRole:counts,certifiedSafeDeletes:0,physicallyRemoved:0,
 claimBoundary:'Individual file-presence/content and bounded consumer-edge evidence only; no adjudication of retention, non-literal consumption, third-party integration or human reliance. Zero delete permissions.',
 entries,unresolvedPaths:unresolved.map(x=>x.path)};
export function assertHoldContract(r){
 assert.equal(r.entries.length,r.unregistered);assert.equal(r.unresolvedPaths.length,r.unresolved);
 assert.equal(r.entries.filter(x=>!x.markdownTargets.length&&!x.firstPartyExecutable.length).length,r.unresolved);
 assert.equal(new Set(r.entries.map(x=>x.path)).size,r.entries.length);
 assert.equal(r.certifiedSafeDeletes,0);assert.equal(r.physicallyRemoved,0);
 for(const e of r.entries){assert.equal(e.disposition,'HOLD_REVIEW',e.path);
  assert.match(e.sha256,/^[0-9a-f]{64}$/);
  assert.ok(e.bytes>0);
  assert.ok(unregistered.includes(e.path),e.path);
  assert.equal(e.sha256,sha(readFileSync(join(root,e.path))),e.path);
 }
}
assertHoldContract(report);
if(process.argv.includes('--falsify')){
 const cases=[
  r=>r.entries[0].disposition='SAFE_DELETE',
  r=>r.certifiedSafeDeletes=1,
  r=>r.unresolvedPaths.pop(),
  r=>r.entries.pop(),
  r=>r.entries[1].path=r.entries[0].path,
  r=>r.entries.find(x=>!x.markdownTargets.length&&!x.firstPartyExecutable.length).firstPartyExecutable.push('forged-consumer'),
  r=>r.entries[0].sha256='0'.repeat(64)
 ];
 let killed=0;
 for(const mutate of cases){const candidate=structuredClone(report);mutate(candidate);try{assertHoldContract(candidate);}catch{killed++;}}
 assert.equal(killed,cases.length,'falsification escaped');report.negativeMutants={killed,total:cases.length};
}
mkdirSync(join(root,'artifacts'),{recursive:true});
writeFileSync(join(root,'artifacts/document-retention-review.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({ok:true,unregistered:report.unregistered,unresolved:report.unresolved,protectedByEdges:report.protectedByObservedEdges,roles:counts,negativeMutants:report.negativeMutants||null,safeDelete:0}));
