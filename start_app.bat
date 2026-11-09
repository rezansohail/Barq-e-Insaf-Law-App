@echo off
echo ===================================================
echo       Starting Barq-e-Insaf Full Application
echo ===================================================
echo.

echo [1/3] Launching Backend API on Port 5000...
start "Barq-e-Insaf Backend (Port 5000)" cmd /k "cd /d "%~dp0Backend" && npm run dev"

echo [2/3] Launching AI Chatbot Service on Port 5001...
start "Barq-e-Insaf Chatbot (Port 5001)" cmd /k "cd /d "%~dp0chatbot" && call venv\Scripts\activate.bat && python main.py"

echo [3/3] Launching Frontend (Expo Metro Bundler)...
start "Barq-e-Insaf Frontend (Expo)" cmd /k "cd /d "%~dp0Frontend" && npx expo start"

echo.
echo All services launched in separate windows!
echo - Backend: http://localhost:5000
echo - Chatbot: http://localhost:5001
echo - Frontend: See Expo window for QR code or press 'w' for web / 'a' for android.
echo.
pause

