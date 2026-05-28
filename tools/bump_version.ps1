# Bump patch version in version.json, apply to all files, sync web/ -> docs/
param(
    [ValidateSet("patch", "minor", "major")]
    [string]$Part = "patch"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$VersionFile = Join-Path $Root "version.json"

if (-not (Test-Path $VersionFile)) {
    Write-Host "Missing version.json" -ForegroundColor Red
    exit 1
}

$data = Get-Content $VersionFile -Raw | ConvertFrom-Json
$parts = [version]$data.version
$major = $parts.Major
$minor = $parts.Minor
$patch = $parts.Build

switch ($Part) {
    "major" { $major += 1; $minor = 0; $patch = 0 }
    "minor" { $minor += 1; $patch = 0 }
    default { $patch += 1 }
}

$newVersion = "$major.$minor.$patch"
@{ version = $newVersion } | ConvertTo-Json | Set-Content $VersionFile
Write-Host "Bumped version to $newVersion" -ForegroundColor Cyan

& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "sync_version.ps1")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "sync_web_to_docs.ps1")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Release $newVersion ready." -ForegroundColor Green
