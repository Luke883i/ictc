import json, os, pathlib, re, traceback
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts';ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
PHASE='init'
PROCEDURES=[
 {'code':'RN-01','id':'monitoring','view':'#monitoringView','frame':'#monitoringView > .procedure-frame','work':'#monitoringView > .section-block','anatomy':'#monitoringView > .procedure-anatomy'},
 {'code':'EC-01','id':'incidents','view':'#incidentsView','frame':'#incidentsView > .procedure-frame','work':'#incidentsView > .section-block','anatomy':'#incidentsView > .procedure-anatomy'},
 {'code':'AO-01','id':'objects','view':'#grcView','frame':'#grcWorkspace > .procedure-frame','work':'#grcWorkspace > .grc-body','anatomy':'#grcWorkspace > .procedure-anatomy'},
 {'code':'MC-01','id':'coverage','view':'#grcView','frame':'#grcWorkspace > .procedure-frame','work':'#grcWorkspace > .grc-body','anatomy':'#grcWorkspace > .procedure-anatomy'},
 {'code':'AP-01','id':'actions','view':'#grcView','frame':'#grcWorkspace > .procedure-frame','work':'#grcWorkspace > .grc-body','anatomy':'#grcWorkspace > .procedure-anatomy'},
 {'code':'RC-01','id':'risks','view':'#grcView','frame':'#grcWorkspace > .procedure-frame','work':'#grcWorkspace > .grc-body','anatomy':'#grcWorkspace > .procedure-anatomy'},
 {'code':'AR-01','id':'assurance','view':'#grcView','frame':'#grcWorkspace > .procedure-frame','work':'#grcWorkspace > .grc-body','anatomy':'#grcWorkspace > .procedure-anatomy'}]
VIEWPORTS=[{'name':'mobile','width':390,'height':844},{'name':'tablet','width':768,'height':1024},{'name':'desktop','width':1280,'height':900},{'name':'wide','width':1600,'height':1000}]
ROLES=['admin','user','auditor'];SCREENSHOT_WIDTHS={390,1280}
scenes=[];anomalies=[];screenshots=[]

def fail(error):
 payload={'ok':False,'phase':PHASE,'type':type(error).__name__,'message':str(error),'traceback':traceback.format_exc(),'scenes':scenes,'anomalies':anomalies,'screenshots':screenshots}
 (ART/'browser-onto-compliance-v1-error.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8')
 print(f'::error title=browser-onto-compliance-v1::{PHASE}: {type(error).__name__}: {error}',flush=True)

def add_anomaly(kind,role,viewport,surface,measured,expected):
 signature=f'{surface}|{role}|{viewport}|{kind}|{str(measured)[:80]}'
 anomalies.append({'kind':kind,'role':role,'viewport':viewport,'surface':surface,'measured':measured,'expected':expected,'signature':signature})

def active_view_id(page):return page.evaluate("()=>document.querySelector('main > .view:not([hidden])')?.id||''")
def fetch_json(page,path,role):return page.evaluate("""async args=>{const r=await fetch(args.path,{headers:{'content-type':'application/json','x-ictc-role':args.role,'x-ictc-actor-id':'onto-visual-audit'}});if(!r.ok)throw new Error(args.path+' '+r.status);return await r.json()}""",{'path':path,'role':role})
def bootstrap(page,role):return fetch_json(page,'/api/bootstrap',role)

def open_process(page,code):
 page.locator('.service-nav [data-service="processes"]').click();card=page.locator(f'#procedureHub [data-process-code="{code}"]');expect(card).to_be_visible();card.locator(':scope > footer .primary').click();page.wait_for_timeout(90);expect(page.locator('.procedure-frame:visible')).to_be_visible()

def screenshot(page,role,vp,surface):
 if vp['width'] not in SCREENSHOT_WIDTHS:return
 safe=re.sub(r'[^A-Za-z0-9_-]+','-',surface).strip('-').lower();name=f'ux-och-v1-{role}-{vp["name"]}-{safe}.png';page.screenshot(path=str(ART/name),full_page=True);screenshots.append(name)

def scene_metrics(page,args):
 return page.evaluate("""args=>{
 const visible=e=>!!e&&e.getClientRects().length>0&&getComputedStyle(e).visibility!=='hidden'&&getComputedStyle(e).display!=='none';
 const rect=e=>{if(!visible(e))return null;const r=e.getBoundingClientRect();return{x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1),bottom:+r.bottom.toFixed(1)}};
 const uniq=xs=>[...new Set(xs)],vis=q=>[...document.querySelectorAll(q)].filter(visible);
 const frame=args.frame?document.querySelector(args.frame):null,work=args.work?document.querySelector(args.work):null,anatomy=args.anatomy?document.querySelector(args.anatomy):null;
 const primary=uniq([...vis('.procedure-frame .procedure-primary'),...vis('.hero .primary'),...vis('.hero .primary-entry')]).filter(e=>e.getBoundingClientRect().top<innerHeight+1);
 const bodyText=(document.querySelector(args.scope||'main > .view:not([hidden])')?.innerText||'');
 const identity=vis('.procedure-frame-kicker,.hero .eyebrow').filter(e=>args.code&&e.textContent.includes(args.code));
 const purpose=frame?.querySelector('.procedure-purpose span'),kicker=frame?.querySelector('.procedure-frame-kicker'),primaryButton=frame?.querySelector('.procedure-primary');
 return{activeView:document.querySelector('main > .view:not([hidden])')?.id||'',h1:vis('h1').map(e=>e.textContent.trim()).filter(Boolean),pageOverflow:{innerWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth},primaryAboveFold:primary.map(e=>({text:e.textContent.trim(),rect:rect(e),className:e.className})),actionsAboveFold:vis('button,summary,[role="button"]').filter(e=>e.getBoundingClientRect().top<innerHeight+1).length,frame:rect(frame),work:rect(work),anatomy:rect(anatomy),anatomyBeforeWork:!!(anatomy&&work&&(anatomy.compareDocumentPosition(work)&Node.DOCUMENT_POSITION_FOLLOWING)),duplicateCodeIdentity:identity.map(e=>e.textContent.trim()),framePrimaryText:visible(primaryButton)?primaryButton.textContent.trim():'',favorableAttentionLanguage:/\bIn ordine\b|processi in ordine/i.test(bodyText),favorableMatches:(bodyText.match(/In ordine|processi in ordine/gi)||[]).slice(0,12),frameRatio:frame?+(frame.getBoundingClientRect().height/innerHeight).toFixed(3):null,scopeTextLength:bodyText.length,openScopeEditors:vis('.market-scope-editor[open]').length,visibleScopeEditors:vis('.market-scope-editor').length,visibleScopeTextareas:vis('.market-scope-editor textarea').length,purposeFont:purpose?parseFloat(getComputedStyle(purpose).fontSize):null,kickerFont:kicker?parseFloat(getComputedStyle(kicker).fontSize):null,primaryHeight:primaryButton?+primaryButton.getBoundingClientRect().height.toFixed(1):null,frameText:frame?.innerText||'',projectionRevision:document.querySelector(args.scope||'main > .view:not([hidden])')?.dataset?.projectionRevision||''};
 }""",args)

def audit_scene(page,role,vp,surface,scope,code='',frame='',work='',anatomy='',contract=None,families=None,revision=None):
 global PHASE;PHASE=f'{role}-{vp["name"]}-{surface}';m=scene_metrics(page,{'scope':scope,'code':code,'frame':frame,'work':work,'anatomy':anatomy});scenes.append({'role':role,'viewport':vp['name'],'width':vp['width'],'height':vp['height'],'surface':surface,'metrics':m})
 if max(m['pageOverflow']['html'],m['pageOverflow']['body'])>m['pageOverflow']['innerWidth']+1:add_anomaly('document-overflow',role,vp['name'],surface,m['pageOverflow'],'document width <= viewport + 1')
 if len(m['h1'])!=1:add_anomaly('visible-h1-count',role,vp['name'],surface,m['h1'],'exactly one visible h1')
 if m['favorableAttentionLanguage']:add_anomaly('attention-rendered-as-favorable-verdict',role,vp['name'],surface,m['favorableMatches'],'observational attention language only')
 if code:
  if m['anatomyBeforeWork']:add_anomaly('technical-trace-before-native-work',role,vp['name'],surface,{'anatomy':m['anatomy'],'work':m['work']},'native work precedes technical trace')
  if len(m['primaryAboveFold'])>1:add_anomaly('competing-primary-actions-above-fold',role,vp['name'],surface,[x['text'] for x in m['primaryAboveFold']],'one dominant primary entry action')
  if len(m['duplicateCodeIdentity'])>1:add_anomaly('duplicate-process-identity',role,vp['name'],surface,m['duplicateCodeIdentity'],'process code asserted once in identity layer')
  if re.search(r'\bProcedur[ae]\b',m['frameText'],re.I):add_anomaly('retired-process-language-visible',role,vp['name'],surface,m['frameText'][:180],'Processo di Compliance')
  if 'Processo di Compliance' not in m['frameText']:add_anomaly('process-singular-language-missing',role,vp['name'],surface,m['frameText'][:180],'Processo di Compliance')
  if m['purposeFont'] is not None and m['purposeFont']<12:add_anomaly('process-purpose-too-small',role,vp['name'],surface,m['purposeFont'],'>= 12px computed')
  if m['kickerFont'] is not None and m['kickerFont']<10:add_anomaly('process-kicker-too-small',role,vp['name'],surface,m['kickerFont'],'>= 10px computed')
  if m['primaryHeight'] is not None and m['primaryHeight']<43.5:add_anomaly('process-primary-target-too-small',role,vp['name'],surface,m['primaryHeight'],'>= 44 CSS px')
  if surface=='MC-01' and role=='admin' and m['openScopeEditors']>0:add_anomaly('coverage-scope-editors-expanded-by-default',role,vp['name'],surface,m['openScopeEditors'],0)
  if revision is not None and m['projectionRevision'] and int(m['projectionRevision'])<int(revision):add_anomaly('process-projection-behind-bootstrap',role,vp['name'],surface,m['projectionRevision'],f'>={revision}')
  if contract:
   title=page.locator(f'{frame} h1').inner_text().strip() if page.locator(f'{frame} h1').count() else '';code_text=page.locator(f'{frame} .procedure-frame-kicker span').first.inner_text().strip() if page.locator(f'{frame} .procedure-frame-kicker span').count() else ''
   if title!=contract.get('label') or code_text!=contract.get('code'):add_anomaly('process-contract-identity-mismatch',role,vp['name'],surface,{'title':title,'code':code_text},{'title':contract.get('label'),'code':contract.get('code')})
   anatomy_text=(page.locator(anatomy).text_content() or '') if page.locator(anatomy).count() else '';boundary=contract.get('claimBoundary') or ''
   if boundary and boundary not in anatomy_text:add_anomaly('claim-boundary-not-present-in-process-trace',role,vp['name'],surface,False,'canonical claim boundary present')
  if families is not None:
   actual=page.locator(f'{anatomy} .procedure-anatomy-epistemic span').all_inner_texts() if page.locator(anatomy).count() else []
   if actual!=families:add_anomaly('epistemic-family-convergence',role,vp['name'],surface,actual,families)
 screenshot(page,role,vp,surface);return m

def hub_metrics(page):return page.locator('#procedureHub .procedure-card').evaluate_all("""nodes=>{const r=nodes.filter(n=>n.getClientRects().length).map(n=>n.getBoundingClientRect()),w=r.map(x=>x.width),h=r.map(x=>x.height),xs=[];for(const x of r.map(v=>v.x).sort((a,b)=>a-b))if(!xs.some(v=>Math.abs(v-x)<3))xs.push(x);return{count:r.length,columns:xs.length,widthRange:r.length?Math.max(...w)-Math.min(...w):0,heightRange:r.length?Math.max(...h)-Math.min(...h):0,widths:w.map(x=>+x.toFixed(1)),heights:h.map(x=>+x.toFixed(1)),primaryHeights:nodes.filter(n=>n.getClientRects().length).map(n=>+(n.querySelector('.procedure-primary')?.getBoundingClientRect().height||0).toFixed(1))}}""")

def audit_hub(page,role,vp):
 h=hub_metrics(page);expected={390:1,768:2,1280:3,1600:3}[vp['width']]
 if h['count']!=7:add_anomaly('process-hub-count',role,vp['name'],'processes',h['count'],7)
 if h['columns']!=expected:add_anomaly('process-hub-columns',role,vp['name'],'processes',h['columns'],expected)
 if any(x<43.5 for x in h['primaryHeights']):add_anomaly('process-card-target-too-small',role,vp['name'],'processes',h['primaryHeights'],'all >= 44 CSS px')
 title=page.locator('#processesView h1').inner_text().strip()
 if title!='Processi di Compliance':add_anomaly('process-hub-title',role,vp['name'],'processes',title,'Processi di Compliance')
 return h

def audit_shell(page,role,vp):
 labels=page.locator('.service-nav [data-service]').all_inner_texts();expected=['Oggi','Processi di Compliance','Postura ICTC']
 if labels!=expected:add_anomaly('top-navigation-language',role,vp['name'],'shell',labels,expected)

def audit_auditor_primary(page,vp,proc):
 primary=page.locator(f'{proc["frame"]} .procedure-primary');text=primary.inner_text().strip()
 if text!='Consulta registrazioni':add_anomaly('auditor-primary-language','auditor',vp['name'],proc['code'],text,'Consulta registrazioni')
 before=active_view_id(page);primary.click();page.wait_for_timeout(120);after=active_view_id(page)
 if after!=before:add_anomaly('auditor-primary-leaves-process','auditor',vp['name'],proc['code'],{'before':before,'after':after},'remain on process read surface')

def audit_proof(page,role,vp):
 global PHASE;PHASE=f'{role}-{vp["name"]}-proof-method';data=fetch_json(page,'/api/standard-proof',role);expect(page.locator('#proofContent')).to_be_visible();title=page.locator('#proofTitle').inner_text().strip()
 if title!='Postura ICTC':add_anomaly('posture-title-language',role,vp['name'],'proof',title,'Postura ICTC')
 methods=page.locator('#proofEvidenceKinds li');expected_methods=len(data.get('proof',{}).get('evidenceKinds',[]))
 if methods.count()!=expected_methods:add_anomaly('posture-proof-method-count',role,vp['name'],'proof',methods.count(),expected_methods)
 benchmark=page.locator('#proofBenchmarkMappings .proof-mapping');expected_bench=len(data.get('benchmarkFamilies',[]))
 if benchmark.count()!=expected_bench:add_anomaly('posture-benchmark-count',role,vp['name'],'proof',benchmark.count(),expected_bench)
 missing_limits=[]
 for i in range(benchmark.count()):
  txt=benchmark.nth(i).text_content() or ''
  if 'Limite.' not in txt:missing_limits.append(i)
 if missing_limits:add_anomaly('posture-benchmark-limit-missing',role,vp['name'],'proof',missing_limits,'each declared benchmark carries an explicit limit')
 visible=page.locator('#proofView').inner_text()
 if re.search(r'\b\d+(?:[.,]\d+)?\s*%',visible):add_anomaly('posture-percentage-verdict',role,vp['name'],'proof',re.findall(r'\b\d+(?:[.,]\d+)?\s*%',visible)[:8],'no compliance/certainty percentage')
 if 'Come ICTC dimostra la propria postura' not in visible:add_anomaly('posture-method-not-visible',role,vp['name'],'proof',False,True)

def audit_epistemic(page,role,vp,codes):
 text=page.locator('#epistemicView').inner_text();missing=[code for code in codes if code not in text]
 if missing:add_anomaly('epistemic-seven-process-coverage',role,vp['name'],'EP-01',missing,'all seven Processi di Compliance visible in EP-01 overview')

try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch)
  for role in ROLES:
   for vp in VIEWPORTS:
    ctx=browser.new_context(viewport={'width':vp['width'],'height':vp['height']});ctx.add_init_script(f"localStorage.setItem('ictc-role','{role}');localStorage.setItem('ictc-service','home')");page=ctx.new_page();page.set_default_timeout(30000);PHASE=f'{role}-{vp["name"]}-bootstrap';page.goto(BASE+'/?view=home',wait_until='networkidle');data=bootstrap(page,role);registry={x['id']:x for x in data.get('procedureRegistry',{}).get('procedures',[])};assert len(registry)==7,registry.keys();families=data.get('procedureRegistry',{}).get('commonSubstrate',{}).get('epistemicFamilies',[]);assert families,families;revision=int(data.get('revision',0));audit_shell(page,role,vp)
    audit_scene(page,role,vp,'home','#homeView');page.locator('.service-nav [data-service="processes"]').click();expect(page.locator('#procedureHub .procedure-card')).to_have_count(7);pm=audit_scene(page,role,vp,'processes','#processesView');pm['hub']=audit_hub(page,role,vp)
    for proc in PROCEDURES:
     open_process(page,proc['code']);expect(page.locator(proc['view'])).to_be_visible();audit_scene(page,role,vp,proc['code'],proc['view'],proc['code'],proc['frame'],proc['work'],proc['anatomy'],registry.get(proc['id']),families,revision)
     if role=='auditor' and vp['width'] in (390,1280):audit_auditor_primary(page,vp,proc)
    page.locator('.service-nav [data-service="proof"]').click();expect(page.locator('#proofView')).to_be_visible();audit_scene(page,role,vp,'proof','#proofView');audit_proof(page,role,vp);page.locator('.service-nav [data-service="processes"]').click();meta=page.locator('#epistemicMetaCard')
    if role in ('admin','auditor'):
     expect(meta).to_be_visible();meta.locator('[data-service="epistemic"]').click();expect(page.locator('#epistemicView')).to_be_visible();audit_scene(page,role,vp,'EP-01','#epistemicView');audit_epistemic(page,role,vp,[x['code'] for x in registry.values()])
    elif meta.count() and meta.is_visible():add_anomaly('epistemic-meta-visible-to-user',role,vp['name'],'processes',True,False)
    ctx.close()
  unique={}
  for item in anomalies:unique.setdefault(item['signature'],item)
  report={'ok':not anomalies,'profile':'onto-compliance-horizon-v1+visual-grace-lexical-epistemic-runtime-audit','sceneCount':len(scenes),'screenshotCount':len(screenshots),'anomalyCount':len(anomalies),'uniqueAnomalyCount':len(unique),'anomalies':anomalies,'scenes':scenes,'screenshots':screenshots,'dimensions':{'roles':ROLES,'viewports':VIEWPORTS,'processes':[x['code'] for x in PROCEDURES]},'boundary':'Server-backed automated visual, geometry, lexical and epistemic evidence; not independent human usability, aesthetic preference, legal compliance or assistive-technology assessment.'}
  (ART/'browser-onto-compliance-v1.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf8')
  if anomalies:
   for item in list(unique.values())[:40]:print(f"::error title=onto-visual::{item['kind']}::{item['surface']} {item['role']} {item['viewport']}: {item['measured']}",flush=True)
   raise AssertionError(f'onto-compliance visual audit found {len(anomalies)} observations / {len(unique)} unique signatures')
  print(f'browser-onto-compliance-v1: complete scenes={len(scenes)} screenshots={len(screenshots)} anomalies=0 visual+lexical+epistemic=ok',flush=True);browser.close()
except BaseException as error:
 fail(error);traceback.print_exc();raise
