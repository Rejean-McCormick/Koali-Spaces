from __future__ import annotations
import json
import shutil
import tkinter as tk
from pathlib import Path
from tkinter import messagebox

HERE = Path(__file__).resolve().parent
ACTIONS = HERE / "applied-actions.json"

root = tk.Tk()
root.withdraw()
try:
    actions = json.loads(ACTIONS.read_text(encoding="utf-8-sig"))
    if not isinstance(actions, list):
        raise RuntimeError("applied-actions.json invalide")
    if not messagebox.askyesno(
        "Koali — Rollback",
        "Restaurer l'état précédent à partir de ce backup ?\n\n" + str(HERE),
    ):
        raise SystemExit(0)
    for action in reversed(actions):
        target = Path(action["target"])
        if action.get("existedBefore"):
            backup = Path(action["backup"])
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(backup, target)
        elif target.is_file():
            target.unlink()
    messagebox.showinfo("Koali — Rollback", "Rollback Koali terminé.")
except SystemExit:
    pass
except Exception as exc:
    messagebox.showerror("Koali — Rollback", f"Échec du rollback :\n\n{exc}")
finally:
    root.destroy()
