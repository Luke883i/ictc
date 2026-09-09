export const USER_QUESTIONS=Object.freeze([
  ['next-action','Cosa devo fare adesso?'],['subject','Su quale elemento sto lavorando?'],['reason','Perché richiede attenzione?'],['state','Qual è lo stato utile per decidere?'],['authority','Posso agire o solo consultare?'],['effect','Che cosa cambia se attivo questo controllo?'],['source','Da quale fonte o evidenza deriva?'],['human-decision','Quale decisione resta umana?'],['unknown','Che cosa non sa ancora ICTC?'],['claim-boundary','Questo significa conformità o certificazione?'],['scope','Come vedo anche gli elementi senza azione corrente?'],['reference','Dove vedo standard e riferimenti?'],['axes','Uso organizzativo, applicabilità e mapping sono distinti?'],['mobile','Il percorso resta operabile senza scroll orizzontale?'],['role','Un auditor può consultare senza scrivere?']
]);
export const NEGATIVE_PATTERNS=Object.freeze([
 'duplicate-operational-collection','duplicate-toolbar','ugly-reveal-control','duplicate-section-heading','material-aside-width-theft','context-label-duplication','weak-reference-band','usage-badge-overclaim','reference-label-duplication','modal-horizontal-overflow','dominant-arrow-affordance','technical-first-proof','raw-state-leak','action-effect-ambiguity','unbound-actionable-target','fail-open-hidden-work','global-palette-owner','role-write-leak','mobile-clipping','claim-laundering','terminal-default-leak','empty-state-dead-end','excess-primary-actions','unstable-record-binding','worklist-native-drift'
]);
export function evaluateUiuxScenario(s){
 const f=[];
 if(s.visibleCollections!==1)f.push('duplicate-operational-collection');
 if(s.toolbars>1)f.push('duplicate-toolbar');
 if(s.legacyRevealVisible)f.push('ugly-reveal-control');
 if(s.duplicateHeading)f.push('duplicate-section-heading');
 if(s.materialAside)f.push('material-aside-width-theft');
 if(s.contextLabels>1)f.push('context-label-duplication');
 if(!s.referenceBandStrong)f.push('weak-reference-band');
 if(s.usageLabel==='Uso non dichiarato'||s.usageBadgeArea>0.16)f.push('usage-badge-overclaim');
 if(s.referenceDuplicate)f.push('reference-label-duplication');
 if(s.overflowX>2)f.push('modal-horizontal-overflow');
 if(s.arrowArea>0.08||s.arrowText)f.push('dominant-arrow-affordance');
 if(s.proofFirst==='technical')f.push('technical-first-proof');
 if(s.rawStateVisible)f.push('raw-state-leak');
 if(!['navigate','inspect','evidence','decide','control'].includes(s.effect))f.push('action-effect-ambiguity');
 if(s.actionable&&!s.targetBound)f.push('unbound-actionable-target');
 if(s.integrated&&s.actionable&&!s.nativeVisible)f.push('fail-open-hidden-work');
 if(s.independentPalette)f.push('global-palette-owner');
 if(s.role==='auditor'&&s.writeVisible)f.push('role-write-leak');
 if(s.mobile&&s.pageOverflowX>1)f.push('mobile-clipping');
 if(s.claim==='certified'||s.claim==='compliant')f.push('claim-laundering');
 if(s.defaultTerminalVisible)f.push('terminal-default-leak');
 if(s.empty&&!s.emptyGuidance)f.push('empty-state-dead-end');
 if(s.primaryActions>1)f.push('excess-primary-actions');
 if(s.binding!=='stable-id'&&s.binding!=='typed-context')f.push('unstable-record-binding');
 if(s.worklistCount!==s.nativeActionableCount)f.push('worklist-native-drift');
 const answers=s.answers||{};for(const [id] of USER_QUESTIONS)if(!answers[id])f.push(`question:${id}`);
 return f;
}
export function baselineScenario(overrides={}){return{
 visibleCollections:1,toolbars:1,legacyRevealVisible:false,duplicateHeading:false,materialAside:false,contextLabels:1,referenceBandStrong:true,usageLabel:'Uso da dichiarare',usageBadgeArea:.06,referenceDuplicate:false,overflowX:0,arrowArea:.02,arrowText:false,proofFirst:'semantic',rawStateVisible:false,effect:'navigate',actionable:true,targetBound:true,integrated:true,nativeVisible:true,independentPalette:false,role:'admin',writeVisible:true,mobile:false,pageOverflowX:0,claim:'bounded',defaultTerminalVisible:false,empty:false,emptyGuidance:true,primaryActions:1,binding:'stable-id',worklistCount:3,nativeActionableCount:3,answers:Object.fromEntries(USER_QUESTIONS.map(([id])=>[id,true])),...overrides
};}
