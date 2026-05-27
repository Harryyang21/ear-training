# Copy deployable shell files from web/ to docs/
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$WebDir = Join-Path $Root "web"
$DocsDir = Join-Path $Root "docs"

$files = @("index.html", "app.js", "styles.css", "sw.js", "stats.html", "stats.js")

if (-not (Test-Path $WebDir)) {
    Write-Host "Missing web/ directory." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $DocsDir)) {
    New-Item -ItemType Directory -Path $DocsDir | Out-Null
}

foreach ($name in $files) {
    $source = Join-Path $WebDir $name
    if (-not (Test-Path $source)) {
        Write-Host "Missing $name in web/" -ForegroundColor Red
        exit 1
    }
    Copy-Item -Force $source (Join-Path $DocsDir $name)
    Write-Host "  synced $name" -ForegroundColor DarkGray
}

Write-Host "web/ -> docs/ sync done." -ForegroundColor Green
