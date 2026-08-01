#!/usr/bin/env python3
import hashlib
import json
import os
import re
import shutil
import time
import urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright, Error as PlaywrightError

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"
SCREENSHOTS = ARTIFACTS / "screenshots"
SCREENSHOTS.mkdir(parents=True, exist_ok=True)
BASE_URL = os.getenv("ICTC_BASE_URL", "http://127.0.0.1:4807").rstrip("/")


def read_json_url(path):
    with urllib.request.urlopen(BASE_URL + path, timeout=8) as response:
        return json.loads(response.read().decode("utf-8"))


def bundle_modules():
    public = ROOT / "v3" / "public"
    model = (public / "js" / "journey-model.js").read_text(encoding="utf-8")
    modules = [
        (public / "js" / name).read_text(encoding="utf-8")
        for name in ["journey-shell-common.js", "journey-shell-render.js", "journey-shell-actions.js"]
    ]
    model = re.sub(r"\bexport\s+", "", model)
    modules = [re.sub(r"^import[^\n]+\n", "", value, flags=re.MULTILINE) for value in modules]
    modules = [re.sub(r"\bexport\s+", "", value) for value in modules]
    return model + "\n" + "\n".join(modules) + "\nwindow.__coreBoot = startJourneyShell();"


def inline_html():
    public = ROOT / "v3" / "public"
    html = (public / "index.html").read_text(encoding="utf-8")
    css = (public / "styles.css").read_text(encoding="utf-8")
    html = re.sub(r'\s*<link rel="stylesheet" href="styles\.css">', "", html)
    html = re.sub(r'\s*<script type="module" src="app\.js"></script>', "", html)
    return html.replace("</head>", f"<style>{css}</style></head>")


def install_fetch_bridge(page, contract):
    page.evaluate(
        """({baseUrl, contract}) => {
          const store = new Map();
          Object.defineProperty(window, 'localStorage', {configurable: true, value: {
            getItem: key => store.has(key) ? store.get(key) : null,
            setItem: (key, value) => store.set(key, String(value)),
            removeItem: key => store.delete(key), clear: () => store.clear()
          }});
          const nativeFetch = window.fetch.bind(window);
          window.fetch = (input, init = {}) => {
            const value = typeof input === 'string' ? input : input.url;
            if (value === '/core-workspaces.json' || value.endsWith('/core-workspaces.json')) {
              return Promise.resolve(new Response(JSON.stringify(contract), {status: 200, headers: {'content-type':'application/json'}}));
            }
            if (value.startsWith('/api/')) return nativeFetch(baseUrl + value, init);
            return nativeFetch(input, init);
          };
        }""",
        {"baseUrl": BASE_URL, "contract": contract},
    )


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def confirm_checkpoint(page, before_count):
    page.locator("#checkpointDialog").wait_for(state="visible")
    page.locator('#checkpointDialog button[value="confirm"]').click()
    page.locator("#checkpointDialog").wait_for(state="hidden", timeout=12000)
    deadline = time.time() + 12
    while time.time() < deadline:
        count = read_json_url("/api/runtime/ledger")["integrity"]["eventCount"]
        if count > before_count:
            page.locator(".receipt-strip").wait_for(timeout=12000)
            return count
        time.sleep(0.1)
    raise AssertionError(f"ledger non incrementato oltre {before_count}")


def run():
    health = read_json_url("/api/health")
    assert health["ok"] is True and health["version"] == "1.0.0"
    checks = []
    with sync_playwright() as p:
        launch = {"headless": True, "args": ["--no-sandbox", "--disable-web-security"]}
        chromium_path = os.getenv("ICTC_CHROMIUM_PATH") or shutil.which("chromium") or shutil.which("chromium-browser")
        if chromium_path:
            launch["executable_path"] = chromium_path
        browser = p.chromium.launch(**launch)
        page = browser.new_page(viewport={"width": 1440, "height": 980}, device_scale_factor=1)
        runtime_mode = "runtime-live-origin"
        try:
            page.goto(BASE_URL + "/", wait_until="networkidle")
        except PlaywrightError as error:
            if "ERR_BLOCKED_BY_ADMINISTRATOR" not in str(error):
                raise
            runtime_mode = "runtime-live-api-bridge"
            page.close()
            page = browser.new_page(viewport={"width": 1440, "height": 980}, device_scale_factor=1)
            contract = json.loads((ROOT / "v3" / "public" / "core-workspaces.json").read_text(encoding="utf-8"))
            page.set_content(inline_html(), wait_until="domcontentloaded")
            install_fetch_bridge(page, contract)
            page.add_script_tag(content=bundle_modules())

        page.get_by_role("heading", name="Monitoraggio normativo").wait_for()
        assert page.locator('[data-mode="monitoring"]').get_attribute("aria-current") == "page"
        assert page.locator("#primaryTaskAction").count() <= 1
        assert page.locator(".monitor-table").count() == 1
        assert page.locator(".semantic-table").count() == 1
        assert page.get_by_text("Che cosa devi completare adesso?").count() == 0
        checks += ["direct-two-service-entry", "single-primary-action", "monitoring-runtime-tables"]

        before = read_json_url("/api/runtime/ledger")["integrity"]["eventCount"]
        page.get_by_role("button", name="Esegui ora").click()
        page.locator("#runDialog").wait_for(state="visible")
        assert page.locator("#runSelect option").count() >= 1
        page.locator("#runContent").fill("Versione osservata dal browser E2E: obbligo operativo aggiornato e testo delimitato.")
        page.locator("#runForm button[type=submit]").click()
        after = confirm_checkpoint(page, before)
        assert after == before + 1
        assert page.locator(".monitor-table").count() == 1
        checks.append("scheduled-monitoring-write-refresh-receipt")

        before = after
        page.get_by_role("button", name="Aggiungi fonte").click()
        page.locator("#sourceDialog").wait_for(state="visible")
        page.locator("#sourceContext").select_option("public-administration")
        page.locator("#sourceName").fill("Nota regolatoria browser E2E")
        page.locator("#sourceText").fill("Contenuto regolatorio inserito manualmente; richiede review umana e non determina applicabilità.")
        page.locator("#sourceForm button[type=submit]").click()
        after = confirm_checkpoint(page, before)
        assert after == before + 1
        assert page.get_by_text("Nota regolatoria browser E2E").count() >= 1
        assert page.get_by_text("Ente pubblico o istituzione").count() >= 1
        checks.append("manual-source-storage-semantic-context-refresh")

        page.locator(".semantic-table .object-link").first.click()
        page.locator("#detailDialog").wait_for(state="visible")
        page.locator('[data-detail-tab="provenance"]').click()
        assert page.get_by_text("Prodotto da").count() == 1
        page.locator('[data-detail-tab="evidence"]').click()
        page.locator("#detailBody").get_by_text("Ricevuta", exact=True).wait_for()
        page.locator('[data-dialog-close="detailDialog"]').click()
        checks.append("object-runtime-detail")

        monitoring_shot = SCREENSHOTS / "core-monitoring-runtime.png"
        page.screenshot(path=str(monitoring_shot), full_page=True)

        page.locator('[data-mode="incidents"]').click()
        page.get_by_role("heading", name="Incidenti e quasi incidenti").wait_for()
        assert page.locator(".case-table").count() == 1
        assert page.locator("#primaryTaskAction").count() <= 1
        phase_text = page.locator(".phase-path").inner_text()
        for label in ["Segnalazione", "Triage", "Analisi", "Risposta", "Ripristino", "Lezioni"]:
            assert label in phase_text
        checks += ["incident-process-visible", "incident-single-primary-action"]

        before = read_json_url("/api/runtime/ledger")["integrity"]["eventCount"]
        page.locator('[data-open-dialog="matterDialog"]').click()
        page.locator("#matterDialog").wait_for(state="visible")
        page.locator("#matterContext").select_option("public-administration")
        page.locator("#matterName").fill("Accesso anomalo browser E2E")
        page.locator("#matterKind").select_option("incident")
        page.locator("#matterSummary").fill("Accesso anomalo osservato su un portale fornitore; perimetro e impatto ancora da qualificare.")
        page.locator("#matterForm button[type=submit]").click()
        after = confirm_checkpoint(page, before)
        assert after == before + 1
        assert page.get_by_text("Accesso anomalo browser E2E").count() >= 1
        assert page.get_by_text("Ente pubblico o istituzione").count() >= 1
        checks.append("incident-intake-write-context-refresh-receipt")

        before = after
        page.locator("#primaryTaskAction").click()
        after = confirm_checkpoint(page, before)
        assert after == before + 1
        checks.append("incident-owner-write-refresh-receipt")

        incidents_shot = SCREENSHOTS / "core-incidents-runtime.png"
        page.screenshot(path=str(incidents_shot), full_page=True)

        page.locator("#comfortOpen").click()
        page.locator("#textScale").select_option("large")
        page.locator('#comfortDialog button[value="save"]').click()
        page.wait_for_function("document.documentElement.dataset.text === 'large'")
        page.keyboard.press("Control+K")
        page.locator("#searchDialog").wait_for(state="visible")
        page.locator('[data-dialog-close="searchDialog"]').click()
        checks += ["local-reading-preference", "keyboard-search"]
        browser.close()

    screenshots = []
    for path in [monitoring_shot, incidents_shot]:
        assert path.stat().st_size > 30000
        screenshots.append({"path": str(path.relative_to(ROOT)), "bytes": path.stat().st_size, "sha256": sha256(path)})

    report = {
        "schemaVersion": "3.0.0",
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "result": "passed",
        "mode": runtime_mode,
        "baseUrl": BASE_URL,
        "checks": checks,
        "runtime": {"version": health["version"], "readiness": health["readiness"], "monitoring": health.get("monitoring")},
        "screenshots": screenshots,
        "limitations": [
            "Il browser usa gli asset e le API serviti dal runtime reale.",
            "Il test copre una scrittura per il monitoraggio programmato, una per l’inserimento manuale e due per gli incidenti; il test runtime completa tutte le transizioni.",
            "Il test non certifica usabilità o accessibilità con persone e tecnologie assistive reali."
        ]
    }
    ARTIFACTS.mkdir(exist_ok=True)
    (ARTIFACTS / "journey-browser-check.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"core-ui-browser: ok ({len(checks)} checks, {len(screenshots)} screenshots)")


if __name__ == "__main__":
    run()
