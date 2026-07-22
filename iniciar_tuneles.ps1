# ═══════════════════════════════════════════════════════════════
#  CHASKI ALERT — Publicar el sistema en internet
#
#  Regla de negocio:
#    1. Se crean los 3 tuneles por separado (API, Keycloak, Panel web)
#    2. Se capturan las URLs HTTPS que devuelve Cloudflare
#    3. Se escriben en el .env de cada servicio
#    4. Se arranca todo
#
#  Uso:  .\iniciar_tuneles.ps1
# ═══════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"
$RAIZ = $PSScriptRoot
$CF   = "C:\Program Files (x86)\cloudflared\cloudflared.exe"

if (-not (Test-Path $CF)) {
    Write-Host "ERROR: no se encontro cloudflared en $CF" -ForegroundColor Red
    Write-Host "Instalalo con:  winget install --id Cloudflare.cloudflared" -ForegroundColor Yellow
    exit 1
}

function Escribir($texto, $color = "White") { Write-Host $texto -ForegroundColor $color }

Escribir ""
Escribir "===============================================" Cyan
Escribir "  CHASKI ALERT - Publicacion en internet" Cyan
Escribir "===============================================" Cyan
Escribir ""

# ── PASO 0: cerrar tuneles anteriores ──────────────────────────
$previos = Get-Process cloudflared -ErrorAction SilentlyContinue
if ($previos) {
    Escribir "[0/4] Cerrando $($previos.Count) tunel(es) anterior(es)..." DarkGray
    $previos | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# ── PASO 1: crear los 3 tuneles ────────────────────────────────
function Nuevo-Tunel {
    param([int]$Puerto, [string]$Nombre)

    $log = Join-Path $env:TEMP "chaski_tunel_$Nombre.log"
    Remove-Item $log, "$log.out" -ErrorAction SilentlyContinue

    Start-Process -FilePath $CF `
        -ArgumentList "tunnel", "--url", "http://localhost:$Puerto", "--no-autoupdate" `
        -RedirectStandardError $log -RedirectStandardOutput "$log.out" `
        -WindowStyle Hidden | Out-Null

    # Cloudflare tarda unos segundos en asignar el subdominio
    for ($i = 0; $i -lt 45; $i++) {
        Start-Sleep -Seconds 2
        if (Test-Path $log) {
            $encontrada = Select-String -Path $log -Pattern "https://[a-z0-9-]+\.trycloudflare\.com" -ErrorAction SilentlyContinue |
                          Select-Object -First 1
            if ($encontrada) { return $encontrada.Matches[0].Value }
        }
    }
    throw "No se obtuvo la URL del tunel de $Nombre (puerto $Puerto). Revisa $log"
}

Escribir "[1/4] Creando los tuneles (puede tardar ~30 s)..." Yellow

$T_API = Nuevo-Tunel -Puerto 8000 -Nombre "api"
Escribir "      API      -> $T_API" Green

$T_KC  = Nuevo-Tunel -Puerto 8080 -Nombre "keycloak"
Escribir "      Keycloak -> $T_KC" Green

$T_WEB = Nuevo-Tunel -Puerto 3000 -Nombre "web"
Escribir "      Panel    -> $T_WEB" Green

$KC_REALM = "$T_KC/realms/chaski-realm"

# ── PASO 2: escribir las URLs en cada .env ─────────────────────
Escribir ""
Escribir "[2/4] Actualizando los archivos .env..." Yellow

function Set-Variable-Env {
    param([string]$Ruta, [hashtable]$Valores)

    if (-not (Test-Path $Ruta)) { Escribir "      AVISO: no existe $Ruta" Red; return }
    $lineas = Get-Content $Ruta -Encoding UTF8

    foreach ($clave in $Valores.Keys) {
        $valor = $Valores[$clave]
        $existe = $false
        $lineas = $lineas | ForEach-Object {
            if ($_ -match "^\s*$([regex]::Escape($clave))\s*=") { $existe = $true; "$clave=$valor" }
            else { $_ }
        }
        if (-not $existe) { $lineas += "$clave=$valor" }
    }
    Set-Content -Path $Ruta -Value $lineas -Encoding UTF8
    Escribir "      $(Split-Path $Ruta -Leaf) actualizado ($($Valores.Count) variables)" Green
}

# Cliente movil (Expo)
Set-Variable-Env -Ruta "$RAIZ\Frontend\cliente_movil\.env" -Valores @{
    "EXPO_PUBLIC_API_URL"      = $T_API
    "EXPO_PUBLIC_KEYCLOAK_URL" = $KC_REALM
}

# Panel web (Next.js)
Set-Variable-Env -Ruta "$RAIZ\Frontend\cliente_web\.env.local" -Valores @{
    "NEXT_PUBLIC_API_URL" = $T_API
    "NEXTAUTH_URL"        = $T_WEB
    "KEYCLOAK_ISSUER"     = $KC_REALM
}

# El backend NO cambia: consulta Keycloak en localhost para las claves
# publicas y acepta igualmente los tokens emitidos por la URL publica.

# ── PASO 3: permitir el panel web en Keycloak ──────────────────
Escribir ""
Escribir "[3/4] Autorizando el panel web en Keycloak..." Yellow

try {
    $tok = (Invoke-RestMethod -Method Post -Uri "http://localhost:8080/realms/master/protocol/openid-connect/token" `
            -Body @{ client_id = "admin-cli"; grant_type = "password"; username = "alextesis90@gmail.com"; password = "admin" }).access_token

    $cab = @{ Authorization = "Bearer $tok" }
    $cliente = (Invoke-RestMethod -Uri "http://localhost:8080/admin/realms/chaski-realm/clients?clientId=web-admin" -Headers $cab)[0]

    $cliente.redirectUris = @("http://localhost:3000/*", "$T_WEB/*")
    $cliente.webOrigins   = @("http://localhost:3000", $T_WEB)

    Invoke-RestMethod -Method Put -Uri "http://localhost:8080/admin/realms/chaski-realm/clients/$($cliente.id)" `
        -Headers $cab -ContentType "application/json" -Body ($cliente | ConvertTo-Json -Depth 10) | Out-Null

    Escribir "      redirectUris del panel actualizados" Green
}
catch {
    Escribir "      AVISO: no se pudo actualizar Keycloak. Esta levantado? (docker-compose up -d)" Red
    Escribir "      Detalle: $($_.Exception.Message)" DarkGray
}

# ── PASO 4: resumen ────────────────────────────────────────────
$resumen = @"
===============================================
  TUNELES ACTIVOS
===============================================

  Panel web (Directiva) : $T_WEB
  API (backend)         : $T_API
  Keycloak (login)      : $T_KC

  Guardado en:
    Frontend/cliente_movil/.env      (EXPO_PUBLIC_*)
    Frontend/cliente_web/.env.local  (NEXT_PUBLIC_*, NEXTAUTH_URL, KEYCLOAK_ISSUER)

===============================================
  AHORA ARRANCA LOS SERVICIOS
===============================================

  1. Base de datos y Keycloak (si no estan):
       docker-compose up -d

  2. Backend:
       cd Backend
       .\venv\Scripts\Activate.ps1
       python -m uvicorn main:app --host 0.0.0.0 --port 8000

  3. Panel web (lee el .env.local al arrancar, por eso va despues):
       cd Frontend\cliente_web
       npm run dev

  4. App movil (hay que RECOMPILAR: las EXPO_PUBLIC_* se
     incrustan en el APK):
       Z:
       cd Z:\Frontend\cliente_movil
       npx expo run:android

  IMPORTANTE
   - Esta ventana SI puedes cerrarla: los tuneles corren aparte, en
     segundo plano, y siguen vivos.
   - Lo que NO puedes hacer es apagar o suspender la laptop: es el
     servidor. Si se apaga, el sistema deja de responder desde fuera.
   - Para detener los tuneles:
       Get-Process cloudflared | Stop-Process -Force
   - Si vuelves a ejecutar este script, las URLs CAMBIAN y hay que
     reiniciar el panel web y recompilar la app movil.
"@

Escribir ""
Escribir $resumen Cyan

# Deja constancia de las URLs de esta sesion
$resumen | Out-File -FilePath "$RAIZ\tuneles_activos.txt" -Encoding UTF8
Escribir "Resumen guardado en tuneles_activos.txt" DarkGray
Escribir ""
