import json, os, pathlib, traceback
from playwright.sync_api import expect, sync_playwright

ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts'; ART.mkdir(exist_ok=True)
BASE=os.environ.get('ICTC_BASE_URL','http://127.0.0.1:4173').rstrip('/')
PHASE='init'

def fail(exc):
    payload={'ok':False,'phase':PHASE,'type':type(exc).__name__,'message':str(exc),'traceback':traceback.format_exc()}
    (ART/'browser-ui-epistemic-convergence-error.json').write_text(json.dumps(payload,indent=2),encoding='utf8')
    print(f'::error title=browser-ui-epistemic-convergence::{PHASE}: {type(exc).__name__}: {exc}',flush=True)

def processes(page): return page.locator('.service-nav [data-service="processes"]')
def posture(page): return page.locator('.service-nav [data-service="proof"]')
def open_epistemic_entry(page):
    processes(page).click(); expect(page.locator('#procedureHub .procedure-card')).to_have_count(7); meta=page.locator('#epistemicMetaCard'); expect(meta).not_to_be_visible(); assert meta.evaluate('e=>e.parentElement?.id')=='proofView'; posture(page).click(); expect(page.locator('#proofView')).to_be_visible(); expect(meta).to_be_visible(); return meta

def open_process(page,code):
    processes(page).click()
    card=page.locator(f'#procedureHub [data-process-code="{code}"]')
    expect(card).to_be_visible()
    card.locator(':scope > footer .primary').click()
    page.wait_for_timeout(100)

def no_overflow(page):
    m=page.evaluate('()=>({inner:innerWidth,html:document.documentElement.scrollWidth,body:document.body.scrollWidth})')
    assert max(m['html'],m['body'])<=m['inner']+1,m

def selected_node(page):
    return page.evaluate("""()=>[...document.querySelectorAll('.epistemic-node-list button')].find(b=>b.getAttribute('aria-pressed')==='true')?.dataset.epistemicNode||null""")

def graph_ready(page):
    expect(page.locator('.epistemic-graph')).to_have_attribute('data-enhanced','true')
    expect(page.locator('.epistemic-graph-canvas g[data-epistemic-node]').first).to_be_visible()
    page.wait_for_function("()=>document.querySelectorAll('.epistemic-graph-edge[data-graph-from],.epistemic-graph-edge[data-graph-to]').length>0")

def wait_node_detail(page,node_id,atom_ids):
    if node_id in atom_ids:
        page.wait_for_function("id=>[...document.querySelectorAll('.epistemic-node-list button')].some(b=>b.dataset.epistemicNode===id&&b.getAttribute('aria-pressed')==='true')",arg=node_id)
        expect(page.locator('.epistemic-detail')).to_be_visible(); return 'atom'
    page.wait_for_function("id=>document.querySelector('#epistemicGraphReferenceDetail')?.dataset.graphReferenceId===id",arg=node_id)
    expect(page.locator('#epistemicGraphReferenceDetail')).to_be_visible(); return 'reference'

try:
    with sync_playwright() as pw:
        launch={'headless':True,'args':['--no-sandbox']}
        if os.environ.get('ICTC_CHROMIUM'): launch['executable_path']=os.environ['ICTC_CHROMIUM']
        browser=pw.chromium.launch(**launch)
        ctx=browser.new_context(viewport={'width':1280,'height':900})
        ctx.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')")
        page=ctx.new_page(); page.set_default_timeout(30000)
        errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
        capture={'on':False}; writes=[]
        def on_request(req):
            if capture['on'] and req.url.startswith(BASE+'/api/') and req.method!='GET': writes.append({'method':req.method,'url':req.url})
        page.on('request',on_request)

        PHASE='seed-source'; page.goto(BASE+'/?view=processes',wait_until='networkidle'); open_process(page,'EC-01'); page.locator('.procedure-frame:visible .procedure-primary').click(); expect(page.locator('#incidentDialog')).to_be_visible(); page.locator('#incidentDialog textarea[name="originalNarrative"]').fill('Evento di convergenza UI usato come source per verificare readiness asincrona e provenance del draft collegato.'); page.locator('#incidentDialog input[name="awarenessAt"]').fill('2026-08-11T08:45'); page.locator('#incidentDialog button[type="submit"]').click(); expect(page.locator('#incidentDialog')).not_to_be_visible(); expect(page.locator('#incidentList .incident-card').first).to_be_visible()

        PHASE='draft-readiness'; cross=page.locator('.procedure-cross-tools[data-cross-tools="incidents"] [data-cross-create]'); expect(cross).to_be_visible(); cross.click(); dialog=page.locator('#crossCreateDialog'); expect(dialog).to_be_visible(); target=page.locator('#crossTarget'); submit=page.locator('[data-cross-submit]'); expect(target).to_be_enabled(); expect(submit).to_be_enabled(); targets=target.locator('option').evaluate_all("xs=>xs.map(x=>x.value).filter(Boolean)"); assert 'actions' in targets,targets; assert 'incidents' not in targets,targets; target.select_option('actions'); expect(submit).to_be_enabled(); page.locator('#crossTitle').fill('Azione draft da convergenza UI'); page.locator('#crossDescription').fill('Draft collegato: ownership, priorita e chiusura restano checkpoint AP-01.'); submit.click(); expect(dialog).not_to_be_visible()

        PHASE='compression-reversibility'; meta=open_epistemic_entry(page); meta.locator('[data-service="epistemic"]').click(); expect(page.locator('#epistemicView')).to_be_visible(); compression=page.locator('#epistemicCompression'); expect(compression).to_be_visible(); rev=int(compression.get_attribute('data-state-revision') or '0'); digest=compression.get_attribute('data-projection-digest') or ''; assert rev>0 and len(digest)>=16,(rev,digest); envelopes=page.locator('#epistemicCompression [data-envelope-kind]'); assert envelopes.count()>0; atom_ids=set();
        for i in range(envelopes.count()): atom_ids.update(x for x in (envelopes.nth(i).get_attribute('data-atom-ids') or '').split(',') if x)
        assert atom_ids; incident_envelope=page.locator('#epistemicCompression [data-envelope-kind="procedure"][data-envelope-value="incidents"]'); expect(incident_envelope).to_be_visible(); incident_envelope.click(); expect(page.locator('#epistemicProcedureFilter')).to_have_value('incidents'); page.locator('#epistemicProcedureFilter').select_option('')

        PHASE='graph-geometry'; page.locator('[data-epistemic-mode="graph"]').click(); graph_ready(page); visual=page.locator('.epistemic-graph-canvas circle.epistemic-graph-node').first; hit=page.locator('.epistemic-graph-canvas circle.epistemic-graph-hit').first; assert float(visual.get_attribute('r') or 0)==10; assert float(hit.get_attribute('r') or 0)==22; hb=hit.bounding_box(); vb=visual.bounding_box(); assert hb and vb and hb['width']>=43.5 and vb['width']<hb['width'],(hb,vb); collisions=page.evaluate("""()=>{const circles=[...document.querySelectorAll('.epistemic-graph-node')].map((c,i)=>({i,r:c.getBoundingClientRect()}));return [...document.querySelectorAll('.epistemic-graph-label')].flatMap((t,i)=>{const r=t.getBoundingClientRect();if(!r.width||!r.height)return[];return circles.filter(c=>!(r.right<=c.r.left||r.left>=c.r.right||r.bottom<=c.r.top||r.top>=c.r.bottom)).map(c=>({label:i,node:c.i}));});}"""); assert not collisions,collisions; connected=page.evaluate("""()=>{const ids=[];for(const l of document.querySelectorAll('.epistemic-graph-edge'))for(const id of [l.dataset.graphFrom,l.dataset.graphTo])if(id&&!ids.includes(id))ids.push(id);return ids;}"""); atom_connected=[x for x in connected if x in atom_ids]; reference_connected=[x for x in connected if x not in atom_ids]; assert atom_connected and reference_connected,(connected,len(atom_ids)); seed_id=atom_connected[0]; drag_id=next(x for x in connected if x!=seed_id); page.evaluate("""id=>[...document.querySelectorAll('.epistemic-node-list button')].find(b=>b.dataset.epistemicNode===id)?.click()""",seed_id); graph_ready(page); assert selected_node(page)==seed_id,(selected_node(page),seed_id)
        targetability=page.evaluate("""id=>{const g=[...document.querySelectorAll('.epistemic-graph-canvas g[data-epistemic-node]')].find(x=>x.dataset.epistemicNode===id);if(!g)return null;g.scrollIntoView({block:'center',inline:'center'});const hit=g.querySelector('.epistemic-graph-hit');if(!hit)return null;const r=hit.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,under=document.elementFromPoint(x,y);return{x,y,innerWidth,innerHeight,inViewport:x>=0&&x<innerWidth&&y>=0&&y<innerHeight,hitId:under?.closest?.('g[data-epistemic-node]')?.dataset.epistemicNode||null};}""",drag_id); assert targetability and targetability['inViewport'] and targetability['hitId']==drag_id,targetability
        baseline=page.evaluate("""id=>{const g=[...document.querySelectorAll('.epistemic-graph-canvas g[data-epistemic-node]')].find(x=>x.dataset.epistemicNode===id);const hit=g?.querySelector('.epistemic-graph-hit');const line=[...document.querySelectorAll('.epistemic-graph-edge')].find(l=>l.dataset.graphFrom===id||l.dataset.graphTo===id);if(!g||!hit||!line)return null;const r=hit.getBoundingClientRect(),from=line.dataset.graphFrom===id;return{id,center:{x:r.left+r.width/2,y:r.top+r.height/2},from,x:Number(line.getAttribute(from?'x1':'x2')),y:Number(line.getAttribute(from?'y1':'y2'))};}""",drag_id); assert baseline,drag_id
        capture['on']=True; page.mouse.move(baseline['center']['x'],baseline['center']['y']); page.mouse.down(); page.mouse.move(baseline['center']['x']+56,baseline['center']['y']+36,steps=6); page.mouse.up(); page.wait_for_timeout(80); capture['on']=False
        after=page.evaluate("""id=>{const g=[...document.querySelectorAll('.epistemic-graph-canvas g[data-epistemic-node]')].find(x=>x.dataset.epistemicNode===id);const line=[...document.querySelectorAll('.epistemic-graph-edge')].find(l=>l.dataset.graphFrom===id||l.dataset.graphTo===id);if(!g||!line)return null;const from=line.dataset.graphFrom===id;return{transform:g.getAttribute('transform')||'',x:Number(line.getAttribute(from?'x1':'x2')),y:Number(line.getAttribute(from?'y1':'y2'))};}""",drag_id); assert after and after['transform'].startswith('translate('),after; assert abs(after['x']-baseline['x'])>20 and abs(after['y']-baseline['y'])>15,(baseline,after); assert selected_node(page)==seed_id,(selected_node(page),seed_id,'drag must not activate node'); assert not writes,writes

        PHASE='graph-click-activation'; click_id=reference_connected[0]; page.evaluate("""id=>[...document.querySelectorAll('.epistemic-graph-canvas g[data-epistemic-node]')].find(g=>g.dataset.epistemicNode===id)?.querySelector('.epistemic-graph-node')?.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))""",click_id); assert wait_node_detail(page,click_id,atom_ids)=='reference'; ref_detail=page.locator('#epistemicGraphReferenceDetail'); expect(ref_detail).to_contain_text(click_id); expect(ref_detail.locator('[data-epistemic-basis]').first).to_be_visible(); graph_ready(page)
        PHASE='graph-keyboard-activation'; keyboard_id=atom_connected[-1]; page.evaluate("""id=>[...document.querySelectorAll('.epistemic-graph-canvas g[data-epistemic-node]')].find(g=>g.dataset.epistemicNode===id)?.focus()""",keyboard_id); page.keyboard.press('Enter'); assert wait_node_detail(page,keyboard_id,atom_ids)=='atom'; graph_ready(page)
        PHASE='graph-zoom-reset'; capture['on']=True; page.locator('[data-graph-zoom="in"]').click(); expect(page.locator('[data-graph-zoom-label]')).to_have_text('110%'); assert 'scale(1.1)' in (page.locator('.epistemic-graph-canvas svg').get_attribute('style') or ''); page.locator('[data-graph-reset]').click(); expect(page.locator('[data-graph-zoom-label]')).to_have_text('100%'); capture['on']=False; assert not writes,writes; no_overflow(page); page.screenshot(path=str(ART/'ux-ui-epistemic-convergence-desktop.png'),full_page=True)

        PHASE='mobile-containment'; mc=browser.new_context(viewport={'width':390,'height':844}); mc.add_init_script("localStorage.setItem('ictc-role','admin');localStorage.setItem('ictc-service','processes')"); m=mc.new_page(); m.goto(BASE+'/?view=processes',wait_until='networkidle'); meta=open_epistemic_entry(m); meta.locator('[data-service="epistemic"]').click(); expect(m.locator('#epistemicCompression')).to_be_visible(); no_overflow(m); m.locator('[data-epistemic-mode="graph"]').click(); graph_ready(m); no_overflow(m); heights=m.locator('.epistemic-graph-controls button').evaluate_all("xs=>xs.map(x=>x.getBoundingClientRect().height)"); assert heights and min(heights)>=43.5,heights; m.screenshot(path=str(ART/'ux-ui-epistemic-convergence-mobile.png'),full_page=True); mc.close()

        assert not errors,errors
        out={'ok':True,'profile':'ui-epistemic-procedure-convergence-browser','metaEntrySurface':'Postura ICTC','draftAsyncReadiness':True,'meaningfulTargets':targets,'compressionRevision':rev,'compressionDigest':digest,'reversibleEnvelope':True,'visualNodeRadius':10,'hitRadius':22,'labelNodeCollisions':0,'dragTargetability':True,'dragMovesConnectedEdges':True,'dragDoesNotActivate':True,'referenceClickOpensDetail':True,'referenceLinksCanonicalAtom':True,'keyboardAtomOpensDetail':True,'graphGesturesWriteCount':len(writes),'mobileOverflow':False,'evidenceClass':'E2-server-backed-browser+interaction-falsification'}
        (ART/'browser-ui-epistemic-convergence.json').write_text(json.dumps(out,indent=2),encoding='utf8'); print('browser-ui-epistemic-convergence: complete',flush=True); ctx.close(); browser.close()
except BaseException as exc:
    fail(exc); traceback.print_exc(); raise
