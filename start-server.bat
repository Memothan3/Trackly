@echo off
echo ========================================
echo   Trackly - Starting Local Server
echo ========================================
echo.
echo Killing any existing processes...
taskkill /f /im ngrok.exe >nul 2>&1
taskkill /f /im python.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo.
echo Starting Python HTTP server on port 8000...
echo.
start "Trackly Server" python -m http.server 8000
timeout /t 3 /nobreak >nul
echo.
echo Server started! Opening ngrok tunnel...
echo.
echo Your Trackly app will be available at:
echo https://[random-url].ngrok-free.dev
echo.
ngrok http 8000
