param(
    [int]$Port = 8302
)

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $repo 'backend'
$venvPython = Join-Path $backend '.venv\Scripts\python.exe'
Set-Location $backend

function Get-UvCommand {
    $cmd = Get-Command uv -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    return $null
}

$uv = Get-UvCommand
if (-not (Test-Path $venvPython)) {
    Write-Host '[Konnaxion/Koali] Creating Python 3.12 virtual environment...'
    if ($uv) {
        & $uv venv .venv --python 3.12
    } elseif (Get-Command py -ErrorAction SilentlyContinue) {
        & py -3.12 -m venv .venv
    } else {
        throw 'Python 3.12 environment missing. Install uv or Python 3.12 (py launcher).'
    }
    if ($LASTEXITCODE -ne 0) { throw 'Failed to create Konnaxion virtual environment.' }
}

& $venvPython -c 'import celery, django, uvicorn' 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host '[Konnaxion/Koali] Installing backend dependencies into .venv...'
    if ($uv) {
        & $uv pip install --python $venvPython -r requirements\local.txt
    } else {
        & $venvPython -m pip install -r requirements\local.txt
    }
    if ($LASTEXITCODE -ne 0) { throw 'Konnaxion dependency installation failed.' }
}

$worldsRepo = Join-Path (Split-Path -Parent $repo) 'Konnaxion_Worlds'
$worldsBackend = Join-Path $worldsRepo 'backend'
$worldsPyproject = Join-Path $worldsBackend 'pyproject.toml'
$worldsChecker = Join-Path $repo 'scripts\check_worlds_dependency.py'
$worldsLock = Join-Path $repo 'WORLD_ENGINE.lock.json'
if (-not (Test-Path $worldsPyproject)) {
    throw "Konnaxion_Worlds sibling repository missing: $worldsPyproject"
}
Write-Host '[Konnaxion/Koali] Verifying pinned Konnaxion_Worlds identity...'
& $venvPython $worldsChecker $worldsRepo
if ($LASTEXITCODE -ne 0) { throw 'Konnaxion_Worlds version/digest does not match WORLD_ENGINE.lock.json.' }

$worldsInstalled = $false
try {
    & $venvPython -c 'import json, importlib.metadata, pathlib, sys; lock=json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")); assert importlib.metadata.version(lock["distribution"]) == lock["version"]; import konnaxion.worlds' $worldsLock 2>$null
    $worldsInstalled = ($LASTEXITCODE -eq 0)
} catch { $worldsInstalled = $false }
if (-not $worldsInstalled) {
    Write-Host '[Konnaxion/Koali] Installing canonical Konnaxion_Worlds engine into backend .venv...'
    if ($uv) {
        & $uv pip install --python $venvPython -e $worldsBackend
    } else {
        & $venvPython -m pip install -e $worldsBackend
    }
    if ($LASTEXITCODE -ne 0) { throw 'Konnaxion_Worlds package install failed.' }
}

$env:DJANGO_SETTINGS_MODULE = 'config.settings.local'
Write-Host '[Konnaxion/Koali] Applying migrations...'

& $venvPython manage.py migrate --noinput
if ($LASTEXITCODE -ne 0) { throw 'Konnaxion migrations failed.' }

Write-Host "[Konnaxion/Koali] Starting API on http://127.0.0.1:$Port"
& $venvPython -m uvicorn config.asgi:application --host 127.0.0.1 --port $Port --reload
exit $LASTEXITCODE
