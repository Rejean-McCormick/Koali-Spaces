@echo off
setlocal
cd /d "%~dp0"

echo [Koali] Preparing integrated workspace...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\bootstrap-koali.ps1"
if %ERRORLEVEL% NEQ 0 (
  echo [Koali] ERROR: workspace bootstrap failed.
  exit /b %ERRORLEVEL%
)

set "KOALI_SKIP_BOOTSTRAP=1"
where uv >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  uv run --python 3.13 --no-project python "%~dp0launcher\koali_launcher.py" --console
  exit /b %ERRORLEVEL%
)

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

echo [Koali] ERROR: no Python runtime is available after bootstrap.
exit /b 1
