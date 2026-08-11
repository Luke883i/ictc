export const DENSITY_INTENTIONS=Object.freeze([
  ['D01','one-primary-concept','A concept has one primary front-stage label per final view.'],
  ['D02','horizontal-first','Controls, tabs, badges and compact metadata stay on one row when width permits and wrap only under real constraint.'],
  ['D03','scroll-economy','Framing must not push the first meaningful work control below the first common desktop viewport.'],
  ['D04','semantic-counters','Counts keep the canonical metric noun; generic labels such as "da vedere" and "registrazioni" are not used as primary business meaning.'],
  ['D05','discriminating-state','Zero/normal state is quiet; badges are reserved for information that changes a decision or next action.'],
  ['D06','proof-preserved','Evidence and claim boundaries remain reachable after compression.'],
  ['D07','authority-preserved','Compression never merges human decision authority, AI proposal status, access role or proof status.'],
  ['D08','technical-detail-subordinate','Hashes, internal types and implementation vocabulary are detail, not the first business headline.'],
  ['D09','responsive-no-overflow','Horizontal-first layout never creates document overflow at narrow width or text expansion.'],
  ['D10','touch-and-keyboard','Compaction preserves 44px interactive targets and native keyboard/disclosure semantics.'],
  ['D11','single-ontology','Auditor, engineering and management readings project the same canonical objects instead of parallel ontologies.'],
  ['D12','no-new-generation','The slice reuses current authorities and does not create a new product profile, release identity or parallel renderer.']
].map(([id,key,claim])=>Object.freeze({id,key,claim})));

export const DENSITY_RISKS=Object.freeze([
  'duplicate-primary-concept','vertical-control-fragmentation','unnecessary-scroll','weak-counter-label',
  'non-discriminating-badge','proof-boundary-loss','authority-collapse','implementation-jargon-frontstage',
  'horizontal-overflow-risk','target-size-regression','parallel-ontology','new-presentation-authority'
]);

export const DUPLICATION_FAMILIES=Object.freeze([
  {id:'process-context',occurrences:['processes-h1','processes-context','grc-context','procedure-frame-kicker','procedure-card-kicker','empty-state'],retire:'Keep one process context title; cards carry code + business name only.'},
  {id:'purpose-framing',occurrences:['home-manifest','processes-info','monitoring-info','incidents-info','grc-info','proof-info','epistemic-info','procedure-purpose'],retire:'Purpose stays visible once; repeated meta-labels become compact inline framing.'},
  {id:'evidence-framing',occurrences:['home-method','processes-evidence','monitoring-evidence','incidents-evidence','grc-evidence','proof-evidence','epistemic-evidence','admin-evidence','ai-evidence'],retire:'Keep evidence meaning but place secondary detail behind one local disclosure.'},
  {id:'boundary-framing',occurrences:['home-boundary','processes-boundary','monitoring-boundary','incidents-boundary','grc-boundary','proof-boundary','epistemic-boundary','admin-boundary','ai-boundary'],retire:'A concise boundary remains locally reachable; do not restate full disclaimer as a competing panel.'},
  {id:'method-framing',occurrences:['home-method','processes-method','monitoring-method','incidents-method','grc-method','proof-method','epistemic-method'],retire:'Use one compact common chain rather than repeated stacked taxonomies.'},
  {id:'state-badges',occurrences:['monitoring-state','incidents-state','objects-state','coverage-state','actions-state','risks-state','assurance-state'],retire:'Do not render a normal-state badge on every process card.'},
  {id:'generic-counters',occurrences:['monitoring-attention','incidents-attention','objects-attention','coverage-attention','actions-attention','risks-attention','assurance-attention'],retire:'Use canonical metric labels from the procedure summary rather than generic counter nouns.'},
  {id:'action-language',occurrences:['monitoring-open','incidents-open','objects-open','coverage-open','actions-open','risks-open','assurance-open'],retire:'Keep one contextual primary action close to the object instead of repeated generic open language.'}
].map(item=>Object.freeze({...item,occurrences:Object.freeze(item.occurrences)})));

const pairCount=n=>n*(n-1)/2;
export const DUPLICATION_WITNESS_COUNT=DUPLICATION_FAMILIES.reduce((sum,family)=>sum+pairCount(family.occurrences.length),0);

export function evaluateDensityScenario(input){
  const risks=[];
  const add=code=>{if(!risks.includes(code))risks.push(code);};
  if(input.primaryConceptCopies>1)add('duplicate-primary-concept');
  if(input.controlRows>1&&input.widthCanFitControls)add('vertical-control-fragmentation');
  if(input.framingHeight>input.framingBudget||input.firstActionY>input.foldBudget)add('unnecessary-scroll');
  if(input.counterSpecificity==='generic')add('weak-counter-label');
  if(input.zeroStateBadge&&input.attentionCount===0)add('non-discriminating-badge');
  if(!input.proofReachable||!input.boundaryReachable)add('proof-boundary-loss');
  if(!input.humanAuthorityDistinct||!input.aiAuthorityDistinct)add('authority-collapse');
  if(input.frontstageTechnicalDetail)add('implementation-jargon-frontstage');
  if(input.forceSingleLine&&!input.widthCanFitControls)add('horizontal-overflow-risk');
  if(input.minTargetPx<44)add('target-size-regression');
  if(input.roleSpecificOntology)add('parallel-ontology');
  if(input.presentationAuthorities>1)add('new-presentation-authority');
  return Object.freeze({ok:risks.length===0,risks:Object.freeze(risks)});
}

export function compactScenario(input){
  return {
    ...input,
    primaryConceptCopies:1,
    controlRows:input.widthCanFitControls?1:Math.max(1,input.controlRows),
    framingHeight:Math.min(input.framingHeight,input.framingBudget),
    firstActionY:Math.min(input.firstActionY,input.foldBudget),
    counterSpecificity:'canonical',
    zeroStateBadge:false,
    proofReachable:true,
    boundaryReachable:true,
    humanAuthorityDistinct:true,
    aiAuthorityDistinct:true,
    frontstageTechnicalDetail:false,
    forceSingleLine:false,
    minTargetPx:Math.max(44,input.minTargetPx),
    roleSpecificOntology:false,
    presentationAuthorities:1
  };
}
