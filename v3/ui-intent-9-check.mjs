import assert from'node:assert/strict';import{readFileSync}from'node:fs';const r=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const [slots,rn,grc,anatomy,anatomyCss,render,router,admin,standard,publicPack,browser,index,chrome,home,p2,ux4,ai,frame]=['./public/ui/procedure-editorial-slots.js','./public/ui/procedure-sequential-rn-ec.js','./public/ui/grc-workspace-3-2.js','./public/ui/procedure-anatomy.js','./public/procedure-anatomy.css','./public/ui/render.js','./public/ui/surface-router.js','./public/ui/procedure-admin.js','./runtime/standard-library-current.mjs','./runtime/standard-public-source-pack.mjs','./public/ui/standard-browser.js','./public/index.html','./public/workspace-chrome-3-3.css','./public/enterprise-workspace-3-2.css','./public/enduser-composition-p2.css','./public/a6-ux4-semantic-surface.css','./public/ui/enterprise-ux.js','./public/ui/procedure-frame.js'].map(r);
for(const owner of[rn,grc])assert.ok(owner.includes("['reference','advanced-context','metrics','attention','controls','primary']"));
assert.ok(slots.includes('insertSupport')&&slots.includes('positionSupportRail')&&slots.includes('validPhysicalOrder')&&slots.includes(':scope > .procedure-support-rail')&&!slots.includes('MutationObserver'));
assert.ok(anatomy.includes('<details class="procedure-anatomy-standards"')&&anatomy.includes('outerOpen')&&anatomy.includes('procedure-anatomy-boundary')&&anatomy.includes('Perché serve'));assert.ok(frame.includes('syncSupportRail')&&frame.includes("rail.dataset.secondaryDisclosure='true'")&&!frame.includes('<div class="procedure-support-rail"')&&!frame.includes('Perché conta'));assert.ok(index.indexOf('data-rn-primary-work="sources"')<index.indexOf('data-rn-monitoring-secondary'));
assert.ok(anatomyCss.includes('.procedure-frame .procedure-boundary{display:grid}')&&anatomyCss.includes('[data-procedure-orientation="compact"]')&&anatomyCss.includes('.procedure-standard-name{font-weight:400}'));
assert.ok(render.includes('data-source-state')&&!render.includes('Motivazione non disponibile')&&!render.includes('slice(0,110)')&&render.includes('esc(item.originalNarrative)'));
assert.ok(p2.includes('catalog-state-label')&&p2.includes('--p2-state-rail:7.5rem')&&p2.includes('grid-template-columns:var(--p2-state-rail) minmax(0,1fr) auto')&&p2.includes('word-break:normal')&&p2.includes('hyphens:none')&&p2.includes('rn-monitoring-secondary')&&p2.includes('border-left-color:var(--color-border)')&&p2.includes('text-overflow:clip'));
for(const token of['market-scope.tracked','market-scope.reference','market-scope.not-used','market-scope.undeclared','inline-size:12rem'])assert.ok(ux4.includes(token));
assert.ok(router.includes('procedurePolicy?.enabled')&&router.includes("reason:'procedure-disabled'")&&router.includes('guardCurrentRoute'));
assert.ok(admin.includes('ackRow')&&admin.includes('actions.hidden=!dirty')&&admin.includes('Salva disponibilità operativa'));
assert.ok(!index.includes('<small>Compliance operativa ed evidenze</small>')&&chrome.includes('.topbar .brand b{font-size:18px'));
assert.ok(ai.includes("llm.ready?'ready':llm.configured?'key-missing':'unconfigured'")&&ai.includes('status.hidden=true')&&ai.includes("status.dataset.legacyControl='shell-ai-status'")&&!ai.includes('status.dataset.tooltip=view.tooltip'));
assert.ok(publicPack.includes('officialSourceConfirmed')&&publicPack.includes('standard-public-source-incomplete')&&publicPack.includes("contentMode:'official-public-text'"));
assert.ok(standard.includes('neutralDescription')&&standard.includes('neutralKeywords')&&standard.includes('neutralOutline')&&standard.includes("neutralContentMode:'ictc-neutral-index'")&&standard.includes('licensed-reference-index'));
assert.ok(browser.includes('Testo ufficiale pubblico')&&browser.includes('standard-official-text')&&browser.includes('standard-neutral-index')&&browser.includes('testo ufficiale esatto'));
// HOME-ORDER-4 supersedes UI-INTENT-9's viewport-height clamp, not its footer or hidden-state protection.
function homeLayoutOracle(source){
 const block=source.match(/@media\(min-width:761px\) and \(min-height:720px\)\{([\s\S]*?)\n\}/)?.[1]||'';
 const rules=[...block.matchAll(/html\[data-native-semantic-lattice="3\.2\.0"\]\[data-ictc-surface="home"\]\s+(main|#homeView)\{([^{}]*)\}/g)];
 if(rules.length!==2||new Set(rules.map(x=>x[1])).size!==2)return false;
 const declarations=selector=>Object.fromEntries((rules.find(x=>x[1]===selector)?.[2]||'').split(';').map(x=>x.trim()).filter(Boolean).map(x=>{const at=x.indexOf(':');return[x.slice(0,at).trim(),x.slice(at+1).trim()]}));
 const main=declarations('main'),view=declarations('#homeView');
 return main['padding-top']==='0!important'&&main['padding-bottom']==='var(--a6-ux1-footer-reserve,44px)!important'&&main['min-height']==='0!important'&&view['box-sizing']==='border-box'&&view.height==='auto'&&view['max-height']==='none'&&view['min-height']==='0'&&view.display==='grid'&&view['align-content']==='start'&&view.overflow==='visible'&&view['padding-top']==='0!important'&&view['padding-bottom']==='0!important'&&source.includes('\n[hidden]{display:none!important}\n')&&!/html\[data-native-semantic-lattice[^\{]*\]\s*body\s*\{[^\}]*overflow\s*:\s*hidden/i.test(source);
}
assert.ok(homeLayoutOracle(home),'Home must grow naturally, reserve footer space and preserve hidden controls');
const homeLayoutMutants=[
 ['viewport-clamp','height:auto;max-height:none','height:calc(100dvh - 100px);max-height:none'],
 ['max-height-clamp','max-height:none;min-height:0','max-height:100dvh;min-height:0'],
 ['content-centering','align-content:start;overflow:visible','align-content:center;overflow:visible'],
 ['content-clipping','overflow:visible;padding-top','overflow:hidden;padding-top'],
 ['missing-footer-reserve','padding-bottom:var(--a6-ux1-footer-reserve,44px)!important','padding-bottom:0!important'],
 ['reduced-footer-reserve','--a6-ux1-footer-reserve,44px','--a6-ux1-footer-reserve,0px'],
 ['forced-viewport-minimum','height:auto;max-height:none;min-height:0','height:auto;max-height:none;min-height:100dvh'],
 ['layout-grid-retirement','min-height:0;display:grid;align-content:start','min-height:0;display:block;align-content:start'],
 ['lost-border-box','box-sizing:border-box;height:auto','box-sizing:content-box;height:auto'],
 ['view-top-obstruction','overflow:visible;padding-top:0!important','overflow:visible;padding-top:12px!important'],
 ['main-top-obstruction','main{padding-top:0!important','main{padding-top:12px!important'],
 ['lost-hidden-guard','\n[hidden]{display:none!important}\n','\n[hidden]{display:block!important}\n'],
 ['body-scroll-lock','\n[hidden]{display:none!important}\n','\nhtml[data-native-semantic-lattice="3.2.0"] body{overflow:hidden}\n[hidden]{display:none!important}\n'],
 ['duplicate-layout-owner','html[data-native-semantic-lattice="3.2.0"][data-ictc-surface="home"] #homeView{box-sizing:border-box','html[data-native-semantic-lattice="3.2.0"][data-ictc-surface="home"] #homeView{height:100vh}\nhtml[data-native-semantic-lattice="3.2.0"][data-ictc-surface="home"] #homeView{box-sizing:border-box']
];
for(const [name,before,after] of homeLayoutMutants){
 assert.ok(home.includes(before),'Home mutation preimage absent: '+name);
 assert.equal(homeLayoutOracle(home.replace(before,after)),false,'Home regression survived: '+name);
}
assert.ok(chrome.includes('.topbar{height:var(--ui-header-h)!important;min-height:var(--ui-header-h)!important}')&&chrome.includes('.topbar .stable-header-inner{height:100%!important}'));
console.log(JSON.stringify({ok:true,slice:'UI-INTENT-9',images:9,dod:14,claimBoundary:'Source/runtime semantic closure. Public exact text requires a complete confirmed official pack; proprietary normative text remains license-gated.'}));
