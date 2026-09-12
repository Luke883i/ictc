import argparse, json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
ART = ROOT / 'artifacts'
ART.mkdir(exist_ok=True)
BASE = os.environ.get('ICTC_BASE_URL', 'http://127.0.0.1:4807').rstrip('/')

def experience_cycle(page):
    return int(page.evaluate("()=>Number(document.documentElement.dataset.experienceCycle||0)"))

def open_rn(page):
    page.goto(BASE + '/?view=processes', wait_until='networkidle')
    expect(page.locator('#procedureHub [data-process-code="RN-01"]')).to_be_visible()
    before = experience_cycle(page)
    page.locator('#procedureHub [data-process-code="RN-01"] :scope > footer .primary').click()
    page.wait_for_function("x=>document.documentElement.dataset.ictcSurface==='monitoring'&&Number(document.documentElement.dataset.experienceCycle||0)>x&&!document.documentElement.dataset.ictcTransitionDirection", arg=before)
    primary = page.locator('.procedure-frame:visible .procedure-primary')
    expect(primary).to_have_count(1)
    expect(primary).to_be_visible()
    return primary

def hit_info(primary):
    return primary.evaluate("""el=>{const r=el.getBoundingClientRect();const x=r.left+r.width/2,y=r.top+r.height/2;const hit=document.elementFromPoint(x,y);const s=getComputedStyle(el);return {rect:{x:r.x,y:r.y,width:r.width,height:r.height},center:{x,y},connected:el.isConnected,disabled:!!el.disabled,pointerEvents:s.pointerEvents,visibility:s.visibility,display:s.display,opacity:s.opacity,hit:hit?{tag:hit.tagName,id:hit.id||'',className:String(hit.className||''),owned:hit===el||el.contains(hit)}:null};}""")

def main(mode):
    out = {'mode': mode, 'ok': False}
    with sync_playwright() as pw:
        launch = {'headless': True, 'args': ['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'):
            launch['executable_path'] = os.environ['ICTC_CHROMIUM']
        browser = pw.chromium.launch(**launch)
        ctx = browser.new_context(viewport={'width': 1440, 'height': 950})
        ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')")
        page = ctx.new_page(); page.set_default_timeout(10000)
        primary = open_rn(page)
        info = hit_info(primary); out['hit'] = info
        if mode == 'actionability':
            assert info['connected'] and not info['disabled'] and info['pointerEvents'] != 'none', info
            assert info['hit'] and info['hit']['owned'], info
            primary.click(trial=True, timeout=5000)
        elif mode == 'dom-dispatch':
            primary.evaluate('el=>el.click()')
            expect(page.locator('#contributionDialog')).to_be_visible(timeout=5000)
            out['dialogOpen'] = page.locator('#contributionDialog').evaluate('d=>d.open')
        elif mode == 'browser-click':
            primary.click(timeout=5000)
            expect(page.locator('#contributionDialog')).to_be_visible(timeout=5000)
            out['dialogOpen'] = page.locator('#contributionDialog').evaluate('d=>d.open')
        else:
            raise AssertionError(mode)
        out['ok'] = True
        ctx.close(); browser.close()
    return out

if __name__ == '__main__':
    p = argparse.ArgumentParser(); p.add_argument('--mode', required=True, choices=['actionability','dom-dispatch','browser-click']); args = p.parse_args()
    path = ART / f'rn-primary-{args.mode}.json'
    try:
        result = main(args.mode); path.write_text(json.dumps(result, indent=2), encoding='utf8'); print(json.dumps(result), flush=True)
    except BaseException as e:
        payload = {'mode': args.mode, 'ok': False, 'type': type(e).__name__, 'message': str(e), 'traceback': traceback.format_exc()}
        path.write_text(json.dumps(payload, indent=2), encoding='utf8'); print(f'::error title=rn-primary-{args.mode}::{type(e).__name__}: {e}', flush=True); raise
