import json, os, pathlib, re, traceback
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
ROLES=['admin','user','auditor']
VIEWPORTS=[('mobile',390,844),('tablet',768,1024),('desktop',1280,900),('wide',1600,1000)]
PROCEDURES=[
 {'code':'RN-01','id':'monitoring','view':'#monitoringView','frame':'#monitoringView > .procedure-frame','work':'#monitoringView > .section-block','anatomy':'#monitoringView > .procedure-anatomy'},
 {'code':'EC-01','id':'incidents','view':'#incidentsView','frame':'#incidentsView > .procedure-frame','work':'#incidentsView > .section-block','anatomy':'#incidentsView > .procedure-anatomy'},
 {'code':'AO-01','id':'objects','view':'#grcView','frame':'#grcWorkspace > .procedure-frame','work':'#grcWorkspace > .grc-body','anatomy':'#grcWorkspace > .procedure-anatomy'},
 {'code':'MC-01','id':'coverage','view':'#grcView','frame':'#grcWorkspace > .procedure-frame','work':'#grcWorkspace > .grc-body','anatomy':'#grcWorkspace > .procedure-anatomy'},
 {'code':'AP-01','id':'actions','view':'#grcView','frame':'#grcWorkspace > .procedure-frame','work':'#grcWorkspace > .grc-body','anatomy':'#grcWorkspace > .procedure-anatomy'},
 {'code':'RC-01','id':'risks','view':'#grcView','frame':'#grcWorkspace > .procedure-frame','work':'#grcWorkspace > .grc-body','anatomy':'#grcWorkspace > .procedure-anatomy'},
 {'code':'AR-01','id':'assurance','view':'#grcView','frame':'#grcWorkspace > .procedure-frame','work':'#grcWorkspace > .grc-body','anatomy':'#grcWorkspace > .procedure-anatomy'}]
SCREENSHOT_WIDTHS={390,1280}
PHASE='init'; scenes=[]; anomalies=[]; screenshots=[]; network_coverage_checked=set()

def anomaly(kind,role,vp,surface,measured,expected):
    anomalies.append({'kind':kind,'role':role,'viewport':vp,'surface':surface,'measured':measured,'expected':expected,'signature':f'{surface}|{role}|{vp}|{kind}'})

def api_json(page,path,role):
    return page.evaluate("""async x=>{const r=await fetch(x.path,{headers:{'x-ictc-role':x.role,'x-ictc-actor-id':'visual-audit'}});if(!r.ok)throw new Error(x.path+' '+r.status);return r.json()}""",{'path':path,'role':role})

def no_overflow(page,role,vp,surface):
    m=page.evaluate('()=>({innerWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth})')
    if max(m['html'],m['body'])>m['innerWidth']+1: anomaly('document-overflow',role,vp,surface,m,'document <= viewport+1')
    return m

def one_h1(page,role,vp,surface):
    values=page.locator('h1:visible').all_inner_texts()
    if len(values)!=1: anomaly('visible-h1-count',role,vp,surface,values,'exactly one visible h1')
    return values

def shot(page,role,vp,surface,width):
    if width not in SCREENSHOT_WIDTHS: return
    safe=re.sub(r'[^a-z0-9_-]+','-',surface.lower()).strip('-')
    name=f'ux-och-v1-{role}-{vp}-{safe}.png'; page.screenshot(path=str(ART/name),full_page=True); screenshots.append(name)

def visible_columns(page):
    return page.locator('#procedureHub .procedure-card').evaluate_all("""ns=>{const rs=ns.filter(n=>n.getClientRects().length).map(n=>n.getBoundingClientRect()),xs=[];for(const x of rs.map(r=>r.x).sort((a,b)=>a-b))if(!xs.some(v=>Math.abs(v-x)<3))xs.push(x);return {count:rs.length,columns:xs.length,primaryHeights:ns.filter(n=>n.getClientRects().length).map(n=>n.querySelector('.procedure-primary')?.getBoundingClientRect().height||0)}}""")

def open_process(page,code,proc):
    page.locator('.service-nav [data-service="processes"]').click(); card=page.locator(f'#procedureHub [data-process-code="{code}"]'); expect(card).to_be_visible(); card.locator(':scope > footer .primary').click(); expect(page.locator(proc['view'])).to_be_visible(); frame=page.locator(proc['frame']); expect(frame).to_be_visible(); expect(frame.locator('.procedure-frame-main')).to_be_visible(); return frame

def process_geometry(page,proc):
    return page.locator(proc['frame']).evaluate("""(f,workSelector)=>{const info=e=>{if(!e)return null;const s=getComputedStyle(e),r=e.getBoundingClientRect();return {display:s.display,visibility:s.visibility,opacity:s.opacity,w:+r.width.toFixed(1),h:+r.height.toFixed(1),font:+parseFloat(s.fontSize).toFixed(2),text:e.textContent||''}};const m=f.querySelector('.procedure-frame-main'),p=f.querySelector('.procedure-purpose'),k=f.querySelector('.procedure-frame-kicker'),b=f.querySelector('.procedure-primary'),w=document.querySelector(workSelector);return {frame:info(f),main:info(m),purpose:info(p),kicker:info(k),primary:info(b),workY:w?w.getBoundingClientRect().y:null,frameY:f.getBoundingClientRect().y}}""", proc['work'])

def audit_process(page,role,vp,width,proc,contract,families,revision):
    global PHASE; PHASE=f'{role}-{vp}-{proc["code"]}'
    frame=open_process(page,proc['code'],proc); raw=(frame.text_content() or ''); rendered=frame.inner_text(); g=process_geometry(page,proc)
    if 'Processo di Compliance' in raw: anomaly('process-singular-language-duplicated',role,vp,proc['code'],raw[:240],'code + business label without repeated process meta-label')
    if 'Scopo del processo' in raw: anomaly('process-purpose-meta-label-duplicated',role,vp,proc['code'],raw[:240],'purpose text without repeated purpose meta-label')
    if re.search(r'\bProcedur[ae]\b',raw,re.I): anomaly('retired-process-language-visible',role,vp,proc['code'],raw[:240],'no Procedura/Procedure')
    if contract and ((frame.locator('h1').text_content() or '').strip()!=contract.get('label') or (frame.locator('.procedure-frame-kicker span').first.text_content() or '').strip()!=contract.get('code')): anomaly('process-contract-identity-mismatch',role,vp,proc['code'],raw[:180],{'code':contract.get('code'),'label':contract.get('label')})
    purpose=(frame.locator('.procedure-purpose').text_content() or '').strip()
    if not purpose: anomaly('process-purpose-missing',role,vp,proc['code'],purpose,'non-empty canonical process purpose')
    if g['purpose'] and g['purpose']['font']<12: anomaly('process-purpose-too-small',role,vp,proc['code'],g['purpose']['font'],'>=12px')
    if g['kicker'] and g['kicker']['font']<10: anomaly('process-kicker-too-small',role,vp,proc['code'],g['kicker']['font'],'>=10px')
    if g['primary'] and g['primary']['h']<43.5: anomaly('process-primary-target-too-small',role,vp,proc['code'],g['primary']['h'],'>=44px')
    if re.search(r'\bIn ordine\b|processi in ordine',rendered,re.I): anomaly('attention-rendered-as-favorable-verdict',role,vp,proc['code'],rendered[:240],'observational attention language')
    anatomy=page.locator(proc['anatomy']); work=page.locator(proc['work']).first
    try: anatomy.wait_for(state='visible',timeout=5000)
    except Exception:
        anomaly('technical-trace-not-visible',role,vp,proc['code'],{'count':anatomy.count(),'html':anatomy.first.evaluate('(e)=>e?.outerHTML?.slice(0,500)||null') if anatomy.count() else None},'one visible procedure anatomy'); return
    try: work.wait_for(state='visible',timeout=5000)
    except Exception:
        anomaly('native-work-not-visible',role,vp,proc['code'],{'count':page.locator(proc['work']).count(),'selector':proc['work']},'first native work anchor visible'); return
    order=page.evaluate("x=>{const a=document.querySelector(x.a),w=document.querySelector(x.w);return !!(a&&w&&(a.compareDocumentPosition(w)&Node.DOCUMENT_POSITION_FOLLOWING))}",{'a':proc['anatomy'],'w':proc['work']})
    if order: anomaly('technical-trace-before-native-work',role,vp,proc['code'],True,False)
    was_open=anatomy.get_attribute('open') is not None
    if not was_open: anatomy.locator(':scope > summary').click(); expect(anatomy).to_have_attribute('open','')
    body=anatomy.locator('.procedure-anatomy-grid')
    try: body.wait_for(state='visible',timeout=5000)
    except Exception:
        anomaly('technical-trace-body-not-visible',role,vp,proc['code'],{'open':anatomy.get_attribute('open'),'text':anatomy.text_content()},'visible anatomy body after disclosure'); return
    trace=anatomy.text_content() or ''
    actual=[x.strip() for x in anatomy.locator('.procedure-anatomy-epistemic span').all_text_contents()]
    if actual!=families: anomaly('epistemic-family-convergence',role,vp,proc['code'],actual,families)
    boundary=(contract or {}).get('claimBoundary','')
    if boundary and boundary not in trace: anomaly('claim-boundary-not-present-in-process-trace',role,vp,proc['code'],False,'canonical claim boundary visible after disclosure')
    if not was_open: anatomy.locator(':scope > summary').click(); expect(anatomy).not_to_have_attribute('open','')
    if proc['code']=='MC-01' and role=='admin':
        opened=page.locator('.market-scope-editor[open]:visible').count()
        if opened: anomaly('coverage-scope-editors-expanded-by-default',role,vp,proc['code'],opened,0)
    stamped=page.locator(proc['view']).get_attribute('data-projection-revision')
    if stamped and int(stamped)<revision: anomaly('process-projection-behind-bootstrap',role,vp,proc['code'],stamped,f'>={revision}')
    if role=='auditor' and width in SCREENSHOT_WIDTHS:
        primary=frame.locator('.procedure-primary'); label=(primary.text_content() or '').strip()
        if label!='Consulta registrazioni': anomaly('auditor-primary-language',role,vp,proc['code'],label,'Consulta registrazioni')
        before=page.locator('main > .view:not([hidden])').get_attribute('id'); primary.click(); page.wait_for_timeout(100); after=page.locator('main > .view:not([hidden])').get_attribute('id')
        if before!=after: anomaly('auditor-primary-leaves-process',role,vp,proc['code'],{'before':before,'after':after},'remain process-bound')
    no_overflow(page,role,vp,proc['code']); one_h1(page,role,vp,proc['code']); shot(page,role,vp,proc['code'],width)
    scenes.append({'role':role,'viewport':vp,'surface':proc['code'],'geometry':g})

def audit_proof(page,role,vp,width):
    page.locator('.service-nav [data-service="proof"]').click(); expect(page.locator('#proofView')).to_be_visible(); expect(page.locator('#proofContent')).to_be_visible(); data=api_json(page,'/api/standard-proof',role)
    title=(page.locator('#proofTitle').text_content() or '').strip()
    if title!='Postura ICTC': anomaly('posture-title-language',role,vp,'proof',title,'Postura ICTC')
    if not page.locator('#proofMethodTitle').is_visible(): anomaly('posture-method-not-visible',role,vp,'proof',False,True)
    methods=page.locator('#proofEvidenceKinds li').count(); expected_methods=len(data.get('proof',{}).get('evidenceKinds',[]))
    if methods!=expected_methods: anomaly('posture-proof-method-count',role,vp,'proof',methods,expected_methods)
    mappings=page.locator('#proofBenchmarkMappings .proof-mapping'); expected_maps=len(data.get('benchmarkFamilies',[]))
    if mappings.count()!=expected_maps: anomaly('posture-benchmark-count',role,vp,'proof',mappings.count(),expected_maps)
    missing=[]
    for i in range(mappings.count()):
        if 'Limite.' not in (mappings.nth(i).text_content() or ''): missing.append(i)
    if missing: anomaly('posture-benchmark-limit-missing',role,vp,'proof',missing,'each mapping carries explicit limit')
    text=page.locator('#proofView').inner_text()
    if re.search(r'\b\d+(?:[.,]\d+)?\s*%',text): anomaly('posture-percentage-verdict',role,vp,'proof',re.findall(r'\b\d+(?:[.,]\d+)?\s*%',text),'no compliance/certainty percentage')
    no_overflow(page,role,vp,'proof'); one_h1(page,role,vp,'proof'); shot(page,role,vp,'proof',width)

def epistemic_network_coverage(page,role,expected_ids):
    seen=set(); offset=0; limit=200; pages=0
    for pages in range(1,41):
        data=api_json(page,f'/api/epistemic-lattice?offset={offset}&limit={limit}',role)
        atoms=data.get('atoms',[])
        seen.update(str(a.get('procedureId')) for a in atoms if a.get('procedureId'))
        projection=data.get('projection',{})
        if int(projection.get('fromRevision') or 0)<=1 or int(projection.get('toRevision') or 0)<=0: break
        offset+=limit
    return {'seen':sorted(seen),'missing':sorted(set(expected_ids)-seen),'pages':pages,'offset':offset}

def audit_ep(page,role,vp,width,expected_ids,revision):
    page.locator('.service-nav [data-service="processes"]').click(); meta=page.locator('#epistemicMetaCard')
    if role in ('admin','auditor'):
        expect(meta).to_be_visible(); meta.locator('[data-service="epistemic"]').click(); expect(page.locator('#epistemicView')).to_be_visible()
        page.wait_for_function('(r)=>Number(document.querySelector("#epistemicView")?.dataset.loadedRevision||0)>=r',arg=revision)
        current=api_json(page,'/api/epistemic-lattice?offset=0&limit=80',role)
        expected_current=sorted({str(a.get('procedureId') or 'cross-cutting') for a in current.get('atoms',[])})
        actual_current=sorted(page.locator('[data-explore-procedure]').evaluate_all('ns=>[...new Set(ns.map(n=>n.dataset.exploreProcedure).filter(Boolean))].sort()'))
        if actual_current!=expected_current: anomaly('epistemic-current-page-projection-mismatch',role,vp,'EP-01',actual_current,expected_current)
        if role not in network_coverage_checked:
            coverage=epistemic_network_coverage(page,role,expected_ids)
            if coverage['missing']: anomaly('epistemic-seven-process-network-coverage',role,vp,'EP-01',coverage,sorted(expected_ids))
            network_coverage_checked.add(role)
        no_overflow(page,role,vp,'EP-01'); one_h1(page,role,vp,'EP-01'); shot(page,role,vp,'EP-01',width)
    elif meta.count() and meta.is_visible(): anomaly('epistemic-meta-visible-to-user',role,vp,'processes',True,False)

try:
    with sync_playwright() as pw:
        launch={'headless':True,'args':['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
        browser=pw.chromium.launch(**launch)
        for role in ROLES:
            for vp,width,height in VIEWPORTS:
                PHASE=f'{role}-{vp}-bootstrap'; ctx=browser.new_context(viewport={'width':width,'height':height}); ctx.add_init_script(f"localStorage.setItem('ictc-role','{role}');localStorage.setItem('ictc-service','home')")
                page=ctx.new_page(); page.set_default_timeout(30000); page.goto(BASE+'/?view=home',wait_until='networkidle'); data=api_json(page,'/api/bootstrap',role); registry={x['id']:x for x in data.get('procedureRegistry',{}).get('procedures',[])}; families=data.get('procedureRegistry',{}).get('commonSubstrate',{}).get('epistemicFamilies',[]); revision=int(data.get('revision',0)); assert len(registry)==7 and families
                labels=page.locator('.service-nav [data-service]').all_text_contents(); expected=['Oggi','Processi di Compliance','Postura ICTC']
                if [x.strip() for x in labels]!=expected: anomaly('top-navigation-language',role,vp,'shell',labels,expected)
                no_overflow(page,role,vp,'home'); one_h1(page,role,vp,'home'); shot(page,role,vp,'home',width)
                page.locator('.service-nav [data-service="processes"]').click(); cards=page.locator('#procedureHub .procedure-card'); expect(cards).to_have_count(7); expect(page.locator('#procedureHub .procedure-card:visible')).to_have_count(7); h=visible_columns(page); expected_cols={390:1,768:2,1280:3,1600:3}[width]
                if h['count']!=7: anomaly('process-hub-count',role,vp,'processes',h['count'],7)
                if h['columns']!=expected_cols: anomaly('process-hub-columns',role,vp,'processes',h['columns'],expected_cols)
                if any(x<43.5 for x in h['primaryHeights']): anomaly('process-card-target-too-small',role,vp,'processes',h['primaryHeights'],'all >=44px')
                if (page.locator('#processesView h1').text_content() or '').strip()!='Processi di Compliance': anomaly('process-hub-title',role,vp,'processes',page.locator('#processesView h1').text_content(),'Processi di Compliance')
                no_overflow(page,role,vp,'processes'); one_h1(page,role,vp,'processes'); shot(page,role,vp,'processes',width)
                for proc in PROCEDURES: audit_process(page,role,vp,width,proc,registry.get(proc['id']),families,revision)
                audit_proof(page,role,vp,width); audit_ep(page,role,vp,width,list(registry.keys()),revision); ctx.close()
        unique={x['signature']:x for x in anomalies}
        report={'ok':not anomalies,'profile':'onto-compliance-horizon-v1+visual-grace-lexical-epistemic-runtime-audit','sceneCount':len(scenes),'screenshotCount':len(screenshots),'anomalyCount':len(anomalies),'uniqueAnomalyCount':len(unique),'anomalies':anomalies,'scenes':scenes,'screenshots':screenshots,'networkCoverageRoles':sorted(network_coverage_checked),'dimensions':{'roles':ROLES,'viewports':[x[0] for x in VIEWPORTS],'processes':[x['code'] for x in PROCEDURES]},'boundary':'Server-backed automated visual, geometry, lexical and epistemic evidence; not independent human usability, aesthetic preference, legal compliance or assistive-technology assessment.'}
        (ART/'browser-onto-compliance-v1.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf8')
        if anomalies:
            for x in list(unique.values())[:40]: print(f"::error title=onto-visual::{x['kind']}::{x['surface']} {x['role']} {x['viewport']}: {x['measured']}",flush=True)
            raise AssertionError(f'onto-compliance visual audit found {len(anomalies)} observations / {len(unique)} unique signatures')
        print(f'browser-onto-compliance-v1: complete scenes={len(scenes)} screenshots={len(screenshots)} anomalies=0 visual+lexical+epistemic=ok',flush=True); browser.close()
except BaseException as error:
    payload={'ok':False,'phase':PHASE,'type':type(error).__name__,'message':str(error),'traceback':traceback.format_exc(),'anomalies':anomalies,'scenes':scenes,'screenshots':screenshots}; (ART/'browser-onto-compliance-v1-error.json').write_text(json.dumps(payload,indent=2,ensure_ascii=False),encoding='utf8'); print(f'::error title=browser-onto-compliance-v1::{PHASE}: {type(error).__name__}: {error}',flush=True); traceback.print_exc(); raise
