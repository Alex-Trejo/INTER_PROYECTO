@echo off
REM ═══════════════════════════════════════════════════
REM Script Integrado para compilar nativamente en Windows
REM VERSIÓN RELEASE (APK Offline e Independiente)
REM ═══════════════════════════════════════════════════

set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
set PATH=%ANDROID_HOME%\platform-tools;%PATH%

echo [INFO] Creando unidad virtual Z: apuntando a la raiz del proyecto...
subst Z: /D >nul 2>&1
subst Z: "%~dp0..\.."

echo [INFO] Navegando a Z:\Frontend\cliente_movil
Z:
cd Frontend\cliente_movil

echo [INFO] Re-enlazando dependencias para el entorno Z:...
call npm install --force

echo [INFO] Limpiando cache previa...
rmdir /S /Q android\.cxx >nul 2>&1
rmdir /S /Q android\app\build >nul 2>&1

echo [INFO] Compilando APK MODO RELEASE (Offline)...
call npx expo run:android --variant release

echo [INFO] Finalizando y desmontando Z:...
C:
cd "%~dp0"
subst Z: /D
echo [EXITO] APK Release Generado. Revisa la app en tu telefono (ya no requiere Metro).
