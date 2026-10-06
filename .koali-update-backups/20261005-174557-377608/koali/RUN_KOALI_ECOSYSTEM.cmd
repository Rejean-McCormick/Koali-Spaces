@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  py -3 "%~dp0launcher\koali_launcher.py" --console
  exit /b %ERRORLEVEL%
)

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  python "%~dp0launcher\koali_launcher.py" --console
  exit /b %ERRORLEVEL%
)

echo [Koali] ERROR: Python 3 was not found on PATH.
exit /b 1
