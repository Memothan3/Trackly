@echo off
echo ========================================
echo   Trackly - Stopping Servers
echo ========================================
echo.
echo Stopping Python HTTP server...
taskkill /FI "WINDOWTITLE eq Trackly Server*" /F >nul 2>&1
echo.
echo Stopping ngrok tunnel...
taskkill /IM ngrok.exe /F >nul 2>&1
echo.
echo ========================================
echo   All servers stopped!
echo ========================================
echo.
pause
