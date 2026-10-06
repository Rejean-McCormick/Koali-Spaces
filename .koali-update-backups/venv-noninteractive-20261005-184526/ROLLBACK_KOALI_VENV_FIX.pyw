# -*- coding: utf-8 -*-
from pathlib import Path
import hashlib, shutil, tkinter as tk
from tkinter import messagebox
ROOT = Path(r"C:\mycode\kOA-Linux\koali-spaces")
BACKUP = Path(r"C:\mycode\kOA-Linux\koali-spaces\.koali-update-backups\venv-noninteractive-20261005-184526")
POST = {'START_KOALI.cmd': 'aef4bc8fccd950b58609d9a6ac750641c22268ba8e74c045fc3557fddc9ca15f', 'scripts/bootstrap-koali.ps1': '7900ad7e7f06d6d26d7af6db0e5f75c301798f27a49e19c34582068eca893801'}

def digest(path):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        for c in iter(lambda:f.read(1024*1024), b''):
            h.update(c)
    return h.hexdigest()

app=tk.Tk(); app.withdraw()
bad=[]
for rel, expected in POST.items():
    p=ROOT/rel
    if p.exists() and digest(p) != expected:
        bad.append(rel)
if bad:
    messagebox.showerror("Rollback Koali", "Rollback refusé : fichiers modifiés après le correctif :\n\n" + "\n".join(bad))
    raise SystemExit(2)
for rel in POST:
    src=BACKUP/rel
    dst=ROOT/rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src,dst)
messagebox.showinfo("Rollback Koali", "Rollback terminé.")
