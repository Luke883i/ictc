import { mkdir, readFile, writeFile } from 'node:fs/promises';

const CONTROL_ID = 'GOV-01F';
const CONTROL_CLASS = 'COMPENSATING';
const policyPath = new URL('../.github/gov-01f-policy.json', import.meta.url);
const artifactPath = new URL('../artifacts/gov-01f-governance.json', import.meta.url);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function fail(message, code = 'governance-failed', extra = {}) { return { ok: false, code, message, ...extra }; }
function pass(message, extra = {}) { return { ok: true, code: 'ok', message, ...extra }; }
function validSha(value) { return /^[0-9a-f]{40}$/i.test(String(value || '')); }

export function evaluatePullRequest(event, policy) {
  const pr = event?.pull_request;
  if (!pr) return fail('Evento pull_request privo di payload PR', 'missing-pr-payload');
  if (pr.base?.ref !== policy.defaultBranch) return fail(`Base PR non canonica: ${pr.base?.ref || 'unknown'}`, 'wrong-base');
  if (!validSha(pr.head?.sha)) return fail('HEAD SHA della PR non valido', 'invalid-head-sha');
  const headRef = String(pr.head?.ref || '');
  if (!headRef || headRef === policy.defaultBranch || headRef === 'master') return fail('La PR deve provenire da un branch dedicato', 'direct-main-pr');
  if (!policy.allowedBranchPrefixes.some(prefix => headRef.startsWith(prefix))) return fail(`Branch PR fuori convenzione: ${headRef}`, 'branch-prefix');
  return pass('PR provenance osservabile e branch dedicato', { sha: pr.head.sha, pr: { number: pr.number, base: pr.base.ref, head: headRef, headSha: pr.head.sha } });
}

export function evaluateMainPush(event, associatedPullRequests, policy) {
  if (event?.ref !== `refs/heads/${policy.defaultBranch}`) return fail(`Push fuori ${policy.defaultBranch}`, 'wrong-ref');
  const sha = event?.after || process.env.GITHUB_SHA;
  if (!validSha(sha)) return fail('SHA push main non valido', 'invalid-main-sha');
  const merged = (associatedPullRequests || []).filter(pr => pr?.merged_at && pr?.base?.ref === policy.defaultBranch);
  if (!merged.length) return fail('Push su main non associato a una PR merged: possibile direct-push governance breach', 'direct-main-push');
  return pass('Push main associato a PR merged', { sha, mainSha: sha, associatedMergedPullRequests: merged.map(pr => ({ number: pr.number, mergedAt: pr.merged_at, mergeCommitSha: pr.merge_commit_sha || null, headSha: pr.head?.sha || null, base: pr.base?.ref || null })) });
}

function evaluateRequiredChecks(required, checkRuns) {
  const latest = new Map();
  for (const run of checkRuns || []) latest.set(run.name, run);
  const states = required.map(name => {
    const run = latest.get(name);
    return { name, status: run?.status || 'missing', conclusion: run?.conclusion || null, url: run?.html_url || null };
  });
  const blockers = states.filter(item => item.status !== 'completed' || item.conclusion !== 'success');
  return blockers.length ? fail('Required exact-SHA checks non verdi', 'required-checks-not-green', { states, blockers }) : pass('Required exact-SHA checks verdi', { states });
}

async function githubJson(url, token) {
  const response = await fetch(url, { headers: { accept: 'application/vnd.github+json', authorization: `Bearer ${token}`, 'x-github-api-version': '2022-11-28' } });
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  return response.json();
}
async function associatedPullRequests(sha) {
  const token = process.env.GITHUB_TOKEN, repository = process.env.GITHUB_REPOSITORY, api = process.env.GITHUB_API_URL || 'https://api.github.com';
  if (!token || !repository) throw new Error('GITHUB_TOKEN/GITHUB_REPOSITORY assente');
  return githubJson(`${api}/repos/${repository}/commits/${sha}/pulls?per_page=100`, token);
}
async function checkRuns(sha) {
  const token = process.env.GITHUB_TOKEN, repository = process.env.GITHUB_REPOSITORY, api = process.env.GITHUB_API_URL || 'https://api.github.com';
  if (!token || !repository) throw new Error('GITHUB_TOKEN/GITHUB_REPOSITORY assente');
  const payload = await githubJson(`${api}/repos/${repository}/commits/${sha}/check-runs?filter=latest&per_page=100`, token);
  return payload.check_runs || [];
}
async function waitForRequiredChecks(sha, required) {
  const waitMs = Math.max(0, Math.min(25 * 60_000, Number(process.env.ICTC_GOV_WAIT_MS || 20 * 60_000)));
  const intervalMs = Math.max(1000, Math.min(30_000, Number(process.env.ICTC_GOV_POLL_MS || 10_000)));
  const deadline = Date.now() + waitMs;
  let result;
  do {
    result = evaluateRequiredChecks(required, await checkRuns(sha));
    if (result.ok) return result;
    const terminalFailure = result.blockers?.some(item => item.status === 'completed' && item.conclusion && !['success'].includes(item.conclusion));
    if (terminalFailure || Date.now() >= deadline) return result;
    await sleep(intervalMs);
  } while (true);
}

function selfTest(policy) {
  const sha = 'a'.repeat(40);
  const validPr = { pull_request: { number: 1, base: { ref: 'main' }, head: { ref: 'agent/gov-01f', sha } } };
  const invalidPr = { pull_request: { number: 2, base: { ref: 'main' }, head: { ref: 'main', sha } } };
  const merged = [{ number: 1, merged_at: '2026-08-07T00:00:00Z', merge_commit_sha: sha, head: { sha }, base: { ref: 'main' } }];
  const required = ['enterprise-candidate'];
  const tests = [
    ['valid-pr', evaluatePullRequest(validPr, policy).ok === true],
    ['reject-main-pr', evaluatePullRequest(invalidPr, policy).code === 'direct-main-pr'],
    ['valid-merged-push', evaluateMainPush({ ref: 'refs/heads/main', after: sha }, merged, policy).ok === true],
    ['accept-green-checks', evaluateRequiredChecks(required, [{ name: 'enterprise-candidate', status: 'completed', conclusion: 'success' }]).ok === true],
    ['reject-missing-check', evaluateRequiredChecks(required, []).code === 'required-checks-not-green'],
    ['reject-skipped-check', evaluateRequiredChecks(required, [{ name: 'enterprise-candidate', status: 'completed', conclusion: 'skipped' }]).code === 'required-checks-not-green']
  ];
  const failed = tests.filter(([, ok]) => !ok).map(([name]) => name);
  return { ok: failed.length === 0, tests: Object.fromEntries(tests), failed };
}
async function writeArtifact(report) { await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true }); await writeFile(artifactPath, JSON.stringify(report, null, 2)); }

const policy = JSON.parse(await readFile(policyPath, 'utf8'));
if (process.argv.includes('--self-test')) { const result = selfTest(policy); console.log(JSON.stringify({ controlId: CONTROL_ID, selfTest: result }, null, 2)); process.exit(result.ok ? 0 : 1); }
const eventName = process.env.GITHUB_EVENT_NAME || '', eventPath = process.env.GITHUB_EVENT_PATH;
let event = {}; if (eventPath) event = JSON.parse(await readFile(eventPath, 'utf8'));
let provenance, requiredEvaluation = null;
try {
  if (eventName === 'pull_request') provenance = evaluatePullRequest(event, policy);
  else if (eventName === 'push') provenance = evaluateMainPush(event, await associatedPullRequests(event.after || process.env.GITHUB_SHA), policy);
  else if (eventName === 'workflow_dispatch') provenance = pass('Esecuzione diagnostica GOV-01F; nessuna protezione server-side attestata');
  else provenance = fail(`Evento GitHub non supportato: ${eventName || 'unknown'}`, 'unsupported-event');
  if (provenance.ok && ['pull_request', 'push'].includes(eventName)) {
    const required = eventName === 'pull_request' ? policy.requiredPreMergeChecks : policy.requiredPostMergeChecks;
    requiredEvaluation = await waitForRequiredChecks(provenance.sha, required);
  }
} catch (error) { provenance = fail(error.message, 'external-observation-failed'); }
const evaluation = provenance.ok && (!requiredEvaluation || requiredEvaluation.ok) ? pass('GOV-01F provenance + exact-SHA gate soddisfatti', { provenance, requiredChecks: requiredEvaluation }) : fail('GOV-01F non soddisfatto', requiredEvaluation?.code || provenance.code, { provenance, requiredChecks: requiredEvaluation });
const report = { schemaVersion: '2.0.0', controlId: CONTROL_ID, controlClass: CONTROL_CLASS, mode: policy.mode, observedAt: new Date().toISOString(), eventName, repository: process.env.GITHUB_REPOSITORY || null, githubSha: process.env.GITHUB_SHA || null, evaluation, serverSidePrevention: false, limitations: policy.limitations, boundary: 'Compensating exact-SHA governance evidence. It is not branch protection or independent review.' };
await writeArtifact(report); console.log(JSON.stringify(report, null, 2)); process.exit(evaluation.ok ? 0 : 2);
