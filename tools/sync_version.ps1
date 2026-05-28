# UTF-8 safe version sync (delegates to Python)
$ErrorActionPreference = "Stop"
python (Join-Path $PSScriptRoot "sync_version.py")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
