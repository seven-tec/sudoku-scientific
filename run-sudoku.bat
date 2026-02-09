@echo off
setlocal
cd /d "%~dp0"

echo Building Sudoku Core Engine...
call npm run build:core

echo Starting Sudoku Web Interface...
cd web-interface
call npm run dev
timeout /t 5
start http://localhost:5173

pause
