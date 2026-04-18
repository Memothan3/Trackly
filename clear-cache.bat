@echo off
echo ========================================
echo   TRACKLY - NUCLEAR CACHE CLEAR v2.1.0
echo ========================================
echo.
echo Killing all processes...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im ngrok.exe >nul 2>&1
taskkill /f /im chrome.exe >nul 2>&1
taskkill /f /im msedge.exe >nul 2>&1
taskkill /f /im firefox.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo.
echo Clearing Windows DNS cache...
ipconfig /flushdns >nul 2>&1
echo.
echo Starting fresh servers...
start "Trackly Server" python -m http.server 8000
timeout /t 4 /nobreak >nul
echo.
echo Starting ngrok tunnel...
start "Ngrok Tunnel" ngrok http 8000
timeout /t 6 /nobreak >nul
echo.
echo ========================================
echo   CACHE COMPLETELY CLEARED! v2.1.0
echo ========================================
echo.
echo 🔥 CRITICAL: Do these steps NOW:
echo.
echo 1. Close ALL browser windows
echo 2. Reopen browser COMPLETELY
echo 3. Press Ctrl+Shift+Delete
echo 4. Clear "Cached images and files" + "Cookies"
echo 5. Visit: http://localhost:8000/trackly_dashboard.html
echo 6. Press F12, go to Application tab
echo 7. Click "Clear storage" button
echo 8. Hard refresh: Ctrl+Shift+R
echo 9. Test popup: Open console, type: testFileViewer()
echo.
echo 🧪 TEST COMMANDS:
echo   testFileViewer() - Test popup file viewer
echo.
echo 📱 PWA GITHUB PAGES:
echo   https://memothan3.github.io/Trackly/trackly_dashboard.html
echo.
echo Local: http://localhost:8000/trackly_dashboard.html
echo.
pause