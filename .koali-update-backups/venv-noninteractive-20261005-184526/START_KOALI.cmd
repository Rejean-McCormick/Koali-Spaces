@echo off
setlocal
cd /d "%~dp0"
call "%~dp0RUN_KOALI_ECOSYSTEM.cmd"
exit /b %ERRORLEVEL%
