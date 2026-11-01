/** First-party executable/CI document consumers, plus real per-target deletion counterfactuals.
 * No document authority and no safe-delete or complete reachability claim. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,mkdtempSync,cpSync,renameSync,rmSync,mkdirSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
function files(dir){
 const list=[];
 for(const entry of readdirSync(dir,{withFileTypes:true})){
  const abs=join(dir,entry.name);
  if(entry.isDirectory())list.push(...files(abs));
  else if(entry.isFile()&&/\.(?:mjs|js|json|yml|yaml|py|sh|html|css|md)$/.test(entry.name))list.push(abs);
 }
 return list;
}
function consumers(base){
 const edges=[];
 for(const directory of ['v3','.github/workflows']){
  for(const file of files(join(base,directory))){
   const source=relative(base,file).replaceAll('\\','/');
   const content=readFileSync(file,'utf8');
   for(const [literal] of content.matchAll(/(?<![\w/])docs\/[\w./-]+?\.md(?![\w./-])/g)){
    if(literal.includes('..'))continue;
    edges.push({source,target:literal,kind:'first-party-literal-reference'});
   }
  }
 }
 return edges.filter((edge,i)=>edges.findIndex(x=>x.source===edge.source&&x.target===edge.target)===i)
  .sort((a,b)=>a.target.localeCompare(b.target)||a.source.localeCompare(b.source));
}
function verify(base){
 const edges=consumers(base),missing=edges.filter(x=>!existsSync(join(base,x.target)));
 return {edges,missing};
}
const baseline=verify(root);
assert.equal(baseline.missing.length,0,`Dangling first-party reference: ${JSON.stringify(baseline.missing)}`);
const docs=JSON.parse(readFileSync(join(root,'docs/documentation-manifest.json'),'utf8'));
const registered=new Set(docs.documents.map(d=>d.path));
const targets=[...new Set(baseline.edges.map(x=>x.target))].sort();
const unregistered=targets.filter(x=>!registered.has(x));
const trials=[];
if(process.argv.includes('--falsify')){
 const isolated=mkdtempSync(join(tmpdir(),'ictc-doc-exec-ref-'));
 try{
  for(const directory of ['v3','.github/workflows','docs'])cpSync(join(root,directory),join(isolated,directory),{recursive:true});
  const original=verify(isolated);assert.deepEqual(original.edges,baseline.edges);
  assert.equal(original.missing.length,0);
  for(const target of unregistered){
   const full=join(isolated,target),held=full+'.counterfactual-held',expected=hash(readFileSync(full));
   renameSync(full,held);
   let observed;
   try{observed=verify(isolated).missing;}finally{renameSync(held,full);}
   const caught=observed.some(x=>x.target===target);
   const restored=hash(readFileSync(full))===expected;
   assert.ok(caught&&restored,`missing executable-reference protection ${target}`);
   assert.deepEqual(observed.filter(x=>x.target!==target),[],`independent extra drift on ${target}`);
   trials.push({target,sha256:expected,consumerSources:baseline.edges.filter(x=>x.target===target).map(x=>x.source),physicallyRemovedAndRestored:true,missingReferenceDetected:caught,restored});
  }
 }finally{rmSync(isolated,{recursive:true,force:true});}
}
const report={schemaVersion:'ictc-executable-doc-reference/v1',source:'read-only first-party v3/ and .github/workflows/ literal graph',
 scannedReferenceEdges:baseline.edges.length,directlyReferencedDocs:targets.length,
 unregisteredReferencedDocs:unregistered.length,deletedFiles:0,certifiedSafeDeletes:0,
 falsifiedCount:trials.length,escaped:trials.filter(x=>!x.missingReferenceDetected).length,
 claimBoundary:'Only literal docs/*.md references in first-party runtime and CI sources. Dynamic imports, narrative citations, package consumers, legal retention and all external callers are unproven. No file may be deleted from this evidence.',
 edges:baseline.edges,unregisteredTrials:trials};
mkdirSync(join(root,'artifacts'),{recursive:true});
writeFileSync(join(root,'artifacts/executable-doc-reference.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({ok:true,edges:report.scannedReferenceEdges,directDocs:report.directlyReferencedDocs,unregisteredProtected:report.unregisteredReferencedDocs,physicalCounterfactuals:report.falsifiedCount,safeDeletes:0}));
