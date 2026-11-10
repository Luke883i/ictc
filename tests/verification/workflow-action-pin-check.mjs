import assert from 'node:assert/strict';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const workflowDir=path.resolve('.github/workflows'),files=(await readdir(workflowDir)).filter(name=>/\.ya?ml$/i.test(name)).sort(),violations=[],rows=[];
const remoteUses=/^\s*-?\s*uses:\s*([^\s#]+)(?:\s*#.*)?$/gm,shaRef=/^[^@\s]+@[a-f0-9]{40}$/i;
// Names describe the capability, not the migration epoch or YAML filename. The
// existing paths, job IDs and check contexts remain their operational identity.
const titlePattern=/^[A-Z][A-Za-z ]+ \| [^\n]{8,}$/;
const seenTitles=new Set();

for(const name of files){const text=await readFile(path.join(workflowDir,name),'utf8');
 const title=(text.match(/^name:\s*(.+)$/m)||[])[1]?.trim()||'';
 if(!titlePattern.test(title))violations.push({file:name,name:title,reason:'workflow-title-not-descriptive'});
 if(seenTitles.has(title))violations.push({file:name,name:title,reason:'workflow-title-collision'});
 seenTitles.add(title);
 const automatic=/^\s{0,2}(pull_request|push|schedule):\s*$/m.test(text)||/^\s*on:\s*\[[^\]\n]*(?:pull_request|push|schedule)[^\]\n]*\]/m.test(text);let matches=0,pinned=0;for(const match of text.matchAll(remoteUses)){const value=match[1];if(value.startsWith('./')||value.startsWith('docker://'))continue;matches+=1;if(shaRef.test(value))pinned+=1;else violations.push({file:name,uses:value,automatic});}rows.push({file:name,title,automatic,remoteUses:matches,pinned});}
const report={schemaVersion:'1.1.0',ok:violations.length===0,scope:'all 53 repository workflows, including workflow_dispatch-only; semantic titles and immutable action refs',rows,violations,claimBoundary:'This guard proves full-length SHA references for declared remote uses in repository workflows, including manually dispatched historical gates. Publisher identity, transitive actions, runtime execution, provenance and independent review are separate controls.'};await mkdir('artifacts',{recursive:true});await writeFile('artifacts/workflow-action-pin-check.json',JSON.stringify(report,null,2)+'\n');if(violations.length)console.error(`::error title=workflow-action-pin-check::${violations.map(v=>`${v.file}:${v.uses||v.reason}`).join(' | ')}`);assert.equal(violations.length,0,`Workflow metadata or action references violate contract: ${violations.map(v=>`${v.file}:${v.uses||v.reason}`).join(', ')}`);console.log('workflow-action-pin-check: ok',{workflows:rows.length,remoteUses:rows.reduce((n,row)=>n+row.remoteUses,0),pinned:rows.reduce((n,row)=>n+row.pinned,0),manualOnly:rows.filter(row=>!row.automatic).length,semanticTitles:rows.filter(row=>titlePattern.test(row.title)).length,distinctTitles:seenTitles.size});
