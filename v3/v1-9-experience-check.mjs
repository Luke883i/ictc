import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const [index,styles,frame,router,tools,shell,active,css,market]=await Promise.all([
  read('./public/index.html'),read('./public/styles.css'),read('./public/ui/procedure-frame.js'),read('./public/ui/surface-router.js'),read('./public/ui/global-tools.js'),read('./public/ui/stable-shell.js'),read('./public/ui/active-experience.js'),read('./public/experience-1-9.css'),read('./public/ui/procedure-market-ux.js')
]);
assert.match(index,/data-ictc-edition="1\.2-market-candidate"/,'semantic edition remains 1.2');
assert.match(shell,/ictcExperienceEdition=EXPERIENCE_EDITION/);
assert.match(shell,/EXPERIENCE_EDITION='1\.9-experience-candidate'/);
assert.doesNotMatch(shell,/dataset\.ictcEdition\s*=/,'experience layer must not rewrite semantic edition');
assert.match(shell,/home\.textContent='Home'/);
assert.match(active,/installProcedureFrame\(\)/);
assert.equal((active.match(/installProcedureFrame\(\)/g)||[]).length,1);
for(const id of ['monitoring','incidents','objects','coverage','actions','risks','assurance'])assert.ok(frame.includes(`${id}:`)||frame.includes(`'${id}'`),id);
for(const token of ['Scopo della procedura','data-procedure-primary','data-process-code','Apri Evidenze','data-nav-back'])assert.ok(frame.includes(token),token);
assert.match(frame,/state\.role==='auditor'/);
assert.doesNotMatch(frame,/button\.remove\(\)/,'presentation layer must not delete unknown controls to hide accessibility bugs');
for(const token of ['pushState','replaceState','popstate','view','procedureId','getBackLabel','navigateBack'])assert.ok(router.includes(token),token);
for(const token of ['metaKey','RECENT_KEY','Home','Processi','Evidenze','ArrowDown','ArrowUp','Escape','enabledProcedures'])assert.ok(tools.includes(token),token);
assert.ok(tools.indexOf("closeCommand({restoreFocus:false});navigateSurface('monitoring'")>=0,'source dialog focus handoff');
assert.match(styles,/@import url\('\.\/experience-1-9\.css'\);/);
assert.match(css,/data-ictc-experience-edition="1\.9-experience-candidate"/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
for(const bp of ['max-width:980px','max-width:760px','max-width:520px'])assert.ok(css.includes(bp),bp);
assert.match(css,/\.command-dialog/);assert.match(css,/\.procedure-frame/);assert.match(css,/\.procedure-card/);
assert.doesNotMatch(css,/button:empty[^\{]*\{[^}]*display\s*:\s*none/i,'unnamed controls must be audited, not hidden by presentation CSS');
for(const forbidden of ['MutationObserver','prompt(','confirm(','complianceScore','maturityScore'])assert.ok(!`${frame}\n${router}\n${tools}\n${shell}`.includes(forbidden),forbidden);
assert.match(market,/function renderStandardWorkspace/);
console.log('v1-9-experience-check: ok (semantic 1.2 + Experience 1.9 Candidate; one canonical visible procedure frame)');
