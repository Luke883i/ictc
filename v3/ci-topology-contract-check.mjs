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
check(ci.includes("'ictc/exact-head-ci'"),'CI must retain one exact-head aggregate verdict');
check(census.includes("'ictc/actions-census'"),'census must retain one exact-head Actions verdict');

const quiescence=deautopoiesis.indexOf('- name: Enforce Windows runtime process quiescence');
const portabilityVerdict=deautopoiesis.indexOf('- name: Publish portability exact-head verdict');
check(quiescence>=0&&portabilityVerdict>quiescence,'portability verdict must be published after Windows quiescence');
check(deautopoiesis.includes("steps.windows-quiescence.outcome == 'success'"),'Windows quiescence must contribute to the authoritative portability verdict');
check(deautopoiesis.includes('RAIL: false-closure'),'false-closure firewall must publish one authoritative rail verdict');
check(!deautopoiesis.includes('portability-quiescence-'),'quiescence must not create an independent status rail');

if(failures.length){console.error(JSON.stringify({ok:false,failures},null,2));process.exit(1);}
console.log(JSON.stringify({ok:true,topology:'one-authoritative-status-per-rail',fanoutStatuses:false,browserStatusAuthority:'orchestrator-only',portabilityVerdictBoundary:'runtime+quiescence',falseClosureVerdict:true}));
