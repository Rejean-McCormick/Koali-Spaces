# -*- coding: utf-8 -*-
from pathlib import Path
import shutil, tkinter as tk
from tkinter import messagebox

BOOTSTRAP = Path(r"C:\mycode\kOA-Linux\koali-spaces\scripts\bootstrap-koali.ps1")
BOOTSTRAP_BACKUP = Path(r"C:\mycode\kOA-Linux\koali-spaces\.koali-update-backups\konnaxion-target-health-20261006-174333\koali\scripts\bootstrap-koali.ps1")
HELPER = Path(r"C:\mycode\Konnaxion\Konnaxion\koali\verify-konvergence-worlds.py")
HELPER_BACKUP = Path(r"C:\mycode\kOA-Linux\koali-spaces\.koali-update-backups\konnaxion-target-health-20261006-174333\konnaxion\koali\verify-konvergence-worlds.py")
HELPER_EXISTED = False

app = tk.Tk()
app.withdraw()

if not BOOTSTRAP_BACKUP.exists():
    messagebox.showerror("Rollback", "Backup bootstrap introuvable.")
    raise SystemExit(2)

shutil.copy2(BOOTSTRAP_BACKUP, BOOTSTRAP)
if HELPER_EXISTED:
    HELPER.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(HELPER_BACKUP, HELPER)
elif HELPER.exists():
    HELPER.unlink()

messagebox.showinfo("Rollback", "Rollback terminé.")
