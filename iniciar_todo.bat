@echo off
REM ═══════════════════════════════════════════════════
REM  CHASKI ALERTA — Levantar Todos los Servicios
REM  Ejecutar desde: INTER_PROYECTO\
REM ═══════════════════════════════════════════════════

echo.
echo  ╔═══════════════════════════════════════════════╗
echo  ║     CHASKI ALERTA — Iniciando Servicios       ║
echo  ╚═══════════════════════════════════════════════╝
echo.

REM ── Prerequisitos ──────────────────────────────────
echo [INFO] Verificando prerequisitos...

REM Verificar Docker
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Desktop NO esta corriendo. Abrelo primero.
    pause
    exit /b 1
)
echo   [OK] Docker Desktop corriendo

REM Verificar Python venv
if not exist "Backend\venv\Scripts\python.exe" (
    echo [ERROR] No existe Backend\venv. Ejecuta: cd Backend ^&^& python -m venv venv ^&^& .\venv\Scripts\pip install -r requirements.txt
    pause
    exit /b 1
)
echo   [OK] Python venv encontrado

REM Verificar node_modules del frontend web
if not exist "Frontend\cliente_web\node_modules" (
    echo [ERROR] No existe Frontend\cliente_web\node_modules. Ejecuta: cd Frontend\cliente_web ^&^& npm install
    pause
    exit /b 1
)
echo   [OK] Frontend Web node_modules encontrado

REM Verificar node_modules del cliente movil
if not exist "Frontend\cliente_movil\node_modules" (
    echo [ERROR] No existe Frontend\cliente_movil\node_modules. Ejecuta: cd Frontend\cliente_movil ^&^& npm install
    pause
    exit /b 1
)
echo   [OK] Cliente Movil node_modules encontrado

echo.
echo ── 1/5 Levantando Docker PostGIS (puerto 5433)...
start "CHASKI - Docker PostGIS" cmd /k "cd /d %~dp0 && docker-compose up && pause"
timeout /t 5 /nobreak >nul

echo ── 2/5 Levantando Backend FastAPI (puerto 8000)...
start "CHASKI - Backend FastAPI" cmd /k "cd /d %~dp0Backend && .\venv\Scripts\activate && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3 /nobreak >nul

echo ── 3/5 Levantando Frontend Web (puerto 3000)...
start "CHASKI - Frontend Web" cmd /k "cd /d %~dp0Frontend\cliente_web && npm run dev"
timeout /t 3 /nobreak >nul

echo ── 4/5 Configurando ADB reverse (USB)...
set ADB_PATH=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe
if exist "%ADB_PATH%" (
    "%ADB_PATH%" devices | findstr "device" >nul 2>&1
    if not errorlevel 1 (
        "%ADB_PATH%" reverse tcp:8081 tcp:8081 >nul 2>&1
        "%ADB_PATH%" reverse tcp:8000 tcp:8000 >nul 2>&1
        echo   [OK] ADB reverse configurado (puertos 8081 y 8000)
    ) else (
        echo   [AVISO] No se detecto telefono por USB. Conectalo y ejecuta:
        echo           adb reverse tcp:8081 tcp:8081
        echo           adb reverse tcp:8000 tcp:8000
    )
) else (
    echo   [AVISO] ADB no encontrado. Para movil, instala Android SDK Platform Tools.
)

echo ── 5/5 Levantando Expo Mobile (puerto 8081)...
start "CHASKI - Expo Mobile" cmd /k "cd /d %~dp0Frontend\cliente_movil && npx expo start --clear"
timeout /t 5 /nobreak >nul

echo.
echo  ╔═══════════════════════════════════════════════╗
echo  ║       TODOS LOS SERVICIOS INICIADOS           ║
echo  ╠═══════════════════════════════════════════════╣
echo  ║  Docker PostGIS .... http://localhost:5433    ║
echo  ║  Backend FastAPI ... http://localhost:8000    ║
echo  ║  Swagger Docs ...... http://localhost:8000/docs║
echo  ║  Frontend Web ...... http://localhost:3000    ║
echo  ║  Expo Mobile ....... http://localhost:8081    ║
echo  ╠═══════════════════════════════════════════════╣
echo  ║  MOVIL: En la terminal de Expo, presiona 'a' ║
echo  ║  para abrir en tu Android conectado por USB   ║
echo  ╚═══════════════════════════════════════════════╝
echo.
pause
