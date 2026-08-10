import json, os, pathlib, re, traceback
from playwright.sync_api import expect, sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
ART = ROOT / 'artifacts'
ART.mkdir(exist_ok=True)
BASE = os.environ.get('ICTC_BASE_URL', 'http://127.0.0.1:4173').rstrip('/')
PHASE = 'init'

PROCEDURES = [
    {'code':'RN-01','id':'monitoring','view':'#monitoringView','frame':'#monitoringView > .procedure-frame','work':'#monitoringView > .hero-monitoring','anatomy':'#monitoringView > .procedure-anatomy'},
    {'code':'EC-01','id':'incidents','view':'#incidentsView','frame':'#incidentsView > .procedure-frame','work':'#incidentsView > .hero-incidents','anatomy':'#incidentsView > .procedure-anatomy'},
    {'code':'AO-01','id':'objects','view':'#grcView','frame':'#grcWorkspace > .procedure-frame','work':'#grcWorkspace > .grc-body','anatomy':'#grcWorkspace > .procedure-anatomy'},
    {'code':'MC-01','id':'coverage','view':'#grcView','frame':'#grcWorkspace > .procedure-frame','work':'#grcWorkspace > .grc-body','anatomy':'#grcWorkspace > .procedure-anatomy'},
    {'code':'AP-01','id':'actions','view':'#grcView','frame':'#grcWorkspace > .procedure-frame','work':'#grcWorkspace > .grc-body','anatomy':'#grcWorkspace > .procedure-anatomy'},
    {'code':'RC-01','id':'risks','view':'#grcView','frame':'#grcWorkspace > .procedure-frame','work':'#grcWorkspace > .grc-body','anatomy':'#grcWorkspace > .procedure-anatomy'},
    {'code':'AR-01','id':'assurance','view':'#grcView','frame':'#grcWorkspace > .procedure-frame','work':'#grcWorkspace > .grc-body','anatomy':'#grcWorkspace > .procedure-anatomy'},
]
VIEWPORTS = [
    {'name':'mobile','width':390,'height':844},
    {'name':'tablet','width':768,'height':1024},
    {'name':'desktop','width':1280,'height':900},
    {'name':'wide','width':1600,'height':1000},
]
ROLES = ['admin','user','auditor']
SCREENSHOT_WIDTHS = {390, 1280}

scenes = []
anomalies = []
screenshots = []


def fail(error):
    payload = {'ok':False,'phase':PHASE,'type':type(error).__name__,'message':str(error),'traceback':traceback.format_exc(),'scenes':scenes,'anomalies':anomalies,'screenshots':screenshots}
    (ART/'browser-onto-compliance-v1-error.json').write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding='utf8')
    print(f'::error title=browser-onto-compliance-v1::{PHASE}: {type(error).__name__}: {error}', flush=True)


def add_anomaly(kind, role, viewport, surface, measured, expected):
    signature = f'{surface}|{role}|{viewport}|{kind}|{str(measured)[:80]}'
    anomalies.append({'kind':kind,'role':role,'viewport':viewport,'surface':surface,'measured':measured,'expected':expected,'signature':signature})


def no_overflow_metrics(page):
    return page.evaluate('()=>({innerWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth})')


def active_view_id(page):
    return page.evaluate("()=>document.querySelector('main > .view:not([hidden])')?.id||''")


def bootstrap(page, role):
    return page.evaluate("""async(role)=>{const r=await fetch('/api/bootstrap',{headers:{'content-type':'application/json','x-ictc-role':role,'x-ictc-actor-id':'onto-visual-audit'}});if(!r.ok)throw new Error('bootstrap '+r.status);return await r.json()}""", role)


def open_process(page, code):
    page.locator('.service-nav [data-service="processes"]').click()
    card = page.locator(f'#procedureHub [data-process-code="{code}"]')
    expect(card).to_be_visible()
    card.locator(':scope > footer .primary').click()
    page.wait_for_timeout(80)
    expect(page.locator('.procedure-frame:visible')).to_be_visible()


def screenshot(page, role, vp, surface):
    if vp['width'] not in SCREENSHOT_WIDTHS:
        return
    safe = re.sub(r'[^A-Za-z0-9_-]+','-',surface).strip('-').lower()
    name = f'ux-och-v1-{role}-{vp["name"]}-{safe}.png'
    page.screenshot(path=str(ART/name), full_page=True)
    screenshots.append(name)


def scene_metrics(page, args):
    return page.evaluate("""(args)=>{
      const visible=e=>!!e&&e.getClientRects().length>0&&getComputedStyle(e).visibility!=='hidden'&&getComputedStyle(e).display!=='none';
      const rect=e=>{if(!visible(e))return null;const r=e.getBoundingClientRect();return{x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1),bottom:+r.bottom.toFixed(1)}};
      const uniq=xs=>[...new Set(xs)];
      const vis=q=>[...document.querySelectorAll(q)].filter(visible);
      const h1=vis('h1').map(e=>e.textContent.trim()).filter(Boolean);
      const primary=uniq([
        ...vis('.procedure-frame .procedure-primary'),
        ...vis('.hero .primary'),
        ...vis('.hero .primary-entry')
      ]).filter(e=>e.getBoundingClientRect().top<innerHeight+1);
      const allButtons=vis('button,summary,[role="button"]').filter(e=>e.getBoundingClientRect().top<innerHeight+1);
      const frame=args.frame?document.querySelector(args.frame):null;
      const work=args.work?document.querySelector(args.work):null;
      const anatomy=args.anatomy?document.querySelector(args.anatomy):null;
      const anatomyBeforeWork=!!(anatomy&&work&&(anatomy.compareDocumentPosition(work)&Node.DOCUMENT_POSITION_FOLLOWING));
      const identity=vis('.procedure-frame-kicker,.hero .eyebrow').filter(e=>args.code&&e.textContent.includes(args.code));
      const framePrimary=frame?.querySelector('.procedure-primary');
      const bodyText=(document.querySelector(args.scope||'main > .view:not([hidden])')?.innerText||'');
      return {
        activeView:document.querySelector('main > .view:not([hidden])')?.id||'',
        h1,
        pageOverflow:{innerWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth},
        primaryAboveFold:primary.map(e=>({text:e.textContent.trim(),rect:rect(e),className:e.className})),
        actionsAboveFold:allButtons.length,
        frame:rect(frame),work:rect(work),anatomy:rect(anatomy),anatomyBeforeWork,
        duplicateCodeIdentity:identity.map(e=>e.textContent.trim()),
        framePrimaryText:visible(framePrimary)?framePrimary.textContent.trim():'',
        favorableAttentionLanguage:/\bIn ordine\b|processi in ordine/i.test(bodyText),
        favorableMatches:(bodyText.match(/In ordine|processi in ordine/gi)||[]).slice(0,12),
        frameRatio:frame?+(frame.getBoundingClientRect().height/innerHeight).toFixed(3):null,
        scopeTextLength:bodyText.length
      };
    }""", args)


def audit_scene(page, role, vp, surface, scope, code='', frame='', work='', anatomy='', contract=None):
    global PHASE
    PHASE = f'{role}-{vp["name"]}-{surface}'
    m = scene_metrics(page, {'scope':scope,'code':code,'frame':frame,'work':work,'anatomy':anatomy})
    record = {'role':role,'viewport':vp['name'],'width':vp['width'],'height':vp['height'],'surface':surface,'metrics':m}
    scenes.append(record)
    if m['pageOverflow']['html'] > m['pageOverflow']['innerWidth'] + 1 or m['pageOverflow']['body'] > m['pageOverflow']['innerWidth'] + 1:
        add_anomaly('document-overflow', role, vp['name'], surface, m['pageOverflow'], 'document width <= viewport + 1')
    if len(m['h1']) != 1:
        add_anomaly('visible-h1-count', role, vp['name'], surface, m['h1'], 'exactly one visible h1')
    if m['favorableAttentionLanguage']:
        add_anomaly('attention-rendered-as-favorable-verdict', role, vp['name'], surface, m['favorableMatches'], 'observational attention language only')
    if code:
        if m['anatomyBeforeWork']:
            add_anomaly('technical-trace-before-native-work', role, vp['name'], surface, {'anatomy':m['anatomy'],'work':m['work']}, 'native work precedes technical trace')
        if len(m['primaryAboveFold']) > 1:
            add_anomaly('competing-primary-actions-above-fold', role, vp['name'], surface, [x['text'] for x in m['primaryAboveFold']], 'one dominant primary entry action')
        if len(m['duplicateCodeIdentity']) > 1:
            add_anomaly('duplicate-procedure-identity', role, vp['name'], surface, m['duplicateCodeIdentity'], 'procedure code asserted once in identity layer')
        if contract:
            frame_title = page.locator(f'{frame} h1').inner_text().strip() if page.locator(f'{frame} h1').count() else ''
            frame_code = page.locator(f'{frame} .procedure-frame-kicker span').first.inner_text().strip() if page.locator(f'{frame} .procedure-frame-kicker span').count() else ''
            if frame_title != contract.get('label') or frame_code != contract.get('code'):
                add_anomaly('procedure-contract-identity-mismatch', role, vp['name'], surface, {'title':frame_title,'code':frame_code}, {'title':contract.get('label'),'code':contract.get('code')})
            anatomy_text = page.locator(anatomy).text_content() or '' if page.locator(anatomy).count() else ''
            boundary = contract.get('claimBoundary') or ''
            if boundary and boundary not in anatomy_text:
                add_anomaly('claim-boundary-not-present-in-procedure-trace', role, vp['name'], surface, False, 'canonical claim boundary present')
    screenshot(page, role, vp, surface)
    return m


def hub_metrics(page):
    return page.locator('#procedureHub .procedure-card').evaluate_all("""nodes=>{const r=nodes.filter(n=>n.getClientRects().length).map(n=>n.getBoundingClientRect());const widths=r.map(x=>x.width),heights=r.map(x=>x.height);return{count:r.length,widthRange:r.length?Math.max(...widths)-Math.min(...widths):0,heightRange:r.length?Math.max(...heights)-Math.min(...heights):0,widths:widths.map(x=>+x.toFixed(1)),heights:heights.map(x=>+x.toFixed(1))}}""")


def audit_auditor_primary(page, vp, proc):
    surface = proc['code']
    primary = page.locator(f'{proc["frame"]} .procedure-primary')
    text = primary.inner_text().strip()
    if text != 'Consulta record':
        add_anomaly('auditor-primary-language', 'auditor', vp['name'], surface, text, 'Consulta record')
    before = active_view_id(page)
    primary.click()
    page.wait_for_timeout(120)
    after = active_view_id(page)
    if after != before:
        add_anomaly('auditor-primary-leaves-procedure', 'auditor', vp['name'], surface, {'before':before,'after':after}, 'remain on procedure read surface')


try:
    with sync_playwright() as pw:
        launch = {'headless':True,'args':['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'):
            launch['executable_path'] = os.environ['ICTC_CHROMIUM']
        browser = pw.chromium.launch(**launch)

        for role in ROLES:
            for vp in VIEWPORTS:
                ctx = browser.new_context(viewport={'width':vp['width'],'height':vp['height']})
                ctx.add_init_script(f"localStorage.setItem('ictc-role','{role}');localStorage.setItem('ictc-service','home')")
                page = ctx.new_page()
                page.set_default_timeout(30000)
                PHASE = f'{role}-{vp["name"]}-bootstrap'
                page.goto(BASE+'/?view=home', wait_until='networkidle')
                data = bootstrap(page, role)
                registry = {x['id']:x for x in data.get('procedureRegistry',{}).get('procedures',[])}
                assert len(registry) == 7, registry.keys()

                audit_scene(page, role, vp, 'home', '#homeView')

                page.locator('.service-nav [data-service="processes"]').click()
                expect(page.locator('#procedureHub .procedure-card')).to_have_count(7)
                pm = audit_scene(page, role, vp, 'processes', '#processesView')
                pm['hub'] = hub_metrics(page)

                for proc in PROCEDURES:
                    open_process(page, proc['code'])
                    expect(page.locator(proc['view'])).to_be_visible()
                    audit_scene(page, role, vp, proc['code'], proc['view'], proc['code'], proc['frame'], proc['work'], proc['anatomy'], registry.get(proc['id']))
                    if role == 'auditor' and vp['width'] in (390,1280):
                        audit_auditor_primary(page, vp, proc)

                page.locator('.service-nav [data-service="proof"]').click()
                expect(page.locator('#proofView')).to_be_visible()
                audit_scene(page, role, vp, 'proof', '#proofView')

                page.locator('.service-nav [data-service="processes"]').click()
                meta = page.locator('#epistemicMetaCard')
                if role in ('admin','auditor'):
                    expect(meta).to_be_visible()
                    meta.locator('[data-service="epistemic"]').click()
                    expect(page.locator('#epistemicView')).to_be_visible()
                    audit_scene(page, role, vp, 'EP-01', '#epistemicView')
                else:
                    if meta.count() and meta.is_visible():
                        add_anomaly('epistemic-meta-visible-to-user', role, vp['name'], 'processes', True, False)

                ctx.close()

        unique = {}
        for item in anomalies:
            unique.setdefault(item['signature'], item)
        report = {
            'ok': not anomalies,
            'profile':'onto-compliance-horizon-v1-runtime-visual-audit',
            'sceneCount':len(scenes),
            'screenshotCount':len(screenshots),
            'anomalyCount':len(anomalies),
            'uniqueAnomalyCount':len(unique),
            'anomalies':anomalies,
            'scenes':scenes,
            'screenshots':screenshots,
            'dimensions':{'roles':ROLES,'viewports':VIEWPORTS,'procedures':[x['code'] for x in PROCEDURES]},
            'boundary':'Server-backed automated visual/geometry/ontology evidence; not independent human usability or assistive-technology assessment.'
        }
        (ART/'browser-onto-compliance-v1.json').write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf8')
        if anomalies:
            for item in list(unique.values())[:30]:
                print(f"::error title=onto-visual::{item['kind']}::{item['surface']} {item['role']} {item['viewport']}: {item['measured']}", flush=True)
            raise AssertionError(f'onto-compliance visual audit found {len(anomalies)} observations / {len(unique)} unique signatures')
        print(f'browser-onto-compliance-v1: complete scenes={len(scenes)} screenshots={len(screenshots)} anomalies=0', flush=True)
        browser.close()
except BaseException as error:
    fail(error)
    traceback.print_exc()
    raise
