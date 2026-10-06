@echo off
setlocal
cd /d "%~dp0"

where uv >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  uv run --python 3.13 --no-project python "%~dp0launcher\koali_launcher.py" --console --stop --no-browser
  exit /b %ERRORLEVEL%
)

where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  py -3 "%~dp0launcher\koali_launcher.py" --console --stop --no-browser
  exit /b %ERRORLEVEL%
)

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  python "%~dp0launcher\koali_launcher.py" --console --stop --no-browser
  exit /b %ERRORLEVEL%
)

echo [Koali] ERROR: no Python runtime was found. If this is a fresh machine, run START_KOALI.cmd once first.
exit /b 1
