@echo off
cd /d "%~dp0"
echo Syncing web/ to docs/...
powershell -NoProfile -ExecutionPolicy Bypass -File tools\sync_web_to_docs.ps1
if errorlevel 1 (
  echo Sync failed.
  pause
  exit /b 1
)
echo.
echo Uploading to Tencent COS...
powershell -NoProfile -ExecutionPolicy Bypass -File tools\upload_cos_site.ps1
if errorlevel 1 (
  echo Upload failed.
  pause
  exit /b 1
)
echo.
echo Done. Open the cos-website URL shown above.
pause
