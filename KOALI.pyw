from __future__ import annotations

import runpy
import sys
from pathlib import Path

launcher = Path(__file__).resolve().parent / "launcher" / "koali_launcher.py"
sys.path.insert(0, str(launcher.parent))
sys.argv = [str(launcher), "--gui"]
runpy.run_path(str(launcher), run_name="__main__")
