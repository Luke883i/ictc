import { createHash } from 'node:crypto';

export const EVIDENCE_GRADES=Object.freeze(['E0','E1','E2','E3','E4','E5']);
export const EXTERNAL_GATES=Object.freeze(new Set(['independent-review','branch-protection','deployment-evidence','external-security','human-at']));
export function scenarioSeed(value){return createHash('sha256').update(String(value)).digest('hex');}
export function evaluateClosure(input={}){
  const severity=String(input.severity||'medium').toLowerCase();
  const requiredGrade=String(input.requiredGrade||'E2').toUpperCase();
  const observedGrade=String(input.observedGrade||'E0').toUpperCase();
  const gradeOk=EVIDENCE_GRADES.indexOf(observedGrade)>=EVIDENCE_GRADES.indexOf(requiredGrade);
  const external=EXTERNAL_GATES.has(input.gate);
  const independentOk=!external||Boolean(input.independentChannel&&input.independentReviewer&&input.independentReviewer!==input.author&&input.oracleAuthor!==input.independentReviewer);
  const deploymentOk=input.gate!=='deployment-evidence'||Boolean(input.deploymentEnvelopeValid);
  const preventionOk=input.gate!=='branch-protection'||input.serverSidePrevention===true;
  const syntheticOk=input.synthetic!==true;
  const exactHeadOk=Boolean(input.exactHead&&/^[a-f0-9]{40}$/i.test(input.exactHead));
  const mutationWitness=Boolean(input.negativeWitness);
  const blockers=[];
  if(!gradeOk)blockers.push('evidence-grade-insufficient');
  if(!independentOk)blockers.push('independent-channel-missing');
  if(!deploymentOk)blockers.push('deployment-envelope-invalid');
  if(!preventionOk)blockers.push('server-side-prevention-missing');
  if(!syntheticOk)blockers.push('synthetic-evidence-not-closure');
  if(!exactHeadOk)blockers.push('exact-head-unbound');
  if(!mutationWitness)blockers.push('negative-witness-missing');
  if(['critical','high'].includes(severity)&&input.residualAccepted===true&&!input.residualOwner)blockers.push('residual-owner-missing');
  return {resolved:blockers.length===0,blockers,claimBoundary:external?'External/E3+ gate cannot be closed by same-circuit test volume.':'Repository gate remains bounded engineering evidence.'};
}
