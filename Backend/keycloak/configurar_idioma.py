# -*- coding: utf-8 -*-
"""Fase 2 — activa el idioma espanol en el login de Keycloak (P01)."""
import sys, json, urllib.request, urllib.parse

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
KC = "http://localhost:8080"
REALM = "chaski-realm"


def post_form(url, data):
    body = urllib.parse.urlencode(data).encode()
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    return json.load(urllib.request.urlopen(req))


def api(path, token, method="GET", payload=None):
    req = urllib.request.Request(f"{KC}{path}", method=method)
    req.add_header("Authorization", f"Bearer {token}")
    if payload is not None:
        req.add_header("Content-Type", "application/json")
        req.data = json.dumps(payload).encode()
    resp = urllib.request.urlopen(req)
    raw = resp.read()
    return json.loads(raw) if raw else None


tok = post_form(
    f"{KC}/realms/master/protocol/openid-connect/token",
    {"client_id": "admin-cli", "grant_type": "password",
     "username": "alextesis90@gmail.com", "password": "admin"},
)["access_token"]

realm = api(f"/admin/realms/{REALM}", tok)
print("ANTES  -> i18n:", realm.get("internationalizationEnabled"),
      "| locale:", realm.get("defaultLocale"),
      "| soportados:", realm.get("supportedLocales"))

realm["internationalizationEnabled"] = True
realm["defaultLocale"] = "es"
realm["supportedLocales"] = ["es", "en"]

api(f"/admin/realms/{REALM}", tok, method="PUT", payload=realm)

check = api(f"/admin/realms/{REALM}", tok)
print("DESPUES-> i18n:", check.get("internationalizationEnabled"),
      "| locale:", check.get("defaultLocale"),
      "| soportados:", check.get("supportedLocales"))
