# -*- coding: utf-8 -*-
"""Fase 2 — textos bilingues Espanol/Kichwa en el login de Keycloak (P01).

Usa las traducciones propias del realm (Realm overrides), por lo que NO hace
falta un tema personalizado ni reiniciar el contenedor.
"""
import sys, json, urllib.request, urllib.parse

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
KC = "http://localhost:8080"
REALM = "chaski-realm"
LOCALE = "es"

# Clave de mensaje de Keycloak -> texto bilingue (con acentos y ene)
TEXTOS = {
    "loginAccountTitle": "Yaykuna / Iniciar Sesión",
    "email": "Correo electrónico",
    "password": "Contraseña / Yaykuna Rimay",
    "doLogIn": "Ingresar / Yaykuy",
    "rememberMe": "Recordarme en este teléfono",
    "doForgotPassword": "Olvidé mi contraseña",
    "noAccount": "¿Eres nuevo en la comunidad?",
    "doRegister": "Regístrate / Killkay",
    "invalidUserMessage": "Correo o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo.",
    "missingPasswordMessage": "Escribe tu contraseña.",
    "missingUsernameMessage": "Escribe tu correo electrónico.",
    "accountDisabledMessage": "Tu cuenta está desactivada. Comunícate con la directiva de la comunidad.",
}


def post_form(url, data):
    body = urllib.parse.urlencode(data).encode()
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    return json.load(urllib.request.urlopen(req))


def api(path, token, method="GET", payload=None, ctype="application/json"):
    req = urllib.request.Request(f"{KC}{path}", method=method)
    req.add_header("Authorization", f"Bearer {token}")
    if payload is not None:
        req.add_header("Content-Type", ctype)
        req.data = payload if isinstance(payload, bytes) else json.dumps(payload).encode()
    raw = urllib.request.urlopen(req).read()
    return json.loads(raw) if raw else None


tok = post_form(
    f"{KC}/realms/master/protocol/openid-connect/token",
    {"client_id": "admin-cli", "grant_type": "password",
     "username": "alextesis90@gmail.com", "password": "admin"},
)["access_token"]

for clave, texto in TEXTOS.items():
    api(f"/admin/realms/{REALM}/localization/{LOCALE}/{clave}", tok,
        method="PUT", payload=texto.encode("utf-8"), ctype="text/plain")
    print(f"  {clave:22} -> {texto}")

guardados = api(f"/admin/realms/{REALM}/localization/{LOCALE}", tok)
print(f"\nTraducciones propias guardadas en el realm: {len(guardados)}")
