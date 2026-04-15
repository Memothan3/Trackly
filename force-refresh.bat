@echo off
echo ========================================
echo   TRACKLY - FORCE REFRESH SYSTEM
echo ========================================
echo.
echo Killing all processes...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im ngrok.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo.
echo Clearing browser cache...
echo Please press Ctrl+Shift+R in your browser to hard refresh
echo Or press Ctrl+F5 to force reload
echo.
echo Starting fresh servers...
start "Trackly Server" python -m http.server 8000
timeout /t 3 /nobreak >nul
echo.
echo Starting ngrok tunnel...
start "Ngrok Tunnel" ngrok http 8000
timeout /t 5 /nobreak >nul
echo.
echo ========================================
echo   SERVERS RESTARTED - CACHE CLEARED
echo ========================================
echo.
echo Local: http://localhost:8000
echo File Viewer: http://localhost:8000/file-viewer.html
echo.
echo IMPORTANT: Press Ctrl+Shift+R in browser to see changes!
echo.
pause