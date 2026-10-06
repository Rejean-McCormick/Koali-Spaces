@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\bootstrap-koali.ps1" -CheckOnly -NoInstall
exit /b %ERRORLEVEL%
