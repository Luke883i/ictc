import os
from playwright.sync_api import expect,sync_playwright
from browser_test_support import ensure_onboarded
# Failure-only diagnostics; preserves every Playwright assertion and timeout.
import sys,json,traceback
from pathlib import Path
_original_exception_hook=sys.excepthook
_probe_console=[]
def _probe_failure_hook(exc_type,exc,tb):
 try:
  report={'probe':PROBE,'expectedDemo':DEMO,'base':BASE,'exception':str(exc),
          'consoleTail':_probe_console[-25:],'traceback':' '.join(traceback.format_exception(exc_type,exc,tb))[-4000:]}
  page=globals().get('p')
  if page is not None:
   try:
    report['dom']=page.evaluate("""()=>{const hub=document.querySelector('#procedureHub'),root=document.querySelector('#processesView'),items=[...(hub?.querySelectorAll(':scope > [data-process-code]')||[])];return{url:location.pathname,readyState:document.readyState,semanticLattice:document.documentElement.dataset.nativeSemanticLattice,hubCount:hub?.dataset.catalogueItemCount,processDisplay:root?getComputedStyle(root).display:null,fontStatus:document.fonts.status,items:items.map(e=>{const b=e.querySelector(':scope > .procedure-maturity'),r=e.getBoundingClientRect(),q=b?.getBoundingClientRect();return{code:e.dataset.processCode,height:r.height,badgeLeft:q?.left,badgeSvg:!!b?.querySelector('svg.maturity-icon')}})}}""")
   except Exception as error:report['domError']=str(error)
   try:
    Path('artifacts/browser-probe').mkdir(parents=True,exist_ok=True)
    page.screenshot(path=f'artifacts/browser-probe/{PROBE}-failure.png',full_page=True,timeout=5000)
   except Exception as error:report['screenshotError']=str(error)
  Path('artifacts/browser-probe').mkdir(parents=True,exist_ok=True)
  Path(f'artifacts/browser-probe/{PROBE}-failure.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
  print('ICTC_BROWSER_PROBE_FAILURE_DIAGNOSTIC='+json.dumps(report,ensure_ascii=False),file=sys.stderr,flush=True)
 except Exception as error:print('ICTC_BROWSER_PROBE_DIAGNOSTIC_ERROR='+str(error),file=sys.stderr,flush=True)
 _original_exception_hook(exc_type,exc,tb)
sys.excepthook=_probe_failure_hook
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/');DEMO=os.environ.get('ICTC_EXPECT_DEMO','0')=='1';PROBE=os.environ.get('ICTC_BROWSER_PROBE','desktop')
def load(p):p.goto(BASE,wait_until='networkidle');ensure_onboarded(p,BASE,'admin');p.wait_for_function("()=>document.documentElement.dataset.nativeSemanticLattice==='3.2.0'&&!!document.querySelector('#stableProfileMenu')")
def footer_effect(p):
 m=p.evaluate("""()=>{const f=document.querySelector('#stableLegalFooter'),main=document.querySelector('main');if(!f||!main)return{missing:true};const fr=f.getBoundingClientRect(),mr=main.getBoundingClientRect(),fs=getComputedStyle(f),bs=getComputedStyle(document.body),hs=getComputedStyle(document.documentElement),px=v=>parseFloat(v)||0,visible=e=>{const r=e.getBoundingClientRect(),st=getComputedStyle(e);return r.width>0&&r.height>0&&st.visibility!=='hidden'&&st.display!=='none'&&!e.disabled},controls=[...document.querySelectorAll('main button,main a[href],main input,main select,main textarea,main summary')].filter(visible),overlaps=controls.filter(e=>{const r=e.getBoundingClientRect();return Math.max(0,Math.min(r.bottom,fr.bottom)-Math.max(r.top,fr.top))*Math.max(0,Math.min(r.right,fr.right)-Math.max(r.left,fr.left))>.5}).length;return{missing:false,position:fs.position,footerTop:fr.top,footerBottom:fr.bottom,viewportHeight:innerHeight,mainBottom:mr.bottom,footerHeight:fr.height,bodyPaddingBottom:px(bs.paddingBottom),scrollPaddingBottom:px(hs.scrollPaddingBottom),overlaps}}""");assert not m.get('missing') and m['position']=='fixed' and m['footerHeight']>=43.5 and abs(m['footerBottom']-m['viewportHeight'])<=3 and m['bodyPaddingBottom']>=m['footerHeight']-2 and m['scrollPaddingBottom']>=m['footerHeight']-2 and m['overlaps']==0,m;return m
def open_admin(p):
 m=p.locator('#stableProfileMenu')
 expect(m).to_be_visible()
 if m.get_attribute('open') is None:
  m.locator(':scope > summary').click()
 b=p.locator('#stableProfileMenu #openAdminCenter')
 expect(b).to_be_visible()
 b.click()
 expect(p.locator('#adminCenter')).to_be_visible()
def open_policy_disclosure(p):
 detail=p.locator('#adminCenter details[data-admin-progressive="procedure-policy"]')
 expect(detail).to_have_count(1)
 if detail.get_attribute('open') is None:
  detail.locator(':scope > summary').click()
 expect(detail).to_have_attribute('open','')
with sync_playwright() as pw:
 launch={'headless':True,'args':['--no-sandbox']}
 if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
 browser=pw.chromium.launch(**launch);w,h=(390,844) if PROBE=='mobile' else (1440,950);ctx=browser.new_context(viewport={'width':w,'height':h});ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','home')");p=ctx.new_page();p.set_default_timeout(30000);p.on('console',lambda msg:_probe_console.append({'kind':msg.type,'text':msg.text[:300]}));p.on('pageerror',lambda error:_probe_console.append({'kind':'pageerror','text':str(error)[:300]}));load(p)
 if PROBE=='desktop':
  expect(p.locator('.service-nav > [data-service]')).to_have_count(3);expect(p.locator('#stableProfileMenu')).to_contain_text('Amministratore');expect(p.locator('#stableProfileMenu')).to_contain_text('Ruolo attivo');f=p.locator('#stableLegalFooter');expect(f).to_be_visible();footer_effect(p)
  if DEMO:
   c=p.locator('#ictcDemoCard');expect(c).to_be_visible();expect(c).to_contain_text('Suite 3.0');expect(p.locator('#ictcDemoBanner')).to_have_count(0);c.click();d=p.locator('#ictcDemoDialog');expect(d).to_be_visible();expect(d).to_contain_text('188 record business 3.0');expect(d).to_contain_text('512 fixture escluse');expect(d).to_contain_text('Evidence Lattice');expect(d).to_contain_text('Suite 2.2 deprecata');expect(d).to_contain_text('demo-suite-3-0');expect(d).to_contain_text('Dimostrazione, non verdetto');assert p.locator('html').get_attribute('data-ictc-demo-projection')=='demo-suite-3-0';assert p.locator('html').get_attribute('data-ictc-demo-suite')=='3.0'
  else:expect(p.locator('#ictcDemoCard')).to_have_count(0)
 elif PROBE=='admin':
  open_admin(p);a=p.locator('#adminCenter');expect(a.locator('[data-admin-nav]')).to_have_count(3);expect(a.locator('[data-admin-view]:visible')).to_have_count(1);a.locator('[data-admin-nav="ai"]').click();expect(a.locator('[data-admin-view="ai"]')).to_be_visible();a.locator('[data-admin-nav="identity"]').click();expect(a.locator('[data-admin-view="identity"]')).to_be_visible()
 elif PROBE=='procedures' or PROBE in ('procedures-structure','procedures-legend','procedures-alignment'):
  p.locator('.service-nav [data-service="processes"]').click()
  expect(p.locator('#procedureHub')).to_have_attribute('data-maturity-visible','false')
  expect(p.locator('#processesView [data-maturity-legend]')).to_have_count(0)
  assert p.locator('#procedureHub [data-maturity]').count()==0
  # Existing geometry checks still exercise all nine badges, but only after
  # the admin opts in using the real procedure-policy writer and readback.
  headers={'x-ictc-role':'admin','x-ictc-actor-id':'local-admin'}
  policy=p.request.get(BASE+'/api/admin/procedures',headers=headers)
  assert policy.ok,('policy-read',policy.status,policy.text()[:300])
  configuration=policy.json()
  update=p.request.put(BASE+'/api/admin/procedures',headers={**headers,'content-type':'application/json'},data={'features':configuration['features'],'presentation':{'showMaturity':True}})
  assert update.ok,('policy-write',update.status,update.text()[:300])
  persisted=p.request.get(BASE+'/api/admin/procedures',headers=headers)
  assert persisted.ok and persisted.json()['presentation']['showMaturity'] is True,'presentation flag readback'
  p.reload(wait_until='networkidle')
  p.locator('.service-nav [data-service="processes"]').click()
  expect(p.locator('#procedureHub')).to_have_attribute('data-maturity-visible','true')
  hub=p.locator('#procedureHub')
  expect(hub).to_have_attribute('data-catalogue-item-count','9')
  # Read a single settled Processi epoch; allow independently sized compact records, but enforce upper height, badges, 7 secondary disclosures and legend.
  p.wait_for_function("""()=>{const hub=document.querySelector('#procedureHub'),root=document.querySelector('#processesView');
   if(!hub||!root||hub.dataset.catalogueItemCount!=='9')return false;
   const records=[...hub.querySelectorAll(':scope > [data-process-code]')],legend=root.querySelector('[data-maturity-legend]');
   if(records.length!==9||!legend||legend.querySelectorAll('[data-maturity]').length!==4)return false;
   const badges=records.map(e=>e.querySelector(':scope > .procedure-maturity'));
   const heights=records.map(e=>e.getBoundingClientRect().height);
   const offsets=badges.map(e=>e?.getBoundingClientRect().left);
   const nativeSecondary=records.filter(e=>e.dataset.catalogueKind==='procedure');
   const ready=badges.every(b=>b&&b.querySelector('svg.maturity-icon'))&&heights.every(h=>h>=44&&h<=(innerWidth<=390?360:240))&&
    nativeSecondary.length===7&&nativeSecondary.every(e=>!!e.querySelector(':scope > details[data-process-secondary-detail]'))&&
    getComputedStyle(hub).gridAutoRows!=='1fr'&&offsets.every(Number.isFinite)&&
    Math.max(...offsets)-Math.min(...offsets)<=2&&getComputedStyle(root).display!=='none'&&document.fonts.status==='loaded';
   if(!ready){delete window.__ictcProcessAlignmentSample;return false;}
   // A three-frame geometry-only signature can precede late semantic updates.
   // Stabilize the exact visible content/styles being asserted below; keep the
   // substantive test predicates unchanged, and reset on every epoch change.
   const recordSemantics=records.map(e=>[
    e.dataset.processCode,e.querySelector('[data-maturity]')?.dataset.maturity,
    e.querySelector('.procedure-purpose')?.textContent?.trim(),
    e.querySelector('.procedure-unavailable')?.getAttribute('aria-disabled')
   ]);
   const badgeSemantics=badges.map(b=>[
    b.getAttribute('aria-label'),b.querySelector('svg.maturity-icon')?.innerHTML,
    getComputedStyle(b).backgroundColor
   ]);
   const legendSemantics=[...legend.querySelectorAll('[data-maturity]')].map(e=>[
    e.dataset.maturity,e.getAttribute('aria-label'),e.textContent?.trim(),
    getComputedStyle(e).backgroundColor,e.querySelector('svg.maturity-icon')?.innerHTML
   ]);
   const signature=JSON.stringify([
    heights.map(v=>v.toFixed(2)),offsets.map(v=>v.toFixed(2)),
    recordSemantics,badgeSemantics,legendSemantics
   ]);
   const previous=window.__ictcProcessAlignmentSample,now=performance.now();
   const sameEpoch=previous?.signature===signature;
   const frames=sameEpoch?previous.frames+1:1;
   const since=sameEpoch?previous.since:now;
   window.__ictcProcessAlignmentSample={signature,frames,since};
   return frames>=3&&now-since>=400;
  }""")
  if PROBE in ('procedures','procedures-structure'):
   expect(hub.locator('[data-procedure-id]')).to_have_count(7)
   expect(hub.locator('[data-catalogue-placeholder-id]')).to_have_count(2)
   entries=hub.locator(':scope > [data-process-code]').evaluate_all("els=>els.map(e=>[e.dataset.processCode,e.querySelector('[data-maturity]')?.dataset.maturity])")
   assert entries==[['OP-01','placeholder'],['OG-01','placeholder'],['MC-01','ready'],['RN-01','scaffold-yellow'],['AO-01','scaffold-yellow'],['EC-01','ready'],['AP-01','scaffold-yellow'],['RC-01','scaffold-yellow'],['AR-01','scaffold-orange']],entries
   assert hub.locator('[data-catalogue-placeholder-id] button,[data-catalogue-placeholder-id] a[href],[data-catalogue-placeholder-id] [role="button"]').count()==0
   assert hub.locator('[data-catalogue-placeholder-id] .procedure-purpose').all_text_contents()==['Area prevista, non operativa.']*2
  if PROBE in ('procedures','procedures-legend'):
   legend=p.locator('#processesView [data-maturity-legend]')
   expect(legend).to_be_visible()
   expect(legend.locator('[data-maturity]')).to_have_count(4)
   for word in ['Maturità','Pronto','Parziale','In costruzione','Segnaposto']:
    assert word in legend.inner_text(),word
   for word in ['Indicativa: non certifica conformità né disponibilità.','Verde','Giallo','Arancione','Rosso','funzioni previste disponibili','scaffold iniziale']:
    assert word not in legend.inner_text(),word
   icon_shapes=legend.locator('[data-maturity]').evaluate_all("""els=>{
    const rgb=css=>{const match=css.match(/[0-9]+/g);return match&&match.length>=3?match.slice(0,3).map(Number):null};
    const lum=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
    const hue=c=>{const [r,g,b]=c.map(v=>v/255),max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min;if(delta<.045)return'grey';let angle=max===r?((g-b)/delta)%6:max===g?(b-r)/delta+2:(r-g)/delta+4;angle=(60*angle+360)%360;return angle>=95&&angle<=175?'green':angle>=39&&angle<=67?'yellow':angle>=15&&angle<39?'orange':'other'};
    return els.map(e=>{const style=getComputedStyle(e),bg=rgb(style.backgroundColor),fg=rgb(style.color),light=bg?lum(bg):null,dark=fg?lum(fg):null;
      return{state:e.dataset.maturity,shape:e.querySelector('svg.maturity-icon')?.innerHTML,ink:style.color,bg:style.backgroundColor,label:e.getAttribute('aria-label'),text:e.textContent.trim(),hue:bg?hue(bg):null,contrast:light===null||dark===null?0:(Math.max(light,dark)+.05)/(Math.min(light,dark)+.05)};});
   }""")
   expected=[('ready','green','Pronto'),('scaffold-yellow','yellow','Parziale'),('scaffold-orange','orange','In costruzione'),('placeholder','grey','Segnaposto')]
   assert len(icon_shapes)==4 and [(x['state'],x['hue']) for x in icon_shapes]==[(state,color) for state,color,_ in expected],icon_shapes
   assert len({item['shape'] for item in icon_shapes})==4 and len({item['bg'] for item in icon_shapes})==4,icon_shapes
   assert all(item['shape'] and item['text']=='' and item['contrast']>=4.5 and item['label']=='Maturità dichiarata: '+name for item,(_,_,name) in zip(icon_shapes,expected)),icon_shapes
  if PROBE in ('procedures','procedures-alignment'):
   badges=hub.locator(':scope > [data-process-code] > .procedure-maturity')
   expect(badges).to_have_count(9)
   assert badges.evaluate_all("els=>els.every(e=>e.tagName==='SPAN'&&e.textContent.trim()===''&&e.querySelectorAll('svg.maturity-icon').length===1&&e.getAttribute('role')==='img'&&e.getAttribute('aria-label')?.startsWith('Maturità dichiarata:'))")
   offsets=badges.evaluate_all("els=>els.map(e=>e.getBoundingClientRect().left)")
   assert max(offsets)-min(offsets)<=2,offsets
   heights=hub.locator(':scope > [data-process-code]').evaluate_all("els=>els.map(e=>e.getBoundingClientRect().height)")
   assert len(heights)==9 and all(44<=h<=240 for h in heights),heights
   assert hub.locator(':scope > [data-procedure-id] > details[data-process-secondary-detail]').count()==7, 'Seven native secondary details must remain outside compact rows'
   unavailable=hub.locator('[data-catalogue-placeholder-id] .procedure-unavailable')
   expect(unavailable).to_have_count(2)
   assert unavailable.evaluate_all("els=>els.every(e=>e.tagName==='SPAN'&&e.getAttribute('aria-disabled')==='true'&&!e.hasAttribute('tabindex')&&e.getBoundingClientRect().height>=44&&getComputedStyle(e).pointerEvents==='none')")
 elif PROBE=='procedure-toggle':
  p.locator('.service-nav [data-service="processes"]').click()
  hub=p.locator('#procedureHub')
  expect(hub).to_have_attribute('data-catalogue-item-count','9')
  p.locator('.service-nav [data-service="home"]').click();open_admin(p);open_policy_disclosure(p)
  expect(p.locator('#procedurePolicyList input')).to_have_count(9)
  op=p.locator('#procedurePolicyList input[name="policy-documents"]')
  expect(op).to_be_checked();op.uncheck()
  p.locator('#procedurePolicyAcknowledge').check()
  p.locator('#procedurePolicyForm button[type="submit"]').click()
  expect(op).not_to_be_checked()
  p.locator('#adminCenter [data-admin-close]').click()
  p.locator('.service-nav [data-service="processes"]').click()
  expect(hub.locator('[data-catalogue-placeholder-id]')).to_have_count(1)
  assert hub.locator('[data-process-code="OP-01"]').count()==0
  assert hub.locator('[data-process-code="OG-01"]').count()==1
  expect(hub.locator('[data-procedure-id]')).to_have_count(7)
  p.locator('.service-nav [data-service="home"]').click();open_admin(p);open_policy_disclosure(p)
  op=p.locator('#procedurePolicyList input[name="policy-documents"]')
  expect(op).not_to_be_checked();op.check()
  p.locator('#procedurePolicyAcknowledge').check()
  p.locator('#procedurePolicyForm button[type="submit"]').click()
  expect(op).to_be_checked()
  p.locator('#adminCenter [data-admin-close]').click()
  p.locator('.service-nav [data-service="processes"]').click()
  expect(hub.locator('[data-catalogue-placeholder-id]')).to_have_count(2)
 elif PROBE=='mobile':
  m=p.evaluate('()=>({w:innerWidth,h:document.documentElement.scrollWidth,b:document.body.scrollWidth,header:document.querySelector(".stable-header-inner")?.getBoundingClientRect().height||0})');assert max(m['h'],m['b'])<=m['w']+1,m;assert m['header']<=112,m
  p.locator('.service-nav [data-service="processes"]').click()
  expect(p.locator('#procedureHub')).to_have_attribute('data-catalogue-item-count','9')
  h=p.locator('#procedureHub > [data-process-code]').evaluate_all("els=>els.map(e=>e.getBoundingClientRect().height)")
  assert len(h)==9 and all(44<=value<=360 for value in h),h
  assert p.locator('#procedureHub > [data-procedure-id] > details[data-process-secondary-detail]').count()==7
  assert p.locator('#procedureHub [data-catalogue-placeholder-id] .procedure-unavailable').count()==2
  p.locator('.service-nav [data-service="home"]').click()
  open_admin(p);m=p.evaluate('()=>({w:innerWidth,h:document.documentElement.scrollWidth,b:document.body.scrollWidth})');assert max(m['h'],m['b'])<=m['w']+1,m
 else:raise SystemExit(f'unknown probe {PROBE}')
 print({'ok':True,'probe':PROBE,'demo':DEMO,'demoProjectionAuthority':'demo-suite-3-0' if DEMO else None});ctx.close();browser.close()
