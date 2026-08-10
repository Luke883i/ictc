import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const [styles,refined,active,copy,shell,tools,market,browser]=await Promise.all([
  read('./public/styles.css'),read('./public/refined-product.css'),read('./public/ui/active-experience.js'),read('./public/ui/product-copy.js'),read('./public/ui/stable-shell.js'),read('./public/ui/global-tools.js'),read('./public/ui/procedure-market-ux.js'),read('./browser-v1-9-experience.py')
]);
assert.ok(styles.indexOf("@import url('./market-1-2.css');")<styles.indexOf("@import url('./experience-1-9.css');"),'market css must be in canonical cascade before experience');
assert.ok(styles.trim().includes("@import url('./refined-product.css');")||styles.includes("@import url('./refined-product.css');"),'refined final layer missing');
for(const token of ['html:has(dialog[open])','dialog[open]{overflow:hidden','min-height:0!important','card-actions button:not(.primary)','refined-incident-intake','refined-question-why','--refined-control-min:44px'])assert.ok(refined.includes(token),token);
assert.match(active,/installRefinedProduct/);
assert.match(copy,/Postura Standard & Security ICTC/);
assert.match(shell,/SURFACE_LABELS\.proof/);
assert.match(tools,/SURFACE_LABELS\.proof/);
assert.match(tools,/function allowedRecent\(item\)\{return rows\(\)\.some/,'recents must be re-authorized against current projection');
assert.match(tools,/navigator\.platform/,'shortcut hint must be platform aware');
assert.match(market,/link\.dataset\.market12/,'legacy market injector remains detectable until source compression; runtime neutralizer must remove it');
assert.match(refined,/link\[data-market-12\]/,'legacy dynamic css link must be neutralized at runtime after canonical import');
for(const token of ['one_scroll_owner','painted','incident-intake','Postura Standard & Security ICTC'])assert.ok(browser.includes(token),`browser polish assertion missing: ${token}`);
console.log('refined-product-check: ok (Wave A/B/C invariants wired)');
