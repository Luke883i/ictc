import json, os, pathlib, re, traceback
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
ROLES=['admin','user','auditor']
VIEWPORTS=[('mobile',390,844),('tablet',768,1024),('desktop',1280,900),('wide',1600,1000)]
PROCEDURES=[
 {'code':'RN-01','id':'monitoring','root':'#monitoringView','frame':'#monitoringView > .procedure-frame','work':'#monitoringView > .section-block','context':'#monitoringView > .procedure-support-rail > [data-editorial-slot="advanced-context"]','anatomy':'#monitoringView > .procedure-support-rail > [data-editorial-slot="advanced-context"] > .procedure-anatomy'},
 {'code':'EC-01','id':'incidents','root':'#incidentsView','frame':'#incidentsView > .procedure-frame','work':'#incidentsView > .section-block','context':'#incidentsView > .procedure-support-rail > [data-editorial-slot="advanced-context"]','anatomy':'#incidentsView > .procedure-support-rail > [data-editorial-slot="advanced-context"] > .procedure-anatomy'},
 {'code':'AO-01','id':'objects','root':'#grcWorkspace','frame':'#grcWorkspace > .procedure-frame','work':'#grcWorkspace > .grc-body','context':'#grcWorkspace > .procedure-support-rail > [data-editorial-slot="advanced-context"]','anatomy':'#grcWorkspace > .procedure-support-rail > [data-editorial-slot="advanced-context"] > .procedure-anatomy'},
 {'code':'MC-01','id':'coverage','root':'#grcWorkspace','frame':'#grcWorkspace > .procedure-frame','work':'#grcWorkspace > .grc-body','context':'#grcWorkspace > .procedure-support-rail > [data-editorial-slot="advanced-context"]','anatomy':'#grcWorkspace > .procedure-support-rail > [data-editorial-slot="advanced-context"] > .procedure-anatomy'},
 {'code':'AP-01','id':'actions','root':'#grcWorkspace','frame':'#grcWorkspace > .procedure-frame','work':'#grcWorkspace > .grc-body','context':'#grcWorkspace > .procedure-support-rail > [data-editorial-slot="advanced-context"]','anatomy':'#grcWorkspace > .procedure-support-rail > [data-editorial-slot="advanced-context"] > .procedure-anatomy'},
 {'code':'RC-01','id':'risks','root':'#grcWorkspace','frame':'#grcWorkspace > .procedure-frame','work':'#grcWorkspace > .grc-body','context':'#grcWorkspace > .procedure-support-rail > [data-editorial-slot="advanced-context"]','anatomy':'#grcWorkspace > .procedure-support-rail > [data-editorial-slot="advanced-context"] > .procedure-anatomy'},
 {'code':'AR-01','id':'assurance','root':'#grcWorkspace','frame':'#grcWorkspace > .procedure-frame','work':'#grcWorkspace > .grc-body','context':'#grcWorkspace > .procedure-support-rail > [data-editorial-slot="advanced-context"]','anatomy':'#grcWorkspace > .procedure-support-rail > [data-editorial-slot="advanced-context"] > .procedure-anatomy'}]
OWNER={'monitoring':'procedure-sequential-rn-ec.js','incidents':'procedure-sequential-rn-ec.js','objects':'grc-workspace-3-2.js','coverage':'grc-workspace-3-2.js','actions':'grc-workspace-3-2.js','risks':'grc-workspace-3-2.js','assurance':'grc-workspace-3-2.js'}
SCREENSHOT_WIDTHS={390,1280}
PROOF_READING_ORDER='facts>method>decisions>trace>evidence-basis>epistemic>external>integrity>export'
PHASE='init'; scenes=[]; anomalies=[]; screenshots=[]; network_coverage_checked=set()

def anomaly(kind,role,vp,surface,measured,expected): anomalies.append({'kind':kind,'role':role,'viewport':vp,'surface':surface,'measured':measured,'expected':expected,'signature':f'{surface}|{role}|{vp}|{kind}'})
def api_json(page,path,role): return page.evaluate("""async x=>{const r=await fetch(x.path,{headers:{'x-ictc-role':x.role,'x-ictc-actor-id':'visual-audit'}});if(!r.ok)throw new Error(x.path+' '+r.status);return r.json()}""",{'path':path,'role':role})
def no_overflow(page,role,vp,surface):
 m=page.evaluate('()=>({innerWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth})')
 if max(m['html'],m['body'])>m['innerWidth']+1:anomaly('document-overflow',role,vp,surface,m,'document <= viewport+1')
 return m
def one_h1(page,role,vp,surface):
 values=page.locator('h1:visible').all_inner_texts()
 if len(values)!=1:anomaly('visible-h1-count',role,vp,surface,values,'exactly one visible h1')
 return values
def shot(page,role,vp,surface,width):
 if width not in SCREENSHOT_WIDTHS:return
 safe=re.sub(r'[^a-z0-9_-]+','-',surface.lower()).strip('-');name=f'ux-och-v1-{role}-{vp}-{safe}.png';page.screenshot(path=str(ART/name),full_page=True);screenshots.append(name)
def visible_columns(page): return page.locator('#procedureHub .procedure-card').evaluate_all("""ns=>{const rs=ns.filter(n=>n.getClientRects().length).map(n=>n.getBoundingClientRect()),xs=[];for(const x of rs.map(r=>r.x).sort((a,b)=>a-b))if(!xs.some(v=>Math.abs(v-x)<3))xs.push(x);return {count:rs.length,columns:xs.length,primaryHeights:ns.filter(n=>n.getClientRects().length).map(n=>n.querySelector('.procedure-primary')?.getBoundingClientRect().height||0)}}""")
def wait_canonical_evidence_entry(page):
 page.wait_for_function("""expected=>{const root=document.querySelector('#proofView'),content=document.querySelector('#proofContent'),entry=content?.querySelector(':scope > details[data-proof-workspace="epistemic-investigation"]');return !!(root&&root.offsetParent!==null&&root.dataset.localCompositionOwner==='proof-workspace-3-2.js'&&root.dataset.proofReadingOrder===expected&&entry&&!root.querySelector('#epistemicMetaCard')&&entry.querySelector('[data-service="epistemic"]'));}""",arg=PROOF_READING_ORDER)
def open_process(page,code,proc):
 page.locator('.service-nav [data-service="processes"]').click();card=page.locator(f'#procedureHub [data-process-code="{code}"]');expect(card).to_be_visible();card.locator(':scope > footer .primary').click();page.wait_for_function("x=>{const r=document.querySelector(x.root);return !!(r&&r.offsetParent!==null&&r.dataset.editorialOwner===x.owner&&r.dataset.editorialOrderValid==='true')}",arg={'root':proc['root'],'owner':OWNER[proc['id']]});frame=page.locator(proc['frame']);expect(frame).to_be_visible();return frame

def audit_process(page,role,vp,width,proc,contract,families,revision):
 global PHASE;PHASE=f'{role}-{vp}-{proc["code"]}';frame=open_process(page,proc['code'],proc);raw=frame.text_content() or '';rendered=frame.inner_text()
 if 'Processo di Compliance' in raw:anomaly('process-singular-language-duplicated',role,vp,proc['code'],raw[:240],'code + business label without repeated process meta-label')
 if 'Scopo del processo' in raw:anomaly('process-purpose-meta-label-duplicated',role,vp,proc['code'],raw[:240],'purpose text without repeated purpose meta-label')
 if re.search(r'\bProcedur[ae]\b',raw,re.I):anomaly('retired-process-language-visible',role,vp,proc['code'],raw[:240],'no Procedura/Procedure')
 if contract and ((frame.locator('h1').text_content() or '').strip()!=contract.get('label') or (frame.locator('.procedure-frame-kicker span').first.text_content() or '').strip()!=contract.get('code')):anomaly('process-contract-identity-mismatch',role,vp,proc['code'],raw[:180],{'code':contract.get('code'),'label':contract.get('label')})
 purpose=(frame.locator('.procedure-purpose').text_content() or '').strip()
 if not purpose:anomaly('process-purpose-missing',role,vp,proc['code'],purpose,'non-empty canonical process purpose')
 if frame.locator('.procedure-purpose').count() and frame.locator('.procedure-purpose').evaluate('e=>parseFloat(getComputedStyle(e).fontSize)')<12:anomaly('process-purpose-too-small',role,vp,proc['code'],frame.locator('.procedure-purpose').evaluate('e=>parseFloat(getComputedStyle(e).fontSize)'),'>=12px')
 if frame.locator('.procedure-primary').count() and frame.locator('.procedure-primary').evaluate('e=>e.getBoundingClientRect().height')<43.5:anomaly('process-primary-target-too-small',role,vp,proc['code'],frame.locator('.procedure-primary').evaluate('e=>e.getBoundingClientRect().height'),'>=44px')
 if re.search(r'\bIn ordine\b|processi in ordine',rendered,re.I):anomaly('attention-rendered-as-favorable-verdict',role,vp,proc['code'],rendered[:240],'observational attention language')
 root=page.locator(proc['root']);order=(root.get_attribute('data-editorial-order') or '').split('>')
 if order[:5]!=['reference','metrics','attention','controls','primary','advanced-context']:anomaly('editorial-order-prefix',role,vp,proc['code'],order,['reference','metrics','attention','controls','primary','advanced-context'])
 rail=root.locator(':scope > .procedure-support-rail'); embedded=frame.locator(':scope > .procedure-support-rail')
 reference=root.locator(':scope > [data-editorial-slot="reference"]').first;metrics=root.locator(':scope > [data-editorial-slot="metrics"]').first;attention=root.locator(':scope > [data-editorial-slot="attention"]').first;controls=root.locator(':scope > [data-editorial-slot="controls"]');primary=root.locator(':scope > [data-editorial-slot="primary"]').first
 if rail.count()!=1 or embedded.count()!=0:anomaly('support-rail-parentage',role,vp,proc['code'],{'sibling':rail.count(),'insideHeader':embedded.count()},{'sibling':1,'insideHeader':0})
 elif not (reference.count() and metrics.count() and attention.count() and controls.count() and primary.count()):anomaly('editorial-owned-block-missing',role,vp,proc['code'],{'reference':reference.count(),'metrics':metrics.count(),'attention':attention.count(),'controls':controls.count(),'primary':primary.count()},{'reference':1,'metrics':1,'attention':1,'controls':'>=1','primary':1})
 else:
  control_handles=[controls.nth(i).element_handle() for i in range(controls.count())]
  physical_ok=frame.evaluate('(f,r)=>f.nextElementSibling===r',reference.element_handle()) and reference.evaluate('(r,m)=>r.nextElementSibling===m',metrics.element_handle()) and metrics.evaluate('(m,a)=>m.nextElementSibling===a',attention.element_handle()) and attention.evaluate('(a,c)=>a.nextElementSibling===c',control_handles[0])
  for i in range(len(control_handles)-1):physical_ok=physical_ok and controls.nth(i).evaluate('(c,n)=>c.nextElementSibling===n',control_handles[i+1])
  physical_ok=physical_ok and controls.nth(controls.count()-1).evaluate('(c,p)=>c.nextElementSibling===p',primary.element_handle()) and primary.evaluate('(p,r)=>p.nextElementSibling===r',rail.element_handle())
  if not physical_ok:anomaly('editorial-owned-block-order',role,vp,proc['code'],False,'frame>reference>metrics>attention>controls[1..n]>primary>advanced-context-support')
 context=page.locator(proc['context']);anatomy=page.locator(proc['anatomy']);work=page.locator(proc['work']).first
 try:context.wait_for(state='visible',timeout=5000);anatomy.wait_for(state='visible',timeout=5000);work.wait_for(state='visible',timeout=5000)
 except Exception:anomaly('technical-trace-not-visible',role,vp,proc['code'],{'context':context.count(),'anatomy':anatomy.count(),'work':page.locator(proc['work']).count()},'owner-declared context slot with visible anatomy after native work');return
 if context.get_attribute('data-editorial-slot-owner')!=OWNER[proc['id']]:anomaly('technical-context-owner',role,vp,proc['code'],context.get_attribute('data-editorial-slot-owner'),OWNER[proc['id']])
 work_before_context=page.evaluate("x=>{const w=document.querySelector(x.w),c=document.querySelector(x.c);return !!(w&&c&&(w.compareDocumentPosition(c)&Node.DOCUMENT_POSITION_FOLLOWING))}",{'w':proc['work'],'c':proc['context']})
 if not work_before_context:anomaly('context-not-after-native-work',role,vp,proc['code'],False,True)
 was_open=anatomy.get_attribute('open') is not None
 if not was_open:anatomy.locator(':scope > summary').click();expect(anatomy).to_have_attribute('open','')
 body=anatomy.locator('.procedure-anatomy-grid')
 try:body.wait_for(state='visible',timeout=5000)
 except Exception:anomaly('technical-trace-body-not-visible',role,vp,proc['code'],anatomy.text_content(),'visible anatomy body after disclosure');return
 actual=[x.strip() for x in anatomy.locator('.procedure-anatomy-epistemic span').all_text_contents()]
 if actual!=families:anomaly('epistemic-family-convergence',role,vp,proc['code'],actual,families)
 boundary=(contract or {}).get('claimBoundary','')
 if boundary and boundary not in (anatomy.text_content() or ''):anomaly('claim-boundary-not-present-in-process-trace',role,vp,proc['code'],False,'canonical claim boundary visible after disclosure')
 if not was_open:anatomy.locator(':scope > summary').click();expect(anatomy).not_to_have_attribute('open','')
 if proc['code']=='RN-01':
  cards=page.locator('#catalogList .catalog-card')
  if cards.count():
   if 'Motivazione non disponibile' in page.locator('#catalogList').inner_text():anomaly('rn-missing-reason-placeholder',role,vp,proc['code'],True,False)
   missing_state=cards.evaluate_all("ns=>ns.filter(n=>!n.dataset.sourceState).length")
   if missing_state:anomaly('rn-source-state-rail',role,vp,proc['code'],missing_state,0)
 if proc['code']=='EC-01':
  if page.locator('#incidentList .incident-card h3').count() and any(x.strip().endswith('…') for x in page.locator('#incidentList .incident-card h3').all_inner_texts()):anomaly('ec-title-ellipsis',role,vp,proc['code'],page.locator('#incidentList .incident-card h3').all_inner_texts(),'no renderer ellipsis')
 if proc['code']=='MC-01' and role=='admin':
  opened=page.locator('.market-scope-editor[open]:visible').count()
  if opened:anomaly('coverage-scope-editors-expanded-by-default',role,vp,proc['code'],opened,0)
 stamped=page.locator(proc['root']).get_attribute('data-projection-revision')
 if stamped and int(stamped)<revision:anomaly('process-projection-behind-bootstrap',role,vp,proc['code'],stamped,f'>={revision}')
 if role=='auditor' and width in SCREENSHOT_WIDTHS:
  primary=frame.locator('.procedure-primary');label=(primary.text_content() or '').strip()
  if label!='Consulta registrazioni':anomaly('auditor-primary-language',role,vp,proc['code'],label,'Consulta registrazioni')
  before=page.locator('main > .view:not([hidden])').get_attribute('id');primary.click();page.wait_for_timeout(100);after=page.locator('main > .view:not([hidden])').get_attribute('id')
  if before!=after:anomaly('auditor-primary-leaves-process',role,vp,proc['code'],{'before':before,'after':after},'remain process-bound')
 no_overflow(page,role,vp,proc['code']);one_h1(page,role,vp,proc['code']);shot(page,role,vp,proc['code'],width);scenes.append({'role':role,'viewport':vp,'surface':proc['code'],'editorialOrder':order})

def audit_proof(page,role,vp,width):
 global PHASE;PHASE=f'{role}-{vp}-proof';page.locator('.service-nav [data-service="proof"]').click();expect(page.locator('#proofView')).to_be_visible();expect(page.locator('#proofContent')).to_be_visible();wait_canonical_evidence_entry(page);data=api_json(page,'/api/standard-proof',role);title=(page.locator('#proofTitle').text_content() or '').strip()
 if title!='Evidenze ICTC':anomaly('evidence-title-language',role,vp,'proof',title,'Evidenze ICTC')
 root=page.locator('#proofView');facts=page.locator('#proofContent > .proof-fact-strip');investigation=page.locator('#proofContent > details[data-proof-workspace="epistemic-investigation"]');trace=page.locator('#proofContent > details[data-proof-workspace="trace-reconstruction"]');decisions=page.locator('#proofContent > details[data-proof-domain="decisions"]')
 if root.get_attribute('data-proof-reading-order')!=PROOF_READING_ORDER:anomaly('evidence-reading-order-marker',role,vp,'proof',root.get_attribute('data-proof-reading-order'),PROOF_READING_ORDER)
 if facts.count()!=1 or not facts.is_visible():anomaly('evidence-fact-strip',role,vp,'proof',facts.count(),1)
 elif facts.get_attribute('data-proof-facts')!='non-evaluative':anomaly('evidence-fact-grammar',role,vp,'proof',facts.get_attribute('data-proof-facts'),'non-evaluative')
 for name,disclosure in [('epistemic-investigation',investigation),('trace-reconstruction',trace)]:
  if disclosure.count()!=1:anomaly('evidence-workspace-owner-count',role,vp,'proof',{'workspace':name,'count':disclosure.count()},{'workspace':name,'count':1})
  elif disclosure.get_attribute('open') is not None:anomaly('evidence-technical-open-by-default',role,vp,'proof',name,'collapsed')
 if decisions.count()!=1:anomaly('evidence-workspace-owner-count',role,vp,'proof',{'workspace':'decisions','count':decisions.count()},{'workspace':'decisions','count':1})
 elif decisions.get_attribute('open') is not None:anomaly('evidence-secondary-open-by-default',role,vp,'proof','decisions','collapsed')
 expected_order=['facts','interpretation','decisions','trace-reconstruction','evidence-basis','epistemic-investigation','external','integrity','export']
 order=page.evaluate("""()=>[...document.querySelector('#proofContent').children].map(n=>n.classList.contains('proof-fact-strip')?'facts':(n.dataset.proofDomain||n.dataset.proofWorkspace||n.dataset.compositionDetail||null)).filter(Boolean)""")
 projected=[x for x in order if x in expected_order]
 if projected!=expected_order:anomaly('evidence-workspace-order',role,vp,'proof',projected,expected_order)
 reading=page.locator('#proofContent > details[data-composition-detail="proof-reading"]')
 if reading.count()!=1:anomaly('evidence-progressive-reading-missing',role,vp,'proof',reading.count(),1)
 else:
  if reading.get_attribute('open') is not None:anomaly('evidence-technical-reading-open-by-default',role,vp,'proof',True,False)
  reading.locator(':scope > summary').click();expect(reading).to_have_attribute('open','')
  methods=page.locator('#proofEvidenceKinds li').count();expected_methods=len(data.get('proof',{}).get('evidenceKinds',[]))
  if methods!=expected_methods:anomaly('evidence-proof-method-count',role,vp,'proof',methods,expected_methods)
  mappings=page.locator('#proofBenchmarkMappings .proof-mapping');expected_maps=len(data.get('benchmarkFamilies',[]))
  if mappings.count()!=expected_maps:anomaly('evidence-benchmark-count',role,vp,'proof',mappings.count(),expected_maps)
  reading.locator(':scope > summary').click()
 text=page.locator('#proofView').inner_text()
 if re.search(r'\b\d+(?:[.,]\d+)?\s*%',text):anomaly('evidence-percentage-verdict',role,vp,'proof',re.findall(r'\b\d+(?:[.,]\d+)?\s*%',text),'no compliance/certainty percentage')
 no_overflow(page,role,vp,'proof');one_h1(page,role,vp,'proof');shot(page,role,vp,'proof',width)

def epistemic_network_coverage(page,role,known_ids):
 seen=set();offset=0;limit=200;pages=0;exhausted=False
 for pages in range(1,41):
  data=api_json(page,f'/api/epistemic-lattice?offset={offset}&limit={limit}',role);atoms=data.get('atoms',[]);seen.update(str(a.get('procedureId') or 'cross-cutting') for a in atoms if a.get('procedureId'));projection=data.get('projection',{})
  if int(projection.get('fromRevision') or 0)<=1 or int(projection.get('toRevision') or 0)<=0:exhausted=True;break
  offset+=limit
 known=set(known_ids);return {'seen':sorted(seen),'unknown':sorted(seen-known),'pages':pages,'offset':offset,'exhausted':exhausted}

def audit_ep(page,role,vp,width,expected_ids,revision):
 global PHASE;PHASE=f'{role}-{vp}-EP-01';page.locator('.service-nav [data-service="processes"]').click()
 if role in ('admin','auditor'):
  page.locator('.service-nav [data-service="proof"]').click();expect(page.locator('#proofView')).to_be_visible();wait_canonical_evidence_entry(page);investigation=page.locator('#proofContent > details[data-proof-workspace="epistemic-investigation"]');expect(investigation).to_have_count(1)
  if investigation.get_attribute('open') is None:investigation.locator(':scope > summary').click()
  action=investigation.locator('[data-service="epistemic"]');expect(action).to_be_visible();action.click();expect(page.locator('#epistemicView')).to_be_visible();page.wait_for_function('(r)=>Number(document.querySelector("#epistemicView")?.dataset.loadedRevision||0)>=r',arg=revision)
  current=api_json(page,'/api/epistemic-lattice?offset=0&limit=80',role);expected_current=sorted({str(a.get('procedureId') or 'cross-cutting') for a in current.get('atoms',[])});actual_current=sorted(page.locator('[data-explore-procedure]').evaluate_all('ns=>[...new Set(ns.map(n=>n.dataset.exploreProcedure).filter(Boolean))].sort()'))
  if actual_current!=expected_current:anomaly('epistemic-current-page-projection-mismatch',role,vp,'EP-01',actual_current,expected_current)
  if role not in network_coverage_checked:
   coverage=epistemic_network_coverage(page,role,expected_ids)
   if coverage['unknown']:anomaly('epistemic-network-unknown-procedure',role,vp,'EP-01',coverage,sorted(expected_ids))
   if not coverage['exhausted']:anomaly('epistemic-network-pagination-not-exhausted',role,vp,'EP-01',coverage,'walk reaches revision 1 within 40 pages')
   network_coverage_checked.add(role)
  no_overflow(page,role,vp,'EP-01');one_h1(page,role,vp,'EP-01');shot(page,role,vp,'EP-01',width)
 elif page.locator('#proofView #epistemicMetaCard').count():anomaly('epistemic-meta-visible-to-user',role,vp,'processes',True,False)

try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'):launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch)
  for role in ROLES:
   for vp,width,height in VIEWPORTS:
    PHASE=f'{role}-{vp}-bootstrap';ctx=browser.new_context(viewport={'width':width,'height':height});ctx.add_init_script(f"localStorage.setItem('ictc-role','{role}');localStorage.setItem('ictc-service','home')");page=ctx.new_page();page.set_default_timeout(30000);page.goto(BASE+'/?view=home',wait_until='networkidle');data=api_json(page,'/api/bootstrap',role);registry={x['id']:x for x in data.get('procedureRegistry',{}).get('procedures',[])};families=data.get('procedureRegistry',{}).get('commonSubstrate',{}).get('epistemicFamilies',[]);revision=int(data.get('revision',0));assert len(registry)==7 and families;llm=data.get('settings',{}).get('llm',{});expected_ai='ready' if llm.get('ready') else ('key-missing' if llm.get('configured') else 'unconfigured');actual_ai=page.locator('#runtimeStatus').get_attribute('data-ai-state');
    if actual_ai!=expected_ai:anomaly('ai-status-truth',role,vp,'shell',actual_ai,expected_ai)
    expected_tone={'ready':'positive','key-missing':'attention','unconfigured':'neutral'}[expected_ai];actual_tone=page.locator('#runtimeStatus').get_attribute('data-tone');tooltip=page.locator('#runtimeStatus').get_attribute('data-tooltip') or ''
    if actual_tone!=expected_tone:anomaly('ai-status-false-green',role,vp,'shell',{'state':actual_ai,'tone':actual_tone},{'state':expected_ai,'tone':expected_tone})
    if expected_ai=='unconfigured' and ('AI non configurata' not in tooltip or 'Amministrazione > AI' not in tooltip):anomaly('ai-status-copy-incoherent',role,vp,'shell',tooltip,'AI non configurata + Admin route')
    page.wait_for_function("()=>document.documentElement.dataset.nativeSemanticLattice==='3.2.0'&&document.documentElement.dataset.ictcSurface==='home'&&document.querySelector('#homePriorities')?.dataset.homeWorkQueue==='3.2'")
    labels=page.locator('.service-nav [data-service]').all_text_contents();expected=['Home','Processi di Compliance','Evidenze ICTC']
    if [x.strip() for x in labels]!=expected:anomaly('top-navigation-language',role,vp,'shell',labels,expected)
    no_overflow(page,role,vp,'home');one_h1(page,role,vp,'home');
    if width>=761 and height>=720:
     m=page.evaluate("""()=>{const home=document.querySelector('#homeView')?.getBoundingClientRect(),footerEl=document.querySelector('#stableLegalFooter,.stable-legal-footer'),footer=footerEl?.getBoundingClientRect();return{inner:innerHeight,html:document.documentElement.scrollHeight,body:document.body.scrollHeight,overflow:getComputedStyle(document.body).overflow,homeTop:home?.top,homeBottom:home?.bottom,footerTop:footer?.top,footerPosition:footerEl?getComputedStyle(footerEl).position:null}}""")
     if m['overflow']=='hidden':anomaly('home-scroll-clipped',role,vp,'home',m,'body overflow must remain scroll-capable')
     if m.get('footerPosition')!='static':anomaly('home-footer-position',role,vp,'home',m,'footer in normal flow')
     if m.get('footerTop') is not None and m.get('homeBottom') is not None and m['footerTop']<m['homeBottom']-1:anomaly('home-footer-flow',role,vp,'home',m,'footer follows home without overlap')
    shot(page,role,vp,'home',width);page.locator('.service-nav [data-service="processes"]').click();cards=page.locator('#procedureHub .procedure-card');expect(cards).to_have_count(7);expect(page.locator('#procedureHub .procedure-card:visible')).to_have_count(7);h=visible_columns(page);expected_cols=1
    if h['count']!=7:anomaly('process-hub-count',role,vp,'processes',h['count'],7)
    if h['columns']!=expected_cols:anomaly('process-hub-columns',role,vp,'processes',h['columns'],expected_cols)
    if any(x<43.5 for x in h['primaryHeights']):anomaly('process-card-target-too-small',role,vp,'processes',h['primaryHeights'],'all >=44px')
    no_overflow(page,role,vp,'processes');one_h1(page,role,vp,'processes');shot(page,role,vp,'processes',width)
    for proc in PROCEDURES:audit_process(page,role,vp,width,proc,registry.get(proc['id']),families,revision)
    audit_proof(page,role,vp,width);audit_ep(page,role,vp,width,list(registry.keys())+['epistemic-lattice'],revision);ctx.close()
  PHASE='aggregate-verdict';unique={x['signature']:x for x in anomalies};report={'ok':not anomalies,'profile':'onto-compliance-horizon-v1+native-semantic-lattice-3.2+s4-a3-specialized-local-closure-runtime-audit+p2-secondary-closed','sceneCount':len(scenes),'screenshotCount':len(screenshots),'anomalyCount':len(anomalies),'uniqueAnomalyCount':len(unique),'anomalies':anomalies,'scenes':scenes,'screenshots':screenshots,'networkCoverageRoles':sorted(network_coverage_checked),'dimensions':{'roles':ROLES,'viewports':[x[0] for x in VIEWPORTS],'processes':[x['code'] for x in PROCEDURES]},'processHubLayout':'row-list-1-column','proofHierarchy':PROOF_READING_ORDER,'editorialHierarchy':'reference>metrics>attention>controls>primary>advanced-context','boundary':'Server-backed automated visual, geometry, lexical, editorial and epistemic evidence; not independent human usability, aesthetic preference, legal compliance or assistive-technology assessment.'};(ART/'browser-onto-compliance-v1.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf8')
  if anomalies:
   for x in list(unique.values())[:40]:print(f"::error title=onto-visual::{x['kind']}::{x['surface']} {x['role']} {x['viewport']}: {x['measured']}",flush=True)
   first=list(unique.values())[0];raise AssertionError(f"onto-compliance visual audit found {len(anomalies)} observations / {len(unique)} unique signatures; first={first['kind']}:{first['surface']}:{first['role']}:{first['viewport']}")
  print(f'browser-onto-compliance-v1: complete scenes={len(scenes)} screenshots={len(screenshots)} anomalies=0 visual+editorial+lexical+epistemic=ok',flush=True);browser.close()
except BaseException as error:
 payload={'ok':False,'phase':PHASE,'type':type(error).__name__,'message':str(error),'traceback':traceback.format_exc(),'anomalies':anomalies,'scenes':scenes,'screenshots':screenshots};(ART/'browser-onto-compliance-v1-error.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8')
 summary=os.environ.get('GITHUB_STEP_SUMMARY')
 if summary:
  unique={x['signature']:x for x in anomalies}
  with open(summary,'a',encoding='utf8') as fh:
   fh.write(f"### browser-onto-compliance-v1 failure\n- phase: `{PHASE}`\n- type: `{type(error).__name__}`\n- message: `{str(error)[:1200]}`\n")
   for item in list(unique.values())[:12]: fh.write(f"- anomaly: `{item['kind']}` / `{item['surface']}` / `{item['role']}` / `{item['viewport']}` → `{str(item['measured'])[:500]}`\n")
 print(f'::error title=browser-onto-compliance-v1::{PHASE}: {type(error).__name__}: {error}',flush=True);traceback.print_exc();raise
