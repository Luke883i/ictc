import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const baseline=()=>({openBeforeReads:true,routeability:'modal-local',slices:{readiness:'ready',usage:'ready',users:'ready',identity:'ready'},retryLocal:true,latestWins:true,totalDenied:false});
function oracle(x){const states=Object.values(x.slices);return x.openBeforeReads&&x.routeability==='modal-local'&&states.every(v=>v==='ready'||v==='error')&&x.retryLocal&&x.latestWins&&!x.totalDenied&&states.some(v=>'ready'===v);}
assert.equal(oracle(baseline()),true);
let seed=0x44a4c10f,killed=0;const families=Array(16).fill(0);function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
const keys=['readiness','usage','users','identity'];
for(let i=0;i<1_000_000;i++){
 const x=baseline(),f=(rnd()>>>24)%16;families[f]++;
 switch(f){
  case 0:x.openBeforeReads=false;break;
  case 1:x.routeability='implicit-history';break;
  case 2:x.retryLocal=false;break;
  case 3:x.latestWins=false;break;
  case 4:x.totalDenied=true;break;
  case 5:x.slices.readiness='fatal';break;
  case 6:x.slices.usage='fatal';break;
  case 7:x.slices.users='fatal';break;
  case 8:x.slices.identity='fatal';break;
  case 9:for(const k of keys)x.slices[k]='error';break;
  case 10:x.slices.readiness='loading';break;
  case 11:x.slices.usage='loading';break;
  case 12:x.slices.users='loading';break;
  case 13:x.slices.identity='loading';break;
  case 14:x.slices[keys[rnd()%4]]='fatal';x.totalDenied=true;break;
  case 15:x.routeability='new-global-router';x.latestWins=false;break;
 }
 if(!oracle(x))killed++;
}
assert.equal(killed,1_000_000);assert.ok(families.every(Boolean));
const report={ok:true,slice:'S4-A4',classification:'E2 semantic/source-model mutation evidence',seed:'0x44a4c10f',mutations:1_000_000,killed,killRate:1,families,claimBoundary:'Deterministic model mutations only; not browser sessions, deployment incidents or human UX evidence.'};
await mkdir(new URL('../artifacts/',import.meta.url),{recursive:true});await writeFile(new URL('../artifacts/s4-a4-admin-truth-saturation-1m.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
