import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts';ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
PHASE='init';RESULTS=[]
CODES={'RN-01':('monitoring','#monitoringView'),'EC-01':('incidents','#incidentsView'),'AO-01':('objects','#grcWorkspace'),'MC-01':('coverage','#grcWorkspace')}

def fail(exc):
 payload={'ok':False,'slice':'S4-A6','executionUnit':'A6-UX3','phase':PHASE,'type':type(exc).__name__,'message':str(exc),'traceback':traceback.format_exc(),'results':RESULTS,'claimBoundary':'Automated exact-head browser evidence for repository UI semantics only; no human usability, legal compliance, accessibility certification, deployment effectiveness or independent assurance.'}
 (ART/'browser-s4-a6-ux3-operational-surface-error.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8')
 print(f'::error title=browser-s4-a6-ux3-operational-surface::{PHASE}: {type(exc).__name__}: {exc}',flush=True)

def no_overflow(page,label):
 m=page.evaluate("()=>({inner:innerWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth})")
 assert m['html']<=m['inner']+1 and m['body']<=m['inner']+1,(label,m)
 RESULTS.append({'oracle':'reflow','case':label,'metrics':m})

def single_scroll_owner(page,root,label):
 owners=page.locator(root).evaluate("""async r=>{
  if(document.fonts?.ready)await document.fonts.ready;
  const frame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
  await frame();await frame();await frame();await frame();
  return [r,...r.querySelectorAll('*')].filter(e=>{
   const s=getComputedStyle(e);
   return e.getClientRects().length&&/(auto|scroll)/.test(s.overflowY)&&e.scrollHeight>e.clientHeight+2;
  }).map(e=>({tag:e.tagName,id:e.id||'',cls:String(e.className||''),client:e.clientHeight,scroll:e.scrollHeight,overflowX:getComputedStyle(e).overflowX,overflowY:getComputedStyle(e).overflowY}));
 }""")
 assert len(owners)<=1,(label,owners)
 RESULTS.append({'oracle':'single-scroll-owner','case':label,'owners':owners})

def footer_clear(page,label):
 m=page.evaluate("""async()=>{const f=document.querySelector('#stableLegalFooter');if(!f)return{missing:true};const frame=()=>new Promise(r=>requestAnimationFrame(r));const exposed=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);if(!(r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none')||e.disabled)return false;for(let n=e.parentElement;n;n=n.parentElement){if(n.matches?.('details:not([open])')){const own=n.querySelector(':scope > summary');if(own!==e&&!own?.contains(e))return false;}}return true;};const candidates=[...document.querySelectorAll('main button,main a[href],main input,main select,main textarea,main summary')].filter(exposed).slice(0,48),offenders=[];for(const e of candidates){e.focus?.();await frame();await frame();const r=e.getBoundingClientRect(),fr=f.getBoundingClientRect(),h=Math.max(0,Math.min(r.bottom,fr.bottom)-Math.max(r.top,fr.top)),w=Math.max(0,Math.min(r.right,fr.right)-Math.max(r.left,fr.left)),area=h*w;if(area>.5)offenders.push({tag:e.tagName,id:e.id||'',text:(e.textContent||'').trim().replace(/\s+/g,' ').slice(0,80),area});}return{missing:false,sampled:candidates.length,overlap:offenders.length,offenders}}""")
 assert not m.get('missing') and m['overlap']==0,(label,m.get('offenders',[])[:3])
 RESULTS.append({'oracle':'footer-focus-clear','case':label,'metrics':m})

def processes(page):return page.locator('.service-nav [data-service="processes"]')

def open_process(page,code):
 global PHASE
 processes(page).click();card=page.locator(f'#procedureHub [data-process-code="{code}"]');expect(card).to_be_visible();card.locator(':scope > footer .procedure-primary').click();pid,root=CODES[code];PHASE=f'{code}-owner';page.wait_for_function("x=>{const r=document.querySelector(x.root),h=document.documentElement,w=r?.querySelector(':scope > [data-procedure-attention-slot=\"'+x.owner+'\"] [data-procedure-worklist]');return !!(r&&r.offsetParent!==null&&r.dataset.a6Ux3Operational==='a6-ux3'&&r.dataset.a6OperationalOwner===x.owner&&h.dataset.a6Ux4Semantic==='a6-ux4'&&w?.dataset.a6Ux4Mount==='semantic-bridge')}",arg={'root':root,'owner':pid});return page.locator(root)

def admin_desktop(browser):
 global PHASE
 ctx=browser.new_context(viewport={'width':1440,'height':950});ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')")
 page=ctx.new_page();page.set_default_timeout(30000);errors=[];writes=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:writes.append({'method':r.method,'url':r.url}) if r.url.startswith(BASE+'/api/') and r.method!='GET' else None)
 PHASE='home';page.goto(BASE+'/?view=home',wait_until='networkidle');page.wait_for_function("()=>document.documentElement.dataset.a6Ux3Operational==='a6-ux3'");home=page.locator('#homeView');expect(home).to_have_attribute('data-a6-operational-owner','home');expect(page.locator('#homeTitle')).to_have_text('Integrated Compliance Tower Control');expect(page.locator('#homePriorities')).to_have_attribute('data-a6-operational-queue','priority-first');priorities=page.locator('#homePriorities .home-business-priority');
 if priorities.count():expect(priorities.first.locator('.a6-process-icon')).to_have_count(1);size=priorities.first.locator('.a6-process-icon').evaluate("e=>[e.getBoundingClientRect().width,e.getBoundingClientRect().height]");assert max(size)<=18.5,size
 no_overflow(page,'desktop:home');footer_clear(page,'desktop:home')
 rn=open_process(page,'RN-01');PHASE='rn-assert';reg=rn.locator('[data-a6-registry="monitoring"]');expect(reg).to_be_visible();expect(reg).to_have_attribute('open','');expect(reg.locator('[data-a6-search="monitoring"]')).to_be_visible();expect(reg.locator('[data-a6-state="monitoring"]')).to_have_value('current');expect(reg).to_have_attribute('data-a6-unbound-records','0');expect(rn.locator('[data-open-contribution] strong')).to_have_text('Aggiungi fonte o materiale');no_overflow(page,'desktop:rn')
 ec=open_process(page,'EC-01');PHASE='ec-assert';ereg=ec.locator('[data-a6-registry="incidents"]');expect(ereg).to_be_visible();expect(ereg).to_have_attribute('open','');expect(ereg.locator('[data-a6-search="incidents"]')).to_be_visible();expect(ereg.locator('[data-a6-state="incidents"]')).to_have_value('open');expect(ereg).to_have_attribute('data-a6-unbound-records','0');no_overflow(page,'desktop:ec')
 ao=open_process(page,'AO-01');PHASE='ao-assert';expect(ao.locator('[data-seq-ao-search]')).to_have_count(1);expect(ao.locator('[data-seq-ao-filter]')).to_have_count(1);expect(ao.locator('[data-seq-ao-search]')).to_have_attribute('data-a6-stable-record-search','');expect(ao.locator('[data-seq-ao-filter]')).to_have_attribute('data-a6-stable-state-filter','');no_overflow(page,'desktop:ao')
 mc=open_process(page,'MC-01');PHASE='mc-frameworks';expect(mc.locator('[data-framework-card]')).to_have_count(21);PHASE='mc-duplicates';expect(mc.locator('.finetune-concept-drilldown:visible')).to_have_count(0);PHASE='mc-scopes';scopes=mc.locator('.market-scope-editor');expect(scopes).to_have_count(21);scope=scopes.first;expect(scope.locator(':scope > summary')).to_be_visible();PHASE='mc-scope-open';scope.locator(':scope > summary').click();expect(scope).to_have_attribute('open','');PHASE='mc-scope-position';position=scope.evaluate("e=>getComputedStyle(e).position");assert position=='fixed',position;PHASE='mc-scope-close';scope.locator(':scope > summary').click();expect(scope).not_to_have_attribute('open','');PHASE='mc-standard-entries';entries=mc.locator('[data-open-standard-browser]');expect(entries).to_have_count(21);expect(entries.first).to_have_text('Comprendi standard');PHASE='mc-standard-open';entries.first.click();dialog=page.locator('#standardBrowserDialog');expect(dialog).to_be_visible();PHASE='mc-standard-detail';expect(dialog.locator('[data-standard-nodes]')).to_be_visible();expect(dialog.locator('[data-standard-detail]')).to_be_visible();PHASE='mc-standard-scroll';single_scroll_owner(page,'#standardBrowserDialog','desktop:standard-browser');nodes=dialog.locator('[data-standard-node-select]');
 if nodes.count():PHASE='mc-standard-node';target=nodes.nth(1 if nodes.count()>1 else 0);target_ref=target.locator(':scope > span').inner_text().strip();target.click();expect(target).to_have_attribute('aria-current','true');expect(dialog.locator('[data-standard-detail] > header')).to_be_visible();expect(dialog.locator('[data-standard-detail] > header .process-code')).to_have_text(target_ref)
 PHASE='mc-standard-readonly';expect(dialog.locator('[data-standard-use]')).to_have_count(0);PHASE='mc-standard-close';dialog.locator('button[aria-label="Chiudi"]').click();expect(dialog).not_to_be_visible();PHASE='mc-geometry';no_overflow(page,'desktop:mc');footer_clear(page,'desktop:mc')
 PHASE='admin-read-only';assert not writes,writes;assert not errors,errors
 RESULTS.append({'oracle':'operational-owner-matrix','home':True,'rn':True,'ec':True,'ao':True,'mc':True,'scopePopup':True,'standardBrowserReadOnly':True,'writeCount':len(writes)})
 ctx.close()

def user_boundary(browser):
 global PHASE
 ctx=browser.new_context(viewport={'width':1280,'height':850});ctx.add_init_script("localStorage.setItem('ictc-role','user');localStorage.setItem('ictc-service','processes')");page=ctx.new_page();page.set_default_timeout(30000);page.goto(BASE+'/?view=processes',wait_until='networkidle');PHASE='user-mc-open';mc=open_process(page,'MC-01');PHASE='user-mc-assert';expect(mc.locator('.market-scope-editor')).to_have_count(0);entries=mc.locator('[data-open-standard-browser]');expect(entries.first).to_be_visible();entries.first.click();dialog=page.locator('#standardBrowserDialog');expect(dialog).to_be_visible();expect(dialog.locator('[data-standard-use]')).to_have_count(0);dialog.locator('button[aria-label="Chiudi"]').click();RESULTS.append({'oracle':'role-boundary','role':'user','scopeWriteVisible':False});ctx.close()

def mobile(browser,width,height):
 global PHASE
 ctx=browser.new_context(viewport={'width':width,'height':height});ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')");page=ctx.new_page();page.set_default_timeout(30000);page.goto(BASE+'/?view=processes',wait_until='networkidle');PHASE=f'mobile-{width}-hub';expect(page.locator('#procedureHub .procedure-card')).to_have_count(7);no_overflow(page,f'mobile-{width}:hub');mc=open_process(page,'MC-01');PHASE=f'mobile-{width}-mc-assert';expect(mc.locator('[data-open-standard-browser]')).to_have_count(21);no_overflow(page,f'mobile-{width}:mc');footer_clear(page,f'mobile-{width}:mc');ctx.close()

try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch)
  admin_desktop(browser);user_boundary(browser);mobile(browser,390,844);mobile(browser,320,800)
  report={'ok':True,'slice':'S4-A6','executionUnit':'A6-UX3','contract':'operational surface convergence','oracles':['operational-owner-matrix','standard-single-entry','scope-popup-overlay','standard-master-detail','single-scroll-owner','role-boundary','reflow','footer-focus-clear','read-only-observation'],'results':RESULTS,'claimBoundary':'Automated exact-head Chromium evidence for repository-owned operational composition. Parent S4-A6 remains open; this does not establish human usability, assistive-technology effectiveness, legal compliance, production effectiveness, enterprise-candidate status or independent assurance.'}
  (ART/'browser-s4-a6-ux3-operational-surface.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf8');print(json.dumps({'ok':True,'slice':'S4-A6','executionUnit':'A6-UX3','oracles':len(report['oracles'])}),flush=True);browser.close()
except BaseException as exc:
 fail(exc);traceback.print_exc();raise
