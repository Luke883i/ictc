import assert from 'node:assert/strict';

export const LAWS=Object.freeze([
'intent-immediacy','semantic-truth-continuity','perceptual-cognitive-beauty','interaction-accessibility-continuity',
'cross-surface-enterprise-coherence','authority-minimality','future-procedure-morphism','human-evidence-governance']);

export function baseline(){return {
 intent:{identity:1,purpose:1,primary:1,firstViewport:1,questionNear:1,whyNow:1,dead:0,detour:0,modalPurpose:1,helpAdjacent:1},
 truth:{identityStable:1,lifecycleLegal:1,handoffTyped:1,handoffDecision:0,unknownPreserved:1,conflictVisible:1,proposalDistinct:1,mappingDistinct:1,completionDistinct:1,ratingDistinct:1,approvalDistinct:1,hashDistinct:1,evidenceDistinct:1},
 beauty:{signal:.8,emphasis:2,depth:1,badges:2,facts:3,questions:1,rhythm:1,whitespace:1,typeHierarchy:4,alignment:1,iconFamily:1,colorStable:1,decorNoise:0,layoutShift:0,destructiveDistinct:1,tooltipOnly:0,labelBounded:1},
 interaction:{keyboard:1,focus:1,nonColor:1,zoom:1,reducedMotion:1,touch:1,errorAssociated:1,modalReturn:1,staleProtected:1,retryIdempotent:1,recovery:1,originalPreserved:1,receipt:1,disabledReason:1,batchScope:1,selectionCount:1,stickySafe:1},
 coherence:{rolePlacement:1,statusVocabulary:1,actionGrammar:1,evidenceGrammar:1,boundaryPlacement:1,responsiveOrder:1,firstPlaneBudgets:1,spacingTokens:1,dateFormat:1,numberFormat:1,oneOffCss:0,oneOffPrimitive:0},
 authority:{owner:1,visualOwner:1,aiDecision:0,auditorWrite:0,unauthorizedVisible:0,parity:1,legacyFirstPlane:0,compatRetirement:1,huxCss:0,huxListener:0,huxWrite:0,huxSecondRegistry:0,hardcodedIds:0},
 future:{dynamicDiscovery:1,ownerDerived:1,actionDerived:1,boundaryDerived:1,protocolAuto:1,specialCase:0,newCss:0,newTokens:0,newPrimitive:0,coreEdit:0,unknownRoleSafe:1,readOnlySafe:1,archetypeDeclared:1,roleModesDeclared:1,sectionGrammar:1},
 human:{auditor:1,novice:1,experienced:1,keyboard:1,assistive:1,procedureCoverage:1,nextActionMetric:1,sus:1,buildBinding:1,severity:1,criticalStop:1,roleMatrix:1,pleasantness:1,retention:1,misclick:1,abandonment:1,feedbackRegression:1,e3AutoClaim:0}
};}

export function violations(x){const out=[];
 const i=x.intent,t=x.truth,b=x.beauty,a=x.interaction,c=x.coherence,o=x.authority,f=x.future,h=x.human;
 if(!(i.identity&&i.purpose&&i.primary===1&&i.firstViewport&&i.questionNear&&i.whyNow&&!i.dead&&!i.detour&&i.modalPurpose&&i.helpAdjacent))out.push(LAWS[0]);
 if(!(t.identityStable&&t.lifecycleLegal&&t.handoffTyped&&!t.handoffDecision&&t.unknownPreserved&&t.conflictVisible&&t.proposalDistinct&&t.mappingDistinct&&t.completionDistinct&&t.ratingDistinct&&t.approvalDistinct&&t.hashDistinct&&t.evidenceDistinct))out.push(LAWS[1]);
 if(!(b.signal>=.7&&b.emphasis<=3&&b.depth<=2&&b.badges<=4&&b.facts<=4&&b.questions<=1&&b.rhythm&&b.whitespace&&b.typeHierarchy>=3&&b.typeHierarchy<=5&&b.alignment&&b.iconFamily&&b.colorStable&&!b.decorNoise&&!b.layoutShift&&b.destructiveDistinct&&!b.tooltipOnly&&b.labelBounded))out.push(LAWS[2]);
 if(!(a.keyboard&&a.focus&&a.nonColor&&a.zoom&&a.reducedMotion&&a.touch&&a.errorAssociated&&a.modalReturn&&a.staleProtected&&a.retryIdempotent&&a.recovery&&a.originalPreserved&&a.receipt&&a.disabledReason&&a.batchScope&&a.selectionCount&&a.stickySafe))out.push(LAWS[3]);
 if(!(c.rolePlacement&&c.statusVocabulary&&c.actionGrammar&&c.evidenceGrammar&&c.boundaryPlacement&&c.responsiveOrder&&c.firstPlaneBudgets&&c.spacingTokens&&c.dateFormat&&c.numberFormat&&!c.oneOffCss&&!c.oneOffPrimitive))out.push(LAWS[4]);
 if(!(o.owner===1&&o.visualOwner===1&&!o.aiDecision&&!o.auditorWrite&&!o.unauthorizedVisible&&o.parity&&!o.legacyFirstPlane&&o.compatRetirement&&!o.huxCss&&!o.huxListener&&!o.huxWrite&&!o.huxSecondRegistry&&!o.hardcodedIds))out.push(LAWS[5]);
 if(!(f.dynamicDiscovery&&f.ownerDerived&&f.actionDerived&&f.boundaryDerived&&f.protocolAuto&&!f.specialCase&&!f.newCss&&!f.newTokens&&!f.newPrimitive&&!f.coreEdit&&f.unknownRoleSafe&&f.readOnlySafe&&f.archetypeDeclared&&f.roleModesDeclared&&f.sectionGrammar))out.push(LAWS[6]);
 if(!(h.auditor&&h.novice&&h.experienced&&h.keyboard&&h.assistive&&h.procedureCoverage&&h.nextActionMetric&&h.sus&&h.buildBinding&&h.severity&&h.criticalStop&&h.roleMatrix&&h.pleasantness&&h.retention&&h.misclick&&h.abandonment&&h.feedbackRegression&&!h.e3AutoClaim))out.push(LAWS[7]);
 return out;}

export const MUTATORS=Object.freeze([
 ['intent',x=>x.intent.firstViewport=0],['dead-control',x=>x.intent.dead=1],['modal-purpose',x=>x.intent.modalPurpose=0],['help-detached',x=>x.intent.helpAdjacent=0],
 ['unknown-guessed',x=>x.truth.unknownPreserved=0],['handoff-decision',x=>x.truth.handoffDecision=1],['hash-truth',x=>x.truth.hashDistinct=0],
 ['signal-collapse',x=>x.beauty.signal=.4],['clutter',x=>x.beauty.emphasis=7],['deep-nesting',x=>x.beauty.depth=4],['rhythm',x=>x.beauty.rhythm=0],['destructive',x=>x.beauty.destructiveDistinct=0],['tooltip-only',x=>x.beauty.tooltipOnly=1],
 ['keyboard',x=>x.interaction.keyboard=0],['focus',x=>x.interaction.focus=0],['stale',x=>x.interaction.staleProtected=0],['retry',x=>x.interaction.retryIdempotent=0],['batch-scope',x=>x.interaction.batchScope=0],['sticky-focus',x=>x.interaction.stickySafe=0],
 ['terminology',x=>x.coherence.statusVocabulary=0],['responsive',x=>x.coherence.responsiveOrder=0],['date',x=>x.coherence.dateFormat=0],['oneoff-css',x=>x.coherence.oneOffCss=1],
 ['second-owner',x=>x.authority.owner=2],['auditor-write',x=>x.authority.auditorWrite=1],['legacy-first-plane',x=>x.authority.legacyFirstPlane=1],['hux-listener',x=>x.authority.huxListener=1],['hardcoded-id',x=>x.authority.hardcodedIds=1],
 ['future-special-case',x=>x.future.specialCase=1],['future-core-edit',x=>x.future.coreEdit=1],['future-role',x=>x.future.unknownRoleSafe=0],['future-grammar',x=>x.future.sectionGrammar=0],
 ['human-coverage',x=>x.human.procedureCoverage=0],['pleasantness-missing',x=>x.human.pleasantness=0],['critical-stop',x=>x.human.criticalStop=0],['auto-e3',x=>x.human.e3AutoClaim=1]
]);

export function mutate(base,index){const x=structuredClone(base),m=MUTATORS[index%MUTATORS.length];m[1](x);return [m[0],x];}
export function ablation(){const witnesses={}; for(let li=0;li<LAWS.length;li++){const law=LAWS[li];witnesses[law]=MUTATORS.some(([,m])=>{const x=baseline();m(x);const v=violations(x);return v.length===1&&v[0]===law;});assert.equal(witnesses[law],true,`missing ablation witness ${law}`);} return witnesses;}
