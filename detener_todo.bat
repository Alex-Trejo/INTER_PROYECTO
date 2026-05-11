@echo off
REM ═══════════════════════════════════════════════════
REM  CHASKI ALERTA — Detener Todos los Servicios
REM ═══════════════════════════════════════════════════

echo.
echo  ╔═══════════════════════════════════════════════╗
echo  ║     CHASKI ALERTA — Deteniendo Servicios      ║
echo  ╚═══════════════════════════════════════════════╝
echo.

echo ── 1/4 Deteniendo Expo Mobile...
taskkill /FI "WINDOWTITLE eq CHASKI - Expo Mobile*" /F >nul 2>&1
echo   [OK] Expo detenido

echo ── 2/4 Deteniendo Frontend Web...
taskkill /FI "WINDOWTITLE eq CHASKI - Frontend Web*" /F >nul 2>&1
echo   [OK] Frontend detenido

echo ── 3/4 Deteniendo Backend FastAPI...
taskkill /FI "WINDOWTITLE eq CHASKI - Backend FastAPI*" /F >nul 2>&1
echo   [OK] Backend detenido

echo ── 4/4 Deteniendo Docker PostGIS...
cd /d %~dp0
docker-compose down >nul 2>&1
taskkill /FI "WINDOWTITLE eq CHASKI - Docker PostGIS*" /F >nul 2>&1
echo   [OK] Docker detenido

REM Limpiar ADB reverse
set ADB_PATH=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe
if exist "%ADB_PATH%" (
    "%ADB_PATH%" reverse --remove-all >nul 2>&1
    echo   [OK] ADB reverse limpiado
)

echo.
echo  ╔═══════════════════════════════════════════════╗
echo  ║       TODOS LOS SERVICIOS DETENIDOS           ║
echo  ╚═══════════════════════════════════════════════╝
echo.
pause
