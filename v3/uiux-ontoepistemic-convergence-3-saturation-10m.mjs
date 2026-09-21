import assert from 'node:assert/strict';
const base=()=>({sourceTruth:1,lateRewrite:0,collections:1,missingFallback:true,resolvedReveal:true,progressiveStable:true,orientation:1,auditorWrites:0,recordFilledPrimary:0,epTechnicalFirst:0,aiSettingsOwners:1,footerOverlay:0,mobileOverflow:0,dialogFocus:true,businessWriteAuthorities:1,procedures:7});
function fail(s){const f=[];if(!s.sourceTruth||s.lateRewrite)f.push('R1');if(s.collections!==1||!s.missingFallback||!s.resolvedReveal||!s.progressiveStable)f.push('R2');if(s.orientation!==1)f.push('R3');if(s.auditorWrites)f.push('R4');if(s.recordFilledPrimary)f.push('R5');if(s.epTechnicalFirst||s.aiSettingsOwners!==1)f.push('R6');if(s.footerOverlay||s.mobileOverflow||!s.dialogFocus)f.push('R7');if(s.businessWriteAuthorities!==1||s.procedures!==7)f.push('P0');return[...new Set(f)];}
const F=[
 ['source-class-lost',s=>s.sourceTruth=0],['late-confidence-rewrite',s=>s.lateRewrite=1],['duplicate-worklist',s=>s.collections=2],['fallback-on-geometry',s=>s.missingFallback=false],
 ['resolved-target-hidden',s=>s.resolvedReveal=false],['overflow-rebuild-cycle',s=>s.progressiveStable=false],['orientation-lost',s=>s.orientation=0],['orientation-duplicate',s=>s.orientation=2],['auditor-question-write',s=>s.auditorWrites=1],
 ['auditor-close-write',s=>s.auditorWrites=2],['record-filled-primary',s=>s.recordFilledPrimary=1],['record-primary-wall',s=>s.recordFilledPrimary=4],['ep-technical-first',s=>s.epTechnicalFirst=1],
 ['second-ai-settings',s=>s.aiSettingsOwners=2],['missing-ai-settings',s=>s.aiSettingsOwners=0],['fixed-footer',s=>s.footerOverlay=1],['mobile-overflow',s=>s.mobileOverflow=1],
 ['dialog-focus-loss',s=>s.dialogFocus=false],['second-write-authority',s=>s.businessWriteAuthorities=2],['eighth-procedure',s=>s.procedures=8],['missing-procedure',s=>s.procedures=6]
];
assert.deepEqual(fail(base()),[]);for(const row of F){const s=base();row[1](s);assert.ok(fail(s).length,row[0]);}
let seed=0x3f0f2026;const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};const hits=Object.fromEntries(F.map(row=>[row[0],0])),TOTAL=10_000_000;
for(let i=0;i<TOTAL;i++){const s=base(),depth=1+(rnd()%4),chosen=new Set();while(chosen.size<depth)chosen.add(rnd()%F.length);for(const k of chosen){F[k][1](s);hits[F[k][0]]++;}if(!fail(s).length)throw new Error('survivor '+i);}
assert.ok(Object.values(hits).every(n=>n>0));
console.log(JSON.stringify({ok:true,slice:'UIUX-ONTOEPISTEMIC-CONVERGENCE-3',trials:TOTAL,killed:TOTAL,survivors:0,families:F.length,seed:'0x3f0f2026',reticulumLaws:8,claimBoundary:'10,000,000 deterministic semantic/model compositions; not browser sessions, users, accessibility certification, legal proof or deployment effectiveness.'}));
