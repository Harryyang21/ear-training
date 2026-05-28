# Apply version.json to all deployable files in web/ and README.md
param(
    [string]$VersionFile = (Join-Path (Split-Path -Parent $PSScriptRoot) "version.json")
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$WebDir = Join-Path $Root "web"
$Utf8NoBom = New-Object System.Text.UTF8Encoding $false

if (-not (Test-Path $VersionFile)) {
    Write-Host "Missing version.json at $VersionFile" -ForegroundColor Red
    exit 1
}

$versionData = Get-Content $VersionFile -Raw -Encoding UTF8 | ConvertFrom-Json
$Version = [string]$versionData.version
if (-not $Version) {
    Write-Host "version.json must contain a version string." -ForegroundColor Red
    exit 1
}

function Read-TextUtf8($Path) {
    return [System.IO.File]::ReadAllText($Path, $Utf8NoBom)
}

function Write-TextUtf8($Path, $Text) {
    [System.IO.File]::WriteAllText($Path, $Text, $Utf8NoBom)
}

function Set-FileText($Path, $Transform) {
    if (-not (Test-Path $Path)) {
        Write-Host "Missing $Path" -ForegroundColor Red
        exit 1
    }
    $text = Read-TextUtf8 $Path
    $updated = & $Transform $text
    if ($text -ne $updated) {
        Write-TextUtf8 $Path $updated
        Write-Host "  updated $(Split-Path $Path -Leaf)" -ForegroundColor DarkGray
    } else {
        Write-Host "  unchanged $(Split-Path $Path -Leaf)" -ForegroundColor DarkGray
    }
}

Write-Host "Applying version $Version..." -ForegroundColor Cyan

Set-FileText (Join-Path $WebDir "app.js") {
    param($text)
    $text -replace 'const APP_VERSION = "[^"]+";', "const APP_VERSION = `"$Version`";"
}

Set-FileText (Join-Path $WebDir "sw.js") {
    param($text)
    $text -replace 'const CACHE = "ear-training-[^"]+";', "const CACHE = `"ear-training-$Version`";"
}

Set-FileText (Join-Path $WebDir "index.html") {
    param($text)
    $text = $text -replace '<!-- build: [^ ]+ -->', "<!-- build: $Version -->"
    $text = $text -replace 'styles\.css\?v=[^"]+', "styles.css?v=$Version"
    $text = $text -replace 'app\.js\?v=[^"]+', "app.js?v=$Version"
    $text = $text -replace 'stats-storage\.js\?v=[^"]+', "stats-storage.js?v=$Version"
    $text = $text -replace 'sw\.js\?v=[^"]+', "sw.js?v=$Version"
    $text
}

Set-FileText (Join-Path $WebDir "stats.html") {
    param($text)
    $text = $text -replace '<!-- build: [^ ]+ -->', "<!-- build: $Version -->"
    $text = $text -replace 'styles\.css\?v=[^"]+', "styles.css?v=$Version"
    $text = $text -replace 'stats-storage\.js\?v=[^"]+', "stats-storage.js?v=$Version"
    $text = $text -replace 'stats\.js\?v=[^"]+', "stats.js?v=$Version"
    $text = $text -replace 'sw\.js\?v=[^"]+', "sw.js?v=$Version"
    $text
}

Write-Host "Version $Version applied." -ForegroundColor Green
