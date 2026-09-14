import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

export const LEDGER_PATH=new URL('./uiux-p3-screenshot-allocation.json',import.meta.url);
export function readScreenshotLedger(){return JSON.parse(readFileSync(LEDGER_PATH,'utf8'));}
export function validateScreenshotLedger(ledger,{expectedOwner=null}={}){
  assert.equal(ledger?.sourceCorpus?.screenshotCount,15,'screenshot denominator must remain 15');
  const groups=[...Array(12)].map((_,i)=>`R${i+1}`);
  assert.deepEqual(ledger?.sourceCorpus?.consolidatedGroups,groups,'R1-R12 consolidation must stay lossless');
  const map=ledger?.sourceCorpus?.groupToImages||{};
  assert.deepEqual(Object.keys(map),groups,'every R-family must have an explicit image map');
  const coveredImages=new Set();
  for(const group of groups){assert.ok(Array.isArray(map[group])&&map[group].length>0,`missing image mapping for ${group}`);for(const image of map[group]){assert.ok(Number.isInteger(image)&&image>=1&&image<=15,`invalid image ${image} in ${group}`);coveredImages.add(image);}}
  assert.deepEqual([...coveredImages].sort((a,b)=>a-b),[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],'image coverage must be exactly 1..15');
  assert.equal(ledger?.split?.totalFindings,28);assert.equal(ledger?.split?.p3aOwned,22);assert.equal(ledger?.split?.p3bOwned,6);assert.equal(ledger?.split?.duplicateOwnershipAllowed,false);assert.equal(ledger?.split?.unownedAllowed,false);
  const findings=ledger?.findings||[];assert.equal(findings.length,28,'all 28 granular findings must be materialized');
  const ids=new Set(),owners={P3A:0,P3B:0},coveredGroups=new Set();
  for(const finding of findings){assert.match(finding.id,/^[AB]\d{2}$/);assert.ok(!ids.has(finding.id),`duplicate finding ${finding.id}`);ids.add(finding.id);assert.ok(['P3A','P3B'].includes(finding.owner),`unowned finding ${finding.id}`);owners[finding.owner]++;assert.ok(String(finding.description||'').trim());assert.ok(String(finding.oracle||'').trim());assert.ok(Array.isArray(finding.groups)&&finding.groups.length>0,`missing R-group ${finding.id}`);for(const group of finding.groups){assert.ok(groups.includes(group),`invalid group ${group}`);coveredGroups.add(group);}}
  assert.deepEqual(owners,{P3A:22,P3B:6});assert.equal(coveredGroups.size,12,'R1-R12 must all be represented by granular findings');
  if(expectedOwner){const owned=findings.filter(x=>x.owner===expectedOwner);assert.equal(owned.length,expectedOwner==='P3A'?22:6);}
  return Object.freeze({screenshots:'15/15',imageIds:'1..15',findings:'28/28',p3a:'22/22',p3b:'6/6',duplicates:0,unowned:0,groups:'12/12'});
}
