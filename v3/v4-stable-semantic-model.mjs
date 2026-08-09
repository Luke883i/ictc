export const AXES = Object.freeze({
  role: ['admin','user','auditor'],
  process: ['monitoring','incidents','objects','coverage','actions','risks','assurance'],
  aiPolicy: ['enabled','disabled'],
  assistPreference: ['on','off'],
  entry: ['direct','guided','proof'],
  operation: ['read','write','assist'],
  claim: ['operational','human-comprehension','enterprise-readiness']
});

export const PROCESS_CODES = Object.freeze({
  monitoring:'RN-01', incidents:'EC-01', objects:'AO-01', coverage:'MC-01',
  actions:'AP-01', risks:'RC-01', assurance:'AR-01'
});

export const ENTRY_PATHS = Object.freeze({
  direct:'direct-process-entry', guided:'guided-human-route-selection', proof:'proof-read-surface'
});

export const BASE_POLICY = Object.freeze({
  allowAuditorWrite:false,
  allowAuditorAssist:false,
  enforceOrganizationAiPolicy:true,
  honorAssistPreference:true,
  requireHumanE4:true,
  requireEnterpriseBoundEvidence:true,
  preserveProcessIdentity:true,
  preserveEntryPath:true,
  preserveHumanDecisionAuthority:true,
  preserveClaimBoundary:true
});

export const cartesian = lists => lists.reduce((acc, xs) => acc.flatMap(row => xs.map(x => [...row, x])), [[]]);

export function scenarios(){
  const names=Object.keys(AXES);
  return cartesian(names.map(name=>AXES[name])).map(values=>Object.fromEntries(names.map((name,i)=>[name,values[i]])));
}

export function semanticStimulus(s){
  return {
    actor:{role:s.role},
    target:{processCode:PROCESS_CODES[s.process]},
    governance:{organizationAiPolicy:s.aiPolicy,personalAssistPreference:s.assistPreference},
    entry:{kind:ENTRY_PATHS[s.entry]},
    request:{operation:s.operation,claim:s.claim}
  };
}

export function evaluateScenario(s, overrides={}){
  const policy={...BASE_POLICY,...overrides};
  const controls=[];
  const evidence=[];
  const forbidden=[];
  const processCode=policy.preserveProcessIdentity?PROCESS_CODES[s.process]:'PROCESS-GENERIC';
  const entryPath=policy.preserveEntryPath?ENTRY_PATHS[s.entry]:'collapsed-entry';
  if(policy.preserveHumanDecisionAuthority)controls.push('human-decision-authority');
  if(policy.preserveClaimBoundary)controls.push('claim-boundary');

  let decision='ALLOW';
  if(s.operation==='write'&&s.role==='auditor'&&!policy.allowAuditorWrite)decision='DENY_WRITE';
  if(s.operation==='assist'){
    controls.push('proposal-only-ai');
    if(s.role==='auditor'&&!policy.allowAuditorAssist)decision='DENY_ASSIST';
    else if(s.aiPolicy==='disabled'&&policy.enforceOrganizationAiPolicy)decision='DENY_AI_POLICY';
    else if(s.assistPreference==='off'&&policy.honorAssistPreference)decision='USE_MANUAL_PATH';
    else decision='ALLOW_AI_PROPOSAL';
    if(s.aiPolicy==='disabled'&&policy.enforceOrganizationAiPolicy)controls.push('server-ai-disabled');
    if(s.assistPreference==='off'&&policy.honorAssistPreference)controls.push('personal-assist-off');
  }
  if(s.role==='auditor')controls.push('read-only-role');
  if(s.claim==='human-comprehension'){
    if(policy.requireHumanE4){evidence.push('E4-human');forbidden.push('browser-implies-human-comprehension');}
  }else if(s.claim==='enterprise-readiness'){
    if(policy.requireEnterpriseBoundEvidence){evidence.push('bound-deployment-evidence');forbidden.push('product-tests-imply-enterprise-readiness');}
  }else evidence.push('internal-operational-evidence');

  return {
    path:{entryPath,processCode,operation:s.operation},
    decision,
    controls:[...new Set(controls)].sort(),
    evidence:[...new Set(evidence)].sort(),
    forbidden:[...new Set(forbidden)].sort()
  };
}

export function behavioralOutcome(outcome){
  return {
    path:outcome.path,
    decision:outcome.decision,
    controls:outcome.controls,
    evidence:outcome.evidence,
    forbidden:outcome.forbidden
  };
}

export function behavioralSignaturePayload(s, outcome, options={}){
  const payload=behavioralOutcome(outcome);
  return options.includeRawScenarioIdentity?{scenario:s,outcome:payload}:payload;
}
