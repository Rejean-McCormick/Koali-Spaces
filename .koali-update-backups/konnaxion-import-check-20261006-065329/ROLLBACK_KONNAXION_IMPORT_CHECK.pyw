# -*- coding: utf-8 -*-
from pathlib import Path
import hashlib, shutil, tkinter as tk
from tkinter import messagebox

ROOT = Path(r"C:\mycode\kOA-Linux\koali-spaces")
TARGET = ROOT / r"scripts/bootstrap-koali.ps1"
BACKUP = Path(r"C:\mycode\kOA-Linux\koali-spaces\.koali-update-backups\konnaxion-import-check-20261006-065329\scripts\bootstrap-koali.ps1")
EXPECTED = "043f18b2c1ff2c219c21553c3db43acc7eb560f04256b0b3fac2137f319515c7"

def digest(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for c in iter(lambda: f.read(1024 * 1024), b""):
            h.update(c)
    return h.hexdigest()

app = tk.Tk()
app.withdraw()

if not TARGET.exists() or digest(TARGET) != EXPECTED:
    messagebox.showerror(
        "Rollback Koali",
        "Rollback refusé : bootstrap-koali.ps1 a été modifié après le hotfix."
    )
    raise SystemExit(2)

shutil.copy2(BACKUP, TARGET)
messagebox.showinfo("Rollback Koali", "Rollback terminé.")
