@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File tools\bump_version.ps1
exit /b %ERRORLEVEL%
