#!/usr/bin/env python3
import hashlib
import json
import os
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
        for name in ["journey-shell-common.js", "journey-shell-render.js", "journey-shell-actions.js", "journey-shell-bindings.js"]
    ]
    import re
    model = re.sub(r"\bexport\s+", "", model)
    modules = [re.sub(r"^import\s+[\s\S]*?from\s+['\"][^'\"]+['\"];\n", "", value, flags=re.MULTILINE) for value in modules]
    modules = [re.sub(r"\bexport\s+", "", value) for value in modules]
    return model + "\n" + "\n".join(modules) + "\nwindow.__coreBoot = startJourneyShell();"


def inline_html():
    import re
    public = ROOT / "v3" / "public"
    html = (public / "index.html").read_text(encoding="utf-8")
    css = (public / "styles.css").read_text(encoding="utf-8") if (public / "styles.css").exists() else ""
    css += "\n" + (public / "multi-client.css").read_text(encoding="utf-8")
    html = re.sub(r'\s*<link rel="stylesheet" href="(?:styles|multi-client)\.css">', "", html)
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


def confirm_checkpoint(page):
    page.locator("#checkpointDialog").wait_for(state="visible")
    page.locator('#checkpointDialog button[value="confirm"]').click()
    page.locator("#checkpointDialog").wait_for(state="hidden", timeout=12000)
    page.locator(".receipt-strip").wait_for(timeout=12000)


def run():
    health = read_json_url("/api/health")
    assert health["ok"] is True
    checks = ["health"]
    with sync_playwright() as p:
        launch = {"headless": True, "args": ["--no-sandbox", "--disable-web-security"]}
        chromium_path = os.getenv("ICTC_CHROMIUM_PATH") or shutil.which("chromium") or shutil.which("chromium-browser")
        if chromium_path:
            launch["executable_path"] = chromium_path
        browser = p.chromium.launch(**launch)
        page = browser.new_page(viewport={"width": 1440, "height": 980}, device_scale_factor=1)
        page.set_default_timeout(10000)
        runtime_mode = "runtime-live-origin"
        try:
            page.goto(BASE_URL + "/", wait_until="networkidle")
        except PlaywrightError as error:
            if "ERR_BLOCKED_BY_ADMINISTRATOR" not in str(error):
                raise
            runtime_mode = "runtime-live-api-bridge"
            page.close()
            page = browser.new_page(viewport={"width": 1440, "height": 980}, device_scale_factor=1)
            page.set_default_timeout(10000)
            contract = json.loads((ROOT / "v3" / "public" / "core-workspaces.json").read_text(encoding="utf-8"))
            page.set_content(inline_html(), wait_until="domcontentloaded")
            install_fetch_bridge(page, contract)
            page.add_script_tag(content=bundle_modules())

        page.get_by_role("heading", name="Monitoraggio").wait_for()
        assert page.locator("#actorSelect").count() == 1
        assert page.locator("#tenantSelect").count() == 1
        assert page.locator('[data-mode="monitoring"]').get_attribute("aria-current") == "page"
        checks.append("tenant-and-actor-entry")
        print("browser-step: tenant-and-actor-entry", flush=True)

        page.get_by_role("button", name="Aggiungi contenuto").click()
        page.locator("#sourceDialog").wait_for(state="visible")
        page.locator("#sourceName").fill("Nota browser multi-cliente")
        page.locator("#sourceText").fill("Contenuto osservato dal browser; richiede review e non determina applicabilità.")
        page.locator("#sourceForm button[type=submit]").click()
        confirm_checkpoint(page)
        page.get_by_role("button", name="Nota browser multi-cliente").wait_for()
        checks.append("tenant-scoped-source-write")
        print("browser-step: tenant-scoped-source-write", flush=True)

        page.locator("#primaryTaskAction").click()
        page.locator("#choiceDialog").wait_for(state="visible")
        page.locator("#choiceForm button[type=submit]").click()
        confirm_checkpoint(page)
        checks.append("review-write")
        print("browser-step: review-write", flush=True)

        monitoring_shot = SCREENSHOTS / "core-monitoring-runtime.png"
        page.screenshot(path=str(monitoring_shot), full_page=True)
        checks.append("monitoring-screenshot")
        print("browser-step: monitoring-screenshot", flush=True)

        page.locator("#tenantSelect").select_option("tenant-demo-public")
        page.locator("#tenantSelect").wait_for(); assert page.locator("#tenantSelect").input_value() == "tenant-demo-public"
        assert page.get_by_text("Nota browser multi-cliente").count() == 0
        checks.append("ui-tenant-isolation")
        print("browser-step: ui-tenant-isolation", flush=True)

        page.locator('[data-mode="incidents"]').click()
        page.get_by_role("heading", name="Incidenti").wait_for()
        page.get_by_role("button", name="Segnala").click()
        page.locator("#matterDialog").wait_for(state="visible")
        page.locator("#matterName").fill("Accesso anomalo browser")
        page.locator("#matterKind").select_option("incident")
        page.locator("#matterSummary").fill("Accesso anomalo osservato nel tenant pubblico; impatto ancora da qualificare.")
        page.locator("#matterForm button[type=submit]").click()
        confirm_checkpoint(page)
        page.locator(".case-table [data-open-object]", has_text="Accesso anomalo browser").wait_for()
        checks.append("tenant-scoped-incident-write")
        print("browser-step: tenant-scoped-incident-write", flush=True)

        page.locator("#actorSelect").select_option("local-viewer")
        page.locator("#runtimeState").get_by_text("Lettore").wait_for()
        assert page.locator("#primaryTaskAction").is_disabled()
        assert page.locator("#primaryTaskAction").inner_text() == "Solo lettura"
        checks.append("permission-aware-ui")
        print("browser-step: permission-aware-ui", flush=True)

        page.locator("#actorSelect").select_option("local-owner")
        page.locator("#tenantSelect").select_option("tenant-demo-public")
        page.locator("#tenantSelect").wait_for(); assert page.locator("#tenantSelect").input_value() == "tenant-demo-public"
        assert not page.locator("#primaryTaskAction").is_disabled()
        page.locator("#primaryTaskAction").click()
        confirm_checkpoint(page)
        checks.append("owner-case-action")
        print("browser-step: owner-case-action", flush=True)

        incidents_shot = SCREENSHOTS / "core-incidents-runtime.png"
        page.screenshot(path=str(incidents_shot), full_page=True)
        checks.append("incident-screenshot")
        print("browser-step: incident-screenshot", flush=True)

        page.locator("#comfortOpen").click()
        page.locator("#textScale").select_option("large")
        page.locator('#comfortDialog button[value="save"]').click()
        page.locator('html[data-text="large"]').wait_for()
        checks.append("local-reading-preference")
        print("browser-step: local-reading-preference", flush=True)

        page.keyboard.press("Control+K")
        page.locator("#searchDialog").wait_for(state="visible")
        page.locator("#searchInput").fill("Accesso anomalo")
        page.locator(".search-result").first.wait_for()
        page.locator('[data-dialog-close="searchDialog"]').click()
        checks.append("keyboard-search")
        print("browser-step: keyboard-search", flush=True)
        browser.close()

    screenshots = []
    for path in [monitoring_shot, incidents_shot]:
        assert path.stat().st_size > 20_000
        screenshots.append({"path": str(path.relative_to(ROOT)), "bytes": path.stat().st_size, "sha256": sha256(path)})

    report = {
        "schemaVersion": "3.1.0",
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "result": "passed",
        "mode": runtime_mode,
        "baseUrl": BASE_URL,
        "checks": checks,
        "runtime": {"version": health["version"], "readiness": health["readiness"], "monitoring": health.get("monitoring")},
        "screenshots": screenshots,
        "limitations": [
            "Le identità locali sono una directory dimostrativa, non autenticazione.",
            "Il browser prova isolamento e permission-aware UI su due tenant sintetici.",
            "Restano necessari test con utenti e tecnologie assistive reali."
        ]
    }
    ARTIFACTS.mkdir(exist_ok=True)
    (ARTIFACTS / "journey-browser-check.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"core-ui-browser: ok ({len(checks)} checks, {len(screenshots)} screenshots, 2 tenants)")


if __name__ == "__main__":
    run()
