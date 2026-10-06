# -*- coding: utf-8 -*-
from pathlib import Path
import hashlib, shutil, tkinter as tk
from tkinter import messagebox

KOALI = Path(r"C:\mycode\kOA-Linux\koali-spaces")
KONNAXION = Path(r"C:\mycode\Konnaxion\Konnaxion")
BACKUP = Path(r"C:\mycode\kOA-Linux\koali-spaces\.koali-update-backups\konnaxion-integration-20261006-064000")
PATCHED = {'koali:config/ecosystem.catalog.json': '6fe9c3ee9bea61e19eeb16a95f6bfa8de8d73f54c527ee22d034ac802c3812c8', 'koali:launcher/launcher-config.json': 'e6bf7b80331b7c7fb3edf10bd988cace0817b192ce55cdc20fecfa2633fa04be', 'koali:tests-runtime/ecosystem-linked-snapshot.test.mjs': 'ab883cacc0188e0c88dc21cad5c26e29196d77e07428cf482cbb83fb92cc8fa2', 'koali:scripts/bootstrap-koali.ps1': '385dd73ffdc5640f9798b36f11279e6f25e112e9f534cbeb0701ba625dd1d471', 'konnaxion:koali.integration.json': '37770d137cbc7de57a537db0e53fca83276f3b2847c6459574df0fcff4279c29', 'konnaxion:koali/start-api.ps1': 'c54225ab66a4970ba1c7a8c1562d205217d060420e9783c35a070f7fb494153b'}

def digest(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

roots = {"koali": KOALI, "konnaxion": KONNAXION}
app = tk.Tk()
app.withdraw()

conflicts = []
for key, expected in PATCHED.items():
    scope, rel = key.split(":", 1)
    target = roots[scope] / rel
    if not target.exists() or digest(target) != expected:
        conflicts.append(key)

if conflicts:
    messagebox.showerror(
        "Rollback Konnaxion/Koali",
        "Rollback refusé : certains fichiers ont changé depuis l'intégration :\n\n" + "\n".join(conflicts),
    )
    raise SystemExit(2)

for key in PATCHED:
    scope, rel = key.split(":", 1)
    src = BACKUP / scope / rel
    dst = roots[scope] / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)

messagebox.showinfo("Rollback Konnaxion/Koali", "Rollback terminé.")
