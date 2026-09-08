import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {validateChromePalette,paletteMetrics} from './s4-a6-ux2-chrome-palette-model.mjs';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const [tokens,chrome,business,styles,ux1,registry,workflow,design]=await Promise.all([
  read('./public/design-tokens.css'),read('./public/workspace-chrome-3-3.css'),read('./public/business-surface-convergence-2-7.css'),read('./public/styles.css'),read('./public/a6-ux1-fixed-safe-footer.css'),read('./current-gate-registry.mjs'),read('../.github/workflows/s4-a6-ux2-chrome-palette.yml'),read('../docs/21_DESIGN_SYSTEM.md')
]);
let closureExists=true;try{await access(new URL('./public/business-surface-convergence-2-7-closure.css',import.meta.url));}catch{closureExists=false;}
const sources={tokens,chrome,business,styles,ux1,registry,workflow,design,closureExists};
const failures=validateChromePalette(sources);assert.deepEqual(failures,[],JSON.stringify(failures,null,2));
console.log(JSON.stringify({ok:true,slice:'S4-A6',executionUnit:'A6-UX2',contract:'canonical chrome palette ownership contraction',palette:paletteMetrics(tokens),closureRetired:!closureExists,claimBoundary:'E2 source/ownership and deterministic color-math evidence only; not human aesthetic preference, WCAG certification, deployment effectiveness or independent assurance.'}));
