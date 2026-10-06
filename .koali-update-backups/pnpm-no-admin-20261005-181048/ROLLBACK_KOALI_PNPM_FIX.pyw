# -*- coding: utf-8 -*-
from pathlib import Path
import hashlib, shutil, tkinter as tk
from tkinter import messagebox

ROOT = Path(r"C:\mycode\kOA-Linux\koali-spaces")
BACKUP = Path(r"C:\mycode\kOA-Linux\koali-spaces\.koali-update-backups\pnpm-no-admin-20261005-181048")
PATCHED = {'scripts/bootstrap-koali.ps1': '9c5e9c62581e079ab7eab0141bebf00ebb607c6b12b54c2dd51ea180658845cc', 'launcher/koali_launcher.py': '52ff84ed7e7388a16b4d525ec095a4091a38f2b78e573a27b19e5406392cb8fe', 'KOALI_SPACES_BUILD_CONSOLE.pyw': 'd31773b4bf74b848e2a73f7c7dfef41e42e60c1527c12fc13844f013c9a401b1'}

def digest(path):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        for c in iter(lambda:f.read(1024*1024), b''):
            h.update(c)
    return h.hexdigest()

app=tk.Tk(); app.withdraw()
conflicts=[]
for rel, expected in PATCHED.items():
    target=ROOT/rel
    if target.exists() and digest(target) != expected:
        conflicts.append(rel)
if conflicts:
    messagebox.showerror("Rollback Koali", "Rollback refusé : fichiers modifiés après le hotfix :\n\n" + "\n".join(conflicts))
    raise SystemExit(2)
for rel in PATCHED:
    src=BACKUP/rel
    dst=ROOT/rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src,dst)
messagebox.showinfo("Rollback Koali", "Rollback terminé.")
