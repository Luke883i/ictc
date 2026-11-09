export const ONTOLOGY_AXES=Object.freeze([
  'identity','purpose','subject','state','next-action','effect','authority','evidence','uncertainty','scope','references','human-decision','claim-boundary'
]);
export const END_USER_QUESTIONS=Object.freeze([
  ['identity','Dove sono e quale procedura sto usando?'],
  ['purpose','A cosa serve questa superficie?'],
  ['subject','Su quale record o oggetto sto lavorando?'],
  ['state','Quale stato è rilevante adesso?'],
  ['next-action','Che cosa richiede attenzione adesso?'],
  ['effect','Che cosa cambia se uso questo controllo?'],
  ['authority','Posso modificare o sto solo osservando?'],
  ['evidence','Perché ICTC mostra questa informazione?'],
  ['uncertainty','Che cosa resta ignoto o da verificare?'],
  ['scope','Come vedo elementi non azionabili o terminali?'],
  ['references','Quali standard, fonti o basi sono pertinenti?'],
  ['human-decision','Quale giudizio resta umano?'],
  ['claim-boundary','La UI sta descrivendo evidenza o sta implicando conformità/certificazione?']
]);
export const MUTATION_FAMILIES=Object.freeze({
 editorial:Object.freeze(['duplicate-title','duplicate-count','duplicate-context-label','generic-action-copy','raw-state-copy','mixed-language-axis','verbose-primary-row','hidden-empty-guidance','reference-heading-undifferentiated','terminal-copy-as-next-action']),
 semantic:Object.freeze(['unknown-to-negative','method-evidence-to-certification','visibility-to-access-sufficiency','technical-coherence-to-compliance','navigation-to-write-effect','role-boundary-collapse','worklist-native-drift','unstable-target-binding','terminal-default-leak','applicability-use-mapping-collapse','source-verification-impact-collapse','human-decision-automation']),
 visual:Object.freeze(['two-visible-collections','two-filter-bars','dominant-arrow','oversized-status-badge','weak-reference-band','modal-horizontal-overflow','multiple-vertical-scroll-owners','mobile-page-overflow','undersized-close-target','material-aside-width-theft','card-wall-density','primary-action-overload']),
 ontology:Object.freeze(['missing-identity','missing-purpose','missing-subject','missing-state','missing-next-action','missing-effect','missing-authority','missing-evidence','missing-uncertainty','missing-scope','missing-references','missing-human-decision','missing-claim-boundary','duplicate-axis-owner'])
});
export const ALL_MUTATIONS=Object.freeze(Object.entries(MUTATION_FAMILIES).flatMap(([category,names])=>names.map(name=>({category,name}))));
export function baseline(overrides={}){
 return {
  axisOwners:Object.fromEntries(ONTOLOGY_AXES.map(x=>[x,1])),
  visibleCollections:1,filterBars:1,duplicateTitles:0,duplicateCounts:0,contextLabels:1,
  actionCopy:'specific',rawStateCopy:false,mixedLanguageAxis:false,rowWordCount:16,emptyGuidance:true,
  referenceBand:'strong',terminalPresentedAsNext:false,unknownSemantics:'unknown',methodEvidenceClaim:'bounded',
  visibilityClaim:'role-view',technicalClaim:'coherence',effect:'navigate',role:'admin',writeVisible:true,
  worklistCount:4,nativeActionableCount:4,binding:'typed-stable',defaultTerminalVisible:false,axesSeparated:true,
  sourceAxesSeparated:true,humanDecisionPreserved:true,arrowArea:.02,statusBadgeArea:.06,modalOverflowX:0,
  verticalScrollOwners:1,mobileOverflowX:0,closeTarget:44,materialAside:false,recordsPerScreen:7,primaryActions:1,
  answers:Object.fromEntries(END_USER_QUESTIONS.map(([id])=>[id,true])),...overrides
 };
}
export function evaluate(s){
 const f=[];
 for(const axis of ONTOLOGY_AXES){if((s.axisOwners?.[axis]??0)!==1)f.push(`axis:${axis}`);}
 if(Object.values(s.axisOwners||{}).some(v=>v>1))f.push('duplicate-axis-owner');
 if(s.visibleCollections!==1)f.push('two-visible-collections');if(s.filterBars!==1)f.push('two-filter-bars');
 if(s.duplicateTitles)f.push('duplicate-title');if(s.duplicateCounts)f.push('duplicate-count');if(s.contextLabels!==1)f.push('duplicate-context-label');
 if(s.actionCopy!=='specific')f.push('generic-action-copy');if(s.rawStateCopy)f.push('raw-state-copy');if(s.mixedLanguageAxis)f.push('mixed-language-axis');if(s.rowWordCount>28)f.push('verbose-primary-row');if(!s.emptyGuidance)f.push('hidden-empty-guidance');if(s.referenceBand!=='strong')f.push('reference-heading-undifferentiated');if(s.terminalPresentedAsNext)f.push('terminal-copy-as-next-action');
 if(s.unknownSemantics!=='unknown')f.push('unknown-to-negative');if(s.methodEvidenceClaim!=='bounded')f.push('method-evidence-to-certification');if(s.visibilityClaim!=='role-view')f.push('visibility-to-access-sufficiency');if(s.technicalClaim!=='coherence')f.push('technical-coherence-to-compliance');
 if(!['navigate','inspect','evidence','decide','control'].includes(s.effect))f.push('navigation-to-write-effect');if(s.role==='auditor'&&s.writeVisible)f.push('role-boundary-collapse');if(s.worklistCount!==s.nativeActionableCount)f.push('worklist-native-drift');if(!['typed-stable','stable-id'].includes(s.binding))f.push('unstable-target-binding');if(s.defaultTerminalVisible)f.push('terminal-default-leak');if(!s.axesSeparated)f.push('applicability-use-mapping-collapse');if(!s.sourceAxesSeparated)f.push('source-verification-impact-collapse');if(!s.humanDecisionPreserved)f.push('human-decision-automation');
 if(s.arrowArea>.08)f.push('dominant-arrow');if(s.statusBadgeArea>.16)f.push('oversized-status-badge');if(s.modalOverflowX>2)f.push('modal-horizontal-overflow');if(s.verticalScrollOwners>1)f.push('multiple-vertical-scroll-owners');if(s.mobileOverflowX>1)f.push('mobile-page-overflow');if(s.closeTarget<44)f.push('undersized-close-target');if(s.materialAside)f.push('material-aside-width-theft');if(s.recordsPerScreen<4)f.push('card-wall-density');if(s.primaryActions>1)f.push('primary-action-overload');
 for(const [id] of END_USER_QUESTIONS)if(!s.answers?.[id])f.push(`question:${id}`);
 return [...new Set(f)];
}
export function mutate(s,name){
 const axis=name.startsWith('missing-')?name.slice(8):null;if(axis&&ONTOLOGY_AXES.includes(axis)){s.axisOwners[axis]=0;s.answers[axis]=false;return;}
 const m={
  'duplicate-axis-owner':()=>s.axisOwners.state=2,'duplicate-title':()=>s.duplicateTitles=1,'duplicate-count':()=>s.duplicateCounts=1,'duplicate-context-label':()=>s.contextLabels=2,'generic-action-copy':()=>s.actionCopy='generic','raw-state-copy':()=>s.rawStateCopy=true,'mixed-language-axis':()=>s.mixedLanguageAxis=true,'verbose-primary-row':()=>s.rowWordCount=42,'hidden-empty-guidance':()=>s.emptyGuidance=false,'reference-heading-undifferentiated':()=>s.referenceBand='weak','terminal-copy-as-next-action':()=>s.terminalPresentedAsNext=true,
  'unknown-to-negative':()=>s.unknownSemantics='negative','method-evidence-to-certification':()=>s.methodEvidenceClaim='certified','visibility-to-access-sufficiency':()=>s.visibilityClaim='sufficient-access','technical-coherence-to-compliance':()=>s.technicalClaim='compliant','navigation-to-write-effect':()=>s.effect='write','role-boundary-collapse':()=>{s.role='auditor';s.writeVisible=true},'worklist-native-drift':()=>s.nativeActionableCount=s.worklistCount+1,'unstable-target-binding':()=>s.binding='index','terminal-default-leak':()=>s.defaultTerminalVisible=true,'applicability-use-mapping-collapse':()=>s.axesSeparated=false,'source-verification-impact-collapse':()=>s.sourceAxesSeparated=false,'human-decision-automation':()=>s.humanDecisionPreserved=false,
  'two-visible-collections':()=>s.visibleCollections=2,'two-filter-bars':()=>s.filterBars=2,'dominant-arrow':()=>s.arrowArea=.2,'oversized-status-badge':()=>s.statusBadgeArea=.3,'weak-reference-band':()=>s.referenceBand='weak','modal-horizontal-overflow':()=>s.modalOverflowX=64,'multiple-vertical-scroll-owners':()=>s.verticalScrollOwners=3,'mobile-page-overflow':()=>s.mobileOverflowX=32,'undersized-close-target':()=>s.closeTarget=30,'material-aside-width-theft':()=>s.materialAside=true,'card-wall-density':()=>s.recordsPerScreen=2,'primary-action-overload':()=>s.primaryActions=3
 }[name];if(!m)throw new Error(`unknown mutation ${name}`);m();
}
