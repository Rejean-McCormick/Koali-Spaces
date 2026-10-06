# -*- coding: utf-8 -*-
from pathlib import Path
import hashlib, shutil, tkinter as tk
from tkinter import messagebox

ROOTS = {
    "koali": Path(r"C:\mycode\kOA-Linux\koali-spaces"),
    "orgo": Path(r"C:\mycode\Orgo\Orgo"),
    "worlds": Path(r"C:\mycode\Orgo\Orgo_Worlds"),
}
BACKUP = Path(r"C:\mycode\kOA-Linux\koali-spaces\.koali-update-backups\orgo-world-context-20261006-085449")
PATCHED = {'koali:config/ecosystem.catalog.json': 'c57a37aa494815069ff22a3f706258b06dfd851058342ab095ab5ee9bf5df228', 'koali:launcher/launcher-config.json': 'bd35246cb855ced928cdf412def48896ff8987756870d569e157776643815edc', 'koali:tests-runtime/ecosystem-linked-snapshot.test.mjs': 'ab79bb12c41a73dbf929e7e67ccb161d04d4750c33789c34c95c16c8cd2584b4', 'orgo:koali.integration.json': 'd642d750e119150dcc671726cf49f672e5b4eb4d91eba77427de9dc3880a64ea', 'orgo:apps/web/next.config.js': '7516843d513c626a7889e44931f9be59fdb103dab3d4a08b7ebbbf7f04eb31fd', 'orgo:apps/web/src/orgo/api.ts': '799aaee8e7e6fa4c654fa316d80b7b0750c8b565983fa8e363defa5a48b96460', 'orgo:apps/web/src/orgo/OrgoApp.tsx': 'b08baec7b957df811e86a8e61d68706a4e0636d261abe166d6f72cb037f9467a', 'orgo:apps/web/src/styles.css': '1d6b9ff2b69ee532d1a7d81fb50a36d5d7ccdf34ffab7fb4657477107c726c0e', 'orgo:apps/api/src/orgo/platform/contracts.ts': '36e4180e7d38523f240639c6e42e07237030bdbf5cce9a652e43944a713d6503', 'orgo:apps/api/src/orgo/adapters/inbound/http/boundary.ts': 'ddc07e481385737223175c60e74503f8453521600da9b6029d6498e9d35d56b8', 'orgo:apps/api/src/orgo/modules/interaction-kernel/interaction-kernel.service.ts': '019bd9f35497035b83efcb3e0b7e0d6ccbf6b35f84718075acfe7199d302c047', 'worlds:koali.integration.json': '8bc3e2f56468344b7d2eb0a10ac1ebc6329fe18649364bf82b29e931f76989ee', 'orgo:apps/web/src/orgo/WorldSelector.tsx': '6fa44a7f455ac5b85680af7409247d4a4b7677f8b23f987ccc4a08872f64bc55'}
CREATED = ['orgo:apps/web/src/orgo/WorldSelector.tsx']

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
    p = ROOTS[scope] / rel
    if not p.exists() or digest(p) != expected:
        conflicts.append(key)

if conflicts:
    messagebox.showerror(
        "Rollback Orgo Worlds",
        "Rollback refusé : certains fichiers ont été modifiés après le correctif :\n\n"
        + "\n".join(conflicts),
    )
    raise SystemExit(2)

for key in PATCHED:
    scope, rel = key.split(":", 1)
    target = ROOTS[scope] / rel
    if key in CREATED:
        if target.exists():
            target.unlink()
    else:
        src = BACKUP / scope / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, target)

messagebox.showinfo("Rollback Orgo Worlds", "Rollback terminé.")
