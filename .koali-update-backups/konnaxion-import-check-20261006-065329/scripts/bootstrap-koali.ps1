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
$LogRoot = Join-Path $KoaliRoot '.koali-dev\logs'
New-Item -ItemType Directory -Force -Path $LogRoot | Out-Null
$LogPath = Join-Path $LogRoot ('bootstrap-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.log')
$TranscriptStarted = $false
try { Start-Transcript -Path $LogPath -Force | Out-Null; $TranscriptStarted = $true } catch { }
trap {
  Write-Host ("[Koali bootstrap] FATAL: {0}" -f $_.Exception.Message) -ForegroundColor Red
  Write-Host ("[Koali bootstrap] log: {0}" -f $LogPath)
  if ($TranscriptStarted) { try { Stop-Transcript | Out-Null } catch { } }
  exit 1
}
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


function Get-Sha256Hex([string]$FilePath) {
  $stream = [System.IO.File]::OpenRead($FilePath)
  $sha = $null
  try {
    $sha = [System.Security.Cryptography.SHA256]::Create()
    $bytes = $sha.ComputeHash($stream)
    return ([System.BitConverter]::ToString($bytes)).Replace('-', '')
  } finally {
    if ($null -ne $sha) { $sha.Dispose() }
    $stream.Dispose()
  }
}

function Get-ProjectFingerprint([string]$Path, [string[]]$Names) {
  $parts = [System.Collections.Generic.List[string]]::new()
  foreach ($name in $Names) {
    $file = Join-Path $Path $name
    if (Test-Path $file) {
      # Avoid Get-FileHash: some Windows/PowerShell installations do not
      # auto-load the module that exports it. .NET SHA256 is always available.
      $hash = Get-Sha256Hex $file
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

# pnpm is provisioned inside Koali's writable state directory. Do not run
# `corepack enable`: on standard Windows Node installations that attempts to
# create shims under C:\Program Files\nodejs and fails without elevation.
$PnpmVersionRequired = '10.20.0'
$PnpmToolRoot = Join-Path $StateRoot 'tools\pnpm'
$PnpmLocalCommand = Join-Path $PnpmToolRoot 'node_modules\.bin\pnpm.cmd'
$script:PnpmCommand = $null

function Get-PnpmVersion([string]$Command) {
  try {
    $value = (& $Command --version 2>$null).Trim()
    if ($LASTEXITCODE -eq 0) { return $value }
  } catch { }
  return $null
}

if (Test-Path $PnpmLocalCommand) {
  $candidateVersion = Get-PnpmVersion $PnpmLocalCommand
  if ($candidateVersion -eq $PnpmVersionRequired) { $script:PnpmCommand = $PnpmLocalCommand }
}

if (-not $script:PnpmCommand -and (Has-Command 'pnpm.cmd')) {
  $globalPnpm = (Get-Command 'pnpm.cmd').Source
  $candidateVersion = Get-PnpmVersion $globalPnpm
  if ($candidateVersion -eq $PnpmVersionRequired) { $script:PnpmCommand = $globalPnpm }
}

if (-not $script:PnpmCommand) {
  if ($CheckOnly -or $NoInstall) { throw "pnpm $PnpmVersionRequired is required but is not provisioned locally" }
  if (-not (Has-Command 'npm.cmd')) { throw 'npm.cmd is required to provision Koali-local pnpm' }
  New-Item -ItemType Directory -Force -Path $PnpmToolRoot | Out-Null
  Invoke-Native 'npm.cmd' @('install','--prefix',$PnpmToolRoot,"pnpm@$PnpmVersionRequired",'--no-audit','--no-fund')
  if (-not (Test-Path $PnpmLocalCommand)) { throw "Local pnpm shim was not created: $PnpmLocalCommand" }
  $script:PnpmCommand = $PnpmLocalCommand
}

$pnpmVersion = Get-PnpmVersion $script:PnpmCommand
if ($pnpmVersion -ne $PnpmVersionRequired) { throw "pnpm $PnpmVersionRequired is required; found $pnpmVersion" }
Add-Event 'pnpm' 'ready' "$pnpmVersion (Koali-local; no elevation required)"

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
    if ($Manager -eq 'pnpm') { Invoke-Native $script:PnpmCommand @('install','--no-frozen-lockfile') $Path }
    else { Invoke-Native 'npm.cmd' @('install','--no-audit','--no-fund') $Path }
    $fingerprint = Get-ProjectFingerprint $Path @('package.json','package-lock.json','pnpm-lock.yaml','npm-shrinkwrap.json')
    Set-Content -Encoding UTF8 -Path $stamp -Value $fingerprint
  }
  Add-Event $Name 'ready' 'dependencies installed and fingerprint-matched'
}

function Test-VenvPythonVersion([string]$Python, [string]$Version) {
  if (-not (Test-Path $Python)) { return $false }
  try {
    $actual = (& $Python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")' 2>$null).Trim()
    return ($LASTEXITCODE -eq 0 -and $actual -eq $Version)
  } catch { return $false }
}

function Reset-PythonVenv([string]$Name, [string]$Path, [string]$Venv, [string]$Version) {
  if (Test-Path $Venv) {
    Add-Event $Name 'repairing' "rebuilding incompatible/incomplete .venv for Python $Version"
    Remove-Item -LiteralPath $Venv -Recurse -Force -ErrorAction Stop
  }
  Invoke-Native 'uv.exe' @('venv',$Venv,'--python',$Version) $Path
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
  if (-not (Test-VenvPythonVersion $python $Version)) {
    Reset-PythonVenv $Name $Path $venv $Version
    $current = ''
  }
  if ($current.Trim() -ne $fingerprint.Trim()) {
    Invoke-Native 'uv.exe' @('pip','install','--python',$python,'-e','.') $Path
    Set-Content -Encoding UTF8 -Path $stamp -Value $fingerprint
  }
  Add-Event $Name 'ready' "Python $Version environment installed and fingerprint-matched"
}


function Ensure-KonnaxionBackend([string]$Repo, [string]$WorldsRepo) {
  $backend = Join-Path $Repo 'backend'
  $manage = Join-Path $backend 'manage.py'
  $requirements = Join-Path $backend 'requirements\local.txt'
  $worldsBackend = Join-Path $WorldsRepo 'backend'
  $worldsPyproject = Join-Path $worldsBackend 'pyproject.toml'
  $checker = Join-Path $Repo 'scripts\check_worlds_dependency.py'
  $lockFile = Join-Path $Repo 'WORLD_ENGINE.lock.json'
  if (-not (Test-Path $manage)) { throw "Konnaxion manage.py missing: $manage" }
  if (-not (Test-Path $requirements)) { throw "Konnaxion local requirements missing: $requirements" }
  if (-not (Test-Path $worldsPyproject)) { throw "Konnaxion_Worlds sibling missing: $worldsPyproject" }
  if (-not (Test-Path $checker)) { throw "Konnaxion Worlds dependency checker missing: $checker" }
  if (-not (Test-Path $lockFile)) { throw "Konnaxion Worlds lock missing: $lockFile" }

  $venv = Join-Path $backend '.venv'
  $python = Join-Path $venv 'Scripts\python.exe'
  $stamp = Join-Path $venv '.koali-bootstrap-stamp'
  $worldsStamp = Join-Path $venv '.koali-worlds-stamp'
  $fingerprint = (Get-ProjectFingerprint $backend @('requirements\base.txt','requirements\local.txt')) + "`n" + (Get-ProjectFingerprint $Repo @('WORLD_ENGINE.lock.json'))

  if ($CheckOnly) {
    if (-not (Test-VenvPythonVersion $python '3.12')) { Add-Event 'konnaxion-backend' 'missing' 'Python 3.12 venv absent/incompatible'; return }
  } else {
    $current = if (Test-Path $stamp) { Get-Content -Raw -Path $stamp } else { '' }
    if (-not (Test-VenvPythonVersion $python '3.12')) {
      Reset-PythonVenv 'konnaxion-backend' $backend $venv '3.12'
      $current = ''
    }
    if ($current.Trim() -ne $fingerprint.Trim()) {
      Invoke-Native 'uv.exe' @('pip','install','--python',$python,'-r',$requirements) $backend
      Set-Content -Encoding UTF8 -Path $stamp -Value $fingerprint
    }
  }

  # Konnaxion_Worlds is a separately owned, pinned sibling engine. Verify the
  # exact version/tree digest before installing or admitting it into Koali.
  Invoke-Native $python @($checker,$WorldsRepo) $Repo
  $worldsFingerprint = Get-ProjectFingerprint $Repo @('WORLD_ENGINE.lock.json')
  $installedWorlds = $false
  try {
    & $python -c 'import json, importlib.metadata, pathlib, sys; lock=json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")); assert importlib.metadata.version(lock["distribution"]) == lock["version"]; import konnaxion.worlds' $lockFile 2>$null
    $installedWorlds = ($LASTEXITCODE -eq 0)
  } catch { $installedWorlds = $false }
  $currentWorlds = if (Test-Path $worldsStamp) { Get-Content -Raw -Path $worldsStamp } else { '' }
  if (-not $CheckOnly -and (-not $installedWorlds -or $currentWorlds.Trim() -ne $worldsFingerprint.Trim())) {
    Invoke-Native 'uv.exe' @('pip','install','--python',$python,'-e',$worldsBackend) $backend
    Set-Content -Encoding UTF8 -Path $worldsStamp -Value $worldsFingerprint
    Invoke-Native $python @('-c','import konnaxion.worlds; print("konnaxion-worlds import ready")') $backend
  } elseif ($CheckOnly -and -not $installedWorlds) {
    Add-Event 'konnaxion-worlds' 'missing' 'pinned sibling engine is not installed into Konnaxion backend .venv'
    return
  }

  Add-Event 'konnaxion-backend' 'ready' 'Python 3.12 environment and local dependencies ready'
  Add-Event 'konnaxion-worlds' 'ready' 'pinned sibling engine verified and installed'
}

Ensure-NodeProject 'koali-spaces' $KoaliRoot 'pnpm'
$konnaxionRepo = Join-Path $MyCode 'Konnaxion\Konnaxion'
$konnaxionWorldsRepo = Join-Path $MyCode 'Konnaxion\Konnaxion_Worlds'
Ensure-NodeProject 'konnaxion-frontend' (Join-Path $konnaxionRepo 'frontend') 'pnpm'
Ensure-KonnaxionBackend $konnaxionRepo $konnaxionWorldsRepo
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
    if (-not (Test-VenvPythonVersion $controlPython '3.13')) { Reset-PythonVenv 'koali-control-panel' $control $controlVenv '3.13' }
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
if ($TranscriptStarted) { try { Stop-Transcript | Out-Null } catch { } }
