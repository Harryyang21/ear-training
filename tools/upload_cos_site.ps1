# Upload full docs/ site to Tencent COS static website (bucket root)
# Prerequisite: enable Static Website on the bucket (index: index.html)
# Usage:
#   1. copy tools\cos.env.example -> tools\cos.env
#   2. deploy_cos.bat   (or: python tools\prepare_github_pages.py then run this script)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$EnvFile = Join-Path $PSScriptRoot "cos.env"
$DocsDir = Join-Path $Root "docs"

function Read-DotEnv($Path) {
    $vars = @{}
    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#")) { return }
        $parts = $line -split "=", 2
        if ($parts.Count -eq 2) {
            $vars[$parts[0].Trim()] = $parts[1].Trim()
        }
    }
    return $vars
}

function Get-CosUploadHeaders($Extension) {
    switch ($Extension.ToLower()) {
        ".html" { return "text/html; charset=utf-8" }
        ".css"  { return "text/css; charset=utf-8" }
        ".js"   { return "application/javascript; charset=utf-8" }
        ".json" { return "application/json; charset=utf-8" }
        ".wav"  { return "audio/wav" }
        ".flac" { return "audio/flac" }
        ".sfz"  { return "text/plain; charset=utf-8" }
        default { return $null }
    }
}

function Upload-CosFile($LocalPath, $CosKey) {
    $ext = [System.IO.Path]::GetExtension($LocalPath)
    $contentType = Get-CosUploadHeaders $ext
    if ($contentType) {
        $headerJson = "{'Content-Type':'$contentType','Content-Disposition':'inline'}"
        coscmd upload $LocalPath "/$CosKey" -H $headerJson --skipmd5 | Out-Null
    } else {
        coscmd upload $LocalPath "/$CosKey" --skipmd5 | Out-Null
    }
}

if (-not (Test-Path $EnvFile)) {
    Write-Host "Missing tools/cos.env — copy from tools/cos.env.example" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $DocsDir)) {
    Write-Host "Missing docs/ — run: python tools\prepare_github_pages.py" -ForegroundColor Red
    exit 1
}

$cfg = Read-DotEnv $EnvFile
$required = @("COS_SECRET_ID", "COS_SECRET_KEY", "COS_BUCKET", "COS_REGION")
foreach ($key in $required) {
    if (-not $cfg[$key]) {
        Write-Host "Missing $key in tools/cos.env" -ForegroundColor Red
        exit 1
    }
}

$coscmd = Get-Command coscmd -ErrorAction SilentlyContinue
if (-not $coscmd) {
    Write-Host "Installing coscmd..." -ForegroundColor Cyan
    python -m pip install coscmd -q
}

Write-Host "Configuring coscmd for $($cfg.COS_BUCKET) ($($cfg.COS_REGION))..." -ForegroundColor Cyan
coscmd config `
    -a $cfg.COS_SECRET_ID `
    -s $cfg.COS_SECRET_KEY `
    -b $cfg.COS_BUCKET `
    -r $cfg.COS_REGION | Out-Null

Write-Host "Uploading site files with inline preview headers..." -ForegroundColor Cyan

$webFiles = @("index.html", "app.js", "styles.css", "sw.js", "stats.html", "stats.js", ".nojekyll")
foreach ($name in $webFiles) {
    $local = Join-Path $DocsDir $name
    if (Test-Path $local) {
        Write-Host "  $name" -ForegroundColor DarkGray
        Upload-CosFile $local $name
    }
}

$samplesDir = Join-Path $DocsDir "samples"
if (Test-Path $samplesDir) {
    Write-Host "Uploading samples/ (~140 MB, may take a few minutes)..." -ForegroundColor Cyan
    Push-Location $DocsDir
    try {
        coscmd upload -r "samples" "samples" --skipmd5 | Out-Null
    } finally {
        Pop-Location
    }
}

$websiteUrl = "https://$($cfg.COS_BUCKET).cos-website.$($cfg.COS_REGION).myqcloud.com"
$apiUrl = "https://$($cfg.COS_BUCKET).cos.$($cfg.COS_REGION).myqcloud.com"
Write-Host ""
Write-Host "Upload done." -ForegroundColor Green
Write-Host ""
Write-Host "Open in Safari or Chrome (not the downloaded file):" -ForegroundColor Yellow
Write-Host "  $websiteUrl"
Write-Host ""
Write-Host "If WeChat still downloads the page, tap ... -> Open in Browser." -ForegroundColor DarkGray
Write-Host "For best WeChat support, bind a custom domain + CDN in Tencent console." -ForegroundColor DarkGray
Write-Host ""
Write-Host "Direct object URL (fallback):" -ForegroundColor DarkGray
Write-Host "  $apiUrl/index.html"
