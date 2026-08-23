import { readFile } from 'node:fs/promises';

const failures=[];
const check=(condition,message)=>{if(!condition)failures.push(message);};
const release=await readFile(new URL('../scripts/release-failure-provenance.mjs',import.meta.url),'utf8');
const browser=await readFile(new URL('../scripts/browser-failure-provenance.mjs',import.meta.url),'utf8');
const census=await readFile(new URL('./actions-census.mjs',import.meta.url),'utf8');
const ci=await readFile(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8');
const deautopoiesis=await readFile(new URL('../.github/workflows/deautopoiesis-closure.yml',import.meta.url),'utf8');
const shellLineageWorkflow=await readFile(new URL('../.github/workflows/shell-admin-demo-probes-2-6.yml',import.meta.url),'utf8');
const shellLineageProbe=await readFile(new URL('./browser-shell-admin-demo-probe-2-6.py',import.meta.url),'utf8');
const wrapper=await readFile(new URL('./browser-procedure-finetuning-1-4.py',import.meta.url),'utf8');
const browserJourneyJob=ci.match(/\n  browser-journeys:\n([\s\S]*?)\n  epistemic-professional-browser:/)?.[1]||'';
const professionalBrowserJob=ci.match(/\n  epistemic-professional-browser:\n([\s\S]*?)\n  launcher-smoke:/)?.[1]||'';
const ciVerdictJob=ci.match(/\n  ci-verdict:\n([\s\S]*)$/)?.[1]||'';

check(!release.includes('-failure/'),'release provenance must not create failure fan-out contexts');
check(!release.includes('-detail/'),'release provenance must keep failure detail inside the authoritative rail status/log');
check(!browser.includes('/statuses/'),'browser provenance must be observational only and must not create status fan-out');
check(!census.includes('ictc/check-failure/'),'actions census must publish one authoritative census status, not one status per failed check');
check(!ci.includes('ictc/browser-failure/'),'browser CI must not publish per-script failure statuses');
check(!wrapper.includes('/statuses/'),'browser subtest wrapper must not publish per-subtest statuses');
check(!/statuses:\s*write/.test(browserJourneyJob),'browser test job must not hold commit-status write authority');
check(!/statuses:\s*write/.test(professionalBrowserJob),'professional browser test job must not hold commit-status write authority');
check(browserJourneyJob.includes('failed_script: ${{ steps.canonical-browser.outputs.failed_script }}'),'browser job must export one first-failure diagnostic without acquiring status authority');
check(browserJourneyJob.includes('echo "failed_script=$script" >> "$GITHUB_OUTPUT"'),'browser runner must record the first failing subtest in its job output');
check(ci.includes("BROWSER_FAILED_SCRIPT: ${{ needs['browser-journeys'].outputs.failed_script }}"),'CI verdict must consume browser first-failure provenance');
check(!/statuses:\s*write/.test(ci),'canonical CI must not acquire commit-status write authority');
check(!ciVerdictJob.includes('/statuses/'),'CI verdict must not publish parallel commit statuses');
check(!ciVerdictJob.includes('post_status'),'CI verdict must rely on the native GitHub job conclusion');
check(ciVerdictJob.includes('GITHUB_STEP_SUMMARY'),'CI verdict must retain bounded human-readable failure provenance');
check(ciVerdictJob.includes("if [[ \"$result\" != 'success' ]]"),'CI verdict must treat every non-success dependency result as failure');
check(ciVerdictJob.includes('exit 1'),'CI verdict must fail closed when any required job is not successful');
check(census.includes("'ictc/actions-census'"),'census must retain one exact-head Actions verdict');
check(shellLineageWorkflow.includes('--profile current'),'shell/admin/DEMO lineage probes must exercise the canonical current profile');
check(shellLineageProbe.includes("dataset.nativeSemanticLattice==='3.2.0'"),'historical shell/admin/DEMO probe running against current must synchronize on current native semantic authority');
check(!shellLineageProbe.includes("wait_for_function(\"()=>document.documentElement.dataset.ictcExperienceEdition==='1.9-experience-candidate'\")"),'historical experience edition must not be the current lineage readiness oracle');

const baseline=deautopoiesis.indexOf('- name: Snapshot Windows Node process baseline');
const runtime=deautopoiesis.indexOf('- name: Current runtime suite on supported matrix');
const quiescence=deautopoiesis.indexOf('- name: Enforce Windows runtime process quiescence');
check(baseline>=0&&runtime>baseline&&quiescence>runtime,'Windows portability order must be baseline -> runtime -> owned quiescence');
check(deautopoiesis.includes('ictc-node-baseline.json'),'Windows quiescence must persist an explicit pre-runtime Node baseline');
check(deautopoiesis.includes('baselineKeys.Contains'),'Windows quiescence must distinguish baseline processes from test-owned residuals');
check(deautopoiesis.includes('Residual ICTC-owned Node processes'),'Windows quiescence diagnostics must identify only test-owned residual processes');
check(!deautopoiesis.includes('$nodes | Stop-Process'),'Windows quiescence must never terminate every Node process on the hosted runner');
check(!/statuses:\s*write/.test(deautopoiesis),'deautopoiesis must not acquire commit-status write authority');
check(!deautopoiesis.includes('release-failure-provenance.mjs'),'deautopoiesis native check-runs must be the sole rail verdict authority');
check(!deautopoiesis.includes('continue-on-error:'),'deautopoiesis must fail natively on any required gate failure');
check(deautopoiesis.includes('actions/checkout@d23441a48e516b6c34aea4fa41551a30e30af803'),'deautopoiesis must use the pinned canonical checkout action');
check(deautopoiesis.includes('actions/setup-node@249970729cb0ef3589644e2896645e5dc5ba9c38'),'deautopoiesis must use the pinned canonical Node setup action');
check(deautopoiesis.includes("node-version: ${{ matrix.node }}"),'portability matrix must bind Node setup to the declared matrix version');
check(!deautopoiesis.includes('RAIL:'),'deautopoiesis must not publish parallel diagnostic rail verdicts');

if(failures.length){console.error(JSON.stringify({ok:false,failures},null,2));process.exit(1);}
console.log(JSON.stringify({ok:true,topology:'native-check-run-authority',fanoutStatuses:false,canonicalCiVerdictAuthority:'github-native-check-run',browserFailureProvenance:'job-output-and-summary',shellLineageReadiness:'native-semantic-authority',deautopoiesisVerdictAuthority:'github-native-check-runs',portabilityVerdictBoundary:'setup+runtime+owned-quiescence+action-post-steps',windowsNodeOwnership:'baseline-scoped'}));
