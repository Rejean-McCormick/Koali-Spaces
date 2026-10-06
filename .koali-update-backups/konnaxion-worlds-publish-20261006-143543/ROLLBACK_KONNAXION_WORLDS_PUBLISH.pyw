# -*- coding: utf-8 -*-
from pathlib import Path
import hashlib, shutil, tkinter as tk
from tkinter import messagebox

ROOTS = {
    "koali": Path(r"C:\mycode\kOA-Linux\koali-spaces"),
    "konnaxion": Path(r"C:\mycode\Konnaxion\Konnaxion"),
}
BACKUP = Path(r"C:\mycode\kOA-Linux\koali-spaces\.koali-update-backups\konnaxion-worlds-publish-20261006-143543")
PATCHED = {'koali:scripts/bootstrap-koali.ps1': '478c79f2e1516aea45c83f0698a1b87066b7955ac38fa45705227a14555c6f4b', 'konnaxion:koali/start-api.ps1': '236d838d512f097a3e25b60f337c16fd52e5a7a91f9ca317810e5a8875786f16'}

def digest(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

app = tk.Tk()
app.withdraw()

conflicts = []
for key, expected in PATCHED.items():
    scope, rel = key.split(":", 1)
    target = ROOTS[scope] / rel
    if not target.exists() or digest(target) != expected:
        conflicts.append(key)

if conflicts:
    messagebox.showerror(
        "Rollback Konnaxion Worlds",
        "Rollback refusé : fichiers modifiés après le correctif :\n\n" + "\n".join(conflicts)
    )
    raise SystemExit(2)

for key in PATCHED:
    scope, rel = key.split(":", 1)
    src = BACKUP / scope / rel
    dst = ROOTS[scope] / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)

messagebox.showinfo("Rollback Konnaxion Worlds", "Rollback terminé.")
