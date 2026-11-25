@echo off
echo ===================================================
echo     Starting Barq-e-Insaf AI Chatbot Backend
echo ===================================================
echo.

cd /d "%~dp0"

if not exist venv\Scripts\activate.bat (
    echo Error: Virtual environment 'venv' not found in this directory.
    pause
    exit /b
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

if not exist chroma_db (
    echo.
    echo First-time setup: Pakistan Law Database not detected.
    echo Automatically indexing statutory PDFs with OCR... Please wait a couple minutes.
    echo.
    python ingest.py
)

echo.
echo Starting Barq-e-Insaf AI Backend on http://127.0.0.1:5001 ...
echo Web Dashboard and PDF Viewer: http://127.0.0.1:5001
echo.
python main.py
pause
