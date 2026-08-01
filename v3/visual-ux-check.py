#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import os
import threading
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"
SCREENSHOTS = ARTIFACTS / "screenshots"
SCREENSHOTS.mkdir(parents=True, exist_ok=True)

FIXTURE = {
    "meta": {"version": "1.0.0", "integrity": {"ok": True, "eventCount": 17, "head": "fixture-head"}},
    "views": {
        "sources": [
            {"id": "source-a", "epistemicStatus": "human-reviewed", "data": {"id": "a", "lifecycle": "active"}},
            {"id": "source-b", "epistemicStatus": "candidate", "data": {"id": "b", "lifecycle": "candidate"}},
            {"id": "source-c", "epistemicStatus": "observed", "data": {"id": "c", "lifecycle": "active"}},
        ],
        "findings": [
            {"id": "finding-a", "epistemicStatus": "awaiting-human-review", "data": {"id": "fa", "humanState": "awaiting-review"}},
            {"id": "finding-b", "epistemicStatus": "human-reviewed", "data": {"id": "fb", "humanState": "reviewed-relevant"}},
        ],
        "changes": [
            {"id": "change-a", "epistemicStatus": "awaiting-human-review", "data": {"id": "ca", "state": "impact-to-assess"}},
            {"id": "change-b", "epistemicStatus": "awaiting-human-review", "data": {"id": "cb", "state": "controls-to-map"}},
        ],
        "matters": [
            {"id": "matter-a", "epistemicStatus": "attention-required", "data": {"id": "ma", "state": "facts-to-confirm"}},
            {"id": "matter-b", "epistemicStatus": "human-owned", "data": {"id": "mb", "state": "assessing"}},
            {"id": "matter-c", "epistemicStatus": "human-reviewed", "data": {"id": "mc", "state": "closed"}},
        ],
        "traces": [{"id": f"trace-{letter}"} for letter in "abcd"],
    },
    "release": {"version": "1.0.0", "readiness": "ready", "stabilityClass": "stable-local-single-user"},
}

BASE_CSS = """
:root{--canvas:#ebece8;--surface:#fff;--ink:#1f2421;--muted:#68736c;--line:#d6dbd7;--shadow:0 18px 60px #26342d18;font:15px/1.5 Inter,system-ui,sans-serif;color:var(--ink);background:var(--canvas)}*{box-sizing:border-box}body{margin:0;background:var(--canvas)}button{font:inherit;color:inherit;cursor:pointer}.shell{min-height:100vh;display:grid;grid-template-columns:220px 1fr}.shell>aside{padding:24px 16px;background:#202522;color:#fff}.brand{font-size:22px;font-weight:800;margin-bottom:28px}.brand small{display:block;color:#aeb8b2;font-size:12px}.shell nav{display:grid;gap:6px}.shell nav button{min-height:44px;border:0;border-radius:12px;padding:10px 14px;text-align:left;background:transparent;color:#d8dfda}.shell nav button[aria-current=page]{background:#ffffff18;color:#fff}.stage{min-width:0}.top{height:68px;display:flex;align-items:center;gap:10px;padding:0 24px;border-bottom:1px solid var(--line);background:#f6f7f4}.top>b{margin-right:auto}.top button,.top select{min-height:44px;border:1px solid var(--line);border-radius:12px;background:#fff;padding:9px 13px}main{padding:32px;max-width:1400px}.page-head h1{font-size:36px;margin:4px 0 8px}.page-head p{max-width:72ch;color:var(--muted)}.eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#315d54}.action-frame-section{margin-top:24px}.action-frame-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:18px}.card p{color:var(--muted)}
"""


def preview_html() -> str:
    nav = "".join(
        f'<button data-view="{key}" {"aria-current=\"page\"" if key == "home" else ""}>{label}</button>'
        for key, label in [
            ("home", "Oggi"), ("atlas", "Atlante"), ("journeys", "Percorsi"),
            ("changes", "Novità"), ("sources", "Fonti"), ("matters", "Eventi"),
            ("evidence", "Prove"), ("system", "Sistema")
        ]
    )
    fixture = json.dumps(FIXTURE, ensure_ascii=False)
    return f'''<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ICTC Advanced UX visual check</title><style>{BASE_CSS}</style><link rel="stylesheet" href="/advanced-ux.css"></head><body><a href="#main" class="ux-sr-only">Vai al contenuto</a><div class="shell"><aside><div class="brand">ICTC<small>Living Evidence Atlas</small></div><nav aria-label="Navigazione principale">{nav}</nav></aside><div class="stage"><header class="top"><b>Oggi</b><button>Cerca</button><select id="lens" aria-label="Lente di lavoro"><option value="everyday">Operativo</option><option value="audit">Auditor</option></select><button id="addSource">Nuova fonte</button></header><main id="main" tabindex="-1"><header class="page-head"><div><span class="eyebrow">La tua situazione</span><h1 tabindex="-1">Oggi</h1><p>Oggetti runtime che richiedono attenzione, decisione o verifica. Nessun punteggio sintetico.</p></div></header><section id="ictc-action-frames" class="action-frame-section"><header><h2>Che cosa devi fare qui?</h2></header><div class="action-frame-grid"><article class="card"><h3>Valuta una differenza</h3><p>Apri l’oggetto e registra una review umana.</p><button>Apri</button></article><article class="card"><h3>Conferma responsabilità</h3><p>Owner e RACI diventano decisioni registrate.</p><button>Apri</button></article><article class="card"><h3>Segui la receipt</h3><p>Ricostruisci input, produttore e hash-chain.</p><button>Apri</button></article></div></section></main></div></div><script type="module">import {{ S }} from '/js/core.js';import {{ mountAdvancedUx }} from '/js/advanced-ux.js';S.data={fixture};S.view='home';document.querySelectorAll('nav [data-view]').forEach(button=>button.addEventListener('click',()=>{{S.view=button.dataset.view;document.querySelectorAll('nav [data-view]').forEach(item=>item.removeAttribute('aria-current'));button.setAttribute('aria-current','page');document.dispatchEvent(new Event('ictc:rendered'));}}));mountAdvancedUx();document.dispatchEvent(new Event('ictc:rendered'));</script></body></html>'''


class Handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802
        routes = {
            "/advanced-ux.css": ROOT / "v3/public/advanced-ux.css",
            "/js/core.js": ROOT / "v3/public/js/core.js",
            "/js/advanced-ux.js": ROOT / "v3/public/js/advanced-ux.js",
            "/js/projection-layer-model.js": ROOT / "v3/public/js/projection-layer-model.js",
        }
        path = urlparse(self.path).path
        if path in ("/", "/preview.html"):
            payload = preview_html().encode("utf-8")
            content_type = "text/html; charset=utf-8"
        elif path in routes:
            payload = routes[path].read_bytes()
            content_type = "text/css; charset=utf-8" if path.endswith(".css") else "text/javascript; charset=utf-8"
        else:
            self.send_error(404)
            return
        self.send_response(200)
        self.send_header("content-type", content_type)
        self.send_header("cache-control", "no-store")
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, _format: str, *_args: object) -> None:
        return


def start_preview_server() -> tuple[ThreadingHTTPServer, str]:
    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, f"http://127.0.0.1:{server.server_port}/preview.html"


def main() -> None:
    server = None
    target = os.environ.get("ICTC_VISUAL_URL")
    mode = "runtime" if target else "contract-preview"
    screenshot = SCREENSHOTS / "advanced-ux.png"
    checks: list[str] = []
    try:
        with sync_playwright() as playwright:
            launch = {'headless': os.environ.get('ICTC_HEADED') != '1', 'args': ['--no-sandbox','--disable-dev-shm-usage']}
            if os.environ.get('ICTC_CHROMIUM'):
                launch['executable_path'] = os.environ['ICTC_CHROMIUM']
            browser = playwright.chromium.launch(**launch)
            context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
            page = context.new_page()
            page.set_default_timeout(10000)
            if target:
                page.goto(target, wait_until="networkidle")
            else:
                model_code = (ROOT / 'v3/public/js/projection-layer-model.js').read_text(encoding='utf-8').replace('export function ', 'function ')
                advanced_code = (ROOT / 'v3/public/js/advanced-ux.js').read_text(encoding='utf-8')
                advanced_code = '\n'.join(line for line in advanced_code.splitlines() if not line.startswith('import ')).replace('export function ', 'function ')
                core_code = "const $=(s,r=document)=>r.querySelector(s); const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c])); const status={'derived-guidance':'Guida derivata',observed:'Osservato',verified:'Verifica deterministica','attention-required':'Richiede attenzione','awaiting-human-review':'Da valutare','human-reviewed':'Review registrata','human-owned':'Responsabilità confermata',failed:'Non completato',unavailable:'Non disponibile'}; const S={data:" + json.dumps(FIXTURE, ensure_ascii=False) + ",view:'home'};"
                inline = preview_html().replace('<link rel="stylesheet" href="/advanced-ux.css">', '<style>' + (ROOT / 'v3/public/advanced-ux.css').read_text(encoding='utf-8') + '</style>')
                inline = inline.split('<script type="module">')[0] + '<script>' + core_code + model_code + advanced_code + "document.querySelectorAll('nav [data-view]').forEach(button=>button.addEventListener('click',()=>{S.view=button.dataset.view;document.dispatchEvent(new Event('ictc:rendered'));}));mountAdvancedUx();document.dispatchEvent(new Event('ictc:rendered'));" + '</script></body></html>'
                page.evaluate("Object.defineProperty(window,'localStorage',{configurable:true,value:(()=>{const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),clear:()=>m.clear()}})()})")
                page.set_content(inline, wait_until='load', timeout=10000)
            page.locator("html[data-ux-ready='true']").wait_for(timeout=10_000)
            assert page.locator("#ux-projection-stack").count() == 1
            assert page.locator(".ux-projection-select").count() == 4
            assert page.locator(".ux-projection-select[data-selected='true']").count() == 1
            assert page.get_by_role("heading", name="Dove serve attenzione, decisione o prova?").count() == 1
            assert page.get_by_role("group", name="Accessibilità e comfort").count() == 1
            checks.extend(["projection stack rendered", "four SOT projections rendered", "single expanded layer", "accessibility toolbar rendered"])

            page.keyboard.press("Alt+u")
            focused_label = page.evaluate("document.activeElement?.getAttribute('aria-label')")
            assert focused_label == "Apri preferenze di accessibilità e comfort"
            checks.append("Alt+U focuses accessibility preferences")

            page.get_by_role("button", name="Apri preferenze di accessibilità e comfort").click()
            text_button = page.get_by_role("button", name="Testo default")
            if text_button.count() == 0:
                text_button = page.locator("[data-ux-preference='text']")
            text_button.click()
            assert page.locator("html[data-ux-text='large']").count() == 1
            checks.append("text scaling preference applied")

            first_tab = page.locator(".ux-projection-select").first
            first_tab.focus()
            page.keyboard.press("ArrowRight")
            assert page.locator(".ux-projection-select[data-selected='true']").get_attribute("data-ux-stage") == "ux-projection-decide"
            checks.append("arrow-key tab navigation applied")

            page.screenshot(path=str(screenshot), full_page=True, timeout=10000)
            browser.close()

        payload_bytes = screenshot.read_bytes()
        assert len(payload_bytes) > 20_000
        assert payload_bytes[:8] == b"\x89PNG\r\n\x1a\n"
        payload = {
            "schemaVersion": "1.0.0",
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "result": "passed",
            "mode": mode,
            "url": target or "inline-contract-preview",
            "screenshot": "artifacts/screenshots/advanced-ux.png",
            "bytes": len(payload_bytes),
            "sha256": hashlib.sha256(payload_bytes).hexdigest(),
            "viewport": {"width": 1440, "height": 1000},
            "checks": checks,
            "limitation": "Rendering, DOM e interazioni tastiera verificati; non sostituisce review visuale umana o test con tecnologie assistive reali.",
        }
        (ARTIFACTS / "advanced-ux-visual.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"advanced-ux-visual: ok ({mode}, {len(checks)} checks, {len(payload_bytes)} bytes)")
    finally:
        if server:
            server.shutdown()
            server.server_close()


if __name__ == "__main__":
    main()
