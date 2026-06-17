subst Z: /D >nul 2>&1
subst Z: "%~dp0Frontend\cliente_movil"
Z:
cd android
call gradlew assembleDebug
