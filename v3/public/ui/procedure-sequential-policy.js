export const PROCEDURE_SEQUENCE = Object.freeze({
  monitoring: Object.freeze({code:'RN-01', purpose:'Sorvegliare soltanto fonti pubbliche ammesse e trasformare cambiamenti osservati in fonti candidate da verificare.', stages:['Definisci perimetro','Sorveglia','Verifica fonte','Valuta impatto','Conserva traccia']}),
  incidents: Object.freeze({code:'EC-01', purpose:'Preservare un evento come fatto osservato e portarlo, una domanda alla volta, a una formulazione umana verificata.', stages:['Registra originale','Chiarisci','Formula','Conferma','Chiudi']}),
  objects: Object.freeze({code:'AO-01', purpose:'Mantenere un inventario governato di oggetti organizzativi riconciliabili con una fonte autorevole.', stages:['Identifica','Collega fonte','Assegna owner','Valida','Riesamina']}),
  coverage: Object.freeze({code:'MC-01', purpose:'Decidere prima il perimetro di un requisito e poi il mapping verso oggetti o controlli governati.', stages:['Seleziona requisito','Decidi applicabilita','Comprendi','Decidi mapping','Conserva rationale']}),
  actions: Object.freeze({code:'AP-01', purpose:'Trasformare un finding o impegno in lavoro assegnato e distinguere completamento da chiusura verificata.', stages:['Comprendi origine','Adotta','Esegui','Invia a verifica','Verifica e chiudi']})
});

export const GLOBAL_UX_DOD = Object.freeze({
  primaryActionsPerDecisionContext: 1,
  materialQuestionsPerContext: 1,
  primaryFactsPerCard: 4,
  listItemsBeforeProgressiveDisclosure: 12,
  technicalDetailsDefault: 'collapsed',
  crossProcedureDecisionInheritance: false,
  aiAuthority: 'proposal-only',
  evidenceMeaning: 'trace-not-truth'
});

// The 2.2 layer models the next step but delegates canonical decision controls to 1.6.
export function rnPrimaryAction(){
  return Object.freeze({intent:'open-monitor', label:'Apri monitoraggio', selector:'[data-open-plan],[data-seq-owner-monitor="open"]'});
}

export function mcNextDecision(mapping={}) {
  const scope = mapping.requirementScope?.decision || 'missing';
  if (mapping.state !== 'proposed') return Object.freeze({intent:'inspect', label:'Apri dettaglio', owner:'mapping'});
  if (scope === 'not-applicable') return Object.freeze({intent:'none', label:'Fuori perimetro', owner:'requirement-scope'});
  if (scope !== 'applicable') return Object.freeze({intent:'decide-scope', label:'Decidi applicabilita', owner:'requirement-scope'});
  return Object.freeze({intent:'decide-mapping', label:'Decidi mapping', owner:'mapping'});
}

export function mcMappingOptions(mapping={},activeTargetIds=[]) {
  const active=new Set(activeTargetIds);
  const canMap=(mapping.targetIds||[]).some(id=>active.has(id));
  return canMap
    ? Object.freeze([{value:'mapped',label:'Mappato ai target governati indicati'},{value:'gap',label:'Gap da gestire'}])
    : Object.freeze([{value:'gap',label:'Nessun target governato attivo: registra gap'}]);
}

export function apPrimaryAction(action={}, {canManage=false}={}) {
  const state=action.state==='done'?'ready-for-review':action.state;
  if (state === 'proposed') return Object.freeze({intent:'adopt', label:'Adotta azione', selector:'[data-action-adopt]'});
  if (state === 'open') return Object.freeze({intent:'start', label:'Avvia lavoro', selector:'[data-uiux-action-quick][data-next-state="in-progress"]'});
  if (state === 'in-progress') return Object.freeze({intent:'submit-completion', label:'Invia a verifica', selector:'[data-uiux-action-quick][data-next-state="done"]'});
  if (state === 'blocked') return Object.freeze({intent:'resume', label:'Riprendi lavoro', selector:'[data-uiux-action-quick][data-next-state="in-progress"]'});
  if (state === 'ready-for-review' && canManage) return Object.freeze({intent:'verify', label:'Verifica risultato', selector:'[data-uiux-action-verify]'});
  return null;
}

export function validateDecisionSurface(surface={}) {
  const failures=[];
  const primary=Number(surface.primaryActions||0);
  if (primary>GLOBAL_UX_DOD.primaryActionsPerDecisionContext) failures.push('duplicate-primary-action');
  if (Number(surface.materialQuestions||0)>GLOBAL_UX_DOD.materialQuestionsPerContext) failures.push('parallel-material-questions');
  if (Number(surface.primaryFacts||0)>GLOBAL_UX_DOD.primaryFactsPerCard) failures.push('fact-overload');
  if (surface.aiCanDecide===true) failures.push('ai-authority-promotion');
  if (surface.evidenceEqualsTruth===true) failures.push('evidence-truth-promotion');
  if (surface.mappingNotApplicable===true) failures.push('mapping-na-collapse');
  if (surface.coveragePercentPrimary===true) failures.push('coverage-percentage-shortcut');
  if (surface.doneEqualsClosed===true) failures.push('completion-closure-collapse');
  if (surface.epistemicAsProcess===true) failures.push('epistemic-eighth-process');
  if (surface.phaseActionMismatch===true) failures.push('phase-action-mismatch');
  if (surface.runtimeDecisionOrphan===true) failures.push('runtime-decision-orphan');
  if (surface.deadCta===true) failures.push('dead-cta');
  if (surface.jargonOnlyLabel===true) failures.push('opaque-cta-label');
  if (surface.crossProcedureDecisionInheritance===true) failures.push('cross-procedure-authority-leak');
  if (surface.technicalDetailExpanded===true && surface.userNeed!=='technical-audit') failures.push('technical-overexposure');
  if (surface.progressiveNonIdempotent===true) failures.push('progressive-non-idempotence');
  if (surface.presentationOwnerConflict===true) failures.push('presentation-owner-conflict');
  if (surface.hiddenAuthorityDecision===true) failures.push('hidden-authority-decision');
  if (surface.rnOwnRuntimeOrphan===true) failures.push('rn-own-monitoring-orphan');
  if (surface.rnOwnUniverseMissing===true) failures.push('rn-own-universe-missing');
  if (surface.aoIncompleteDeadEnd===true) failures.push('ao-incomplete-candidate-dead-end');
  if (surface.mcMappedWithoutTarget===true) failures.push('mc-mapped-without-target');
  if (surface.rnOwnerUnescapedText===true) failures.push('rn-owner-unescaped-persisted-text');
  if (surface.aiPrimaryOverHuman===true) failures.push('ai-primary-over-human-path');
  return failures;
}

export function capabilitySetForProcedure(id) {
  const base={monitoring:['review-plan','resume-monitoring','open-monitor','run-monitor','pause-monitor','inspect-evidence'],incidents:['record-original','answer-next-question','formulate','submit','close','inspect-evidence'],objects:['create-candidate','validate','reject','reattest','inspect-evidence'],coverage:['decide-scope','decide-mapping','inspect-evidence'],actions:['adopt','start','submit-completion','resume','verify','inspect-evidence']};
  return new Set(base[id]||[]);
}
