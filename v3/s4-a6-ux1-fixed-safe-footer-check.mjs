import {readFileSync} from 'node:fs';
import {A6_UX1_CONTRACT,validateA6Ux1} from './s4-a6-ux1-footer-model.mjs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const result=validateA6Ux1({
  css:read('./public/a6-ux1-fixed-safe-footer.css'),
  styles:read('./public/styles.css'),
  registry:read('./current-gate-registry.mjs'),
  workflow:read('../.github/workflows/s4-a6-ux1-fixed-safe-footer.yml'),
  browser:read('./browser-s4-a6-ux1-fixed-safe-footer.py')
});
if(!result.ok){console.error(JSON.stringify({ok:false,...A6_UX1_CONTRACT,failures:result.failures},null,2));process.exit(1)}
console.log(JSON.stringify({ok:true,...A6_UX1_CONTRACT,checks:'fixed footer + safe-area/body reserve coupling + exact-head Chromium focus non-overlap + no root trap',governanceBoundary:'Forward regression gate validates UX1 runtime geometry only; convergence-authority validates current PR lineage separately.'}));
