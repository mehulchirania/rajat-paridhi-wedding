@echo off
REM Double-click to run the wedding site locally at http://localhost:5173
cd /d "%~dp0"
echo Checking dependencies...
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo npm install failed. Is Node.js installed? https://nodejs.org
  pause
  exit /b 1
)
call npm run dev -- --open
pause
