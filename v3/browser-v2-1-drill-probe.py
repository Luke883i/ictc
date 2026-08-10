import os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]; BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/'); PHASE='init'
def fail(e): print(f'::error title=browser-v21-drill-probe::{PHASE}: {type(e).__name__}: {e}',flush=True)
try:
 with sync_playwright() as pw:
  launch={'headless':True,'args':['--no-sandbox']}
  if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
  browser=pw.chromium.launch(**launch); ctx=browser.new_context(viewport={'width':1280,'height':850}); ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')")
  page=ctx.new_page(); page.set_default_timeout(15000); page.goto(BASE+'/?view=processes',wait_until='networkidle')
  PHASE='entry'; expect(page.locator('#epistemicMetaCard')).to_be_visible(); page.locator('#epistemicMetaCard [data-service="epistemic"]').click(); expect(page.locator('#epistemicView')).to_be_visible(); expect(page.locator('[data-epistemic-mode="explore"]')).to_have_attribute('aria-pressed','true')
  PHASE='overview-actions'; cluster=page.locator('[data-explore-procedure="actions"]'); expect(cluster).to_be_visible(); cluster.click()
  PHASE='groups-level'; expect(page.locator('[data-epistemic-level="groups"]')).to_have_attribute('aria-current','step')
  PHASE='family-visible'; family=page.locator('[data-explore-family]').first; expect(family).to_be_visible(); family_value=family.get_attribute('data-explore-family'); assert family_value
  PHASE='family-click'; family.click()
  PHASE='relations-level'; expect(page.locator('[data-epistemic-level="relations"]')).to_have_attribute('aria-current','step')
  PHASE='relation-atom-visible'; atom=page.locator('[data-explore-atom]').first; expect(atom).to_be_visible(); atom_id=atom.get_attribute('data-explore-atom'); assert atom_id
  PHASE='atom-click'; atom.click()
  PHASE='atom-level'; expect(page.locator('[data-epistemic-level="atom"]')).to_have_attribute('aria-current','step')
  PHASE='atom-readable'; expect(page.locator('.epistemic-atom-readable')).to_be_visible()
  PHASE='context-atomo'; expect(page.locator('[data-surface-context-strip]:visible')).to_contain_text('Atomo')
  PHASE='return-overview'; page.locator('[data-epistemic-level="overview"]').click(); expect(page.locator('[data-epistemic-level="overview"]')).to_have_attribute('aria-current','step'); expect(page.locator('[data-surface-context-strip]:visible')).to_contain_text('Quadro')
  print(f'browser-v21-drill-probe: complete family={family_value} atom={atom_id}',flush=True); ctx.close(); browser.close()
except BaseException as e:
 fail(e); traceback.print_exc(); raise
