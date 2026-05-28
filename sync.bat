@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File tools\sync_web_to_docs.ps1
exit /b %ERRORLEVEL%
