import { readFile } from 'node:fs/promises';
import { accessProfileFor } from './access-profile.mjs';
import { COMPLIANCE_SEMANTICS, projectBenchmarkFamily } from './compliance-claims.mjs';

const contract = JSON.parse(await readFile(new URL('./standard-proof-1-6-contract.json', import.meta.url), 'utf8'));
const publicContract = Object.freeze({
  schemaVersion: contract.schemaVersion,
  release: contract.release,
  model: contract.model,
  intent: contract.intent,
  personas: contract.personas,
  auditDimensions: contract.auditDimensions,
  benchmarkFamilies: contract.benchmarkFamilies.map(projectBenchmarkFamily),
  architecture: contract.architecture,
  journeys: contract.journeys,
  glossary: contract.glossary,
  metrics: contract.metrics,
  definitionOfDone: contract.definitionOfDone,
  claimBoundary: contract.claimBoundary
});

function controlSummary(readiness) {
  const controls = Array.isArray(readiness?.controls) ? readiness.controls : [];
  const runtime = controls.filter(item => item.scope !== 'deployment');
  const deployment = controls.filter(item => item.scope === 'deployment');
  const summarize = values => ({
    verified: values.filter(item => item.status === 'verified').length,
    total: values.length,
    blockers: values.filter(item => item.status !== 'verified').map(item => ({
      id: item.id,
      label: item.label,
      evidence: item.evidence,
      action: item.action || null
    }))
  });
  return {
    level: readiness?.level || 'unknown',
    overall: Number(readiness?.overall || 0),
    all: summarize(controls),
    runtime: summarize(runtime),
    deployment: summarize(deployment),
    limitation: readiness?.limitations?.[0] || 'Un controllo senza evidenza resta bloccante.'
  };
}

export function standardProofProjection({ actor, version, readiness, integrity }) {
  const access = accessProfileFor(actor);
  return {
    ...structuredClone(publicContract),
    release: version,
    actor: {
      id: access.actorId,
      role: access.role,
      label: access.label,
      mode: access.mode,
      modeLabel: access.modeLabel,
      authoritySource: access.authoritySource,
      capabilities: access.capabilities
    },
    proof: {
      posture: controlSummary(readiness),
      integrity: {
        ok: integrity?.ok === true,
        revision: Number(integrity?.revision || 0),
        events: Number(integrity?.events || 0),
        head: integrity?.head || null
      },
      complianceSemantics: structuredClone(COMPLIANCE_SEMANTICS),
      evidenceKinds: [
        'Contratti e controlli statici',
        'Journey runtime e browser',
        'Receipt e catena di integrita',
        'Artifact associati al commit',
        'Attestazioni esterne di deployment quando richieste'
      ],
      rule: 'Ogni promessa deve mostrare pratica, evidenza e limite.'
    }
  };
}

export function standardProofContract() {
  return structuredClone(publicContract);
}
