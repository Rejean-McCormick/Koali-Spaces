param(
  [switch]$CheckOnly,
  [switch]$NoInstall
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$KoaliRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$MyCode = (Resolve-Path (Join-Path $KoaliRoot '..\..')).Path
$StateRoot = Join-Path $KoaliRoot '.koali-dev\bootstrap'
New-Item -ItemType Directory -Force -Path $StateRoot | Out-Null
$StatusPath = Join-Path $StateRoot 'bootstrap-status.json'
$Events = [System.Collections.Generic.List[object]]::new()

function Add-Event([string]$Name, [string]$State, [string]$Detail) {
  $Events.Add([pscustomobject]@{ name=$Name; state=$State; detail=$Detail })
  Write-Host ("[Koali bootstrap] {0}: {1} - {2}" -f $Name,$State,$Detail)
}

function Refresh-Path {
  $machine = [Environment]::GetEnvironmentVariable('Path','Machine')
  $user = [Environment]::GetEnvironmentVariable('Path','User')
  $env:Path = (($machine,$user) -join ';')
}

function Has-Command([string]$Name) { return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue) }

function Invoke-Native([string]$Name, [string[]]$CommandArgs, [string]$Cwd=$KoaliRoot) {
  Push-Location $Cwd
  try {
    & $Name @CommandArgs
    if ($LASTEXITCODE -ne 0) { throw "$Name exited with code $LASTEXITCODE" }
  } finally { Pop-Location }
}

function Winget-Install([string]$Id) {
  if ($NoInstall -or $CheckOnly) { throw "$Id is required but automatic installation is disabled" }
  if (-not (Has-Command 'winget.exe')) { throw "$Id is required and winget.exe is unavailable" }
  Invoke-Native 'winget.exe' @('install','--id',$Id,'-e','--accept-source-agreements','--accept-package-agreements','--silent')
  Refresh-Path
}


function Get-ProjectFingerprint([string]$Path, [string[]]$Names) {
  $parts = [System.Collections.Generic.List[string]]::new()
  foreach ($name in $Names) {
    $file = Join-Path $Path $name
    if (Test-Path $file) {
      $hash = (Get-FileHash -Algorithm SHA256 -Path $file).Hash
      $parts.Add("$name=$hash")
    }
  }
  return ($parts -join "`n")
}

# Node >=22 is the shared floor because Orgo requires it.
$nodeOk = $false
if (Has-Command 'node.exe') {
  $raw = (& node.exe --version).Trim().TrimStart('v')
  $major = [int]($raw.Split('.')[0])
  $nodeOk = $major -ge 22
}
if (-not $nodeOk) { Winget-Install 'OpenJS.NodeJS.LTS' }
if (-not (Has-Command 'node.exe')) { throw 'Node.js >=22 is unavailable after provisioning' }
$nodeVersion = (& node.exe --version).Trim()
if ([int]($nodeVersion.TrimStart('v').Split('.')[0]) -lt 22) { throw "Node.js >=22 required; found $nodeVersion" }
Add-Event 'node' 'ready' $nodeVersion

if (-not (Has-Command 'corepack.cmd')) {
  if ($CheckOnly -or $NoInstall) { throw 'corepack is required' }
  Invoke-Native 'npm.cmd' @('install','--global','corepack@0.34.0')
  Refresh-Path
}
if (-not $CheckOnly) {
  Invoke-Native 'corepack.cmd' @('enable')
  Invoke-Native 'corepack.cmd' @('prepare','pnpm@10.20.0','--activate')
}
$pnpmVersion = (& corepack.cmd pnpm --version).Trim()
if ($LASTEXITCODE -ne 0) { throw 'pnpm 10.20.0 is required; run START_KOALI.cmd to provision it' }
Add-Event 'pnpm' 'ready' $pnpmVersion

if (-not (Has-Command 'uv.exe')) { Winget-Install 'astral-sh.uv' }
if (-not (Has-Command 'uv.exe')) { throw 'uv is unavailable after provisioning' }
Add-Event 'uv' 'ready' ((& uv.exe --version).Trim())

if (-not $CheckOnly) {
  Invoke-Native 'uv.exe' @('python','install','3.12','3.13','3.14')
  Add-Event 'python-runtimes' 'ready' '3.12, 3.13, 3.14 managed by uv'
}

function Ensure-NodeProject([string]$Name, [string]$Path, [string]$Manager) {
  if (-not (Test-Path (Join-Path $Path 'package.json'))) { throw "$Name package.json missing: $Path" }
  $modules = Join-Path $Path 'node_modules'
  $stamp = Join-Path $modules '.koali-bootstrap-stamp'
  $fingerprint = Get-ProjectFingerprint $Path @('package.json','package-lock.json','pnpm-lock.yaml','npm-shrinkwrap.json')
  if ($CheckOnly) {
    if (-not (Test-Path $modules)) { Add-Event $Name 'missing' 'node_modules absent'; return }
    Add-Event $Name 'ready' 'node_modules present'; return
  }
  $current = if (Test-Path $stamp) { Get-Content -Raw -Path $stamp } else { '' }
  if (-not (Test-Path $modules) -or $current.Trim() -ne $fingerprint.Trim()) {
    if ($Manager -eq 'pnpm') { Invoke-Native 'corepack.cmd' @('pnpm','install','--no-frozen-lockfile') $Path }
    else { Invoke-Native 'npm.cmd' @('install','--no-audit','--no-fund') $Path }
    $fingerprint = Get-ProjectFingerprint $Path @('package.json','package-lock.json','pnpm-lock.yaml','npm-shrinkwrap.json')
    Set-Content -Encoding UTF8 -Path $stamp -Value $fingerprint
  }
  Add-Event $Name 'ready' 'dependencies installed and fingerprint-matched'
}

function Ensure-PythonProject([string]$Name, [string]$Path, [string]$Version) {
  if (-not (Test-Path (Join-Path $Path 'pyproject.toml'))) { throw "$Name pyproject.toml missing: $Path" }
  $venv = Join-Path $Path '.venv'
  $python = Join-Path $venv 'Scripts\python.exe'
  $stamp = Join-Path $venv '.koali-bootstrap-stamp'
  $fingerprint = Get-ProjectFingerprint $Path @('pyproject.toml','uv.lock','requirements.txt')
  if ($CheckOnly) {
    if (Test-Path $python) { Add-Event $Name 'ready' "Python $Version venv present" } else { Add-Event $Name 'missing' "Python $Version venv absent" }
    return
  }
  $current = if (Test-Path $stamp) { Get-Content -Raw -Path $stamp } else { '' }
  if (-not (Test-Path $python)) { Invoke-Native 'uv.exe' @('venv',$venv,'--python',$Version) $Path; $current = '' }
  if ($current.Trim() -ne $fingerprint.Trim()) {
    Invoke-Native 'uv.exe' @('pip','install','--python',$python,'-e','.') $Path
    Set-Content -Encoding UTF8 -Path $stamp -Value $fingerprint
  }
  Add-Event $Name 'ready' "Python $Version environment installed and fingerprint-matched"
}

Ensure-NodeProject 'koali-spaces' $KoaliRoot 'pnpm'
Ensure-NodeProject 'orgo' (Join-Path $MyCode 'Orgo\Orgo') 'npm'
if (-not $CheckOnly) { Invoke-Native 'npm.cmd' @('run','db:generate') (Join-Path $MyCode 'Orgo\Orgo') }
Ensure-NodeProject 'orgo-worlds' (Join-Path $MyCode 'Orgo\Orgo_Worlds') 'npm'
Ensure-NodeProject 'interaction-kernel-typescript' (Join-Path $MyCode 'Interaction-Kernel\interaction_kernel\runtime\typescript') 'npm'
Ensure-PythonProject 'semantik-architect' (Join-Path $MyCode 'SemantiK_Architect\SemantiK_Architect') '3.12'
Ensure-PythonProject 'semantik-runtime-orchestrator' (Join-Path $MyCode 'SemantiK_Architect\SemantiK_Runtime_Orchestrator') '3.12'
Ensure-PythonProject 'konfid' (Join-Path $MyCode 'Konfid\konfid') '3.12'
Ensure-PythonProject 'kor' (Join-Path $MyCode 'Kor\kor') '3.14'
Ensure-PythonProject 'interaction-kernel' (Join-Path $MyCode 'Interaction-Kernel\interaction_kernel\runtime\python') '3.12'
Ensure-PythonProject 'koa-mediatheque' (Join-Path $MyCode 'kOA_Mediatheque\mediatheque') '3.12'
Ensure-PythonProject 'koa-linux' (Join-Path $MyCode 'kOA-Linux\koa-linux') '3.13'

$media = Join-Path $MyCode 'kOA_Mediatheque\mediatheque'
$mediaInstance = Join-Path $MyCode 'kOA_Mediatheque\mediatheque-blank'
$mediaDb = Join-Path $mediaInstance '01_DB\koa_mediatheque.sqlite'
$mediaConfig = Join-Path $mediaInstance 'mediatheque.instance.toml'
$mediaPython = Join-Path $media '.venv\Scripts\python.exe'
if (-not (Test-Path $mediaConfig)) { throw "Médiathèque instance config missing: $mediaConfig" }
if ($CheckOnly) {
  if (Test-Path $mediaDb) { Add-Event 'koa-mediatheque-instance' 'ready' 'blank sibling instance and SQLite database present' }
  else { Add-Event 'koa-mediatheque-instance' 'missing' 'blank sibling SQLite database absent' }
} else {
  if (-not (Test-Path $mediaDb)) {
    $mediaInit = 'from pathlib import Path; from koa_mediatheque.db import initialize_database; import sys; r=initialize_database(Path(sys.argv[1]), Path(sys.argv[2]), overwrite=False); print(r.result); raise SystemExit(0 if r.success else 1)'
    Invoke-Native $mediaPython @('-c',$mediaInit,$mediaDb,(Join-Path $media 'schemas\sqlite')) $media
  }
  Add-Event 'koa-mediatheque-instance' 'ready' 'blank sibling instance initialized and persistent'
}

$control = Join-Path $MyCode 'kOA-Linux\Koali-Control-Panel'
if (Test-Path (Join-Path $control 'koali-control.pyw')) {
  $controlVenv = Join-Path $control '.venv'
  $controlPython = Join-Path $controlVenv 'Scripts\python.exe'
  if ($CheckOnly) {
    if (-not (Test-Path $controlPython)) { Add-Event 'koali-control-panel' 'missing' 'Python 3.13 venv absent' }
    else { Invoke-Native $controlPython @('koali-control.pyw','--self-test') $control; Add-Event 'koali-control-panel' 'ready' 'self-test passed' }
  } else {
    if (-not (Test-Path $controlPython)) { Invoke-Native 'uv.exe' @('venv',$controlVenv,'--python','3.13') $control }
    Invoke-Native $controlPython @('koali-control.pyw','--self-test') $control
    Add-Event 'koali-control-panel' 'ready' 'self-test passed'
  }
}

Add-Event 'orgo-local-database' 'ready' 'PGlite socket runtime is bundled through Orgo development dependencies; Docker is not required for Koali local start'

$status = [pscustomobject]@{
  schemaVersion = 1
  updatedAt = [DateTime]::UtcNow.ToString('o')
  checkOnly = [bool]$CheckOnly
  mycode = $MyCode
  events = $Events
}
$status | ConvertTo-Json -Depth 6 | Set-Content -Encoding UTF8 $StatusPath
Write-Host "[Koali bootstrap] status: $StatusPath"
if ($CheckOnly) {
  $bad = @($Events | Where-Object { $_.state -in @('missing','degraded','failed') })
  if ($bad.Count -gt 0) {
    Write-Error ('Koali qualification incomplete: ' + (($bad | ForEach-Object { $_.name + '=' + $_.state }) -join ', '))
    exit 2
  }
}
