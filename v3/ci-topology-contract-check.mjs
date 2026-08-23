import { readFile } from 'node:fs/promises';

const failures=[];
const check=(condition,message)=>{if(!condition)failures.push(message);};
const release=await readFile(new URL('../scripts/release-failure-provenance.mjs',import.meta.url),'utf8');
const browser=await readFile(new URL('../scripts/browser-failure-provenance.mjs',import.meta.url),'utf8');
const census=await readFile(new URL('./actions-census.mjs',import.meta.url),'utf8');
const ci=await readFile(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8');
const deautopoiesis=await readFile(new URL('../.github/workflows/deautopoiesis-closure.yml',import.meta.url),'utf8');
const wrapper=await readFile(new URL('./browser-procedure-finetuning-1-4.py',import.meta.url),'utf8');
const browserJourneyJob=ci.match(/\n  browser-journeys:\n([\s\S]*?)\n  epistemic-professional-browser:/)?.[1]||'';
const professionalBrowserJob=ci.match(/\n  epistemic-professional-browser:\n([\s\S]*?)\n  launcher-smoke:/)?.[1]||'';

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
check(ci.includes("post_status 'ictc/browser-journeys' \"$BROWSER_RESULT\" \"$BROWSER_FAILED_SCRIPT\""),'authoritative browser status must carry bounded first-failure provenance');
check(ci.includes("'ictc/exact-head-ci'"),'CI must retain one exact-head aggregate verdict');
check(census.includes("'ictc/actions-census'"),'census must retain one exact-head Actions verdict');

const baseline=deautopoiesis.indexOf('- name: Snapshot Windows Node process baseline');
const runtime=deautopoiesis.indexOf('- name: Current runtime suite on supported matrix');
const quiescence=deautopoiesis.indexOf('- name: Enforce Windows runtime process quiescence');
const portabilityVerdict=deautopoiesis.indexOf('- name: Publish portability exact-head verdict');
check(baseline>=0&&runtime>baseline&&quiescence>runtime&&portabilityVerdict>quiescence,'Windows portability order must be baseline -> runtime -> owned quiescence -> verdict');
check(deautopoiesis.includes('ictc-node-baseline.json'),'Windows quiescence must persist an explicit pre-runtime Node baseline');
check(deautopoiesis.includes('baselineKeys.Contains'),'Windows quiescence must distinguish baseline processes from test-owned residuals');
check(deautopoiesis.includes('Residual ICTC-owned Node processes'),'Windows quiescence diagnostics must identify only test-owned residual processes');
check(!deautopoiesis.includes('$nodes | Stop-Process'),'Windows quiescence must never terminate every Node process on the hosted runner');
check(deautopoiesis.includes("steps.windows-quiescence.outcome == 'success'"),'Windows quiescence must contribute to the authoritative portability verdict');
check(deautopoiesis.includes('RAIL: false-closure'),'false-closure firewall must publish one authoritative rail verdict');
check(!deautopoiesis.includes('portability-quiescence-'),'quiescence must not create an independent status rail');
check(!deautopoiesis.includes('uses: actions/checkout@'),'verdict-publishing deautopoiesis jobs must avoid checkout post-actions after the authoritative verdict');
check(!deautopoiesis.includes('uses: actions/setup-node@'),'verdict-publishing deautopoiesis jobs must avoid setup/cache post-actions after the authoritative verdict');
check(deautopoiesis.includes('Checkout exact head without post-action'),'deautopoiesis must use explicit exact-head checkout without post-actions');
check(deautopoiesis.includes('Select hosted Node toolcache without post-action'),'deautopoiesis must select hosted Node without post-actions');

if(failures.length){console.error(JSON.stringify({ok:false,failures},null,2));process.exit(1);}
console.log(JSON.stringify({ok:true,topology:'one-authoritative-status-per-rail',fanoutStatuses:false,browserStatusAuthority:'orchestrator-only-with-first-failure-output',portabilityVerdictBoundary:'runtime+owned-quiescence+no-post-actions',falseClosureVerdict:true,postVerdictActions:false,windowsNodeOwnership:'baseline-scoped'}));
