import os, pathlib, json, traceback
from playwright.sync_api import sync_playwright, expect
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4833').rstrip('/')
OUT=pathlib.Path('artifacts/audit-plan'); OUT.mkdir(parents=True,exist_ok=True)
result={'records':[],'errors':[]}
with sync_playwright() as pw:
 launch={'headless':True,'args':['--no-sandbox']}
 if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
 b=pw.chromium.launch(**launch)
 c=b.new_context(viewport={'width':1440,'height':1000})
 c.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','monitoring');localStorage.setItem('ictc-profile','demo')")
 p=c.new_page()
 try:
  p.goto(BASE+'/?view=monitoring',wait_until='networkidle')
  p.wait_for_function("()=>document.documentElement.dataset.enduserComposition==='p2'",timeout=30000)
  d=p.locator('[data-rn-monitoring-secondary]')
  expect(d).to_have_count(1)
  if d.get_attribute('open') is None: d.locator(':scope > summary').click()
  p.wait_for_timeout(250)
  btn=p.locator('[data-open-plan]:visible').first
  expect(btn).to_be_visible(timeout=8000)
  txt=btn.inner_text().strip(); btn.click()
  expect(p.locator('#planDialog')).to_be_visible(timeout=8000); p.wait_for_timeout(300)
  f=OUT/'desktop__admin__monitoring-plan-review-visible.png'; p.screenshot(path=str(f),full_page=True)
  result['records'].append({'file':f.name,'triggerText':txt,'dialog':'#planDialog','h2':p.locator('#planDialog h2:visible').all_inner_texts()})
 except Exception as e: result['errors'].append({'error':repr(e),'trace':traceback.format_exc()})
 c.close(); b.close()
(OUT/'plan-report.json').write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding='utf8')
print(json.dumps(result,ensure_ascii=False))
