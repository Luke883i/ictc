import { mkdir, readFile, writeFile } from 'node:fs/promises';

const CONTROL_ID = 'GOV-01F';
const CONTROL_CLASS = 'COMPENSATING';
const policyPath = new URL('../.github/gov-01f-policy.json', import.meta.url);
const artifactPath = new URL('../artifacts/gov-01f-governance.json', import.meta.url);

function fail(message, code = 'governance-failed') {
  return { ok: false, code, message };
}

function pass(message, extra = {}) {
  return { ok: true, code: 'ok', message, ...extra };
}

function validSha(value) {
  return /^[0-9a-f]{40}$/i.test(String(value || ''));
}

export function evaluatePullRequest(event, policy) {
  const pr = event?.pull_request;
  if (!pr) return fail('Evento pull_request privo di payload PR', 'missing-pr-payload');
  if (pr.base?.ref !== policy.defaultBranch) return fail(`Base PR non canonica: ${pr.base?.ref || 'unknown'}`, 'wrong-base');
  if (!validSha(pr.head?.sha)) return fail('HEAD SHA della PR non valido', 'invalid-head-sha');
  const headRef = String(pr.head?.ref || '');
  if (!headRef || headRef === policy.defaultBranch || headRef === 'master') return fail('La PR deve provenire da un branch dedicato', 'direct-main-pr');
  if (!policy.allowedBranchPrefixes.some(prefix => headRef.startsWith(prefix))) {
    return fail(`Branch PR fuori convenzione: ${headRef}`, 'branch-prefix');
  }
  return pass('PR provenance osservabile e branch dedicato', {
    pr: { number: pr.number, base: pr.base.ref, head: headRef, headSha: pr.head.sha }
  });
}

export function evaluateMainPush(event, associatedPullRequests, policy) {
  if (event?.ref !== `refs/heads/${policy.defaultBranch}`) return fail(`Push fuori ${policy.defaultBranch}`, 'wrong-ref');
  const sha = event?.after || process.env.GITHUB_SHA;
  if (!validSha(sha)) return fail('SHA push main non valido', 'invalid-main-sha');
  const merged = (associatedPullRequests || []).filter(pr => pr?.merged_at && pr?.base?.ref === policy.defaultBranch);
  if (!merged.length) return fail('Push su main non associato a una PR merged: possibile direct-push governance breach', 'direct-main-push');
  return pass('Push main associato a PR merged', {
    mainSha: sha,
    associatedMergedPullRequests: merged.map(pr => ({
      number: pr.number,
      mergedAt: pr.merged_at,
      mergeCommitSha: pr.merge_commit_sha || null,
      headSha: pr.head?.sha || null,
      base: pr.base?.ref || null
    }))
  });
}

async function githubJson(url, token) {
  const response = await fetch(url, {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'x-github-api-version': '2022-11-28'
    }
  });
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  return response.json();
}

async function associatedPullRequests(sha) {
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  const api = process.env.GITHUB_API_URL || 'https://api.github.com';
  if (!token) throw new Error('GITHUB_TOKEN assente');
  if (!repository) throw new Error('GITHUB_REPOSITORY assente');
  return githubJson(`${api}/repos/${repository}/commits/${sha}/pulls?per_page=100`, token);
}

function selfTest(policy) {
  const sha = 'a'.repeat(40);
  const validPr = { pull_request: { number: 1, base: { ref: 'main' }, head: { ref: 'agent/gov-01f', sha } } };
  const invalidPr = { pull_request: { number: 2, base: { ref: 'main' }, head: { ref: 'main', sha } } };
  const validPush = { ref: 'refs/heads/main', after: sha };
  const merged = [{ number: 1, merged_at: '2026-08-07T00:00:00Z', merge_commit_sha: sha, head: { sha }, base: { ref: 'main' } }];
  const tests = [
    ['valid-pr', evaluatePullRequest(validPr, policy).ok === true],
    ['reject-main-pr', evaluatePullRequest(invalidPr, policy).code === 'direct-main-pr'],
    ['valid-merged-push', evaluateMainPush(validPush, merged, policy).ok === true],
    ['reject-direct-push', evaluateMainPush(validPush, [], policy).code === 'direct-main-push']
  ];
  const failed = tests.filter(([, ok]) => !ok).map(([name]) => name);
  return { ok: failed.length === 0, tests: Object.fromEntries(tests), failed };
}

async function writeArtifact(report) {
  await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
  await writeFile(artifactPath, JSON.stringify(report, null, 2));
}

const policy = JSON.parse(await readFile(policyPath, 'utf8'));
if (process.argv.includes('--self-test')) {
  const result = selfTest(policy);
  console.log(JSON.stringify({ controlId: CONTROL_ID, selfTest: result }, null, 2));
  process.exit(result.ok ? 0 : 1);
}

const eventName = process.env.GITHUB_EVENT_NAME || '';
const eventPath = process.env.GITHUB_EVENT_PATH;
let event = {};
if (eventPath) event = JSON.parse(await readFile(eventPath, 'utf8'));
let evaluation;

try {
  if (eventName === 'pull_request') {
    evaluation = evaluatePullRequest(event, policy);
  } else if (eventName === 'push') {
    const sha = event.after || process.env.GITHUB_SHA;
    const associated = await associatedPullRequests(sha);
    evaluation = evaluateMainPush(event, associated, policy);
  } else if (eventName === 'workflow_dispatch') {
    evaluation = pass('Esecuzione diagnostica GOV-01F; nessuna protezione server-side attestata');
  } else {
    evaluation = fail(`Evento GitHub non supportato: ${eventName || 'unknown'}`, 'unsupported-event');
  }
} catch (error) {
  evaluation = fail(error.message, 'external-observation-failed');
}

const report = {
  schemaVersion: '1.0.0',
  controlId: CONTROL_ID,
  controlClass: CONTROL_CLASS,
  mode: policy.mode,
  observedAt: new Date().toISOString(),
  eventName,
  repository: process.env.GITHUB_REPOSITORY || null,
  githubSha: process.env.GITHUB_SHA || null,
  evaluation,
  serverSidePrevention: false,
  limitations: policy.limitations,
  boundary: 'Compensating governance evidence. This check may detect a direct push only after GitHub has accepted it; it is not branch protection.'
};
await writeArtifact(report);
console.log(JSON.stringify(report, null, 2));
process.exit(evaluation.ok ? 0 : 2);
