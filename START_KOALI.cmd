@echo off
setlocal
cd /d "%~dp0"
call "%~dp0RUN_KOALI_ECOSYSTEM.cmd"
set "KOALI_EXIT=%ERRORLEVEL%"
if NOT "%KOALI_EXIT%"=="0" (
  echo.
  echo [Koali] START FAILED with exit code %KOALI_EXIT%.
  echo [Koali] Bootstrap logs: "%~dp0.koali-dev\logs"
  echo.
  pause
)
exit /b %KOALI_EXIT%
