@echo off
echo ========================================
echo EcoSync Backend - Setup Script
echo ========================================
echo.

echo [1/3] Installing Python dependencies...
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies.
    echo Please ensure Python 3.8+ is installed.
    exit /b 1
)

echo.
echo [2/3] Training ML models...
python src\model_trainer.py
if %errorlevel% neq 0 (
    echo ERROR: Failed to train models.
    exit /b 1
)

echo.
echo [3/3] Setup complete!
echo.
echo To start the backend server, run:
echo   python src\main.py
echo.
echo Or with auto-reload for development:
echo   uvicorn src.main:app --reload
echo.
