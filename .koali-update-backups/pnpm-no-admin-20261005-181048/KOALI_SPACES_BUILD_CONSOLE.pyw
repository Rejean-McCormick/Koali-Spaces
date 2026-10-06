from __future__ import annotations

import hashlib
import json
import os
import platform
import queue
import re
import shutil
import signal
import subprocess
import sys
import threading
import time
import tkinter as tk
from dataclasses import dataclass
from pathlib import Path
from tkinter import filedialog, messagebox, ttk
from tkinter.scrolledtext import ScrolledText
from typing import Callable, Iterable, Sequence

APP_TITLE = "Koali Spaces Build Console"
APP_VERSION = "1.1.0"
DEFAULT_REPO = Path(r"C:\mycode\kOA-Linux\koali-spaces")
SETTINGS_FILE = Path.home() / ".koali-spaces-build-console.json"
ANSI_RE = re.compile(r"\x1b\[[0-9;?]*[ -/]*[@-~]")

CREATE_NO_WINDOW = getattr(subprocess, "CREATE_NO_WINDOW", 0)
CREATE_NEW_PROCESS_GROUP = getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0)


@dataclass
class CommandResult:
    argv: list[str]
    returncode: int
    output: str = ""


class ConsoleError(RuntimeError):
    pass


class KoaliSpacesConsole(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title(f"{APP_TITLE} {APP_VERSION}")
        self.geometry("1180x780")
        self.minsize(980, 680)

        self.events: queue.Queue[tuple] = queue.Queue()
        self.worker: threading.Thread | None = None
        self.current_process: subprocess.Popen | None = None
        self.cancel_event = threading.Event()
        self.dev_process: subprocess.Popen | None = None
        self.dev_thread: threading.Thread | None = None
        self.last_qualification_ok = False

        self.repo_var = tk.StringVar(value=str(self._initial_repo()))
        self.repo_status_var = tk.StringVar(value="Repo: not checked")
        self.lock_status_var = tk.StringVar(value="Lock: not checked")
        self.tool_status_var = tk.StringVar(value="Tools: not checked")
        self.action_status_var = tk.StringVar(value="Ready")
        self.script_var = tk.StringVar()
        self.progress_var = tk.DoubleVar(value=0)

        self._build_ui()
        self.after(80, self._drain_events)
        self.after(250, self.refresh_repository)
        self.protocol("WM_DELETE_WINDOW", self._on_close)

    # ---------- UI ----------

    def _build_ui(self) -> None:
        root = ttk.Frame(self, padding=12)
        root.pack(fill="both", expand=True)

        repo_frame = ttk.LabelFrame(root, text="Repository", padding=10)
        repo_frame.pack(fill="x")

        ttk.Entry(repo_frame, textvariable=self.repo_var).pack(
            side="left", fill="x", expand=True, padx=(0, 8)
        )
        ttk.Button(repo_frame, text="Browse…", command=self.browse_repo).pack(side="left")
        ttk.Button(repo_frame, text="Refresh", command=self.refresh_repository).pack(
            side="left", padx=(8, 0)
        )
        ttk.Button(repo_frame, text="Open folder", command=self.open_repo_folder).pack(
            side="left", padx=(8, 0)
        )

        status = ttk.Frame(root, padding=(0, 10, 0, 6))
        status.pack(fill="x")
        ttk.Label(status, textvariable=self.repo_status_var).pack(side="left", padx=(0, 20))
        ttk.Label(status, textvariable=self.lock_status_var).pack(side="left", padx=(0, 20))
        ttk.Label(status, textvariable=self.tool_status_var).pack(side="left", padx=(0, 20))

        actions = ttk.LabelFrame(root, text="Koali Spaces workflow", padding=10)
        actions.pack(fill="x", pady=(0, 10))

        self.prepare_btn = ttk.Button(
            actions, text="1  PREPARE / LOCK", command=lambda: self.start_job("PREPARE / LOCK", self.job_prepare)
        )
        self.validate_btn = ttk.Button(
            actions, text="2  VALIDATE", command=lambda: self.start_job("VALIDATE", self.job_validate)
        )
        self.build_btn = ttk.Button(
            actions, text="3  BUILD", command=lambda: self.start_job("BUILD", self.job_build)
        )
        self.qualify_btn = ttk.Button(
            actions, text="QUALIFY ALL", command=lambda: self.start_job("QUALIFY ALL", self.job_qualify)
        )
        self.ci_btn = ttk.Button(
            actions, text="CI PARITY", command=lambda: self.start_job("CI PARITY", self.job_ci_parity)
        )
        self.preflight_btn = ttk.Button(
            actions, text="PREFLIGHT", command=lambda: self.start_job("PREFLIGHT", self.job_preflight)
        )

        for i, widget in enumerate(
            [self.prepare_btn, self.validate_btn, self.build_btn, self.qualify_btn, self.ci_btn, self.preflight_btn]
        ):
            widget.grid(row=0, column=i, padx=4, pady=4, sticky="ew")
            actions.columnconfigure(i, weight=1)

        runtime = ttk.LabelFrame(root, text="Runtime and Git handoff", padding=10)
        runtime.pack(fill="x", pady=(0, 10))

        self.dev_btn = ttk.Button(runtime, text="START DEV", command=self.start_dev)
        self.stop_btn = ttk.Button(runtime, text="STOP", command=self.stop_active)
        self.git_btn = ttk.Button(
            runtime, text="GIT HANDOFF", command=lambda: self.start_job("GIT HANDOFF", self.job_git_handoff)
        )
        self.copy_btn = ttk.Button(runtime, text="COPY LAST LOG", command=self.copy_log)
        self.clear_btn = ttk.Button(runtime, text="CLEAR LOG", command=self.clear_log)

        for i, widget in enumerate(
            [self.dev_btn, self.stop_btn, self.git_btn, self.copy_btn, self.clear_btn]
        ):
            widget.grid(row=0, column=i, padx=4, pady=4, sticky="ew")
            runtime.columnconfigure(i, weight=1)

        scripts = ttk.LabelFrame(root, text="package.json scripts", padding=10)
        scripts.pack(fill="x", pady=(0, 10))
        self.script_combo = ttk.Combobox(
            scripts, textvariable=self.script_var, state="readonly", width=40
        )
        self.script_combo.pack(side="left", fill="x", expand=True)
        self.run_script_btn = ttk.Button(
            scripts, text="Run selected script", command=self.run_selected_script
        )
        self.run_script_btn.pack(side="left", padx=(8, 0))

        progress = ttk.Frame(root)
        progress.pack(fill="x", pady=(0, 8))
        ttk.Progressbar(
            progress, maximum=100, variable=self.progress_var, mode="determinate"
        ).pack(side="left", fill="x", expand=True)
        ttk.Label(progress, textvariable=self.action_status_var, width=38).pack(
            side="left", padx=(10, 0)
        )

        self.log = ScrolledText(root, wrap="word", height=25, font=("Consolas", 10))
        self.log.pack(fill="both", expand=True)
        self.log.configure(state="disabled")
        self.log.tag_configure("pass", foreground="#166534")
        self.log.tag_configure("fail", foreground="#991b1b")
        self.log.tag_configure("warn", foreground="#92400e")
        self.log.tag_configure("cmd", foreground="#1d4ed8")
        self.log.tag_configure("head", font=("Consolas", 10, "bold"))

        note = (
            "Git operations are read-only. This console never commits, pushes, checks out, "
            "resets, cleans, or changes repository history."
        )
        ttk.Label(root, text=note).pack(anchor="w", pady=(8, 0))

    # ---------- repository ----------

    def _initial_repo(self) -> Path:
        try:
            settings = json.loads(SETTINGS_FILE.read_text(encoding="utf-8"))
            saved = Path(settings.get("repo", ""))
            if saved:
                return saved
        except Exception:
            pass

        script_dir = Path(__file__).resolve().parent
        if (script_dir / "package.json").is_file():
            return script_dir
        return DEFAULT_REPO

    def repo(self) -> Path:
        return Path(self.repo_var.get().strip()).expanduser()

    def browse_repo(self) -> None:
        initial = self.repo()
        selected = filedialog.askdirectory(
            title="Select Koali Spaces repository",
            initialdir=str(initial if initial.exists() else initial.parent),
        )
        if selected:
            self.repo_var.set(selected)
            self.refresh_repository()

    def _package_json(self) -> dict:
        path = self.repo() / "package.json"
        if not path.is_file():
            raise ConsoleError(f"package.json not found: {path}")
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            raise ConsoleError(f"Invalid package.json: {exc}") from exc
        if data.get("name") != "koali-spaces":
            raise ConsoleError(
                f'Expected package name "koali-spaces", got {data.get("name")!r}.'
            )
        return data

    def expected_pnpm(self) -> str:
        package = self._package_json()
        manager = str(package.get("packageManager", ""))
        match = re.fullmatch(r"pnpm@(.+)", manager)
        if not match:
            raise ConsoleError(
                'package.json must pin packageManager as "pnpm@<version>".'
            )
        return match.group(1)

    def refresh_repository(self) -> None:
        try:
            package = self._package_json()
            repo = self.repo()
            self.repo_status_var.set(
                f'Repo: OK  {package.get("name")} {package.get("version", "")}'
            )
            lock = repo / "pnpm-lock.yaml"
            self.lock_status_var.set(
                "Lock: present" if lock.is_file() else "Lock: MISSING — first PREPARE will create it"
            )
            scripts = sorted((package.get("scripts") or {}).keys())
            self.script_combo["values"] = scripts
            if scripts and self.script_var.get() not in scripts:
                self.script_var.set(scripts[0])
            self._save_settings()
        except Exception as exc:
            self.repo_status_var.set(f"Repo: ERROR — {exc}")
            self.lock_status_var.set("Lock: unknown")
            self.script_combo["values"] = []
            self.script_var.set("")

    def _save_settings(self) -> None:
        try:
            SETTINGS_FILE.write_text(
                json.dumps({"repo": str(self.repo())}, indent=2),
                encoding="utf-8",
            )
        except Exception:
            pass

    # ---------- logging / threading ----------

    def emit(self, kind: str, *payload) -> None:
        """Thread-safe UI event emitter for variable event payloads."""
        self.events.put((kind, *payload))

    def log_line(self, text: str, tag: str | None = None) -> None:
        self.log.configure(state="normal")
        self.log.insert("end", text.rstrip() + "\n", tag)
        self.log.see("end")
        self.log.configure(state="disabled")

    def _drain_events(self) -> None:
        try:
            while True:
                event = self.events.get_nowait()
                kind = event[0]
                if kind == "log":
                    _, text, tag = event
                    self.log_line(text, tag)
                elif kind == "status":
                    _, text = event
                    self.action_status_var.set(text)
                elif kind == "progress":
                    _, value = event
                    self.progress_var.set(value)
                elif kind == "tools":
                    _, text = event
                    self.tool_status_var.set(text)
                elif kind == "done":
                    _, ok, label = event
                    self._job_finished(ok, label)
                elif kind == "clipboard":
                    _, text = event
                    self.clipboard_clear()
                    self.clipboard_append(text)
                    self.update_idletasks()
                    self.log_line("[PASS] Git handoff copied to clipboard.", "pass")
        except queue.Empty:
            pass
        self.after(80, self._drain_events)

    def start_job(self, label: str, func: Callable[[], None]) -> None:
        if self.worker and self.worker.is_alive():
            messagebox.showwarning(APP_TITLE, "Another workflow is already running.")
            return
        if self.dev_process and self.dev_process.poll() is None:
            messagebox.showwarning(
                APP_TITLE, "Stop the development server before running this workflow."
            )
            return

        try:
            self._package_json()
        except Exception as exc:
            messagebox.showerror(APP_TITLE, str(exc))
            return

        self.cancel_event.clear()
        self.progress_var.set(0)
        self.action_status_var.set(label)
        self._set_busy(True)
        self.log_line("")
        self.log_line(f"=== {label} ===", "head")

        def runner() -> None:
            ok = False
            try:
                func()
                ok = True
                self.emit("log", f"[PASS] {label}", "pass")
            except ConsoleError as exc:
                self.emit("log", f"[FAIL] {exc}", "fail")
            except Exception as exc:
                self.emit("log", f"[FAIL] Unexpected error: {exc}", "fail")
            finally:
                self.emit("done", ok, label)

        self.worker = threading.Thread(target=runner, daemon=True)
        self.worker.start()

    def _job_finished(self, ok: bool, label: str) -> None:
        self._set_busy(False)
        self.progress_var.set(100 if ok else 0)
        self.action_status_var.set(f"{label}: {'PASS' if ok else 'FAIL'}")
        if label in {"QUALIFY ALL", "CI PARITY"}:
            self.last_qualification_ok = ok
        self.refresh_repository()

    def _set_busy(self, busy: bool) -> None:
        state = "disabled" if busy else "normal"
        for widget in [
            self.prepare_btn,
            self.validate_btn,
            self.build_btn,
            self.qualify_btn,
            self.ci_btn,
            self.preflight_btn,
            self.git_btn,
            self.run_script_btn,
            self.dev_btn,
        ]:
            widget.configure(state=state)
        self.stop_btn.configure(state="normal")

    # ---------- process execution ----------

    @staticmethod
    def _display_command(argv: Sequence[str]) -> str:
        def quote(value: str) -> str:
            if not value or re.search(r'[\s"&|<>^()]', value):
                return '"' + value.replace('"', '\\"') + '"'
            return value
        return " ".join(quote(str(x)) for x in argv)

    def _popen_argv(self, argv: Sequence[str]) -> tuple[Sequence[str] | str, bool]:
        argv = [str(x) for x in argv]
        if os.name == "nt":
            # pnpm/corepack/npm shims are commonly .CMD files on Windows.
            return subprocess.list2cmdline(argv), True
        return argv, False

    def run_command(
        self,
        argv: Sequence[str],
        *,
        required: bool = True,
        capture_only: bool = False,
        env_extra: dict[str, str] | None = None,
    ) -> CommandResult:
        if self.cancel_event.is_set():
            raise ConsoleError("Workflow cancelled.")

        cwd = self.repo()
        display = self._display_command(argv)
        if capture_only:
            self.emit("log", f"> {display}  [check]", "cmd")
        else:
            self.emit("log", f"> {display}", "cmd")

        env = os.environ.copy()
        env["FORCE_COLOR"] = "0"
        env["NO_COLOR"] = "1"
        if env_extra:
            env.update(env_extra)

        command, use_shell = self._popen_argv(argv)
        kwargs = dict(
            cwd=str(cwd),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            bufsize=1,
            env=env,
            shell=use_shell,
        )
        if os.name == "nt":
            kwargs["creationflags"] = CREATE_NO_WINDOW | CREATE_NEW_PROCESS_GROUP
        else:
            kwargs["start_new_session"] = True

        try:
            proc = subprocess.Popen(command, **kwargs)
        except FileNotFoundError:
            result = CommandResult(list(argv), 127, "")
            if required:
                raise ConsoleError(f"Command not found: {argv[0]}")
            return result
        except OSError as exc:
            result = CommandResult(list(argv), 126, str(exc))
            if required:
                raise ConsoleError(f"Could not start {argv[0]}: {exc}")
            return result

        self.current_process = proc
        lines: list[str] = []
        assert proc.stdout is not None

        while True:
            if self.cancel_event.is_set() and proc.poll() is None:
                self._terminate_process_tree(proc)
            line = proc.stdout.readline()
            if line:
                clean = ANSI_RE.sub("", line.rstrip("\r\n"))
                lines.append(clean)
                if not capture_only and clean:
                    self.emit("log", clean, None)
            elif proc.poll() is not None:
                break
            else:
                time.sleep(0.03)

        returncode = proc.wait()
        self.current_process = None
        output = "\n".join(lines).strip()

        if returncode != 0 and required:
            raise ConsoleError(f"Command failed ({returncode}): {display}")
        return CommandResult(list(argv), returncode, output)

    def _terminate_process_tree(self, proc: subprocess.Popen) -> None:
        if proc.poll() is not None:
            return
        try:
            if os.name == "nt":
                subprocess.run(
                    ["taskkill", "/PID", str(proc.pid), "/T", "/F"],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    creationflags=CREATE_NO_WINDOW,
                    check=False,
                )
            else:
                os.killpg(proc.pid, signal.SIGTERM)
        except Exception:
            try:
                proc.terminate()
            except Exception:
                pass

    # ---------- tools ----------

    def pnpm_prefix(self) -> list[str]:
        if shutil.which("pnpm"):
            return ["pnpm"]
        if shutil.which("corepack"):
            return ["corepack", "pnpm"]
        raise ConsoleError(
            "Neither pnpm nor Corepack is available. Install a Node.js toolchain with Corepack/pnpm."
        )

    def pnpm(self, *args: str, required: bool = True) -> CommandResult:
        return self.run_command([*self.pnpm_prefix(), *args], required=required)

    def check_toolchain(self, *, try_enable: bool) -> None:
        self.emit("status", "Checking Node / Corepack / pnpm…")
        self.emit("log", "[INFO] Checking toolchain…", None)
        node = self.run_command(["node", "--version"], capture_only=True)
        node_version = node.output.strip().lstrip("v")
        major_match = re.match(r"(\d+)", node_version)
        if not major_match or int(major_match.group(1)) < 20:
            raise ConsoleError(f"Node.js >=20 required; found {node.output.strip() or 'unknown'}.")

        corepack = self.run_command(
            ["corepack", "--version"], required=False, capture_only=True
        )

        if try_enable and corepack.returncode == 0:
            enabled = self.run_command(["corepack", "enable"], required=False)
            if enabled.returncode != 0:
                self.emit(
                    "log",
                    "[WARN] corepack enable failed; continuing with the available pnpm/Corepack runner.",
                    "warn",
                )

        expected = self.expected_pnpm()
        version = self.run_command(
            [*self.pnpm_prefix(), "--version"], capture_only=True
        ).output.strip()
        if version != expected:
            raise ConsoleError(
                f"pnpm {expected} required by package.json; active version is {version or 'unknown'}."
            )

        runner = "pnpm" if shutil.which("pnpm") else "corepack pnpm"
        self.emit(
            "tools",
            f"Tools: Node {node.output.strip()} | pnpm {version} via {runner}",
        )
        self.emit("log", f"[PASS] Node {node.output.strip()}", "pass")
        self.emit("log", f"[PASS] pnpm {version}", "pass")

    def require_scripts(self, names: Iterable[str]) -> None:
        scripts = self._package_json().get("scripts") or {}
        missing = [name for name in names if name not in scripts]
        if missing:
            raise ConsoleError(
                "Required package.json scripts missing: " + ", ".join(missing)
            )

    # ---------- workflows ----------

    def job_preflight(self) -> None:
        self.emit("progress", 10)
        package = self._package_json()
        self.require_scripts(["check:dependency-lock", "validate", "build"])
        self.emit("log", f'[PASS] package.json name = {package["name"]}', "pass")
        self.emit("progress", 35)
        self.check_toolchain(try_enable=False)
        self.emit("progress", 70)

        lock = self.repo() / "pnpm-lock.yaml"
        if lock.is_file():
            self.emit(
                "log",
                f"[PASS] pnpm-lock.yaml present ({self._sha256(lock)[:16]}…)",
                "pass",
            )
        else:
            self.emit(
                "log",
                "[WARN] pnpm-lock.yaml is missing. PREPARE / LOCK will create it.",
                "warn",
            )

        git = self.run_command(["git", "--version"], required=False, capture_only=True)
        if git.returncode == 0:
            self.emit("log", f"[PASS] {git.output.strip()}", "pass")
        else:
            self.emit("log", "[WARN] Git not available to this process.", "warn")
        self.emit("progress", 100)

    def job_prepare(self) -> None:
        self.require_scripts(["check:dependency-lock"])
        self.emit("progress", 5)
        self.check_toolchain(try_enable=True)
        self.emit("progress", 20)

        lock = self.repo() / "pnpm-lock.yaml"
        if lock.is_file():
            self.emit("log", "[INFO] Existing lock detected: frozen install.", None)
            self.pnpm("install", "--frozen-lockfile")
            self.emit("progress", 60)
        else:
            self.emit(
                "log",
                "[INFO] First dependency resolution: pnpm install will create pnpm-lock.yaml.",
                None,
            )
            self.pnpm("install")
            if not lock.is_file():
                raise ConsoleError("pnpm install completed but pnpm-lock.yaml was not created.")
            self.emit("progress", 50)
            self.pnpm("run", "check:dependency-lock")
            self.emit("progress", 65)
            self.emit(
                "log",
                "[INFO] Verifying the newly created lock with a frozen install.",
                None,
            )
            self.pnpm("install", "--frozen-lockfile")
            self.emit("progress", 82)

        self.pnpm("run", "check:dependency-lock")
        self.emit("progress", 95)
        self.emit(
            "log",
            f"[PASS] pnpm-lock.yaml SHA256 {self._sha256(lock)}",
            "pass",
        )
        self.emit("progress", 100)

    def job_validate(self) -> None:
        self.require_scripts(["validate"])
        self._require_lock()
        self.check_toolchain(try_enable=False)
        self.emit("progress", 15)
        self.pnpm("run", "validate")
        self.emit("progress", 100)

    def job_build(self) -> None:
        self.require_scripts(["build"])
        self._require_lock()
        self.check_toolchain(try_enable=False)
        self.emit("progress", 15)
        self.pnpm("run", "build")
        self.emit("progress", 100)

    def job_qualify(self) -> None:
        self.require_scripts(["check:dependency-lock", "validate", "build"])

        self.emit("status", "QUALIFY 1/4 — dependency lock")
        self.emit("log", "--- Phase 1/4: dependency lock ---", "head")
        self.job_prepare()
        self.emit("progress", 30)

        self.emit("status", "QUALIFY 2/4 — validation")
        self.emit("log", "--- Phase 2/4: validation ---", "head")
        self.pnpm("run", "validate")
        self.emit("progress", 60)

        self.emit("status", "QUALIFY 3/4 — production build")
        self.emit("log", "--- Phase 3/4: production build ---", "head")
        self.pnpm("run", "build")
        self.emit("progress", 88)

        self.emit("status", "QUALIFY 4/4 — Git handoff")
        self.emit("log", "--- Phase 4/4: Git read-only handoff ---", "head")
        self._git_handoff(copy=False)
        self.emit("progress", 100)

    def job_ci_parity(self) -> None:
        self.require_scripts(["check:dependency-lock", "validate", "build"])
        self._require_lock()
        self.check_toolchain(try_enable=True)

        self.emit("log", "--- CI 1/4: frozen dependency install ---", "head")
        self.pnpm("install", "--frozen-lockfile")
        self.emit("progress", 25)

        self.emit("log", "--- CI 2/4: dependency lock contract ---", "head")
        self.pnpm("run", "check:dependency-lock")
        self.emit("progress", 40)

        self.emit("log", "--- CI 3/4: validation ---", "head")
        self.pnpm("run", "validate")
        self.emit("progress", 70)

        self.emit("log", "--- CI 4/4: build ---", "head")
        self.pnpm("run", "build")
        self.emit("progress", 100)

    def _require_lock(self) -> None:
        if not (self.repo() / "pnpm-lock.yaml").is_file():
            raise ConsoleError("pnpm-lock.yaml is missing. Run PREPARE / LOCK first.")

    # ---------- package scripts ----------

    def run_selected_script(self) -> None:
        script = self.script_var.get().strip()
        if not script:
            messagebox.showwarning(APP_TITLE, "Select a package.json script first.")
            return

        def job() -> None:
            package = self._package_json()
            if script not in (package.get("scripts") or {}):
                raise ConsoleError(f"Unknown package.json script: {script}")
            self.check_toolchain(try_enable=False)
            self.pnpm("run", script)
            self.emit("progress", 100)

        self.start_job(f"pnpm run {script}", job)

    # ---------- dev server ----------

    def start_dev(self) -> None:
        if self.worker and self.worker.is_alive():
            messagebox.showwarning(APP_TITLE, "Wait for the current workflow to finish.")
            return
        if self.dev_process and self.dev_process.poll() is None:
            messagebox.showinfo(APP_TITLE, "Development server is already running.")
            return

        try:
            self._package_json()
            self._require_lock()
            self.require_scripts(["dev"])
        except Exception as exc:
            messagebox.showerror(APP_TITLE, str(exc))
            return

        self.log_line("")
        self.log_line("=== START DEV ===", "head")
        self.cancel_event.clear()
        self.action_status_var.set("DEV server starting")
        self._set_busy(True)

        def runner() -> None:
            try:
                self.check_toolchain(try_enable=False)
                argv = [*self.pnpm_prefix(), "run", "dev"]
                self.emit("log", f"> {self._display_command(argv)}", "cmd")

                command, use_shell = self._popen_argv(argv)
                env = os.environ.copy()
                env["FORCE_COLOR"] = "0"
                env["NO_COLOR"] = "1"

                kwargs = dict(
                    cwd=str(self.repo()),
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    encoding="utf-8",
                    errors="replace",
                    bufsize=1,
                    env=env,
                    shell=use_shell,
                )
                if os.name == "nt":
                    kwargs["creationflags"] = CREATE_NO_WINDOW | CREATE_NEW_PROCESS_GROUP
                else:
                    kwargs["start_new_session"] = True

                proc = subprocess.Popen(command, **kwargs)
                self.dev_process = proc
                self.emit("status", f"DEV running — PID {proc.pid}")

                assert proc.stdout is not None
                for line in iter(proc.stdout.readline, ""):
                    clean = ANSI_RE.sub("", line.rstrip("\r\n"))
                    if clean:
                        self.emit("log", clean, None)
                    if proc.poll() is not None:
                        break

                rc = proc.wait()
                if rc == 0:
                    self.emit("log", "[PASS] Development server stopped.", "pass")
                else:
                    self.emit("log", f"[WARN] Development server exited with code {rc}.", "warn")
            except Exception as exc:
                self.emit("log", f"[FAIL] DEV: {exc}", "fail")
            finally:
                self.dev_process = None
                self.events.put(("done", True, "DEV"))

        self.dev_thread = threading.Thread(target=runner, daemon=True)
        self.dev_thread.start()

    def stop_active(self) -> None:
        self.cancel_event.set()
        proc = self.current_process
        if proc and proc.poll() is None:
            self.log_line("[WARN] Cancelling active workflow…", "warn")
            self._terminate_process_tree(proc)
        dev = self.dev_process
        if dev and dev.poll() is None:
            self.log_line("[WARN] Stopping development server…", "warn")
            self._terminate_process_tree(dev)

    # ---------- Git read-only ----------

    def job_git_handoff(self) -> None:
        self._git_handoff(copy=True)
        self.emit("progress", 100)

    def _git_handoff(self, *, copy: bool) -> str:
        git = self.run_command(["git", "--version"], required=False, capture_only=True)
        if git.returncode != 0:
            raise ConsoleError("Git is not available.")

        remote = self.run_command(
            ["git", "remote", "get-url", "origin"], required=False, capture_only=True
        )
        branch = self.run_command(
            ["git", "branch", "--show-current"], required=False, capture_only=True
        )
        commit = self.run_command(
            ["git", "rev-parse", "HEAD"], required=False, capture_only=True
        )
        status = self.run_command(
            ["git", "status", "--porcelain=v1"], required=False, capture_only=True
        )

        if commit.returncode != 0:
            raise ConsoleError("Current Git commit could not be read.")

        lock = self.repo() / "pnpm-lock.yaml"
        package = self.repo() / "package.json"

        tree_state = "CLEAN" if not status.output.strip() else "DIRTY"
        lines = [
            "Koali Spaces Git handoff",
            f"Repository: {remote.output.strip() or '(origin not configured)'}",
            f"Branch: {branch.output.strip() or '(detached/unknown)'}",
            f"Commit: {commit.output.strip()}",
            f"Working tree: {tree_state}",
            f"package.json SHA256: {self._sha256(package)}",
            f"pnpm-lock.yaml SHA256: {self._sha256(lock) if lock.is_file() else '(missing)'}",
            f"Last local qualification in this session: {'PASS' if self.last_qualification_ok else 'not recorded'}",
        ]
        text = "\n".join(lines)

        self.emit("log", text, None)
        if tree_state == "CLEAN":
            self.emit("log", "[PASS] Git working tree is clean.", "pass")
        else:
            self.emit(
                "log",
                "[WARN] Git working tree is dirty. Commit/push remains a manual user action.",
                "warn",
            )
        if copy:
            self.events.put(("clipboard", text))
        return text

    # ---------- misc ----------

    @staticmethod
    def _sha256(path: Path) -> str:
        h = hashlib.sha256()
        with path.open("rb") as handle:
            for chunk in iter(lambda: handle.read(1024 * 1024), b""):
                h.update(chunk)
        return h.hexdigest()

    def open_repo_folder(self) -> None:
        path = self.repo()
        if not path.exists():
            messagebox.showerror(APP_TITLE, f"Folder does not exist:\n{path}")
            return
        try:
            if os.name == "nt":
                os.startfile(path)  # type: ignore[attr-defined]
            elif sys.platform == "darwin":
                subprocess.Popen(["open", str(path)])
            else:
                subprocess.Popen(["xdg-open", str(path)])
        except Exception as exc:
            messagebox.showerror(APP_TITLE, str(exc))

    def copy_log(self) -> None:
        text = self.log.get("1.0", "end-1c")
        self.clipboard_clear()
        self.clipboard_append(text)
        self.update_idletasks()

    def clear_log(self) -> None:
        self.log.configure(state="normal")
        self.log.delete("1.0", "end")
        self.log.configure(state="disabled")

    def _on_close(self) -> None:
        running = (
            (self.worker and self.worker.is_alive())
            or (self.dev_process and self.dev_process.poll() is None)
        )
        if running:
            if not messagebox.askyesno(
                APP_TITLE, "A process is still running. Stop it and close?"
            ):
                return
            self.stop_active()
        self.destroy()


def main() -> int:
    if sys.version_info < (3, 11):
        root = tk.Tk()
        root.withdraw()
        messagebox.showerror(APP_TITLE, "Python 3.11 or newer is required.")
        root.destroy()
        return 2

    app = KoaliSpacesConsole()
    app.mainloop()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
