import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
ART = ROOT / 'artifacts'
ART.mkdir(exist_ok=True)
BASE = os.environ.get('ICTC_BASE_URL', 'http://127.0.0.1:4173').rstrip('/')
PHASE = 'init'
RESULTS = []
PAGE_ERRORS = []


def phase(name):
    global PHASE
    PHASE = name


def no_overflow(page, label):
    metrics = page.evaluate("()=>({inner:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth})")
    assert metrics['doc'] <= metrics['inner'] + 2 and metrics['body'] <= metrics['inner'] + 2, (label, metrics)
    RESULTS.append({'oracle': 'reflow-1440-390-320', 'case': label, 'metrics': metrics})


def target_height(page, selector, label):
    rows = page.locator(selector).evaluate_all("els=>els.filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'}).map(e=>({tag:e.tagName,id:e.id,cls:String(e.className||''),w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height,text:(e.textContent||'').trim().slice(0,50)}))")
    assert rows, (label, 'no visible targets')
    bad = [row for row in rows if row['h'] < 43.5]
    assert not bad, (label, bad)
    RESULTS.append({'oracle': 'target-size-critical-controls', 'case': label, 'count': len(rows), 'minHeight': min(row['h'] for row in rows)})


def footer_clear(page, label):
    metrics = page.evaluate("""()=>{const f=document.querySelector('#stableLegalFooter');if(!f)return{missing:true};const fr=f.getBoundingClientRect(),pad=parseFloat(getComputedStyle(document.body).paddingBottom)||0;const candidates=[...document.querySelectorAll('main button,main a[href],main input,main select,main textarea,main summary')].filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&!e.disabled});let sampled=0,worst=0;const offenders=[];for(const e of candidates.slice(0,48)){e.focus?.({preventScroll:true});e.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});const r=e.getBoundingClientRect(),ff=f.getBoundingClientRect();const h=Math.max(0,Math.min(r.bottom,ff.bottom)-Math.max(r.top,ff.top)),w=Math.max(0,Math.min(r.right,ff.right)-Math.max(r.left,ff.left)),a=h*w;if(a>0)offenders.push({tag:e.tagName,id:e.id||'',cls:String(e.className||'').slice(0,120),text:(e.textContent||'').trim().replace(/\s+/g,' ').slice(0,100),position:getComputedStyle(e).position,rect:{top:r.top,right:r.right,bottom:r.bottom,left:r.left,width:r.width,height:r.height},footer:{top:ff.top,right:ff.right,bottom:ff.bottom,left:ff.left,width:ff.width,height:ff.height},area:a});worst=Math.max(worst,a);sampled++;}return{missing:false,footerHeight:fr.height,bodyPaddingBottom:pad,scrollY:window.scrollY,docHeight:document.documentElement.scrollHeight,viewportHeight:innerHeight,sampled,overlap:offenders.length,worst,offenders};}""")
    assert not metrics.get('missing'), metrics
    if metrics['overlap']:
        o = metrics['offenders'][0]
        raise AssertionError(f"{label}: offender={o['tag']}#{o['id']}.{o['cls']} text={o['text'][:32]!r} pos={o['position']} bottom={o['rect']['bottom']:.1f} footerTop={o['footer']['top']:.1f} area={o['area']:.1f}")
    RESULTS.append({'oracle': 'footer-geometric-overlap', 'case': label, **metrics})


def keyboard_focus(page):
    page.evaluate("()=>{window.scrollTo(0,0);document.activeElement?.blur?.()}")
    page.keyboard.press('Tab')
    active = page.evaluate("()=>({cls:String(document.activeElement?.className||''),tag:document.activeElement?.tagName,text:(document.activeElement?.textContent||'').trim(),visible:!!document.activeElement&&document.activeElement.getBoundingClientRect().height>0})")
    assert 'skip-link' in active['cls'] and active['visible'], active
    style = page.evaluate("()=>{const e=document.activeElement,s=getComputedStyle(e),r=e.getBoundingClientRect();return{focusVisible:e.matches(':focus-visible'),outlineStyle:s.outlineStyle,outlineWidth:s.outlineWidth,boxShadow:s.boxShadow,top:r.top,bottom:r.bottom}}")
    assert style['focusVisible'], style
    assert style['outlineStyle'] != 'none' or style['boxShadow'] != 'none', style
    page.keyboard.press('Enter')
    page.wait_for_timeout(80)
    assert '#main' in page.url or page.evaluate("()=>location.hash==='#main'")
    RESULTS.append({'oracle': 'keyboard-navigation', 'skipLink': active, 'style': style})
    RESULTS.append({'oracle': 'focus-visible-effect', 'style': style})


def critical_contrast(page):
    ratios = page.evaluate("""()=>{function rgb(v){const m=v.match(/rgba?\(([^)]+)\)/);if(!m)return null;const p=m[1].split(',').map(Number);return p.slice(0,3)}function lum(c){return c.map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0)}function ratio(a,b){const x=lum(a),y=lum(b),hi=Math.max(x,y),lo=Math.min(x,y);return(hi+.05)/(lo+.05)}function solidBg(e){for(let n=e;n;n=n.parentElement){const raw=getComputedStyle(n).backgroundColor,c=rgb(raw);if(c&&raw!=='rgba(0, 0, 0, 0)')return c}return[255,255,255]}function visible(e){if(!e)return false;const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'}const items=[['service-home',document.querySelector('.service-nav [data-service="home"]')],['service-processes',document.querySelector('.service-nav [data-service="processes"]')],['home-visible-h1',[...document.querySelectorAll('#homeView h1')].find(visible)],['home-worklist-control',[...document.querySelectorAll('#homePriorities button')].find(visible)]];return items.map(([sel,e])=>{if(!visible(e))return{sel,missing:true};const fg=rgb(getComputedStyle(e).color),bg=solidBg(e);return{sel,ratio:fg?ratio(fg,bg):0,fg,bg}})}""")
    bad = [row for row in ratios if row.get('missing') or row['ratio'] < 4.5]
    assert not bad, bad
    RESULTS.append({'oracle': 'contrast-critical-controls', 'ratios': ratios})


def wait_current_home(page, role):
    phase(f'{role}-home-semantic-ready')
    expect(page.locator('#homeView')).to_be_visible()
    expect(page.locator('#stableLegalFooter')).to_be_visible()
    priorities = page.locator('#homePriorities')
    expect(priorities).to_be_visible()
    expect(priorities).to_have_attribute('data-home-work-queue', '3.2')
    expect(priorities.locator('button:visible').first).to_be_visible()
    headings = page.locator('#homeView h1:visible')
    expect(headings.first).to_be_visible()
    assert headings.count() == 1, {'role': role, 'visibleHomeH1': headings.count()}
    RESULTS.append({'oracle': 'current-final-dom-owner', 'role': role, 'homeTitle': headings.first.inner_text().strip(), 'homeWorkQueue': priorities.get_attribute('data-home-work-queue')})


def reduced_motion(browser):
    phase('reduced-motion-context')
    ctx = browser.new_context(viewport={'width': 1280, 'height': 850}, reduced_motion='reduce')
    ctx.add_init_script("try { localStorage.setItem('ictc-role','user'); localStorage.setItem('ictc-service','processes'); } catch {}")
    page = ctx.new_page()
    phase('reduced-motion-load')
    page.goto(BASE + '/', wait_until='networkidle')
    phase('reduced-motion-nav')
    expect(page.locator('.service-nav [data-service="processes"]')).to_be_visible()
    page.locator('.service-nav [data-service="processes"]').click()
    phase('reduced-motion-procedure-card')
    expect(page.locator('#procedureHub .procedure-card').first).to_be_visible()
    phase('reduced-motion-computed')
    value = page.locator('#procedureHub .procedure-card').first.evaluate("e=>({animation:getComputedStyle(e).animationDuration,transition:getComputedStyle(e).transitionDuration})")
    assert value['animation'] in ('0s', '0ms') and value['transition'] in ('0s', '0ms'), value
    RESULTS.append({'oracle': 'reduced-motion-effect', 'computed': value})
    ctx.close()


def run_viewport(browser, width, height, label):
    phase(f'{label}-context')
    ctx = browser.new_context(viewport={'width': width, 'height': height})
    ctx.add_init_script("try { localStorage.setItem('ictc-role','user'); localStorage.setItem('ictc-service','home'); } catch {}")
    page = ctx.new_page()
    phase(f'{label}-load')
    page.goto(BASE + '/', wait_until='networkidle')
    wait_current_home(page, label)
    phase(f'{label}-home-reflow')
    no_overflow(page, f'{label}:home')
    phase(f'{label}-process-nav')
    page.locator('.service-nav [data-service="processes"]').click()
    phase(f'{label}-process-count')
    expect(page.locator('#procedureHub .procedure-card')).to_have_count(7)
    phase(f'{label}-process-reflow')
    no_overflow(page, f'{label}:processes')
    phase(f'{label}-proof-nav')
    page.locator('.service-nav [data-service="proof"]').click()
    expect(page.locator('#proofView')).to_be_visible()
    phase(f'{label}-proof-reflow')
    no_overflow(page, f'{label}:proof')
    phase(f'{label}-proof-footer')
    footer_clear(page, f'{label}:proof')
    ctx.close()


def fail(exc):
    payload = {
        'ok': False,
        'slice': 'S4-A5',
        'context': 'a5-final-dom',
        'phase': PHASE,
        'type': type(exc).__name__,
        'message': str(exc),
        'traceback': traceback.format_exc(),
        'results': RESULTS,
        'pageErrors': PAGE_ERRORS,
        'claimBoundary': 'Automated current-browser evidence only; human assistive-technology and usability validation remain E4.',
    }
    (ART / 'browser-s4-a5-final-dom-a11y-error.json').write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding='utf8')
    print(f'::error title=browser-s4-a5-final-dom-a11y::{PHASE}: {type(exc).__name__}: {exc}', flush=True)


try:
    with sync_playwright() as pw:
        launch = {'headless': True, 'args': ['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'):
            launch['executable_path'] = os.environ['ICTC_CHROMIUM']
        browser = pw.chromium.launch(**launch)
        phase('desktop-context')
        ctx = browser.new_context(viewport={'width': 1440, 'height': 950})
        ctx.add_init_script("try { localStorage.setItem('ictc-role','admin'); localStorage.setItem('ictc-service','home'); } catch {}")
        page = ctx.new_page()
        page.set_default_timeout(30000)
        page.on('pageerror', lambda error: PAGE_ERRORS.append(str(error)))
        phase('desktop-load')
        page.goto(BASE + '/', wait_until='networkidle')
        wait_current_home(page, 'desktop')

        phase('desktop-home-reflow')
        no_overflow(page, 'desktop:home')
        phase('desktop-keyboard-focus')
        keyboard_focus(page)
        phase('desktop-contrast')
        critical_contrast(page)
        phase('desktop-service-targets')
        target_height(page, '.service-nav button:visible', 'desktop:service-nav')
        phase('desktop-home-worklist-targets')
        target_height(page, '#homePriorities button:visible', 'desktop:home-worklist')
        phase('desktop-home-footer')
        footer_clear(page, 'desktop:home')

        phase('desktop-process-nav')
        page.locator('.service-nav [data-service="processes"]').click()
        phase('desktop-process-count')
        expect(page.locator('#procedureHub .procedure-card')).to_have_count(7)
        phase('desktop-process-targets')
        target_height(page, '#procedureHub .procedure-card footer .primary:visible', 'desktop:procedure-primary')
        phase('desktop-process-reflow')
        no_overflow(page, 'desktop:processes')
        phase('desktop-process-footer')
        footer_clear(page, 'desktop:processes')
        ctx.close()

        run_viewport(browser, 390, 844, 'mobile-390')
        run_viewport(browser, 320, 800, 'mobile-320')
        reduced_motion(browser)

        phase('human-at-remains-e4')
        assert not PAGE_ERRORS, PAGE_ERRORS
        report = {
            'ok': True,
            'slice': 'S4-A5',
            'context': 'a5-final-dom',
            'oracles': ['keyboard-navigation', 'focus-visible-effect', 'reflow-1440-390-320', 'reduced-motion-effect', 'contrast-critical-controls', 'target-size-critical-controls', 'footer-geometric-overlap', 'human-at-remains-e4'],
            'results': RESULTS,
            'pageErrors': PAGE_ERRORS,
            'humanValidation': 'external-e4',
            'claimBoundary': 'Exact-head automated Chromium/current-DOM evidence for critical keyboard/focus/reflow/motion/contrast/target-height/footer effects. It does not establish representative-human usability or real assistive-technology effectiveness.',
        }
        (ART / 'browser-s4-a5-final-dom-a11y.json').write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf8')
        print(json.dumps({'ok': True, 'slice': 'S4-A5', 'oracles': len(report['oracles'])}), flush=True)
        browser.close()
except BaseException as exc:
    fail(exc)
    traceback.print_exc()
    raise
