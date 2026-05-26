@echo off
cd /d "%~dp0"
echo Building site (docs/)...
python tools\prepare_github_pages.py
if errorlevel 1 (
  echo Build failed.
  pause
  exit /b 1
)
echo.
echo Uploading to Tencent COS...
powershell -ExecutionPolicy Bypass -File tools\upload_cos_site.ps1
if errorlevel 1 (
  echo Upload failed.
  pause
  exit /b 1
)
echo.
echo Done. Open the cos-website URL shown above.
pause
