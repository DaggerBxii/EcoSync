@echo off
echo ========================================
echo EcoSync Backend Server
echo ========================================
echo.
echo Starting FastAPI server on http://localhost:8000
echo WebSocket endpoint: ws://localhost:8000/ws
echo API docs: http://localhost:8000/docs
echo.

python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
