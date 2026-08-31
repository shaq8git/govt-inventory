@echo off
REM Double-click this file to launch the backend (Django) and frontend (Vite) dev servers.
cd /d "%~dp0"

start "Store Backend (Django :8001)" cmd /k "set PYTHONUTF8=1&& venv\Scripts\python.exe manage.py migrate --run-syncdb && venv\Scripts\python.exe manage.py seed_defaults && venv\Scripts\python.exe manage.py seed_office_data && venv\Scripts\python.exe manage.py runserver 127.0.0.1:8001"
start "Store Frontend (Vite :5173)" cmd /k "cd frontend && npm run dev"

timeout /t 6 /nobreak >nul
start "" "http://127.0.0.1:5173"
