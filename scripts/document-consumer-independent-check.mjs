/** Independent, fail-closed reference scan; NOT an alternative document authority. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,posix} from 'node:path';
import {root} from './repository-inventory.mjs';
const tracked=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean).sort();
const manifest=JSON.parse(readFileSync(join(root,'docs/documentation-manifest.json'),'utf8'));
const registered=new Set(manifest.documents.map(x=>x.path));
const retained=new Set(manifest.documents.filter(x=>x.retentionCohort==='post275-residual'&&!x.authoritative).map(x=>x.path));
const documents=tracked.filter(x=>x.startsWith('docs/')&&/\.(?:md|rst|txt)$/.test(x)&&retained.has(x));
assert.equal(documents.length,retained.size,'post275 cohort membership drift');
const candidateSources=tracked.filter(x=>/\.(?:md|mjs|js|json|ya?ml|py|sh|html|css|txt|rst)$/.test(x));
const sources=candidateSources.map(path=>({path,text:readFileSync(join(root,path),'utf8')}));
const digest=v=>createHash('sha256').update(v).digest('hex');
function scanLinkTargets(path,text){
 const found=new Set();
 // Markdown links/images; exclude URL fragments, HTTP, mailto and external links.
 for(const match of text.matchAll(/!?\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))(?:\s+[^)]*)?\)/g)){
  const raw=(match[1]||match[2]).split('#')[0].split('?')[0];
  if(!raw||/^(https?:|mailto:|data:|\/)/i.test(raw))continue;
  let decoded;try{decoded=decodeURIComponent(raw);}catch{continue;}
  found.add(posix.normalize(posix.join(posix.dirname(path),decoded)));
 }
 return found;
}
const knownPaths=new Set(tracked);const edges=[];const cases=[];
for(const doc of documents){
 const readers=[];const base=posix.basename(doc),dir=posix.dirname(doc);
 for(const src of sources){if(src.path===doc)continue;
  const link=src.path.endsWith('.md')&&scanLinkTargets(src.path,src.text).has(doc);
  const exact=src.text.includes(doc);
  const stem=src.text.includes(base)&&!exact&&!link;
  if(!link&&!exact&&!stem)continue;
  const mode=link?'resolved-markdown-link':exact?'exact-path-literal':'basename-mention-unresolved';
  const consumer=['src/','tests/','public/','scripts/','.github/workflows/'].some(prefix=>src.path.startsWith(prefix));
  const confidence=mode==='basename-mention-unresolved'?'LOW':consumer&&exact?'MEDIUM':'MEDIUM';
  readers.push({source:src.path,mode,confidence});
  if(link||exact)edges.push({from:src.path,to:doc,mode});
 }
 const bytes=readFileSync(join(root,doc));
 cases.push({path:doc,sha256:digest(bytes),bytes:bytes.length,readers,
  independentRisk:readers.length?'OBSERVED_MENTION_OR_LINK':'NO_OBSERVED_REFERENCE_IN_BOUNDED_SCAN',
  decision:'HOLD_UNKNOWN',deletionAuthorized:false,
  unresolved:['external references','runtime dynamic paths','retention obligations','PR provenance','human usage and owner sign-off']});
}
function verify(report){
 assert.equal(report.qualified,documents.length);
 assert.equal(report.safeDeletes,0);assert.equal(report.cases.length,documents.length);
 assert.equal(new Set(report.cases.map(x=>x.path)).size,documents.length);
 assert.deepEqual(report.cases.map(x=>x.path).sort(),[...documents].sort());
 for(const item of report.cases){
  assert.ok(knownPaths.has(item.path));assert.equal(item.decision,'HOLD_UNKNOWN');assert.equal(item.deletionAuthorized,false);
  assert.equal(item.sha256,digest(readFileSync(join(root,item.path))));
  assert.ok(item.unresolved.length>=5);
 }
}
const report={schema:'ictc-independent-doc-consumer-scan/v1',qualified:cases.length,edges:edges.length,
 documentsWithObservations:cases.filter(x=>x.readers.length).length,
 withoutObservations:cases.filter(x=>!x.readers.length).length,
 safeDeletes:0,comparisonNote:'Independently parsed Markdown links and literal paths; unresolved basename matches are never treated as reachability. The former derived graph is NOT used as an input.',
 claimBoundary:'Repository text scan cannot observe external consumer, dynamic runtime reachability or retention. ZERO safe deletion claims. All tracked unregistered documents remain HOLD.',cases};
verify(report);
if(process.argv.includes('--falsify')){
 const fixtures=[
  ['docs/x/README.md','[target](../TARGET.md)','docs/TARGET.md',true],
  ['docs/x/README.md','![screenshot](../TARGET.md)','docs/TARGET.md',true],
  ['docs/x/README.md','[external](https://example.org/TARGET.md)','docs/TARGET.md',false],
  ['docs/x/README.md','[other](TARGET.md)','docs/TARGET.md',false],
  ['docs/x/README.md','[target](../TARGET.md#heading)','docs/TARGET.md',true],
  ['docs/x/README.md','[bad](mailto:target@x.test)','docs/TARGET.md',false]
 ];
 for(const [p,text,target,expected] of fixtures)assert.equal(scanLinkTargets(p,text).has(target),expected,`fixture ${text}`);
 const attackers=[x=>x.safeDeletes++,x=>x.cases[0].decision='SAFE_DELETE',x=>x.cases[0].deletionAuthorized=true,
  x=>x.cases[0].sha256='0'.repeat(64),x=>x.cases.pop(),x=>x.cases[1].path=x.cases[0].path,
  x=>x.cases[0].unresolved=[],x=>x.qualified--];
 let killed=0;for(const fn of attackers){const m=structuredClone(report);fn(m);try{verify(m);}catch{killed++;}}
 assert.equal(killed,attackers.length);
 report.negativeChecks={linkFixtures:fixtures.length,forgedReceiptsKilled:killed};
}
mkdirSync(join(root,'artifacts'),{recursive:true});writeFileSync(join(root,'artifacts/independent-document-consumer-scan.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({ok:true,qualified:report.qualified,observed:report.documentsWithObservations,notObserved:report.withoutObservations,negative:report.negativeChecks||null,safeDeletes:0}));
