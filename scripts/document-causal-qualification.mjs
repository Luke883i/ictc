/** Bounded per-file counterfactual of existing docs check; NOT safe-delete certification. */
import {execFileSync,spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,cpSync,renameSync,rmSync,mkdtempSync} from 'node:fs';
import {join,resolve,dirname,posix} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {root} from './repository-inventory.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');
const manifest=JSON.parse(readFileSync(join(root,'docs/documentation-manifest.json'),'utf8'));
const tracked=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean).sort();
const registered=new Set(manifest.documents.map(d=>d.path));
const candidates=tracked.filter(p=>p.startsWith('docs/')&&/\.(?:md|rst|txt)$/.test(p)&&!registered.has(p));
const sources=tracked.filter(p=>/\.(?:md|mjs|js|json|yaml|yml|html|css|txt|py|sh)$/.test(p)).map(p=>{
 try{return {path:p,text:readFileSync(join(root,p),'utf8')}}catch{return {path:p,text:''}}
});
function incoming(path){const list=[];for(const source of sources){if(source.path===path)continue;
 let mode=null;if(source.text.includes(path))mode='full-path-literal';
 else if(source.path.endsWith('.md')){const base=posix.basename(path);
  if(source.text.includes(base)){
   const links=[...source.text.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)].map(x=>decodeURI(x[1]).replace(/^\.\//,''));
   if(links.some(x=>posix.normalize(posix.join(posix.dirname(source.path),x))===path))mode='resolved-markdown-link';
  }
 }
 if(mode)list.push({path:source.path,evidence:mode,kind:source.path.startsWith('docs/')?'document':source.path.startsWith('v3/')?'software-or-test':'repository'});
}return list;}
function classOf(path,body,links){const first=(body.match(/^#\s+(.+)$/m)||[])[1]||null;
 let topic='design-or-study';if(path.startsWith('docs/decisions/'))topic='architecture-decision';
 else if(/(?:PROMPT|AGENT|MINING)/i.test(path))topic='ai-development-context';
 else if(/(?:OPS|OPERATIONS|CONFIGURATION|SECURITY|DEVOPS|CODESPACES|ACCESSIBILITY|TESTING|RUNTIME_AUDIT)/i.test(path))topic='operational-reference';
 else if(/(?:DOD|AUDIT|SATURATION|REPORT|RELEASE|CONVERGENCE|STABLE|MIGRATION)/i.test(path))topic='development-evidence-or-history';
 const codeRefs=links.filter(x=>x.kind==='software-or-test').length;
 return {title:first,topic,codeReferences:codeRefs,documentReferences:links.filter(x=>x.kind==='document').length,
  disposition:'HOLD_REVIEW',reason:codeRefs?'source-level code/test references: removal requires behavioral consumer proof':links.length?'referenced by repository content: preserve pending dependency review':'unreferenced by bounded literal/link scan: dynamic and external consumers unproven'};
}
const sandbox=mkdtempSync(join(tmpdir(),'ictc-doc-causal-'));
let cases=[];try{
 cpSync(root,sandbox,{recursive:true,filter:p=>{const rel=p.slice(root.length).replace(/^\//,'');return !((rel==='.git'||rel.startsWith('.git/'))||rel==='artifacts'||rel.startsWith('artifacts/')||rel==='node_modules'||rel.startsWith('node_modules/'));}});
 const check=()=>spawnSync(process.execPath,['scripts/documentation-lattice-check.mjs'],{cwd:sandbox,encoding:'utf8',timeout:30000});
 const base=check();if(base.status!==0)throw Error('isolated docs:check baseline failed: '+(base.stderr||base.stdout).slice(-500));
 for(const path of candidates){const buf=readFileSync(join(root,path));const body=buf.toString('utf8'),links=incoming(path),current=join(sandbox,path),held=current+'.counterfactual-held';
  renameSync(current,held);let probe;try{probe=check();}finally{renameSync(held,current);}
  if(probe.error||probe.signal)throw Error('counterfactual inconclusive: '+path+' '+(probe.error?.message||probe.signal));
  const restored=hash(readFileSync(current))===hash(buf);if(!restored)throw Error('restore mismatch: '+path);
  cases.push({path,sha256:hash(buf),bytes:buf.length,...classOf(path,body,links),incoming:links,counterfactual:{command:'node scripts/documentation-lattice-check.mjs',exit:probe.status,detectedByExistingDocsCheck:probe.status!==0,restored,scope:'existing docs manifest/links gate only; other runtime and external consumers not exercised'}});
 }
 const byOutcome={};for(const c of cases)byOutcome[c.topic]=(byOutcome[c.topic]||0)+1;
 const result={schema:'ictc-doc-causal-qualification/v1',baseSource:'tracked Git files + documentation manifest + full-text/relative-link references + real isolated file removal',total:candidates.length,qualified:cases.length,missing:candidates.filter(p=>!cases.some(c=>c.path===p)),summary:byOutcome,physicallyRemovedFiles:0,safeDeleteDecisions:0,claimBoundary:'Per-file causal counterfactual ONLY for existing docs check; a passing deletion probe exposes a gate gap, NEVER certifies safe deletion. All 149 kept HOLD_REVIEW; external and dynamic consumers not proven absent.',cases};
 verifyQualification(result,candidates);
 mkdirSync(join(root,'artifacts'),{recursive:true});writeFileSync(join(root,'artifacts/document-causal-qualification.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({ok:true,total:result.total,qualified:result.qualified,summary:result.summary,removalDetected:cases.filter(c=>c.counterfactual.detectedByExistingDocsCheck).length,safeDeleteDecisions:0}));
}finally{rmSync(sandbox,{recursive:true,force:true});}
export function verifyQualification(result,expected){if(result.total!==expected.length||result.qualified!==expected.length||result.missing.length||new Set(result.cases.map(c=>c.path)).size!==expected.length||result.physicallyRemovedFiles!==0||result.safeDeleteDecisions!==0)throw Error('census or unsafe disposal drift');for(const c of result.cases){if(!expected.includes(c.path)||!c.sha256||c.disposition!=='HOLD_REVIEW'||!c.counterfactual.restored||!Number.isInteger(c.counterfactual.exit))throw Error('missing individual causal evidence: '+c.path);}return true;}
