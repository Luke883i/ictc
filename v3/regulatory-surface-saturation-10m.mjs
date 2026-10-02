import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const findings=JSON.parse(readFileSync(new URL('./compliance-ontology-runtime-findings.json',import.meta.url),'utf8'));
const ledger=findings.regulatoryAuditClosureV1;
const expandLedger=ledger=>ledger.states.flatMap((state,si)=>ledger.axes.map((axis,ai)=>({id:`ASIS-${String(si+1).padStart(2,'0')}-${axis.id}`,stateOrdinal:si+1,state:state.state,category:state.category,findingId:axis.id,title:axis.title,observation:ledger.observations[ledger.observationMatrix[si][ai]],primitive:axis.primitive,runtimeRefs:axis.runtimeRefs})));
const units=expandLedger(ledger);
const familyDefs=[
 ['F01:first-plane-dominance','taskFirst',false],
 ['F02:cta-hierarchy','singlePrimaryAction',false],
 ['F03:state-action-sequence','stateActionSequence',false],
 ['F04:regulatory-discoverability','regulatoryFirstPlane',false],
 ['F05:taxonomy-naming','clearRegulatoryNaming',false],
 ['F06:progressive-disclosure','progressiveDisclosure',false],
 ['F07:scan-density','boundedDensity',false],
 ['F08:decision-evidence-adjacency','decisionEvidenceAdjacent',false],
 ['F09:cross-surface-progression','routeProgressionExplicit',false],
 ['F10:empty-state-next-action','emptyStateNextAction',false],
 ['F11:overlay-geometry-consistency','overlayGeometryConsistent',false],
 ['F12:responsive-semantic-recomposition','responsiveSemanticRecomposition',false],
 ['F13:focus-target-nonocclusion','focusTargetSafe',false],
 ['F14:source-authority-boundary','sourceAuthorityBoundary',false],
 ['F15:human-onboarding-acceptance','humanOnboardingAccept',false],
 ['fourth-service-authority','serviceAuthorityCount',4],
 ['missing-primary-source','primarySource',false],
 ['missing-drilldown','drilldown',false],
 ['law-standard-conflation','typeSeparation',false],
 ['mapping-equals-compliance','mappingIsCompliance',true],
 ['reference-equals-applicability','referenceIsApplicability',true],
 ['missing-scope-state','scopeState',false],
 ['missing-mobile-bounds','mobileBounded',false],
 ['missing-acceptance-receipt','acceptanceReceipt',false],
 ['duplicated-content-authority','contentAuthorityCount',2],
 ['missing-legal-first-plane','legalPrimerCount',4],
 ['missing-mc01-handoff','mc01Handoff',false]
];
const names=familyDefs.map(x=>x[0]);
const base={taskFirst:true,singlePrimaryAction:true,stateActionSequence:true,regulatoryFirstPlane:true,clearRegulatoryNaming:true,progressiveDisclosure:true,boundedDensity:true,decisionEvidenceAdjacent:true,routeProgressionExplicit:true,emptyStateNextAction:true,overlayGeometryConsistent:true,responsiveSemanticRecomposition:true,focusTargetSafe:true,sourceAuthorityBoundary:true,humanOnboardingAccept:true,serviceAuthorityCount:3,primarySource:true,drilldown:true,typeSeparation:true,mappingIsCompliance:false,referenceIsApplicability:false,scopeState:true,mobileBounded:true,acceptanceReceipt:true,contentAuthorityCount:1,legalPrimerCount:5,mc01Handoff:true};
function detect(m){const out=[];
 if(!m.taskFirst)out.push(names[0]);if(!m.singlePrimaryAction)out.push(names[1]);if(!m.stateActionSequence)out.push(names[2]);if(!m.regulatoryFirstPlane)out.push(names[3]);if(!m.clearRegulatoryNaming)out.push(names[4]);if(!m.progressiveDisclosure)out.push(names[5]);if(!m.boundedDensity)out.push(names[6]);if(!m.decisionEvidenceAdjacent)out.push(names[7]);if(!m.routeProgressionExplicit)out.push(names[8]);if(!m.emptyStateNextAction)out.push(names[9]);if(!m.overlayGeometryConsistent)out.push(names[10]);if(!m.responsiveSemanticRecomposition)out.push(names[11]);if(!m.focusTargetSafe)out.push(names[12]);if(!m.sourceAuthorityBoundary)out.push(names[13]);if(!m.humanOnboardingAccept)out.push(names[14]);if(m.serviceAuthorityCount!==3)out.push(names[15]);if(!m.primarySource)out.push(names[16]);if(!m.drilldown)out.push(names[17]);if(!m.typeSeparation)out.push(names[18]);if(m.mappingIsCompliance)out.push(names[19]);if(m.referenceIsApplicability)out.push(names[20]);if(!m.scopeState)out.push(names[21]);if(!m.mobileBounded)out.push(names[22]);if(!m.acceptanceReceipt)out.push(names[23]);if(m.contentAuthorityCount!==1)out.push(names[24]);if(m.legalPrimerCount!==5)out.push(names[25]);if(!m.mc01Handoff)out.push(names[26]);return out;}
function mutate(baseState,index){const m={...baseState};const [,key,value]=familyDefs[index];m[key]=value;return m;}
assert.deepEqual(detect(base),[]);
// Lossless ledger coverage: every audited F01-F15 unit has a corresponding failure family.
assert.equal(units.length,645);const findingIds=new Set(units.map(x=>x.findingId));for(let i=1;i<=15;i++)assert.ok(findingIds.has(`F${String(i).padStart(2,'0')}`));
for(const unit of units){const index=Number(unit.findingId.slice(1))-1;assert.ok(names[index].startsWith(unit.findingId+':'),unit.id);}
// Deletion oracle: every family is individually necessary and exactly attributable.
let deletion=0;for(let i=0;i<familyDefs.length;i++){const got=detect(mutate(base,i));assert.deepEqual(got,[names[i]],names[i]);deletion++;}
// No-loss pairwise compression oracle: no two families collapse into one detector.
let pairs=0;for(let i=0;i<familyDefs.length;i++)for(let j=i+1;j<familyDefs.length;j++){let m=mutate(base,i);const [,key,value]=familyDefs[j];m[key]=value;const got=new Set(detect(m));assert.ok(got.has(names[i])&&got.has(names[j])&&got.size===2,`${names[i]} + ${names[j]}`);pairs++;}
assert.equal(deletion,27);assert.equal(pairs,351);
let seed=0x51c7a1e3>>>0;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed};
const trials=10_000_000,discovery=9_000_000;let survivors=0,falsePositives=0,holdoutNovel=0;const seen=new Set(),hits=new Uint32Array(familyDefs.length);
for(let i=0;i<trials;i++){
 const chosen=[];let r=rnd()^Math.imul(i+1,2654435761);const count=1+(r&3);for(let k=0;k<count;k++){r=rnd()^Math.imul(r>>>0,2246822519);let idx=(r>>>0)%familyDefs.length;if(chosen.includes(idx))idx=(idx+k+1)%familyDefs.length;if(!chosen.includes(idx))chosen.push(idx);}
 let m={...base};for(const idx of chosen){const [,key,value]=familyDefs[idx];m[key]=value;hits[idx]++;}
 const got=detect(m),expected=new Set(chosen.map(x=>names[x]));if(!got.length)survivors++;for(const g of got){if(!expected.has(g))falsePositives++;if(i<discovery)seen.add(g);else if(!seen.has(g))holdoutNovel++;}
 if(got.length!==expected.size)survivors++;
}
assert.equal(survivors,0);assert.equal(falsePositives,0);assert.equal(holdoutNovel,0);assert.equal(seen.size,familyDefs.length);assert.ok([...hits].every(v=>v>0));
console.log(JSON.stringify({ok:true,suite:'REGULATORY-FIRST-PLANE-AUDIT-CLOSURE-1',seed:0x51c7a1e3,trials,discovery,holdout:trials-discovery,families:familyDefs.length,auditFindingUnits:units.length,deletionOracle:`${deletion}/27`,pairwiseNoLoss:`${pairs}/351`,survivors,falsePositives,novelHoldout:holdoutNovel,claimBoundary:'seeded semantic/model mutations over audit obligations; not 10M browser sessions, legal analyses, representative-human studies or deployment assurance'}));
