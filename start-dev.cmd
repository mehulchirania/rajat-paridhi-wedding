@echo off
REM Double-click to run the wedding site locally at http://localhost:5173
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies, first run only...
  call npm install
)
call npm run dev -- --open
pause
