import {census,verifyInventory} from './repository-inventory.mjs';
import {writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {root} from './repository-inventory.mjs';
const base=census();verifyInventory(base);
for(const path of ['.env.example','LICENSE.md','NOTICE.md']){
  const entry=base.entries.find(x=>x.path===path);
  if(!entry||entry.purposeState!=='active-root')throw new Error('protected configuration/legal root misclassified: '+path);
}
const clone=()=>structuredClone(base);
const mutations=[
 ['omitted-file',d=>{d.entries.pop();d.status.total--;d.status.classified--;}],
 ['forged-digest',d=>{d.entries[0].sha256='0'.repeat(64);}],
 ['false-safe-delete',d=>{d.entries[0].disposition='SAFE_DELETE';}],
 ['false-registered-authority',d=>{let e=d.entries.find(x=>x.category==='document:unregistered');e.category='document:current';e.evidence='documentation-manifest';e.disposition='PROTECT_AUTHORITY';}],
 ['duplicated-path',d=>{d.entries[1].path=d.entries[0].path;}],
 ['fake-size',d=>{d.entries[0].bytes++;}],
 ['fake-total',d=>{d.status.total++;}],
 ['false-quarantine',d=>{d.status.automaticQuarantines++;}],
 ['forged-purpose-state',d=>{d.entries.find(x=>x.path==='LICENSE.md').purposeState='retirement-candidate';}],
];
const results=[];
for(const [name,mutate] of mutations){const copy=clone();mutate(copy);try{verifyInventory(copy,base);results.push({name,killed:false});}catch(error){results.push({name,killed:true,reason:String(error.message).slice(0,140)});}}
const output={cases:results.length,killed:results.filter(x=>x.killed).length,results,scope:'real tracked-tree oracle, mutated receipts rather than source code'};
mkdirSync(join(root,'artifacts'),{recursive:true});writeFileSync(join(root,'artifacts/repository-inventory-falsification.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output));if(output.killed!==output.cases)process.exit(1);
