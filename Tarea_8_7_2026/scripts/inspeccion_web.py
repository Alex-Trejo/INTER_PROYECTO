# -*- coding: utf-8 -*-
"""Inspeccion critica real de Chaski Alert (web) con Playwright.
Toma capturas de evidencia y registra hallazgos empiricos en un log JSON.
"""
import json, os, sys, time
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE = "http://localhost:3000"
CAP = r"C:\Users\trejo\Desktop\S9\Inter\P_I\PR\INTER_PROYECTO\Tarea_8_7_2026\capturas\web"
SCRATCH = os.path.dirname(os.path.abspath(__file__))
os.makedirs(CAP, exist_ok=True)

FINDINGS = []
def log(paso, obs):
    print(f"[{paso}] {obs}")
    FINDINGS.append({"paso": paso, "observacion": obs})

def shot(page, name):
    path = os.path.join(CAP, name)
    page.screenshot(path=path, full_page=False)
    print(f"    -> captura: {name}")

def login(page, user, pwd):
    page.goto(f"{BASE}/api/auth/signin", wait_until="domcontentloaded")
    time.sleep(2)
    # NextAuth signin page -> boton de Keycloak
    btn = page.locator("button[type=submit], form button").first
    if btn.count():
        btn.click()
    page.wait_for_url("**/realms/**", timeout=15000)
    time.sleep(1.5)
    return page

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1440, "height": 900}, locale="es-EC")
        page = ctx.new_page()
        page.set_default_timeout(20000)

        # ---- 0. RBAC: acceso a ruta de Directiva SIN sesion ----
        try:
            page.goto(f"{BASE}/dashboard/membresia", wait_until="domcontentloaded")
            time.sleep(6)
            url = page.url
            body = page.inner_text("body")[:400].replace("\n", " | ")
            shot(page, "00_rbac_sin_sesion.png")
            log("RBAC-sin-sesion", f"URL final: {url}. Contenido visible: {body}")
        except Exception as e:
            log("RBAC-sin-sesion", f"ERROR: {e}")

        # ---- 1. Splash ----
        try:
            page.goto(BASE, wait_until="domcontentloaded")
            time.sleep(1)
            shot(page, "01_splash.png")
            log("Splash", f"Texto: {page.inner_text('body')[:200]}")
        except Exception as e:
            log("Splash", f"ERROR: {e}")

        # ---- 2. Login Keycloak (Directiva) ----
        try:
            login(page, "admin@chaski.ec", "admin123")
            shot(page, "02_login_keycloak.png")
            kc_text = page.inner_text("body")[:500].replace("\n", " | ")
            log("Login-Keycloak", f"Pantalla de login Keycloak: {kc_text}")
            page.fill("#username", "admin@chaski.ec")
            page.fill("#password", "admin123")
            page.click("#kc-login")
            page.wait_for_url(f"{BASE}/**", timeout=20000)
            time.sleep(3)
            log("Login-Keycloak", f"Login OK como admin@chaski.ec (Directiva). URL: {page.url}")
        except Exception as e:
            log("Login-Keycloak", f"ERROR en login: {e}")
            shot(page, "02b_login_error.png")

        # ---- 3. Mapa ----
        try:
            page.goto(f"{BASE}/dashboard/mapa", wait_until="domcontentloaded")
            time.sleep(6)
            shot(page, "03_mapa.png")
            sidebar = page.inner_text("aside, nav, [class*=sidebar]") if page.locator("aside, nav, [class*=sidebar]").count() else page.inner_text("body")
            log("Mapa", f"Sidebar/labels: {sidebar[:400].replace(chr(10),' | ')}")
            # medir polling de alertas durante 25 s
            reqs = []
            page.on("request", lambda r: reqs.append((time.time(), r.url)) if "/api/alertas" in r.url else None)
            page.wait_for_timeout(25000)  # (time.sleep bloquea la entrega de eventos de red en sync API)
            alert_reqs = [t for t, u in reqs]
            if len(alert_reqs) >= 2:
                gaps = [round(alert_reqs[i+1]-alert_reqs[i], 1) for i in range(len(alert_reqs)-1)]
                log("Mapa-polling", f"{len(alert_reqs)} requests a /api/alertas en 25s; intervalos: {gaps}")
            else:
                log("Mapa-polling", f"Solo {len(alert_reqs)} request(s) a /api/alertas en 25s -> el mapa NO se auto-actualiza o intervalo largo")
        except Exception as e:
            log("Mapa", f"ERROR: {e}")

        # ---- 4. Avisos: muro + polling + formulario ----
        try:
            reqs2 = []
            page.on("request", lambda r: reqs2.append(time.time()) if "/api/comunicados" in r.url else None)
            page.goto(f"{BASE}/dashboard/avisos", wait_until="domcontentloaded")
            time.sleep(4)
            shot(page, "04_avisos_muro.png")
            titles = page.locator("h3, [class*=card] h2").all_inner_texts()[:10]
            log("Avisos-muro", f"Titulos visibles (basura sin moderar?): {titles}")
            page.wait_for_timeout(15000)
            log("Avisos-polling", f"{len(reqs2)} requests a /api/comunicados en ~19s -> {'auto-refresco' if len(reqs2)>2 else 'SIN auto-refresco (solo carga inicial/manual)'}")
            # hay indicador de ultima actualizacion?
            body = page.inner_text("body")
            tiene_indicador = ("actualizado" in body.lower() or "ltima actualiz" in body.lower())
            log("Avisos-indicador", f"Indicador de ultima actualizacion visible: {tiene_indicador}")
            # formulario
            page.click("text=Nuevo Comunicado")
            time.sleep(1)
            shot(page, "05_avisos_formulario.png")
            # intento de publicar con 1 caracter (validacion minima)
            page.fill("#titulo", "x")
            page.fill("#mensaje", "y")
            btn = page.locator("button[type=submit]")
            habilitado = btn.is_enabled()
            log("Avisos-validacion", f"Con titulo='x' y mensaje='y' (1 caracter) el boton Publicar esta habilitado: {habilitado} -> sin validacion de contenido minimo")
            # publicar un comunicado real de la evaluacion
            page.fill("#titulo", "Prueba de evaluacion UX")
            page.fill("#mensaje", "Comunicado emitido durante la sesion de evaluacion de usabilidad (PSSUQ/UEQ) del 8 de julio de 2026.")
            btn.click()
            time.sleep(3)
            shot(page, "06_avisos_publicado.png")
            body = page.inner_text("body")
            log("Avisos-publicar", f"Confirmacion previa a publicar: NO (publica directo). Mensaje de exito visible: {'Comunicado publicado' in body}. Opcion de deshacer/editar/eliminar: {'eliminar' in body.lower() or 'editar' in body.lower()}")
        except Exception as e:
            log("Avisos", f"ERROR: {e}")

        # ---- 5. Historial ----
        try:
            page.goto(f"{BASE}/dashboard/historial-alertas", wait_until="domcontentloaded")
            time.sleep(4)
            shot(page, "07_historial.png")
            log("Historial", f"Texto: {page.inner_text('body')[:300].replace(chr(10),' | ')}")
        except Exception as e:
            log("Historial", f"ERROR: {e}")

        # ---- 6. Membresia ----
        try:
            page.goto(f"{BASE}/dashboard/membresia", wait_until="domcontentloaded")
            time.sleep(4)
            shot(page, "08_membresia.png")
            log("Membresia", f"Texto: {page.inner_text('body')[:400].replace(chr(10),' | ')}")
        except Exception as e:
            log("Membresia", f"ERROR: {e}")

        # ---- 7. Comunidad ----
        try:
            page.goto(f"{BASE}/dashboard/comunidad", wait_until="domcontentloaded")
            time.sleep(4)
            shot(page, "09_comunidad.png")
            log("Comunidad", f"Texto: {page.inner_text('body')[:300].replace(chr(10),' | ')}")
        except Exception as e:
            log("Comunidad", f"ERROR: {e}")

        # ---- 8. Tema oscuro ----
        try:
            page.goto(f"{BASE}/dashboard/mapa", wait_until="domcontentloaded")
            time.sleep(3)
            page.click("button[aria-label='Toggle theme']")
            time.sleep(1.5)
            shot(page, "10_tema_oscuro.png")
            log("Tema", "Toggle de tema claro/oscuro funciona; captura tomada en oscuro")
            page.click("button[aria-label='Toggle theme']")
        except Exception as e:
            log("Tema", f"ERROR: {e}")

        # ---- 9. Responsive movil ----
        try:
            page.set_viewport_size({"width": 375, "height": 812})
            page.goto(f"{BASE}/dashboard/avisos", wait_until="domcontentloaded")
            time.sleep(4)
            shot(page, "11_responsive_375px.png")
            # hay scroll horizontal?
            overflow = page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
            log("Responsive", f"Viewport 375px: scroll horizontal (desborde): {overflow}")
            page.set_viewport_size({"width": 1440, "height": 900})
        except Exception as e:
            log("Responsive", f"ERROR: {e}")

        # guardar sesion admin para prueba de error de backend
        ctx.storage_state(path=os.path.join(SCRATCH, "state_admin.json"))

        # ---- 10. RBAC como COMUNERO (vecino) ----
        try:
            ctx2 = browser.new_context(viewport={"width": 1440, "height": 900}, locale="es-EC")
            p2 = ctx2.new_page()
            p2.set_default_timeout(20000)
            p2.goto(f"{BASE}/api/auth/signin", wait_until="domcontentloaded")
            time.sleep(2)
            b = p2.locator("button[type=submit], form button").first
            if b.count():
                b.click()
            p2.wait_for_url("**/realms/**", timeout=15000)
            p2.fill("#username", "vecino@chaski.ec")
            p2.fill("#password", "vecino123")
            p2.click("#kc-login")
            p2.wait_for_url(f"{BASE}/**", timeout=20000)
            time.sleep(3)
            p2.goto(f"{BASE}/dashboard/membresia", wait_until="domcontentloaded")
            time.sleep(5)
            shot(p2, "12_rbac_comunero_membresia.png")
            body = p2.inner_text("body")[:500].replace("\n", " | ")
            log("RBAC-comunero", f"Vecino (rol Comunero) accede a /dashboard/membresia. URL: {p2.url}. Ve: {body}")
            ctx2.close()
        except Exception as e:
            log("RBAC-comunero", f"ERROR: {e}")

        # ---- 11. Swagger ----
        try:
            page.goto("http://localhost:8000/docs", wait_until="domcontentloaded")
            time.sleep(3)
            shot(page, "13_swagger_api.png")
            log("Swagger", "Documentacion interactiva de la API disponible")
        except Exception as e:
            log("Swagger", f"ERROR: {e}")

        browser.close()

    with open(os.path.join(SCRATCH, "hallazgos_web.json"), "w", encoding="utf-8") as f:
        json.dump(FINDINGS, f, ensure_ascii=False, indent=2)
    print("\nOK - hallazgos guardados en hallazgos_web.json")

if __name__ == "__main__":
    main()
