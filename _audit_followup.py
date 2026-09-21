import json, os, pathlib, traceback
from playwright.sync_api import sync_playwright, expect
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4832').rstrip('/')
OUT=pathlib.Path('artifacts/audit-followup'); OUT.mkdir(parents=True,exist_ok=True)
recs=[]; errs=[]
def ctx(browser,role,service):
 c=browser.new_context(viewport={'width':1440,'height':1000})
 c.add_init_script(f"localStorage.setItem('ictc-role','{role}');localStorage.setItem('ictc-service','{service}');localStorage.setItem('ictc-profile','demo')")
 return c
def ready(p,view):
 p.goto(f'{BASE}/?view={view}',wait_until='networkidle')
 p.wait_for_function("()=>document.documentElement.dataset.enduserComposition==='p2'",timeout=30000); p.wait_for_timeout(300)
def cap(browser,label,role,view,trigger,dialog):
 c=ctx(browser,role,view); p=c.new_page()
 try:
  ready(p,view)
  loc=p.locator(trigger).first; expect(loc).to_be_visible(timeout=8000); loc.click()
  expect(p.locator(dialog)).to_be_visible(timeout=8000); p.wait_for_timeout(300)
  f=OUT/f'{label}.png'; p.screenshot(path=str(f),full_page=True)
  recs.append({'label':label,'role':role,'view':view,'file':f.name,'triggerText':loc.inner_text().strip(),'dialog':dialog,'h2':p.locator(f'{dialog} h2:visible').all_inner_texts()})
 except Exception as e: errs.append({'label':label,'error':repr(e),'trace':traceback.format_exc()})
 finally: c.close()
with sync_playwright() as pw:
 launch={'headless':True,'args':['--no-sandbox']}
 if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
 b=pw.chromium.launch(**launch)
 cap(b,'desktop__admin__monitoring-contribution-visible','admin','monitoring','button:visible >> text="Aggiungi materiale"','#contributionDialog')
 cap(b,'desktop__admin__monitoring-plan-review-visible','admin','monitoring','[data-open-plan]:visible','#planDialog')
 cap(b,'desktop__user__incident-intake-visible','user','incidents','button:visible >> text="Registra evento"','#incidentDialog')
 b.close()
(OUT/'followup-report.json').write_text(json.dumps({'records':recs,'errors':errs},indent=2,ensure_ascii=False),encoding='utf8')
print(json.dumps({'records':len(recs),'errors':len(errs)},ensure_ascii=False))
