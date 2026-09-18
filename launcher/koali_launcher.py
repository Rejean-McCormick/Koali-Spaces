from __future__ import annotations

import argparse
import json
import os
import shutil
import signal
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request
import webbrowser
from datetime import datetime, timezone
from pathlib import Path

from process_registry import (
    ProcessInfo,
    atomic_write_json,
    get_process,
    is_safe_koali_process,
    kill_tree,
    listeners,
    read_json,
    wait_until_gone,
)

CREATE_NEW_PROCESS_GROUP = 0x00000200 if os.name == "nt" else 0
CREATE_NO_WINDOW = 0x08000000 if os.name == "nt" else 0


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class Launcher:
    def __init__(self, *, console: bool, open_browser: bool = True) -> None:
        self.console = console
        self.open_browser = open_browser
        self.launcher_dir = Path(__file__).resolve().parent
        self.repo_root = self.launcher_dir.parent
        self.state_root = self.repo_root / ".koali-dev" / "launcher"
        self.state_root.mkdir(parents=True, exist_ok=True)
        self.session_file = self.state_root / "session.json"
        self.log_dir = self.state_root / "logs"
        self.log_dir.mkdir(parents=True, exist_ok=True)
        stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        self.log_file = self.log_dir / f"launcher-{stamp}.log"
        self._log_handle = self.log_file.open("a", encoding="utf-8", buffering=1)
        self.config = self._load_config()
        self.child: subprocess.Popen | None = None
        self._stopping = False

    def close(self) -> None:
        try:
            self._log_handle.close()
        except Exception:
            pass

    def log(self, message: str) -> None:
        line = f"[{datetime.now().strftime('%H:%M:%S')}] {message}"
        self._log_handle.write(line + "\n")
        if self.console:
            print(line, flush=True)

    def _load_config(self) -> dict:
        path = self.launcher_dir / "launcher-config.json"
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            raise RuntimeError(f"Cannot read launcher config: {path}: {exc}") from exc
        if not isinstance(payload, dict):
            raise RuntimeError(f"Invalid launcher config: {path}")
        return payload

    @property
    def ports(self) -> list[int]:
        return [int(port) for port in self.config.get("reservedPorts", [])]

    @property
    def safe_markers(self) -> list[str]:
        markers = list(self.config.get("safeProcessMarkers", []))
        markers.append(str(self.repo_root) + os.sep)
        return [str(marker) for marker in markers]

    def _message_box(self, title: str, message: str, *, error: bool = False) -> None:
        if self.console:
            return
        try:
            import tkinter
            from tkinter import messagebox

            root = tkinter.Tk()
            root.withdraw()
            if error:
                messagebox.showerror(title, message, parent=root)
            else:
                messagebox.showwarning(title, message, parent=root)
            root.destroy()
        except Exception:
            pass

    def _safe_owned(self, info: ProcessInfo | None) -> bool:
        return bool(info and is_safe_koali_process(info, self.safe_markers))

    def _stop_previous_registered_session(self) -> None:
        session = read_json(self.session_file)
        pid = int(session.get("rootPid") or 0)
        if not pid:
            return
        info = get_process(pid)
        if info is None:
            self.log(f"Previous session PID {pid} is no longer running.")
            return
        recorded_creation = str(session.get("rootCreationDate") or "")
        registry_match = bool(recorded_creation and info.creation_date and recorded_creation == info.creation_date)
        if not registry_match and not self._safe_owned(info):
            self.log(f"Refusing to terminate previous PID {pid}: ownership could not be verified ({info.name}).")
            return
        self.log(f"Stopping previous Koali session tree PID {pid} ({info.name}).")
        kill_tree(pid)
        wait_until_gone(pid, timeout=5.0)

    def _recover_stale_reserved_ports(self) -> list[str]:
        blockers: list[str] = []
        killed: set[int] = set()
        for port, pid in listeners(self.ports):
            if pid in killed:
                continue
            info = get_process(pid)
            if self._safe_owned(info):
                self.log(f"Recovering stale Koali-owned listener on port {port}: PID {pid} ({info.name if info else 'unknown'}).")
                kill_tree(pid)
                wait_until_gone(pid, timeout=5.0)
                killed.add(pid)
                continue
            label = info.name if info else "unknown process"
            blockers.append(f"port {port}: PID {pid} ({label})")
        # Re-read after cleanup because killing one tree may clear several ports.
        remaining = {(port, pid) for port, pid in listeners(self.ports)}
        return [entry for entry in blockers if any(f"port {port}:" in entry and f"PID {pid}" in entry for port, pid in remaining)]

    def _clean_koali_next_trace(self) -> None:
        trace = self.repo_root / ".next" / "trace"
        if not trace.exists():
            return
        try:
            trace.unlink()
            self.log("Removed stale .next\\trace lock artifact.")
        except OSError as exc:
            self.log(f"Could not remove .next\\trace: {exc}")
            raise RuntimeError(
                "Koali's .next\\trace is still locked. A stale Node/Next process is probably still alive."
            ) from exc

    def _check_docker(self) -> None:
        docker = shutil.which("docker.exe") or shutil.which("docker")
        if not docker:
            self.log("Docker CLI not found. Orgo may start degraded.")
            self._message_box("Koali Launcher", "Docker CLI was not found. Koali will start, but Orgo may be degraded.")
            return
        try:
            completed = subprocess.run(
                [docker, "info", "--format", "{{.ServerVersion}}"],
                check=False,
                capture_output=True,
                text=True,
                timeout=5,
                creationflags=CREATE_NO_WINDOW,
            )
        except Exception as exc:
            self.log(f"Docker status check failed: {exc}")
            return
        if completed.returncode == 0:
            self.log(f"Docker ready (server {completed.stdout.strip() or 'unknown'}).")
        else:
            self.log("Docker Desktop is not ready. Orgo may start degraded.")
            self._message_box("Koali Launcher", "Docker Desktop is not ready. Koali will start, but Orgo may be degraded.")

    def _command(self) -> list[str]:
        # Use cmd.exe for .cmd shims on Windows; this is reliable for pnpm/corepack.
        if shutil.which("pnpm.cmd") or shutil.which("pnpm.exe") or shutil.which("pnpm"):
            return ["cmd.exe", "/d", "/s", "/c", "pnpm dev"] if os.name == "nt" else ["pnpm", "dev"]
        if shutil.which("corepack.cmd") or shutil.which("corepack.exe") or shutil.which("corepack"):
            return ["cmd.exe", "/d", "/s", "/c", "corepack pnpm dev"] if os.name == "nt" else ["corepack", "pnpm", "dev"]
        raise RuntimeError("Neither pnpm nor corepack is available on PATH.")

    def _write_session(self, pid: int, command: list[str], status: str = "running") -> None:
        process_info = get_process(pid)
        atomic_write_json(
            self.session_file,
            {
                "schemaVersion": 1,
                "launcherPid": os.getpid(),
                "rootPid": pid,
                "rootCreationDate": process_info.creation_date if process_info else "",
                "repoRoot": str(self.repo_root),
                "command": command,
                "status": status,
                "startedAt": utc_now(),
                "logFile": str(self.log_file),
            },
        )

    def _wait_and_open_browser(self) -> None:
        if not self.open_browser:
            return
        url = str(self.config.get("koaliUrl") or "http://127.0.0.1:4173/")
        timeout = float(self.config.get("startupTimeoutSeconds") or 90)
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            if self.child and self.child.poll() is not None:
                return
            try:
                with urllib.request.urlopen(url, timeout=1.2) as response:
                    if 200 <= response.status < 500:
                        self.log(f"Koali presentation ready: {url}")
                        webbrowser.open(url, new=2)
                        return
            except (urllib.error.URLError, TimeoutError, OSError):
                pass
            time.sleep(0.75)
        self.log(f"Koali presentation did not become reachable within {timeout:.0f}s; leaving runtime running.")

    def prepare(self) -> None:
        if os.name != "nt":
            raise RuntimeError("KS4.2 Launcher currently targets Windows development workspaces.")
        self.log(f"Koali root: {self.repo_root}")
        self._stop_previous_registered_session()
        blockers = self._recover_stale_reserved_ports()
        if blockers:
            joined = "\n".join(blockers)
            raise RuntimeError(
                "Reserved Koali ports are occupied by processes that Koali does not own. "
                "They were not terminated:\n" + joined
            )
        self._clean_koali_next_trace()
        self._check_docker()

    def launch(self) -> int:
        self.prepare()
        command = self._command()
        self.log("Launching: " + " ".join(command))

        kwargs: dict = {
            "cwd": str(self.repo_root),
            "env": os.environ.copy(),
            "creationflags": CREATE_NEW_PROCESS_GROUP,
        }
        if self.console:
            kwargs.update(stdout=None, stderr=None, stdin=None)
        else:
            kwargs.update(stdout=self._log_handle, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL)

        self.child = subprocess.Popen(command, **kwargs)
        self._write_session(self.child.pid, command)

        browser_thread = threading.Thread(target=self._wait_and_open_browser, name="koali-browser", daemon=True)
        browser_thread.start()

        try:
            code = self.child.wait()
        except KeyboardInterrupt:
            self.log("Ctrl+C received; stopping Koali session.")
            self.stop_child()
            code = 130
        finally:
            session = read_json(self.session_file)
            session["status"] = "stopped"
            session["stoppedAt"] = utc_now()
            session["exitCode"] = code if "code" in locals() else None
            atomic_write_json(self.session_file, session)
        self.log(f"Koali session exited with code {code}.")
        if code != 0:
            self._message_box(
                "Koali stopped",
                f"Koali exited with code {code}.\n\nLauncher log:\n{self.log_file}",
                error=True,
            )
        return int(code)

    def stop_child(self) -> None:
        if self._stopping:
            return
        self._stopping = True
        try:
            if self.child and self.child.poll() is None:
                info = get_process(self.child.pid)
                if self._safe_owned(info):
                    kill_tree(self.child.pid)
            else:
                self.stop_only()
        finally:
            self._stopping = False

    def stop_only(self) -> int:
        self._stop_previous_registered_session()
        blockers = self._recover_stale_reserved_ports()
        if blockers:
            self.log("Foreign processes remain on reserved ports; none were terminated: " + "; ".join(blockers))
            return 2
        self.log("Koali-owned development processes are stopped.")
        return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Koali safe Windows development launcher")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--console", action="store_true", help="inherit console output")
    group.add_argument("--gui", action="store_true", help="run silently and log to .koali-dev/launcher/logs")
    parser.add_argument("--stop", action="store_true", help="stop a previous Koali-owned development session and exit")
    parser.add_argument("--no-browser", action="store_true", help="do not open Koali in the default browser")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    console = bool(args.console or not args.gui)
    launcher = Launcher(console=console, open_browser=not args.no_browser)

    def _handle_signal(signum, _frame):
        launcher.log(f"Signal {signum} received; stopping Koali session.")
        launcher.stop_child()

    try:
        signal.signal(signal.SIGTERM, _handle_signal)
        if hasattr(signal, "SIGBREAK"):
            signal.signal(signal.SIGBREAK, _handle_signal)
        if args.stop:
            return launcher.stop_only()
        return launcher.launch()
    except Exception as exc:
        launcher.log(f"ERROR: {exc}")
        launcher._message_box("Koali Launcher", f"Koali could not start.\n\n{exc}\n\nLog:\n{launcher.log_file}", error=True)
        return 1
    finally:
        launcher.close()


if __name__ == "__main__":
    raise SystemExit(main())
