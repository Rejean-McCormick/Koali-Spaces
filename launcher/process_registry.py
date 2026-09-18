from __future__ import annotations

import json
import os
import subprocess
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

CREATE_NO_WINDOW = 0x08000000 if os.name == "nt" else 0


@dataclass(frozen=True)
class ProcessInfo:
    pid: int
    name: str
    executable: str
    command_line: str
    parent_pid: int = 0
    creation_date: str = ""

    @property
    def haystack(self) -> str:
        return f"{self.name}\n{self.executable}\n{self.command_line}".lower()


def _powershell_executable() -> str:
    # Windows PowerShell exists on supported Windows versions; prefer pwsh when available.
    import shutil

    return shutil.which("pwsh.exe") or shutil.which("powershell.exe") or "powershell.exe"


def _run_powershell(script: str, *, timeout: float = 10.0) -> str:
    completed = subprocess.run(
        [_powershell_executable(), "-NoLogo", "-NoProfile", "-NonInteractive", "-Command", script],
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout,
        creationflags=CREATE_NO_WINDOW,
    )
    if completed.returncode != 0:
        raise RuntimeError((completed.stderr or completed.stdout or "PowerShell command failed").strip())
    return completed.stdout.strip()


def _json_rows(raw: str) -> list[dict]:
    if not raw:
        return []
    parsed = json.loads(raw)
    if isinstance(parsed, list):
        return [row for row in parsed if isinstance(row, dict)]
    return [parsed] if isinstance(parsed, dict) else []


def get_process(pid: int) -> ProcessInfo | None:
    if os.name != "nt" or pid <= 0:
        return None
    script = (
        f"$p = Get-CimInstance Win32_Process -Filter \"ProcessId = {int(pid)}\" -ErrorAction SilentlyContinue; "
        "if ($p) { $p | Select-Object ProcessId,Name,ExecutablePath,CommandLine,ParentProcessId,CreationDate | ConvertTo-Json -Compress }"
    )
    try:
        rows = _json_rows(_run_powershell(script))
    except Exception:
        return None
    if not rows:
        return None
    row = rows[0]
    return ProcessInfo(
        pid=int(row.get("ProcessId") or pid),
        name=str(row.get("Name") or ""),
        executable=str(row.get("ExecutablePath") or ""),
        command_line=str(row.get("CommandLine") or ""),
        parent_pid=int(row.get("ParentProcessId") or 0),
        creation_date=str(row.get("CreationDate") or ""),
    )


def listeners(ports: Iterable[int]) -> list[tuple[int, int]]:
    wanted = sorted({int(port) for port in ports if int(port) > 0})
    if os.name != "nt" or not wanted:
        return []
    port_expr = ",".join(str(port) for port in wanted)
    script = (
        f"$wanted = @({port_expr}); "
        "$rows = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | "
        "Where-Object { $wanted -contains $_.LocalPort } | "
        "Select-Object LocalPort,OwningProcess; "
        "if ($rows) { $rows | ConvertTo-Json -Compress }"
    )
    try:
        rows = _json_rows(_run_powershell(script))
    except Exception:
        return []
    result: list[tuple[int, int]] = []
    for row in rows:
        try:
            result.append((int(row["LocalPort"]), int(row["OwningProcess"])))
        except (KeyError, TypeError, ValueError):
            continue
    return result


def is_safe_koali_process(info: ProcessInfo, markers: Iterable[str]) -> bool:
    haystack = info.haystack
    if any(token in haystack for token in ("com.docker", "docker desktop", "docker-proxy", "dockerd.exe")):
        return False
    normalized_markers = [marker.replace("/", "\\").lower() for marker in markers if marker]
    return any(marker in haystack.replace("/", "\\") for marker in normalized_markers)


def kill_tree(pid: int, *, timeout: float = 12.0) -> bool:
    if os.name != "nt" or pid <= 0:
        return False
    completed = subprocess.run(
        ["taskkill.exe", "/PID", str(int(pid)), "/T", "/F"],
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout,
        creationflags=CREATE_NO_WINDOW,
    )
    # taskkill returns 128 when the process has already disappeared; treat that as success.
    return completed.returncode in (0, 128)


def wait_until_gone(pid: int, timeout: float = 5.0) -> bool:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if get_process(pid) is None:
            return True
        time.sleep(0.15)
    return get_process(pid) is None


def atomic_write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(temp, path)


def read_json(path: Path) -> dict:
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    return raw if isinstance(raw, dict) else {}
