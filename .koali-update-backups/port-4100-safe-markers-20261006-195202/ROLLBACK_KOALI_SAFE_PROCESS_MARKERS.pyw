# -*- coding: utf-8 -*-
from pathlib import Path
import shutil, tkinter as tk
from tkinter import messagebox
TARGET = Path('C:\\mycode\\kOA-Linux\\koali-spaces\\launcher\\launcher-config.json')
BACKUP = Path('C:\\mycode\\kOA-Linux\\koali-spaces\\.koali-update-backups\\port-4100-safe-markers-20261006-195202\\launcher\\launcher-config.json')
app=tk.Tk(); app.withdraw()
shutil.copy2(BACKUP, TARGET)
messagebox.showinfo('Rollback', 'launcher-config.json restauré.')
